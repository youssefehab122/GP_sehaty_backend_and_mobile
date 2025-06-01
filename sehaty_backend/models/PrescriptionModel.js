import { Schema, model } from "mongoose";

const prescriptionSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicines: [{
      medicineId: {
        type: Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
      },
      dosage: {
        amount: Number,
        unit: String,
        frequency: String,
        duration: String
      },
      notes: String
    }],
    doctorName: {
      type: String,
      required: true
    },
    doctorSpecialty: {
      type: String,
      required: true
    },
    createDate: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true
    },
    title: {
      type: String,
      required: true,
    },
    prescriptionText: {
      type: String,
    },
    ocrText: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: String,
    image: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

export default model("Prescription", prescriptionSchema);
