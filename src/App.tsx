// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Snackbar from './components/Snackbar/Snackbar';

import Home from './pages/Home/Home';
import BusinessSite from './pages/BusinessSite/BusinessSite';
import Contact from './pages/Contact/Contact';
import Term from './pages/Term/Term';
import Refund from './pages/Refund/Refund';
import Privacy from './pages/Privacy/Privacy';
import Order from './pages/Explore/Explore';
import Scanner from './pages/Scanner/Scanner';
import Menu from './pages/Menu/Menu';
import Login from './pages/Login/Login';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PublicRoute from './components/PublicRoute/PublicRoute';

import { initializeAuthListener, cleanupAuthListener, useUserStore } from './store/userStore';
import Cart from './pages/Cart/Cart';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import AdminRoute from './components/RestaurantRoute/RestaurantRoute';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminMenuEditorPage from './pages/MenuEditor/MenuEditor';
import Confirm from './pages/Confirm/Confirm';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminLayout from './components/Admin/AdminLayout';
import AdminAnalyticsPage from './pages/Admin/AdminAnalyticsPage';
import AdminRestaurantSettingsPage from './pages/Admin/AdminRestaurantSettingsPage';

function App() {
  // Initialize Firebase auth listener when App mounts
  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    // Cleanup listener when App unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      // You can also call a more general cleanup for all store listeners if needed
      // cleanupAuthListener(); // This specific one might be for the auth listener only
      useUserStore.getState().cleanupAllListeners?.(); // If you have a general cleanup in userStore
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<BusinessSite />} /> {/* Assuming this is public */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms-and-condition" element={<Term />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/explore" element={<Order />} /> {/* Restaurant listing page */}
          
          {/* Public Only Routes (e.g., Login) */}
          <Route path="/login" element={<PublicRoute />}>
            <Route index element={<Login />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/scanner" element={<ProtectedRoute />}>
            <Route index element={<Scanner />} />
          </Route>
          <Route path="/menu/:id" element={<ProtectedRoute />}>
            <Route index element={<Menu />} />
          </Route>
          <Route path="/cart/:id" element={<ProtectedRoute />}>
            <Route index element={<Cart />} />
          </Route>


          <Route path="/profile" element={<ProtectedRoute />}>
            <Route index element={<Profile />} />
          </Route>


          <Route path="/my-orders" element={<ProtectedRoute />}>
            <Route index element={<Orders />} />
          </Route>

          <Route path="/confirm/:restaurantId" element={<ProtectedRoute />}>
            <Route index element={<Confirm />} />
          </Route>

          <Route path="/admin/restaurant/:restaurantId" element={<AdminRoute />}>
            {/* Default route (dashboard) when no sub-path is specified */}
            <Route index element={<AdminDashboardPage />} />

            {/* Other nested routes */}
            <Route path="menu" element={<AdminMenuEditorPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminRestaurantSettingsPage />} />
          </Route>


         

          {/* Fallback for non-matched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
        <Snackbar />
      </BrowserRouter>
    </>
  );
}

export default App;
