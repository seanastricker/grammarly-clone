/**
 * @fileoverview Authentication type definitions
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Type definitions for authentication, user management, and auth states.
 * Defines interfaces for Firebase Auth integration and user profiles.
 */

import type { User as FirebaseUser } from 'firebase/auth';

/**
 * User type options for personalized writing assistance
 */
export type UserType = 'student' | 'professional' | 'creator';

/**
 * User writing experience levels
 */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Writing tone preferences
 */
export type WritingTone = 'casual' | 'professional' | 'academic' | 'creative';

/**
 * Extended user profile with WordWise-specific data
 */
export interface UserProfile {
  /** Unique user identifier */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** Display name */
  displayName: string | null;
  
  /** Profile picture URL */
  photoURL: string | null;
  
  /** User type for personalized assistance */
  userType: UserType;
  
  /** Writing experience level */
  experienceLevel: ExperienceLevel;
  
  /** Preferred writing tone */
  preferredTone: WritingTone;
  
  /** User's writing niche or focus area */
  niche?: string;
  
  /** User preferences and settings */
  preferences: UserPreferences;
  
  /** Account creation timestamp */
  createdAt: Date;
  
  /** Last profile update timestamp */
  updatedAt: Date;
  
  /** Email verification status */
  emailVerified: boolean;
  
  /** User subscription status */
  subscriptionStatus: 'free' | 'premium' | 'pro';
  
  /** Whether this is a guest user (no data persistence) */
  isGuest?: boolean;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  /** Theme preference */
  theme: 'light' | 'dark' | 'system';
  
  /** AI suggestion frequency */
  suggestionFrequency: 'low' | 'medium' | 'high';
  
  /** Grammar checking enabled */
  grammarCheckEnabled: boolean;
  
  /** Style suggestions enabled */
  styleSuggestionsEnabled: boolean;
  
  /** Real-time suggestions enabled */
  realtimeSuggestionsEnabled: boolean;
  
  /** Notification preferences */
  notifications: {
    email: boolean;
    inApp: boolean;
    weekly: boolean;
  };
  
  /** Auto-save interval in seconds */
  autoSaveInterval: number;
  
  /** Default document sharing settings */
  defaultPrivacy: 'private' | 'public' | 'unlisted';
}

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Current authenticated user */
  user: UserProfile | null;
  
  /** Firebase user object */
  firebaseUser: FirebaseUser | null;
  
  /** Loading state for auth operations */
  isLoading: boolean;
  
  /** Authentication error */
  error: string | null;
  
  /** Email verification state */
  isEmailVerified: boolean;
}

/**
 * Login form data
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration form data
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  userType: UserType;
  experienceLevel: ExperienceLevel;
  niche?: string;
  acceptTerms: boolean;
}

/**
 * Registration form validation errors
 */
export interface RegisterErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
  acceptTerms?: string;
}

/**
 * Password reset form data
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  displayName?: string;
  userType?: UserType;
  experienceLevel?: ExperienceLevel;
  preferredTone?: WritingTone;
  niche?: string;
  preferences?: Partial<UserPreferences>;
}

/**
 * Authentication error types
 */
export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github' | 'microsoft';

/**
 * Authentication action types
 */
export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: UserProfile; firebaseUser: FirebaseUser } }
  | { type: 'AUTH_ERROR'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'PROFILE_UPDATE'; payload: { user: UserProfile } }
  | { type: 'EMAIL_VERIFIED'; payload: { isVerified: boolean } };

/**
 * Auth context interface
 */
export interface AuthContextType {
  /** Current auth state */
  authState: AuthState;
  
  /** Sign in with email and password */
  signIn: (credentials: LoginCredentials) => Promise<void>;
  
  /** Sign up with email and password */
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  
  /** Sign in with OAuth provider */
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  
  /** Continue as guest (no data persistence) */
  continueAsGuest: () => Promise<void>;
  
  /** Sign out current user */
  signOut: () => Promise<void>;
  
  /** Send password reset email */
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  
  /** Send email verification */
  sendEmailVerification: () => Promise<void>;
  
  /** Update user profile */
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  
  /** Refresh auth state */
  refreshAuth: () => Promise<void>;
} 