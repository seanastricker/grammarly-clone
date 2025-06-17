/**
 * @fileoverview Trust indicators component for landing page
 * @author WordWise AI Team
 */

import React from 'react';
import { Shield, Users, Zap, Award, CheckCircle } from 'lucide-react';

interface TrustIndicatorsProps {
  className?: string;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ className = "" }) => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your writing stays private with enterprise-grade security"
    },
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Advanced algorithms provide intelligent writing suggestions"
    },
    {
      icon: Award,
      title: "Professional Grade",
      description: "Trusted by professionals and organizations worldwide"
    }
  ];

  const stats = [
    { label: "Active Writers", value: "50K+" },
    { label: "Words Improved", value: "10M+" },
    { label: "Accuracy Rate", value: "99%" }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Quick Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {feature.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Free to start</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>No credit card required</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Cancel anytime</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
        {stats.map((stat, index) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

TrustIndicators.displayName = 'TrustIndicators'; 