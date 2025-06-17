/**
 * @fileoverview Landing page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Landing page for WordWise AI with hero section and value proposition.
 * TODO: Implement full landing page design and features.
 */

import React from 'react';

/**
 * Landing page component
 * 
 * Main landing page for unauthenticated users.
 * Shows value proposition and sign-up call-to-action.
 * 
 * @component
 */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-display-large font-bold text-primary">
            WordWise AI
          </h1>
          <p className="text-title-large text-muted-foreground">
            Intelligent Writing Assistant
          </p>
          <p className="text-body-large max-w-2xl mx-auto">
            AI-powered writing assistant with advanced grammar checking, 
            style suggestions, and intelligent content optimization.
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <a
              href="/signup"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

LandingPage.displayName = 'LandingPage'; 