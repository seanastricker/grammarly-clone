/**
 * @fileoverview Main App component with routing
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Root application component handling routing and layout structure.
 * Implements protected routes and authentication-based navigation.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

// Page components
import { HomePage } from '@/components/pages/home/index';
import { LoginPage } from '@/components/pages/auth/login';
import { SignupPage } from '@/components/pages/auth/signup';
import { DashboardPage } from '@/components/pages/dashboard';
import { EditorPage } from '@/components/pages/editor';
import { SettingsPage } from '@/components/pages/settings';

// Layout components
import { GuestLayout } from '@/components/layout/guest-layout';
import { AuthLayout } from '@/components/layout/auth-layout';

/**
 * Protected route wrapper component
 * Allows guests and authenticated users, redirects unauthenticated users to home
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Replace with proper loading component
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
}

/**
 * Auth-only route wrapper component
 * Redirects guests and unauthenticated users to login
 */
function AuthOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Replace with proper loading component
  }

  // Allow only authenticated (non-guest) users
  const isAuthenticated = user && !user.isGuest;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/**
 * Main application component
 * Handles routing between authentication and application views
 */
function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Replace with proper loading component
  }

  return (
    <Routes>
      {/* Home page - available to everyone */}
      <Route path="/" element={<HomePage />} />
      
      {/* Authentication routes - redirect authenticated users to dashboard */}
      <Route path="/login" element={
        user && !user.isGuest ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      <Route path="/signup" element={
        user && !user.isGuest ? <Navigate to="/dashboard" replace /> : <SignupPage />
      } />
      
      {/* Application routes - available to guests and authenticated users */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AuthLayout>
            <DashboardPage />
          </AuthLayout>
        </ProtectedRoute>
      } />
      <Route path="/editor/:documentId?" element={
        <ProtectedRoute>
          <AuthLayout>
            <EditorPage />
          </AuthLayout>
        </ProtectedRoute>
      } />
      
      {/* Auth-only routes - require full authentication */}
      <Route path="/settings" element={
        <AuthOnlyRoute>
          <AuthLayout>
            <SettingsPage />
          </AuthLayout>
        </AuthOnlyRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 