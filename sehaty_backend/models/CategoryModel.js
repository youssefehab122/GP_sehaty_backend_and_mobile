import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: String,
  image: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
