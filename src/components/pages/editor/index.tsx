/**
 * @fileoverview Editor page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Complete document editor with rich text editing, auto-save, and modern UI design.
 */

import React, { useState } from 'react';
import { ArrowLeft, Save, Download, Settings, Loader2, Sparkles, BarChart, Bot } from 'lucide-react';
import { useDocumentEditor } from '@/hooks/use-document-editor';
import { useGrammarAnalysis } from '@/hooks/use-grammar-analysis';
import { RichTextEditor } from '@/components/features/editor/rich-text-editor';
import { StatsSidebar } from '@/components/features/editor/stats-sidebar';
import { ExportModal } from '@/components/features/editor/export-modal';
import { DocumentSettingsModal } from '@/components/features/editor/document-settings-modal';
import { UnifiedAIAssistant } from '@/components/features/editor/unified-ai-assistant';
import type { AnalyzedError } from '@/services/ai/language-tool';
import type { WritingSuggestion } from '@/services/ai/openai-service';
import type { AIGrammarError } from '@/services/ai/grammar-ai-service';
import type { DocumentType } from '@/types/document';
import { cn, extractPlainTextFromHTML, applyTextChangeToHTML, applyMultipleTextChangesToHTML } from '@/lib/utils';

// Type for grammar error suggestions
interface AIGrammarSuggestion extends WritingSuggestion {
  isGrammarError: true;
  originalError: AIGrammarError;
}

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
    updateDocumentMetadata,
    goBack
  } = useDocumentEditor();

  // UI state
  const [isGrammarEnabled, setIsGrammarEnabled] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDocumentSettings, setShowDocumentSettings] = useState(false);

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
    console.log('🔧 INDIVIDUAL APPLY - Starting application:', { errorId, suggestion, currentErrors: grammarErrors.length });
    
    // Find the error to get its information
    const error = grammarErrors.find(e => e.id === errorId);
    if (!error) {
      console.warn('🔧 INDIVIDUAL APPLY - Error not found:', errorId);
      return;
    }

    try {
      // Get plain text for position verification
      const currentPlainText = extractPlainTextFromHTML(content);
      
      // Extract the original fragment that needs to be replaced from the error context
      const originalFragment = error.context.text.substring(
        error.context.highlightStart,
        error.context.highlightEnd
      );

      console.log('🔧 INDIVIDUAL APPLY - Processing:', {
        errorId,
        originalFragment,
        suggestion,
        errorPosition: error.position,
        fragmentFound: currentPlainText.includes(originalFragment)
      });

      // Check if the original fragment still exists in the current text
      if (!currentPlainText.includes(originalFragment)) {
        console.warn('🔧 INDIVIDUAL APPLY - Original fragment not found, dismissing error');
        dismissError(errorId);
        return;
      }

      // Apply capitalization preservation if needed
      let finalSuggestion = suggestion;
      const fragmentIndex = currentPlainText.indexOf(originalFragment);
      if (shouldPreserveCapitalization(currentPlainText, fragmentIndex, originalFragment)) {
        finalSuggestion = capitalizeFirstLetter(suggestion);
        console.log('🔧 INDIVIDUAL APPLY - Preserving capitalization:', { 
          original: originalFragment, 
          suggestion, 
          finalSuggestion 
        });
      }

      // Apply change to HTML content while preserving formatting
      const updatedHTML = applyTextChangeToHTML(
        content,
        error.position.start,
        error.position.end,
        finalSuggestion
      );
      
      console.log('🔧 INDIVIDUAL APPLY - HTML-aware replacement result:', {
        originalHTMLLength: content.length,
        newHTMLLength: updatedHTML.length,
        replacementMade: updatedHTML !== content,
        changePreview: {
          before: originalFragment,
          after: finalSuggestion
        }
      });

      if (updatedHTML === content) {
        console.warn('🔧 INDIVIDUAL APPLY - No changes were made to the HTML content');
        dismissError(errorId);
        return;
      }

      // Update the content with formatted HTML (preserves formatting!)
      updateContent(updatedHTML);

      // Dismiss the error after successful replacement
      dismissError(errorId);

      console.log('🔧 INDIVIDUAL APPLY - Successfully applied suggestion with formatting preserved');
      
    } catch (err) {
      console.error('🔧 INDIVIDUAL APPLY - Error applying suggestion:', err);
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
      beforeText: beforeText.slice(-10),
      followsSentenceEnd
    });
    
    return followsSentenceEnd;
  };

  /**
   * Capitalize first letter of text
   */
  const capitalizeFirstLetter = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleDismissError = (errorId: string) => {
    console.log('🔧 Dismissing error:', errorId);
    dismissError(errorId);
  };

  const handleAcceptAll = (type?: 'grammar' | 'spelling' | 'style') => {
    console.log('🔧 ACCEPT ALL - Starting batch application:', { 
      type, 
      totalErrors: grammarErrors.length,
      filteredErrors: type ? grammarErrors.filter(e => e.type === type).length : grammarErrors.length
    });

    // Filter errors by type if specified
    const errorsToApply = type 
      ? grammarErrors.filter(error => error.type === type)
      : grammarErrors;

    if (errorsToApply.length === 0) {
      console.log('🔧 ACCEPT ALL - No errors to apply');
      return;
    }

    try {
      // Get plain text for position verification
      const currentPlainText = extractPlainTextFromHTML(content);
      
      // Prepare all changes for batch application
      const changes: Array<{
        plainTextStart: number;
        plainTextEnd: number;
        replacement: string;
        originalText?: string;
      }> = [];

      for (const error of errorsToApply) {
        // Skip if no suggestions available
        if (!error.suggestions || error.suggestions.length === 0) {
          console.warn('🔧 ACCEPT ALL - No suggestions for error:', error.id);
          continue;
        }

        // Use the first suggestion
        const suggestion = error.suggestions[0];

        // Extract the original fragment from error context
        const originalFragment = error.context.text.substring(
          error.context.highlightStart,
          error.context.highlightEnd
        );

        // Check if the original fragment still exists in current text
        if (!currentPlainText.includes(originalFragment)) {
          console.warn('🔧 ACCEPT ALL - Original fragment not found for error:', error.id);
          continue;
        }

        // Apply capitalization preservation if needed
        let finalSuggestion = suggestion;
        const fragmentIndex = currentPlainText.indexOf(originalFragment);
        if (shouldPreserveCapitalization(currentPlainText, fragmentIndex, originalFragment)) {
          finalSuggestion = capitalizeFirstLetter(suggestion);
          console.log('🔧 ACCEPT ALL - Preserving capitalization for error:', error.id, {
            original: originalFragment,
            suggestion,
            finalSuggestion
          });
        }

        changes.push({
          plainTextStart: error.position.start,
          plainTextEnd: error.position.end,
          replacement: finalSuggestion,
          originalText: originalFragment
        });
      }

      console.log('🔧 ACCEPT ALL - Prepared changes:', {
        totalChanges: changes.length,
        changes: changes.map(c => ({
          text: c.replacement,
          position: `${c.plainTextStart}-${c.plainTextEnd}`
        }))
      });

      if (changes.length === 0) {
        console.warn('🔧 ACCEPT ALL - No valid changes to apply');
        return;
      }

      // Apply all changes using the batch function
      const result = applyMultipleTextChangesToHTML(content, changes);
      
      console.log('🔧 ACCEPT ALL - Batch replacement result:', {
        originalHTMLLength: content.length,
        newHTMLLength: result.updatedHTML.length,
        replacementMade: result.updatedHTML !== content,
        appliedChanges: result.appliedCount,
        failedChanges: result.failedCount
      });

      if (result.updatedHTML === content) {
        console.warn('🔧 ACCEPT ALL - No changes were made to HTML content');
        return;
      }

      // Update content with all changes applied
      updateContent(result.updatedHTML);

      // Dismiss all applied errors
      errorsToApply.forEach(error => dismissError(error.id));

      console.log('🔧 ACCEPT ALL - Successfully applied all suggestions:', {
        appliedCount: result.appliedCount,
        failedCount: result.failedCount
      });

    } catch (err) {
      console.error('🔧 ACCEPT ALL - Error during batch application:', err);
      // Don't dismiss errors if batch application fails
    }
  };

  const handleApplyAISuggestion = (suggestion: WritingSuggestion | AIGrammarSuggestion) => {
    console.log('🤖 Applying AI suggestion:', suggestion);

    try {
      // Handle grammar error suggestions differently
      if ('isGrammarError' in suggestion && suggestion.isGrammarError) {
        const grammarSuggestion = suggestion as AIGrammarSuggestion;
        handleAcceptSuggestion(grammarSuggestion.originalError.id, grammarSuggestion.suggestedText);
        return;
      }

      // Handle regular AI suggestions
      const currentPlainText = extractPlainTextFromHTML(content);
      const writingSuggestion = suggestion as WritingSuggestion;
      
      // For AI suggestions, we need to find where to apply them
      // This could be at cursor position, replacing selected text, etc.
      // For now, we'll append to the end or replace if there's a clear context
      
      if (writingSuggestion.originalText) {
        // Try to find and replace the original text
        const originalIndex = currentPlainText.indexOf(writingSuggestion.originalText);
        if (originalIndex !== -1) {
          // Apply the replacement in HTML context
          const updatedHTML = applyTextChangeToHTML(
            content,
            originalIndex,
            originalIndex + writingSuggestion.originalText.length,
            writingSuggestion.suggestedText
          );
          
          updateContent(updatedHTML);
          console.log('🤖 AI suggestion applied as replacement');
          return;
        }
      }

      // If we can't do a specific replacement, append the suggestion
      // This might not be ideal for all cases, but it's a fallback
      const updatedContent = content + '\n\n' + writingSuggestion.suggestedText;
      updateContent(updatedContent);
      console.log('🤖 AI suggestion appended to content');

    } catch (err) {
      console.error('🤖 Error applying AI suggestion:', err);
    }
  };

  const handleInsertAIContent = (generatedContent: string) => {
    console.log('🤖 Inserting AI-generated content');
    
    try {
      // Convert markdown to basic HTML if needed
      const convertMarkdownToHTML = (markdownText: string): string => {
        return markdownText
          // Headers
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          
          // Bold and italic
          .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          
          // Lists
          .replace(/^\* (.*$)/gm, '<li>$1</li>')
          .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
          .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
          
          // Line breaks
          .replace(/\n\n/g, '</p><p>')
          .replace(/^(.+)$/gm, '<p>$1</p>')
          
          // Clean up empty paragraphs
          .replace(/<p><\/p>/g, '')
          .replace(/<p>(<[^>]+>)<\/p>/g, '$1');
      };

      // Process the content based on its format
      let processedContent = generatedContent;
      
      // Check if content looks like markdown
      if (generatedContent.includes('**') || generatedContent.includes('##') || generatedContent.includes('* ')) {
        processedContent = convertMarkdownToHTML(generatedContent);
        console.log('🤖 Converted markdown to HTML');
      } else {
        // Wrap plain text in paragraphs
        processedContent = generatedContent
          .split('\n\n')
          .map(paragraph => paragraph.trim())
          .filter(paragraph => paragraph)
          .map(paragraph => `<p>${paragraph}</p>`)
          .join('');
      }

      // Insert at the end of current content
      const updatedContent = content ? content + '\n\n' + processedContent : processedContent;
      updateContent(updatedContent);
      
      console.log('🤖 AI content inserted successfully');
    } catch (err) {
      console.error('🤖 Error inserting AI content:', err);
      // Fallback: insert as plain text
      const updatedContent = content + '\n\n' + generatedContent;
      updateContent(updatedContent);
    }
  };

  const handleReplaceContent = (newContent: string) => {
    console.log('🤖 Replacing entire content with corrected version');
    updateContent(newContent);
  };

  /**
   * Handle document settings save
   */
  const handleDocumentSettingsSave = async (updates: {
    title: string;
    type: DocumentType;
    description: string;
    tags: string[];
  }) => {
    await updateDocumentMetadata(updates);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 p-8 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-slate-50 rounded-lg flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Document</h2>
            <p className="text-slate-600">Preparing your writing space...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Document</h1>
            <p className="text-slate-600">{error}</p>
          </div>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-2xl">📄</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Document Not Found</h1>
            <p className="text-slate-600">
              The document you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </div>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Enhanced Header */}
      <header className="relative border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side */}
          <div className="flex items-center gap-6">
            <button
              onClick={goBack}
              className="p-3 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm group"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 group-hover:text-slate-900 transition-colors text-slate-700" />
            </button>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 truncate max-w-[300px]" title={document.title}>
                  {document.title}
                </h1>
                {isGrammarEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-700">
                    <Sparkles className="w-3 h-3" />
                    AI Enabled
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
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
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  hasUnsavedChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-sm transform hover:-translate-y-0.5'
                    : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                )}
                title="Save Document (Ctrl+S)"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>

            {/* Toggle Actions */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setShowAISuggestions(!showAISuggestions)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200 group',
                  showAISuggestions
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
                title={showAISuggestions ? 'Hide AI Assistant' : 'Show AI Assistant'}
              >
                <Bot className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  showAISuggestions ? "scale-110" : "group-hover:scale-110"
                )} />
              </button>

              <button
                onClick={() => setShowStats(!showStats)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200 group',
                  showStats
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
                title={showStats ? 'Hide Statistics' : 'Show Statistics'}
              >
                <BarChart className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  showStats ? "scale-110" : "group-hover:scale-110"
                )} />
              </button>
            </div>
            
            {/* Secondary Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowExportModal(true)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 text-slate-600 hover:text-slate-900"
                title="Export Campaign"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowDocumentSettings(true)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 text-slate-600 hover:text-slate-900"
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
        {/* Left Sidebar - Stats (10% width) */}
        {showStats && (
          <div className="w-[10%] bg-white border-r border-slate-200 shadow-sm overflow-hidden animate-slide-in-left">
            <StatsSidebar
              document={document}
              stats={stats}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              lastSaved={lastSaved}
            />
          </div>
        )}

        {/* Gap between Stats and Editor (5% width) */}
        {showStats && <div className="w-[5%]" />}

        {/* Editor (40% width when both sidebars shown, flexible when not) */}
        <main className={cn(
          "overflow-hidden relative transition-all duration-300",
          showStats && showAISuggestions ? "w-[40%]" : 
          showStats && !showAISuggestions ? "w-[85%]" :
          !showStats && showAISuggestions ? "w-[55%]" :
          "w-full"
        )}>
          <div className="h-full p-8">
            <div className="h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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

        {/* Gap between Editor and AI Assistant (5% width) */}
        {showAISuggestions && <div className="w-[5%]" />}

        {/* Right Sidebar - AI Assistant (40% width) */}
        {showAISuggestions && (
          <div className="w-[40%] bg-white border-l border-slate-200 shadow-sm overflow-hidden animate-slide-in-right">
            <UnifiedAIAssistant
              content={content}
              onApplySuggestion={handleApplyAISuggestion}
              onInsertContent={handleInsertAIContent}
              onReplaceContent={handleReplaceContent}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* Export Modal */}
      {document && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          document={document}
        />
      )}

      {/* Document Settings Modal */}
      <DocumentSettingsModal
        isOpen={showDocumentSettings}
        document={document}
        onClose={() => setShowDocumentSettings(false)}
        onSave={handleDocumentSettingsSave}
      />
    </div>
  );
};

EditorPage.displayName = 'EditorPage'; 