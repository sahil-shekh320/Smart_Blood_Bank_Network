const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    phone, 
    bloodGroup, 
    role, 
    city, 
    state, 
    address,
    hospitalName,
    registrationNumber 
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Create user object based on role
  const userData = {
    name,
    email,
    password,
    phone,
    role: role || 'donor',
    city,
    state,
    address
  };

  // Add blood group for donors and patients
  if (role === 'donor' || role === 'patient') {
    if (!bloodGroup) {
      throw new AppError('Blood group is required for donors and patients', 400);
    }
    userData.bloodGroup = bloodGroup;
  }

  // Add hospital specific fields
  if (role === 'hospital') {
    if (!hospitalName) {
      throw new AppError('Hospital name is required', 400);
    }
    userData.hospitalName = hospitalName;
    userData.registrationNumber = registrationNumber;
  }

  // Create user
  const user = await User.create(userData);

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact admin.', 401);
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user.getPublicProfile()
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { 
    name, 
    phone, 
    city, 
    state, 
    address,
    isAvailable,
    hospitalName 
  } = req.body;

  const updateData = {};
  
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (city) updateData.city = city;
  if (state) updateData.state = state;
  if (address) updateData.address = address;
  
  // Donor specific updates
  if (req.user.role === 'donor' && isAvailable !== undefined) {
    updateData.isAvailable = isAvailable;
  }
  
  // Hospital specific updates
  if (req.user.role === 'hospital' && hospitalName) {
    updateData.hospitalName = hospitalName;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user.getPublicProfile()
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Check if email exists
 * @route   POST /api/auth/check-email
 * @access  Public
 */
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email });

  res.status(200).json({
    success: true,
    exists: !!user
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  checkEmail
};