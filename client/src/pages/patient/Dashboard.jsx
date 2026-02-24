import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { 
  FiDroplet, 
  FiAlertCircle, 
  FiSearch,
  FiPlus,
  FiClock
} from 'react-icons/fi';
import { getBloodGroupColor, getStatusColor, formatDateTime } from '../../utils/helpers';

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await usersAPI.getPatientDashboard();
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

  const { profile, totalRequests, pendingRequests, recentRequests, availableBlood } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {profile?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find blood and manage your requests
          </p>
        </div>
        <Link to="/patient/request/new" className="btn-primary flex items-center gap-2">
          <FiPlus /> New Request
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Blood Group</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                <span className={`badge ${getBloodGroupColor(profile?.bloodGroup)} text-xl px-3 py-1`}>
                  {profile?.bloodGroup}
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <FiDroplet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalRequests || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {pendingRequests || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/patient/search"
          className="card p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <FiSearch className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Search Blood
            </h3>
            <p className="text-sm text-gray-500">
              Find available blood in hospitals near you
            </p>
          </div>
        </Link>

        <Link
          to="/patient/request/new"
          className="card p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <FiAlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Emergency Request
            </h3>
            <p className="text-sm text-gray-500">
              Create an urgent blood request
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Requests
            </h3>
            <Link to="/patient/requests" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
              View All
            </Link>
          </div>
        </div>
        
        {recentRequests && recentRequests.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentRequests.slice(0, 5).map((request) => (
              <div key={request._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`badge ${getBloodGroupColor(request.bloodGroup)}`}>
                    {request.bloodGroup}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.hospital}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(request.createdAt)}
                    </p>
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
            <p>No requests yet. Create your first blood request!</p>
          </div>
        )}
      </div>

      {/* Available Blood */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available {profile?.bloodGroup} Blood
            </h3>
            <Link to="/patient/search" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
              Search More
            </Link>
          </div>
        </div>
        
        {availableBlood && availableBlood.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {availableBlood.slice(0, 5).map((item, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.hospitalId?.hospitalName || 'Hospital'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.hospitalId?.city}, {item.hospitalId?.state}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {item.quantity} units
                  </p>
                  <p className="text-sm text-gray-500">available</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FiDroplet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No matching blood available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;