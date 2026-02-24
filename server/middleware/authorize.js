/**
 * Role-based Authorization Middleware
 * Restricts access based on user roles
 */

/**
 * Authorize specific roles
 * @param {...String} roles - Roles that are authorized
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * Check if user is hospital
 */
const isHospital = (req, res, next) => {
  if (!req.user || req.user.role !== 'hospital') {
    return res.status(403).json({
      success: false,
      message: 'Hospital access required'
    });
  }
  next();
};

/**
 * Check if user is donor
 */
const isDonor = (req, res, next) => {
  if (!req.user || req.user.role !== 'donor') {
    return res.status(403).json({
      success: false,
      message: 'Donor access required'
    });
  }
  next();
};

/**
 * Check if user is patient
 */
const isPatient = (req, res, next) => {
  if (!req.user || req.user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Patient access required'
    });
  }
  next();
};

/**
 * Check if user owns the resource or is admin
 * @param {String} resourceField - Field name in request params/body containing resource owner ID
 */
const isOwnerOrAdmin = (resourceField = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceField] || req.body[resourceField];
    
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user._id.toString() !== resourceId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    next();
  };
};

/**
 * Check if user is hospital or admin
 */
const isHospitalOrAdmin = (req, res, next) => {
  if (!req.user || !['hospital', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Hospital or Admin access required'
    });
  }
  next();
};

/**
 * Check if user can manage blood inventory
 * Only hospital and admin can manage inventory
 */
const canManageInventory = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (!['hospital', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only hospitals can manage blood inventory'
    });
  }

  next();
};

/**
 * Check if user can create emergency requests
 * Only patients can create emergency requests
 */
const canCreateRequest = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (!['patient', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only patients can create emergency requests'
    });
  }

  next();
};

/**
 * Check if user can respond to emergency requests
 * Only hospitals and admins can approve/reject requests
 */
const canRespondToRequest = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (!['hospital', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only hospitals can respond to emergency requests'
    });
  }

  next();
};

module.exports = {
  authorize,
  isAdmin,
  isHospital,
  isDonor,
  isPatient,
  isOwnerOrAdmin,
  isHospitalOrAdmin,
  canManageInventory,
  canCreateRequest,
  canRespondToRequest
};