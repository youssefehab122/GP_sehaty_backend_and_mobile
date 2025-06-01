import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const passwordHistorySchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: { type: String, required: false },
    role: {
      type: String,
      enum: ["user", "admin", "pharmacy_owner"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    lastLogout: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    reminders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reminder",
      },
    ],
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    wishlists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wishlist",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    favoritePharmacies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pharmacy",
      },
    ],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    passwordHistory: [passwordHistorySchema],
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    passwordExpiryDate: {
      type: Date,
      default: () => new Date(+new Date() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
    firebase_token: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Add to password history
    this.passwordHistory.push({
      password: this.password,
    });

    // Keep only last 5 passwords
    if (this.passwordHistory.length > 5) {
      this.passwordHistory.shift();
    }

    // Update last password change
    this.lastPasswordChange = new Date();
    this.passwordExpiryDate = new Date(+new Date() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password is expired
userSchema.methods.isPasswordExpired = function () {
  return new Date() > this.passwordExpiryDate;
};

// Method to check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > new Date();
};

// Method to increment failed login attempts
userSchema.methods.incrementFailedLoginAttempts = async function () {
  this.failedLoginAttempts += 1;

  // Lock account after 5 failed attempts
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(+new Date() + 30 * 60 * 1000); // Lock for 30 minutes
  }

  await this.save();
};

// Method to reset failed login attempts
userSchema.methods.resetFailedLoginAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

// Method to check if password was used before
userSchema.methods.wasPasswordUsed = async function (newPassword) {
  for (const history of this.passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, history.password);
    if (isMatch) return true;
  }
  return false;
};

export default mongoose.model("User", userSchema);
