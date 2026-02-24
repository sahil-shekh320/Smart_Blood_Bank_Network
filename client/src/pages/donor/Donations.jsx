import React, { useState, useEffect } from 'react';
import { donationsAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { FiHeart, FiCalendar, FiMapPin } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';

const DonorDonations = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await donationsAPI.getMyDonations();
      setDonations(response.data.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="large" text="Loading donations..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Donation History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your blood donation journey
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Donations</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-1">
            {donations.length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Units</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
            {donations.reduce((sum, d) => sum + (d.quantity || 1), 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Last Donation</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {donations.length > 0 ? formatDate(donations[0].donationDate) : 'Never'}
          </p>
        </div>
      </div>

      {/* Donations List */}
      {donations.length > 0 ? (
        <div className="card divide-y divide-gray-200 dark:divide-gray-700">
          {donations.map((donation) => (
            <div key={donation._id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiHeart className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {donation.hospitalId?.hospitalName || 'Hospital'}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {donation.hospitalId?.city}, {donation.hospitalId?.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-gray-500">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(donation.donationDate)}
                      </span>
                      <span className="badge bg-green-100 text-green-800">
                        {donation.donationType || 'Whole Blood'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {donation.quantity}
                  </p>
                  <p className="text-sm text-gray-500">unit(s)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <FiHeart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Donations Yet
          </h3>
          <p className="text-gray-500">
            Your donation history will appear here once you make your first donation.
          </p>
        </div>
      )}
    </div>
  );
};

export default DonorDonations;