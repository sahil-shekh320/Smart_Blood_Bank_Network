import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { 
  FiHeart, 
  FiDroplet, 
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiClock
} from 'react-icons/fi';
import { formatDate, getBloodGroupColor } from '../../utils/helpers';

const DonorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await usersAPI.getDonorDashboard();
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

  const { profile, isEligible, daysUntilEligible, totalDonations, recentDonations, nearbyRequests } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {profile?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for being a life-saver
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${getBloodGroupColor(profile?.bloodGroup)} text-lg px-4 py-2`}>
            {profile?.bloodGroup}
          </span>
        </div>
      </div>

      {/* Eligibility Card */}
      <div className={`card p-6 ${isEligible ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isEligible ? 'bg-green-100 dark:bg-green-900/40' : 'bg-yellow-100 dark:bg-yellow-900/40'}`}>
            {isEligible ? (
              <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            ) : (
              <FiClock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEligible ? 'You are eligible to donate!' : 'Not yet eligible to donate'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isEligible 
                ? 'You can donate blood now. Find a hospital near you.'
                : `Please wait ${daysUntilEligible} more days before your next donation.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Donations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalDonations || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <FiHeart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Blood Group</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {profile?.bloodGroup}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Donation</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {profile?.lastDonationDate ? formatDate(profile.lastDonationDate) : 'Never'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Donations
            </h3>
            <Link to="/donor/donations" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
              View All
            </Link>
          </div>
        </div>
        
        {recentDonations && recentDonations.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentDonations.slice(0, 5).map((donation) => (
              <div key={donation._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <FiHeart className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {donation.hospitalId?.hospitalName || 'Hospital'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {donation.hospitalId?.city}, {donation.hospitalId?.state}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(donation.donationDate)}
                  </p>
                  <p className="text-sm text-gray-500">{donation.quantity} unit(s)</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FiHeart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No donations yet. Start your journey today!</p>
          </div>
        )}
      </div>

      {/* Nearby Emergency Requests */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nearby Emergency Requests
            </h3>
            <Link to="/donor/requests" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
              View All
            </Link>
          </div>
        </div>
        
        {nearbyRequests && nearbyRequests.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {nearbyRequests.map((request) => (
              <div key={request._id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${getBloodGroupColor(request.bloodGroup)}`}>
                    {request.bloodGroup}
                  </span>
                  <span className={`badge ${request.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {request.urgencyLevel?.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {request.hospital}
                </p>
                <p className="text-sm text-gray-500">
                  {request.location?.city}, {request.location?.state}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FiAlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No emergency requests in your area at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;