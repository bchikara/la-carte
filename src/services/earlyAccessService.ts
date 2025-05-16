// src/services/earlyAccessService.ts

import { database, storage } from '../config/firebaseConfig'; // Adjust path
import firebase from 'firebase/compat/app';
import { EarlyAccessRestaurantSubmission } from '../types/earlyAccess.types'; // Adjust path

const EARLY_ACCESS_PATH = "/early-access";

class EarlyAccessService {
  private db: firebase.database.Reference;
  private storageRef: firebase.storage.Reference;

  constructor() {
    this.db = database.ref(EARLY_ACCESS_PATH);
    this.storageRef = storage.ref(); // Root storage reference
  }

  /**
   * Uploads an array of files to Firebase Storage.
   * @param files - The FileList to upload.
   * @param pathPrefix - Optional path prefix in storage (e.g., 'early-access-uploads/').
   * @returns A promise that resolves to an array of download URLs.
   */
  async uploadFiles(files: FileList, pathPrefix: string = 'early-access-uploads/'): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = Array.from(files).map(file => {
      const fileRef = this.storageRef.child(`${pathPrefix}${Date.now()}_${file.name}`);
      return fileRef.put(file).then(snapshot => snapshot.ref.getDownloadURL());
    });

    return Promise.all(uploadPromises);
  }


  /**
   * Creates a new early access restaurant submission, optionally uploading files.
   * @param submissionInputData - The core data for the submission, excluding id, timestamp, image URLs, and status.
   * @param files - Optional FileList to upload.
   * @returns A promise that resolves to the new submission's Firebase reference.
   */
  async createSubmissionWithFiles(
    // Ensure this input type matches what the store provides.
    // It should contain restaurantName, contactName, email, and optional phone, city, message.
    submissionInputData: Omit<EarlyAccessRestaurantSubmission, 'id' | 'submissionTimestamp' | 'imageUrls' | 'status'>,
    files?: FileList | null
  ): Promise<firebase.database.Reference> {
    let uploadedImageUrls: string[] = [];
    if (files && files.length > 0) {
      // Use a more specific path if possible, e.g., including restaurantName if available and sanitized
      const restaurantNamePath = submissionInputData.restaurantName ? submissionInputData.restaurantName.replace(/\s+/g, '-').toLowerCase() : 'unknown-restaurant';
      uploadedImageUrls = await this.uploadFiles(files, `early-access/${restaurantNamePath}/`);
    }

    const newRef = this.db.push();
    const fullSubmissionData: EarlyAccessRestaurantSubmission = {
      // Explicitly map required fields from submissionInputData
      restaurantName: submissionInputData.restaurantName,
      contactName: submissionInputData.contactName,
      email: submissionInputData.email,

      // Map optional fields from submissionInputData
      phone: submissionInputData.phone,
      city: submissionInputData.city,
      message: submissionInputData.message,
      
      // Fields managed by this function
      id: newRef.key || undefined, // Store the Firebase key as 'id'
      imageUrls: uploadedImageUrls,
      submissionTimestamp: Date.now(),
      status: 'pending', // Default status
    };

    await newRef.set(fullSubmissionData);
    return newRef;
  }

  /**
   * Original create method - can be kept for submissions without files or deprecated.
   * If kept, ensure `submissionData` passed to it actually contains all required fields.
   * The `Omit<EarlyAccessRestaurantSubmission, 'id'>` type implies `submissionTimestamp` must be provided by the caller.
   */
  create(submissionData: Omit<EarlyAccessRestaurantSubmission, 'id'>): Promise<firebase.database.Reference> {
    const newRef = this.db.push();

    // Explicitly construct dataToSave to ensure all required fields are present
    const dataToSave: EarlyAccessRestaurantSubmission = {
      restaurantName: submissionData.restaurantName,
      contactName: submissionData.contactName,
      email: submissionData.email,
      submissionTimestamp: submissionData.submissionTimestamp, // This is required from submissionData by the Omit type
      
      // Optional fields from submissionData
      phone: submissionData.phone,
      city: submissionData.city,
      message: submissionData.message,
      imageUrls: submissionData.imageUrls,
      status: submissionData.status,

      id: newRef.key || undefined, // Store the Firebase key as 'id'
    };
    return newRef.set(dataToSave).then(() => newRef);
  }


  getAllSubmissions(): firebase.database.Reference {
    return this.db;
  }

  getSubmission(submissionId: string): firebase.database.Reference {
    return this.db.child(submissionId);
  }

  deleteSubmission(submissionId: string): Promise<void> {
    return this.db.child(submissionId).remove();
  }
}

export default new EarlyAccessService();
