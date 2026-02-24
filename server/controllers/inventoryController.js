const BloodInventory = require('../models/BloodInventory');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all inventory for a hospital
 * @route   GET /api/inventory
 * @access  Private/Hospital
 */
const getInventory = asyncHandler(async (req, res) => {
  const hospitalId = req.user.role === 'admin' ? req.query.hospitalId : req.user._id;
  
  if (!hospitalId) {
    throw new AppError('Hospital ID is required', 400);
  }

  const inventory = await BloodInventory.find({ 
    hospitalId, 
    isActive: true 
  }).sort({ bloodGroup: 1, expiryDate: 1 });

  // Add computed fields
  const inventoryWithStatus = inventory.map(item => {
    const itemObj = item.toObject();
    itemObj.isExpired = item.isExpired();
    itemObj.isExpiringSoon = item.isExpiringSoon();
    itemObj.daysUntilExpiry = item.getDaysUntilExpiry();
    return itemObj;
  });

  res.status(200).json({
    success: true,
    count: inventory.length,
    data: inventoryWithStatus
  });
});

/**
 * @desc    Get single inventory item
 * @route   GET /api/inventory/:id
 * @access  Private/Hospital
 */
const getInventoryItem = asyncHandler(async (req, res) => {
  const item = await BloodInventory.findById(req.params.id);

  if (!item) {
    throw new AppError('Inventory item not found', 404);
  }

  // Check ownership (unless admin)
  if (req.user.role !== 'admin' && item.hospitalId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to access this inventory', 403);
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

/**
 * @desc    Add blood to inventory
 * @route   POST /api/inventory
 * @access  Private/Hospital
 */
const addInventory = asyncHandler(async (req, res) => {
  const { bloodGroup, quantity, expiryDate, batchNumber, source, notes, collectionDate } = req.body;

  // Validate required fields
  if (!bloodGroup || !quantity || !expiryDate) {
    throw new AppError('Blood group, quantity, and expiry date are required', 400);
  }

  // Check if expiry date is in the future
  if (new Date(expiryDate) <= new Date()) {
    throw new AppError('Expiry date must be in the future', 400);
  }

  // Check if similar inventory exists (same blood group, hospital, and batch)
  let existingItem = null;
  if (batchNumber) {
    existingItem = await BloodInventory.findOne({
      hospitalId: req.user._id,
      bloodGroup,
      batchNumber,
      isActive: true
    });
  }

  if (existingItem) {
    // Update quantity if same batch exists
    existingItem.quantity += quantity;
    existingItem.expiryDate = new Date(expiryDate);
    await existingItem.save();
    
    return res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: existingItem
    });
  }

  // Create new inventory item
  const inventory = await BloodInventory.create({
    hospitalId: req.user._id,
    bloodGroup,
    quantity,
    expiryDate: new Date(expiryDate),
    batchNumber,
    source: source || 'donation',
    notes,
    collectionDate: collectionDate ? new Date(collectionDate) : new Date()
  });

  res.status(201).json({
    success: true,
    message: 'Blood added to inventory successfully',
    data: inventory
  });
});

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private/Hospital
 */
const updateInventory = asyncHandler(async (req, res) => {
  const { quantity, expiryDate, notes, isActive } = req.body;

  const item = await BloodInventory.findById(req.params.id);

  if (!item) {
    throw new AppError('Inventory item not found', 404);
  }

  // Check ownership (unless admin)
  if (req.user.role !== 'admin' && item.hospitalId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this inventory', 403);
  }

  // Update fields
  if (quantity !== undefined) item.quantity = quantity;
  if (expiryDate) item.expiryDate = new Date(expiryDate);
  if (notes !== undefined) item.notes = notes;
  if (isActive !== undefined) item.isActive = isActive;

  await item.save();

  res.status(200).json({
    success: true,
    message: 'Inventory updated successfully',
    data: item
  });
});

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private/Hospital
 */
const deleteInventory = asyncHandler(async (req, res) => {
  const item = await BloodInventory.findById(req.params.id);

  if (!item) {
    throw new AppError('Inventory item not found', 404);
  }

  // Check ownership (unless admin)
  if (req.user.role !== 'admin' && item.hospitalId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to delete this inventory', 403);
  }

  // Soft delete
  item.isActive = false;
  await item.save();

  res.status(200).json({
    success: true,
    message: 'Inventory item removed successfully'
  });
});

/**
 * @desc    Get low stock alerts
 * @route   GET /api/inventory/alerts/low-stock
 * @access  Private/Hospital
 */
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const hospitalId = req.user.role === 'admin' ? req.query.hospitalId : req.user._id;
  
  const lowStock = await BloodInventory.getLowStock(hospitalId);

  res.status(200).json({
    success: true,
    count: lowStock.length,
    data: lowStock
  });
});

