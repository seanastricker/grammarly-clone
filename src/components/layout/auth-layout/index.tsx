/**
 * @fileoverview Authenticated layout component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Layout component for authenticated pages.
 * TODO: Implement full auth layout with sidebar navigation and user menu.
 */

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User } from 'lucide-react';

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
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation will be handled automatically by ProtectedRoute
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auth header/navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-emerald-600">
            WordWise AI
          </div>
          
          {/* Navigation menu */}
          <nav className="flex items-center space-x-6">
            <a 
              href="/dashboard" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Dashboard
            </a>
            <a 
              href="/editor" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Editor
            </a>
            <a 
              href="/settings" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Settings
            </a>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {user?.displayName || user?.email || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 text-sm 
                         text-gray-600 hover:text-gray-900 
                         hover:bg-gray-100 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

AuthLayout.displayName = 'AuthLayout'; 