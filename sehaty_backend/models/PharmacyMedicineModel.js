import mongoose from 'mongoose';

const pharmacyMedicineSchema = new mongoose.Schema(
  {
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
    stock: { type: Number, required: true, min: 0 },
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
    isAvailable: { type: Boolean, default: true },
    reorderLevel: { type: Number, required: true },
    lastRestocked: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

export default mongoose.model("PharmacyMedicine", pharmacyMedicineSchema);
