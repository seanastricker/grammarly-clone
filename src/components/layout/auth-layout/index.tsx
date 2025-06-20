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
    <div className="min-h-screen bg-white">
      {/* Auth header/navigation */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-slate-900">
            Dungeons & Drafting
          </div>
          
          {/* Navigation menu */}
          <nav className="flex items-center space-x-6">
            <a 
              href="/dashboard" 
              className="text-slate-700 hover:text-slate-900 transition-colors font-medium"
            >
              Dashboard
            </a>
            <a 
              href="/settings" 
              className="text-slate-700 hover:text-slate-900 transition-colors font-medium"
            >
              Settings
            </a>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-700" />
              </div>
              <span className="text-sm font-medium text-slate-900">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
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