// Import Firebase app and the specific services you need.
// Using 'firebase/compat/app' for the compat version.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";

// Define a type for your Firebase configuration object for better type safety.
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  databaseURL: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

// For Create React App (CRA) or Node.js environments:
// This section is now active.
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase has already been initialized to prevent errors.
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app(); // Get the default app if already initialized
}

// Export the Firebase services you will use in your application.
// It's good practice to type them.
export const database: firebase.database.Database = firebase.database();
export const auth: firebase.auth.Auth = firebase.auth();
export const storage: firebase.storage.Storage = firebase.storage();

// You can also export the initialized app or the firebase namespace if needed elsewhere.
export { app }; // Export the initialized app instance
export default firebase; // Export the firebase namespace
