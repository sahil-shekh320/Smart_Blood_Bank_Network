const EmergencyRequest = require('../models/EmergencyRequest');
const BloodInventory = require('../models/BloodInventory');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Create emergency request
 * @route   POST /api/requests
 * @access  Private/Patient
 */
const createRequest = asyncHandler(async (req, res) => {
  const {
    bloodGroup,
    quantity,
    urgencyLevel,
    location,
    patientName,
    patientPhone,
    hospital,
    doctorName,
    reason,
    requiredBy
  } = req.body;

  // Validate required fields
  if (!bloodGroup || !location || !patientName || !patientPhone || !hospital || !requiredBy) {
    throw new AppError('Missing required fields', 400);
  }

  // Create request
  const request = await EmergencyRequest.create({
    patientId: req.user._id,
    bloodGroup,
    quantity: quantity || 1,
    urgencyLevel: urgencyLevel || 'normal',
    location: {
      address: location.address,
      city: location.city,
      state: location.state,
      coordinates: location.coordinates
    },
    patientName,
    patientPhone,
    hospital,
    doctorName,
    reason,
    requiredBy: new Date(requiredBy)
  });

  // Find matching hospitals with available blood
  const matchingHospitals = await BloodInventory.find({
    bloodGroup,
    quantity: { $gte: quantity || 1 },
    expiryDate: { $gt: new Date() },
    isActive: true
  })
    .populate('hospitalId', 'name hospitalName city state phone email')
    .sort({ quantity: -1 });

  // Simulate notification to matching donors
  const matchingDonors = await User.find({
    role: 'donor',
    bloodGroup,
    city: location.city,
    isAvailable: true,
    isActive: true
  }).select('name email phone');

  res.status(201).json({
    success: true,
    message: 'Emergency request created successfully',
    data: {
      request,
      matchingHospitals: matchingHospitals.map(h => ({
        hospital: h.hospitalId,
        availableQuantity: h.quantity
      })),
      matchingDonorsCount: matchingDonors.length
    }
  });
});

/**
 * @desc    Get all requests (Admin/Hospital)
 * @route   GET /api/requests
 * @access  Private/Admin/Hospital
 */
const getAllRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  
  // Hospital can only see their assigned requests
  if (req.user.role === 'hospital') {
    filter.$or = [
      { assignedHospital: req.user._id },
      { status: 'pending' } // Can see pending requests to accept
    ];
  }
  
  if (req.query.status) filter.status = req.query.status;
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
  if (req.query.urgencyLevel) filter.urgencyLevel = req.query.urgencyLevel;
  if (req.query.city) filter['location.city'] = new RegExp(req.query.city, 'i');

  const requests = await EmergencyRequest.find(filter)
    .populate('patientId', 'name email phone bloodGroup')
    .populate('assignedHospital', 'name hospitalName city state phone')
    .sort({ urgencyLevel: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await EmergencyRequest.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: requests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get request by ID
 * @route   GET /api/requests/:id
 * @access  Private
 */
const getRequestById = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id)
    .populate('patientId', 'name email phone bloodGroup city state')
    .populate('assignedHospital', 'name hospitalName city state phone address');

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  // Check access
  const isOwner = request.patientId._id.toString() === req.user._id.toString();
  const isAssignedHospital = request.assignedHospital?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isHospital = req.user.role === 'hospital';

  if (!isOwner && !isAssignedHospital && !isAdmin && !isHospital) {
    throw new AppError('Not authorized to view this request', 403);
  }

  res.status(200).json({
    success: true,
    data: request
  });
});

