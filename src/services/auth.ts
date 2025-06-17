/**
 * @fileoverview Firebase Authentication Service
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Service layer for Firebase Authentication operations.
 * Handles sign-in, sign-up, OAuth, and user management.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type {
  LoginCredentials,
  RegisterCredentials,
  PasswordResetRequest,
  ProfileUpdateData,
  OAuthProvider,
  UserProfile,
  UserPreferences
} from '@/types/auth';

/**
 * Default user preferences
 */
const defaultPreferences: UserPreferences = {
  theme: 'system',
  suggestionFrequency: 'medium',
  grammarCheckEnabled: true,
  styleSuggestionsEnabled: true,
  realtimeSuggestionsEnabled: true,
  notifications: {
    email: true,
    inApp: true,
    weekly: true
  },
  autoSaveInterval: 30,
  defaultPrivacy: 'private'
};

/**
 * OAuth providers configuration
 */
const oauthProviders = {
  google: new GoogleAuthProvider(),
  github: new GithubAuthProvider(),
  microsoft: new GoogleAuthProvider() // Using Google for now, can add Microsoft later
};

/**
 * Creates user profile document in Firestore
 */
export async function createUserProfile(
  firebaseUser: FirebaseUser,
  additionalData: Partial<UserProfile> = {}
): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  
  const userProfile: UserProfile = {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || additionalData.displayName || '',
    photoURL: firebaseUser.photoURL,
    userType: additionalData.userType || 'professional',
    experienceLevel: additionalData.experienceLevel || 'intermediate',
    preferredTone: additionalData.preferredTone || 'professional',
    ...(additionalData.niche && { niche: additionalData.niche }),
    preferences: defaultPreferences,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: firebaseUser.emailVerified,
    subscriptionStatus: 'free'
  };

  await setDoc(userRef, {
    ...userProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return userProfile;
}

/**
 * Gets user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(credentials: LoginCredentials): Promise<{
  user: UserProfile;
  firebaseUser: FirebaseUser;
}> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    let userProfile = await getUserProfile(userCredential.user.uid);
    
    if (!userProfile) {
      userProfile = await createUserProfile(userCredential.user);
    }

    return {
      user: userProfile,
      firebaseUser: userCredential.user
    };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(credentials: RegisterCredentials): Promise<{
  user: UserProfile;
  firebaseUser: FirebaseUser;
}> {
  try {
    console.log('🚀 Starting signup process for:', credentials.email);
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    
    console.log('✅ Firebase user created:', userCredential.user.uid);

    // Update Firebase user profile
    await updateProfile(userCredential.user, {
      displayName: credentials.displayName
    });

    // Create user profile in Firestore
    const userProfile = await createUserProfile(userCredential.user, {
      displayName: credentials.displayName,
      userType: credentials.userType,
      experienceLevel: credentials.experienceLevel,
      ...(credentials.niche && { niche: credentials.niche })
    });

    // Send email verification
    await sendEmailVerification(userCredential.user);

    return {
      user: userProfile,
      firebaseUser: userCredential.user
    };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<{
  user: UserProfile;
  firebaseUser: FirebaseUser;
}> {
  try {
    const oauthProvider = oauthProviders[provider];
    const userCredential = await signInWithPopup(auth, oauthProvider);

    let userProfile = await getUserProfile(userCredential.user.uid);
    
    if (!userProfile) {
      userProfile = await createUserProfile(userCredential.user);
    }

    return {
      user: userProfile,
      firebaseUser: userCredential.user
    };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error('Failed to sign out');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(request: PasswordResetRequest): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, request.email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error('No user signed in');
    }
    await sendEmailVerification(auth.currentUser);
  } catch (error: any) {
    throw new Error('Failed to send verification email');
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: ProfileUpdateData): Promise<UserProfile> {
  try {
    if (!auth.currentUser) {
      throw new Error('No user signed in');
    }

    const userRef = doc(db, 'users', auth.currentUser.uid);
    
    // Update Firebase Auth profile if displayName changed
    if (data.displayName) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName
      });
    }

    // Update Firestore profile
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

    // Get updated profile
    const updatedProfile = await getUserProfile(auth.currentUser.uid);
    if (!updatedProfile) {
      throw new Error('Failed to get updated profile');
    }

    return updatedProfile;
  } catch (error: any) {
    throw new Error('Failed to update profile');
  }
}

/**
 * Auth state listener
 */
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current Firebase user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
} 