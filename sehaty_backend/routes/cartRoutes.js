import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get cart
router.get('/', getCart);

// Add item to cart
router.post('/items', addToCart);

// Update cart item
router.put('/items/:id', updateCartItem);

// Remove item from cart
router.delete('/items/:medicineId/:pharmacyId', removeFromCart);

// Clear cart
router.delete('/', clearCart);

export default router; 