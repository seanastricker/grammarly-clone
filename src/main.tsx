/**
 * @fileoverview Main application entry point
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * React 18 application entry with strict mode and global providers.
 * Initializes the WordWise AI writing assistant with theme, auth, and error boundaries.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import App from './App.tsx';
import { Providers } from './app/providers';
import { ErrorFallback } from '@/components/atoms/error-fallback';

import './app/globals.css';
import { checkAndClearLegacyData } from '@/lib/utils';

// Clear any legacy data that might cause runtime errors
try {
  checkAndClearLegacyData();
  // Also clear any cached React components or state
  if (typeof window !== 'undefined') {
    // Clear any cached data that might have old document types
    sessionStorage.clear();
    console.log('🧹 Cleared sessionStorage for fresh start');
  }
} catch (error) {
  console.error('Error during data cleanup:', error);
}

/**
 * Global error handler for unhandled errors
 * Reports errors to monitoring service and provides user feedback
 */
function handleError(error: Error, errorInfo: any) {
  console.error('Application error:', error, errorInfo);
  // TODO: Report to Sentry in production
}

/**
 * Root application render
 * Wrapped with providers, error boundaries, and routing
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
    >
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Providers>
          <App />
        </Providers>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
); 