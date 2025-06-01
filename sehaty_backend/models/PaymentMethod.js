import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["cash", "card", "paypal", "wallet", "bank", "other"],
    lowercase: true,
  },
  description: String,
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

export default mongoose.model("PaymentMethod", paymentMethodSchema);
