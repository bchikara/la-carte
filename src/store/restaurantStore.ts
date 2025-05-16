// src/store/restaurantStore.ts

import { create } from 'zustand';
import restaurantService from '../services/restaurantService'; // Assuming singleton export
import type {
  Restaurant,
  RestaurantMenu,
  RestaurantTable,
  MenuCategory,
  MenuItem,
  TableOrder,
  RestaurantOrder,
  RestaurantIdParam,
  RestaurantMenuCategoryPathKeys,
  RestaurantMenuItemPathKeys,
  RestaurantTablePathKeys,
  RestaurantTableOrderPathKeys,
} from '../types/restaurant.types';
import firebase from 'firebase/compat/app';

interface ActiveListeners {
  allRestaurants?: () => void;
  restaurantDetails?: () => void;
  restaurantMenu?: () => void;
  restaurantTables?: () => void;
  restaurantOrders?: () => void;
  tableOrders?: () => void;
  // Add more specific listeners as needed
}

export interface RestaurantStoreState {
  restaurantsList: Restaurant[];
  currentRestaurant: Restaurant | null;
  // currentRestaurantMenu: RestaurantMenu | null; // Menu is part of currentRestaurant
  // currentRestaurantTables: Record<string, RestaurantTable> | null; // Tables are part of currentRestaurant
  isLoadingList: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  activeListeners: ActiveListeners;
}

