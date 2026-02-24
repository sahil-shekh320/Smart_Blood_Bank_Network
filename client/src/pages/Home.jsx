import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiDroplet, 
  FiUsers, 
  FiHeart, 
  FiAlertCircle,
  FiSearch,
  FiShield,
  FiClock,
  FiMapPin
} from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: FiDroplet,
      title: 'Real-time Inventory',
      description: 'Track blood availability across hospitals in real-time'
    },
    {
      icon: FiAlertCircle,
      title: 'Emergency Requests',
      description: 'Create and manage urgent blood requests instantly'
    },
    {
      icon: FiUsers,
      title: 'Donor Network',
      description: 'Connect with compatible donors in your area'
    },
    {
      icon: FiShield,
      title: 'Secure Platform',
      description: 'Your data is protected with industry-standard security'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Registered Donors' },
    { value: '500+', label: 'Partner Hospitals' },
    { value: '25,000+', label: 'Lives Saved' },
    { value: '24/7', label: 'Availability' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Smart Blood Bank Network
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Connecting donors, patients, and hospitals to save lives through 
              efficient blood donation management and real-time availability tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to={`/${user?.role}`}
                  className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Register as Donor
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform streamlines the blood donation process, making it easier 
              for everyone involved to save lives.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Who Can Join?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Donor Card */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
                <FiHeart className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Blood Donors
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
                <li className="flex items-center">
                  <FiClock className="mr-2 text-green-500" />
                  Track donation history
                </li>
                <li className="flex items-center">
                  <FiAlertCircle className="mr-2 text-green-500" />
                  Get notified for emergencies
                </li>
                <li className="flex items-center">
                  <FiMapPin className="mr-2 text-green-500" />
                  Find nearby hospitals
                </li>
              </ul>
              <Link
                to="/register?role=donor"
                className="mt-4 block text-center py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Register as Donor
              </Link>
            </div>

            {/* Patient Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                <FiSearch className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Patients
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
                <li className="flex items-center">
                  <FiDroplet className="mr-2 text-blue-500" />
                  Search blood availability
                </li>
                <li className="flex items-center">
                  <FiAlertCircle className="mr-2 text-blue-500" />
                  Create emergency requests
                </li>
                <li className="flex items-center">
                  <FiClock className="mr-2 text-blue-500" />
                  Track request status
                </li>
              </ul>
              <Link
                to="/register?role=patient"
                className="mt-4 block text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register as Patient
              </Link>
            </div>

            {/* Hospital Card */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center mb-4">
                <FiUsers className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Hospitals
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
                <li className="flex items-center">
                  <FiDroplet className="mr-2 text-orange-500" />
                  Manage blood inventory
                </li>
                <li className="flex items-center">
                  <FiAlertCircle className="mr-2 text-orange-500" />
                  Handle emergency requests
                </li>
                <li className="flex items-center">
                  <FiHeart className="mr-2 text-orange-500" />
                  Record donations
                </li>
              </ul>
              <Link
                to="/register?role=hospital"
                className="mt-4 block text-center py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Register as Hospital
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Save Lives?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our network today and become part of a community dedicated to 
            ensuring blood is available when it's needed most.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <svg className="w-8 h-8 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
              </svg>
              <span className="ml-2 text-white font-semibold">BloodBank</span>
            </div>
            <p className="text-sm">
              © 2024 Smart Blood Bank Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;