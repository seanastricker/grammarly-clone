/**
 * @fileoverview Editor statistics sidebar component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Sidebar component displaying writing statistics and document information.
 */

import React from 'react';
import { 
  FileText, 
  Clock, 
  Type, 
  Hash, 
  BookOpen, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@/types/document';

interface DocumentStats {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  paragraphCount: number;
  readingTime: number;
}

interface EditorStatsProps {
  document: Document | null;
  stats: DocumentStats;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  className?: string;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, className }) => (
  <div className={cn('flex items-center space-x-3 p-3 rounded-lg bg-muted/50', className)}>
    <div className="text-muted-foreground">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const SaveStatus: React.FC<{
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}> = ({ isSaving, hasUnsavedChanges, lastSaved }) => {
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (isSaving) {
    return (
      <div className="flex items-center space-x-2 text-blue-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center space-x-2 text-amber-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Unsaved changes</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-600">
      <CheckCircle className="w-4 h-4" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">All changes saved</span>
        <span className="text-xs text-muted-foreground">
          Last saved: {formatLastSaved(lastSaved)}
        </span>
      </div>
    </div>
  );
};

export const EditorStats: React.FC<EditorStatsProps> = ({
  document,
  stats,
  isSaving,
  hasUnsavedChanges,
  lastSaved,
  className
}) => {
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className={cn('space-y-6 p-4', className)}>
      {/* Document Info */}
      {document && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Document Info</span>
          </h3>
          
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium text-foreground truncate" title={document.title}>
                {document.title}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {document.type}
              </span>
            </div>
            
            {document.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm text-foreground line-clamp-3">
                  {document.description}
                </p>
              </div>
            )}
            
            {document.tags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Status */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <Save className="w-5 h-5" />
          <span>Save Status</span>
        </h3>
        
        <SaveStatus
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSaved={lastSaved}
        />
      </div>

      {/* Writing Statistics */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <Type className="w-5 h-5" />
          <span>Writing Stats</span>
        </h3>
        
        <div className="grid gap-3">
          <StatItem
            icon={<Hash className="w-4 h-4" />}
            label="Words"
            value={formatNumber(stats.wordCount)}
          />
          
          <StatItem
            icon={<Type className="w-4 h-4" />}
            label="Characters"
            value={formatNumber(stats.characterCount)}
          />
          
          <StatItem
            icon={<FileText className="w-4 h-4" />}
            label="Characters (no spaces)"
            value={formatNumber(stats.characterCountNoSpaces)}
          />
          
          <StatItem
            icon={<BookOpen className="w-4 h-4" />}
            label="Paragraphs"
            value={formatNumber(stats.paragraphCount)}
          />
          
          <StatItem
            icon={<Clock className="w-4 h-4" />}
            label="Reading time"
            value={`${stats.readingTime} min${stats.readingTime !== 1 ? 's' : ''}`}
          />
        </div>
      </div>

      {/* Writing Goals (Placeholder for future) */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Writing Goals</h3>
        <div className="p-3 border border-dashed border-border rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Goal tracking coming soon
          </p>
        </div>
      </div>
    </div>
  );
}; 