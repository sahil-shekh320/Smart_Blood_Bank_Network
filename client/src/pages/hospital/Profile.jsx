import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { FiUser, FiPhone, FiMapPin, FiCheck, FiBriefcase } from 'react-icons/fi';
import { indianStates } from '../../utils/helpers';

const HospitalProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    hospitalName: '',
    city: '',
    state: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        hospitalName: user.hospitalName || '',
        city: user.city || '',
        state: user.state || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hospital Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your hospital information</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Contact Person Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">Hospital Name</label>
            <div className="relative">
              <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">City</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">State</label>
            <select
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

          <div>
            <label className="label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="input"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2">
            {loading ? 'Saving...' : <><FiCheck /> Save Changes</>}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900 dark:text-white">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Registration Number</span>
            <span className="text-gray-900 dark:text-white">{user.registrationNumber || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalProfile;