import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    name: String,
    genericName: String,
    barcode: { type: String, unique: true },
    image: String,
    description: String,
    concentration: String,
    manufacture: String,
    activeIngredient: String,
    medicineType: String,
    sideEffects: String,
    usageInstruction: String,
    expiryDate: Date,
    storageCondition: String,
    price: { 
      type: Number, 
      required: true,
      get: v => Number(v.toFixed(2)),
      set: v => Number(v.toFixed(2))
    },
    discount: { 
      type: Number, 
      default: 0,
      get: v => Number(v.toFixed(2)),
      set: v => Number(v.toFixed(2))
    },
    availableStock: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    prescriptionRequired: { type: Boolean, default: false },
    alternatives: [{ type: mongoose.Schema.Types.ObjectId, ref: "Medicine" }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

export default mongoose.model("Medicine", medicineSchema);
