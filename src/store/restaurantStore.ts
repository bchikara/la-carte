// src/store/restaurantStore.ts

import { create } from 'zustand';
import restaurantService from '../services/restaurantService'; // Adjust path
import type {
  Restaurant,
  ProcessedMenu,
  RawRestaurantMenuFirebase,
  MenuCategoryData,
  MenuSubCategoryData,
  Product as MenuProductType, // Renamed to avoid conflict with component name
  RawProductFirebase,
  MenuCategory, 
  MenuItem,   
  TableOrder, 
  RestaurantOrder,
  RestaurantIdParam,
  RestaurantMenuCategoryPathKeys,
  RestaurantMenuItemPathKeys,
  RestaurantTablePathKeys,
  RestaurantTableOrderPathKeys,
  RestaurantMenuSubCategoryPathKeys,
  PaymentStatus,
  RestaurantTable,
  Product,
} from '../types/restaurant.types'; // Adjust path
import firebase from 'firebase/compat/app'; 

// Define ActiveListeners specifically for this store
interface RestaurantActiveListeners {
  allRestaurants?: () => void;
  restaurantDetailsAndMenu?: () => void; 
  tableOrders?: (restaurantId: string, tableId: string) => void; 
  allRestaurantOrders?: (restaurantId: string) => void;
}

// --- Types for Menu Editing State ---
export type EditingItemType = 'category' | 'subCategory' | 'product' | 'table' | null;

export interface MenuEditingParentContext {
    restaurantId?: string; // Added restaurantId
    categoryId?: string; 
    subCategoryId?: string;
}

export interface MenuEditingState {
  isTableModalOpen: boolean;
  isProductModalOpen: boolean;
  isCategoryModalOpen: boolean;
  editingItem: Product | MenuSubCategoryData | MenuCategoryData | RestaurantTable | null;
  editingItemType: EditingItemType;
  parentContext?: MenuEditingParentContext;
}

// --- Store State and Actions ---
export interface AppRestaurantStoreState { 
  restaurantsList: Restaurant[];
  currentRestaurant: Restaurant | null;
  currentRestaurantMenu: ProcessedMenu | null; 
  currentTableOrders: Record<string, TableOrder> | null; 
  allRestaurantOrders: RestaurantOrder[]; 
  
  isLoadingList: boolean;
  isLoadingDetails: boolean; 
  isLoadingMenu: boolean;    
  isLoadingTableOrders: boolean;
  isLoadingAllOrders: boolean;           
  
  error: string | null;      
  errorMenu: string | null;  
  errorTableOrders: string | null;
  errorAllOrders: string | null;         
  
  activeListeners: RestaurantActiveListeners; 
  menuEditing: MenuEditingState; 
}

