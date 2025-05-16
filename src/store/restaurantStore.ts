// src/store/restaurantStore.ts

import { create } from 'zustand';
import restaurantService from '../services/restaurantService'; // Assuming singleton export
import type {
  Restaurant,
  ProcessedMenu,
  RawRestaurantMenuFirebase,
  MenuCategoryData,
  MenuSubCategoryData,
  Product,
  RawProductFirebase,
  MenuCategory, // For action parameters
  MenuItem,   // For action parameters
  TableOrder, // For action parameters
  RestaurantOrder, // For action parameters
  RestaurantIdParam,
  RestaurantMenuCategoryPathKeys,
  RestaurantMenuItemPathKeys,
  RestaurantTablePathKeys,
  RestaurantTableOrderPathKeys,
} from '../types/restaurant.types'; // Adjust path
import firebase from 'firebase/compat/app'; // For firebase.database.Reference

interface ActiveListeners {
  allRestaurants?: () => void;
  restaurantDetailsAndMenu?: () => void; // Combined listener for details and menu
  tableOrders?: (restaurantId: string, tableId: string) => void; // Listener for specific table orders
  // Add more specific listeners as needed
}

export interface RestaurantStoreState {
  restaurantsList: Restaurant[];
  currentRestaurant: Restaurant | null;
  currentRestaurantMenu: ProcessedMenu | null; // State for processed menu
  currentTableOrders: Record<string, TableOrder> | null; // For listenToTableOrders

  isLoadingList: boolean;
  isLoadingDetails: boolean; // For restaurant details (includes menu)
  isLoadingMenu: boolean;    // Kept for clarity, often tied to isLoadingDetails
  isLoadingTableOrders: boolean;
  
  error: string | null;      // General error for list or restaurant details
  errorMenu: string | null;  // Specific for menu processing if needed, or use general error
  errorTableOrders: string | null;

  activeListeners: ActiveListeners;
}

export interface RestaurantStoreActions {
  // Restaurant CRUD
  listenToAllRestaurants: () => void;
  stopListeningToAllRestaurants: () => void;
  
  listenToRestaurantAndMenu: (restaurantId: string) => void; // Combined listener
  stopListeningToRestaurantDetails: () => void; // Stops the combined listener

