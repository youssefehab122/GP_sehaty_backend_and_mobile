import Order from "../models/OrderModel.js";
import Cart from "../models/CartModel.js";
import PharmacyMedicine from "../models/PharmacyMedicineModel.js";
import Stock from "../models/StockModel.js";
import Delivery from "../models/DeliveryModel.js";
import PromoCode from "../models/PromoCodeModel.js";
import PaymobService from "../utils/paymob.service.js";
import {config} from '../config/config.js';
// Register webhook endpoint
export const registerPaymobWebhook = async (req, res) => {
  try {
    const result = await PaymobService.registerWebhook();
    res.json({
      success: true,
      message: "Webhook registered successfully",
      data: result
    });
  } catch (error) {
    console.error("Webhook registration failed:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// Verify Paymob payment status
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order || order.isDeleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If not Paymob payment or already paid
    if (order.paymentMethod !== "paymob" || order.isPaid) {
      return res.json({
        isPaid: order.isPaid,
        status: order.status,
      });
    }

    // If Paymob transaction ID exists, verify with Paymob
    if (order.paymob?.transactionId) {
      const paymentDetails = await PaymobService.verifyPayment(
        order.paymob.transactionId
      );

      if (paymentDetails.success) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymob.paymentStatus = "paid";
        order.status = "confirmed";
        await order.save();
      }
    }

    res.json({
      isPaid: order.isPaid,
      status: order.status,
      paymentStatus: order.paymob?.paymentStatus,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Create new order
export const createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, subtotal, deliveryFee, total } =
      req.body;

    // Validate items and calculate total
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      // Validate required fields
      if (!item.medicineId || !item.pharmacyId) {
        return res.status(400).json({
          message: "Invalid item data: missing medicineId or pharmacyId",
        });
      }

      const pharmacyMedicine = await PharmacyMedicine.findOne({
        medicineId: item.medicineId,
        pharmacyId: item.pharmacyId,
        isAvailable: true,
        isDeleted: false,
      });

      if (!pharmacyMedicine) {
        return res.status(400).json({
          message: `Medicine ${item.medicineId} is not available in pharmacy ${item.pharmacyId}`,
        });
      }

      if (pharmacyMedicine.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for medicine ${item.medicineId}`,
        });
      }

      orderItems.push({
        medicine: item.medicineId,
        pharmacyId: item.pharmacyId,
        quantity: item.quantity,
        price: item.price,
      });

      totalPrice += item.price * item.quantity;
    }

    // Validate totals
    if (Math.abs(totalPrice - subtotal) > 0.01) {
      return res.status(400).json({
        message: "Subtotal mismatch with calculated total",
      });
    }

    // Create order
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      subtotal: parseFloat(subtotal),
      deliveryFee: parseFloat(deliveryFee),
      total: parseFloat(total),
      paymentMethod,
      address,
      status: paymentMethod === "paymob" ? "payment_pending" : "pending",
      isPaid: paymentMethod !== "paymob", // Assuming other methods are paid immediately
    });

    await order.save();
    // Handle Paymob payment
    if (paymentMethod === "paymob") {
      try {
        const user = req.user;
        const billingData = {
          first_name: user.firstName || "Customer",
          last_name: user.lastName || "User",
          email: user.email,
          phone_number: user.phone || "+201000000000",
          country: "EG",
          city: address.city || "Cairo",
          street: address.street || "N/A",
          building: address.building || "N/A",
          floor: address.floor || "N/A",
          apartment: address.apartment || "N/A",
        };

        const amountCents = Math.round(total * 100);
        const returnUrl = `${config.app.deepLinkScheme}://payment-complete/${order._id}`;
        const { paymentUrl, paymobOrderId } = await PaymobService.getPaymentUrl(
          order._id,
          amountCents,
          billingData,
          returnUrl
        );

        // Update order with Paymob details
        order.paymob = {
          iframeId: PaymobService.iframeId,
          orderId: paymobOrderId,
          paymentStatus: "pending",
          callbackUrl: `${config.server.baseUrl}/api/payment/paymob/callback`,
          returnUrl: returnUrl
        };
        
        await order.save();

        return res.status(201).json({
          ...order.toObject(),
          paymentUrl,
          requiresPayment: true,
          deepLink: returnUrl
        });
      } catch (paymobError) {
        console.error("Paymob error:", paymobError);
        // If Paymob fails, mark order as failed
        order.status = "payment_failed";
        await order.save();

        return res.status(500).json({
          message: "Payment initiation failed",
          error: paymobError.message,
        });
      }
    }

    // Update stock
    for (const item of items) {
      const pharmacyMedicine = await PharmacyMedicine.findOne({
        medicineId: item.medicineId,
        pharmacyId: item.pharmacyId,
        isAvailable: true,
      });

      if (pharmacyMedicine) {
        pharmacyMedicine.stock -= item.quantity;
        await pharmacyMedicine.save();

        // Update stock record
        const stock = await Stock.findOne({
          pharmacyId: item.pharmacyId,
          medicineId: item.medicineId,
        });

        if (stock) {
          stock.quantity = pharmacyMedicine.stock;
          await stock.save();
        }
      }
    }

    // Create delivery record
    const delivery = new Delivery({
      orderId: order._id,
      status: "pending",
    });

    await delivery.save();

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [] } }
    );

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { userId: req.user._id, isDeleted: false };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("items.medicine")
      .populate("deliveryAddress")
      .populate("promoCode")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.medicine")
      .populate("deliveryAddress")
      .populate("promoCode");

    if (!order || order.isDeleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    // Get delivery status
    const delivery = await Delivery.findOne({ orderId: order._id });

    res.json({ order, delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order || order.isDeleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to update this order
    if (req.user.role !== "admin" && req.user.role !== "pharmacy_owner") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    order.status = status;
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Update delivery status
    const delivery = await Delivery.findOne({ orderId: order._id });
    if (delivery) {
      delivery.status = status === "delivered" ? "delivered" : "in_transit";
      if (status === "delivered") {
        delivery.actualDeliveryDate = new Date();
      }
      await delivery.save();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order || order.isDeleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to cancel this order
    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Check if order can be cancelled
    if (["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.status = "cancelled";
    order.cancellationReason = cancellationReason;
    await order.save();

    // Restore stock
    for (const item of order.items) {
      const pharmacyMedicine = await PharmacyMedicine.findOne({
        medicineId: item.medicineId,
        pharmacyId: item.pharmacyId,
        isAvailable: true,
      });

      if (pharmacyMedicine) {
        pharmacyMedicine.stock += item.quantity;
        await pharmacyMedicine.save();

        // Update stock record
        const stock = await Stock.findOne({
          pharmacyId: item.pharmacyId,
          medicineId: item.medicineId,
        });

        if (stock) {
          stock.quantity = pharmacyMedicine.stock;
          await stock.save();
        }
      }
    }

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
