// src/services/restaurantService.ts

import { database, storage } from '../config/firebaseConfig'; // Adjust path to your Firebase config
import firebase from 'firebase/compat/app'; // For types like firebase.database.Reference
import {
  Restaurant,
  MenuCategory,
  MenuItem,
  MenuSubCategory, // Added for sub-category operations
  TableOrder,
  RestaurantOrder,
  RestaurantIdParam,
  RestaurantMenuCategoryPathKeys,
  RestaurantMenuSubCategoryPathKeys, // Added
  RestaurantMenuItemPathKeys,
  RestaurantTablePathKeys,
  RestaurantTableOrderPathKeys,
  PaymentStatus,
  RestaurantTable,
} from '../types/restaurant.types'; // Adjust path as needed

const RESTAURANTS_PATH = "/restaurants";
const RESTAURANT_IMAGES_PATH = "restaurantImages";

class RestaurantDataService {
  private db: firebase.database.Reference;
  private storageRef: firebase.storage.Reference;

  constructor() {
    this.db = database.ref(RESTAURANTS_PATH);
    this.storageRef = storage.ref();
  }

  getAll(): firebase.database.Reference {
    return this.db;
  }

  get(id: string): firebase.database.Reference {
    return this.db.child(id);
  }

  create(restaurant: Omit<Restaurant, 'id' | 'key'>): Promise<firebase.database.Reference> {
    const newRef = this.db.push();
    return newRef.set(restaurant).then(() => newRef);
  }

  update(restaurantId: string, value: Partial<Restaurant>): Promise<void> {
    return this.db.child(restaurantId).update(value);
  }

  delete(restaurantId: string): Promise<void> {
    return this.db.child(restaurantId).remove();
  }

  // --- Menu Category Methods ---
  getRestaurantMenuCategory(keys: RestaurantMenuCategoryPathKeys): firebase.database.Reference {
    return this.db.child(keys.id).child('menu').child(keys.menuCategoryId);
  }

  addRestaurantMenuCategory(keys: RestaurantIdParam, value: Omit<MenuCategory, 'id'>): Promise<firebase.database.Reference> {
    // Ensure subCategories is initialized if not provided, or handle as per your data model
    const categoryData = { ...value, subCategories: value.subCategories || {} };
    const newRef = this.db.child(keys.id).child('menu').push();
    return newRef.set(categoryData).then(() => newRef);
  }

  editRestaurantMenuCategory(keys: RestaurantMenuCategoryPathKeys, value: Partial<MenuCategory>): Promise<void> {
    return this.db.child(keys.id).child('menu').child(keys.menuCategoryId).update(value);
  }

  deleteRestaurantMenuCategory(keys: RestaurantMenuCategoryPathKeys): Promise<void> {
    return this.db.child(keys.id).child('menu').child(keys.menuCategoryId).remove();
  }

  async uploadMenuItemImage(keys: Omit<RestaurantMenuItemPathKeys, 'menuItemId'>, image:File){
    const profileImagesRef = storage.ref('restaurantImages'); // Define here or ensure it's accessible
        try {
            const fileRef = profileImagesRef.child(`${keys.id}/${image.name}_${Date.now()}`);
            const snapshot = await fileRef.put(image);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return downloadURL;
        } catch (error) {
            console.error("Error uploading profile image:", error);
            throw error;
        }
  }

  // --- Menu Sub-Category Methods ---
  // Path: restaurants/{restaurantId}/menu/{menuCategoryId}/subCategories/{subCategoryId}
  // Note: Your RawMenuCategoryFirebase uses 'subCategory' (singular) as the key for the collection of sub-categories.
  // The ProcessedMenu types use 'subCategories' (plural). Ensure consistency here.
  // For Firebase paths, we use what's in RawMenuCategoryFirebase: 'subCategory'.

  addMenuSubCategory(
    restaurantId: string,
    menuCategoryId: string,
    subCategoryData: Omit<MenuSubCategory, 'id'>
  ): Promise<firebase.database.Reference> {
    const subCategoryPath = this.db.child(restaurantId).child('menu').child(menuCategoryId).child('subCategory'); // Using singular 'subCategory' for path
    const newRef = subCategoryPath.push();
    // Ensure products is initialized if not provided, or handle as per your data model for MenuSubCategory
    const dataToSave = { ...subCategoryData, products: (subCategoryData as any).products || {} };
    return newRef.set(dataToSave).then(() => newRef);
  }

  editMenuSubCategory(keys: RestaurantMenuSubCategoryPathKeys, data: Partial<MenuSubCategory>): Promise<void> {
    return this.db
      .child(keys.id)
      .child('menu')
      .child(keys.menuCategoryId)
      .child('subCategory') // Using singular 'subCategory' for path
      .child(keys.subCategoryId)
      .update(data);
  }

  deleteMenuSubCategory(keys: RestaurantMenuSubCategoryPathKeys): Promise<void> {
    return this.db
      .child(keys.id)
      .child('menu')
      .child(keys.menuCategoryId)
      .child('subCategory') // Using singular 'subCategory' for path
      .child(keys.subCategoryId)
      .remove();
  }


  // --- Menu Item Methods ---
  // Path: restaurants/{restaurantId}/menu/{menuCategoryId}/subCategory/{subCategoryId}/products/{menuItemId}
  addRestaurantMenuItem(
    keys: Omit<RestaurantMenuItemPathKeys, 'menuItemId'>, 
    value: Omit<MenuItem, 'id'>
  ): Promise<firebase.database.Reference> {
    const newRef = this.db
      .child(keys.id)
      .child('menu')
      .child(keys.menuCategoryId)
      .child('subCategory') // Using singular 'subCategory' for path
      .child(keys.subCategoryId)
      .child('products')
      .push();
    return newRef.set(value).then(() => newRef);
  }

