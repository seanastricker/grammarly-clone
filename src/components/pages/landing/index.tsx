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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in:', { email, password });
    // Handle sign in logic
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up:', { email, password, confirmPassword });
    // Handle sign up logic
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Single Card Container */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          
          {/* App Name & Description */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              WordWise
            </h1>
            <p className="text-gray-600">
              AI-powered writing assistant that helps you write better content.
            </p>
          </div>

          {/* Authentication */}
          <div>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Sign Up
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

LandingPage.displayName = 'LandingPage'; 