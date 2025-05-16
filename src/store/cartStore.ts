// src/store/cartStore.ts

import { create } from 'zustand';
import { CartStore, CartStateShape, CartItem } from '../types/cart.types'; // Adjust path as needed
import { Product } from '../types/restaurant.types'; // Adjust path to your restaurant types
import * as cartService from '../services/cartService'; // Adjust path to your cartService

// Helper function to calculate total number of items (sum of quantities)
const calculateTotalItems = (cart: CartStateShape): number => {
  return Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
};

// Helper function to calculate the total monetary value of the cart
const calculateCartTotalAmount = (cart: CartStateShape): number => {
  return Object.values(cart).reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

export const useCartStore = create<CartStore>((set, get) => ({
  // Initial State
  cart: {},
  totalItems: 0,
  isCartInitialized: false,

  // Actions
  initializeCart: () => {
    if (get().isCartInitialized) return; // Prevent re-initialization

    const storedCart = cartService.getCartFromLocalStorage();
    set({
      cart: storedCart,
      totalItems: calculateTotalItems(storedCart),
      isCartInitialized: true,
    });
  },

  addToCart: (product: Product) => { // Takes a full Product object
    // Prevent adding if product is out of stock
    if (product.outofstock) {
        console.warn("Attempted to add out of stock item:", product.name);
        // Optionally, use a snackbar to inform the user:
        // useSnackbarStore.getState().showSnackbar(`${product.name} is out of stock.`, 'warning');
        return; 
    }

    set((state) => {
      const currentCart = { ...state.cart };
      const existingItem = currentCart[product.key]; // Use product.key as the identifier
      
      if (existingItem) {
        // Item already in cart, increment quantity
        currentCart[product.key] = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
        };
      } else {
        // Item not in cart, add it as a new CartItem
        // Map properties from Product to CartItem structure
        currentCart[product.key] = {
          productKey: product.key, // Store original product key
          name: product.name,
          price: product.price,
          icon: product.icon, // Optional: include product icon
          // veg: product.veg, // Optional: include veg status if needed in cart display
          quantity: 1,
        };
      }
      cartService.saveCartToLocalStorage(currentCart); 
      return {
        cart: currentCart,
        totalItems: calculateTotalItems(currentCart),
      };
    });
  },

  removeFromCart: (productKey: string) => { // productKey is the original product.key
    set((state) => {
      const currentCart = { ...state.cart };
      const existingItem = currentCart[productKey];

      if (existingItem) {
        if (existingItem.quantity > 1) {
          // Item quantity > 1, decrement quantity
          currentCart[productKey] = {
            ...existingItem,
            quantity: existingItem.quantity - 1,
          };
        } else {
          // Item quantity is 1, remove item from cart
          delete currentCart[productKey];
        }
        cartService.saveCartToLocalStorage(currentCart); 
        return {
          cart: currentCart,
          totalItems: calculateTotalItems(currentCart),
        };
      }
      return state; // No change if item not found
    });
  },

  getCartItemQuantity: (productKey: string): number => {
    const cart = get().cart;
    return cart[productKey]?.quantity || 0;
  },

  isCartEmpty: (): boolean => {
    return Object.keys(get().cart).length === 0;
  },

  deleteCartItem: (productKey: string) => { // Removes item entirely regardless of quantity
    set((state) => {
      const currentCart = { ...state.cart };
      if (currentCart[productKey]) {
        delete currentCart[productKey];
        cartService.saveCartToLocalStorage(currentCart); 
        return {
          cart: currentCart,
          totalItems: calculateTotalItems(currentCart),
        };
      }
      return state; 
    });
  },

  clearCart: () => {
    const emptyCart = {};
    cartService.saveCartToLocalStorage(emptyCart); 
    set({
      cart: emptyCart,
      totalItems: 0,
    });
  },

  getCartTotalAmount: (): number => {
    return calculateCartTotalAmount(get().cart);
  }
}));

// Auto-initialize cart from localStorage on client-side when the store module is first imported.
// This ensures the cart is loaded as early as possible.
if (typeof window !== 'undefined') {
  useCartStore.getState().initializeCart();
}
