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
 * Firebase project configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyCD1duhWt84Fc-mWugAr_fsn1M__PZuRpk",
  authDomain: "grammarly-clone-b9b49.firebaseapp.com",
  projectId: "grammarly-clone-b9b49",
  storageBucket: "grammarly-clone-b9b49.firebasestorage.app",
  messagingSenderId: "225332392518",
  appId: "1:225332392518:web:7af3aa0709991b75fc1047",
  measurementId: "G-HF90YLQJ18"
};

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