export interface AppRestaurantStoreActions { 
  listenToAllRestaurants: () => void;
  stopListeningToAllRestaurants: () => void;
  listenToRestaurantAndMenu: (restaurantId: string) => void; 
  stopListeningToRestaurantDetails: () => void; 
  createRestaurant: (data: Omit<Restaurant, 'id' | 'key'>) => Promise<string | null>; 
  updateRestaurant: (id: string, data: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  
  addMenuCategory: (restaurantId: string, categoryData: Omit<MenuCategory, 'id'>) => Promise<string | null>;
  addMenuSubCategory: (restaurantId: string,menuCategoryId:string,  categoryData: Omit<MenuCategory, 'id'>) => Promise<string | null>;
  updateMenuCategory: (keys: RestaurantMenuCategoryPathKeys, data: Partial<MenuCategory>) => Promise<void>;
  deleteMenuCategory: (keys: RestaurantMenuCategoryPathKeys) => Promise<void>;
  deleteMenuSubCategory: (keys: RestaurantMenuSubCategoryPathKeys) => Promise<void>;
  
  addMenuItem: (keys: Omit<RestaurantMenuItemPathKeys, 'menuItemId'>, itemData: Omit<MenuItem, 'id'>, productImageFile: File | null ) => Promise<string | null>;
  updateMenuItem: (keys: RestaurantMenuItemPathKeys, itemData: Partial<MenuItem>, productImageFile: File | null ) => Promise<void>;
  deleteMenuItem: (keys: RestaurantMenuItemPathKeys) => Promise<void>;
  
  addTableOrder: (keys: RestaurantTablePathKeys, orderData: Omit<TableOrder, 'id'>) => Promise<string | null>;
  updateTableOrder: (keys: RestaurantTableOrderPathKeys, orderData: Partial<TableOrder>) => Promise<void>;
  clearTableOrders: (keys: RestaurantTablePathKeys) => Promise<void>;
  listenToTableOrders: (keys: RestaurantTablePathKeys) => void;
  stopListeningToTableOrders: (restaurantId: string, tableId: string) => void;
  addRestaurantOrder: (restaurantId: string, orderData: Omit<RestaurantOrder, 'id' | 'key'>) => Promise<string | null>;
  listenToAllRestaurantOrders: (restaurantId: string) => void; 
  stopListeningToAllRestaurantOrders: (restaurantId: string) => void; 
  updateRestaurantOrderStatus: (restaurantId: string, orderId: string, newStatus: RestaurantOrder['status']) => Promise<void>; 
  updateRestaurantOrderPaymentStatus: (restaurantId: string, orderId: string, paymentStatus: PaymentStatus) => Promise<void>;
  // Updated signature for openProductModal context
  updateRestaurantDetails: (
        restaurantId: string, 
        details: Partial<Omit<Restaurant, 'id'|'key'|'menu'|'orders'|'tables'|'staff'>>, // Fields that can be directly updated
        imageFile?: File | null
  ) => Promise<void>;
  addRestaurantTable: (restaurantId: string, tableData: Omit<RestaurantTable, 'id' | 'qrCodeValue'>) => Promise<string | null>;
  updateRestaurantTable: (restaurantId: string, tableId: string, tableData: Partial<RestaurantTable>) => Promise<void>;
  deleteRestaurantTable: (restaurantId: string, tableId: string) => Promise<void>;
  openTableModal: (table?: RestaurantTable) => void; // For table modal
  closeTableModal: () => void;
  openProductModal: (product?: MenuProductType, context?: MenuEditingParentContext) => void;
  closeProductModal: () => void;
  openCategoryModal: (
    type: 'category' | 'subCategory', 
    category?: MenuCategoryData | MenuSubCategoryData, 
    context?: MenuEditingParentContext // Use the updated context type
  ) => void;
  closeCategoryModal: () => void;
  
  clearError: () => void; 
  cleanupAllListeners: () => void; 
}

export type AppRestaurantStore = AppRestaurantStoreState & AppRestaurantStoreActions;

const initialRestaurantState: AppRestaurantStoreState = {
  restaurantsList: [],
  currentRestaurant: null,
  currentRestaurantMenu: null,
  currentTableOrders: null,
  allRestaurantOrders: [], 
  isLoadingList: false,
  isLoadingDetails: false,
  isLoadingMenu: false,
  isLoadingTableOrders: false,
  isLoadingAllOrders: false,           
  error: null,      
  errorMenu: null,  
  errorTableOrders: null,
  errorAllOrders: null,         
  activeListeners: {},
  menuEditing: {
    isProductModalOpen: false,
    isCategoryModalOpen: false,
    editingItem: null,
    editingItemType: null,
    parentContext: {},
    isTableModalOpen: false
  },
};

const processFirebaseMenu = (rawMenu?: RawRestaurantMenuFirebase): ProcessedMenu | null => {
  if (!rawMenu) return null;
  const processed: ProcessedMenu = [];
  Object.keys(rawMenu).forEach(categoryKey => {
    const rawCategory = rawMenu[categoryKey];
    if (!rawCategory || typeof rawCategory !== 'object') return; 
    const categoryData: MenuCategoryData = {
      key: categoryKey, name: rawCategory.name || 'Unnamed Category', subCategories: [],
    };
    if (rawCategory.subCategory) { 
      Object.keys(rawCategory.subCategory).forEach(subCategoryKey => {
        const rawSubCategory = rawCategory.subCategory![subCategoryKey];
        if (!rawSubCategory || typeof rawSubCategory !== 'object') return; 
        const subCategoryData: MenuSubCategoryData = {
          key: subCategoryKey, name: rawSubCategory.name || 'Unnamed Sub-Category', products: [],
        };
        if (rawSubCategory.products) {
          Object.keys(rawSubCategory.products).forEach(productKey => {
            const rawProduct = rawSubCategory.products![productKey] as RawProductFirebase;
            if (!rawProduct || typeof rawProduct !== 'object') return; 
            subCategoryData.products.push({
              key: productKey, name: rawProduct.name || 'Unnamed Product',
              description: rawProduct.description,
              price: typeof rawProduct.price === 'number' ? rawProduct.price : 0,
              veg: rawProduct.veg === true || rawProduct.veg === 'true',
              outofstock: rawProduct.outOfStock || rawProduct.outofstock, 
              icon: rawProduct.icon,
            } as MenuProductType); 
          });
        }
        categoryData.subCategories.push(subCategoryData);
      });
    }
    processed.push(categoryData);
  });
  return processed;
};

export const useRestaurantStore = create<AppRestaurantStore>((set, get) => ({
  ...initialRestaurantState,

  // --- Menu Editing UI Actions ---
  openProductModal: (product, context) => set(state => ({ 
    menuEditing: { 
        ...state.menuEditing, 
        isProductModalOpen: true, 
        editingItem: product || null, 
        editingItemType: 'product',
        parentContext: context // Context now includes restaurantId, categoryId, subCategoryId
    } 
  })),
  closeProductModal: () => set(state => ({ 
    menuEditing: { ...state.menuEditing, isProductModalOpen: false, editingItem: null, editingItemType: null, parentContext: {} } 
  })),
  
  openCategoryModal: (type, category, context) => set(state => ({
    menuEditing: {
        ...state.menuEditing,
        isCategoryModalOpen: true,
        editingItem: category || null,
        editingItemType: type,
        parentContext: context, // Context now includes restaurantId, categoryId
    }
  })),
  closeCategoryModal: () => set(state => ({
    menuEditing: { ...state.menuEditing, isCategoryModalOpen: false, editingItem: null, editingItemType: null, parentContext: {} }
  })),
  openTableModal: (table) => set(state => ({menuEditing: {...state.menuEditing, isTableModalOpen: true, editingItem: table || null, editingItemType: 'table' }})),
  closeTableModal: () => set(state => ({menuEditing: {...state.menuEditing, isTableModalOpen: false, editingItem: null, editingItemType: null }})),


  // --- Existing Actions (ensure they are complete and correct) ---
  listenToAllRestaurants: () => {
    get().activeListeners.allRestaurants?.(); 
    set({ isLoadingList: true, error: null });
    const dbRef = restaurantService.getAll();
    const listener = dbRef.on('value', (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val();
        const list: Restaurant[] = data ? Object.keys(data).map(key => ({ ...data[key], id: key, key: key })) : [];
        set({ restaurantsList: list, isLoadingList: false });
      },
      (errorObject: Error) => { 
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
    if (!restaurantId) { set({ error: "Restaurant ID is required.", isLoadingDetails: false, isLoadingMenu: false }); return; }
    get().stopListeningToRestaurantDetails(); 
    set({ 
        isLoadingDetails: true, isLoadingMenu: true, error: null, errorMenu: null, 
        currentRestaurant: null, currentRestaurantMenu: null, allRestaurantOrders: []
    });
    const dbRef = restaurantService.get(restaurantId);
    const listener = dbRef.on('value', (snapshot: firebase.database.DataSnapshot) => {
        if (snapshot.exists()) {
          const restaurantData = snapshot.val() as Restaurant; 
          const processedMenu = processFirebaseMenu(restaurantData.menu);
          set({ 
            currentRestaurant: { ...restaurantData, id: snapshot.key!, key: snapshot.key! }, 
            currentRestaurantMenu: processedMenu,
            isLoadingDetails: false, isLoadingMenu: false 
          });
          get().listenToAllRestaurantOrders(snapshot.key!);
        } else {
          set({ 
            currentRestaurant: null, currentRestaurantMenu: null, isLoadingDetails: false, 
            isLoadingMenu: false, error: "Restaurant not found.", errorMenu: "Menu not found."
          });
        }
      },
      (errorObject: Error) => {
        set({ error: errorObject.message, errorMenu: errorObject.message, isLoadingDetails: false, isLoadingMenu: false });
      }
    );
    set(state => ({ activeListeners: { ...state.activeListeners, restaurantDetailsAndMenu: () => dbRef.off('value', listener) } }));
  },
  stopListeningToRestaurantDetails: () => { 
    get().activeListeners.restaurantDetailsAndMenu?.();
    const restaurantId = get().currentRestaurant?.id;
    if (restaurantId) get().stopListeningToAllRestaurantOrders(restaurantId);
    set(state => ({ activeListeners: { ...state.activeListeners, restaurantDetailsAndMenu: undefined }}));
  },
  listenToAllRestaurantOrders: (restaurantId: string) => {
    if (!restaurantId) { set({ errorAllOrders: "Restaurant ID required.", isLoadingAllOrders: false }); return; }
    get().stopListeningToAllRestaurantOrders(restaurantId); 
    set({ isLoadingAllOrders: true, errorAllOrders: null });
    const ordersRef = restaurantService.getOrdersFromRestaurantRef(restaurantId);
    const listener = ordersRef.orderByChild('orderTimestamp').on('value', (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val();
        const ordersArray: RestaurantOrder[] = [];
        if (data) {
            Object.keys(data).forEach(key => {
                const orderVal = data[key];
                ordersArray.push({ 
                    id: key, key: key,
                    type: orderVal.type || 'dine-in',
                    products: orderVal.products || {},
                    totalPrice: typeof orderVal.totalPrice === 'number' ? orderVal.totalPrice : 0,
                    orderTimestamp: typeof orderVal.orderTimestamp === 'number' ? orderVal.orderTimestamp : Date.now(),
                    status: orderVal.status || 'pending',
                    restaurantId: orderVal.restaurantId || restaurantId,
                    ...orderVal 
                });
            });
        }
        set({ allRestaurantOrders: ordersArray.reverse(), isLoadingAllOrders: false });
      },
      (errorObject: Error) => {
        set({ errorAllOrders: errorObject.message, isLoadingAllOrders: false, allRestaurantOrders: [] });
      }
    );
    const listenerKey = `allRestaurantOrders_${restaurantId}`;
    set(state => ({ activeListeners: { ...state.activeListeners, [listenerKey]: () => ordersRef.off('value', listener) } }));
  },
  stopListeningToAllRestaurantOrders: (restaurantId: string) => {
    const listenerKey = `allRestaurantOrders_${restaurantId}`;
    const activeListener = (get().activeListeners as RestaurantActiveListeners)[listenerKey as keyof RestaurantActiveListeners] as (() => void) | undefined;
    activeListener?.();
    set(state => {
        const newListeners = {...state.activeListeners};
        delete newListeners[listenerKey as keyof RestaurantActiveListeners];
        return {activeListeners: newListeners};
    });
  },
  updateRestaurantOrderStatus: async (restaurantId: string, orderId: string, newStatus: RestaurantOrder['status']) => {
    set({ isLoadingAllOrders: true }); 
    try {
        await restaurantService.updateOrderStatus(restaurantId, orderId, newStatus);
        set(state => ({
            allRestaurantOrders: state.allRestaurantOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ),
            isLoadingAllOrders: false
        }));
    } catch (errorObject: any) {
        set({ errorAllOrders: errorObject.message || "Failed to update status.", isLoadingAllOrders: false });
    }
  },
  updateRestaurantOrderPaymentStatus: async (restaurantId: string, orderId: string, newPaymentStatus: PaymentStatus) => {
    set({ isLoadingAllOrders: true }); // Or a more specific loading state for payment update
    try {
        await restaurantService.updateOrderPaymentStatus(restaurantId, orderId, newPaymentStatus);
        // Listener should pick up the change, or update optimistically:
        set(state => ({
            allRestaurantOrders: state.allRestaurantOrders.map(order =>
                order.id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
            ),
            isLoadingAllOrders: false
        }));
    } catch (errorObject: any) {
        console.error(`Error updating payment status for order ${orderId}:`, errorObject);
        set({ errorAllOrders: errorObject.message || "Failed to update payment status.", isLoadingAllOrders: false });
    }
  },
  clearError: () => { 
    set({ error: null, errorMenu: null, errorTableOrders: null, errorAllOrders: null }); 
  },
  cleanupAllListeners: () => { 
    const localListeners = get().activeListeners;
    Object.values(localListeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
    });
    set({ activeListeners: {} });
  },

  createRestaurant: async (data) => { 
    set({ isLoadingList: true });
    try {
        const ref = await restaurantService.create(data);
        set({ isLoadingList: false });
        return ref.key;
    } catch(e: any) {
        set({ error: e.message, isLoadingList: false });
        return null;
    }
  },
  updateRestaurant: async (id, data) => { 
    set({ isLoadingDetails: true });
    try {
        await restaurantService.update(id, data);
        set(state => ({ 
            currentRestaurant: state.currentRestaurant?.id === id ? { ...state.currentRestaurant, ...data } : state.currentRestaurant,
            isLoadingDetails: false 
        }));
    } catch(e: any) {
        set({ error: e.message, isLoadingDetails: false });
    }
  },
  deleteRestaurant: async (id) => { 
    set({ isLoadingList: true }); 
    try {
        await restaurantService.delete(id);
        set(state => ({
            restaurantsList: state.restaurantsList.filter(r => r.id !== id),
            currentRestaurant: state.currentRestaurant?.id === id ? null : state.currentRestaurant,
            currentRestaurantMenu: state.currentRestaurant?.id === id ? null : state.currentRestaurantMenu,
            allRestaurantOrders: state.currentRestaurant?.id === id ? [] : state.allRestaurantOrders,
            isLoadingList: false,
        }));
    } catch(e: any) {
        set({ error: e.message, isLoadingList: false });
    }
  },
  
  addMenuCategory: async (restaurantId, categoryData) => { 
    if(!get().currentRestaurant || get().currentRestaurant?.id !== restaurantId) {
        set({errorMenu: "Restaurant context not loaded for adding category."});
        return null;
    }
    set({ isLoadingMenu: true });
    try {
        const ref = await restaurantService.addRestaurantMenuCategory({id: restaurantId}, categoryData);
        set({ isLoadingMenu: false });
        return ref.key;
    } catch(e: any) {
        set({ errorMenu: e.message, isLoadingMenu: false });
        return null;
    }
  },
  addMenuSubCategory: async (restaurantId, menuCategoryId, categoryData) => { 
    if(!get().currentRestaurant || get().currentRestaurant?.id !== restaurantId) {
        set({errorMenu: "Restaurant context not loaded for adding category."});
        return null;
    }
    set({ isLoadingMenu: true });
    try {
        const ref = await restaurantService.addMenuSubCategory(restaurantId, menuCategoryId, categoryData);
        set({ isLoadingMenu: false });
        return ref.key;
    } catch(e: any) {
        set({ errorMenu: e.message, isLoadingMenu: false });
        return null;
    }
  },
  updateMenuCategory: async (keys, data) => { 
    set({ isLoadingMenu: true });
    try {
        await restaurantService.editRestaurantMenuCategory(keys, data);
        set({ isLoadingMenu: false });
    } catch(e: any) {
        set({ errorMenu: e.message, isLoadingMenu: false });
    }
  },
  deleteMenuCategory: async (keys) => { 
    set({ isLoadingMenu: true });
    try {
        await restaurantService.deleteRestaurantMenuCategory(keys);
        set({ isLoadingMenu: false });
    } catch(e: any) {
        set({ errorMenu: e.message, isLoadingMenu: false });
    }
  },
  deleteMenuSubCategory: async (keys) => { 
    set({ isLoadingMenu: true });
    try {
        await restaurantService.deleteMenuSubCategory(keys);
        set({ isLoadingMenu: false });
    } catch(e: any) {
        set({ errorMenu: e.message, isLoadingMenu: false });
    }
  },

  addMenuItem: async (keys, itemData, image) => { 
    set({ isLoadingMenu: true });
    try {
        if (image !== null){
          itemData.icon = await restaurantService.uploadMenuItemImage(keys, image)
        }
        console.log(itemData,image)
        const ref = await restaurantService.addRestaurantMenuItem(keys, itemData);
        set({ isLoadingMenu: false });
        return ref.key;
    } catch(e: any) {
        set({ errorMenu: e.message, isLoadingMenu: false });
        return null;
    }
  },
  updateMenuItem: async (keys, itemData, image) => { 
    set({ isLoadingMenu: true });
    try {
        if (image !== null){
          itemData.icon = await restaurantService.uploadMenuItemImage(keys, image)
        }
        await restaurantService.editRestaurantMenuItem(keys, itemData);
        set({ isLoadingMenu: false });
    } catch(e: any) {
        set({ errorMenu: e.message, isLoadingMenu: false });
    }
  },
  deleteMenuItem: async (keys) => { 
    set({ isLoadingMenu: true });
    try {
        await restaurantService.deleteRestaurantMenuItem(keys);
        set({ isLoadingMenu: false });
    } catch(e: any) {
        set({ errorMenu: e.message, isLoadingMenu: false });
    }
  },
    updateRestaurantDetails: async (restaurantId, details, imageFile) => {
    set({ isLoadingDetails: true, error: null });
    try {
        let imageUrl = get().currentRestaurant?.imageUrl || null; // Keep existing if no new file
        if (imageFile) {
            imageUrl = await restaurantService.uploadRestaurantImage(restaurantId, imageFile);
        }
        const dataToUpdate: Partial<Restaurant> = { ...details };
        if (imageUrl !== undefined) { // Only update if imageUrl changed or was set
            dataToUpdate.imageUrl = imageUrl;
        }
        await restaurantService.update(restaurantId, dataToUpdate);
        // The listener on restaurantDetailsAndMenu should refresh currentRestaurant
        set({ isLoadingDetails: false });
    } catch (e: any) {
        set({ error: e.message || "Failed to update restaurant details", isLoadingDetails: false });
    }
  },
  addRestaurantTable: async (restaurantId, tableData) => {
    if(!get().currentRestaurant || get().currentRestaurant?.id !== restaurantId) {
        set({error: "Restaurant context error for adding table."});
        return null;
    }
    set({ isLoadingDetails: true }); // Use general details loader or a specific one for tables
    try {
        const tableRef = await restaurantService.addRestaurantTable(restaurantId, tableData);
        // Listener on restaurantDetailsAndMenu should refresh the currentRestaurant.tables
        set({ isLoadingDetails: false });
        return tableRef.key;
    } catch (e: any) {
        set({ error: e.message || "Failed to add table.", isLoadingDetails: false });
        return null;
    }
  },
  updateRestaurantTable: async (restaurantId, tableId, tableData) => {
    set({ isLoadingDetails: true });
    try {
        await restaurantService.updateRestaurantTable(restaurantId, tableId, tableData);
        set({ isLoadingDetails: false });
    } catch (e: any) {
        set({ error: e.message || "Failed to update table.", isLoadingDetails: false });
    }
  },
  deleteRestaurantTable: async (restaurantId, tableId) => {
    set({ isLoadingDetails: true });
    try {
        await restaurantService.deleteRestaurantTable(restaurantId, tableId);
        set({ isLoadingDetails: false });
    } catch (e: any) {
        set({ error: e.message || "Failed to delete table.", isLoadingDetails: false });
    }
  },

  addTableOrder: async (keys, orderData) => { 
    set({ isLoadingTableOrders: true });
    try {
        const ref = await restaurantService.addOrderToTable(keys, orderData);
        set({ isLoadingTableOrders: false });
        return ref.key;
    } catch(e: any) {
        set({ errorTableOrders: e.message, isLoadingTableOrders: false });
        return null;
    }
  },
  updateTableOrder: async (keys, orderData) => { 
    set({ isLoadingTableOrders: true });
    try {
        await restaurantService.updateTableOrder(keys, orderData);
        set({ isLoadingTableOrders: false });
    } catch(e: any) {
        set({ errorTableOrders: e.message, isLoadingTableOrders: false });
    }
  },
  clearTableOrders: async (keys) => { 
    set({ isLoadingTableOrders: true });
    try {
        await restaurantService.clearTableOrders(keys);
        set({ isLoadingTableOrders: false, currentTableOrders: null }); 
    } catch(e: any) {
        set({ errorTableOrders: e.message, isLoadingTableOrders: false });
    }
  },
  listenToTableOrders: (keys) => { 
    get().stopListeningToTableOrders(keys.id, keys.tableId); 
    set({ isLoadingTableOrders: true, errorTableOrders: null, currentTableOrders: null });
    const dbRef = restaurantService.getTableOrders(keys);
    const listener = dbRef.on('value', (snapshot: firebase.database.DataSnapshot) => {
        const ordersData = snapshot.val() as Record<string, TableOrder> | null;
        set({ currentTableOrders: ordersData || {}, isLoadingTableOrders: false });
      },
      (errorObject: Error) => {
        set({ errorTableOrders: errorObject.message, isLoadingTableOrders: false });
      }
    );
    const listenerKey = `tableOrders_${keys.id}_${keys.tableId}`;
    set(state => ({ activeListeners: { ...state.activeListeners, [listenerKey]: () => dbRef.off('value', listener) } }));
  },
  stopListeningToTableOrders: (restaurantId, tableId) => { 
    const listenerKey = `tableOrders_${restaurantId}_${tableId}`;
    const activeListener = (get().activeListeners as RestaurantActiveListeners)[listenerKey as keyof RestaurantActiveListeners] as (() => void) | undefined;
    activeListener?.();
    set(state => {
        const newListeners = {...state.activeListeners};
        delete newListeners[listenerKey as keyof RestaurantActiveListeners];
        return {activeListeners: newListeners};
    });
  },
  addRestaurantOrder: async (restaurantId, orderData) => { 
    set({ isLoadingDetails: true }); 
    try {
        const ref = await restaurantService.addOrderToRestaurant({id: restaurantId}, orderData);
        set({ isLoadingDetails: false });
        return ref.key;
    } catch(e: any) {
        set({ error: e.message, isLoadingDetails: false }); 
        return null;
    }
  },
}));
