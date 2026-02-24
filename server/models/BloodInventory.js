const mongoose = require('mongoose');

/**
 * Blood Inventory Schema
 * Tracks blood stock for hospitals/blood banks
 */
const bloodInventorySchema = new mongoose.Schema({
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
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    default: 'units',
    enum: ['units', 'ml']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  collectionDate: {
    type: Date,
    default: Date.now
  },
  batchNumber: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['donation', 'purchase', 'transfer'],
    default: 'donation'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
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
bloodInventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if blood is expired
bloodInventorySchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Method to check if blood is expiring soon (within 7 days)
bloodInventorySchema.methods.isExpiringSoon = function() {
  const daysUntilExpiry = Math.ceil(
    (this.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

// Method to get days until expiry
bloodInventorySchema.methods.getDaysUntilExpiry = function() {
  return Math.ceil(
    (this.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
  );
};

// Static method to get low stock items (less than 5 units)
bloodInventorySchema.statics.getLowStock = function(hospitalId) {
  return this.find({
    hospitalId,
    quantity: { $lt: 5 },
    isActive: true
  });
};

// Static method to get expired items
bloodInventorySchema.statics.getExpired = function(hospitalId) {
  return this.find({
    hospitalId,
    expiryDate: { $lt: new Date() },
    isActive: true
  });
};

// Static method to get expiring soon items
bloodInventorySchema.statics.getExpiringSoon = function(hospitalId) {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return this.find({
    hospitalId,
    expiryDate: { $lte: sevenDaysFromNow, $gt: new Date() },
    isActive: true
  });
};

// Index for faster queries
bloodInventorySchema.index({ hospitalId: 1, bloodGroup: 1 });
bloodInventorySchema.index({ expiryDate: 1 });
bloodInventorySchema.index({ bloodGroup: 1, quantity: 1 });

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);