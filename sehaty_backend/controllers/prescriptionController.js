import Prescription from '../models/PrescriptionModel.js';
import Reminder from '../models/Reminder.js';
import Medicine from '../models/MedicineModel.js';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';

export const uploadPrescription = async (req, res) => {
  try {
    const { title, prescriptionText, medicines, doctorName, doctorSpecialty, validUntil } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('Received file:', {
      filename: image.filename,
      path: image.path,
      mimetype: image.mimetype,
      size: image.size
    });

    let ocrText = '';
    try {
      // Preprocess image: grayscale, normalize, increase contrast
      const preprocessedPath = image.path.replace(/(\.[^.]+)$/, '_preprocessed$1');
      await sharp(image.path)
        .grayscale()
        .normalize()
        .sharpen()
        .toFile(preprocessedPath);

      // Run Tesseract OCR with improved options
      const ocrResult = await Tesseract.recognize(
        preprocessedPath,
        'eng+ara',
        {
          logger: m => console.log(m),
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:-/() \,\u0621-\u064A', // include Arabic unicode range
          preserve_interword_spaces: 1,
        }
      );
      ocrText = ocrResult.data.text;
      // Post-process: remove extra newlines, trim
      ocrText = ocrText.replace(/\n{2,}/g, '\n').trim();
      console.log('OCR Output:', ocrText);
    } catch (ocrError) {
      console.error('OCR error:', ocrError);
      ocrText = '';
    }

    let parsedMedicines = [];
    if (medicines) {
      try {
        parsedMedicines = typeof medicines === 'string' ? JSON.parse(medicines) : medicines;
      } catch (error) {
        console.error('Error parsing medicines:', error);
        return res.status(400).json({ message: 'Invalid medicines format' });
      }
    }

    const prescription = new Prescription({
      patientId: req.user._id,
      medicines: parsedMedicines,
      doctorName,
      doctorSpecialty,
      title,
      prescriptionText,
      validUntil,
      ocrText,
      image: {
        secure_url: `/uploads/prescriptions/${image.filename}`,
        public_id: image.filename
      }
    });

    await prescription.save();

    if (parsedMedicines && parsedMedicines.length > 0) {
      for (const medicine of parsedMedicines) {
        if (medicine.medicineId) {
          const reminder = new Reminder({
            prescriptionId: prescription._id,
            medicineId: medicine.medicineId,
            startDate: new Date(),
            endDate: validUntil,
            frequency: medicine.dosage?.frequency || 'once',
            status: 'active',
            dosage: medicine.dosage,
            notes: medicine.notes
          });
          await reminder.save();
        }
      }
    }

    res.status(201).json({
      message: 'Prescription uploaded successfully',
      prescription
    });
  } catch (error) {
    console.error('Error uploading prescription:', {
      error: error.message,
      stack: error.stack,
      file: error.file,
      code: error.code
    });
    
    res.status(500).json({ 
      message: error.message,
      error: {
        stack: error.stack,
        path: req.path,
        method: req.method,
        code: error.code
      }
    });
  }
};

export const getUserPrescriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { 
      patientId: req.user._id,
      isDeleted: false 
    };
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'medicines.medicineId',
        select: 'name genericName image'
      })
      .select('doctorName doctorSpecialty image title createDate validUntil status')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createDate: -1 });

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPrescriptions: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'medicines.medicineId',
        select: 'name genericName image description concentration'
      })
      .populate('patientId', 'name email phone');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.patientId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this prescription' });
    }

    const reminders = await Reminder.find({
      prescriptionId: prescription._id,
      isDeleted: false
    }).populate('medicineId');

    res.json({ prescription, reminders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'pharmacy_owner') {
      return res.status(403).json({ message: 'Not authorized to update this prescription' });
    }

    prescription.status = status;
    if (status === 'rejected') {
      prescription.rejectionReason = rejectionReason;
    }

    await prescription.save();

    if (status === 'approved') {
      await Reminder.updateMany(
        { prescriptionId: prescription._id },
        { status: 'active' }
      );
    } else if (status === 'rejected') {
      await Reminder.updateMany(
        { prescriptionId: prescription._id },
        { status: 'missed' }
      );
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }


    if (prescription.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this prescription' });
    }


    prescription.isDeleted = true;
    prescription.deletedAt = new Date();
    await prescription.save();

    await Reminder.updateMany(
      { prescriptionId: prescription._id },
      { 
        isDeleted: true,
        deletedAt: new Date()
      }
    );

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 