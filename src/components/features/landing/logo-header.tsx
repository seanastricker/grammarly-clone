/**
 * @fileoverview Logo header component for landing page
 * @author WordWise AI Team
 */

import React from 'react';
import { PenTool } from 'lucide-react';

interface LogoHeaderProps {
  className?: string;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({ className = "" }) => {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      {/* Logo with Icon */}
      <div className="flex items-center justify-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
            <PenTool className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
          WordWise
        </h1>
      </div>
      
      {/* Tagline */}
      <div className="space-y-2">
        <p className="text-xl text-muted-foreground font-medium">
          Write like a professional.
        </p>
        <p className="text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
          AI-powered writing assistant that helps you create clear, 
          compelling content with confidence.
        </p>
      </div>
    </div>
  );
};

LogoHeader.displayName = 'LogoHeader'; 