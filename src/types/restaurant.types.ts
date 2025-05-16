// src/types/restaurant.types.ts

/**
 * Represents a single menu item/product.
 */
export interface MenuItem {
    id: string; // Firebase key for the menu item
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable?: boolean; // Renamed from availability for clarity
    categoryName?: string; // Optional: denormalized for easier display
    subCategoryName?: string; // Optional: denormalized
    // Add any other properties for a menu item
    [key: string]: any;
  }
  
  /**
   * Represents a sub-category within a menu category, containing products.
   */
  export interface MenuSubCategory {
    id: string; // Firebase key for the sub-category
    name: string;
    description?: string;
    products?: Record<string, MenuItem>; // Key is MenuItem id (Firebase key)
    // Add any other properties for a sub-category
    [key: string]: any;
  }
  
  /**
   * Represents a main category in the menu.
   */
  export interface MenuCategory {
    id: string; // Firebase key for the menu category
    name: string;
    description?: string;
    // Changed to allow for a list of subcategories if preferred over Record
    subCategories?: Record<string, MenuSubCategory>; // Key is MenuSubCategory id (Firebase key)
    // Add any other properties for a menu category
    [key: string]: any;
  }
  
  /**
   * Represents the entire menu structure for a restaurant.
   * The keys are the Firebase-generated keys for each menu category.
   */
  export interface RestaurantMenu {
    [menuCategoryId: string]: MenuCategory;
  }
  
  /**
   * Represents an item within a table order.
   */
  export interface TableOrderItem {
    menuItemId: string; // Reference to the MenuItem's id
    name: string; // Denormalized for display
    quantity: number;
    priceAtOrder: number; // Price at the time of order
  }
  
  /**
   * Represents an order placed at a specific table.
   */
  export interface TableOrder {
    id: string; // Firebase key for the table order
    items: TableOrderItem[];
    totalAmount: number;
    orderTimestamp: number; // Unix timestamp (e.g., Date.now())
    status: 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
    notes?: string;
    // Add any other properties for a table order
    [key: string]: any;
  }
  
  /**
   * Represents a table in the restaurant.
   */
  export interface RestaurantTable {
    id: string; // User-defined ID for the table (e.g., "T1", "P2")
    name: string; // e.g., "Table 1", "Patio Seat 5"
    capacity?: number;
    status?: 'available' | 'occupied' | 'reserved' | 'needs_cleaning';
    // Orders are stored under a sub-collection, keys are Firebase-generated order IDs
    orders?: Record<string, TableOrder>;
    // Add any other properties for a table
    [key: string]: any;
  }
  
  /**
   * Represents an item within a general restaurant order.
   */
  export interface RestaurantOrderItem {
    menuItemId: string;
    name: string;
    quantity: number;
    priceAtOrder: number;
  }
  
  /**
   * Represents an order associated directly with the restaurant.
   */
  export interface RestaurantOrder {
    id: string; // Firebase key for the restaurant order
    type: 'dine-in' | 'takeaway' | 'delivery' | 'online';
    tableId?: string; // If dine-in, references RestaurantTable.id
    customerName?: string;
    customerPhone?: string;
    items: RestaurantOrderItem[];
    totalAmount: number;
    orderTimestamp: number; // Unix timestamp
    status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled';
    paymentStatus?: 'pending' | 'paid' | 'refunded';
    paymentMethod?: string;
    deliveryAddress?: string;
    notes?: string;
    tableClearTimestamp?: number; // For dine-in, when the table associated with this order was cleared
    // Add any other properties
    [key: string]: any;
  }
  
  /**
   * Represents the main Restaurant data structure.
   */
  export interface Restaurant {
    id: string; // Firebase key for the restaurant
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    cuisineType?: string[];
    operatingHours?: Record<string, string>; // e.g., "monday": "9am-10pm"
    ownerId?: string; // UID of the user who owns/manages this restaurant
    imageUrl?: string;
    isActive?: boolean;
    // Sub-collections. Keys are Firebase-generated keys.
    menu?: RestaurantMenu;
    tables?: Record<string, RestaurantTable>; // User-defined table IDs are keys
    orders?: Record<string, RestaurantOrder>; // Firebase-generated order IDs are keys
    staff?: Record<string, { userId: string; role: string; }>; // Firebase-generated staff entry IDs
    // Add any other restaurant properties
    [key: string]: any;
  }
  
  // --- Argument Types for Service Methods ---
  // These help in defining the structure of 'keys' objects passed to service methods.
  
  export interface RestaurantIdParam {
    id: string; // Restaurant ID (Firebase key)
  }
  
  export interface RestaurantMenuCategoryPathKeys extends RestaurantIdParam {
    // `subId` in your original service was used as the MenuCategory ID
    menuCategoryId: string;
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
  