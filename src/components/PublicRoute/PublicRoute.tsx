// src/components/AuthRoutes/PublicRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore'; // Adjust path as needed

const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useUserStore();
  const location = useLocation();

  if (isLoading) {
    // Optional: Show a loading spinner or a blank page
    return <div className="auth-loading-placeholder">Verifying access...</div>;
  }

//   if (isAuthenticated) {
//     // User is authenticated, redirect away from public-only routes (e.g., login)
//     // Redirect to the page they came from if available, otherwise to home.
//     const from = (location.state as { from?: Location })?.from?.pathname || '/';
//     return <Navigate to={from} replace />;
//   }

  return <Outlet />; // User is not authenticated, render the child route elements (e.g., Login page)
};

export default PublicRoute;
