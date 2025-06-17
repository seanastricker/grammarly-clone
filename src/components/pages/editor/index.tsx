/**
 * @fileoverview Editor page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Complete document editor with rich text editing, auto-save, and modern UI design.
 */

import React, { useState } from 'react';
import { ArrowLeft, Save, Download, Share, Settings, Loader2, FileCheck, Eye, Sparkles, BarChart } from 'lucide-react';
import { useDocumentEditor } from '@/hooks/use-document-editor';
import { useGrammarAnalysis } from '@/hooks/use-grammar-analysis';
import { RichTextEditor } from '@/components/features/editor/rich-text-editor';
import { StatsSidebar } from '@/components/features/editor/stats-sidebar';
import { SuggestionsPanel } from '@/components/features/editor/suggestions-panel';
import type { AnalyzedError } from '@/services/ai/language-tool';
import { cn } from '@/lib/utils';

/**
 * Editor page component
 * 
 * Complete document editor with AI-powered writing assistance and modern UI.
 * 
 * @component
 */
export const EditorPage: React.FC = () => {
  const {
    document,
    content,
    stats,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    lastSaved,
    isReady,
    updateContent,
    saveDocument,
    goBack
  } = useDocumentEditor();

  // UI state
  const [isGrammarEnabled, setIsGrammarEnabled] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // Grammar analysis hook
  const {
    errors: grammarErrors,
    statistics: grammarStatistics,
    isAnalyzing: isGrammarAnalyzing,
    dismissError,
    clearErrors,
    analyzeContent,
    manualAnalyze
  } = useGrammarAnalysis({
    enabled: isGrammarEnabled,
    debounceMs: 1000,
    language: 'en-US',
    minLength: 10
  });

  // Grammar analysis handlers
  const handleGrammarAnalysis = (errors: AnalyzedError[], statistics: any) => {
    console.log('🔧 Received grammar analysis results:', { 
      errorCount: errors.length, 
      qualityScore: statistics?.qualityScore 
    });
    
    // The hook automatically manages the errors, so we don't need to set state here
    // This handler is kept for potential future use or debugging
  };

  const handleAcceptSuggestion = (errorId: string, suggestion: string) => {
    console.log('🔧 Accepting suggestion:', { errorId, suggestion, currentErrors: grammarErrors.length });
    
    // Find the error to get its position information
    const error = grammarErrors.find(e => e.id === errorId);
    if (!error) {
      console.warn('🔧 Error not found for suggestion application:', errorId);
      return;
    }

    console.log('🔧 Found error for suggestion:', {
      errorId,
      position: error.position,
      suggestion,
      contextText: error.context.text,
      highlightRange: [error.context.highlightStart, error.context.highlightEnd]
    });

    try {
      // Get current plain text content from the editor for position mapping
      const currentPlainText = content.replace(/<[^>]*>/g, '');
      
      console.log('🔧 Editor-based replacement approach:', {
        currentPlainTextLength: currentPlainText.length,
        errorPosition: error.position,
        textAtPosition: currentPlainText.substring(error.position.start, error.position.end)
      });

      // Extract the exact text that should be replaced from the error context
      const expectedErrorText = error.context.text.substring(
        error.context.highlightStart,
        error.context.highlightEnd
      );

      console.log('🔧 Expected error text from context:', expectedErrorText);

      // Apply capitalization preservation if needed
      let finalSuggestion = suggestion;
      if (shouldPreserveCapitalization(currentPlainText, error.position.start, expectedErrorText)) {
        finalSuggestion = capitalizeFirstLetter(suggestion);
        console.log('🔧 Preserving capitalization:', { original: expectedErrorText, suggestion, finalSuggestion });
      }

      // Use direct content replacement approach
      // This works by replacing in the plain text and letting the editor handle the update
      const beforeText = currentPlainText.substring(0, error.position.start);
      const afterText = currentPlainText.substring(error.position.end);
      const newPlainText = beforeText + finalSuggestion + afterText;
      
      console.log('🔧 Direct content replacement:', {
        beforeLength: beforeText.length,
        originalLength: expectedErrorText.length,
        suggestionLength: finalSuggestion.length,
        afterLength: afterText.length,
        totalOldLength: currentPlainText.length,
        totalNewLength: newPlainText.length,
        preview: {
          before: beforeText.slice(-10),
          original: expectedErrorText,
          suggestion: finalSuggestion,
          after: afterText.slice(0, 10)
        }
      });

      // Update the content directly
      // This will trigger the editor to update and clear existing highlights
      updateContent(newPlainText);

      // Dismiss the error after successful replacement
      dismissError(errorId);

      console.log('🔧 Successfully applied suggestion and dismissed error');
      
    } catch (err) {
      console.error('🔧 Error applying suggestion:', err);
      // Still dismiss the error even if replacement fails to prevent UI confusion
      dismissError(errorId);
    }
  };

  /**
   * Check if we should preserve capitalization (start of sentence/document)
   */
  const shouldPreserveCapitalization = (text: string, position: number, originalText: string): boolean => {
    // If original text starts with uppercase, we should preserve it
    const originalStartsWithUpper = /^[A-Z]/.test(originalText);
    
    console.log('🔧 Capitalization check:', {
      originalText,
      originalStartsWithUpper,
      position,
      textAtPosition: text.substring(Math.max(0, position - 5), position + 5)
    });
    
    if (!originalStartsWithUpper) {
      console.log('🔧 Original text does not start with uppercase, no preservation needed');
      return false;
    }
    
    // Check if this is at the start of the document
    if (position === 0) {
      console.log('🔧 Position is at start of document, preserving capitalization');
      return true;
    }
    
    // Check if this follows a sentence-ending punctuation
    const beforeText = text.substring(0, position).trim();
    const sentenceEndPattern = /[.!?]\s*$/;
    const followsSentenceEnd = sentenceEndPattern.test(beforeText);
    
    console.log('🔧 Sentence end check:', {
      beforeText: beforeText.slice(-20),
      followsSentenceEnd,
      shouldPreserve: followsSentenceEnd
    });
    
    return followsSentenceEnd;
  };

  /**
   * Capitalize the first letter of a string
   */
  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return text;
    const result = text.charAt(0).toUpperCase() + text.slice(1);
    console.log('🔧 Capitalizing:', { original: text, result });
    return result;
  };

  const handleDismissError = (errorId: string) => {
    console.log('🔧 PARENT: Dismissing error via hook:', { errorId, currentErrors: grammarErrors.length });
    
    // Use the hook's dismissError function which tracks dismissed errors
    dismissError(errorId);
  };

  const handleAcceptAll = (type?: 'grammar' | 'spelling' | 'style') => {
    if (type) {
      // Dismiss all errors of a specific type
      const errorsToRemove = grammarErrors.filter(error => error.type === type);
      errorsToRemove.forEach(error => dismissError(error.id));
    } else {
      // Clear all errors
      clearErrors();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center space-y-6 p-8 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-soft">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading Document</h2>
            <p className="text-muted-foreground">Preparing your writing space...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md p-8 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-soft">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Error Loading Document</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Document not found
  if (!isReady || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md p-8 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-soft">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl">📄</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Document Not Found</h1>
            <p className="text-muted-foreground">
              The document you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </div>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      {/* Enhanced Header */}
      <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-xl supports-[backdrop-filter]:bg-card/30 sticky top-0 z-50 shadow-soft">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-tertiary/5" />
        <div className="relative flex items-center justify-between px-6 py-4">
          {/* Left side */}
          <div className="flex items-center gap-6">
            <button
              onClick={goBack}
              className="p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 group-hover:text-primary transition-colors" />
            </button>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground truncate max-w-[300px]" title={document.title}>
                  {document.title}
                </h1>
                {isGrammarEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs font-medium text-primary">
                    <Sparkles className="w-3 h-3" />
                    AI Enabled
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="capitalize flex items-center gap-1">
                  📝 {document.type}
                </span>
                <span className="flex items-center gap-1">
                  📊 {stats.wordCount} words
                </span>
                {hasUnsavedChanges && (
                  <span className="text-amber-600 flex items-center gap-1">
                    ⚠️ Unsaved changes
                  </span>
                )}
                {isSaving && (
                  <span className="text-blue-600 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Primary Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={saveDocument}
                disabled={isSaving || !hasUnsavedChanges}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                  hasUnsavedChanges
                    ? 'bg-gradient-to-r from-primary to-tertiary text-primary-foreground hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
                title="Save Document (Ctrl+S)"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>

            {/* Toggle Actions */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-2xl">
              <button
                onClick={() => {
                  const newState = !isGrammarEnabled;
                  console.log('🔧 Toggling grammar check:', { from: isGrammarEnabled, to: newState });
                  
                  setIsGrammarEnabled(newState);
                  
                  if (newState && content) {
                    console.log('🔧 Re-enabling grammar check, triggering manual analysis');
                    manualAnalyze(content);
                  }
                }}
                className={cn(
                  'p-2 rounded-xl transition-all duration-300 group',
                  isGrammarEnabled
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground'
                )}
                title={isGrammarEnabled ? 'Disable Grammar Check' : 'Enable Grammar Check'}
              >
                <FileCheck className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  isGrammarEnabled ? "scale-110" : "group-hover:scale-110"
                )} />
              </button>

              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={cn(
                  'p-2 rounded-xl transition-all duration-300 group',
                  showSuggestions
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground'
                )}
                title={showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
              >
                <Eye className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  showSuggestions ? "scale-110" : "group-hover:scale-110"
                )} />
              </button>

              <button
                onClick={() => setShowStats(!showStats)}
                className={cn(
                  'p-2 rounded-xl transition-all duration-300 group',
                  showStats
                    ? 'bg-tertiary text-tertiary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground'
                )}
                title={showStats ? 'Hide Statistics' : 'Show Statistics'}
              >
                <BarChart className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  showStats ? "scale-110" : "group-hover:scale-110"
                )} />
              </button>
            </div>
            
            {/* Secondary Actions */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:-translate-y-0.5 text-muted-foreground hover:text-foreground"
                title="Download Document"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                className="p-2 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:-translate-y-0.5 text-muted-foreground hover:text-foreground"
                title="Share Document"
              >
                <Share className="w-4 h-4" />
              </button>
              
              <button
                className="p-2 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:-translate-y-0.5 text-muted-foreground hover:text-foreground"
                title="Document Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Editor */}
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full p-8 max-w-4xl mx-auto">
            <div className="h-full bg-card/30 backdrop-blur-sm rounded-3xl border border-border/50 shadow-soft overflow-hidden">
              <RichTextEditor
                content={content}
                onUpdate={(newContent) => {
                  updateContent(newContent);
                  // Trigger grammar analysis on content change
                  if (isGrammarEnabled) {
                    analyzeContent(newContent);
                  }
                }}
                placeholder={`Start writing your ${document.type}...`}
                className="h-full p-8"
                enableGrammarCheck={isGrammarEnabled}
                onGrammarAnalysis={handleGrammarAnalysis}
                currentErrors={grammarErrors}
              />
            </div>
          </div>
        </main>

        {/* Floating Sidebars */}
        <div className="absolute right-6 top-6 bottom-6 flex flex-col gap-4 z-10">
          {/* Suggestions Panel */}
          {showSuggestions && isGrammarEnabled && (
            <div className="w-80 bg-card/50 backdrop-blur-xl rounded-3xl border border-border/50 shadow-medium overflow-hidden animate-slide-in-right">
              <SuggestionsPanel
                errors={grammarErrors}
                statistics={grammarStatistics}
                isAnalyzing={isGrammarAnalyzing}
                onAcceptSuggestion={(errorId, suggestion) => {
                  console.log('🔧 PARENT: onAcceptSuggestion called with:', { errorId, suggestion });
                  handleAcceptSuggestion(errorId, suggestion);
                }}
                onDismissError={(errorId) => {
                  console.log('🔧 PARENT: onDismissError called with:', { errorId });
                  handleDismissError(errorId);
                }}
                onAcceptAll={handleAcceptAll}
              />
            </div>
          )}
          
          {/* Stats Sidebar */}
          {showStats && (
            <div className="w-80 bg-card/50 backdrop-blur-xl rounded-3xl border border-border/50 shadow-medium overflow-hidden animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <StatsSidebar
                document={document}
                stats={stats}
                isSaving={isSaving}
                hasUnsavedChanges={hasUnsavedChanges}
                lastSaved={lastSaved}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

EditorPage.displayName = 'EditorPage'; 