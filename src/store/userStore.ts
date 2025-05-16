// src/store/userStore.ts

import { create } from 'zustand';
import { UserStore, UserProfile, Order } from '../types/user.types';
import { auth } from '../config/firebaseConfig'; // Adjust path as needed
import * as userService from '../services/userService'; // Assuming userService.ts is in ../services/
import firebase from 'firebase/compat/app'; // For firebase.User type

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial State
  currentUser: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: true, // Start as true until auth state is confirmed
  error: null,
  isAdmin: null,

  // Actions
  setFirebaseUser: (fbUser: firebase.User | null) => {
    set({ firebaseUser: fbUser, isAuthenticated: !!fbUser, isLoading: false });
    if (fbUser) {
      // User is signed in, fetch their profile details
      get().fetchUserDetails(fbUser.uid);
      // Store UID in localStorage for potential fallback (though live auth state is preferred)
      localStorage.setItem('uid', fbUser.uid);
      if (fbUser.phoneNumber) { // Store phone number if available from Firebase Auth
        localStorage.setItem('number', fbUser.phoneNumber);
      }
    } else {
      // User is signed out
      set({ currentUser: null, isAdmin: null, error: null });
      localStorage.removeItem('uid');
      localStorage.removeItem('number');
    }
  },

  fetchUserDetails: async (uid: string) => {
    if (!uid) {
        set({ currentUser: null, isAdmin: null, isLoading: false });
        return;
    }
    set({ isLoading: true, error: null });
    try {
      const userDetails = await userService.fetchUserDetailsFromDb(uid);
      set({
        currentUser: userDetails,
        isAdmin: userDetails?.isAdmin || false,
        isLoading: false,
      });
    } catch (err: any) {
      console.error("Error in fetchUserDetails action:", err);
      set({ error: err.message || 'Failed to fetch user details.', isLoading: false, currentUser: null, isAdmin: null });
    }
  },

  setUserDetails: (details: UserProfile | null) => {
    set({
        currentUser: details,
        isAdmin: details?.isAdmin || false,
    });
  },

  signOutUser: async () => {
    set({ isLoading: true });
    try {
      await userService.signOut();
      // The onAuthStateChanged listener (setup below) will handle clearing firebaseUser and currentUser
      // No need to call setFirebaseUser(null) here if onAuthStateChanged is active
    } catch (err: any) {
      console.error("Error in signOutUser action:", err);
      set({ error: err.message || 'Sign out failed.', isLoading: false });
    }
  },

  addUserDetails: async (uid: string, phone: string) => {
    set({ isLoading: true, error: null });
    try {
      await userService.addUserDetailsToDb(uid, phone);
      // Optionally re-fetch user details or update local state optimistically
      await get().fetchUserDetails(uid); // Re-fetch to ensure consistency
    } catch (err: any) {
      console.error("Error in addUserDetails action:", err);
      set({ error: err.message || 'Failed to add user details.', isLoading: false });
    }
  },

  addUserOrder: async (uid: string, orderData: Omit<Order, 'orderId'>) => {
    if (!uid) {
        set({ error: "User not authenticated to add order."});
        return null;
    }
    set({ isLoading: true, error: null });
    try {
      const newOrderId = await userService.addUserOrderToDb(uid, orderData);
      // Optionally, re-fetch user details/orders or update optimistically
      await get().fetchUserDetails(uid); // Re-fetch to update orders in profile
      set({ isLoading: false });
      return newOrderId;
    } catch (err: any) {
      console.error("Error in addUserOrder action:", err);
      set({ error: err.message || 'Failed to add order.', isLoading: false });
      return null;
    }
  },

  clearUserError: () => {
    set({ error: null });
  },
}));

// Listen to Firebase Auth state changes and update the store accordingly
// This is crucial for keeping the app's auth state in sync.
// This should be called once when your application initializes.
let unsubscribeFromAuthStateChanged: firebase.Unsubscribe | null = null;

export const initializeAuthListener = () => {
  if (unsubscribeFromAuthStateChanged) {
    unsubscribeFromAuthStateChanged(); // Unsubscribe from previous listener if any
  }
  unsubscribeFromAuthStateChanged = auth.onAuthStateChanged(user => {
    useUserStore.getState().setFirebaseUser(user);
  }, error => {
    console.error("Auth state listener error:", error);
    useUserStore.getState().setFirebaseUser(null); // Ensure state is cleared on error
    useUserStore.getState().error = "Authentication listener failed.";
  });
  return unsubscribeFromAuthStateChanged;
};

// Call this when your app unmounts or is about to close, if necessary.
export const cleanupAuthListener = () => {
    if (unsubscribeFromAuthStateChanged) {
        unsubscribeFromAuthStateChanged();
    }
};

// Automatically initialize the auth listener when the store module is loaded.
// This ensures that as soon as the app starts, it begins listening for auth changes.
if (typeof window !== 'undefined') { // Ensure this runs only in the browser
    initializeAuthListener();
}
