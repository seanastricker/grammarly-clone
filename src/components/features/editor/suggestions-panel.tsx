/**
 * @fileoverview Grammar suggestions panel component
 * @author WordWise AI Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { CheckCircle2, X, AlertCircle, Lightbulb, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyzedError } from '@/services/ai/language-tool';

interface SuggestionsPanelProps {
  errors: AnalyzedError[];
  statistics: {
    totalErrors: number;
    grammarErrors: number;
    spellingErrors: number;
    styleIssues: number;
    qualityScore: number;
  } | null;
  isAnalyzing: boolean;
  onAcceptSuggestion: (errorId: string, suggestion: string) => void;
  onDismissError: (errorId: string) => void;
  onAcceptAll: (type?: 'grammar' | 'spelling' | 'style') => void;
  className?: string;
}

const ErrorTypeIcon = ({ type }: { type: 'grammar' | 'spelling' | 'style' }) => {
  switch (type) {
    case 'grammar':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'spelling':
      return <FileText className="w-4 h-4 text-red-500" />;
    case 'style':
      return <Lightbulb className="w-4 h-4 text-amber-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

const SeverityBadge = ({ severity }: { severity: 'error' | 'warning' | 'suggestion' }) => {
  const styles = {
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    suggestion: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };

  return (
    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', styles[severity])}>
      {severity}
    </span>
  );
};

const SuggestionCard: React.FC<{
  error: AnalyzedError;
  onAccept: (suggestion: string) => void;
  onDismiss: () => void;
}> = ({ error, onAccept, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(error.suggestions[0] || '');

  console.log('🔧 SuggestionCard rendered for error:', error.id, 'Has functions:', {
    onAccept: typeof onAccept,
    onDismiss: typeof onDismiss,
    selectedSuggestion,
    suggestionsCount: error.suggestions.length
  });

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <ErrorTypeIcon type={error.type} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-foreground capitalize">
                {error.type}
              </span>
              <SeverityBadge severity={error.severity} />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{error.shortMessage}</p>
            
            {/* Context */}
            <div className="bg-muted/50 rounded p-2 text-sm font-mono">
              <span className="text-muted-foreground">
                {error.context.text.substring(0, error.context.highlightStart)}
              </span>
              <span className="bg-red-200 dark:bg-red-900/50 px-1 rounded">
                {error.context.text.substring(
                  error.context.highlightStart,
                  error.context.highlightEnd
                )}
              </span>
              <span className="text-muted-foreground">
                {error.context.text.substring(error.context.highlightEnd)}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md hover:bg-muted transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Suggestions */}
      {error.suggestions.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Suggestions:
          </label>
          <div className="space-y-1">
            {error.suggestions.slice(0, 3).map((suggestion, index) => (
              <label
                key={index}
                className="flex items-center space-x-2 p-2 rounded border border-border hover:bg-muted/50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`suggestion-${error.id}`}
                  value={suggestion}
                  checked={selectedSuggestion === suggestion}
                  onChange={(e) => setSelectedSuggestion(e.target.value)}
                  className="text-primary"
                />
                <span className="text-sm font-mono text-foreground">{suggestion}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className="pt-2 border-t border-border">
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Rule: </span>
              <span className="text-xs text-foreground">{error.rule.id}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Category: </span>
              <span className="text-xs text-foreground">{error.rule.category}</span>
            </div>
            <p className="text-xs text-muted-foreground">{error.message}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            console.log('🔧 DISMISS CLICKED - START');
            console.log('🔧 Error ID:', error.id);
            console.log('🔧 onDismiss type:', typeof onDismiss);
            console.log('🔧 onDismiss function:', onDismiss);
            
            try {
              onDismiss();
              console.log('🔧 DISMISS - onDismiss() called successfully');
            } catch (err) {
              console.error('🔧 DISMISS - Error calling onDismiss():', err);
            }
          }}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
          <span>Dismiss</span>
        </button>
        
        {error.suggestions.length > 0 && (
          <button
            onClick={() => {
              console.log('🔧 APPLY CLICKED - START');
              console.log('🔧 Error ID:', error.id);
              console.log('🔧 Selected suggestion:', selectedSuggestion);
              console.log('🔧 onAccept type:', typeof onAccept);
              console.log('🔧 onAccept function:', onAccept);
              
              try {
                if (selectedSuggestion) {
                  onAccept(selectedSuggestion);
                  console.log('🔧 APPLY - onAccept() called successfully');
                } else {
                  console.error('🔧 APPLY - No suggestion selected');
                }
              } catch (err) {
                console.error('🔧 APPLY - Error calling onAccept():', err);
              }
            }}
            disabled={!selectedSuggestion}
            className="flex items-center space-x-1 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Apply</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  errors,
  statistics,
  isAnalyzing,
  onAcceptSuggestion,
  onDismissError,
  onAcceptAll,
  className,
}) => {
  const [filter, setFilter] = useState<'all' | 'grammar' | 'spelling' | 'style'>('all');

  const filteredErrors = errors.filter(error => 
    filter === 'all' || error.type === filter
  );

  const getFilterCount = (type: 'all' | 'grammar' | 'spelling' | 'style') => {
    if (type === 'all') return errors.length;
    return errors.filter(error => error.type === type).length;
  };

  return (
    <div className={cn('w-80 border-l border-border bg-background overflow-hidden flex flex-col', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Writing Assistant</h3>
          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Analyzing...</span>
            </div>
          )}
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quality Score</span>
              <span className={cn(
                'text-sm font-medium',
                statistics.qualityScore >= 80 ? 'text-green-600' :
                statistics.qualityScore >= 60 ? 'text-amber-600' : 'text-red-600'
              )}>
                {statistics.qualityScore}/100
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  statistics.qualityScore >= 80 ? 'bg-green-500' :
                  statistics.qualityScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${statistics.qualityScore}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {(['all', 'grammar', 'spelling', 'style'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                filter === type
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span className="capitalize">{type}</span>
              <span className="ml-1 text-xs">({getFilterCount(type)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions list */}
      <div className="flex-1 overflow-y-auto">
        {filteredErrors.length > 0 ? (
          <div className="p-4 space-y-4">
            {/* Bulk actions */}
            {filteredErrors.length > 1 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onAcceptAll(filter === 'all' ? undefined : filter)}
                  className="flex-1 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Accept All {filter !== 'all' && filter}
                </button>
              </div>
            )}

                         {/* Error cards */}
             {filteredErrors.map((error) => (
               <SuggestionCard
                 key={error.id}
                 error={error}
                 onAccept={(suggestion) => {
                   console.log('🔧 PANEL: onAccept called for error:', error.id, 'suggestion:', suggestion);
                   onAcceptSuggestion(error.id, suggestion);
                 }}
                 onDismiss={() => {
                   console.log('🔧 PANEL: onDismiss called for error:', error.id);
                   onDismissError(error.id);
                 }}
               />
             ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-medium text-foreground mb-1">All Clear!</h4>
              <p className="text-sm text-muted-foreground">
                {filter === 'all' 
                  ? "No issues found in your writing."
                  : `No ${filter} issues found.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 