  createRestaurant: (data: Omit<Restaurant, 'id'>) => Promise<string | null>; 
  updateRestaurant: (id: string, data: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;

  // Menu Category
  addMenuCategory: (restaurantId: string, categoryData: Omit<MenuCategory, 'id'>) => Promise<string | null>;
  updateMenuCategory: (keys: RestaurantMenuCategoryPathKeys, data: Partial<MenuCategory>) => Promise<void>;
  deleteMenuCategory: (keys: RestaurantMenuCategoryPathKeys) => Promise<void>;

  // Menu Item
  addMenuItem: (
    keys: Omit<RestaurantMenuItemPathKeys, 'menuItemId'>, 
    itemData: Omit<MenuItem, 'id'>
  ) => Promise<string | null>;
  updateMenuItem: (keys: RestaurantMenuItemPathKeys, itemData: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (keys: RestaurantMenuItemPathKeys) => Promise<void>;

  // Table Orders
  addTableOrder: (keys: RestaurantTablePathKeys, orderData: Omit<TableOrder, 'id'>) => Promise<string | null>;
  updateTableOrder: (keys: RestaurantTableOrderPathKeys, orderData: Partial<TableOrder>) => Promise<void>;
  clearTableOrders: (keys: RestaurantTablePathKeys) => Promise<void>;
  listenToTableOrders: (keys: RestaurantTablePathKeys) => void;
  stopListeningToTableOrders: (restaurantId: string, tableId: string) => void;


  // Restaurant Orders
  addRestaurantOrder: (restaurantId: string, orderData: Omit<RestaurantOrder, 'id'>) => Promise<string | null>;
  // TODO: listenToRestaurantOrders and queryOrdersFromRestaurant would also go here

  clearError: () => void;
  cleanupAllListeners: () => void;
}

export type RestaurantStore = RestaurantStoreState & RestaurantStoreActions;

const initialState: RestaurantStoreState = {
  restaurantsList: [],
  currentRestaurant: null,
  currentRestaurantMenu: null,
  currentTableOrders: null,
  isLoadingList: false,
  isLoadingDetails: false,
  isLoadingMenu: false,
  isLoadingTableOrders: false,
  error: null,
  errorMenu: null,
  errorTableOrders: null,
  activeListeners: {},
};

// Helper function to process raw Firebase menu into ProcessedMenu
const processFirebaseMenu = (rawMenu?: RawRestaurantMenuFirebase): ProcessedMenu | null => {
  if (!rawMenu) return null;
  const processed: ProcessedMenu = [];
  Object.keys(rawMenu).forEach(categoryKey => {
    const rawCategory = rawMenu[categoryKey];
    if (!rawCategory || typeof rawCategory !== 'object') return; // Skip if category is not an object

    const categoryData: MenuCategoryData = {
      key: categoryKey,
      name: rawCategory.name || 'Unnamed Category',
      subCategories: [],
    };
    if (rawCategory.subCategory) {
      Object.keys(rawCategory.subCategory).forEach(subCategoryKey => {
        const rawSubCategory = rawCategory.subCategory![subCategoryKey];
        if (!rawSubCategory || typeof rawSubCategory !== 'object') return; // Skip if subCategory is not an object

        const subCategoryData: MenuSubCategoryData = {
          key: subCategoryKey,
          name: rawSubCategory.name || 'Unnamed Sub-Category',
          products: [],
        };
        if (rawSubCategory.products) {
          Object.keys(rawSubCategory.products).forEach(productKey => {
            const rawProduct = rawSubCategory.products![productKey] as RawProductFirebase;
            if (!rawProduct || typeof rawProduct !== 'object') return; // Skip if product is not an object

            subCategoryData.products.push({
              key: productKey,
              name: rawProduct.name || 'Unnamed Product',
              description: rawProduct.description,
              price: typeof rawProduct.price === 'number' ? rawProduct.price : 0,
              veg: rawProduct.veg === true || rawProduct.veg === 'true',
              outofstock: rawProduct.outOfStock || rawProduct.outofstock,
              icon: rawProduct.icon,
            });
          });
        }
        categoryData.subCategories.push(subCategoryData);
      });
    }
    processed.push(categoryData);
  });
  return processed;
};


export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
  ...initialState,

  listenToAllRestaurants: () => {
    get().stopListeningToAllRestaurants(); 
    set({ isLoadingList: true, error: null });
    const dbRef = restaurantService.getAll();
    const listener = dbRef.on(
      'value',
      (snapshot) => {
        const data = snapshot.val();
        const list: Restaurant[] = data ? Object.keys(data).map(key => ({ ...data[key], id: key, key: key })) : [];
        set({ restaurantsList: list, isLoadingList: false });
      },
      (errorObject: Error) => { // Firebase error object is typically an Error instance
        console.error("Error listening to all restaurants:", errorObject);
        set({ error: errorObject.message, isLoadingList: false });
      }
    );
    set(state => ({ activeListeners: { ...state.activeListeners, allRestaurants: () => dbRef.off('value', listener) } }));
  },

  stopListeningToAllRestaurants: () => {
    get().activeListeners.allRestaurants?.();
    set(state => ({ activeListeners: { ...state.activeListeners, allRestaurants: undefined } }));
  },

  listenToRestaurantAndMenu: (restaurantId: string) => {
    if (!restaurantId) {
        console.warn("listenToRestaurantAndMenu called with no restaurantId");
        set({ error: "Restaurant ID is required.", isLoadingDetails: false, isLoadingMenu: false });
        return;
    }
    get().stopListeningToRestaurantDetails(); 
    set({ 
        isLoadingDetails: true, 
        isLoadingMenu: true, 
        error: null, 
        errorMenu: null, 
        currentRestaurant: null, 
        currentRestaurantMenu: null 
    });
    const dbRef = restaurantService.get(restaurantId);
    
    const listener = dbRef.on(
      'value',
      (snapshot) => {
        if (snapshot.exists()) {
          const restaurantData = snapshot.val() as Restaurant; 
          const processedMenu = processFirebaseMenu(restaurantData.menu);
          set({ 
            currentRestaurant: { ...restaurantData, id: snapshot.key!, key: snapshot.key! }, 
            currentRestaurantMenu: processedMenu,
            isLoadingDetails: false, 
            isLoadingMenu: false 
          });
        } else {
          set({ 
            currentRestaurant: null, 
            currentRestaurantMenu: null, 
            isLoadingDetails: false, 
            isLoadingMenu: false, 
            error: "Restaurant not found.",
            errorMenu: "Menu not found as restaurant is missing."
          });
        }
      },
      (errorObject: Error) => {
        console.error(`Error listening to restaurant ${restaurantId}:`, errorObject);
        set({ 
            error: errorObject.message, 
            errorMenu: errorObject.message, 
            isLoadingDetails: false, 
            isLoadingMenu: false 
        });
      }
    );
    set(state => ({ 
        activeListeners: { ...state.activeListeners, restaurantDetailsAndMenu: () => dbRef.off('value', listener) } 
    }));
  },

  stopListeningToRestaurantDetails: () => { 
    get().activeListeners.restaurantDetailsAndMenu?.();
    set(state => ({ 
        activeListeners: { ...state.activeListeners, restaurantDetailsAndMenu: undefined },
        // currentRestaurant: null, // Consider if these should be cleared when listener stops
        // currentRestaurantMenu: null,
        // isLoadingDetails: false,
        // isLoadingMenu: false,
    }));
  },

  createRestaurant: async (data) => {
    set({ isLoadingList: true, error: null });
    try {
      const newRef = await restaurantService.create(data);
      // Listener for all restaurants should pick this up.
      set({ isLoadingList: false });
      return newRef.key;
    } catch (errorObject: any) {
      set({ error: errorObject.message || 'Failed to create restaurant.', isLoadingList: false });
      return null;
    }
  },

  updateRestaurant: async (id, data) => {
     set({ isLoadingDetails: true, error: null }); 
    try {
      await restaurantService.update(id, data);
      // Listener for restaurant details should pick this up.
      // Optimistic update for currentRestaurant if it's the one being edited:
      if (get().currentRestaurant?.id === id) {
         set(state => ({ 
             currentRestaurant: state.currentRestaurant ? { ...state.currentRestaurant, ...data } : null,
             isLoadingDetails: false 
            }));
      } else {
        set({ isLoadingDetails: false });
      }
    } catch (errorObject: any) {
      set({ error: errorObject.message || 'Failed to update restaurant.', isLoadingDetails: false });
    }
  },

  deleteRestaurant: async (id: string) => {
    set({ isLoadingList: true, isLoadingDetails: true, error: null }); // Indicate loading for both list and details
    try {
      await restaurantService.delete(id);
      // Listener for all restaurants should update the list.
      // Clear currentRestaurant if it was the one deleted.
      set(state => ({
        restaurantsList: state.restaurantsList.filter(r => r.id !== id), // Optimistic update for list
        currentRestaurant: state.currentRestaurant?.id === id ? null : state.currentRestaurant,
        currentRestaurantMenu: state.currentRestaurant?.id === id ? null : state.currentRestaurantMenu,
        isLoadingList: false, // Assuming listener will refresh, or this optimistic update suffices
        isLoadingDetails: false,
      }));
    } catch (errorObject: any) {
      set({ error: errorObject.message || 'Failed to delete restaurant.', isLoadingList: false, isLoadingDetails: false });
    }
  },

  // --- Menu Category Actions ---
  addMenuCategory: async (restaurantId, categoryData) => {
    set({ isLoadingMenu: true, errorMenu: null });
    try {
        const keys: RestaurantIdParam = { id: restaurantId };
        const newRef = await restaurantService.addRestaurantMenuCategory(keys, categoryData);
        // The main restaurant listener should pick up this change.
        set({ isLoadingMenu: false });
        return newRef.key;
    } catch (errorObject: any) {
        set({ errorMenu: errorObject.message || 'Failed to add menu category.', isLoadingMenu: false });
        return null;
    }
  },
  updateMenuCategory: async (keys, data) => {
    set({ isLoadingMenu: true, errorMenu: null });
    try {
        await restaurantService.editRestaurantMenuCategory(keys, data);
        set({ isLoadingMenu: false });
    } catch (errorObject: any) {
        set({ errorMenu: errorObject.message || 'Failed to update menu category.', isLoadingMenu: false });
    }
  },
  deleteMenuCategory: async (keys) => {
    set({ isLoadingMenu: true, errorMenu: null });
    try {
        await restaurantService.deleteRestaurantMenuCategory(keys);
        set({ isLoadingMenu: false });
    } catch (errorObject: any) {
        set({ errorMenu: errorObject.message || 'Failed to delete menu category.', isLoadingMenu: false });
    }
  },

  // --- Menu Item Actions ---
  addMenuItem: async (keys, itemData) => {
    set({ isLoadingMenu: true, errorMenu: null });
    try {
        const newRef = await restaurantService.addRestaurantMenuItem(keys, itemData);
        set({ isLoadingMenu: false });
        return newRef.key;
    } catch (errorObject: any) {
        set({ errorMenu: errorObject.message || 'Failed to add menu item.', isLoadingMenu: false });
        return null;
    }
  },
  updateMenuItem: async (keys, itemData) => {
    set({ isLoadingMenu: true, errorMenu: null });
    try {
        await restaurantService.editRestaurantMenuItem(keys, itemData);
        set({ isLoadingMenu: false });
    } catch (errorObject: any) {
        set({ errorMenu: errorObject.message || 'Failed to update menu item.', isLoadingMenu: false });
    }
  },
  deleteMenuItem: async (keys) => {
    set({ isLoadingMenu: true, errorMenu: null });
    try {
        await restaurantService.deleteRestaurantMenuItem(keys);
        set({ isLoadingMenu: false });
    } catch (errorObject: any) {
        set({ errorMenu: errorObject.message || 'Failed to delete menu item.', isLoadingMenu: false });
    }
  },

  // --- Table Order Actions ---
  addTableOrder: async (keys, orderData) => {
    set({ isLoadingTableOrders: true, errorTableOrders: null }); // Use specific loading/error state
    try {
        const newRef = await restaurantService.addOrderToTable(keys, orderData);
        set({ isLoadingTableOrders: false });
        return newRef.key;
    } catch (errorObject: any) {
        set({ errorTableOrders: errorObject.message || 'Failed to add table order.', isLoadingTableOrders: false });
        return null;
    }
  },
  updateTableOrder: async (keys, orderData) => {
    set({ isLoadingTableOrders: true, errorTableOrders: null });
    try {
        await restaurantService.updateTableOrder(keys, orderData);
        set({ isLoadingTableOrders: false });
    } catch (errorObject: any) {
        set({ errorTableOrders: errorObject.message || 'Failed to update table order.', isLoadingTableOrders: false });
    }
  },
  clearTableOrders: async (keys) => {
    set({ isLoadingTableOrders: true, errorTableOrders: null });
    try {
        await restaurantService.clearTableOrders(keys);
        // Listener for table orders should pick this up, or optimistically clear local state
        if(get().currentRestaurant?.id === keys.id && get().currentTableOrders) {
            set(state => ({
                currentTableOrders: null // Or set to {} if that's the expected empty state
            }));
        }
        set({ isLoadingTableOrders: false });
    } catch (errorObject: any) {
        set({ errorTableOrders: errorObject.message || 'Failed to clear table orders.', isLoadingTableOrders: false });
    }
  },
  listenToTableOrders: (keys: RestaurantTablePathKeys) => {
    get().stopListeningToTableOrders(keys.id, keys.tableId); 
    set({ isLoadingTableOrders: true, errorTableOrders: null, currentTableOrders: null });
    const dbRef = restaurantService.getTableOrders(keys);
    const listener = dbRef.on(
        'value',
        (snapshot) => {
            const ordersData = snapshot.val() as Record<string, TableOrder> | null;
            set({ currentTableOrders: ordersData || {}, isLoadingTableOrders: false });
        },
        (errorObject: Error) => {
            console.error(`Error listening to orders for table ${keys.tableId}:`, errorObject);
            set({ errorTableOrders: errorObject.message, isLoadingTableOrders: false });
        }
    );
    const listenerKey = `tableOrders_${keys.id}_${keys.tableId}`;
    set(state => ({ activeListeners: { ...state.activeListeners, [listenerKey]: () => dbRef.off('value', listener) } }));
  },
  stopListeningToTableOrders: (restaurantId: string, tableId: string) => {
    const listenerKey = `tableOrders_${restaurantId}_${tableId}`;
    const activeListener = get().activeListeners[listenerKey as keyof ActiveListeners] as (() => void) | undefined;
    activeListener?.();
    set(state => {
        const newListeners = { ...state.activeListeners };
        delete newListeners[listenerKey as keyof ActiveListeners];
        return { activeListeners: newListeners /*, currentTableOrders: null */ }; // Optionally clear orders
    });
  },

  // --- Restaurant Order Actions ---
  addRestaurantOrder: async (restaurantId, orderData) => {
    // Assuming this might use a general loading state or a specific one if many order types
    set({ isLoadingDetails: true, error: null }); 
    try {
        const newRef = await restaurantService.addOrderToRestaurant({id: restaurantId}, orderData);
        // Main restaurant listener should pick this up if 'orders' is part of Restaurant object
        set({ isLoadingDetails: false });
        return newRef.key;
    } catch (errorObject: any) {
        set({ error: errorObject.message || 'Failed to add restaurant order.', isLoadingDetails: false });
        return null;
    }
  },

  clearError: () => {
    set({ error: null, errorMenu: null, errorTableOrders: null });
  },

  cleanupAllListeners: () => {
    const listeners = get().activeListeners;
    Object.values(listeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    });
    set({ activeListeners: {} });
  }
}));
