const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authorize, isDonor, isHospitalOrAdmin } = require('../middleware/authorize');
const { validate, validateObjectId, validatePagination } = require('../middleware/validate');
const donationController = require('../controllers/donationController');

/**
 * Validation rules for donation
 */
const createDonationValidation = [
  body('donorId')
    .isMongoId().withMessage('Invalid donor ID'),
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('hemoglobin')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hemoglobin must be positive'),
  body('weight')
    .optional()
    .isFloat({ min: 0 }).withMessage('Weight must be positive'),
  body('pulse')
    .optional()
    .isInt({ min: 0 }).withMessage('Pulse must be positive'),
  validate
];

// All routes require authentication
router.use(protect);

// Donor routes
router.get('/my-donations', isDonor, donationController.getMyDonations);

// Hospital routes
router.post('/', isHospitalOrAdmin, createDonationValidation, donationController.createDonation);
router.get('/hospital', isHospitalOrAdmin, donationController.getHospitalDonations);
router.put('/:id', isHospitalOrAdmin, validateObjectId('id'), donationController.updateDonation);

// Common routes
router.get('/', validatePagination, donationController.getAllDonations);
router.get('/recent', donationController.getRecentDonations);
router.get('/stats', donationController.getDonationStats);
router.get('/:id', validateObjectId('id'), donationController.getDonationById);

// Admin routes
router.delete('/:id', authorize('admin'), validateObjectId('id'), donationController.deleteDonation);

module.exports = router;