/**
 * @fileoverview Application providers composition
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Combines all context providers for the WordWise AI application.
 * Wraps the app with theme, auth, and other global providers.
 */

import React from 'react';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';

/**
 * Props for the Providers component
 */
interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component
 * 
 * Combines all global context providers in the correct order.
 * Ensures proper provider hierarchy for the application.
 * 
 * @component
 * @param children - Child components to wrap with providers
 * 
 * @example
 * ```tsx
 * <Providers>
 *   <App />
 * </Providers>
 * ```
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};

Providers.displayName = 'Providers'; 