import express from 'express';
import {
  handlePaymobCallback,
  handlePaymobResponse
} from '../controllers/PaymentController.js';

const router = express.Router();

// Paymob callbacks
router.post('/paymob/callback', handlePaymobCallback); // Transaction processed callback
router.get('/paymob/callback', handlePaymobResponse); // Transaction response callback

export default router; 