// src/types/restaurant.types.ts

// --- Raw Firebase Data Structures (for menu processing) ---

/**
 * Represents the raw structure of a product as it might come from Firebase
 * before processing (e.g., 'veg' might be a string).
 */
export interface RawProductFirebase {
  name: string;
  description?: string;
  price: number;
  veg?: boolean | string; // Can be string "true"/"false" or boolean from Firebase
  outOfStock?: boolean;   // Firebase might use camelCase for this
  outofstock?: boolean;   // Or lowercase, common in original code
  icon?: string;          // Optional product image URL
  // Add any other raw properties from Firebase
  [key: string]: any;
}

/**
 * Represents the raw structure of a sub-category from Firebase.
 * Note: Firebase typically uses an object (Record) for collections where keys are auto-generated.
 */
export interface RawMenuSubCategoryFirebase {
  name: string;
  description?: string;
  products?: Record<string, RawProductFirebase>; // Products under their Firebase keys
  // Add any other raw properties
  [key: string]: any;
}

/**
 * Represents the raw structure of a menu category from Firebase.
 * The store's processFirebaseMenu function expects `subCategory` (singular key)
 * for the collection of sub-categories.
 */
export interface RawMenuCategoryFirebase {
  name: string;
  description?: string;
  subCategory?: Record<string, RawMenuSubCategoryFirebase>; // SubCategories under their Firebase keys
  // Add any other raw properties
  [key: string]: any;
}

/**
 * Represents the raw menu structure as fetched from Firebase for a restaurant.
 * Keys are auto-generated Firebase keys for each top-level menu category.
 */
export type RawRestaurantMenuFirebase = Record<string, RawMenuCategoryFirebase>;


// --- Processed Application Data Structures (for UI and app logic) ---

/**
 * Represents a single menu item/product after processing for app use.
 * This is the structure your UI components will typically work with.
 */
export interface Product {
  key: string; // Firebase key of the product
  name: string;
  description?: string;
  price: number;
  veg?: boolean; // Normalized to boolean
  outofstock?: boolean; // Normalized
  icon?: string; // Optional product image URL
  // Add any other processed properties
  [key: string]: any;
}

/**
 * Represents a sub-category within a menu category, after processing.
 */
export interface MenuSubCategoryData {
  key: string; // Firebase key of the sub-category
  name: string;
  description?: string;
  products: Product[]; // Array of processed Product objects
}

/**
 * Represents a main category in the menu, after processing.
 */
export interface MenuCategoryData {
  key: string; // Firebase key of the category
  name: string;
  description?: string;
  subCategories: MenuSubCategoryData[]; // Array of processed MenuSubCategoryData objects
}

/**
 * Type for the fully processed menu structure used throughout the application.
 */
export type ProcessedMenu = MenuCategoryData[];


// --- Core Entity Types (often with IDs, for service parameters or when ID is known) ---
// These types represent the entities as you might define or update them, including their IDs.

/**
 * Represents a single menu item/product, typically including its ID.
 * Used for parameters in service/store actions where an ID is relevant.
 */
export interface MenuItem {
  id: string; // Firebase key for the menu item
  name: string;
  description?: string;
  price: number;
  imageUrl?: string; // Consistent with your initial MenuItem
  isAvailable?: boolean; // Consistent with your initial MenuItem
  veg?: boolean | string; // Allow for raw input before normalization
  outOfStock?: boolean;   // Allow for raw input
  categoryName?: string; 
  subCategoryName?: string; 
  [key: string]: any;
}

/**
 * Represents a sub-category, typically including its ID.
 */
export interface MenuSubCategory {
  id: string; // Firebase key for the sub-category
  name: string;
  description?: string;
  products?: Record<string, MenuItem>; // Products under their Firebase keys, using the MenuItem type
  [key: string]: any;
}

