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

interface StatsSidebarProps {
  document: Document | null;
  stats: DocumentStats;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  className?: string;
}

export const StatsSidebar: React.FC<StatsSidebarProps> = ({
  document,
  stats,
  isSaving,
  hasUnsavedChanges,
  lastSaved,
  className
}) => {
  const formatNumber = (num: number) => num.toLocaleString();

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('w-64 border-l border-slate-200 bg-white p-4 space-y-6', className)}>
      {/* Document Info */}
      {document && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Document</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Title</p>
              <p className="text-sm font-medium text-slate-900 truncate" title={document.title}>
                {document.title}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Type</p>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                {document.type}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Save Status */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Status</h3>
        
        <div className="flex items-center space-x-2">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-blue-500">Saving...</span>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-500">Unsaved</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">Saved</span>
            </>
          )}
        </div>
        
        <p className="text-xs text-slate-600">
          Last saved: {formatLastSaved(lastSaved)}
        </p>
      </div>

      {/* Writing Statistics */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Statistics</h3>
        
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-sm text-slate-600">Words</span>
            <span className="text-sm font-medium text-slate-900">{formatNumber(stats.wordCount)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-slate-600">Characters</span>
            <span className="text-sm font-medium text-slate-900">{formatNumber(stats.characterCount)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-slate-600">No spaces</span>
            <span className="text-sm font-medium text-slate-900">{formatNumber(stats.characterCountNoSpaces)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-slate-600">Paragraphs</span>
            <span className="text-sm font-medium text-slate-900">{formatNumber(stats.paragraphCount)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-slate-600">Reading time</span>
            <span className="text-sm font-medium text-slate-900">{stats.readingTime} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 