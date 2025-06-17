/**
 * @fileoverview Firebase configuration and initialization
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Firebase app initialization with authentication, firestore, and analytics.
 * Provides centralized Firebase service configuration.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

/**
 * Firebase project configuration from environment variables
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please create a .env file with your Firebase configuration.'
  );
}

/**
 * Initialize Firebase app
 */
export const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication
 */
export const auth = getAuth(app);

/**
 * Initialize Firestore Database
 */
export const db = getFirestore(app);

/**
 * Initialize Analytics (browser only)
 */
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

/**
 * Development emulator setup
 * Temporarily disabled to ensure connection to real Firebase
 */
// Emulator connections disabled for testing
// if (import.meta.env.DEV && typeof window !== 'undefined') {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099');
//   } catch (error) {
//     console.log('Auth emulator connection skipped:', error);
//   }

//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     console.log('Firestore emulator connection skipped:', error);
//   }
// }

/**
 * Export default app for other Firebase services
 */
export default app; 