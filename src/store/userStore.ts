// src/store/userStore.ts

import { create } from 'zustand';
// Import types from the new user.types.ts file
import { UserStore, UserProfile, Order, UserStoreActions, UserStoreState } from '../types/user.types'; 
import { auth } from '../config/firebaseConfig'; // Adjust path as needed
import * as userService from '../services/userService'; // Assuming userService.ts is in ../services/
import firebase from 'firebase/compat/app'; // For firebase.User type

// Initial state defined using the imported type
const initialState: UserStoreState = {
  currentUser: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: true, // Start as true until auth state is confirmed
  error: null,
  isAdmin: null,
};

export const useUserStore = create<UserStore>((set, get) => ({
  ...initialState,

  // Actions
  setFirebaseUser: (fbUser: firebase.User | null) => {
    set({ firebaseUser: fbUser, isAuthenticated: !!fbUser, isLoading: false });
    if (fbUser) {
      get().fetchUserDetails(fbUser.uid);
      localStorage.setItem('uid', fbUser.uid);
      if (fbUser.phoneNumber) {
        localStorage.setItem('number', fbUser.phoneNumber);
      }
    } else {
      // When user signs out or auth state is null
      set({ currentUser: null, isAdmin: null, error: null, isAuthenticated: false }); // ensure isAuthenticated is false
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
    set({ isLoading: true }); // Indicate loading state during sign out
    try {
      await userService.signOut(); // This service function calls firebase.auth().signOut()
      // The onAuthStateChanged listener will then call setFirebaseUser(null),
      // which handles clearing local state and localStorage.
      // No need to call set({ isLoading: false }) here if setFirebaseUser handles it.
    } catch (err: any) {
      console.error("Error in signOutUser action:", err);
      set({ error: err.message || 'Sign out failed.', isLoading: false });
    }
  },

  addUserDetails: async (uid: string, phone: string) => {
    set({ isLoading: true, error: null });
    try {
      // Assuming details might be more than just phone in the future for UserProfile
      await userService.addUserDetailsToDb(uid, phone, { /* other initial details if any */ });
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
    set({ isLoading: true, error: null }); // Consider a more specific loading state if needed
    try {
      const newOrderId = await userService.addUserOrderToDb(uid, orderData);
      // After adding an order, re-fetch user details to update the user's orders list
      // This assumes orders are part of the UserProfile or fetched via fetchUserDetails.
      await get().fetchUserDetails(uid); 
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

  // Implementation for cleanupAllListeners
  cleanupAllListeners: () => {
    console.log("UserStore: cleanupAllListeners called. Cleaning up auth listener.");
    cleanupAuthListener(); // Call the specific cleanup function for the auth listener
    // If other listeners were managed by this store (e.g., in an activeListeners map),
    // they would be cleaned up here too.
  },
}));

// --- Auth Listener Management ---
// (This part remains the same as you provided)
let unsubscribeFromAuthStateChanged: firebase.Unsubscribe | null = null;

export const initializeAuthListener = () => {
  if (unsubscribeFromAuthStateChanged) {
    unsubscribeFromAuthStateChanged(); 
  }
  unsubscribeFromAuthStateChanged = auth.onAuthStateChanged(user => {
    useUserStore.getState().setFirebaseUser(user);
  }, (errorObject: Error) => { // Explicitly type errorObject
    console.error("Auth state listener error:", errorObject);
    useUserStore.getState().setFirebaseUser(null); 
    // Avoid setting error directly on the store from here, let setFirebaseUser handle it
    // or dispatch a specific error action if needed.
    // For now, setFirebaseUser(null) will clear the user state.
    // If you want to show an auth listener error:
    // set(state => ({ ...state, error: "Authentication listener failed."}));
  });
  return unsubscribeFromAuthStateChanged; // Return the unsubscribe function
};

export const cleanupAuthListener = () => {
    if (unsubscribeFromAuthStateChanged) {
        unsubscribeFromAuthStateChanged();
        unsubscribeFromAuthStateChanged = null; // Good practice to nullify after unsubscribing
        console.log("UserStore: Auth listener cleaned up.");
    }
};

// Automatically initialize the auth listener when the store module is loaded.
if (typeof window !== 'undefined') { 
    initializeAuthListener();
}
