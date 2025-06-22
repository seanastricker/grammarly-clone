/**
 * @fileoverview Guest layout component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Layout component for guest users and home page.
 * Includes header with sign in/sign up options and clickable home button.
 */

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props for GuestLayout component
 */
interface GuestLayoutProps {
  children: React.ReactNode;
}

/**
 * Guest layout component
 * 
 * Layout wrapper for guest users and the home page.
 * Provides consistent navigation with sign in/sign up options.
 * 
 * @component
 * @param children - Child components to render within the layout
 */
export const GuestLayout: React.FC<GuestLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isGuest = user?.isGuest;
  const isAuthenticated = user && !isGuest;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo/Home button */}
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

GuestLayout.displayName = 'GuestLayout'; 