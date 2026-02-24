import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiAlertCircle, 
  FiDroplet, 
  FiMapPin, 
  FiUser,
  FiPhone,
  FiCalendar,
  FiClock
} from 'react-icons/fi';
import { bloodGroups, indianStates, urgencyLevels } from '../../utils/helpers';

const NewRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: user?.bloodGroup || '',
    quantity: 1,
    urgencyLevel: 'normal',
    patientName: user?.name || '',
    patientPhone: user?.phone || '',
    hospital: '',
    doctorName: '',
    reason: '',
    requiredBy: '',
    location: {
      address: '',
      city: user?.city || '',
      state: user?.state || ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.requiredBy) {
      toast.error('Please select required by date');
      return;
    }
    
    setLoading(true);
    
    try {
      await requestsAPI.create(formData);
      toast.success('Emergency request created successfully');
      navigate('/patient/requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Emergency Request
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit a blood request to nearby hospitals
        </p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blood Group & Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Blood Group *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDroplet className="text-gray-400" />
                </div>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="input pl-10"
                  required
                >
                  <option value="">Select</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="label">Quantity (units) *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max="10"
                className="input"
                required
              />
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="label">Urgency Level *</label>
            <div className="grid grid-cols-3 gap-3">
              {urgencyLevels.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, urgencyLevel: level.value }))}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    formData.urgencyLevel === level.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="text-sm font-medium">{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Patient Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="input pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="label">Patient Phone *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleChange}
                  className="input pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Hospital & Doctor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hospital Name *</label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="label">Doctor Name</label>
              <input
                type="text"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="label">Address *</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <textarea
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                rows={2}
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City *</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="label">State *</label>
              <select
                name="location.state"
                value={formData.location.state}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Required By */}
          <div>
            <label className="label">Required By *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="datetime-local"
                name="requiredBy"
                value={formData.requiredBy}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                className="input pl-10"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="label">Reason (Optional)</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Brief description of the medical condition..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Request...' : (
              <>
                <FiAlertCircle /> Create Emergency Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;