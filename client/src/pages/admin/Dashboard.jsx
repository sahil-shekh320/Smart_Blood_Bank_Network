import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, requestsAPI, inventoryAPI, donationsAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { 
  FiUsers, 
  FiDroplet, 
  FiAlertCircle, 
  FiHeart,
  FiTrendingUp,
  FiArrowRight
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [requestStats, setRequestStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [userStatsRes, requestStatsRes] = await Promise.all([
        usersAPI.getStats(),
        requestsAPI.getStats()
      ]);
      setStats(userStatsRes.data.data);
      setRequestStats(requestStatsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="large" text="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Total Donors',
      value: stats?.totalDonors || 0,
      icon: FiHeart,
      color: 'bg-green-500',
      link: '/admin/users?role=donor'
    },
    {
      title: 'Total Hospitals',
      value: stats?.totalHospitals || 0,
      icon: FiDroplet,
      color: 'bg-purple-500',
      link: '/admin/users?role=hospital'
    },
    {
      title: 'Pending Requests',
      value: requestStats?.pending || 0,
      icon: FiAlertCircle,
      color: 'bg-orange-500',
      link: '/admin/requests'
    }
  ];

  // Chart data for users by role
  const userRoleData = {
    labels: stats?.usersByRole?.map(u => u._id) || [],
    datasets: [{
      data: stats?.usersByRole?.map(u => u.count) || [],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  // Chart data for blood groups
  const bloodGroupData = {
    labels: stats?.usersByBloodGroup?.map(u => u._id) || [],
    datasets: [{
      label: 'Users by Blood Group',
      data: stats?.usersByBloodGroup?.map(u => u.count) || [],
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderRadius: 8
    }]
  };

  // Chart data for requests by status
  const requestStatusData = {
    labels: requestStats?.byStatus?.map(r => r._id) || [],
    datasets: [{
      data: requestStats?.byStatus?.map(r => r.count) || [],
      backgroundColor: [
        'rgba(234, 179, 8, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(107, 114, 128, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of the blood bank network
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="stat-card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-primary-600 dark:text-primary-400">
              View details <FiArrowRight className="ml-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Users by Role
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={userRoleData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Users by Blood Group */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Users by Blood Group
          </h3>
          <div className="h-64">
            <Bar 
              data={bloodGroupData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Requests by Status */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Requests by Status
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={requestStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <FiUsers /> Manage Users
          </Link>
          <Link
            to="/admin/requests"
            className="flex items-center justify-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <FiAlertCircle /> View Requests
          </Link>
          <Link
            to="/admin/inventory"
            className="flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <FiDroplet /> Inventory
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <FiTrendingUp /> Analytics
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Cities by Users
          </h3>
          <div className="space-y-3">
            {stats?.usersByCity?.slice(0, 5).map((city, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {city._id}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {city.count} users
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Available Donors</span>
              <span className="font-medium text-green-600">{stats?.availableDonors || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Recent Registrations (30 days)</span>
              <span className="font-medium text-blue-600">{stats?.recentRegistrations || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Requests</span>
              <span className="font-medium text-gray-900 dark:text-white">{requestStats?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Completed Requests</span>
              <span className="font-medium text-green-600">{requestStats?.completed || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;