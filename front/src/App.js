import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import About from './components/about';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './components/AdminDashboard';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import PendingApproval from './pages/PendingApproval';

// ✅ ProtectedRoute for donors/recipients
const ProtectedRoute = ({ children, requiredUserType }) => {
  const [userType, setUserType] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = () => {
      const token = sessionStorage.getItem('authToken');
      const type = sessionStorage.getItem('userType');
      if (isMounted) {
        setUserType(type || '');
        setIsAuthenticated(!!token);
        setLoading(false);
      }
    };
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// ✅ Admin-only route using localStorage
const PrivateAdminRoute = ({ element: Element }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.isAdmin;

  if (!token || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Element />;
};

// ✅ Unauthorized access page
const Unauthorized = () => <h2>403 - Unauthorized</h2>;

// ✅ App Component
const App = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/pendingapproval" element={<PendingApproval />} />
      <Route
        path="/admin"
        element={<PrivateAdminRoute element={AdminDashboard} />}
      />
      <Route
        path="/donor-dashboard"
        element={
          <ProtectedRoute requiredUserType="donor">
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipient-dashboard"
        element={
          <ProtectedRoute requiredUserType="recipient">
            <RecipientDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  </Router>
);

export default App;
