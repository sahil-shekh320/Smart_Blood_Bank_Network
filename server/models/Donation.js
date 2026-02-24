const mongoose = require('mongoose');

/**
 * Donation Schema
 * Tracks blood donations from donors
 */
const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor ID is required']
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hospital ID is required']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    default: 1, // Usually 1 unit (450ml)
    min: [1, 'Quantity must be at least 1 unit']
  },
  donationDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Health information at time of donation
  hemoglobin: {
    type: Number,
    min: [0, 'Hemoglobin cannot be negative']
  },
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  pulse: {
    type: Number,
    min: [0, 'Pulse cannot be negative']
  },
  // Donation details
  donationType: {
    type: String,
    enum: ['whole_blood', 'plasma', 'platelets', 'double_red_cells'],
    default: 'whole_blood'
  },
  batchNumber: {
    type: String,
    trim: true
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected', 'cancelled'],
    default: 'completed'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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
donationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get donations by donor
donationSchema.statics.getByDonor = function(donorId) {
  return this.find({ donorId })
    .populate('hospitalId', 'name hospitalName city state')
    .sort({ donationDate: -1 });
};

// Static method to get donations by hospital
donationSchema.statics.getByHospital = function(hospitalId) {
  return this.find({ hospitalId })
    .populate('donorId', 'name email phone bloodGroup')
    .sort({ donationDate: -1 });
};

// Static method to get recent donations
donationSchema.statics.getRecent = function(limit = 10) {
  return this.find({ status: 'completed' })
    .populate('donorId', 'name bloodGroup')
    .populate('hospitalId', 'name hospitalName city')
    .sort({ donationDate: -1 })
    .limit(limit);
};

// Static method to get donation statistics
donationSchema.statics.getStatistics = async function(hospitalId = null) {
  const match = hospitalId ? { hospitalId, status: 'completed' } : { status: 'completed' };
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$bloodGroup',
        totalDonations: { $sum: 1 },
        totalUnits: { $sum: '$quantity' }
      }
    },
    { $sort: { totalDonations: -1 } }
  ]);
  
  return stats;
};

// Index for faster queries
donationSchema.index({ donorId: 1, donationDate: -1 });
donationSchema.index({ hospitalId: 1, donationDate: -1 });
donationSchema.index({ bloodGroup: 1 });
donationSchema.index({ donationDate: 1 });

module.exports = mongoose.model('Donation', donationSchema);