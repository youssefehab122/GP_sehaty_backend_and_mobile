import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
        quantity: Number,
        price: Number,
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "payment_pending",
        "payment_failed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    totalPrice: Number,
    discount: Number,
    finalPrice: Number,
    paymentMethod: String,
    deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    trackingNumber: String,
    estimatedDeliveryDate: Date,
    deliveredAt: Date,
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    promoCode: { type: mongoose.Schema.Types.ObjectId, ref: "PromoCode" },
    orderNotes: String,
    cancellationReason: String,
    refundStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
    },
    refundAmount: Number,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    paymob: {
      transactionId: String,
      iframeId: String,
      token: String,
      paymentKey: String,
      integrationId: String,
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