/**
 * @desc    Get expiring soon alerts
 * @route   GET /api/inventory/alerts/expiring
 * @access  Private/Hospital
 */
const getExpiringAlerts = asyncHandler(async (req, res) => {
  const hospitalId = req.user.role === 'admin' ? req.query.hospitalId : req.user._id;
  
  const expiringSoon = await BloodInventory.getExpiringSoon(hospitalId);
  const expired = await BloodInventory.getExpired(hospitalId);

  res.status(200).json({
    success: true,
    data: {
      expiringSoon: {
        count: expiringSoon.length,
        items: expiringSoon
      },
      expired: {
        count: expired.length,
        items: expired
      }
    }
  });
});

/**
 * @desc    Search available blood
 * @route   GET /api/inventory/search
 * @access  Public
 */
const searchBlood = asyncHandler(async (req, res) => {
  const { bloodGroup, city, state } = req.query;

  if (!bloodGroup) {
    throw new AppError('Blood group is required', 400);
  }

  // Build filter for inventory
  const inventoryFilter = {
    bloodGroup,
    quantity: { $gt: 0 },
    expiryDate: { $gt: new Date() },
    isActive: true
  };

  // Get hospital IDs based on location
  let hospitalIds = null;
  if (city || state) {
    const hospitalFilter = { role: 'hospital', isActive: true };
    if (city) hospitalFilter.city = new RegExp(city, 'i');
    if (state) hospitalFilter.state = new RegExp(state, 'i');
    
    const hospitals = await User.find(hospitalFilter).select('_id');
    hospitalIds = hospitals.map(h => h._id);
    
    if (hospitalIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    inventoryFilter.hospitalId = { $in: hospitalIds };
  }

  // Get available blood
  const availableBlood = await BloodInventory.find(inventoryFilter)
    .populate('hospitalId', 'name hospitalName city state phone address')
    .sort({ quantity: -1, expiryDate: 1 });

  // Group by hospital
  const groupedByHospital = availableBlood.reduce((acc, item) => {
    const hospitalId = item.hospitalId._id.toString();
    if (!acc[hospitalId]) {
      acc[hospitalId] = {
        hospital: item.hospitalId,
        bloodUnits: []
      };
    }
    acc[hospitalId].bloodUnits.push({
      bloodGroup: item.bloodGroup,
      quantity: item.quantity,
      expiryDate: item.expiryDate,
      daysUntilExpiry: item.getDaysUntilExpiry()
    });
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    count: availableBlood.length,
    hospitals: Object.values(groupedByHospital)
  });
});

/**
 * @desc    Get inventory summary
 * @route   GET /api/inventory/summary
 * @access  Private/Hospital
 */
const getInventorySummary = asyncHandler(async (req, res) => {
  const hospitalId = req.user.role === 'admin' ? req.query.hospitalId : req.user._id;

  // Aggregate by blood group
  const summary = await BloodInventory.aggregate([
    {
      $match: {
        hospitalId: hospitalId,
        isActive: true,
        expiryDate: { $gt: new Date() }
      }
    },
    {
      $group: {
        _id: '$bloodGroup',
        totalQuantity: { $sum: '$quantity' },
        itemCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get all blood groups with zero quantity
  const allBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const existingGroups = summary.map(s => s._id);
  
  const completeSummary = allBloodGroups.map(group => {
    const existing = summary.find(s => s._id === group);
    return existing || {
      _id: group,
      totalQuantity: 0,
      itemCount: 0
    };
  });

  res.status(200).json({
    success: true,
    data: completeSummary
  });
});

/**
 * @desc    Get all inventory (Admin only)
 * @route   GET /api/inventory/all
 * @access  Private/Admin
 */
const getAllInventory = asyncHandler(async (req, res) => {
  const inventory = await BloodInventory.find({ isActive: true })
    .populate('hospitalId', 'name hospitalName city state')
    .sort({ bloodGroup: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: inventory.length,
    data: inventory
  });
});

module.exports = {
  getInventory,
  getInventoryItem,
  addInventory,
  updateInventory,
  deleteInventory,
  getLowStockAlerts,
  getExpiringAlerts,
  searchBlood,
  getInventorySummary,
  getAllInventory
};