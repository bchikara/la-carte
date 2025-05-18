// src/types/user.types.ts
import firebase from 'firebase/compat/app'; // For firebase.User type

/**
 * Interface for a product within an order from a user's perspective.
 */
export interface OrderProduct {
  productId: string; // ID of the product in the restaurant's menu
  name: string;      // Denormalized product name
  quantity: number;
  price: number;     // Price per unit at the time of order
  veg?: boolean | string; // Veg status, might be string from Firebase
  // Add any other relevant product details you store with the user's order item
  [key: string]: any;
}

/**
 * Interface for a single Order from a user's perspective.
 */
export interface Order {
  key: string; // Firebase key of the order in the user's order list
  orderId: string; // Often the same as 'key', or a more global order identifier
  
  // If products are stored directly under the user's order:
  products: Record<string, OrderProduct>; // Products keyed by their original productKey/ID from restaurant menu
  // OR, if you only store product IDs and quantities and fetch details separately:
  // items: Array<{ productId: string; quantity: number; priceAtOrder: number; name?: string }>;

  time: number; // Timestamp of when the order was placed
  totalPrice: number; // Final total price paid by the user for this order
  totalAmount: number; // Often same as totalPrice, clarify if different (e.g., pre-discount)
  
  orderDate: string | number; // Can be ISO string or timestamp (redundant if 'time' is used)
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'pending_payment'; 
  
  restaurantId: string; // ID of the restaurant the order was placed with
  restaurantName?: string; // Denormalized for easy display
  table?: string; // Table number or identifier like 'Takeaway/Delivery'
  
  paymentId?: string;
  paymentStatus?: string;
  // Add any other order-specific properties relevant to the user
  [key: string]: any; 
}

/**
 * Interface for the structure of user's orders as stored in Firebase under their profile.
 * Keys are order IDs (Firebase push keys).
 */
export interface UserOrdersFirebase {
  [orderId: string]: Omit<Order, 'key' | 'orderId'>; // Raw order data doesn't have 'key'/'orderId' as its own property here
}

/**
 * Interface for the User object stored in Firebase and in the Zustand store.
 */
export interface UserProfile {
  key: string; // Corresponds to Firebase UID
  isAdmin: boolean;
  restaurantId: string | null; 
  phone: string; 
  orders?: UserOrdersFirebase; // Raw orders from Firebase, keys are order IDs
  displayName?: string | null;
  email?: string | null; 
  profileImageUrl?: string | null;
  [key: string]: any;
}

/**
 * Interface for the Zustand store's state related to the user.
 */
export interface UserStoreState {
  currentUser: UserProfile | null;
  firebaseUser: firebase.User | null; 
  isAuthenticated: boolean;
  isLoading: boolean; // General loading for user profile and auth state
  error: string | null; // General error
  isAdmin: boolean | null; 
  
  userOrders: Order[]; // Processed list of orders for display (with 'key' property)
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
  updateUserProfile: (uid: string, data: { displayName?: string; profileImageFile?: File }) => Promise<void>;
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
