import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { FiDroplet, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { getBloodGroupColor, formatDate } from '../../utils/helpers';

const AdminInventory = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await inventoryAPI.getAllInventory();
      setInventory(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  // Group inventory by hospital
  const groupedByHospital = inventory.reduce((acc, item) => {
    const hospitalId = item.hospitalId?._id || 'unknown';
    if (!acc[hospitalId]) {
      acc[hospitalId] = {
        hospital: item.hospitalId,
        items: []
      };
    }
    acc[hospitalId].items.push(item);
    return acc;
  }, {});

  // Calculate totals by blood group
  const totalsByBloodGroup = inventory.reduce((acc, item) => {
    if (!acc[item.bloodGroup]) {
      acc[item.bloodGroup] = 0;
    }
    acc[item.bloodGroup] += item.quantity;
    return acc;
  }, {});

  const isExpiringSoon = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 7;
  };

  const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

  if (loading) {
    return <Loading size="large" text="Loading inventory..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Blood Inventory Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View blood stock across all hospitals
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(totalsByBloodGroup).map(([bloodGroup, total]) => (
          <div key={bloodGroup} className="stat-card">
            <div className="flex items-center justify-between">
              <span className={`badge ${getBloodGroupColor(bloodGroup)} text-lg px-3 py-1`}>
                {bloodGroup}
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {total}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">units available</p>
          </div>
        ))}
      </div>

      {/* Hospital Inventories */}
      <div className="space-y-6">
        {Object.entries(groupedByHospital).map(([hospitalId, { hospital, items }]) => (
          <div key={hospitalId} className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {hospital?.hospitalName || hospital?.name || 'Unknown Hospital'}
              </h3>
              <p className="text-sm text-gray-500">
                {hospital?.city}, {hospital?.state}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Blood Group</th>
                    <th className="table-header-cell">Quantity</th>
                    <th className="table-header-cell">Expiry Date</th>
                    <th className="table-header-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="table-cell">
                        <span className={`badge ${getBloodGroupColor(item.bloodGroup)}`}>
                          {item.bloodGroup}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`font-medium ${item.quantity < 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {item.quantity} units
                        </span>
                      </td>
                      <td className="table-cell">
                        {formatDate(item.expiryDate)}
                      </td>
                      <td className="table-cell">
                        {isExpired(item.expiryDate) ? (
                          <span className="badge bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                            <FiAlertTriangle /> Expired
                          </span>
                        ) : isExpiringSoon(item.expiryDate) ? (
                          <span className="badge bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                            <FiClock /> Expiring Soon
                          </span>
                        ) : item.quantity < 5 ? (
                          <span className="badge bg-orange-100 text-orange-800 flex items-center gap-1 w-fit">
                            <FiAlertTriangle /> Low Stock
                          </span>
                        ) : (
                          <span className="badge bg-green-100 text-green-800">
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {inventory.length === 0 && (
        <div className="card p-8 text-center text-gray-500">
          <FiDroplet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No inventory data available</p>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;