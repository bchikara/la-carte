// src/store/cartStore.ts

import { create } from 'zustand';
import { CartStore, CartStateShape, CartItem } from '../types/cart.types'; // Adjust path as needed
import * as cartService from '../services/cartService'; // Adjust path as needed

// Helper function to calculate total items (can stay in store or move to service if preferred)
const calculateTotalItems = (cart: CartStateShape): number => {
  return Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
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

  addToCart: (itemToAdd: Omit<CartItem, 'quantity'>) => {
    set((state) => {
      const currentCart = { ...state.cart };
      const existingItem = currentCart[itemToAdd.key];
      let newQuantity = 1;

      if (existingItem) {
        newQuantity = existingItem.quantity + 1;
      }

      // Ensure all required properties from itemToAdd are explicitly assigned
      // before spreading to avoid issues if itemToAdd is missing optional fields.
      const updatedCartItem: CartItem = {
        key: itemToAdd.key,
        name: itemToAdd.name,
        price: itemToAdd.price,
        image: itemToAdd.image, // Include optional fields explicitly
        // Add any other properties from itemToAdd that are part of CartItem
        ...itemToAdd, // Spread itemToAdd to include any other dynamic or specific properties
        quantity: newQuantity,
      };

      currentCart[itemToAdd.key] = updatedCartItem;
      cartService.saveCartToLocalStorage(currentCart); // Use service
      return {
        cart: currentCart,
        totalItems: calculateTotalItems(currentCart),
      };
    });
  },

  removeFromCart: (itemKey: string) => {
    set((state) => {
      const currentCart = { ...state.cart };
      const existingItem = currentCart[itemKey];

      if (existingItem) {
        if (existingItem.quantity > 1) {
          currentCart[itemKey] = {
            ...existingItem,
            quantity: existingItem.quantity - 1,
          };
        } else {
          delete currentCart[itemKey];
        }
        cartService.saveCartToLocalStorage(currentCart); // Use service
        return {
          cart: currentCart,
          totalItems: calculateTotalItems(currentCart),
        };
      }
      return state; // No change if item not found
    });
  },

  getCartItemQuantity: (itemKey: string): number => {
    const cart = get().cart;
    return cart[itemKey]?.quantity || 0;
  },

  isCartEmpty: (): boolean => {
    return Object.keys(get().cart).length === 0;
  },

  deleteCartItem: (itemKey: string) => {
    set((state) => {
      const currentCart = { ...state.cart };
      if (currentCart[itemKey]) {
        delete currentCart[itemKey];
        cartService.saveCartToLocalStorage(currentCart); // Use service
        return {
          cart: currentCart,
          totalItems: calculateTotalItems(currentCart),
        };
      }
      return state; // No change if item not found
    });
  },

  clearCart: () => {
    const emptyCart = {};
    cartService.saveCartToLocalStorage(emptyCart); // Use service (or cartService.clearCartFromLocalStorage())
    set({
      cart: emptyCart,
      totalItems: 0,
    });
  },
}));

// To ensure cart is loaded as soon as possible when the app starts,
// and only on the client-side.
if (typeof window !== 'undefined') {
  useCartStore.getState().initializeCart();
}

// The useEffect hook for initialization should be in your main App component or a similar
// top-level component, not directly in the store file.
// Example for App.tsx:
// import { useEffect } from 'react';
// import { useCartStore } from './path-to-your-store/cartStore';
//
// function App() {
//   const initializeCart = useCartStore((state) => state.initializeCart);
//   const isCartInitialized = useCartStore((state) => state.isCartInitialized);
//
//   useEffect(() => {
//     if (!isCartInitialized) {
//       initializeCart();
//     }
//   }, [isCartInitialized, initializeCart]);
//
//   // ... rest of your App component
// }
