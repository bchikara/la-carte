// src/types/cart.types.ts
import { Product } from './restaurant.types'; // Assuming Product type is in restaurant.types.ts

/**
 * Interface for a single item in the cart.
 * It's derived from a Product, but quantity is managed by the cart.
 * 'key' from Product becomes 'productKey' in CartItem to avoid conflict if CartItem itself has a 'key'.
 */
export interface CartItem {
  productKey: string; // Original product's key (from Product.key)
  name: string;
  price: number;
  icon?: string; // Optional product image URL
  // Add any other properties from Product that you want to store directly in the cart item
  // For example, if 'veg' status is important for display in cart:
  // veg?: boolean; 
  quantity: number;
}

/**
 * Interface for the structure of the cart state.
 * The cart will be an object where keys are product keys (productKey) and values are CartItem objects.
 */
export interface CartStateShape {
  [productKey: string]: CartItem;
}

/**
 * Interface for the Zustand store's state.
 */
export interface CartStoreState {
  cart: CartStateShape;
  totalItems: number; // Total number of individual items (sum of quantities)
  isCartInitialized: boolean; 
}

/**
 * Interface for the Zustand store's actions.
 * The item passed to addToCart will be the Product object.
 */
export interface CartStoreActions {
  initializeCart: () => void; 
  addToCart: (product: Product) => void; // Takes a Product object
  removeFromCart: (productKey: string) => void; // Removes one instance, or item if quantity becomes 0
  getCartItemQuantity: (productKey: string) => number; 
  isCartEmpty: () => boolean; 
  deleteCartItem: (productKey: string) => void; // Removes item entirely regardless of quantity
  clearCart: () => void;
  getCartTotalAmount: () => number; // Calculates total price of items in cart
}

/**
 * Combined interface for the Zustand store (state & actions).
 */
export type CartStore = CartStoreState & CartStoreActions;
