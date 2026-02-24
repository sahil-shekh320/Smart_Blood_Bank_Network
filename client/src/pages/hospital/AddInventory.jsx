import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiDroplet, FiCalendar, FiPlus } from 'react-icons/fi';
import { bloodGroups } from '../../utils/helpers';

const AddInventory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: '',
    quantity: 1,
    expiryDate: '',
    batchNumber: '',
    source: 'donation',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.expiryDate) {
      toast.error('Please select expiry date');
      return;
    }
    
    setLoading(true);
    
    try {
      await inventoryAPI.add(formData);
      toast.success('Blood stock added successfully');
      navigate('/hospital/inventory');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  // Default expiry date is 42 days from now
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 42);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Blood Stock
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add new blood units to your inventory
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
                className="input"
                required
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="label">Expiry Date *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="input pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Blood typically expires 42 days after collection
            </p>
          </div>

          {/* Batch Number */}
          <div>
            <label className="label">Batch Number (Optional)</label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              className="input"
              placeholder="e.g., BATCH-001"
            />
          </div>

          {/* Source */}
          <div>
            <label className="label">Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="input"
            >
              <option value="donation">Donation</option>
              <option value="purchase">Purchase</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {loading ? 'Adding...' : (
              <>
                <FiPlus /> Add Blood Stock
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInventory;