/**
 * @fileoverview Authentication hook
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Custom hook for accessing authentication state and methods.
 * Provides a convenient interface to the authentication context.
 */

import { useAuth as useAuthContext } from '@/app/providers/auth-provider';

/**
 * Authentication hook
 * 
 * Provides access to authentication state and methods.
 * Re-exports the auth context hook for easier importing.
 * 
 * @returns Authentication context with user state and auth methods
 * 
 * @example
 * ```tsx
 * const { user, isLoading, signIn, signOut } = useAuth();
 * 
 * if (isLoading) return <Loading />;
 * if (!user) return <LoginForm onSubmit={signIn} />;
 * 
 * return <Dashboard user={user} onSignOut={signOut} />;
 * ```
 */
export const useAuth = () => {
  const context = useAuthContext();
  
  // Destructure for easier access to commonly used properties
  const { 
    authState: { user, isLoading, error, isEmailVerified },
    ...authMethods 
  } = context;
  
  return {
    // Auth state
    user,
    isLoading,
    error,
    isEmailVerified,
    
    // Auth methods
    ...authMethods,
    
    // Computed properties
    isAuthenticated: !!user,
    hasError: !!error,
  };
}; 