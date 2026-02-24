const Donation = require('../models/Donation');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Record a new donation
 * @route   POST /api/donations
 * @access  Private/Hospital
 */
const createDonation = asyncHandler(async (req, res) => {
  const {
    donorId,
    bloodGroup,
    quantity,
    donationDate,
    hemoglobin,
    bloodPressure,
    weight,
    pulse,
    donationType,
    batchNumber,
    notes
  } = req.body;

  // Validate required fields
  if (!donorId || !bloodGroup) {
    throw new AppError('Donor ID and blood group are required', 400);
  }

  // Verify donor exists and is a donor
  const donor = await User.findOne({ _id: donorId, role: 'donor', isActive: true });
  if (!donor) {
    throw new AppError('Donor not found', 404);
  }

  // Check if donor is eligible
  if (!donor.isEligibleToDonate()) {
    throw new AppError('Donor is not eligible to donate. Must wait 90 days since last donation.', 400);
  }

  // Create donation record
  const donation = await Donation.create({
    donorId,
    hospitalId: req.user._id,
    bloodGroup,
    quantity: quantity || 1,
    donationDate: donationDate ? new Date(donationDate) : new Date(),
    hemoglobin,
    bloodPressure,
    weight,
    pulse,
    donationType: donationType || 'whole_blood',
    batchNumber,
    notes
  });

  // Update donor's last donation date
  donor.lastDonationDate = donation.donationDate;
  donor.isAvailable = false; // Set to unavailable until eligible again
  await donor.save();

  // Add to blood inventory
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 42); // Blood expires in 42 days

  await BloodInventory.create({
    hospitalId: req.user._id,
    bloodGroup,
    quantity: quantity || 1,
    expiryDate,
    batchNumber: batchNumber || `DON-${donation._id.toString().slice(-8).toUpperCase()}`,
    source: 'donation',
    notes: `From donation by ${donor.name}`
  });

  res.status(201).json({
    success: true,
    message: 'Donation recorded successfully',
    data: donation
  });
});

/**
 * @desc    Get all donations
 * @route   GET /api/donations
 * @access  Private
 */
const getAllDonations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter based on role
  const filter = {};
  
  if (req.user.role === 'donor') {
    filter.donorId = req.user._id;
  } else if (req.user.role === 'hospital') {
    filter.hospitalId = req.user._id;
  }
  // Admin can see all

  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
  if (req.query.status) filter.status = req.query.status;

  const donations = await Donation.find(filter)
    .populate('donorId', 'name email phone bloodGroup city')
    .populate('hospitalId', 'name hospitalName city state')
    .sort({ donationDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Donation.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: donations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get donation by ID
 * @route   GET /api/donations/:id
 * @access  Private
 */
const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate('donorId', 'name email phone bloodGroup city state')
    .populate('hospitalId', 'name hospitalName city state phone address');

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  // Check access
  const isDonor = donation.donorId._id.toString() === req.user._id.toString();
  const isHospital = donation.hospitalId._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isDonor && !isHospital && !isAdmin) {
    throw new AppError('Not authorized to view this donation', 403);
  }

  res.status(200).json({
    success: true,
    data: donation
  });
});

/**
 * @desc    Get donor's donation history
 * @route   GET /api/donations/my-donations
 * @access  Private/Donor
 */
const getMyDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.getByDonor(req.user._id);

  res.status(200).json({
    success: true,
    count: donations.length,
    data: donations
  });
});

/**
 * @desc    Get hospital's received donations
 * @route   GET /api/donations/hospital
 * @access  Private/Hospital
 */
const getHospitalDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.getByHospital(req.user._id);

  res.status(200).json({
    success: true,
    count: donations.length,
    data: donations
  });
});

/**
 * @desc    Update donation
 * @route   PUT /api/donations/:id
 * @access  Private/Hospital
 */
const updateDonation = asyncHandler(async (req, res) => {
  const { hemoglobin, bloodPressure, weight, pulse, notes, status, rejectionReason } = req.body;

  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  // Check ownership
  if (req.user.role !== 'admin' && donation.hospitalId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this donation', 403);
  }

  // Update fields
  if (hemoglobin !== undefined) donation.hemoglobin = hemoglobin;
  if (bloodPressure !== undefined) donation.bloodPressure = bloodPressure;
  if (weight !== undefined) donation.weight = weight;
  if (pulse !== undefined) donation.pulse = pulse;
  if (notes !== undefined) donation.notes = notes;
  if (status !== undefined) {
    donation.status = status;
    if (status === 'rejected' && rejectionReason) {
      donation.rejectionReason = rejectionReason;
    }
  }

  await donation.save();

  res.status(200).json({
    success: true,
    message: 'Donation updated successfully',
    data: donation
  });
});

/**
 * @desc    Get donation statistics
 * @route   GET /api/donations/stats
 * @access  Private
 */
const getDonationStats = asyncHandler(async (req, res) => {
  let stats;
  
  if (req.user.role === 'donor') {
    // Donor's personal stats
    const donations = await Donation.find({ donorId: req.user._id, status: 'completed' });
    
    stats = {
      totalDonations: donations.length,
      totalUnits: donations.reduce((sum, d) => sum + d.quantity, 0),
      lastDonation: donations.length > 0 ? donations[donations.length - 1].donationDate : null,
      donationsByType: await Donation.aggregate([
        { $match: { donorId: req.user._id, status: 'completed' } },
        { $group: { _id: '$donationType', count: { $sum: 1 } } }
      ])
    };
  } else if (req.user.role === 'hospital') {
    // Hospital stats
    stats = {
      byBloodGroup: await Donation.getStatistics(req.user._id),
      total: await Donation.countDocuments({ hospitalId: req.user._id, status: 'completed' }),
      thisMonth: await Donation.countDocuments({
        hospitalId: req.user._id,
        status: 'completed',
        donationDate: {
          $gte: new Date(new Date().setDate(1)),
          $lte: new Date()
        }
      })
    };
  } else {
    // Admin stats
    stats = {
      byBloodGroup: await Donation.getStatistics(),
      total: await Donation.countDocuments({ status: 'completed' }),
      thisMonth: await Donation.countDocuments({
        status: 'completed',
        donationDate: {
          $gte: new Date(new Date().setDate(1)),
          $lte: new Date()
        }
      }),
      recent: await Donation.getRecent(10)
    };
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Get recent donations
 * @route   GET /api/donations/recent
 * @access  Private
 */
const getRecentDonations = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const filter = {};
  if (req.user.role === 'donor') filter.donorId = req.user._id;
  if (req.user.role === 'hospital') filter.hospitalId = req.user._id;
  
  const donations = await Donation.find(filter)
    .populate('donorId', 'name bloodGroup city')
    .populate('hospitalId', 'name hospitalName city')
    .sort({ donationDate: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    count: donations.length,
    data: donations
  });
});

/**
 * @desc    Delete donation (Admin only)
 * @route   DELETE /api/donations/:id
 * @access  Private/Admin
 */
const deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  await donation.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Donation deleted successfully'
  });
});

module.exports = {
  createDonation,
  getAllDonations,
  getDonationById,
  getMyDonations,
  getHospitalDonations,
  updateDonation,
  getDonationStats,
  getRecentDonations,
  deleteDonation
};