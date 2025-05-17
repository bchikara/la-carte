// src/services/userService.ts

import { auth, database, storage } from '../config/firebaseConfig'; // Ensure storage is imported
import { UserProfile, Order, UserOrdersFirebase, OrderProduct } from '../types/user.types'; 
import firebase from 'firebase/compat/app'; 

const usersRef = database.ref('/users');
const profileImagesRef = storage.ref('profileImages'); // Base path for profile images

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
    return snapshot.exists() ? { key: snapshot.key, ...snapshot.val() } as UserProfile : null;
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
 * Typically for initial setup.
 */
export const addUserDetailsToDb = async (uid: string, phone: string, details?: Partial<UserProfile>): Promise<void> => {
  try {
    const userProfileData: UserProfile = {
      key: uid, 
      isAdmin: details?.isAdmin || false,
      restaurantId: details?.restaurantId || null,
      phone: phone,
      orders: details?.orders || {}, 
      displayName: auth.currentUser?.displayName || details?.displayName || phone, // Default display name to phone if not available
      email: auth.currentUser?.email || details?.email || null,
      profileImageUrl: details?.profileImageUrl || null,
      ...details,
    };
    await usersRef.child(uid).set(userProfileData); // Use set for initial creation to ensure all base fields
  } catch (error) {
    console.error("Error adding/updating user details:", error);
    throw error;
  }
};

/**
 * Uploads a profile image for a user to Firebase Storage.
 * @param uid - The user's ID.
 * @param file - The image file to upload.
 * @returns A promise that resolves to the download URL of the uploaded image.
 */
export const uploadProfileImage = async (uid: string, file: File): Promise<string> => {
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
 * Updates specific fields (displayName, profileImageUrl) in the user's profile in Firebase Realtime Database.
 * @param uid - The user's ID.
 * @param dataToUpdate - An object containing displayName and/or profileImageUrl.
 */
export const updateUserProfileFieldsInDb = async (
    uid: string, 
    dataToUpdate: Partial<Pick<UserProfile, 'displayName' | 'profileImageUrl'>>
): Promise<void> => {
    try {
        if (Object.keys(dataToUpdate).length === 0) {
            console.warn("updateUserProfileFieldsInDb called with no data to update.");
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
 */
export const addUserOrderToDb = async (uid: string, orderData: Omit<Order, 'key' | 'orderId'>): Promise<string | null> => {
  try {
    const newOrderRef = usersRef.child(uid).child('orders').push();
    const newOrderId = newOrderRef.key;

    if (!newOrderId) {
      throw new Error("Failed to get new order key from Firebase.");
    }
    const fullOrderData: Order = {
      key: newOrderId, 
      orderId: newOrderId, 
      products: orderData.products, 
      time: orderData.time,         
      totalPrice: orderData.totalPrice, 
      totalAmount: orderData.totalAmount, 
      orderDate: orderData.orderDate, 
      status: orderData.status || 'pending',
      restaurantId: orderData.restaurantId, 
      restaurantName: orderData.restaurantName,
      table: orderData.table,
      paymentId: orderData.paymentId,
      paymentStatus: orderData.paymentStatus,
      ...(orderData as Partial<Order>), 
    };
    await newOrderRef.set(fullOrderData);
    return newOrderId;
  } catch (error) {
    console.error("Error adding order to user details:", error);
    throw error;
  }
};

/**
 * Fetches all orders for a given user from Firebase.
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
