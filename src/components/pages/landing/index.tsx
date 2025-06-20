/**
 * @fileoverview Clean, modern landing page
 * @author WordWise AI Team
 * @version 7.0.0
 * 
 * Simple landing page with app name, description, and authentication.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';

/**
 * Landing page component
 * 
 * Clean, focused design with just the essentials.
 * 
 * @component
 */
export const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, continueAsGuest } = useAuth();

  // Clear error when user starts typing or switches tabs
  const clearError = () => {
    if (error) setError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn({ email, password });
      // Navigation will be handled by the App component when user state changes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await signUp({
        email,
        password,
        confirmPassword,
        displayName: displayName || email.split('@')[0], // Use email prefix if no display name
        userType: 'professional',
        experienceLevel: 'intermediate',
        acceptTerms: true // Auto-accept for now, add checkbox later if needed
      });
      // Navigation will be handled by the App component when user state changes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await continueAsGuest();
      // Navigation will be handled by the App component when user state changes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Guest sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Force CSS Variables - Emergency Fix */}
      <style>{`
        :root {
          --background: 255 255 255;
          --foreground: 15 23 42;
          --card: 255 255 255;
          --card-foreground: 15 23 42;
          --popover: 255 255 255;
          --popover-foreground: 15 23 42;
          --primary: 59 130 246;
          --primary-foreground: 255 255 255;
          --secondary: 71 85 105;
          --secondary-foreground: 255 255 255;
          --muted: 248 250 252;
          --muted-foreground: 100 116 139;
          --accent: 99 102 241;
          --accent-foreground: 255 255 255;
          --destructive: 220 38 38;
          --destructive-foreground: 255 255 255;
          --border: 226 232 240;
          --input: 255 255 255;
          --ring: 59 130 246;
        }
        
        /* Fix tabs active state */
        [data-state="active"] {
          background-color: #ffffff !important;
          color: #0f172a !important;
          box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.1) !important;
        }
        
        /* Input focus states */
        input:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Placeholder text styling */
        input::placeholder {
          color: #9ca3af !important;
          opacity: 1 !important;
        }
        
        /* Firefox placeholder fix */
        input::-moz-placeholder {
          color: #9ca3af !important;
          opacity: 1 !important;
        }
        
        /* Button hover states */
        button:hover:not(:disabled) {
          opacity: 0.9 !important;
          transform: translateY(-1px) !important;
          transition: all 0.2s ease !important;
        }
      `}</style>
      
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
      >


      <div className="w-full max-w-md">
        
        {/* Single Card Container - Centered */}
        <div 
          className="p-8 rounded-xl flex flex-col gap-8"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)',
            padding: '32px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}
        >
          
          {/* App Name & Description */}
          <div className="text-center space-y-4">
            <h1 
              className="text-4xl font-bold mb-2"
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '8px',
                textAlign: 'center'
              }}
            >
              Dungeons & Drafting
            </h1>
            <p 
              className="text-lg"
              style={{
                fontSize: '18px',
                color: '#64748b',
                lineHeight: '1.6',
                textAlign: 'center'
              }}
            >
              AI-powered writing assistant for Dungeon Masters creating epic D&D adventures.
            </p>
          </div>

          {/* Authentication */}
          <div>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <Tabs defaultValue="signin" className="w-full" onValueChange={clearError}>
              <TabsList 
                className="grid w-full grid-cols-2"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '4px'
                }}
              >
                <TabsTrigger 
                  value="signin"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      color: '#0f172a',
                      width: '100%'
                    }}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      color: '#0f172a',
                      width: '100%'
                    }}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      width: '100%',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
                
                {/* Guest Sign In Button */}
                <div className="mt-4">
                  <Button 
                    type="button"
                    onClick={handleGuestSignIn}
                    className="w-full" 
                    disabled={loading}
                    style={{
                      backgroundColor: '#f8fafc',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      width: '100%',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Starting...' : 'Continue as a guest'}
                  </Button>
                  <p 
                    className="text-center text-xs mt-2"
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      textAlign: 'center',
                      marginTop: '8px'
                    }}
                  >
                    Your work won't be saved when you sign out
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Display Name (optional)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={loading}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      color: '#0f172a',
                      width: '100%'
                    }}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      color: '#0f172a',
                      width: '100%'
                    }}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      color: '#0f172a',
                      width: '100%'
                    }}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      color: '#0f172a',
                      width: '100%'
                    }}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      width: '100%',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

LandingPage.displayName = 'LandingPage'; 