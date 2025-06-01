import mongoose from 'mongoose';

const dailyStatusSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'missed'],
    default: 'active'
  },
  isTaken: {
    type: Boolean,
    default: false
  }
});

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Medicine',
    required: false,
    set: function(v) {
      if (mongoose.Types.ObjectId.isValid(v)) {
        return v;
      }
      return null;
    }
  },
  product: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  time: {
    type: Date,
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  dosage: String,
  notes: String,
  notificationPreferences: {
    type: Map,
    of: Boolean,
    default: {
      email: true,
      push: true,
      sms: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'missed'],
    default: 'active'
  },
  isTaken: {
    type: Boolean,
    default: false
  },
  dailyStatuses: [dailyStatusSchema],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;