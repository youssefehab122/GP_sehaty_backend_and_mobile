import { Schema, model } from "mongoose";

const addressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    zipCode: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  { timestamps: true }
);

// Add compound indexes
addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ userId: 1, address: 1 }, { unique: true });

// Add pre-save middleware to handle duplicate key errors
addressSchema.pre('save', async function(next) {
  try {
    // Check if this is a new address
    if (this.isNew) {
      // Check for existing address with same userId and address
      const existingAddress = await this.constructor.findOne({
        userId: this.userId,
        address: this.address,
        isDeleted: false
      });

      if (existingAddress) {
        throw new Error('Address already exists for this user');
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default model("Address", addressSchema);