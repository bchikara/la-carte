// src/types/snackbar.types.ts

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarState {
  isOpen: boolean;
  message: string;
  severity: SnackbarSeverity;
  autoHideDuration: number | null; // Duration in ms, null for manual close
}

export interface SnackbarActions {
  showSnackbar: (
    message: string,
    severity?: SnackbarSeverity,
    autoHideDuration?: number | null
  ) => void;
  hideSnackbar: () => void;
}

export type SnackbarStore = SnackbarState & SnackbarActions;
