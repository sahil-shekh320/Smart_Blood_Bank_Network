import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" text="Authenticating..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes = {
      admin: '/admin',
      donor: '/donor',
      patient: '/patient',
      hospital: '/hospital'
    };
    return <Navigate to={dashboardRoutes[user?.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;