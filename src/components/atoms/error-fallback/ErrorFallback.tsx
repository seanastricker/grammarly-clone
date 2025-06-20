/**
 * @fileoverview Error fallback component for error boundaries
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Error fallback UI component displayed when React error boundaries catch errors.
 * Provides user-friendly error messages and recovery options.
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for the ErrorFallback component
 */
export interface ErrorFallbackProps {
  /** The error that was caught */
  error?: Error;
  
  /** Function to retry the failed operation */
  resetErrorBoundary: (...args: any[]) => void;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Custom title for the error */
  title?: string;
  
  /** Custom message for the error */
  message?: string;
  
  /** Whether to show technical error details */
  showDetails?: boolean;
}

/**
 * Error fallback component
 * 
 * Displays when React error boundaries catch unhandled errors.
 * Provides user-friendly interface with recovery options.
 * 
 * @component
 * @param error - The caught error object
 * @param resetErrorBoundary - Function to reset the error boundary
 * @param className - Additional CSS classes
 * @param title - Custom error title
 * @param message - Custom error message
 * @param showDetails - Whether to show technical details
 * 
 * @example
 * ```tsx
 * <ErrorBoundary FallbackComponent={ErrorFallback}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  className,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try refreshing the page.',
  showDetails = false
}) => {
  /**
   * Handles navigation to home page
   */
  const handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Handles retry with error boundary reset
   */
  const handleRetry = () => {
    resetErrorBoundary();
  };

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center px-4 py-12',
        'bg-background text-foreground',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div
            className={cn(
              'p-4 rounded-full',
              'bg-error-container text-error-container-foreground'
            )}
          >
            <AlertTriangle 
              className="w-8 h-8" 
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-3">
          <h1 className="text-title-large font-medium text-foreground">
            {title}
          </h1>
          
          <p className="text-body-medium text-muted-foreground leading-relaxed">
            {message}
          </p>

          {/* Technical Details (Development) */}
          {showDetails && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-body-small text-muted-foreground hover:text-foreground">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md text-body-small font-mono text-muted-foreground">
                <p className="font-semibold">Error:</p>
                <p className="break-words">{error.message}</p>
                {error.stack && (
                  <>
                    <p className="font-semibold mt-2">Stack Trace:</p>
                    <pre className="whitespace-pre-wrap text-xs">
                      {error.stack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-6 py-3',
              'bg-primary text-primary-foreground',
              'rounded-md font-medium text-body-medium',
              'hover:bg-primary/90 focus:bg-primary/90',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'transition-colors duration-200'
            )}
            aria-label="Retry the failed operation"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>

          <button
            onClick={handleGoHome}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-6 py-3',
              'bg-secondary text-secondary-foreground',
              'rounded-md font-medium text-body-medium',
              'hover:bg-secondary/90 focus:bg-secondary/90',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'transition-colors duration-200'
            )}
            aria-label="Go to home page"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go Home
          </button>
        </div>

        {/* Support Information */}
        <div className="pt-4 border-t border-border">
          <p className="text-body-small text-muted-foreground">
            If this problem persists, please{' '}
            <a
                              href="mailto:support@dungeonsanddrafting.ai"
              className="text-primary hover:text-primary/80 underline"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

ErrorFallback.displayName = 'ErrorFallback'; 