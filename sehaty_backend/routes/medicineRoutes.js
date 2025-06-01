import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  addReview,
  addSampleMedicines,
  getMedicineAlternatives
} from '../controllers/medicineController.js';

const router = express.Router();

// Public routes
router.get('/', getMedicines);
router.get('/search', searchMedicines);
router.get('/:id', getMedicineById);
router.get('/:id/alternatives', getMedicineAlternatives);

// Protected routes
router.use(protect);

// Create medicine (admin/pharmacy only)
router.post('/', createMedicine);

// Update medicine (admin/pharmacy only)
router.put('/:id', updateMedicine);

// Delete medicine (admin/pharmacy only)
router.delete('/:id', deleteMedicine);

// Admin routes
router.post('/sample', addSampleMedicines);

// User routes
router.post('/:id/reviews', addReview);

export default router; 