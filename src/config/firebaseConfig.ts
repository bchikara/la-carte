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

  const app = firebase.apps.length 
    ? firebase.app() 
    : firebase.initializeApp(firebaseConfig);
  
  console.log('Firebase initialized successfully', app.name);

  export const database = firebase.database();
  export const auth = firebase.auth();
  export const storage = firebase.storage();
  export { app };
  export default firebase;