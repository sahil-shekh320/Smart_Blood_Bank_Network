import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiPhone, 
  FiMapPin, 
  FiEye, 
  FiEyeOff,
  FiDroplet,
  FiBriefcase
} from 'react-icons/fi';
import { bloodGroups, indianStates, userRoles } from '../utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodGroup: '',
    role: searchParams.get('role') || 'donor',
    city: '',
    state: '',
    address: '',
    hospitalName: '',
    registrationNumber: ''
  });

  useEffect(() => {
    if (searchParams.get('role')) {
      setFormData(prev => ({ ...prev, role: searchParams.get('role') }));
    }
  }, [searchParams]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits required)';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if ((formData.role === 'donor' || formData.role === 'patient') && !formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }
    
    if (formData.role === 'hospital') {
      if (!formData.hospitalName) {
        newErrors.hospitalName = 'Hospital name is required';
      }
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setLoading(true);
    
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      city: formData.city,
      state: formData.state,
      address: formData.address
    };
    
    if (formData.role === 'donor' || formData.role === 'patient') {
      userData.bloodGroup = formData.bloodGroup;
    }
    
    if (formData.role === 'hospital') {
      userData.hospitalName = formData.hospitalName;
      userData.registrationNumber = formData.registrationNumber;
    }
    
    const result = await register(userData);
    
    if (result.success) {
      const dashboardRoutes = {
        admin: '/admin',
        donor: '/donor',
        patient: '/patient',
        hospital: '/hospital'
      };
      navigate(dashboardRoutes[formData.role] || '/', { replace: true });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <FiDroplet className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join our life-saving community
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Account</span>
          </div>
          <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Details</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5">
                {/* Role Selection */}
                <div>
                  <label className="label">I am a</label>
                  <div className="grid grid-cols-3 gap-3">
                    {userRoles.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          formData.role === role.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm font-medium">{role.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="label">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="label">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="label">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                      placeholder="10-digit phone number"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full btn-primary py-3"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                {/* Blood Group (for donor/patient) */}
                {(formData.role === 'donor' || formData.role === 'patient') && (
                  <div>
                    <label htmlFor="bloodGroup" className="label">Blood Group</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDroplet className="text-gray-400" />
                      </div>
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.bloodGroup ? 'input-error' : ''}`}
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                    {errors.bloodGroup && <p className="mt-1 text-sm text-red-500">{errors.bloodGroup}</p>}
                  </div>
                )}

                {/* Hospital Name (for hospital) */}
                {formData.role === 'hospital' && (
                  <>
                    <div>
                      <label htmlFor="hospitalName" className="label">Hospital Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiBriefcase className="text-gray-400" />
                        </div>
                        <input
                          id="hospitalName"
                          name="hospitalName"
                          type="text"
                          value={formData.hospitalName}
                          onChange={handleChange}
                          className={`input pl-10 ${errors.hospitalName ? 'input-error' : ''}`}
                          placeholder="Enter hospital name"
                        />
                      </div>
                      {errors.hospitalName && <p className="mt-1 text-sm text-red-500">{errors.hospitalName}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="registrationNumber" className="label">Registration Number (Optional)</label>
                      <input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        className="input"
                        placeholder="Hospital registration number"
                      />
                    </div>
                  </>
                )}

                {/* City */}
                <div>
                  <label htmlFor="city" className="label">City</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="text-gray-400" />
                    </div>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      className={`input pl-10 ${errors.city ? 'input-error' : ''}`}
                      placeholder="Enter your city"
                    />
                  </div>
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="label">State</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`input ${errors.state ? 'input-error' : ''}`}
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="label">Address (Optional)</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="input"
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 btn-outline py-3"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-3"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;