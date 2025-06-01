import Pharmacy from '../models/PharmacyModel.js';
import Medicine from '../models/MedicineModel.js';
import Address from '../models/AddressModel.js';
import PharmacyMedicine from '../models/PharmacyMedicineModel.js';

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in kilometers
};

export const getPharmacies = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const city = req.query.city;
    const rating = req.query.rating;

    const query = { isDeleted: false, isVerified: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (rating) query.rating = { $gte: parseFloat(rating) };

    const defaultAddress = await Address.findOne({
      userId,
      isDefault: true,
      isDeleted: false
    });

    const allPharmacies = await Pharmacy.find(query);

    let pharmacyWithDistance = allPharmacies.map(pharmacy => {
      let distance = 0;

      if (defaultAddress) {
        distance = haversineDistance(
          defaultAddress.latitude,
          defaultAddress.longitude,
          pharmacy.location.coordinates[1], 
          pharmacy.location.coordinates[0] 
        );
      }

      return {
        ...pharmacy.toObject(),
        distance: parseFloat(distance.toFixed(2))
      };
    });

    pharmacyWithDistance.sort((a, b) => {
      if (defaultAddress) {
        return a.distance - b.distance;
      }
      return b.rating - a.rating; 
    });

    const total = pharmacyWithDistance.length;
    const paginatedPharmacies = pharmacyWithDistance.slice(
      (page - 1) * limit,
      page * limit
    );

    res.json({
      pharmacies: paginatedPharmacies,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPharmacies: total
    });

  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('medicines');

    if (!pharmacy || pharmacy.isDeleted) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPharmacy = async (req, res) => {
  try {
    const pharmacy = new Pharmacy({
      ...req.body,
      owner: req.user._id
    });

    await pharmacy.save();

    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePharmacy = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'name', 'description', 'address', 'phone', 'email',
      'openingHours', 'closingHours', 'isOpen', 'isVerified'
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy || pharmacy.isDeleted) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this pharmacy' });
    }

    updates.forEach(update => pharmacy[update] = req.body[update]);
    await pharmacy.save();

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy || pharmacy.isDeleted) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this pharmacy' });
    }

    pharmacy.isDeleted = true;
    pharmacy.deletedAt = new Date();
    await pharmacy.save();

    res.json({ message: 'Pharmacy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMedicine = async (req, res) => {
  try {
    const { medicineId, price, stock } = req.body;
    const pharmacyId = req.params.id;

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy || pharmacy.isDeleted) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add medicine' });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine || medicine.isDeleted) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const pharmacyMedicine = new PharmacyMedicine({
      pharmacyId,
      medicineId,
      price,
      stock,
      isAvailable: true
    });

    await pharmacyMedicine.save();

    pharmacy.medicines.push(medicineId);
    await pharmacy.save();

    res.status(201).json(pharmacyMedicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const { price, stock, isAvailable } = req.body;
    const { id: pharmacyId, medicineId } = req.params;

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy || pharmacy.isDeleted) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update medicine' });
    }

    const pharmacyMedicine = await PharmacyMedicine.findOne({
      pharmacyId,
      medicineId,
      isDeleted: false
    });

    if (!pharmacyMedicine) {
      return res.status(404).json({ message: 'Medicine not found in pharmacy' });
    }

    if (price) pharmacyMedicine.price = price;
    if (stock !== undefined) pharmacyMedicine.stock = stock;
    if (isAvailable !== undefined) pharmacyMedicine.isAvailable = isAvailable;

    await pharmacyMedicine.save();

    res.json(pharmacyMedicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMedicine = async (req, res) => {
  try {
    const { id: pharmacyId, medicineId } = req.params;

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy || pharmacy.isDeleted) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to remove medicine' });
    }

    const pharmacyMedicine = await PharmacyMedicine.findOne({
      pharmacyId,
      medicineId,
      isDeleted: false
    });

    if (!pharmacyMedicine) {
      return res.status(404).json({ message: 'Medicine not found in pharmacy' });
    }

    pharmacyMedicine.isDeleted = true;
    pharmacyMedicine.deletedAt = new Date();
    await pharmacyMedicine.save();

    pharmacy.medicines = pharmacy.medicines.filter(
      id => id.toString() !== medicineId
    );
    await pharmacy.save();

    res.json({ message: 'Medicine removed from pharmacy successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getPharmacyMedicines = async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const category = req.query.category;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    console.log('Getting medicines for pharmacy:', pharmacyId);

    const pharmacyMedicines = await PharmacyMedicine.find({
      pharmacyId,
      isAvailable: true,
      isDeleted: false
    })
      .populate({
        path: 'medicineId',
        match: { isDeleted: false },
        populate: { path: 'categoryId' }
      })
      .sort({ createdAt: -1 });

    console.log('Found pharmacy medicines:', pharmacyMedicines.map(pm => ({
      medicineId: pm.medicineId?._id,
      pharmacyId: pm.pharmacyId,
      price: pm.price,
      stock: pm.stock,
      isAvailable: pm.isAvailable
    })));

    let medicines = pharmacyMedicines
      .filter(pm => pm.medicineId)
      .map(pm => ({
        ...pm.medicineId.toObject(),
        price: pm.price,
        stock: pm.stock,
        discount: pm.discount,
        isAvailable: pm.isAvailable
      }));

    console.log('Processed medicines:', medicines.map(m => ({
      id: m._id,
      name: m.name,
      price: m.price,
      stock: m.stock
    })));

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      medicines = medicines.filter(
        medicine => 
          medicine.name.match(searchRegex) || 
          medicine.description.match(searchRegex)
      );
    }

    if (category) {
      medicines = medicines.filter(
        medicine => medicine.categoryId._id.toString() === category
      );
    }

    if (minPrice || maxPrice) {
      medicines = medicines.filter(medicine => {
        const price = medicine.price;
        if (minPrice && maxPrice) {
          return price >= minPrice && price <= maxPrice;
        } else if (minPrice) {
          return price >= minPrice;
        } else if (maxPrice) {
          return price <= maxPrice;
        }
        return true;
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedMedicines = medicines.slice(startIndex, endIndex);

    console.log('Sending response with medicines:', paginatedMedicines.map(m => ({
      id: m._id,
      name: m.name,
      price: m.price,
      stock: m.stock
    })));

    res.json({
      medicines: paginatedMedicines,
      currentPage: page,
      totalPages: Math.ceil(medicines.length / limit),
      totalMedicines: medicines.length
    });
  } catch (error) {
    console.error('Get pharmacy medicines error:', error);
    res.status(500).json({ message: error.message });
  }
}; 