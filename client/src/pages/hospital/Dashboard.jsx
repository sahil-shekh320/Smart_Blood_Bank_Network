import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { 
  FiDroplet, 
  FiAlertCircle, 
  FiHeart,
  FiAlertTriangle,
  FiPlus,
  FiClock
} from 'react-icons/fi';
import { getBloodGroupColor, getStatusColor, formatDateTime } from '../../utils/helpers';

const HospitalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await usersAPI.getHospitalDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="large" text="Loading dashboard..." />;
  }

  const { profile, inventory, donations, requests } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hospital Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {profile?.hospitalName || 'Manage your blood bank'}
          </p>
        </div>
        <Link to="/hospital/inventory/add" className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Blood Stock
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Inventory</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {inventory?.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <FiDroplet className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {inventory?.lowStock || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {requests?.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Donations</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                {donations?.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <FiHeart className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(inventory?.lowStock > 0 || inventory?.expired > 0 || inventory?.expiringSoon > 0) && (
        <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
            <FiAlertTriangle /> Alerts
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {inventory?.lowStock > 0 && (
              <span className="text-yellow-700 dark:text-yellow-300">
                {inventory.lowStock} items with low stock
              </span>
            )}
            {inventory?.expired > 0 && (
              <span className="text-red-700 dark:text-red-300">
                {inventory.expired} expired items
              </span>
            )}
            {inventory?.expiringSoon > 0 && (
              <span className="text-orange-700 dark:text-orange-300">
                {inventory.expiringSoon} items expiring soon
              </span>
            )}
          </div>
        </div>
      )}

      {/* Inventory Summary */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Inventory Summary
            </h3>
            <Link to="/hospital/inventory" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
              View All
            </Link>
          </div>
        </div>
        
        {inventory?.items && inventory.items.length > 0 ? (
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.items.slice(0, 8).map((item, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <span className={`badge ${getBloodGroupColor(item.bloodGroup)} text-lg mb-2`}>
                  {item.bloodGroup}
                </span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.quantity}
                </p>
                <p className="text-sm text-gray-500">units</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FiDroplet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No inventory data. Add blood stock to get started.</p>
          </div>
        )}
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Requests
            </h3>
            <Link to="/hospital/requests" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
              View All
            </Link>
          </div>
        </div>
        
        {requests?.recent && requests.recent.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {requests.recent.slice(0, 5).map((request) => (
              <div key={request._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`badge ${getBloodGroupColor(request.bloodGroup)}`}>
                    {request.bloodGroup}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.patientName}
                    </p>
                    <p className="text-sm text-gray-500">{request.hospital}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FiAlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;