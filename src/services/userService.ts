// src/services/userService.ts

import { auth, database } from '../config/firebaseConfig'; // Removed 'storage' as it's not used in this file
import { UserProfile, Order, UserOrders } from '../types/user.types'; // Ensure UserOrders is imported if used
import firebase from 'firebase/compat/app'; // For firebase.database.ServerValue

const usersRef = database.ref('/users');

/**
 * Gets the current Firebase authenticated user's UID.
 * Prefers the live user object, falls back to localStorage if needed (e.g., during initial load).
 */
export const getCurrentUserId = (): string | null => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    return currentUser.uid;
  }
  // Fallback, though relying on auth.onAuthStateChanged is better for live UID
  return localStorage.getItem('uid');
};

/**
 * Fetches user details from Firebase Realtime Database.
 */
export const fetchUserDetailsFromDb = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snapshot = await usersRef.child(uid).once('value');
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error; // Re-throw to be caught by the store action
  }
};

/**
 * Signs out the current user.
 */
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
    // Clearing localStorage is now primarily handled in the store's setFirebaseUser(null)
    // but can be kept here as a defensive measure if this service is called directly elsewhere.
    localStorage.removeItem('uid');
    localStorage.removeItem('number');
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Adds or updates user details in Firebase Realtime Database.
 * This is typically called after user signs up or when updating profile.
 */
export const addUserDetailsToDb = async (uid: string, phone: string, details?: Partial<UserProfile>): Promise<void> => {
  try {
    const userProfileData: UserProfile = {
      key: uid,
      isAdmin: details?.isAdmin || false,
      restaurantId: details?.restaurantId || '', // Ensure it's an empty string if not provided
      phone: phone,
      orders: details?.orders || {},
      displayName: auth.currentUser?.displayName || details?.displayName || null,
      email: auth.currentUser?.email || details?.email || null,
      ...details, // Spread last to allow overriding default/auth values
    };
    await usersRef.child(uid).update(userProfileData);
  } catch (error) {
    console.error("Error adding/updating user details:", error);
    throw error;
  }
};

/**
 * Adds a new order to a user's profile in Firebase.
 */
export const addUserOrderToDb = async (uid: string, orderData: Omit<Order, 'orderId'>): Promise<string | null> => {
  try {
    const newOrderRef = usersRef.child(uid).child('orders').push();
    const newOrderId = newOrderRef.key;

    if (!newOrderId) {
      throw new Error("Failed to get new order key from Firebase.");
    }

    // TypeScript error TS2739: "Type '{ orderId: string; }' is missing properties..."
    // usually occurs here if the 'orderData' argument (type Omit<Order, 'orderId'>)
    // being passed to this function is incomplete.
    // Ensure that the object passed as 'orderData' from the calling code (e.g., userStore action)
    // actually contains all required fields of an Order (like items, totalAmount, orderDate, status).
    const fullOrderData: Order = {
        orderId: newOrderId,
        // Set default values if not provided
        orderDate: orderData.orderDate || firebase.database.ServerValue.TIMESTAMP,
        status: orderData.status || 'pending',
        // These should be required in the orderData parameter
        items: orderData.items,
        totalAmount: orderData.totalAmount
    };

    await newOrderRef.set(fullOrderData);
    return newOrderId;
  } catch (error) {
    console.error("Error adding order to user details:", error);
    throw error;
  }
};

/**
 * Fetches all orders for a given user.
 * Note: For large numbers of orders, consider pagination or more specific queries.
 */
export const fetchUserOrdersFromDb = async (uid: string): Promise<UserOrders | null> => {
  try {
    const snapshot = await usersRef.child(uid).child('orders').once('value');
    if (snapshot.exists()) {
      return snapshot.val() as UserOrders;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

/**
 * Retrieves the user's phone number stored in localStorage.
 * This is generally a fallback; prefer getting phone from auth.currentUser.phoneNumber or UserProfile.
 */
export const getUserPhoneNumberFromStorage = (): string | null => {
  const value = localStorage.getItem('number');
  if (value) {
    // Basic cleaning, ensure it matches expected format or logic
    return value.replace(/\D/g, '').slice(-10);
  }
  return null;
};
