/**
 * @fileoverview Public layout component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Layout component for public pages (unauthenticated users).
 * TODO: Implement full public layout with navigation and footer.
 */

import React from 'react';

/**
 * Props for PublicLayout component
 */
interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Public layout component
 * 
 * Layout wrapper for public pages like landing, login, signup.
 * Provides consistent navigation and footer for unauthenticated users.
 * 
 * @component
 * @param children - Child components to render within the layout
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Public header/navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-primary">
            WordWise AI
          </div>
          <nav className="flex items-center space-x-4">
            <a 
              href="/login" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </a>
            <a 
              href="/signup" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Public footer */}
      <footer className="border-t border-border bg-muted/50 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 WordWise AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

PublicLayout.displayName = 'PublicLayout'; 