/**
 * Represents a main menu category, typically including its ID.
 * Note: The store's processFirebaseMenu expects `subCategory` (singular) from raw data,
 * but when defining a MenuCategory for creation/update, `subCategories` (plural) might be more intuitive.
 * For consistency with `RawMenuCategoryFirebase` and `processFirebaseMenu`, let's align.
 * If `MenuCategory` is used for *creating* data, its `subCategories` might be structured differently
 * than when *fetching* raw data. The store actions use `Omit<MenuCategory, 'id'>`.
 * The `restaurant_store_ts_v3_updated` uses `MenuCategory` from types for `addMenuCategory` param.
 * The user's original `MenuCategory` type had `subCategories?: Record<string, MenuSubCategory>;`.
 * The `RawMenuCategoryFirebase` has `subCategory?: Record<string, RawMenuSubCategoryFirebase>;`.
 * Let's keep the user's original structure for this `MenuCategory` type if it's used for service params.
 */
export interface MenuCategory {
  id: string; // Firebase key for the menu category
  name: string;
  description?: string;
  subCategories?: Record<string, MenuSubCategory>; // Plural, as in user's original type structure
  [key: string]: any;
}

/**
 * Represents the entire menu structure for a restaurant, using the MenuCategory type.
 * Keys are Firebase-generated keys for each menu category.
 */
export interface RestaurantMenu {
  [menuCategoryId: string]: MenuCategory;
}


// --- Order and Table Types ---

export interface TableOrderItem {
  menuItemId: string; 
  name: string; 
  quantity: number;
  priceAtOrder: number; 
}

export interface TableOrder {
  id: string; 
  items: TableOrderItem[];
  totalAmount: number;
  orderTimestamp: number; 
  status: 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
  notes?: string;
  [key: string]: any;
}

export interface RestaurantTable {
  id: string; // User-defined ID for the table (e.g., "T1", "P2")
  name: string; 
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved' | 'needs_cleaning';
  orders?: Record<string, TableOrder>; // Keys are Firebase-generated order IDs
  [key: string]: any;
}

export interface RestaurantOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  priceAtOrder: number;
}

export interface RestaurantOrder {
  id: string; 
  type: 'dine-in' | 'takeaway' | 'delivery' | 'online';
  tableId?: string; 
  customerName?: string;
  customerPhone?: string;
  items: RestaurantOrderItem[];
  totalAmount: number;
  orderTimestamp: number; 
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  deliveryAddress?: string;
  notes?: string;
  tableClearTimestamp?: number; 
  [key: string]: any;
}

// --- Main Restaurant Type ---

/**
 * Represents the main Restaurant data structure.
 * The `menu` property should align with the raw structure expected from Firebase
 * for processing by `processFirebaseMenu` in the store.
 */
export interface Restaurant {
  id: string; // Firebase key for the restaurant
  key?: string; // Alias for id, ensure consistency
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  icon?: string; // Restaurant's main image/logo
  location?: string; // For filtering
  cuisineType?: string[];
  operatingHours?: Record<string, string>; 
  ownerId?: string; 
  imageUrl?: string; // Potentially same as 'icon', or for a different banner image
  isActive?: boolean;
  menu?: RawRestaurantMenuFirebase; // Uses the Raw Firebase structure for menu
  tables?: Record<string, RestaurantTable>; 
  orders?: Record<string, RestaurantOrder>; 
  staff?: Record<string, { userId: string; role: string; }>; 
  [key: string]: any;
}

// --- Argument Types for Service Methods (Path Keys) ---

export interface RestaurantIdParam {
  id: string; 
}

export interface RestaurantMenuCategoryPathKeys extends RestaurantIdParam {
  menuCategoryId: string; // ID of the main menu category (Firebase key)
}

export interface RestaurantMenuItemPathKeys extends RestaurantIdParam {
  menuCategoryId: string;   // ID of the main menu category
  subCategoryId: string;    // ID of the sub-category within the menu category
  menuItemId: string;       // ID of the menu item within the sub-category's products
}

export interface RestaurantTablePathKeys extends RestaurantIdParam {
  tableId: string; // User-defined Table ID (e.g., "T1")
}

export interface RestaurantTableOrderPathKeys extends RestaurantTablePathKeys {
  orderId: string; // Firebase-generated Order ID within that table's orders
}
