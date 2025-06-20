/**
 * @fileoverview Authentication provider component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Authentication provider component for managing user authentication state.
 * Provides authentication context throughout the application.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  AuthContextType, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials, 
  PasswordResetRequest,
  ProfileUpdateData,
  OAuthProvider,
  UserProfile 
} from '@/types/auth';
import * as authService from '@/services/auth';

/**
 * Initial authentication state
 */
const initialAuthState: AuthState = {
  user: null,
  firebaseUser: null,
  isLoading: true,
  error: null,
  isEmailVerified: false,
};

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component
 * 
 * Provides authentication context and manages auth state.
 * Handles user authentication, registration, and session management.
 * 
 * @component
 * @param children - Child components to wrap with auth context
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  /**
   * Initialize authentication state
   * Set up Firebase auth state listener
   */
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userProfile = await authService.getUserProfile(firebaseUser.uid);
          
          if (userProfile) {
            setAuthState({
              user: userProfile,
              firebaseUser,
              isLoading: false,
              error: null,
              isEmailVerified: firebaseUser.emailVerified
            });
          } else {
            // User exists in Auth but not in Firestore, create profile
            const newProfile = await authService.createUserProfile(firebaseUser);
            setAuthState({
              user: newProfile,
              firebaseUser,
              isLoading: false,
              error: null,
              isEmailVerified: firebaseUser.emailVerified
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setAuthState({
            user: null,
            firebaseUser: null,
            isLoading: false,
            error: 'Failed to load user profile',
            isEmailVerified: false
          });
        }
      } else {
        setAuthState({
          user: null,
          firebaseUser: null,
          isLoading: false,
          error: null,
          isEmailVerified: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, firebaseUser } = await authService.signInWithEmail(credentials);
      
      setAuthState({
        user,
        firebaseUser,
        isLoading: false,
        error: null,
        isEmailVerified: firebaseUser.emailVerified
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
      throw error;
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (credentials: RegisterCredentials): Promise<void> => {
    console.log('📝 Auth Provider: Starting signup for:', credentials.email);
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, firebaseUser } = await authService.signUpWithEmail(credentials);
      console.log('✅ Auth Provider: Signup successful for:', user.email);
      
      setAuthState({
        user,
        firebaseUser,
        isLoading: false,
        error: null,
        isEmailVerified: firebaseUser.emailVerified
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }));
      throw error;
    }
  };

  /**
   * Sign in with OAuth provider
   */
  const signInWithOAuth = async (provider: OAuthProvider): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, firebaseUser } = await authService.signInWithOAuth(provider);
      
      setAuthState({
        user,
        firebaseUser,
        isLoading: false,
        error: null,
        isEmailVerified: firebaseUser.emailVerified
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'OAuth sign in failed',
      }));
      throw error;
    }
  };

  /**
   * Continue as guest user (no data persistence)
   */
  const continueAsGuest = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Create a temporary guest user profile
      const guestUser: UserProfile = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: 'guest@dungeonsanddrafting.ai',
        displayName: 'Guest User',
        photoURL: null,
        userType: 'professional',
        experienceLevel: 'intermediate',
        preferredTone: 'professional',
        niche: '',
        preferences: {
          theme: 'system',
          suggestionFrequency: 'medium',
          grammarCheckEnabled: true,
          styleSuggestionsEnabled: true,
          realtimeSuggestionsEnabled: true,
          notifications: {
            email: false,
            inApp: true,
            weekly: false,
          },
          autoSaveInterval: 30,
          defaultPrivacy: 'private',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false,
        subscriptionStatus: 'free',
        isGuest: true,
      };

      setAuthState({
        user: guestUser,
        firebaseUser: null, // No Firebase user for guests
        isLoading: false,
        error: null,
        isEmailVerified: false
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Guest sign in failed',
      }));
      throw error;
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
      throw error;
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (request: PasswordResetRequest): Promise<void> => {
    try {
      await authService.resetPassword(request);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }));
      throw error;
    }
  };

  /**
   * Send email verification
   */
  const sendEmailVerification = async (): Promise<void> => {
    try {
      await authService.sendVerificationEmail();
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Email verification failed',
      }));
      throw error;
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data: ProfileUpdateData): Promise<void> => {
    try {
      const updatedUser = await authService.updateUserProfile(data);
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Profile update failed',
      }));
      throw error;
    }
  };

  /**
   * Refresh authentication state
   */
  const refreshAuth = async (): Promise<void> => {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        const userProfile = await authService.getUserProfile(currentUser.uid);
        
        if (userProfile) {
          setAuthState(prev => ({
            ...prev,
            user: userProfile,
            firebaseUser: currentUser,
            isEmailVerified: currentUser.emailVerified,
            isLoading: false
          }));
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Auth refresh failed',
      }));
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    authState,
    signIn,
    signUp,
    signInWithOAuth,
    continueAsGuest,
    signOut,
    resetPassword,
    sendEmailVerification,
    updateProfile,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * 
 * @returns Authentication context value
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```tsx
 * const { authState, signIn, signOut } = useAuth();
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

AuthProvider.displayName = 'AuthProvider'; 