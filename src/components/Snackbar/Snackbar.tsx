// src/components/Snackbar/Snackbar.tsx

import React, { useEffect } from 'react';
import { useSnackbarStore } from '../../store/snackbarStore'; // Adjust path as needed
import './Snackbar.scss'; // We'll create this SCSS file

const Snackbar: React.FC = () => {
  const { isOpen, message, severity, hideSnackbar } = useSnackbarStore();

  useEffect(() => {
    if (isOpen) {
      // Optional: Add class to body to prevent scrolling if snackbar is modal-like
      // document.body.style.overflow = 'hidden';
    } else {
      // document.body.style.overflow = 'auto';
    }
    // Cleanup function for body style if you implement it
    // return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div id="snackbar-component" className={`snackbar-wrapper ${isOpen ? 'show' : ''} severity-${severity}`}>
      <div className="snackbar-content">
        <span className="snackbar-message">{message}</span>
        {/* Optional: Add an explicit close button */}
        {/* <button onClick={hideSnackbar} className="snackbar-close-btn">&times;</button> */}
      </div>
    </div>
  );
};

export default Snackbar;
