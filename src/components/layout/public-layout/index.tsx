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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Public header/navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-emerald-600">
            WordWise AI
          </div>
          <nav className="flex items-center space-x-4">
            <a 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Sign In
            </a>
            <a 
              href="/signup" 
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Public footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 WordWise AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

PublicLayout.displayName = 'PublicLayout'; 