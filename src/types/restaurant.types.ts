// src/types/restaurant.types.ts
import { OrderProduct } from './user.types'; // Import OrderProduct if it's the same structure

// --- Raw Firebase Data Structures (for menu processing) ---
export interface RawProductFirebase {
  name: string;
  description?: string;
  price: number;
  veg?: boolean | string; 
  outOfStock?: boolean;   
  outofstock?: boolean;   
  icon?: string;          
  [key: string]: any;
}
export interface RawMenuSubCategoryFirebase {
  name: string;
  description?: string;
  products?: Record<string, RawProductFirebase>; 
  [key: string]: any;
}
export interface RawMenuCategoryFirebase {
  name: string;
  description?: string;
  subCategory?: Record<string, RawMenuSubCategoryFirebase>; 
  [key: string]: any;
}
export type RawRestaurantMenuFirebase = Record<string, RawMenuCategoryFirebase>;

// --- Processed Application Data Structures (for UI and app logic) ---
export interface Product { // This is the processed product for customer-facing menu
  key: string; 
  name: string;
  description?: string;
  price: number;
  veg?: boolean; 
  outofstock?: boolean; 
  icon?: string; 
  [key: string]: any;
}
export interface MenuSubCategoryData { // Processed for UI
  key: string; 
  name: string;
  description?: string;
  products: Product[]; 
}
export interface MenuCategoryData { // Processed for UI
  key: string; 
  name: string;
  description?: string;
  subCategories: MenuSubCategoryData[]; 
}
export type ProcessedMenu = MenuCategoryData[];

// --- Core Entity Types for Restaurant Management (used in Modals/Services) ---
export interface MenuItem { 
  id: string; 
  name: string;
  description?: string;
  price: number;
  imageUrl?: string; 
  isAvailable?: boolean; 
  veg?: boolean | string; 
  outOfStock?: boolean;   
  categoryName?: string; 
  subCategoryName?: string; 
  [key: string]: any;
}
// This type is for the data structure of a sub-category when creating/editing it.
// It might not have products directly if products are managed separately.
export interface MenuSubCategory { 
  id: string; 
  name: string;
  description?: string;
  // products?: Record<string, MenuItem>; // Products might be managed via addMenuItem action
  [key: string]: any;
}
export interface MenuCategory { 
  id: string; 
  name: string;
  description?: string;
  // 'subCategories' here refers to the collection of sub-category data under a main category.
  // The keys are sub-category IDs.
  subCategories?: Record<string, Omit<MenuSubCategory, 'id'>>; // When creating/updating a main category with its subcategories
  [key: string]: any;
}
export interface RestaurantMenu { 
  [menuCategoryId: string]: MenuCategory;
}

// --- Order and Table Types for Restaurant Management ---
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
  linkedRestaurantOrderId?: string; 
  [key: string]: any;
}
export interface RestaurantTable {
  id: string; 
  name: string; 
  capacity?: number;
  isActive?: boolean; 
  qrCodeValue?: string; 
  [key: string]: any;
}
export interface RestaurantOrder {
  id: string; 
  key?: string; 
  type: 'dine-in' | 'takeaway' | 'delivery' | 'online';
  tableId?: string; 
  tableName?: string; 
  customerName?: string; 
  customerPhone?: string; 
  userId?: string; 
  products: Record<string, OrderProduct>; 
  totalPrice: number; 
  orderTimestamp: number; 
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'served' | 'paid' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  notes?: string;
  tableClearTimestamp?: number; 
  [key: string]: any;
}

// --- Main Restaurant Type ---
export interface Restaurant {
  id: string; 
  key?: string; 
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  icon?: string; 
  location?: string; 
  cuisineType?: string[];
  operatingHours?: Record<string, string>; 
  ownerId?: string; 
  imageUrl?: string; 
  isActive?: boolean;
  registered?: boolean; 
  menu?: RawRestaurantMenuFirebase; 
  tables?: Record<string, RestaurantTable>; 
  orders?: Record<string, Omit<RestaurantOrder, 'id' | 'key'>>; 
  staff?: Record<string, { userId: string; role: string; }>; 
  [key: string]: any;
}

// --- Argument Types for Service Methods (Path Keys) ---
export interface RestaurantIdParam { id: string; }
export interface RestaurantMenuCategoryPathKeys extends RestaurantIdParam { menuCategoryId: string; }

// New PathKey for SubCategory operations
export interface RestaurantMenuSubCategoryPathKeys extends RestaurantMenuCategoryPathKeys {
  subCategoryId: string;
}

export interface RestaurantMenuItemPathKeys extends RestaurantMenuSubCategoryPathKeys { // MenuItem is under SubCategory
  menuItemId: string;       
}
export interface RestaurantTablePathKeys extends RestaurantIdParam { tableId: string; }
export interface RestaurantTableOrderPathKeys extends RestaurantTablePathKeys { orderId: string; }
