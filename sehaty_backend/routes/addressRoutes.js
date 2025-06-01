import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/addressController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all addresses for the current user
router.get('/', getUserAddresses);

// Add a new address
router.post('/', addAddress);

// Update an address
router.put('/:id', updateAddress);

// Delete an address
router.delete('/:id', deleteAddress);

// Set default address (support both PUT and PATCH)
router.put('/:id/default', setDefaultAddress);
router.patch('/:id/default', setDefaultAddress);

export default router; 