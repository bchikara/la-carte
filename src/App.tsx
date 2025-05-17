// src/App.tsx
import React, { useEffect } from 'react'; // Added React for JSX
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Snackbar from './components/Snackbar/Snackbar';

// Page Imports
import Home from './pages/Home/Home';
import BusinessSite from './pages/BusinessSite/BusinessSite';
import Contact from './pages/Contact/Contact';
import Term from './pages/Term/Term';
import Refund from './pages/Refund/Refund';
import Privacy from './pages/Privacy/Privacy';
import Order from './pages/Order/Order'; // This is the "Explore" page for restaurants
import Scanner from './pages/Scanner/Scanner';
import Menu from './pages/Menu/Menu';
import Login from './pages/Login/Login';
// Placeholder for ProfilePage and AdminDashboard - you'll need to create these
// const ProfilePage = () => <div>User Profile Page (Protected)</div>; 
// const AdminDashboard = () => <div>Admin Dashboard (Protected & Admin Only)</div>; 

// Auth Route Wrappers
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PublicRoute from './components/PublicRoute/PublicRoute';

// User Store for auth state listener initialization
import { initializeAuthListener, cleanupAuthListener, useUserStore } from './store/userStore';
import Cart from './pages/Cart/Cart';


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
