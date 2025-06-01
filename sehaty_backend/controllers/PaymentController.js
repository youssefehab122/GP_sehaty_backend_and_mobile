import Order from "../models/OrderModel.js";
import Cart from "../models/CartModel.js";
import PharmacyMedicine from "../models/PharmacyMedicineModel.js";
import Stock from "../models/StockModel.js";
import Delivery from "../models/DeliveryModel.js";
import PromoCode from "../models/PromoCodeModel.js";
import PaymobService from "../utils/paymob.service.js";
import {config} from '../config/config.js';

// Handle transaction processed callback (POST)
export const handlePaymobCallback = async (req, res) => {
  try {
    console.log("Received Paymob transaction processed callback:", req.body);
    
    const result = await PaymobService.processCallback(req.body);
    
    if (result.success) {
      const order = await Order.findById(result.orderId);
      
      // Update order status
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymob = {
        ...order.paymob,
        transactionId: result.transactionId,
        paymentStatus: "paid"
      };
      order.status = "confirmed";
      
      await order.save();
      
      // Update stock
      for (const item of order.items) {
        await PharmacyMedicine.findOneAndUpdate(
          { medicineId: item.medicine, pharmacyId: item.pharmacyId },
          { $inc: { stock: -item.quantity } }
        );
      }
      
      // Create delivery record
      await Delivery.create({
        orderId: order._id,
        status: "pending"
      });
      
      // Clear cart
      await Cart.findOneAndUpdate(
        { userId: order.userId },
        { $set: { items: [] } }
      );
      
      console.log(`Order ${order._id} payment completed successfully`);
      res.status(200).send("Callback processed successfully");
    } else {
      res.status(400).send("Payment failed");
    }
  } catch (error) {
    console.error("Callback processing failed:", error);
    res.status(400).send("Error processing callback");
  }
};

// Handle transaction response callback (GET)
export const handlePaymobResponse = async (req, res) => {
  try {
    console.log("Received Paymob transaction response:", req.query);
    
    const { merchant_order_id, success, hmac } = req.query;
    
    if (!merchant_order_id) {
      throw new Error("No order ID provided");
    }

    // Validate HMAC if provided
    if (hmac) {
      const isValid = await PaymobService.validateRedirectionHMAC(hmac, req.query);
      if (!isValid) {
        console.error("HMAC validation failed for redirection callback");
        // Continue with redirect even if HMAC validation fails
      }
    }

    const order = await Order.findById(merchant_order_id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if payment was successful
    if (success === 'true') {
      // Update order status if not already updated
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymob = {
          ...order.paymob,
          transactionId: req.query.id,
          paymentStatus: "paid"
        };
        order.status = "confirmed";
        await order.save();

        // Update stock
        for (const item of order.items) {
          await PharmacyMedicine.findOneAndUpdate(
            { medicineId: item.medicine, pharmacyId: item.pharmacyId },
            { $inc: { stock: -item.quantity } }
          );
        }

        // Create delivery record
        await Delivery.create({
          orderId: order._id,
          status: "pending"
        });

        // Clear cart
        await Cart.findOneAndUpdate(
          { userId: order.userId },
          { $set: { items: [] } }
        );
      }
    }

    // Redirect to the app using the stored return URL
    if (order.paymob?.returnUrl) {
      return res.redirect(order.paymob.returnUrl);
    }

    // Fallback redirect
    res.redirect(`${config.app.deepLinkScheme}://payment-complete/${merchant_order_id}`);
  } catch (error) {
    console.error("Response handling failed:", error);
    // Even on error, try to redirect back to app
    if (req.query?.merchant_order_id) {
      res.redirect(`${config.app.deepLinkScheme}://payment-complete/${req.query.merchant_order_id}`);
    } else {
      res.status(400).send("Error processing response");
    }
  }
};