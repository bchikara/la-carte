// src/store/userStore.ts

import { create } from 'zustand';
import { 
    UserStore, 
    UserProfile, 
    Order, 
    UserStoreState, 
    UserOrdersFirebase
} from '../types/user.types'; 
import { auth, database } from '../config/firebaseConfig'; 
import * as userService from '../services/userService'; 
import firebase from 'firebase/compat/app'; 

const initialState: UserStoreState = {
  currentUser: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: true, 
  error: null,
  isAdmin: null,
  userOrders: [], 
  isLoadingUserOrders: false,
  errorUserOrders: null,
};

const activeStoreListeners: { userOrders?: () => void } = {};

export const useUserStore = create<UserStore>((set, get) => ({
  ...initialState,

  setFirebaseUser: (fbUser: firebase.User | null) => {
    set({ firebaseUser: fbUser, isAuthenticated: !!fbUser, isLoading: false });
    if (fbUser) {
      get().fetchUserDetails(fbUser.uid);
      get().listenToUserOrders(); 
      localStorage.setItem('uid', fbUser.uid);
      if (fbUser.phoneNumber) {
        localStorage.setItem('number', fbUser.phoneNumber);
      }
    } else {
      set({ 
        currentUser: null, 
        isAdmin: null, 
        error: null, 
        isAuthenticated: false, 
        userOrders: [], 
        isLoadingUserOrders: false, 
        errorUserOrders: null 
      });
      get().stopListeningToUserOrders(); 
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
    } catch (err: any) {
      set({ error: err.message || 'Sign out failed.', isLoading: false });
    }
  },

  addUserDetails: async (uid: string, phone: string) => {
    set({ isLoading: true, error: null }); 
    try {
      await userService.addUserDetailsToDb(uid, phone, { displayName: phone }); // Set phone as initial display name
      await get().fetchUserDetails(uid); 
    } catch (err: any) {
      set({ error: err.message || 'Failed to add user details.', isLoading: false });
    }
  },

  updateUserProfile: async (uid: string, data: { displayName?: string; profileImageFile?: File }) => {
    if (!uid) {
        set({ error: "User not authenticated for profile update." });
        return;
    }
    set({ isLoading: true, error: null });
    try {
        let profileImageUrl: string | undefined | null = get().currentUser?.profileImageUrl; // Keep existing if not changed

        if (data.profileImageFile) {
            profileImageUrl = await userService.uploadProfileImage(uid, data.profileImageFile);
        }

        const updates: Partial<Pick<UserProfile, 'displayName' | 'profileImageUrl'>> = {};
        if (data.displayName !== undefined) {
            updates.displayName = data.displayName;
        }
        if (profileImageUrl !== undefined) { // Check undefined, as null is a valid value to clear image
            updates.profileImageUrl = profileImageUrl;
        }
        
        if (Object.keys(updates).length > 0) {
            await userService.updateUserProfileFieldsInDb(uid, updates);
        }
        
        await get().fetchUserDetails(uid); // Re-fetch to update currentUser with all changes
        set({ isLoading: false });

    } catch (err: any) {
        console.error("Error updating user profile:", err);
        set({ error: err.message || 'Failed to update profile.', isLoading: false });
    }
  },

  addUserOrder: async (uid: string, orderData: Omit<Order, 'key' | 'orderId'>) => {
    if (!uid) {
        set({ error: "User not authenticated to add order."});
        return null;
    }
    try {
      const newOrderId = await userService.addUserOrderToDb(uid, orderData);
      return newOrderId;
    } catch (err: any) {
      set({ errorUserOrders: err.message || 'Failed to add user order.' });
      return null;
    }
  },

  listenToUserOrders: () => {
    const uid = get().firebaseUser?.uid;
    if (!uid) {
      set({ userOrders: [], isLoadingUserOrders: false, errorUserOrders: "User not authenticated to fetch orders." });
      return;
    }
    get().stopListeningToUserOrders(); 
    set({ isLoadingUserOrders: true, errorUserOrders: null });
    const ordersRef = userService.getUserOrdersRef(uid); 
    const listener = ordersRef.on(
      'value',
      (snapshot) => {
        const rawOrders = snapshot.val() as UserOrdersFirebase | null; 
        if (rawOrders) {
          const processedOrders: Order[] = Object.keys(rawOrders).map(orderKey => {
            const orderVal = rawOrders[orderKey];
            return {
              key: orderKey, 
              orderId: orderKey, 
              products: orderVal.products || {}, 
              time: typeof orderVal.time === 'number' ? orderVal.time : (orderVal.orderDate as number || Date.now()), 
              totalPrice: typeof orderVal.totalPrice === 'number' ? orderVal.totalPrice : (orderVal.totalAmount || 0), 
              totalAmount: typeof orderVal.totalAmount === 'number' ? orderVal.totalAmount : 0,
              orderDate: orderVal.orderDate, 
              status: orderVal.status || 'pending',
              restaurantId: orderVal.restaurantId,
              restaurantName: orderVal.restaurantName,
              table: orderVal.table,
              paymentId: orderVal.paymentId,
              paymentStatus: orderVal.paymentStatus,
              ...orderVal, 
            };
          }).sort((a, b) => (b.time as number) - (a.time as number)); 
          set({ userOrders: processedOrders, isLoadingUserOrders: false });
        } else {
          set({ userOrders: [], isLoadingUserOrders: false });
        }
      },
      (errorObject: Error) => {
        set({ errorUserOrders: errorObject.message, isLoadingUserOrders: false, userOrders: [] });
      }
    );
    activeStoreListeners.userOrders = () => ordersRef.off('value', listener);
  },

  stopListeningToUserOrders: () => {
    activeStoreListeners.userOrders?.();
    activeStoreListeners.userOrders = undefined;
  },

  clearUserError: () => {
    set({ error: null, errorUserOrders: null });
  },

  cleanupAllListeners: () => {
    cleanupAuthListener(); 
    get().stopListeningToUserOrders();
  },
}));

let unsubscribeFromAuthStateChanged: firebase.Unsubscribe | null = null;

export const initializeAuthListener = () => {
  if (unsubscribeFromAuthStateChanged) {
    unsubscribeFromAuthStateChanged(); 
  }
  unsubscribeFromAuthStateChanged = auth.onAuthStateChanged(user => {
    useUserStore.getState().setFirebaseUser(user);
  }, (errorObject: Error) => { 
    useUserStore.getState().setFirebaseUser(null); 
  });
  return unsubscribeFromAuthStateChanged; 
};

export const cleanupAuthListener = () => {
    if (unsubscribeFromAuthStateChanged) {
        unsubscribeFromAuthStateChanged();
        unsubscribeFromAuthStateChanged = null; 
    }
};

if (typeof window !== 'undefined') { 
    initializeAuthListener();
}
