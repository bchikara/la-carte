// src/services/cartService.ts

import { CartStateShape } from '../types/cart.types'; // Adjust path as needed

const CART_STORAGE_KEY = 'cart';

/**
 * Retrieves the cart data from localStorage.
 * @returns The cart data or an empty object if not found or on error.
 */
export const getCartFromLocalStorage = (): CartStateShape => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cartJson = localStorage.getItem(CART_STORAGE_KEY);
      return cartJson ? JSON.parse(cartJson) : {};
    }
    return {}; // Return empty if localStorage is not available (e.g., SSR)
  } catch (error) {
    console.error("Error parsing cart from localStorage:", error);
    return {}; // Return empty cart on error
  }
};

/**
 * Saves the cart data to localStorage.
 * @param cart - The cart data to save.
 */
export const saveCartToLocalStorage = (cart: CartStateShape): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

/**
 * Clears the cart from localStorage.
 */
export const clearCartFromLocalStorage = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error clearing cart from localStorage:", error);
  }
}
