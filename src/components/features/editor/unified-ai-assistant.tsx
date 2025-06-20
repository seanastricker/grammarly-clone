/**
 * @fileoverview Unified AI Writing Assistant - combines grammar checking, AI suggestions, and content generation
 * @author WordWise AI Team
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useAIGrammarAnalysis } from '@/hooks/use-ai-grammar-analysis';
import { generateWritingSuggestions, generateContent, analyzeWriting, type WritingSuggestion, type ContentGenerationRequest, type WritingAnalysis } from '@/services/ai/openai-service';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { extractPlainTextFromHTML } from '@/lib/utils';
import { CampaignGeneratorWidget } from './campaign-generator-widget';
import FantasyNameGeneratorWidget from './fantasy-name-generator-widget';
import { MonsterReSkinWidget } from './monster-reskin-widget';

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
  const [activeTab, setActiveTab] = useState<'errors' | 'suggestions' | 'generate' | 'analysis' | 'campaign' | 'fantasy-names' | 'monster-reskin'>('errors');
  
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

  // AI Suggestions State
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Content Generation State
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [generationType, setGenerationType] = useState<'paragraph' | 'outline' | 'bullet_points' | 'introduction'>('paragraph');
  const [generationTone, setGenerationTone] = useState<'professional' | 'casual' | 'academic' | 'creative'>('professional');
  const [isGenerating, setIsGenerating] = useState(false);

  // Writing Analysis State
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  // Load AI suggestions
  const loadSuggestions = async () => {
    if (!user || !content.trim()) return;

    setIsLoadingSuggestions(true);
    try {
      console.log('🤖 Loading AI writing suggestions...');
      const aiSuggestions = await generateWritingSuggestions(content, user);
      setSuggestions(aiSuggestions);
      console.log('🤖 AI suggestions loaded:', aiSuggestions.length);
    } catch (error) {
      console.error('🤖 Error loading AI suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Generate content
  const handleGenerateContent = async () => {
    if (!user || !generationPrompt.trim()) return;

    setIsGenerating(true);
    try {
      console.log('🤖 Generating content...');
      const request: ContentGenerationRequest = {
        prompt: generationPrompt,
        type: generationType,
        tone: generationTone,
        length: 'medium'
      };
      
      const generatedContent = await generateContent(request, user);
      onInsertContent(generatedContent);
      setGenerationPrompt('');
      console.log('🤖 Content generated and inserted');
    } catch (error) {
      console.error('🤖 Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Analyze writing
  const handleAnalyzeWriting = async () => {
    if (!user || !content.trim()) return;

    setIsAnalyzing(true);
    try {
      console.log('🤖 Analyzing writing...');
      const result = await analyzeWriting(content, user);
      setAnalysis(result);
      console.log('🤖 Writing analysis complete');
    } catch (error) {
      console.error('🤖 Error analyzing writing:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle suggestion application
  const handleApplySuggestion = (suggestion: WritingSuggestion | AIGrammarSuggestion) => {
    if ('isGrammarError' in suggestion && suggestion.isGrammarError) {
      // This is a grammar error - dismiss it after applying
      dismissError(suggestion.originalError.id);
    }
    onApplySuggestion(suggestion);
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
      // CONSISTENT PLAIN TEXT EXTRACTION
      // Use the same method as grammar analysis to ensure consistency
      let currentPlainText = extractPlainTextFromHTML(content);

      console.log('🤖 Starting with plain text:', {
        originalLength: content.length,
        plainTextLength: currentPlainText.length,
        plainTextPreview: currentPlainText.substring(0, 100) + '...'
      });

      // Sort suggestions by position (right to left) to avoid position shifts
      const sortedSuggestions = [...grammarSuggestions]
        .filter(s => s.position && s.originalText && s.suggestedText) // Only include valid suggestions
        .sort((a, b) => (b.position?.start || 0) - (a.position?.start || 0));
      
      console.log('🤖 Sorted suggestions by position:', sortedSuggestions.map(s => ({
        id: s.id,
        position: s.position,
        originalText: s.originalText,
        suggestedText: s.suggestedText
      })));

      let appliedCount = 0;
      let failedCount = 0;

      // Apply each suggestion to the running plain text content
      for (const suggestion of sortedSuggestions) {
        console.log(`🤖 Processing suggestion ${appliedCount + failedCount + 1}/${sortedSuggestions.length}:`, {
          id: suggestion.id,
          originalText: suggestion.originalText,
          suggestedText: suggestion.suggestedText,
          position: suggestion.position
        });

        // Check if the original text still exists in the current plain text
        if (currentPlainText.includes(suggestion.originalText)) {
          // Apply the replacement
          const beforeReplacement = currentPlainText;
          currentPlainText = currentPlainText.replace(suggestion.originalText, suggestion.suggestedText);
          
          if (currentPlainText !== beforeReplacement) {
            appliedCount++;
            console.log(`🤖 ✅ Applied correction: "${suggestion.originalText}" → "${suggestion.suggestedText}"`);
          } else {
            console.warn(`🤖 ⚠️ Replacement made no changes for suggestion: ${suggestion.id}`);
            failedCount++;
          }
        } else {
          // Try alternative search methods
          const trimmedOriginal = suggestion.originalText.trim();
          if (currentPlainText.includes(trimmedOriginal)) {
            console.log(`🤖 Found text using trimmed search: ${suggestion.id}`);
            const beforeReplacement = currentPlainText;
            currentPlainText = currentPlainText.replace(trimmedOriginal, suggestion.suggestedText);
            
            if (currentPlainText !== beforeReplacement) {
              appliedCount++;
              console.log(`🤖 ✅ Applied correction using trimmed search: "${trimmedOriginal}" → "${suggestion.suggestedText}"`);
            } else {
              failedCount++;
            }
          } else {
            console.log(`🤖 ❌ Failed to find text for correction: "${suggestion.originalText}"`);
            console.log(`🤖 Current text preview:`, currentPlainText.substring(0, 200) + '...');
            failedCount++;
          }
        }
      }

      console.log(`🤖 Summary: ${appliedCount} applied, ${failedCount} failed out of ${sortedSuggestions.length} total`);

      // Update content if changes were made
      if (appliedCount > 0) {
        console.log('🤖 Content has changed, applying update');
        console.log('🤖 Final corrected content length:', currentPlainText.length);
        
        // Use the content replacement callback
        onReplaceContent?.(currentPlainText);
        
        // Dismiss all processed errors (both successful and failed)
        sortedSuggestions.forEach(suggestion => {
          dismissError(suggestion.originalError.id);
        });
        
        console.log('🤖 Successfully applied', appliedCount, 'corrections and dismissed all errors');
      } else {
        console.log('🤖 No changes applied, but clearing errors to prevent UI confusion');
        // Clear errors even if no changes were applied to prevent UI confusion
        sortedSuggestions.forEach(suggestion => {
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
              onClick={() => setActiveTab('suggestions')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Suggestions
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Analysis
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

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">AI Suggestions</h3>
                <p className="text-sm text-slate-600">Enhance your writing with AI-powered suggestions</p>
              </div>
              <Button
                size="sm"
                onClick={loadSuggestions}
                disabled={isLoadingSuggestions || !content.trim()}
              >
                {isLoadingSuggestions ? 'Loading...' : 'Get Suggestions'}
              </Button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                          {suggestion.type}
                        </span>
                        <span className="text-sm font-medium text-slate-900">{suggestion.title}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{suggestion.description}</p>
                      <p className="text-sm text-slate-500">{suggestion.reasoning}</p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {Math.round(suggestion.confidence * 100)}%
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="text-xs"
                  >
                    Apply Suggestion
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Generate Content</h3>
              <p className="text-sm text-slate-600">Create new content with AI assistance</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What would you like to generate?
                </label>
                <textarea
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  placeholder="Describe what you want to write about..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={generationType}
                    onChange={(e) => setGenerationType(e.target.value as typeof generationType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="paragraph">Paragraph</option>
                    <option value="outline">Outline</option>
                    <option value="bullet_points">Bullet Points</option>
                    <option value="introduction">Introduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
                  <select
                    value={generationTone}
                    onChange={(e) => setGenerationTone(e.target.value as typeof generationTone)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="academic">Academic</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerateContent}
                disabled={isGenerating || !generationPrompt.trim()}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </Button>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Writing Analysis</h3>
                <p className="text-sm text-slate-600">Get detailed feedback on your writing</p>
              </div>
              <Button
                size="sm"
                onClick={handleAnalyzeWriting}
                disabled={isAnalyzing || !content.trim()}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>

            {analysis && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-2xl font-bold text-green-600">{analysis.overallScore}/100</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Strengths</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Areas for Improvement</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {analysis.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">→</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Tone Analysis</h4>
                      <div className="text-sm text-slate-600">
                        <p><strong>Detected:</strong> {analysis.toneAnalysis.detected}</p>
                        <p><strong>Consistency:</strong> {Math.round(analysis.toneAnalysis.consistency * 100)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
      </div>
    </div>
  );
} 