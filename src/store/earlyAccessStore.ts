// src/store/earlyAccessStore.ts

import { create } from 'zustand';
import earlyAccessService from '../services/earlyAccessService'; // Adjust path
import { EarlyAccessRestaurantSubmission } from '../types/earlyAccess.types'; // Adjust path
import { useSnackbarStore } from './snackbarStore'; // Adjust path
import firebase from 'firebase/compat/app';

interface EarlyAccessFormState {
  contactName: string;
  restaurantName: string;
  restaurantGST:string;
  phone: string;
  email: string;
  message?: string;
  files: FileList | null;
}

interface EarlyAccessStoreState {
  submissions: EarlyAccessRestaurantSubmission[];
  currentSubmission: EarlyAccessRestaurantSubmission | null;
  isLoading: boolean; // General loading for list/details
  isSubmitting: boolean; // Specific for form submission
  error: string | null;
  formState: EarlyAccessFormState;
  listenerActive: boolean;
}

const initialFormFields: EarlyAccessFormState = {
  contactName: '',
  restaurantName: '',
  restaurantGST:'',
  phone: '',
  email: '',
  message: '',
  files: null,
};

interface EarlyAccessStoreActions {
  fetchSubmissions: () => void;
  stopFetchingSubmissions: () => void;
  fetchSubmissionById: (submissionId: string) => Promise<void>;

  updateFormField: <K extends keyof EarlyAccessFormState>(field: K, value: EarlyAccessFormState[K]) => void;
  resetForm: () => void;
  handleFormSubmit: () => Promise<boolean>; // Returns true on success, false on error

  deleteSubmission: (submissionId: string) => Promise<void>;
  clearError: () => void;
  setCurrentSubmission: (submission: EarlyAccessRestaurantSubmission | null) => void;
}

export type EarlyAccessStore = EarlyAccessStoreState & EarlyAccessStoreActions;

const initialState: EarlyAccessStoreState = {
  submissions: [],
  currentSubmission: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  formState: initialFormFields,
  listenerActive: false,
};

let submissionsListenerUnsubscribe: (() => void) | null = null;

export const useEarlyAccessStore = create<EarlyAccessStore>((set, get) => ({
  ...initialState,

  updateFormField: (field, value) => {
    set(state => ({
      formState: {
        ...state.formState,
        [field]: value,
      }
    }));
  },

  resetForm: () => {
    set({ formState: initialFormFields, isSubmitting: false });
  },

  handleFormSubmit: async () => {
    const { formState } = get();
    if (!formState.contactName || !formState.restaurantName || !formState.phone || !formState.email) {
      useSnackbarStore.getState().showSnackbar('Please fill in all required fields (Name, Restaurant, Phone, Email).', 'error');
      return false;
    }

    set({ isSubmitting: true, error: null });
    try {
      const submissionData = {
        contactName: formState.contactName,
        restaurantName: formState.restaurantName,
        restaurantGST: formState.restaurantGST || '',
        phone: formState.phone,
        email: formState.email,
        message: formState.message,
        // Note: 'imageUrls', 'submissionTimestamp', 'id', 'status' are handled by the service/backend
      };

      await earlyAccessService.createSubmissionWithFiles(submissionData, formState.files);

      useSnackbarStore.getState().showSnackbar('Submission successful! Our team will contact you soon.', 'success');
      get().resetForm(); // Reset form fields and isSubmitting
      set({ isSubmitting: false }); // Ensure isSubmitting is false
      return true;
    } catch (err: any) {
      console.error("Error creating submission:", err);
      useSnackbarStore.getState().showSnackbar(err.message || 'Submission failed. Please try again.', 'error');
      set({ error: err.message || 'Failed to create submission.', isSubmitting: false });
      return false;
    }
  },

  fetchSubmissions: () => {
    if (get().listenerActive) return;
    set({ isLoading: true, error: null, listenerActive: true });
    const dbRef = earlyAccessService.getAllSubmissions();
    const listener = (snapshot: firebase.database.DataSnapshot) => {
      const data = snapshot.val();
      const submissionsArray: EarlyAccessRestaurantSubmission[] = data
        ? Object.keys(data).map(key => ({ ...data[key], id: key } as EarlyAccessRestaurantSubmission))
        : [];
      set({ submissions: submissionsArray, isLoading: false });
    };
    const errorListener = (error: Error) => {
      console.error("Error fetching early access submissions:", error);
      set({ error: error.message, isLoading: false, listenerActive: false });
      dbRef.off('value', listener);
    };
    dbRef.on('value', listener, errorListener);
    submissionsListenerUnsubscribe = () => dbRef.off('value', listener);
  },

  stopFetchingSubmissions: () => {
    submissionsListenerUnsubscribe?.();
    submissionsListenerUnsubscribe = null;
    set({ listenerActive: false });
  },

  fetchSubmissionById: async (submissionId: string) => {
    set({ isLoading: true, error: null, currentSubmission: null });
    try {
      const dbRef = earlyAccessService.getSubmission(submissionId);
      const snapshot = await dbRef.once('value');
      if (snapshot.exists()) {
        set({
          currentSubmission: { ...snapshot.val(), id: snapshot.key } as EarlyAccessRestaurantSubmission,
          isLoading: false,
        });
      } else {
        set({ error: 'Submission not found.', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch submission.', isLoading: false });
    }
  },

  deleteSubmission: async (submissionId: string) => {
    // No loading state change here, let listener handle UI update for list
    try {
      await earlyAccessService.deleteSubmission(submissionId);
      useSnackbarStore.getState().showSnackbar('Submission deleted.', 'info');
      if (get().currentSubmission?.id === submissionId) {
        set({ currentSubmission: null });
      }
    } catch (err: any) {
      useSnackbarStore.getState().showSnackbar(err.message || 'Failed to delete submission.', 'error');
    }
  },

  setCurrentSubmission: (submission) => {
    set({ currentSubmission: submission });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Optional: Cleanup listener when the app unmounts
// This would typically be done in your main App.tsx
// useEffect(() => {
//   return () => {
//     useEarlyAccessStore.getState().stopFetchingSubmissions();
//   };
// }, []);
