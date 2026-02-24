const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for Blood Bank System
 * Supports multiple roles: donor, patient, hospital, admin
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() {
      return this.role === 'donor' || this.role === 'patient';
    }
  },
  role: {
    type: String,
    enum: ['donor', 'patient', 'hospital', 'admin'],
    default: 'donor',
    required: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  // Donor specific fields
  lastDonationDate: {
    type: Date,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Hospital specific fields
  hospitalName: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if donor is eligible (90 days since last donation)
userSchema.methods.isEligibleToDonate = function() {
  if (!this.lastDonationDate) return true;
  
  const daysSinceLastDonation = Math.floor(
    (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastDonation >= 90;
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ bloodGroup: 1, city: 1, isAvailable: 1 });

module.exports = mongoose.model('User', userSchema);