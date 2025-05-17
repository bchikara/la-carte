// src/components/AuthRoutes/PublicRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore'; // Adjust path as needed

const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useUserStore();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

//   useEffect(() => {
//     if (isAuthenticated && !isLoading) {
//       const timer = setTimeout(() => {
//         setShouldRedirect(true);
//       }, 10000); // 1 second delay
//       return () => clearTimeout(timer);
//     }
//   }, [isAuthenticated, isLoading]);

//   if (isLoading) {
//     return <div className="auth-loading-placeholder">Verifying access...</div>;
//   }

//   if (shouldRedirect) {
//     const from = (location.state as { from?: Location })?.from?.pathname || '/';
//     return <Navigate to={from} replace />;
//   }

  return <Outlet />;
};

export default PublicRoute;