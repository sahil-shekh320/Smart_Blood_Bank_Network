const User = require('../models/User');
const Donation = require('../models/Donation');
const EmergencyRequest = require('../models/EmergencyRequest');
const BloodInventory = require('../models/BloodInventory');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
  if (req.query.city) filter.city = new RegExp(req.query.city, 'i');
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  // Search by name or email
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') }
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, bloodGroup, city, state, isActive, isAvailable } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (bloodGroup) updateData.bloodGroup = bloodGroup;
  if (city) updateData.city = city;
  if (state) updateData.state = state;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deleting admin users
  if (user.role === 'admin') {
    throw new AppError('Cannot delete admin users', 403);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * @desc    Get donors by blood group and location
 * @route   GET /api/users/donors/search
 * @access  Private
 */
const searchDonors = asyncHandler(async (req, res) => {
  const { bloodGroup, city, state, available } = req.query;

  const filter = { role: 'donor', isActive: true };
  
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (city) filter.city = new RegExp(city, 'i');
  if (state) filter.state = new RegExp(state, 'i');
  if (available !== undefined) filter.isAvailable = available === 'true';

  const donors = await User.find(filter)
    .select('name bloodGroup city state phone isAvailable lastDonationDate')
    .sort({ isAvailable: -1, lastDonationDate: 1 });

  // Add eligibility status
  const donorsWithEligibility = donors.map(donor => {
    const donorObj = donor.toObject();
    donorObj.isEligible = donor.isEligibleToDonate();
    return donorObj;
  });

  res.status(200).json({
    success: true,
    count: donors.length,
    data: donorsWithEligibility
  });
});

/**
 * @desc    Get all hospitals
 * @route   GET /api/users/hospitals
 * @access  Public
 */
const getHospitals = asyncHandler(async (req, res) => {
  const { city, state } = req.query;

  const filter = { role: 'hospital', isActive: true };
  if (city) filter.city = new RegExp(city, 'i');
  if (state) filter.state = new RegExp(state, 'i');

  const hospitals = await User.find(filter)
    .select('name hospitalName city state phone address registrationNumber')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: hospitals.length,
    data: hospitals
  });
});

/**
 * @desc    Get user statistics (Admin only)
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
  // Total users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Users by blood group
  const usersByBloodGroup = await User.aggregate([
    {
      $match: { bloodGroup: { $exists: true, $ne: null } }
    },
    {
      $group: {
        _id: '$bloodGroup',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Users by city
  const usersByCity = await User.aggregate([
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Available donors
  const availableDonors = await User.countDocuments({
    role: 'donor',
    isAvailable: true,
    isActive: true
  });

  // Recent registrations
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentRegistrations = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Total counts
  const totalUsers = await User.countDocuments();
  const totalDonors = await User.countDocuments({ role: 'donor' });
  const totalPatients = await User.countDocuments({ role: 'patient' });
  const totalHospitals = await User.countDocuments({ role: 'hospital' });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalDonors,
      totalPatients,
      totalHospitals,
      availableDonors,
      recentRegistrations,
      usersByRole,
      usersByBloodGroup,
      usersByCity
    }
  });
});

/**
 * @desc    Get donor dashboard data
 * @route   GET /api/users/donor/dashboard
 * @access  Private/Donor
 */
const getDonorDashboard = asyncHandler(async (req, res) => {
  const donor = await User.findById(req.user._id);
  
  // Get donation history
  const donations = await Donation.getByDonor(req.user._id);
  
  // Get nearby emergency requests matching donor's blood group
  const emergencyRequests = await EmergencyRequest.find({
    bloodGroup: donor.bloodGroup,
    status: 'pending',
    'location.city': donor.city
  }).sort({ urgencyLevel: 1, createdAt: 1 }).limit(5);

  // Check eligibility
  const isEligible = donor.isEligibleToDonate();
  const daysUntilEligible = isEligible ? 0 : 
    Math.ceil((90 * 24 * 60 * 60 * 1000 - (Date.now() - donor.lastDonationDate?.getTime())) / (1000 * 60 * 60 * 24));

  res.status(200).json({
    success: true,
    data: {
      profile: donor.getPublicProfile(),
      isEligible,
      daysUntilEligible,
      totalDonations: donations.length,
      recentDonations: donations.slice(0, 5),
      nearbyRequests: emergencyRequests
    }
  });
});

/**
 * @desc    Get patient dashboard data
 * @route   GET /api/users/patient/dashboard
 * @access  Private/Patient
 */
const getPatientDashboard = asyncHandler(async (req, res) => {
  const patient = await User.findById(req.user._id);
  
  // Get patient's emergency requests
  const requests = await EmergencyRequest.getByPatient(req.user._id);
  
  // Get available blood inventory for patient's blood group
  const availableBlood = await BloodInventory.find({
    bloodGroup: patient.bloodGroup,
    quantity: { $gt: 0 },
    expiryDate: { $gt: new Date() },
    isActive: true
  }).populate('hospitalId', 'name hospitalName city state phone');

  res.status(200).json({
    success: true,
    data: {
      profile: patient.getPublicProfile(),
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      recentRequests: requests.slice(0, 5),
      availableBlood: availableBlood.slice(0, 10)
    }
  });
});

/**
 * @desc    Get hospital dashboard data
 * @route   GET /api/users/hospital/dashboard
 * @access  Private/Hospital
 */
const getHospitalDashboard = asyncHandler(async (req, res) => {
  const hospital = await User.findById(req.user._id);
  
  // Get inventory stats
  const inventory = await BloodInventory.find({ hospitalId: req.user._id, isActive: true });
  const lowStock = await BloodInventory.getLowStock(req.user._id);
  const expired = await BloodInventory.getExpired(req.user._id);
  const expiringSoon = await BloodInventory.getExpiringSoon(req.user._id);
  
  // Get donations received
  const donations = await Donation.getByHospital(req.user._id);
  
  // Get emergency requests assigned to this hospital
  const requests = await EmergencyRequest.getByHospital(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      profile: hospital.getPublicProfile(),
      inventory: {
        total: inventory.length,
        lowStock: lowStock.length,
        expired: expired.length,
        expiringSoon: expiringSoon.length,
        items: inventory
      },
      donations: {
        total: donations.length,
        recent: donations.slice(0, 5)
      },
      requests: {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        recent: requests.slice(0, 5)
      }
    }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchDonors,
  getHospitals,
  getUserStats,
  getDonorDashboard,
  getPatientDashboard,
  getHospitalDashboard
};