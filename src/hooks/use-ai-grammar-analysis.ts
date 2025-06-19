/**
 * @fileoverview Hook for AI-powered grammar analysis using GPT-4
 * @author WordWise AI Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeTextWithAI, type AIGrammarError, type AIGrammarStatistics } from '@/services/ai/grammar-ai-service';
import { useAuth } from '@/hooks/use-auth';

interface AIGrammarAnalysisState {
  errors: AIGrammarError[];
  isAnalyzing: boolean;
  lastAnalyzed: Date | null;
  error: string | null;
  statistics: AIGrammarStatistics | null;
}

interface UseAIGrammarAnalysisOptions {
  debounceMs?: number;
  language?: string;
  enabled?: boolean;
  minLength?: number;
  enableGrammar?: boolean;
  enableSpelling?: boolean;
  enableStyle?: boolean;
}

export const useAIGrammarAnalysis = (options: UseAIGrammarAnalysisOptions = {}) => {
  const {
    debounceMs = 1000,
    language = 'en-US',
    enabled = true,
    minLength = 10,
    enableGrammar = true,
    enableSpelling = true,
    enableStyle = true
  } = options;

  const { user } = useAuth();

  const [state, setState] = useState<AIGrammarAnalysisState>({
    errors: [],
    isAnalyzing: false,
    lastAnalyzed: null,
    error: null,
    statistics: null
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastTextRef = useRef<string>('');
  const analysisCountRef = useRef<number>(0);
  // Track dismissed errors to prevent re-detection
  const dismissedErrorsRef = useRef<Set<string>>(new Set());

  /**
   * Generate a unique key for an error based on its content and position
   */
  const generateErrorKey = (error: AIGrammarError, text: string): string => {
    const contextStart = Math.max(0, error.position.start - 10);
    const contextEnd = Math.min(text.length, error.position.end + 10);
    const context = text.substring(contextStart, contextEnd);
    const errorLength = error.position.end - error.position.start;
    const key = `${error.type}-${error.position.start}-${errorLength}-${context}`;
    
    console.log(`🤖 Generated AI error key for ${error.id}:`, {
      errorId: error.id,
      errorType: error.type,
      position: error.position,
      errorText: text.substring(error.position.start, error.position.end),
      context,
      generatedKey: key
    });
    
    return key;
  };

  /**
   * Check if text has changed significantly
   */
  const hasSignificantTextChange = (oldText: string, newText: string): boolean => {
    const lengthDiff = Math.abs(oldText.length - newText.length);
    const lengthThreshold = Math.max(oldText.length, newText.length) * 0.2;
    
    if (lengthDiff > lengthThreshold) {
      return true;
    }

    const maxLength = Math.max(oldText.length, newText.length);
    if (maxLength === 0) return false;
    
    let differences = 0;
    for (let i = 0; i < maxLength; i++) {
      if (oldText[i] !== newText[i]) {
        differences++;
      }
    }
    
    return (differences / maxLength) > 0.3;
  };

  /**
   * Extract plain text from HTML content
   */
  const extractTextFromHTML = (html: string): string => {
    if (!html) return '';
    
    // Remove HTML tags and decode entities
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    return text;
  };

  /**
   * Analyze text using AI grammar service
   */
  const analyzeText = useCallback(async (text: string) => {
    if (!enabled || !user || text.length < minLength) {
      setState(prev => ({
        ...prev,
        errors: [],
        statistics: null,
        error: null,
        isAnalyzing: false
      }));
      return;
    }

    // Check if this is a significant text change
    const previousText = lastTextRef.current;
    if (hasSignificantTextChange(previousText, text)) {
      console.log('🤖 Significant text change detected, resetting dismissed errors');
      dismissedErrorsRef.current.clear();
    }

    // Skip analysis if text hasn't changed
    if (text === lastTextRef.current) {
      return;
    }

    lastTextRef.current = text;
    const currentAnalysisId = ++analysisCountRef.current;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      console.log('🤖 Starting AI grammar analysis...');
      const result = await analyzeTextWithAI(text, user, {
        enableGrammar,
        enableSpelling,
        enableStyle,
        language
      });
      
      // Filter out dismissed errors
      const filteredErrors = result.errors.filter(error => {
        const errorKey = generateErrorKey(error, text);
        const isDismissed = dismissedErrorsRef.current.has(errorKey);
        
        console.log(`🤖 Checking AI error: ${error.id} (${error.type})`, {
          errorKey,
          isDismissed,
          position: error.position,
          text: text.substring(error.position.start, error.position.end),
          allDismissedKeys: Array.from(dismissedErrorsRef.current)
        });
        
        if (isDismissed) {
          console.log('🤖 Filtering out dismissed AI error:', errorKey);
        }
        return !isDismissed;
      });

      console.log(`🤖 AI analysis complete: ${result.errors.length} total errors, ${filteredErrors.length} after filtering dismissed`);
      
      // Check if this is still the latest analysis
      if (currentAnalysisId === analysisCountRef.current) {
        setState(prev => ({
          ...prev,
          errors: filteredErrors,
          statistics: result.statistics,
          isAnalyzing: false,
          lastAnalyzed: new Date(),
          error: null
        }));
      }
    } catch (error) {
      console.error('🤖 AI grammar analysis error:', error);
      if (currentAnalysisId === analysisCountRef.current) {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: error instanceof Error ? error.message : 'AI analysis failed',
          errors: [],
          statistics: null
        }));
      }
    }
  }, [enabled, user, language, minLength, enableGrammar, enableSpelling, enableStyle]);

  /**
   * Debounced analysis function
   */
  const debouncedAnalyze = useCallback((content: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Extract plain text from HTML content
      const plainText = extractTextFromHTML(content);
      console.log('🤖 AI grammar analysis triggered for:', plainText.substring(0, 50) + '...');
      analyzeText(plainText);
    }, debounceMs);
  }, [analyzeText, debounceMs]);

  /**
   * Manual analysis trigger
   */
  const manualAnalyze = useCallback((content: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const plainText = extractTextFromHTML(content);
    console.log('🤖 Manual AI grammar analysis triggered');
    analyzeText(plainText);
  }, [analyzeText]);

  /**
   * Dismiss a specific error
   */
  const dismissError = useCallback((errorId: string) => {
    setState(prev => {
      const errorToDismiss = prev.errors.find(e => e.id === errorId);
      if (!errorToDismiss) {
        console.warn('🤖 Cannot dismiss AI error - not found:', errorId);
        return prev;
      }

      // Generate key for the dismissed error
      const errorKey = generateErrorKey(errorToDismiss, lastTextRef.current);
      dismissedErrorsRef.current.add(errorKey);
      
      console.log('🤖 Dismissed AI error:', {
        errorId,
        errorKey,
        errorType: errorToDismiss.type,
        position: errorToDismiss.position,
        totalDismissed: dismissedErrorsRef.current.size
      });

      // Remove from current errors
      const updatedErrors = prev.errors.filter(e => e.id !== errorId);
      
      // Update statistics
      const updatedStatistics = prev.statistics ? {
        ...prev.statistics,
        issueCount: {
          grammar: updatedErrors.filter(e => e.type === 'grammar').length,
          spelling: updatedErrors.filter(e => e.type === 'spelling').length,
          style: updatedErrors.filter(e => e.type === 'style').length,
        }
      } : null;

      return {
        ...prev,
        errors: updatedErrors,
        statistics: updatedStatistics
      };
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    console.log('🤖 Clearing all AI grammar errors');
    setState(prev => ({
      ...prev,
      errors: [],
      statistics: prev.statistics ? {
        ...prev.statistics,
        issueCount: { grammar: 0, spelling: 0, style: 0 }
      } : null
    }));
    dismissedErrorsRef.current.clear();
  }, []);

  /**
   * Clear dismissed errors (useful for testing)
   */
  const clearDismissedErrors = useCallback(() => {
    console.log('🤖 Clearing dismissed AI error cache');
    dismissedErrorsRef.current.clear();
  }, []);

  // Auto-analyze content when it changes
  const analyzeContent = useCallback((content: string) => {
    debouncedAnalyze(content);
  }, [debouncedAnalyze]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    errors: state.errors,
    statistics: state.statistics,
    isAnalyzing: state.isAnalyzing,
    error: state.error,
    lastAnalyzed: state.lastAnalyzed,
    
    // Actions
    analyzeContent,
    manualAnalyze,
    dismissError,
    clearErrors,
    clearDismissedErrors,
    
    // Debug info
    dismissedCount: dismissedErrorsRef.current.size
  };
}; 