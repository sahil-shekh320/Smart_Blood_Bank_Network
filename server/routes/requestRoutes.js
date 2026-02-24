const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authorize, isPatient, isHospitalOrAdmin, canCreateRequest, canRespondToRequest } = require('../middleware/authorize');
const { validate, validateObjectId, validatePagination } = require('../middleware/validate');
const requestController = require('../controllers/requestController');

/**
 * Validation rules for emergency request
 */
const createRequestValidation = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('location.address')
    .notEmpty().withMessage('Address is required'),
  body('location.city')
    .notEmpty().withMessage('City is required'),
  body('location.state')
    .notEmpty().withMessage('State is required'),
  body('patientName')
    .notEmpty().withMessage('Patient name is required'),
  body('patientPhone')
    .matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
  body('hospital')
    .notEmpty().withMessage('Hospital name is required'),
  body('requiredBy')
    .isISO8601().withMessage('Invalid required by date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Required by date must be in the future');
      }
      return true;
    }),
  validate
];

const updateStatusValidation = [
  body('status')
    .isIn(['approved', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .notEmpty().withMessage('Rejection reason is required when rejecting'),
  validate
];

// All routes require authentication
router.use(protect);

// Patient routes
router.post('/', canCreateRequest, createRequestValidation, requestController.createRequest);
router.get('/my-requests', isPatient, requestController.getMyRequests);
router.put('/:id/cancel', validateObjectId('id'), isPatient, requestController.cancelRequest);

// Hospital/Admin routes
router.get('/', isHospitalOrAdmin, validatePagination, requestController.getAllRequests);
router.get('/critical', isHospitalOrAdmin, requestController.getCriticalRequests);
router.put('/:id/status', canRespondToRequest, validateObjectId('id'), updateStatusValidation, requestController.updateRequestStatus);

// Admin routes
router.get('/stats', authorize('admin'), requestController.getRequestStats);
router.put('/:id/assign', authorize('admin'), validateObjectId('id'), requestController.assignRequest);
router.delete('/:id', authorize('admin'), validateObjectId('id'), requestController.deleteRequest);

// Single request (accessible by all authenticated users with proper authorization)
router.get('/:id', validateObjectId('id'), requestController.getRequestById);

module.exports = router;