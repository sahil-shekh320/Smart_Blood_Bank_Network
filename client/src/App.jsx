import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Loading from './components/Loading';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRequests from './pages/admin/Requests';
import AdminInventory from './pages/admin/Inventory';

// Donor Pages
import DonorDashboard from './pages/donor/Dashboard';
import DonorProfile from './pages/donor/Profile';
import DonorDonations from './pages/donor/Donations';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientProfile from './pages/patient/Profile';
import PatientSearch from './pages/patient/Search';
import PatientRequests from './pages/patient/Requests';
import NewRequest from './pages/patient/NewRequest';

// Hospital Pages
import HospitalDashboard from './pages/hospital/Dashboard';
import HospitalProfile from './pages/hospital/Profile';
import HospitalInventory from './pages/hospital/Inventory';
import HospitalRequests from './pages/hospital/Requests';
import AddInventory from './pages/hospital/AddInventory';

function App() {
  const { loading, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="large" text="Loading..." />
      </div>
    );
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex">
        {isAuthenticated && (
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        )}
        
        <main className={`flex-1 ${isAuthenticated ? 'lg:ml-0' : ''}`}>
          <div className={`${isAuthenticated ? 'p-4 lg:p-6' : ''}`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to={`/${localStorage.getItem('userRole') || 'donor'}`} replace /> : <Login />} 
              />
              <Route 
                path="/register" 
                element={isAuthenticated ? <Navigate to={`/${localStorage.getItem('userRole') || 'donor'}`} replace /> : <Register />} 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="requests" element={<AdminRequests />} />
                      <Route path="inventory" element={<AdminInventory />} />
                    </Routes>
                  </ProtectedRoute>
                } 
              />

              {/* Donor Routes */}
              <Route 
                path="/donor/*" 
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <Routes>
                      <Route index element={<DonorDashboard />} />
                      <Route path="profile" element={<DonorProfile />} />
                      <Route path="donations" element={<DonorDonations />} />
                    </Routes>
                  </ProtectedRoute>
                } 
              />

              {/* Patient Routes */}
              <Route 
                path="/patient/*" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Routes>
                      <Route index element={<PatientDashboard />} />
                      <Route path="profile" element={<PatientProfile />} />
                      <Route path="search" element={<PatientSearch />} />
                      <Route path="requests" element={<PatientRequests />} />
                      <Route path="request/new" element={<NewRequest />} />
                    </Routes>
                  </ProtectedRoute>
                } 
              />

              {/* Hospital Routes */}
              <Route 
                path="/hospital/*" 
                element={
                  <ProtectedRoute allowedRoles={['hospital']}>
                    <Routes>
                      <Route index element={<HospitalDashboard />} />
                      <Route path="profile" element={<HospitalProfile />} />
                      <Route path="inventory" element={<HospitalInventory />} />
                      <Route path="inventory/add" element={<AddInventory />} />
                      <Route path="requests" element={<HospitalRequests />} />
                    </Routes>
                  </ProtectedRoute>
                } 
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;