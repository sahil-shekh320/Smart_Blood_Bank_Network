/**
 * Format date to readable string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

/**
 * Calculate days until a date
 */
export const daysUntil = (date) => {
  if (!date) return null;
  
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if a date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Check if a date is expiring soon (within 7 days)
 */
export const isExpiringSoon = (date) => {
  const days = daysUntil(date);
  return days !== null && days > 0 && days <= 7;
};

/**
 * Get blood group color class
 */
export const getBloodGroupColor = (bloodGroup) => {
  const colors = {
    'A+': 'bg-red-100 text-red-800',
    'A-': 'bg-red-200 text-red-900',
    'B+': 'bg-blue-100 text-blue-800',
    'B-': 'bg-blue-200 text-blue-900',
    'AB+': 'bg-purple-100 text-purple-800',
    'AB-': 'bg-purple-200 text-purple-900',
    'O+': 'bg-green-100 text-green-800',
    'O-': 'bg-green-200 text-green-900'
  };
  return colors[bloodGroup] || 'bg-gray-100 text-gray-800';
};

/**
 * Get status badge class
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800'
  };
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Get urgency level color
 */
export const getUrgencyColor = (level) => {
  const colors = {
    critical: 'bg-red-500 text-white animate-pulse',
    urgent: 'bg-orange-500 text-white',
    normal: 'bg-blue-100 text-blue-800'
  };
  return colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
  const names = {
    admin: 'Administrator',
    donor: 'Blood Donor',
    patient: 'Patient',
    hospital: 'Hospital/Blood Bank'
  };
  return names[role] || role;
};

/**
 * Get role color class
 */
export const getRoleColor = (role) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    donor: 'bg-green-100 text-green-800',
    patient: 'bg-blue-100 text-blue-800',
    hospital: 'bg-orange-100 text-orange-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

/**
 * Truncate text
 */
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (10 digits)
 */
export const isValidPhone = (phone) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone);
};

/**
 * Validate password strength
 */
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: 'None' };
  
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return { strength, label: labels[strength - 1] || 'Very Weak' };
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Indian states list
 */
export const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
];

/**
 * Blood groups list
 */
export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * User roles list
 */
export const userRoles = [
  { value: 'donor', label: 'Blood Donor' },
  { value: 'patient', label: 'Patient' },
  { value: 'hospital', label: 'Hospital/Blood Bank' }
];

/**
 * Urgency levels
 */
export const urgencyLevels = [
  { value: 'critical', label: 'Critical (Within 6 hours)' },
  { value: 'urgent', label: 'Urgent (Within 24 hours)' },
  { value: 'normal', label: 'Normal (Within 72 hours)' }
];

/**
 * Request status options
 */
export const requestStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];