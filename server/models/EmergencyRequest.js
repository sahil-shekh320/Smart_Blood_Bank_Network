const mongoose = require('mongoose');

/**
 * Emergency Request Schema
 * Handles urgent blood requests from patients
 */
const emergencyRequestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1 unit'],
    default: 1
  },
  urgencyLevel: {
    type: String,
    enum: ['critical', 'urgent', 'normal'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Location details
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Hospital assignment
  assignedHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  // Additional details
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  patientPhone: {
    type: String,
    required: [true, 'Patient phone is required']
  },
  hospital: {
    type: String,
    required: [true, 'Hospital name is required']
  },
  doctorName: {
    type: String,
    trim: true
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  // Admin/Hospital notes
  notes: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Timestamps
  requiredBy: {
    type: Date,
    required: [true, 'Required by date is required']
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
emergencyRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if request is overdue
emergencyRequestSchema.methods.isOverdue = function() {
  return this.status === 'pending' && new Date() > this.requiredBy;
};

// Method to get time remaining
emergencyRequestSchema.methods.getTimeRemaining = function() {
  if (this.status !== 'pending') return null;
  
  const remaining = this.requiredBy - Date.now();
  if (remaining < 0) return 'Overdue';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

// Static method to get pending requests
emergencyRequestSchema.statics.getPending = function() {
  return this.find({ status: 'pending' })
    .sort({ urgencyLevel: 1, createdAt: 1 });
};

// Static method to get requests by patient
emergencyRequestSchema.statics.getByPatient = function(patientId) {
  return this.find({ patientId })
    .sort({ createdAt: -1 });
};

// Static method to get requests by hospital
emergencyRequestSchema.statics.getByHospital = function(hospitalId) {
  return this.find({ assignedHospital: hospitalId })
    .sort({ createdAt: -1 });
};

// Static method to get critical requests
emergencyRequestSchema.statics.getCritical = function() {
  return this.find({ 
    status: 'pending', 
    urgencyLevel: 'critical' 
  }).sort({ createdAt: 1 });
};

// Index for faster queries
emergencyRequestSchema.index({ patientId: 1 });
emergencyRequestSchema.index({ assignedHospital: 1 });
emergencyRequestSchema.index({ status: 1, urgencyLevel: 1 });
emergencyRequestSchema.index({ bloodGroup: 1, 'location.city': 1 });
emergencyRequestSchema.index({ createdAt: 1 });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);