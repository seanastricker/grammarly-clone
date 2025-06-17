/**
 * @fileoverview Modern auth form component with tabbed interface
 * @author WordWise AI Team
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';

interface AuthFormProps {
  className?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ className = "" }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (activeTab: string) => async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Handle form submission
    if (activeTab === 'signin') {
      window.location.href = '/login';
    } else {
      window.location.href = '/signup';
    }
    
    setIsLoading(false);
  };

  return (
    <Card className={`w-full max-w-md mx-auto shadow-2xl border-0 bg-card/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Get Started
          </CardTitle>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Join thousands of writers improving their craft
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/60">
            <TabsTrigger value="signin" className="text-sm font-medium">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-sm font-medium">
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4 mt-0">
            <form onSubmit={handleSubmit('signin')} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">
                Forgot your password? <a href="#" className="text-primary hover:underline">Reset it here</a>
              </p>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4 mt-0">
            <form onSubmit={handleSubmit('signup')} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">
                By signing up, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

AuthForm.displayName = 'AuthForm'; 