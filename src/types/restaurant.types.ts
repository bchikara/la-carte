// src/types/restaurant.types.ts
import { OrderProduct } from './user.types'; // Assuming OrderProduct is defined in user.types.ts

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
export interface Product { 
  key: string; 
  name: string;
  description?: string;
  price: number;
  veg?: boolean; 
  outofstock?: boolean; 
  icon?: string; 
  [key: string]: any;
}
export interface MenuSubCategoryData { 
  key: string; 
  name: string;
  description?: string;
  products: Product[]; 
}
export interface MenuCategoryData { 
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
export interface MenuSubCategory { 
  id: string; 
  name: string;
  description?: string;
  [key: string]: any;
}
export interface MenuCategory { 
  id: string; 
  name: string;
  description?: string;
  subCategories?: Record<string, Omit<MenuSubCategory, 'id'>>; 
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

// Define more granular statuses
export type OrderStatus = 
  | 'pending'       // Customer placed, awaiting restaurant confirmation
  | 'confirmed'     // Restaurant confirmed, preparing
  | 'preparing'     // Food is being prepared
  | 'ready_for_pickup' // For takeaway
  | 'out_for_delivery' // For delivery
  | 'served'        // For dine-in, food served to table
  | 'completed'     // Order fulfilled (picked up, delivered, or dine-in finished before payment)
  | 'paid'          // Payment confirmed, order fully closed (often follows completed/served)
  | 'cancelled_user'// Cancelled by user
  | 'cancelled_restaurant' // Cancelled by restaurant
  | 'failed';       // Payment failed or other critical failure

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'not_applicable';


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
  status: OrderStatus; // Use the more granular OrderStatus type
  paymentStatus?: PaymentStatus;
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
  imageUrl?: string | null; 
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
export interface RestaurantMenuSubCategoryPathKeys extends RestaurantMenuCategoryPathKeys { subCategoryId: string; }
export interface RestaurantMenuItemPathKeys extends RestaurantMenuSubCategoryPathKeys { menuItemId: string; }
export interface RestaurantTablePathKeys extends RestaurantIdParam { tableId: string; }
export interface RestaurantTableOrderPathKeys extends RestaurantTablePathKeys { orderId: string; }
