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
import { LandingPage } from '@/components/pages/landing';
import { LoginPage } from '@/components/pages/auth/login';
import { SignupPage } from '@/components/pages/auth/signup';
import { DashboardPage } from '@/components/pages/dashboard';
import { EditorPage } from '@/components/pages/editor';
import { SettingsPage } from '@/components/pages/settings';

// Layout components
import { PublicLayout } from '@/components/layout/public-layout';
import { AuthLayout } from '@/components/layout/auth-layout';

/**
 * Protected route wrapper component
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Replace with proper loading component
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
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
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      
      {/* Authentication routes */}
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : (
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        )
      } />
      <Route path="/signup" element={
        user ? <Navigate to="/dashboard" replace /> : (
          <PublicLayout>
            <SignupPage />
          </PublicLayout>
        )
      } />
      
      {/* Protected application routes */}
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
      <Route path="/settings" element={
        <ProtectedRoute>
          <AuthLayout>
            <SettingsPage />
          </AuthLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 