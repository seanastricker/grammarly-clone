/**
 * @fileoverview Authenticated layout component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Layout component for authenticated pages.
 * TODO: Implement full auth layout with sidebar navigation and user menu.
 */

import React from 'react';

/**
 * Props for AuthLayout component
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Authenticated layout component
 * 
 * Layout wrapper for authenticated pages like dashboard, editor, settings.
 * Provides consistent navigation and user interface for logged-in users.
 * 
 * @component
 * @param children - Child components to render within the layout
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Auth header/navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-primary">
            WordWise AI
          </div>
          
          {/* Navigation menu */}
          <nav className="flex items-center space-x-6">
            <a 
              href="/dashboard" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="/editor" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Editor
            </a>
            <a 
              href="/settings" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </a>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                U
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

AuthLayout.displayName = 'AuthLayout'; 