/**
 * @fileoverview Signup page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Signup page component with functional registration form.
 * Supports user profile creation with personalized writing preferences.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegisterCredentials, UserType, ExperienceLevel } from '@/types/auth';

/**
 * Signup page component
 * 
 * User registration page with comprehensive signup form.
 * 
 * @component
 */
export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterCredentials>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    userType: 'professional',
    experienceLevel: 'intermediate',
    niche: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  
  const { signUp, signInWithOAuth, error: authError } = useAuth();
  const navigate = useNavigate();

  /**
   * Validates form input
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName) {
      newErrors.displayName = 'Full name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signUp(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Google OAuth sign-up
   */
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInWithOAuth('google');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign-up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input changes
   */
  const handleInputChange = (field: keyof RegisterCredentials) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Clear field error when user starts typing
      // TODO: Fix type issue with error clearing
      // if (errors[field]) {
      //   setErrors(prev => ({ ...prev, [field]: undefined }));
      // }
    };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-headline-large font-bold text-primary">
            Join WordWise AI
          </h1>
          <p className="text-body-medium text-muted-foreground">
            Create your account and start writing smarter
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="p-4 bg-error-container/10 border border-error-container rounded-lg">
            <p className="text-body-small text-error-container-foreground text-center">
              {authError}
            </p>
          </div>
        )}

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-body-medium font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleInputChange('displayName')}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 border rounded-md',
                    'bg-background text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'placeholder:text-muted-foreground',
                    errors.displayName ? 'border-error' : 'border-border'
                  )}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              {errors.displayName && (
                <p className="text-body-small text-error">{errors.displayName}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-body-medium font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 border rounded-md',
                    'bg-background text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'placeholder:text-muted-foreground',
                    errors.email ? 'border-error' : 'border-border'
                  )}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-body-small text-error">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-body-medium font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={cn(
                    'w-full pl-10 pr-12 py-3 border rounded-md',
                    'bg-background text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'placeholder:text-muted-foreground',
                    errors.password ? 'border-error' : 'border-border'
                  )}
                  placeholder="Create a password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-body-small text-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-body-medium font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={cn(
                    'w-full pl-10 pr-12 py-3 border rounded-md',
                    'bg-background text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'placeholder:text-muted-foreground',
                    errors.confirmPassword ? 'border-error' : 'border-border'
                  )}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-body-small text-error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* User Type Selection */}
            <div className="space-y-2">
              <label htmlFor="userType" className="text-body-medium font-medium">
                I'm a...
              </label>
              <select
                id="userType"
                value={formData.userType}
                onChange={handleInputChange('userType')}
                className={cn(
                  'w-full px-3 py-3 border rounded-md',
                  'bg-background text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'border-border'
                )}
                disabled={isLoading}
              >
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="creator">Content Creator</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label htmlFor="experienceLevel" className="text-body-medium font-medium">
                Writing Experience
              </label>
              <select
                id="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange('experienceLevel')}
                className={cn(
                  'w-full px-3 py-3 border rounded-md',
                  'bg-background text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'border-border'
                )}
                disabled={isLoading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Niche (Optional) */}
            <div className="space-y-2">
              <label htmlFor="niche" className="text-body-medium font-medium">
                Writing Focus <span className="text-muted-foreground">(Optional)</span>
              </label>
              <input
                id="niche"
                type="text"
                value={formData.niche}
                onChange={handleInputChange('niche')}
                className={cn(
                  'w-full px-3 py-3 border rounded-md',
                  'bg-background text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'placeholder:text-muted-foreground',
                  'border-border'
                )}
                placeholder="e.g., Technical Writing, Academic Papers, Creative Fiction"
                disabled={isLoading}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange('acceptTerms')}
                  className="mt-1 rounded border-border text-primary focus:ring-primary"
                  disabled={isLoading}
                />
                <span className="text-body-small text-muted-foreground">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:text-primary/80 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-body-small text-error">{String(errors.acceptTerms)}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 px-4',
                'bg-primary text-primary-foreground rounded-md font-medium',
                'hover:bg-primary/90 focus:bg-primary/90',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors duration-200'
              )}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-body-small">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className={cn(
              'w-full flex items-center justify-center gap-3 py-3 px-4',
              'border border-border bg-background rounded-md font-medium',
              'hover:bg-muted focus:bg-muted',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-body-medium text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

SignupPage.displayName = 'SignupPage'; 