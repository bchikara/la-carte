/**
 * Interface for a single Order.
 * Define the properties of an order object.
 */
export interface Order {
    orderId: string; // Or some unique identifier for the order
    items: Array<{ productId: string; quantity: number; price: number }>;
    totalAmount: number;
    orderDate: string; // Or Date object, consider ISO string for storage
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    // Add any other order-specific properties
    [key: string]: any; // Allow other dynamic properties if needed
  }
  
  /**
   * Interface for the structure of user's orders in Firebase.
   * Orders might be stored as an object where keys are order IDs.
   */
  export interface UserOrders {
    [orderId: string]: Order;
  }
  
  /**
   * Interface for the User object stored in Firebase and in the Zustand store.
   */
  export interface UserProfile {
    key: string; // Corresponds to Firebase UID
    isAdmin: boolean;
    restaurantId: string | null; // Can be null if not applicable
    phone: string;
    orders?: UserOrders; // Optional, as it might be loaded separately or might not exist
    // Add any other user-specific properties like name, email (if collected)
    displayName?: string | null;
    email?: string | null;
  }
  
  /**
   * Interface for the Zustand store's state related to the user.
   */
  export interface UserStoreState {
    currentUser: UserProfile | null;
    firebaseUser: firebase.default.User | null; // To store the raw Firebase user object
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isAdmin: boolean | null; // Derived from currentUser, but can be a quick access state
  }
  
  /**
   * Interface for the Zustand store's actions related to the user.
   */
  export interface UserStoreActions {
    setFirebaseUser: (user: firebase.default.User | null) => void;
    fetchUserDetails: (uid: string) => Promise<void>;
    setUserDetails: (details: UserProfile | null) => void;
    signOutUser: () => Promise<void>;
    addUserDetails: (uid: string, phone: string) => Promise<void>;
    addUserOrder: (uid: string, orderData: Omit<Order, 'orderId'>) => Promise<string | null>; // Returns new order ID or null
    clearUserError: () => void;
    // Potentially more actions like updateUserProfile, listenToUserOrders, etc.
  }
  
  /**
   * Combined interface for the Zustand User store (state & actions).
   */
  export type UserStore = UserStoreState & UserStoreActions;
  