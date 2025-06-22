/**
 * @fileoverview Settings page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Settings page component for user account management.
 * Allows users to change password, email, and username.
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { validatePassword, getPasswordRequirements } from '@/lib/utils';

interface FormData {
  displayName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string | string[];
  confirmPassword?: string;
}

/**
 * Settings page component
 * 
 * User settings and account management page.
 * Allows authenticated users to update their profile information.
 * 
 * @component
 */
export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'profile' | 'email' | 'password'>('profile');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = (section: 'profile' | 'email' | 'password'): FormErrors => {
    const newErrors: FormErrors = {};

    if (section === 'profile') {
      if (!formData.displayName.trim()) {
        newErrors.displayName = 'Display name is required';
      } else if (formData.displayName.length < 2) {
        newErrors.displayName = 'Display name must be at least 2 characters';
      }
    }

    if (section === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change email';
      }
    }

    if (section === 'password') {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else {
        // Use the new password validation utility
        const passwordValidation = validatePassword(formData.newPassword);
        if (!passwordValidation.isValid) {
          newErrors.newPassword = passwordValidation.errors;
        }
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const reauthenticate = async () => {
    if (!auth.currentUser || !formData.currentPassword) {
      throw new Error('Authentication required');
    }

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email!,
      formData.currentPassword
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
  };

  const handleUpdateProfile = async () => {
    const newErrors = validateForm('profile');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName
      });

      // Update Firestore profile
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        updatedAt: new Date()
      });

      setSuccessMessage('Profile updated successfully!');
      setActiveSection('profile');
    } catch (error: any) {
      setErrors({ displayName: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    const newErrors = validateForm('email');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      // Reauthenticate user
      await reauthenticate();

      // Update email in Firebase Auth
      await updateEmail(auth.currentUser, formData.email);

      // Update email in Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        email: formData.email,
        emailVerified: false, // Email needs to be verified again
        updatedAt: new Date()
      });

      setSuccessMessage('Email updated successfully! Please verify your new email address.');
      setFormData(prev => ({ ...prev, currentPassword: '' }));
      setActiveSection('email');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already in use' });
      } else {
        setErrors({ email: error.message || 'Failed to update email' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const newErrors = validateForm('password');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      // Reauthenticate user
      await reauthenticate();

      // Update password
      await updatePassword(auth.currentUser, formData.newPassword);

      setSuccessMessage('Password updated successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setActiveSection('password');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ newPassword: 'Password is too weak' });
      } else {
        setErrors({ newPassword: error.message || 'Failed to update password' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Manage your account information and security settings
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">{successMessage}</span>
            </div>
          )}

          {/* Settings Sections */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* Profile Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold">Profile Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className={errors.displayName ? 'border-red-500' : ''}
                    placeholder="Enter your display name"
                  />
                  {errors.displayName && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.displayName}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading && activeSection === 'profile' ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </Card>

            {/* Email Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold">Email Address</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="currentPasswordEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <Input
                    id="currentPasswordEmail"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className={errors.currentPassword ? 'border-red-500' : ''}
                    placeholder="Enter your current password"
                  />
                  {errors.currentPassword && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.currentPassword}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUpdateEmail}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading && activeSection === 'email' ? 'Updating...' : 'Update Email'}
                </Button>
              </div>
            </Card>

            {/* Password Settings */}
            <Card className="p-6 md:col-span-1 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold">Change Password</h2>
              </div>
              
              {/* Password Requirements */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">Password Requirements:</p>
                <p className="text-sm text-blue-700">{getPasswordRequirements()}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="currentPasswordChange" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <Input
                    id="currentPasswordChange"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className={errors.currentPassword ? 'border-red-500' : ''}
                    placeholder="Enter current password"
                  />
                  {errors.currentPassword && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.currentPassword}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className={errors.newPassword ? 'border-red-500' : ''}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && (
                    <div className="mt-2 space-y-1">
                      {Array.isArray(errors.newPassword) ? (
                        errors.newPassword.map((error, index) => (
                          <div key={index} className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{error}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{errors.newPassword}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleUpdatePassword}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading && activeSection === 'password' ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Security Notice */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-blue-900">Security Notice</h3>
                <p className="text-blue-700 mt-1">
                  For security purposes, you'll need to enter your current password when changing your email or password. 
                  After updating your email, you'll need to verify your new email address.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

SettingsPage.displayName = 'SettingsPage'; 