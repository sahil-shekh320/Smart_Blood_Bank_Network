const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize, isAdmin, isDonor, isPatient, isHospital } = require('../middleware/authorize');
const { validateObjectId, validatePagination } = require('../middleware/validate');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// Admin routes
router.get('/', isAdmin, validatePagination, userController.getAllUsers);
router.get('/stats', isAdmin, userController.getUserStats);
router.put('/:id', isAdmin, validateObjectId('id'), userController.updateUser);
router.delete('/:id', isAdmin, validateObjectId('id'), userController.deleteUser);

// Public routes (require authentication)
router.get('/hospitals', userController.getHospitals);
router.get('/donors/search', userController.searchDonors);

// User by ID
router.get('/:id', validateObjectId('id'), userController.getUserById);

// Dashboard routes (role-specific)
router.get('/donor/dashboard', isDonor, userController.getDonorDashboard);
router.get('/patient/dashboard', isPatient, userController.getPatientDashboard);
router.get('/hospital/dashboard', isHospital, userController.getHospitalDashboard);

module.exports = router;