/**
 * @desc    Get patient's requests
 * @route   GET /api/requests/my-requests
 * @access  Private/Patient
 */
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await EmergencyRequest.find({ patientId: req.user._id })
    .populate('assignedHospital', 'name hospitalName city state phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

/**
 * @desc    Update request status (Hospital/Admin)
 * @route   PUT /api/requests/:id/status
 * @access  Private/Hospital/Admin
 */
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, notes, rejectionReason } = req.body;

  if (!['approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  // Check if hospital can update this request
  if (req.user.role === 'hospital') {
    // Hospital must be assigned or accepting a pending request
    if (request.assignedHospital && request.assignedHospital.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to update this request', 403);
    }
  }

  // Update status
  request.status = status;
  
  if (status === 'approved') {
    request.assignedHospital = req.user._id;
    request.assignedAt = new Date();
  }
  
  if (status === 'rejected' && rejectionReason) {
    request.rejectionReason = rejectionReason;
  }
  
  if (status === 'completed') {
    request.completedAt = new Date();
  }
  
  if (notes) request.notes = notes;

  await request.save();

  // If approved, reduce inventory
  if (status === 'approved') {
    const inventory = await BloodInventory.findOne({
      hospitalId: req.user._id,
      bloodGroup: request.bloodGroup,
      quantity: { $gte: request.quantity },
      expiryDate: { $gt: new Date() },
      isActive: true
    }).sort({ expiryDate: 1 });

    if (inventory) {
      inventory.quantity -= request.quantity;
      await inventory.save();
    }
  }

  res.status(200).json({
    success: true,
    message: `Request ${status} successfully`,
    data: request
  });
});

/**
 * @desc    Assign request to hospital (Admin)
 * @route   PUT /api/requests/:id/assign
 * @access  Private/Admin
 */
const assignRequest = asyncHandler(async (req, res) => {
  const { hospitalId } = req.body;

  if (!hospitalId) {
    throw new AppError('Hospital ID is required', 400);
  }

  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  const hospital = await User.findOne({ _id: hospitalId, role: 'hospital', isActive: true });
  if (!hospital) {
    throw new AppError('Hospital not found', 404);
  }

  request.assignedHospital = hospitalId;
  request.assignedAt = new Date();
  await request.save();

  res.status(200).json({
    success: true,
    message: 'Request assigned successfully',
    data: request
  });
});

/**
 * @desc    Cancel request (Patient)
 * @route   PUT /api/requests/:id/cancel
 * @access  Private/Patient
 */
const cancelRequest = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  // Check ownership
  if (request.patientId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to cancel this request', 403);
  }

  // Can only cancel pending requests
  if (request.status !== 'pending') {
    throw new AppError('Can only cancel pending requests', 400);
  }

  request.status = 'cancelled';
  await request.save();

  res.status(200).json({
    success: true,
    message: 'Request cancelled successfully',
    data: request
  });
});

/**
 * @desc    Get critical requests
 * @route   GET /api/requests/critical
 * @access  Private/Hospital/Admin
 */
const getCriticalRequests = asyncHandler(async (req, res) => {
  const requests = await EmergencyRequest.find({
    status: 'pending',
    urgencyLevel: 'critical'
  })
    .populate('patientId', 'name email phone bloodGroup')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

/**
 * @desc    Get request statistics
 * @route   GET /api/requests/stats
 * @access  Private/Admin
 */
const getRequestStats = asyncHandler(async (req, res) => {
  // Requests by status
  const byStatus = await EmergencyRequest.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Requests by blood group
  const byBloodGroup = await EmergencyRequest.aggregate([
    {
      $group: {
        _id: '$bloodGroup',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Requests by urgency
  const byUrgency = await EmergencyRequest.aggregate([
    {
      $group: {
        _id: '$urgencyLevel',
        count: { $sum: 1 }
      }
    }
  ]);

  // Recent requests (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentRequests = await EmergencyRequest.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Total counts
  const total = await EmergencyRequest.countDocuments();
  const pending = await EmergencyRequest.countDocuments({ status: 'pending' });
  const approved = await EmergencyRequest.countDocuments({ status: 'approved' });
  const completed = await EmergencyRequest.countDocuments({ status: 'completed' });

  res.status(200).json({
    success: true,
    data: {
      total,
      pending,
      approved,
      completed,
      recentRequests,
      byStatus,
      byBloodGroup,
      byUrgency
    }
  });
});

/**
 * @desc    Delete request (Admin only)
 * @route   DELETE /api/requests/:id
 * @access  Private/Admin
 */
const deleteRequest = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  await request.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Request deleted successfully'
  });
});

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  getMyRequests,
  updateRequestStatus,
  assignRequest,
  cancelRequest,
  getCriticalRequests,
  getRequestStats,
  deleteRequest
};