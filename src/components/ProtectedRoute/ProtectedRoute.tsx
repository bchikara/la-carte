// src/components/AuthRoutes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore'; // Adjust path as needed

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useUserStore();
  const location = useLocation();

  if (isLoading) {
    // Optional: Show a loading spinner or a blank page while checking auth state
    // This prevents a flicker if auth state is still being determined.
    return <div className="auth-loading-placeholder">Verifying access...</div>;
  }

//   if (!isAuthenticated) {
//     // User not authenticated, redirect to login page
//     // Save the current location they were trying to go to in location state
//     // so we can send them along after they login.
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

  return <Outlet />; // User is authenticated, render the child route elements
};

export default ProtectedRoute;
