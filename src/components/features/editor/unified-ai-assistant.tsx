/**
 * @fileoverview Unified AI Writing Assistant - combines grammar checking, AI suggestions, and content generation
 * @author WordWise AI Team
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useAIGrammarAnalysis } from '@/hooks/use-ai-grammar-analysis';
import { type WritingSuggestion } from '@/services/ai/openai-service';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { extractPlainTextFromHTML, applyMultipleTextChangesToHTML } from '@/lib/utils';
import { CampaignGeneratorWidget } from './campaign-generator-widget';
import FantasyNameGeneratorWidget from './fantasy-name-generator-widget';
import { MonsterReSkinWidget } from './monster-reskin-widget';
import CharacterBackgroundGeneratorWidget from './character-background-generator-widget';
import { BalanceAnalysisWidget } from './balance-analysis-widget';

interface UnifiedAIAssistantProps {
  content: string;
  onApplySuggestion: (suggestion: WritingSuggestion | AIGrammarSuggestion) => void;
  onInsertContent: (content: string) => void;
  onReplaceContent?: (content: string) => void;
  className?: string;
}

// Adapter to make AIGrammarError compatible with WritingSuggestion
interface AIGrammarSuggestion extends WritingSuggestion {
  isGrammarError: true;
  originalError: import('@/services/ai/grammar-ai-service').AIGrammarError;
}

export function UnifiedAIAssistant({
  content,
  onApplySuggestion,
  onInsertContent,
  onReplaceContent,
  className = ''
}: UnifiedAIAssistantProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'errors' | 'campaign' | 'fantasy-names' | 'monster-reskin' | 'backgrounds' | 'analyze-campaign'>('errors');
  
  // AI Grammar Analysis
  const {
    errors: grammarErrors,
    statistics: grammarStats,
    isAnalyzing: isAnalyzingGrammar,
    dismissError,
    analyzeContent: analyzeGrammar,
    manualAnalyze: manualAnalyzeGrammar
  } = useAIGrammarAnalysis({
    enabled: true,
    debounceMs: 1500,
    minLength: 10
  });



  // Auto-analyze grammar when content changes
  useEffect(() => {
    if (content.trim().length > 0) {
      analyzeGrammar(content);
    }
  }, [content, analyzeGrammar]);

  // Convert grammar errors to suggestions format
  const grammarSuggestions: AIGrammarSuggestion[] = useMemo(() => {
    // Extract plain text from HTML content for accurate position mapping
    const plainText = extractPlainTextFromHTML(content);

    console.log('🤖 Converting grammar errors to suggestions:', {
      errorCount: grammarErrors.length,
      htmlContentLength: content.length,
      plainTextLength: plainText.length,
      plainTextPreview: plainText.substring(0, 100) + '...'
    });

    return grammarErrors.map(error => {
      // Extract the original text using plain text positions
      const originalText = plainText.substring(error.position.start, error.position.end);
      
      console.log('🤖 Processing grammar error:', {
        errorId: error.id,
        errorType: error.type,
        position: error.position,
        originalText,
        suggestion: error.suggestions[0],
        contextText: error.context.text
      });

      return {
        id: error.id,
        type: error.type as WritingSuggestion['type'],
        title: error.shortMessage,
        description: error.message,
        originalText,
        suggestedText: error.suggestions[0] || '',
        confidence: error.confidence,
        reasoning: error.rule?.description || 'AI-detected issue',
        position: error.position,
        category: 'grammar' as const,
        isGrammarError: true as const,
        originalError: error
      };
    });
  }, [grammarErrors, content]);



  // Handle suggestion application
  const handleApplySuggestion = (suggestion: WritingSuggestion | AIGrammarSuggestion) => {
    console.log('🤖 Applying individual suggestion:', suggestion.id);
    
    if ('isGrammarError' in suggestion && suggestion.isGrammarError) {
      // This is a grammar error - apply using HTML-aware method to preserve formatting
      try {
        const originalError = suggestion.originalError;
        const currentPlainText = extractPlainTextFromHTML(content);
        
        // Extract the original fragment from the error context
        const originalFragment = originalError.context.text.substring(
          originalError.context.highlightStart,
          originalError.context.highlightEnd
        );

        // Check if the original text still exists
        if (currentPlainText.includes(originalFragment)) {
          // Apply change to HTML content while preserving formatting
          const changes = [{
            plainTextStart: originalError.position.start,
            plainTextEnd: originalError.position.end,
            replacement: suggestion.suggestedText,
            originalText: originalFragment
          }];

          const result = applyMultipleTextChangesToHTML(content, changes);

          if (result.appliedCount > 0) {
            // Use the callback to update content with preserved formatting
            onReplaceContent?.(result.updatedHTML);
            console.log('🤖 Applied individual suggestion with formatting preserved');
          } else {
            console.warn('🤖 Individual suggestion application failed');
          }
        } else {
          console.warn('🤖 Original text not found for individual suggestion');
        }

        // Dismiss the error after applying (or attempting to apply)
        dismissError(suggestion.originalError.id);
      } catch (error) {
        console.error('🤖 Error applying individual suggestion:', error);
        // Fallback to the original method
        onApplySuggestion(suggestion);
        dismissError(suggestion.originalError.id);
      }
    } else {
      // Regular suggestion - use the provided callback
      onApplySuggestion(suggestion);
    }
  };

  // Handle grammar error dismissal
  const handleDismissGrammarError = (errorId: string) => {
    dismissError(errorId);
  };

  // Handle accept all errors
  const handleAcceptAllErrors = () => {
    console.log('🤖 Applying all grammar suggestions:', grammarSuggestions.length);
    
    if (grammarSuggestions.length === 0) {
      console.log('🤖 No suggestions to apply');
      return;
    }

    try {
      // Get plain text for verification but work with HTML for actual changes
      const currentPlainText = extractPlainTextFromHTML(content);

      console.log('🤖 Starting with content:', {
        originalHTMLLength: content.length,
        plainTextLength: currentPlainText.length,
        suggestionsToProcess: grammarSuggestions.length
      });

      // Prepare changes for batch application to HTML
      const changes = grammarSuggestions
        .filter(suggestion => {
          // Verify the original text still exists
          const originalExists = currentPlainText.includes(suggestion.originalText);
          if (!originalExists) {
            console.warn('🤖 Original text not found for suggestion:', suggestion.id, suggestion.originalText);
          }
          return originalExists && suggestion.position && suggestion.originalText && suggestion.suggestedText;
        })
        .map(suggestion => ({
          plainTextStart: suggestion.position!.start,
          plainTextEnd: suggestion.position!.end,
          replacement: suggestion.suggestedText,
          originalText: suggestion.originalText,
          suggestionId: suggestion.id
        }));

      console.log('🤖 Prepared changes:', changes.length);

      // Apply all changes to HTML while preserving formatting
      const result = applyMultipleTextChangesToHTML(content, changes);
      
      console.log('🤖 Bulk application result:', {
        appliedCount: result.appliedCount,
        failedCount: result.failedCount,
        totalAttempted: changes.length,
        contentChanged: result.updatedHTML !== content
      });

      // Update content if changes were made
      if (result.appliedCount > 0) {
        console.log('🤖 Content has changed, applying update with formatting preserved');
        
        // Use the content replacement callback with HTML that preserves formatting
        onReplaceContent?.(result.updatedHTML);
        
        // Dismiss all processed errors (both successful and failed)
        grammarSuggestions.forEach(suggestion => {
          dismissError(suggestion.originalError.id);
        });
        
        console.log('🤖 Successfully applied', result.appliedCount, 'corrections with formatting preserved');
      } else {
        console.log('🤖 No changes applied, but clearing errors to prevent UI confusion');
        // Clear errors even if no changes were applied to prevent UI confusion
        grammarSuggestions.forEach(suggestion => {
          dismissError(suggestion.originalError.id);
        });
      }
    } catch (err) {
      console.error('🤖 Error during bulk application:', err);
      // Clear errors to prevent UI confusion even if there was an error
      grammarSuggestions.forEach(suggestion => {
        dismissError(suggestion.originalError.id);
      });
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2 p-4">
          <span className="text-2xl">🤖</span>
          <h2 className="font-semibold text-slate-900">AI Writing Assistant</h2>
        </div>
        
        <div className="px-4">
          <div className="flex space-x-1 border-b border-slate-100">
            <button
              onClick={() => setActiveTab('errors')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'errors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Errors ({grammarErrors.length})
            </button>

            <button
              onClick={() => setActiveTab('campaign')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'campaign'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Campaign
            </button>
            <button
              onClick={() => setActiveTab('fantasy-names')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'fantasy-names'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Names
            </button>
            <button
              onClick={() => setActiveTab('monster-reskin')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'monster-reskin'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Monsters
            </button>
            <button
              onClick={() => setActiveTab('backgrounds')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'backgrounds'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Backgrounds
            </button>
            <button
              onClick={() => setActiveTab('analyze-campaign')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analyze-campaign'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Analyze Campaign
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {/* Errors Tab */}
        {activeTab === 'errors' && (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Grammar, Spelling, & Style</h3>
                <p className="text-sm text-slate-600">
                  {grammarErrors.length === 0 ? 'No issues found' : `${grammarErrors.length} issues detected`}
                </p>
              </div>
              {isAnalyzingGrammar && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  Analyzing...
                </div>
              )}
            </div>

            {grammarStats && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Quality Score</span>
                  <span className="text-lg font-bold text-green-600">{grammarStats.qualityScore}/100</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{grammarStats.issueCount.grammar}</div>
                    <div className="text-slate-600">Grammar</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">{grammarStats.issueCount.spelling}</div>
                    <div className="text-slate-600">Spelling</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{grammarStats.issueCount.style}</div>
                    <div className="text-slate-600">Style</div>
                  </div>
                </div>
              </div>
            )}

            {grammarErrors.length > 0 && (
              <Button
                onClick={handleAcceptAllErrors}
                className="w-full"
              >
                Accept All
              </Button>
            )}

            <div className="space-y-3 flex-1 overflow-y-auto">
              {grammarSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          suggestion.type === 'grammar' ? 'bg-red-100 text-red-700' :
                          suggestion.type === 'spelling' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {suggestion.type}
                        </span>
                        <span className="text-sm font-medium text-slate-900">{suggestion.title}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{suggestion.description}</p>
                      {suggestion.originalText && (
                        <div className="text-sm">
                          <span className="text-slate-500">Change </span>
                          <span className="bg-red-100 text-red-800 px-1 rounded">{suggestion.originalText}</span>
                          <span className="text-slate-500"> to </span>
                          <span className="bg-green-100 text-green-800 px-1 rounded">{suggestion.suggestedText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="text-xs"
                    >
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDismissGrammarError(suggestion.originalError.id)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}







        {/* Campaign Generator Tab */}
        {activeTab === 'campaign' && (
          <CampaignGeneratorWidget
            onCampaignGenerated={onInsertContent}
            className="h-full"
          />
        )}

        {/* Fantasy Name Generator Tab */}
        {activeTab === 'fantasy-names' && (
          <FantasyNameGeneratorWidget
            onInsert={onInsertContent}
          />
        )}

        {/* Monster Re-skin Tab */}
        {activeTab === 'monster-reskin' && (
          <MonsterReSkinWidget
            onInsertContent={onInsertContent}
            onClose={() => setActiveTab('errors')}
          />
        )}

        {/* Character Background Generator Tab */}
        {activeTab === 'backgrounds' && (
          <CharacterBackgroundGeneratorWidget
            onInsert={onInsertContent}
          />
        )}

        {/* Campaign Balance Analysis Tab */}
        {activeTab === 'analyze-campaign' && (
          <BalanceAnalysisWidget
            content={content}
            onInsertContent={onInsertContent}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
} 