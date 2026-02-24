const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const authController = require('../controllers/authController');

/**
 * Validation rules for registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
  body('role')
    .isIn(['donor', 'patient', 'hospital']).withMessage('Invalid role'),
  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  validate
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

/**
 * Validation rules for profile update
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
  body('city')
    .optional()
    .trim()
    .notEmpty().withMessage('City cannot be empty'),
  body('state')
    .optional()
    .trim()
    .notEmpty().withMessage('State cannot be empty'),
  validate
];

/**
 * Validation rules for password change
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/check-email', authController.checkEmail);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, updateProfileValidation, authController.updateProfile);
router.put('/password', protect, changePasswordValidation, authController.changePassword);
router.post('/logout', protect, authController.logout);

module.exports = router;