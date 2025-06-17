/**
 * @fileoverview Dashboard page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Dashboard page component for authenticated users.
 * TODO: Implement full dashboard with documents and analytics.
 */

import React from 'react';

/**
 * Dashboard page component
 * 
 * Main dashboard for authenticated users.
 * 
 * @component
 */
export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6">
          <h1 className="text-headline-large font-bold">
            Dashboard
          </h1>
          <p className="text-body-large text-muted-foreground">
            Welcome to WordWise AI Dashboard
          </p>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <p className="text-center text-muted-foreground">
              Dashboard content coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage'; 