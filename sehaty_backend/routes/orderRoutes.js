import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  registerPaymobWebhook,
  // handlePaymobCallback
} from '../controllers/orderController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Create a new order
router.post('/', createOrder);

// Get all orders for the current user
router.get('/', getUserOrders);

// Get a specific order
router.get('/:id', getOrderById);

// Update order status (admin/pharmacy only)
router.patch('/:id/status', updateOrderStatus);

// Cancel an order
router.delete('/:id', cancelOrder);

router.post('/paymob/webhook/register', registerPaymobWebhook);
// router.post('/paymob/callback', handlePaymobCallback);

export default router; 