import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  uploadPrescription,
  getUserPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
  deletePrescription
} from '../controllers/prescriptionController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/prescriptions directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'prescriptions');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
  console.log('Created uploads/prescriptions directory:', uploadsDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// All routes are protected
router.use(protect);

// Get user's prescriptions
router.get('/my-prescriptions', getUserPrescriptions);

// Get specific prescription
router.get('/:id', getPrescriptionById);

// Upload new prescription
router.post('/upload', upload.single('image'), uploadPrescription);

// Update prescription status (admin/pharmacy only)
router.patch('/:id/status', updatePrescriptionStatus);

// Delete prescription
router.delete('/:id', deletePrescription);

export default router; 