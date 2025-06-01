import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
  
    },
    ownerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: false 
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function(coords) {
            return Array.isArray(coords) && 
                   coords.length === 2 && 
                   !isNaN(coords[0]) && !isNaN(coords[1]) &&
                   coords[0] >= -180 && coords[0] <= 180 && 
                   coords[1] >= -90 && coords[1] <= 90;
          },
          message: 'Invalid coordinates format: [longitude, latitude]'
        }
      }
    },
    workingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    deliveryOptions: [{
      type: String,
      enum: ["delivery", "pickup"],
    }],
    deliveryRadius: {
      type: Number,
      min: 0
    },
    paymentMethods: [{
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PaymentMethod" 
    }],
    rating: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5 
    },
    totalReviews: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
    deletedAt: Date,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals for backward compatibility
pharmacySchema.virtual('latitude').get(function() {
  return this.location?.coordinates?.[1] || null;
});

pharmacySchema.virtual('longitude').get(function() {
  return this.location?.coordinates?.[0] || null;
});

// Safe getter method for coordinates
pharmacySchema.methods.getCoordinates = function() {
  return {
    longitude: this.location?.coordinates?.[0] || null,
    latitude: this.location?.coordinates?.[1] || null
  };
};

// Create geospatial index
pharmacySchema.index({ location: '2dsphere' });
pharmacySchema.index({ name: 'text', address: 'text' }); // For text search

// Query helper for nearby pharmacies
pharmacySchema.query.nearby = function(coords, maxDistance = 5000) {
  if (!Array.isArray(coords)) {
    throw new Error('Coordinates must be an array [longitude, latitude]');
  }
  
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coords
        },
        $maxDistance: maxDistance // in meters
      }
    },
    isDeleted: false
  });
};

// Static method for finding pharmacies within delivery radius
pharmacySchema.statics.findWithinDeliveryRadius = async function(point, maxDistance) {
  return this.find({
    location: {
      $geoWithin: {
        $centerSphere: [point, maxDistance / 6378.1] // Convert km to radians
      }
    },
    isDeleted: false
  });
};

// Middleware to validate coordinates before save
pharmacySchema.pre('save', function(next) {
  if (this.location?.coordinates) {
    if (this.location.coordinates.some(isNaN)) {
      throw new Error('Coordinates must be numbers');
    }
  }
  next();
});

export default mongoose.model("Pharmacy", pharmacySchema);