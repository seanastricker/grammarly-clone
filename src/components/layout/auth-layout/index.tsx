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
import { useNavigate } from 'react-router-dom';
import { LogOut, User, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const isGuest = user?.isGuest;
  const isAuthenticated = user && !isGuest;

  return (
    <div className="min-h-screen bg-white">
      {/* Auth header/navigation */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleHomeClick}
            className="font-bold text-xl text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            ⚔️ Dungeons & Drafting
          </button>
          
          {/* Navigation menu - only show for authenticated users */}
          {isAuthenticated && (
            <nav className="flex items-center space-x-6">
              <button
                onClick={handleDashboard}
                className="text-slate-700 hover:text-slate-900 transition-colors font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="text-slate-700 hover:text-slate-900 transition-colors font-medium"
              >
                Settings
              </button>
            </nav>
          )}

          {/* Auth section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Authenticated user menu
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-700" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-slate-700 hover:text-slate-900"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : isGuest ? (
              // Guest user - show upgrade options
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                  <span className="text-indigo-600 font-medium">🎲 Guest Mode</span>
                </div>
                
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  size="sm"
                  className="text-slate-700 hover:text-slate-900"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                
                <Button
                  onClick={handleSignUp}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </>
            ) : (
              // No user - loading state or error
              <>
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  size="sm"
                  className="text-slate-700 hover:text-slate-900"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                
                <Button
                  onClick={handleSignUp}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </>
            )}
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