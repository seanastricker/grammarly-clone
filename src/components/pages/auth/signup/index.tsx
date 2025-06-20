/**
 * @fileoverview Signup page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Clean, professional signup page inspired by Grammarly's minimal design.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegisterCredentials } from '@/types/auth';

/**
 * Clean signup page component with professional design
 * 
 * Features clean forms and minimal design like Grammarly.
 * 
 * @component
 */
export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterCredentials>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'professional',
    experienceLevel: 'intermediate',
    niche: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterCredentials>>({});
  
  const { signUp, signInWithOAuth, error: authError } = useAuth();
  const navigate = useNavigate();

  /**
   * Password strength indicator
   */
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['text-error', 'text-error', 'text-warning', 'text-primary', 'text-success'];
    
    return {
      score,
      label: labels[Math.min(score - 1, 4)] || '',
      color: colors[Math.min(score - 1, 4)] || ''
    };
  };

  /**
   * Validates form input
   */
  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must agree to the terms of service';
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setFormData((prev: RegisterCredentials) => ({ ...prev, [field]: value }));
      
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev: typeof errors) => ({ ...prev, [field]: undefined }));
      }
    };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Illustration/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-muted/30 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <div className="w-12 h-12 bg-primary rounded-full"></div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Start writing better today
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Join thousands of Dungeon Masters who use Dungeons & Drafting to create 
            amazing D&D campaigns and adventures.
          </p>
          
          {/* Features list */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary mr-3" />
              <span>Campaign grammar and style analysis</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary mr-3" />
              <span>AI-powered D&D content generation</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary mr-3" />
              <span>Fantasy name & character generators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="text-2xl font-bold text-foreground">
              Dungeons & Drafting
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start writing better in under 60 seconds
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-4 bg-error-container rounded-lg border border-error-container-foreground/20">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-error mr-3" />
                <p className="text-sm text-error font-medium">
                  {authError}
                </p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleInputChange('displayName')}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground transition-colors',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.displayName ? 'border-error' : 'border-border'
                  )}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              {errors.displayName && (
                <p className="mt-1 text-sm text-error">{errors.displayName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground transition-colors',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.email ? 'border-error' : 'border-border'
                  )}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email}</p>
              )}
            </div>

            {/* Password Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className={cn(
                      'w-full pl-10 pr-12 py-3 border rounded-lg bg-background text-foreground transition-colors',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                      errors.password ? 'border-error' : 'border-border'
                    )}
                    placeholder="Create password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-colors',
                            i < passwordStrength.score ? 'bg-primary' : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn('text-xs mt-1', passwordStrength.color)}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-error">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    className={cn(
                      'w-full pl-10 pr-12 py-3 border rounded-lg bg-background text-foreground transition-colors',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                      errors.confirmPassword ? 'border-error' : 'border-border'
                    )}
                    placeholder="Confirm password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange('acceptTerms')}
                  className="h-4 w-4 mt-0.5 text-primary focus:ring-primary border-border rounded"
                  disabled={isLoading}
                />
                <span className="ml-3 text-sm text-muted-foreground">
                  I agree to Dungeons & Drafting's{' '}
                  <Link to="/terms" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-sm text-error">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-colors',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center py-3 px-4 border border-border rounded-lg font-medium transition-colors',
                'bg-background text-foreground hover:bg-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-muted-foreground">
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
    </div>
  );
};

SignupPage.displayName = 'SignupPage'; 