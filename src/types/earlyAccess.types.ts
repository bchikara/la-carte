// src/types/earlyAccess.types.ts

/**
 * Interface for the data submitted for early access restaurant sign-up.
 * Adjust these properties based on the actual data you intend to collect.
 */
export interface EarlyAccessRestaurantSubmission {
  id?: string; // Firebase key, will be added after push
  restaurantName: string;
  contactName: string;
  email: string;
  phone?: string;
  city?: string;
  message?: string;
  imageUrls?: string[]; // To store URLs of uploaded files
  submissionTimestamp: number; // e.g., Date.now()
  // Add any other fields you collect for early access
  status?: 'pending' | 'reviewed' | 'contacted'; // Example status
  [key: string]: any;
}