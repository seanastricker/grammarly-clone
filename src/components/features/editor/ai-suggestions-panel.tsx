/**
 * @fileoverview AI Suggestions Panel Component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Advanced AI-powered suggestions panel that provides context-aware writing improvements,
 * content generation, and personalized assistance based on user profile.
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  TrendingUp, 
  Lightbulb, 
  ChevronRight, 
  Check, 
  X, 
  RefreshCw,
  FileText,
  MessageSquare,
  Zap,
  Target,
  FileCheck,
  CheckCircle,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { 
  generateWritingSuggestions, 
  generateContent,
  analyzeWriting,
  type WritingSuggestion,
  type ContentGenerationRequest,
  type WritingAnalysis
} from '@/services/ai/openai-service';

interface AISuggestionsPanelProps {
  content: string;
  onApplySuggestion: (suggestion: WritingSuggestion) => void;
  onInsertContent: (content: string) => void;
  isVisible: boolean;
}

type TabType = 'suggestions' | 'generate' | 'analyze';

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  content,
  onApplySuggestion,
  onInsertContent,
  isVisible
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('suggestions');
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contentRequest, setContentRequest] = useState<ContentGenerationRequest>({
    prompt: '',
    type: 'paragraph',
    tone: 'professional',
    length: 'medium'
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');

  /**
   * Generate AI suggestions when content changes
   */
  useEffect(() => {
    if (content.trim() && user && activeTab === 'suggestions') {
      generateSuggestions();
    }
  }, [content, user, activeTab]);

  /**
   * Generate writing analysis when content changes
   */
  useEffect(() => {
    if (content.trim() && user && activeTab === 'analyze') {
      analyzeContent();
    }
  }, [content, user, activeTab]);

  /**
   * Generate AI writing suggestions
   */
  const generateSuggestions = async () => {
    if (!user || !content.trim()) return;

    setIsLoading(true);
    try {
      const newSuggestions = await generateWritingSuggestions(content, user, 'document');
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Analyze writing quality
   */
  const analyzeContent = async () => {
    if (!user || !content.trim()) return;

    setIsLoading(true);
    try {
      const newAnalysis = await analyzeWriting(content, user);
      setAnalysis(newAnalysis);
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate new content based on user prompt
   */
  const handleGenerateContent = async () => {
    if (!user || !contentRequest.prompt.trim()) return;

    setIsLoading(true);
    try {
      const content = await generateContent(contentRequest, user);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply suggestion to editor
   */
  const handleApplySuggestion = (suggestion: WritingSuggestion) => {
    onApplySuggestion(suggestion);
    // Remove the applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  /**
   * Insert generated content into editor
   */
  const handleInsertContent = () => {
    if (generatedContent) {
      onInsertContent(generatedContent);
      setGeneratedContent('');
      setContentRequest(prev => ({ ...prev, prompt: '' }));
    }
  };

  /**
   * Get confidence color based on score
   */
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  /**
   * Get suggestion type icon
   */
  const getSuggestionIcon = (type: WritingSuggestion['type']) => {
    const icons = {
      improvement: TrendingUp,
      alternative: RefreshCw,
      expansion: FileText,
      tone: MessageSquare,
      clarity: Lightbulb,
      grammar: FileCheck,
      spelling: CheckCircle,
      style: Palette
    };
    const Icon = icons[type];
    return <Icon className="w-4 h-4" />;
  };

  if (!isVisible) return null;

  const tabs = [
    { id: 'suggestions', label: 'AI Suggestions', icon: Sparkles },
    { id: 'generate', label: 'Generate', icon: Wand2 },
    { id: 'analyze', label: 'Analysis', icon: Target }
  ];

  return (
    <div className="w-80 bg-white border-l border-slate-200 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-slate-900">AI Assistant</h2>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600">Analyzing...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">Writing Suggestions</h3>
                  <Button
                    onClick={generateSuggestions}
                    variant="ghost"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="border border-slate-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSuggestionIcon(suggestion.type)}
                        <h4 className="font-medium text-slate-900 text-sm">
                          {suggestion.title}
                        </h4>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      {suggestion.description}
                    </p>

                    {suggestion.suggestedText && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-900">
                          {suggestion.suggestedText}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-slate-500">
                      {suggestion.reasoning}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApplySuggestion(suggestion)}
                        size="sm"
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Apply
                      </Button>
                      <Button
                        onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Start writing to get AI suggestions</p>
              </div>
            )}
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-slate-900">Generate Content</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  What would you like to write about?
                </label>
                <textarea
                  value={contentRequest.prompt}
                  onChange={(e) => setContentRequest(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Describe what you need help writing..."
                  className="w-full p-3 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={contentRequest.type}
                    onChange={(e) => setContentRequest(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="paragraph">Paragraph</option>
                    <option value="outline">Outline</option>
                    <option value="bullet_points">Bullet Points</option>
                    <option value="introduction">Introduction</option>
                    <option value="conclusion">Conclusion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tone
                  </label>
                  <select
                    value={contentRequest.tone}
                    onChange={(e) => setContentRequest(prev => ({ ...prev, tone: e.target.value as any }))}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="academic">Academic</option>
                    <option value="creative">Creative</option>
                    <option value="persuasive">Persuasive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Length
                </label>
                <div className="flex space-x-2">
                  {(['short', 'medium', 'long'] as const).map((length) => (
                    <button
                      key={length}
                      onClick={() => setContentRequest(prev => ({ ...prev, length }))}
                      className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                        contentRequest.length === length
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {length.charAt(0).toUpperCase() + length.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateContent}
                disabled={!contentRequest.prompt.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>

            {generatedContent && (
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-slate-900">Generated Content</h4>
                <div className="bg-slate-50 p-3 rounded-md">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {generatedContent}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleInsertContent} size="sm" className="flex-1">
                    <Zap className="w-4 h-4 mr-1" />
                    Insert
                  </Button>
                  <Button
                    onClick={() => setGeneratedContent('')}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analyze' && (
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600">Analyzing...</span>
              </div>
            ) : analysis ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">Writing Analysis</h3>
                  <Button
                    onClick={analyzeContent}
                    variant="ghost"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Overall Score */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Overall Quality</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round(analysis.overallScore)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analysis.overallScore}%` }}
                    />
                  </div>
                </div>

                {/* Readability */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Readability</span>
                    <span className="text-lg font-semibold text-green-600">
                      {analysis.readabilityScore}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${analysis.readabilityScore}%` }}
                    />
                  </div>
                </div>

                {/* Strengths */}
                {analysis.strengths.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {analysis.improvements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      Suggestions for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {analysis.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tone Analysis */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-slate-900">Tone Analysis</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Detected Tone:</span>
                    <span className="text-sm font-medium text-slate-900 capitalize">
                      {analysis.toneAnalysis.detected}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Consistency:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {Math.round(analysis.toneAnalysis.consistency * 100)}%
                    </span>
                  </div>
                  {analysis.toneAnalysis.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-slate-700">Suggestions:</span>
                      {analysis.toneAnalysis.suggestions.map((suggestion, index) => (
                        <p key={index} className="text-sm text-slate-600">
                          {suggestion}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Start writing to get detailed analysis</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 