export interface RestaurantStoreActions {
  // Restaurant CRUD
  listenToAllRestaurants: () => void;
  stopListeningToAllRestaurants: () => void;
  listenToRestaurantDetails: (restaurantId: string) => void;
  stopListeningToRestaurantDetails: () => void;
  createRestaurant: (data: Omit<Restaurant, 'id'>) => Promise<string | null>; // Returns new ID
  updateRestaurant: (id: string, data: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;

  // Menu Category
  addMenuCategory: (restaurantId: string, categoryData: Omit<MenuCategory, 'id'>) => Promise<string | null>;
  updateMenuCategory: (keys: RestaurantMenuCategoryPathKeys, data: Partial<MenuCategory>) => Promise<void>;
  deleteMenuCategory: (keys: RestaurantMenuCategoryPathKeys) => Promise<void>;

  // Menu Item
  addMenuItem: (
    keys: Omit<RestaurantMenuItemPathKeys, 'menuItemId'>, // We don't have menuItemId before creation
    itemData: Omit<MenuItem, 'id'>
  ) => Promise<string | null>;
  updateMenuItem: (keys: RestaurantMenuItemPathKeys, itemData: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (keys: RestaurantMenuItemPathKeys) => Promise<void>;

  // Table Orders
  addTableOrder: (keys: RestaurantTablePathKeys, orderData: Omit<TableOrder, 'id'>) => Promise<string | null>;
  updateTableOrder: (keys: RestaurantTableOrderPathKeys, orderData: Partial<TableOrder>) => Promise<void>;
  clearTableOrders: (keys: RestaurantTablePathKeys) => Promise<void>;
  listenToTableOrders: (keys: RestaurantTablePathKeys) => void;
  stopListeningToTableOrders: () => void;


  // Restaurant Orders
  addRestaurantOrder: (restaurantId: string, orderData: Omit<RestaurantOrder, 'id'>) => Promise<string | null>;
  // listenToRestaurantOrders and queryOrdersFromRestaurant would also go here

  clearError: () => void;
  cleanupAllListeners: () => void;
}

export type RestaurantStore = RestaurantStoreState & RestaurantStoreActions;

const initialState: RestaurantStoreState = {
  restaurantsList: [],
  currentRestaurant: null,
  isLoadingList: false,
  isLoadingDetails: false,
  error: null,
  activeListeners: {},
};

export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
  ...initialState,

  listenToAllRestaurants: () => {
    get().stopListeningToAllRestaurants(); // Stop previous listener
    set({ isLoadingList: true, error: null });
    const dbRef = restaurantService.getAll();
    const listener = dbRef.on(
      'value',
      (snapshot) => {
        const data = snapshot.val();
        const list: Restaurant[] = data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : [];
        set({ restaurantsList: list, isLoadingList: false });
      },
      (error) => {
        console.error("Error listening to all restaurants:", error);
        set({ error: (error as Error).message, isLoadingList: false });
      }
    );
    set(state => ({ activeListeners: { ...state.activeListeners, allRestaurants: () => dbRef.off('value', listener) } }));
  },

  stopListeningToAllRestaurants: () => {
    get().activeListeners.allRestaurants?.();
    set(state => ({ activeListeners: { ...state.activeListeners, allRestaurants: undefined } }));
  },

  listenToRestaurantDetails: (restaurantId: string) => {
    get().stopListeningToRestaurantDetails(); // Stop previous listener
    set({ isLoadingDetails: true, error: null, currentRestaurant: null });
    const dbRef = restaurantService.get(restaurantId);
    const listener = dbRef.on(
      'value',
      (snapshot) => {
        if (snapshot.exists()) {
          set({ currentRestaurant: { ...snapshot.val(), id: snapshot.key } as Restaurant, isLoadingDetails: false });
        } else {
          set({ currentRestaurant: null, isLoadingDetails: false, error: "Restaurant not found." });
        }
      },
      (error) => {
        console.error(`Error listening to restaurant ${restaurantId}:`, error);
        set({ error: (error as Error).message, isLoadingDetails: false });
      }
    );
    set(state => ({ activeListeners: { ...state.activeListeners, restaurantDetails: () => dbRef.off('value', listener) } }));
  },

  stopListeningToRestaurantDetails: () => {
    get().activeListeners.restaurantDetails?.();
    set(state => ({ activeListeners: { ...state.activeListeners, restaurantDetails: undefined } }));
  },

  createRestaurant: async (data) => {
    set({ isLoadingList: true, error: null });
    try {
      const newRef = await restaurantService.create(data);
      set({ isLoadingList: false });
      // No need to manually add to list if listenToAllRestaurants is active
      return newRef.key;
    } catch (error) {
      console.error("Error creating restaurant:", error);
      set({ error: (error as Error).message, isLoadingList: false });
      return null;
    }
  },

  updateRestaurant: async (id, data) => {
    set({ isLoadingDetails: true, error: null }); // Or a specific loading state for updates
    try {
      await restaurantService.update(id, data);
      set({ isLoadingDetails: false });
      // If currentRestaurant is this one, update it or rely on listener
      if (get().currentRestaurant?.id === id) {
         set(state => ({ currentRestaurant: state.currentRestaurant ? { ...state.currentRestaurant, ...data } : null }));
      }
    } catch (error) {
      console.error(`Error updating restaurant ${id}:`, error);
      set({ error: (error as Error).message, isLoadingDetails: false });
    }
  },

  deleteRestaurant: async (id: string) => {
    set({ isLoadingList: true, isLoadingDetails: true, error: null });
    try {
      await restaurantService.delete(id);
      set(state => ({
        restaurantsList: state.restaurantsList.filter(r => r.id !== id),
        currentRestaurant: state.currentRestaurant?.id === id ? null : state.currentRestaurant,
        isLoadingList: false,
        isLoadingDetails: false,
      }));
    } catch (error) {
      console.error(`Error deleting restaurant ${id}:`, error);
      set({ error: (error as Error).message, isLoadingList: false, isLoadingDetails: false });
    }
  },

  addMenuCategory: async (restaurantId, categoryData) => {
    if (!restaurantId) {
        set({ error: "Restaurant ID is required to add a menu category." });
        return null;
    }
    set({ isLoadingDetails: true, error: null });
    try {
        const newRef = await restaurantService.addRestaurantMenuCategory({ id: restaurantId }, categoryData);
        // Menu is part of currentRestaurant, listener on currentRestaurant should update it.
        // Or, optimistically update if needed.
        set({ isLoadingDetails: false });
        return newRef.key;
    } catch (error) {
        console.error("Error adding menu category:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
        return null;
    }
  },

  updateMenuCategory: async (keys, data) => {
    set({ isLoadingDetails: true, error: null });
    try {
        await restaurantService.editRestaurantMenuCategory(keys, data);
        // Optimistic update or rely on listener for currentRestaurant
        set({ isLoadingDetails: false });
    } catch (error) {
        console.error("Error updating menu category:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
    }
  },

  deleteMenuCategory: async (keys) => {
    set({ isLoadingDetails: true, error: null });
    try {
        await restaurantService.deleteRestaurantMenuCategory(keys);
        // Optimistic update or rely on listener
        set({ isLoadingDetails: false });
    } catch (error) {
        console.error("Error deleting menu category:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
    }
  },

  addMenuItem: async (keys, itemData) => {
    set({ isLoadingDetails: true, error: null });
    try {
        const newRef = await restaurantService.addRestaurantMenuItem(keys, itemData);
        set({ isLoadingDetails: false });
        return newRef.key;
    } catch (error) {
        console.error("Error adding menu item:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
        return null;
    }
  },

  updateMenuItem: async (keys, itemData) => {
     set({ isLoadingDetails: true, error: null });
    try {
        await restaurantService.editRestaurantMenuItem(keys, itemData);
        set({ isLoadingDetails: false });
    } catch (error) {
        console.error("Error updating menu item:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
    }
  },

  deleteMenuItem: async (keys) => {
    set({ isLoadingDetails: true, error: null });
    try {
        await restaurantService.deleteRestaurantMenuItem(keys);
        set({ isLoadingDetails: false });
    } catch (error) {
        console.error("Error deleting menu item:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
    }
  },

  addTableOrder: async (keys, orderData) => {
    set({ isLoadingDetails: true, error: null }); // Assuming this relates to current restaurant details
    try {
        const newRef = await restaurantService.addOrderToTable(keys, orderData);
        set({ isLoadingDetails: false });
        return newRef.key;
    } catch (error) {
        console.error("Error adding table order:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
        return null;
    }
  },

  updateTableOrder: async (keys, orderData) => {
    set({ isLoadingDetails: true, error: null });
    try {
        await restaurantService.updateTableOrder(keys, orderData);
        set({ isLoadingDetails: false });
    } catch (error) {
        console.error("Error updating table order:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
    }
  },

  clearTableOrders: async (keys: RestaurantTablePathKeys) => {
    set({ isLoadingDetails: true, error: null });
    try {
        await restaurantService.clearTableOrders(keys);
        // Optimistically update currentRestaurant.tables[keys.tableId].orders = {}
        // Or rely on listener if one is set up for table orders.
        set({ isLoadingDetails: false });
    } catch (error) {
        console.error("Error clearing table orders:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
    }
  },

  listenToTableOrders: (keys: RestaurantTablePathKeys) => {
    get().stopListeningToTableOrders(); // Stop previous listener
    set({ isLoadingDetails: true, error: null }); // Or a more specific loading state

    const dbRef = restaurantService.getTableOrders(keys);
    const listener = dbRef.on(
        'value',
        (snapshot) => {
            const ordersData = snapshot.val() as Record<string, TableOrder> | null;
            // Update the specific table's orders within the currentRestaurant state
            set(state => {
                if (state.currentRestaurant && state.currentRestaurant.tables && state.currentRestaurant.tables[keys.tableId]) {
                    const updatedTables = {
                        ...state.currentRestaurant.tables,
                        [keys.tableId]: {
                            ...state.currentRestaurant.tables[keys.tableId],
                            orders: ordersData || {}
                        }
                    };
                    return {
                        currentRestaurant: {
                            ...state.currentRestaurant,
                            tables: updatedTables
                        },
                        isLoadingDetails: false
                    };
                }
                return { isLoadingDetails: false }; // No change if path invalid
            });
        },
        (error) => {
            console.error(`Error listening to orders for table ${keys.tableId}:`, error);
            set({ error: (error as Error).message, isLoadingDetails: false });
        }
    );
    set(state => ({ activeListeners: { ...state.activeListeners, tableOrders: () => dbRef.off('value', listener) } }));
  },

  stopListeningToTableOrders: () => {
    get().activeListeners.tableOrders?.();
    set(state => ({ activeListeners: { ...state.activeListeners, tableOrders: undefined } }));
  },

  addRestaurantOrder: async (restaurantId, orderData) => {
    set({ isLoadingDetails: true, error: null });
    try {
        const newRef = await restaurantService.addOrderToRestaurant({ id: restaurantId }, orderData);
        set({ isLoadingDetails: false });
        return newRef.key;
    } catch (error) {
        console.error("Error adding restaurant order:", error);
        set({ error: (error as Error).message, isLoadingDetails: false });
        return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  cleanupAllListeners: () => {
    const listeners = get().activeListeners;
    Object.values(listeners).forEach(unsubscribe => unsubscribe?.());
    set({ activeListeners: {} });
  }
}));

// Call cleanupAllListeners when the app is about to unmount or close, if necessary.
// e.g., in your main App component's return function from useEffect.
// useEffect(() => {
//   return () => {
//     useRestaurantStore.getState().cleanupAllListeners();
//   }
// }, []);
