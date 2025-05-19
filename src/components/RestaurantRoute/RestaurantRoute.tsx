// src/components/AuthRoutes/AdminRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useUserStore } from '../../store/userStore'; // Adjust path as needed

const AdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading, currentUser } = useUserStore();
  const location = useLocation();
  const { restaurantId: routeRestaurantId } = useParams<{ restaurantId?: string }>(); // Get restaurantId from route params

  if (isLoading) {
    return <div className="auth-loading-placeholder">Verifying admin access...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is an admin and if their restaurantId matches the route's restaurantId
  if (!currentUser?.isAdmin) {
    console.warn("AdminRoute: User is not an admin.");
    return <Navigate to="/" state={{ error: "Access Denied: Not an admin." }} replace />;
  }
  
  // If routeRestaurantId is present, ensure it matches the admin's restaurantId
  if (routeRestaurantId && currentUser.restaurantId !== routeRestaurantId) {
    console.warn(`AdminRoute: Mismatch restaurantId. User: ${currentUser.restaurantId}, Route: ${routeRestaurantId}`);
    return <Navigate to="/" state={{ error: "Access Denied: Invalid restaurant." }} replace />;
  }
  
  // If no routeRestaurantId is provided in the path, but user is admin,
  // and they have a restaurantId, redirect them to their specific restaurant dashboard.
  // This handles cases like a generic /admin route.
  if (!routeRestaurantId && currentUser.restaurantId) {
    return <Navigate to={`/admin/restaurant/${currentUser.restaurantId}/`} replace />;
  }
  
  // If user is admin and (routeRestaurantId matches OR no routeRestaurantId and no user.restaurantId (edge case for super admin?))
  return <Outlet />; 
};

export default AdminRoute;