  getRestaurantMenuItem(keys: RestaurantMenuItemPathKeys): firebase.database.Reference {
    return this.db
      .child(keys.id)
      .child('menu')
      .child(keys.menuCategoryId)
      .child('subCategory') // Using singular 'subCategory' for path
      .child(keys.subCategoryId)
      .child('products')
      .child(keys.menuItemId);
  }

  editRestaurantMenuItem(keys: RestaurantMenuItemPathKeys, value: Partial<MenuItem>): Promise<void> {
    console.log(keys,value)
    return this.db
      .child(keys.id)
      .child('menu')
      .child(keys.menuCategoryId)
      .child('subCategory') // Using singular 'subCategory' for path
      .child(keys.subCategoryId)
      .child('products')
      .child(keys.menuItemId)
      .update(value);
  }

  deleteRestaurantMenuItem(keys: RestaurantMenuItemPathKeys): Promise<void> {
    return this.db
      .child(keys.id)
      .child('menu')
      .child(keys.menuCategoryId)
      .child('subCategory') // Using singular 'subCategory' for path
      .child(keys.subCategoryId)
      .child('products')
      .child(keys.menuItemId)
      .remove();
  }

   // --- Table Management Methods ---
  addRestaurantTable(restaurantId: string, tableData: Omit<RestaurantTable, 'id'>): Promise<firebase.database.Reference> {
    // If table ID is user-defined and should be the key:
    // if (!tableData.name) throw new Error("Table name is required to generate ID.");
    // const tableId = tableData.name.replace(/\s+/g, '-').toLowerCase(); // Example ID generation
    // return this.db.child(restaurantId).child('tables').child(tableId).set({...tableData, id: tableId}).then(() => this.db.child(restaurantId).child('tables').child(tableId));
    // If using Firebase push keys for table IDs:
    const newTableRef = this.db.child(restaurantId).child('tables').push();
    const tableId = newTableRef.key;
    if (!tableId) throw new Error("Failed to generate table ID.");
    return newTableRef.set({ ...tableData, id: tableId }).then(() => newTableRef);
  }

  async uploadRestaurantImage(restaurantId: string, file: File): Promise<string> {
    try {
        const fileRef = this.storageRef.child(`${RESTAURANT_IMAGES_PATH}/${restaurantId}/${file.name}_${Date.now()}`);
        const snapshot = await fileRef.put(file);
        return snapshot.ref.getDownloadURL();
    } catch (error) {
        console.error("Error uploading restaurant image:", error);
        throw error;
    }
  }

  updateRestaurantTable(restaurantId: string, tableId: string, tableData: Partial<RestaurantTable>): Promise<void> {
    return this.db.child(restaurantId).child('tables').child(tableId).update(tableData);
  }

  deleteRestaurantTable(restaurantId: string, tableId: string): Promise<void> {
    return this.db.child(restaurantId).child('tables').child(tableId).remove();
  }

  // --- Table Order Methods & Restaurant Order Methods (as before) ---
  addOrderToTable(keys: RestaurantTablePathKeys, value: Omit<TableOrder, 'id'>): Promise<firebase.database.Reference> {
    const newRef = this.db.child(keys.id).child('tables').child(keys.tableId).child('orders').push();
    return newRef.set(value).then(() => newRef);
  }
  getTableOrders(keys: RestaurantTablePathKeys): firebase.database.Reference {
    return this.db.child(keys.id).child('tables').child(keys.tableId).child('orders');
  }
  updateTableOrder(keys: RestaurantTableOrderPathKeys, value: Partial<TableOrder>): Promise<void> {
    return this.db.child(keys.id).child('tables').child(keys.tableId).child('orders').child(keys.orderId).update(value);
  }
  clearTableOrders(keys: RestaurantTablePathKeys): Promise<void> {
    return this.db.child(keys.id).child('tables').child(keys.tableId).child('orders').remove();
  }
  addOrderToRestaurant(keys: RestaurantIdParam, value: Omit<RestaurantOrder, 'id' | 'key'>): Promise<firebase.database.Reference> {
    const newRef = this.db.child(keys.id).child('orders').push();
    return newRef.set(value).then(() => newRef);
  }
  getOrdersFromRestaurantRef(restaurantId: string): firebase.database.Reference {
    return this.db.child(restaurantId).child('orders');
  }
  updateOrderStatus(restaurantId: string, orderId: string, newStatus: RestaurantOrder['status']): Promise<void> {
    return this.db.child(restaurantId).child('orders').child(orderId).child('status').set(newStatus);
  }
  updateOrderPaymentStatus(restaurantId: string, orderId: string, newPaymentStatus: PaymentStatus): Promise<void> {
    return this.db.child(restaurantId).child('orders').child(orderId).child('paymentStatus').set(newPaymentStatus);
  }
  getOrdersFromRestaurant( 
    keys: RestaurantIdParam,
    startDateInput: string | number | Date,
    endDateInput: string | number | Date
  ): firebase.database.Query {
    const startDate = new Date(startDateInput);
    startDate.setHours(0, 0, 0, 0); 
    const startTimestamp = startDate.getTime();
    const endDate = new Date(endDateInput);
    endDate.setHours(23, 59, 59, 999); 
    const endTimestamp = endDate.getTime();
    return this.db.child(keys.id).child('orders').orderByChild('orderTimestamp').startAt(startTimestamp).endAt(endTimestamp);
  }
}

export default new RestaurantDataService();
