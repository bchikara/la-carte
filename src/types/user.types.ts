// src/types/user.types.ts
import firebase from 'firebase/compat/app'; // For firebase.User type

/**
 * Interface for a product within an order.
 * This should align with how products are structured when an order is created/fetched.
 */
export interface OrderProduct {
  productId: string; // ID of the product
  name: string;      // Name of the product
  quantity: number;
  price: number;     // Price per unit at the time of order
  veg?: boolean | string; 
  [key: string]: any;
}

/**
 * Interface for a single Order.
 */
export interface Order {
  key: string; // Firebase key of the order, now required
  orderId: string; // Unique identifier for the order (can be same as Firebase key)
  products: Record<string, OrderProduct>; // Products keyed by their original productKey/ID
  time: number; // Timestamp of the order
  totalAmount: number; // This should be the final amount paid, including any taxes at the time of order
  totalPrice: number; // If different from totalAmount, clarify. Assuming this is the final price.
  orderDate: string | number; // Can be ISO string or timestamp
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'pending_payment'; 
  restaurantId: string;
  restaurantName?: string;
  table?: string; // Table number or identifier like 'Takeaway/Delivery'
  paymentId?: string;
  paymentStatus?: string;
  [key: string]: any; 
}

/**
 * Interface for the structure of user's orders as stored in Firebase.
 * Keys are order IDs (Firebase push keys).
 */
export interface UserOrdersFirebase {
  [orderId: string]: Omit<Order, 'key' | 'orderId'>; 
}

/**
 * Interface for the User object stored in Firebase and in the Zustand store.
 */
export interface UserProfile {
  key: string; // Corresponds to Firebase UID
  isAdmin: boolean;
  restaurantId: string | null; 
  phone: string; // Typically not editable by user directly after verification
  orders?: UserOrdersFirebase; 
  displayName?: string | null;
  email?: string | null; // Email might also be from Firebase Auth, can be part of profile
  profileImageUrl?: string | null; // URL for the user's profile image
  [key: string]: any;
}

/**
 * Interface for the Zustand store's state related to the user.
 */
export interface UserStoreState {
  currentUser: UserProfile | null;
  firebaseUser: firebase.User | null; 
  isAuthenticated: boolean;
  isLoading: boolean; 
  error: string | null; 
  isAdmin: boolean | null; 
  
  userOrders: Order[]; 
  isLoadingUserOrders: boolean;
  errorUserOrders: string | null;
}

/**
 * Interface for the Zustand store's actions related to the user.
 */
export interface UserStoreActions {
  setFirebaseUser: (user: firebase.User | null) => void;
  fetchUserDetails: (uid: string) => Promise<void>;
  setUserDetails: (details: UserProfile | null) => void; // For direct setting if needed
  signOutUser: () => Promise<void>;
  addUserDetails: (uid: string, phone: string) => Promise<void>; // For initial setup
  updateUserProfile: (uid: string, data: { displayName?: string; profileImageFile?: File }) => Promise<void>; // For profile updates
  addUserOrder: (uid: string, orderData: Omit<Order, 'key' | 'orderId'>) => Promise<string | null>; 
  clearUserError: () => void;
  
  listenToUserOrders: () => void;
  stopListeningToUserOrders: () => void;
  cleanupAllListeners?: () => void; 
}

/**
 * Combined interface for the Zustand User store (state & actions).
 */
export type UserStore = UserStoreState & UserStoreActions;
