// src/types/cart.types.ts

/**
 * Interface for a single item in the cart.
 * The 'key' property from your original item seems to be its unique identifier.
 */
export interface CartItem {
    key: string; // Unique identifier for the item
    name: string;
    price: number;
    image?: string; // Optional image URL
    // Any other properties your item might have
    [key: string]: any; // Allow other dynamic properties if needed
    quantity: number; // This will be managed by the cart
  }
  
  /**
   * Interface for the structure of the cart state.
   * The cart will be an object where keys are item keys (IDs) and values are CartItem objects.
   */
  export interface CartStateShape {
    [itemKey: string]: CartItem;
  }
  
  /**
   * Interface for the Zustand store's state.
   */
  export interface CartStoreState {
    cart: CartStateShape;
    totalItems: number;
    isCartInitialized: boolean; // To track if cart has been loaded from localStorage
  }
  
  /**
   * Interface for the Zustand store's actions.
   */
  export interface CartStoreActions {
    initializeCart: () => void; // Action to load cart from localStorage
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (itemKey: string) => void;
    getCartItemQuantity: (itemKey: string) => number; // This is a selector, could be outside actions
    isCartEmpty: () => boolean; // This is a selector, could be outside actions
    deleteCartItem: (itemKey: string) => void;
    clearCart: () => void;
  }
  
  /**
   * Combined interface for the Zustand store (state & actions).
   */
  export type CartStore = CartStoreState & CartStoreActions;
  