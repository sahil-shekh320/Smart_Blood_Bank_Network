import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiUser, 
  FiDroplet, 
  FiAlertCircle, 
  FiPackage, 
  FiUsers,
  FiSettings,
  FiActivity,
  FiHeart,
  FiSearch,
  FiPlus,
  FiList
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { path: '/admin', icon: FiHome, label: 'Dashboard' },
          { path: '/admin/users', icon: FiUsers, label: 'Users' },
          { path: '/admin/hospitals', icon: FiPackage, label: 'Hospitals' },
          { path: '/admin/requests', icon: FiAlertCircle, label: 'Requests' },
          { path: '/admin/inventory', icon: FiDroplet, label: 'Inventory' },
          { path: '/admin/donations', icon: FiHeart, label: 'Donations' },
          { path: '/admin/analytics', icon: FiActivity, label: 'Analytics' },
          { path: '/admin/settings', icon: FiSettings, label: 'Settings' }
        ];
      case 'donor':
        return [
          { path: '/donor', icon: FiHome, label: 'Dashboard' },
          { path: '/donor/profile', icon: FiUser, label: 'My Profile' },
          { path: '/donor/donations', icon: FiHeart, label: 'Donation History' },
          { path: '/donor/requests', icon: FiAlertCircle, label: 'Nearby Requests' },
          { path: '/donor/eligibility', icon: FiActivity, label: 'Eligibility' },
          { path: '/donor/settings', icon: FiSettings, label: 'Settings' }
        ];
      case 'patient':
        return [
          { path: '/patient', icon: FiHome, label: 'Dashboard' },
          { path: '/patient/profile', icon: FiUser, label: 'My Profile' },
          { path: '/patient/search', icon: FiSearch, label: 'Search Blood' },
          { path: '/patient/requests', icon: FiList, label: 'My Requests' },
          { path: '/patient/request/new', icon: FiPlus, label: 'New Request' },
          { path: '/patient/hospitals', icon: FiPackage, label: 'Hospitals' },
          { path: '/patient/settings', icon: FiSettings, label: 'Settings' }
        ];
      case 'hospital':
        return [
          { path: '/hospital', icon: FiHome, label: 'Dashboard' },
          { path: '/hospital/profile', icon: FiUser, label: 'Profile' },
          { path: '/hospital/inventory', icon: FiDroplet, label: 'Inventory' },
          { path: '/hospital/inventory/add', icon: FiPlus, label: 'Add Stock' },
          { path: '/hospital/requests', icon: FiAlertCircle, label: 'Requests' },
          { path: '/hospital/donations', icon: FiHeart, label: 'Donations' },
          { path: '/hospital/alerts', icon: FiActivity, label: 'Alerts' },
          { path: '/hospital/settings', icon: FiSettings, label: 'Settings' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* User info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === `/${user?.role}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <FiDroplet className="text-primary-600" />
              <span>Smart Blood Bank v1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;