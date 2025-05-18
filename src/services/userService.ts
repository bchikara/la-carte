// src/services/userService.ts

import { auth, database, storage } from '../config/firebaseConfig'; // Ensure storage is imported if used by other functions
import { UserProfile, Order, UserOrdersFirebase, OrderProduct } from '../types/user.types'; 
import firebase from 'firebase/compat/app'; 

const usersRef = database.ref('/users');
// const profileImagesRef = storage.ref('profileImages'); // Keep if uploadProfileImage is used

/**
 * Gets the current Firebase authenticated user's UID.
 */
export const getCurrentUserId = (): string | null => {
  const currentUser = auth.currentUser;
  return currentUser ? currentUser.uid : localStorage.getItem('uid');
};

/**
 * Fetches user details from Firebase Realtime Database.
 */
export const fetchUserDetailsFromDb = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snapshot = await usersRef.child(uid).once('value');
    return snapshot.exists() ? { key: snapshot.key!, ...snapshot.val() } as UserProfile : null;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

/**
 * Signs out the current user.
 */
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
    localStorage.removeItem('uid');
    localStorage.removeItem('number');
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Adds or updates user details in Firebase Realtime Database.
 */
export const addUserDetailsToDb = async (uid: string, phone: string, details?: Partial<UserProfile>): Promise<void> => {
  try {
    const userProfileData: UserProfile = {
      key: uid, 
      isAdmin: details?.isAdmin || false,
      restaurantId: details?.restaurantId || null,
      phone: phone,
      orders: details?.orders || {}, 
      displayName: auth.currentUser?.displayName || details?.displayName || phone,
      email: auth.currentUser?.email || details?.email || null,
      profileImageUrl: details?.profileImageUrl || null,
      ...details,
    };
    await usersRef.child(uid).set(userProfileData); 
  } catch (error) {
    console.error("Error adding/updating user details:", error);
    throw error;
  }
};

/**
 * Uploads a profile image for a user to Firebase Storage.
 */
export const uploadProfileImage = async (uid: string, file: File): Promise<string> => {
    const profileImagesRef = storage.ref('profileImages'); // Define here or ensure it's accessible
    try {
        const fileRef = profileImagesRef.child(`${uid}/${file.name}_${Date.now()}`);
        const snapshot = await fileRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
    } catch (error) {
        console.error("Error uploading profile image:", error);
        throw error;
    }
};

/**
 * Updates specific fields in the user's profile in Firebase Realtime Database.
 */
export const updateUserProfileFieldsInDb = async (
    uid: string, 
    dataToUpdate: Partial<Pick<UserProfile, 'displayName' | 'profileImageUrl'>>
): Promise<void> => {
    try {
        if (Object.keys(dataToUpdate).length === 0) {
            return;
        }
        await usersRef.child(uid).update(dataToUpdate);
    } catch (error) {
        console.error("Error updating user profile fields:", error);
        throw error;
    }
};


/**
 * Adds a new order to a user's profile in Firebase.
 * orderData should contain all necessary fields for an Order except 'key' and 'orderId'.
 */
export const addUserOrderToDb = async (uid: string, orderData: Omit<Order, 'key' | 'orderId'>): Promise<string | null> => {
  try {
    const newOrderRef = usersRef.child(uid).child('orders').push();
    const newOrderId = newOrderRef.key;

    if (!newOrderId) {
      throw new Error("Failed to get new order key from Firebase.");
    }

    // Construct fullOrderData ensuring all required fields from the Order type are present
    // and correctly sourced from orderData.
    const fullOrderData: Order = {
      key: newOrderId, 
      orderId: newOrderId, 
      products: orderData.products, // This must be Record<string, OrderProduct>
      time: orderData.time,         // This must be a number (timestamp)
      totalPrice: orderData.totalPrice, // This must be a number
      totalAmount: orderData.totalPrice, // This must be a number
      orderDate: orderData.time,   // This must be string | number
      status: orderData.status || 'pending',
      restaurantId: orderData.restaurantId, // This must be provided in orderData
      
      // Optional fields from orderData that are also in Order type
      restaurantName: orderData.restaurantName,
      table: orderData.table,
      paymentId: orderData.paymentId,
      paymentStatus: orderData.paymentStatus,
      // If 'items' was a mistake and 'products' is the correct field in Order type, this spread is safer.
      // Ensure orderData doesn't have conflicting 'items' if 'products' is the source of truth.
      ...(orderData as Partial<Omit<Order, 'key' | 'orderId' | 'products' | 'time' | 'totalPrice' | 'totalAmount' | 'orderDate' | 'status' | 'restaurantId'>>),
    };

    console.log('user order','adding',fullOrderData)
    await newOrderRef.set(fullOrderData);
    return newOrderId;
  } catch (error) {
    console.error("Error adding order to user details:", error);
    throw error;
  }
};

/**
 * Fetches all orders for a given user from Firebase.
 * Returns the raw structure as stored in Firebase (UserOrdersFirebase).
 */
export const fetchUserOrdersFromDb = async (uid: string): Promise<UserOrdersFirebase | null> => {
  try {
    const snapshot = await usersRef.child(uid).child('orders').once('value');
    return snapshot.exists() ? snapshot.val() as UserOrdersFirebase : null;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

export const getUserOrdersRef = (uid: string): firebase.database.Reference => {
  return usersRef.child(uid).child('orders');
};
