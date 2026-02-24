import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { FiUser, FiPhone, FiMapPin, FiCheck } from 'react-icons/fi';
import { indianStates } from '../../utils/helpers';

const DonorProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    isAvailable: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        address: user.address || '',
        isAvailable: user.isAvailable ?? true
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      toast.success('Profile updated successfully');
    }
    
    setLoading(false);
  };

  if (!user) {
    return <Loading size="large" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your donor profile information
        </p>
      </div>

      {/* Profile Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="label">
              Full Name
            </label>
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
                className="input pl-10"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="label">
              Phone Number
            </label>
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
                className="input pl-10"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="label">
              City
            </label>
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
                className="input pl-10"
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="label">
              State
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select State</option>
              {indianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="label">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="input"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Available for Donation
              </p>
              <p className="text-sm text-gray-500">
                Toggle your availability for blood donation
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : (
              <>
                <FiCheck /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Read-only Info */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900 dark:text-white">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Blood Group</span>
            <span className="text-gray-900 dark:text-white">{user.bloodGroup}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="text-gray-900 dark:text-white capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Member Since</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;