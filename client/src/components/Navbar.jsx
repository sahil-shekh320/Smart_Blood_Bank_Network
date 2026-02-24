import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiMenu, 
  FiX, 
  FiSun, 
  FiMoon, 
  FiUser, 
  FiLogOut, 
  FiSettings,
  FiBell 
} from 'react-icons/fi';

const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBasedRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'donor': return '/donor';
      case 'patient': return '/patient';
      case 'hospital': return '/hospital';
      default: return '/';
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {isAuthenticated && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
              >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            )}
            
            <Link to={getRoleBasedRoute()} className="flex items-center ml-2 lg:ml-0">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                  BloodBank
                </span>
              </div>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 relative">
                  <FiBell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.name}
                    </span>
                  </button>

                  {/* Dropdown menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      
                      <Link
                        to={`/${user?.role}/profile`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser className="mr-2" />
                        Profile
                      </Link>
                      
                      <Link
                        to={`/${user?.role}/settings`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiSettings className="mr-2" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FiLogOut className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;