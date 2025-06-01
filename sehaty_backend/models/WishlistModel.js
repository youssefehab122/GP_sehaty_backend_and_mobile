import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  }
}, { 
  timestamps: true 
});

// Compound index to ensure unique medicine per user
wishlistSchema.index({ userId: 1, medicineId: 1 }, { 
  unique: true,
  partialFilterExpression: { isDeleted: false }
});

export default mongoose.model("Wishlist", wishlistSchema);
