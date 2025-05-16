// src/store/snackbarStore.ts

import { create } from 'zustand';
import { SnackbarStore, SnackbarSeverity } from '../types/snackbar.types';

const initialState = {
  isOpen: false,
  message: '',
  severity: 'info' as SnackbarSeverity,
  autoHideDuration: 3000, // Default to 3 seconds
};

export const useSnackbarStore = create<SnackbarStore>((set, get) => ({
  ...initialState,

  showSnackbar: (
    message: string,
    severity: SnackbarSeverity = 'info',
    autoHideDuration: number | null = 3000
  ) => {
    set({
      isOpen: true,
      message,
      severity,
      autoHideDuration,
    });

    if (autoHideDuration !== null) {
      setTimeout(() => {
        // Only hide if it's still the same message and open
        // This prevents an old timeout from closing a new snackbar
        if (get().isOpen && get().message === message) {
          get().hideSnackbar();
        }
      }, autoHideDuration);
    }
  },

  hideSnackbar: () => {
    set({ isOpen: false });
    // Optionally reset message and severity after a short delay to allow fade-out animation
    // setTimeout(() => set({ message: '', severity: 'info' }), 300);
  },
}));
