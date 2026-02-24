const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authorize, isHospitalOrAdmin, canManageInventory } = require('../middleware/authorize');
const { validate, validateObjectId, validatePagination } = require('../middleware/validate');
const inventoryController = require('../controllers/inventoryController');

/**
 * Validation rules for inventory
 */
const inventoryValidation = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('expiryDate')
    .isISO8601().withMessage('Invalid expiry date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  validate
];

const updateInventoryValidation = [
  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity cannot be negative'),
  body('expiryDate')
    .optional()
    .isISO8601().withMessage('Invalid expiry date'),
  validate
];

// All routes require authentication
router.use(protect);

// Public search route (for patients)
router.get('/search', inventoryController.searchBlood);

// Hospital routes (manage inventory)
router.get('/', isHospitalOrAdmin, validatePagination, inventoryController.getInventory);
router.get('/summary', isHospitalOrAdmin, inventoryController.getInventorySummary);
router.get('/alerts/low-stock', isHospitalOrAdmin, inventoryController.getLowStockAlerts);
router.get('/alerts/expiring', isHospitalOrAdmin, inventoryController.getExpiringAlerts);

router.post('/', canManageInventory, inventoryValidation, inventoryController.addInventory);
router.put('/:id', canManageInventory, validateObjectId('id'), updateInventoryValidation, inventoryController.updateInventory);
router.delete('/:id', canManageInventory, validateObjectId('id'), inventoryController.deleteInventory);

// Admin routes
router.get('/all', authorize('admin'), inventoryController.getAllInventory);

// Single inventory item
router.get('/:id', validateObjectId('id'), inventoryController.getInventoryItem);

module.exports = router;