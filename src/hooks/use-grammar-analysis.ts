/**
 * @fileoverview Hook for real-time grammar analysis
 * @author WordWise AI Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { checkGrammarAndSpelling, extractTextFromHTML, type AnalyzedError, type GrammarAnalysisResult } from '@/services/ai/language-tool';

interface GrammarAnalysisState {
  errors: AnalyzedError[];
  isAnalyzing: boolean;
  lastAnalyzed: Date | null;
  error: string | null;
  statistics: {
    totalErrors: number;
    grammarErrors: number;
    spellingErrors: number;
    styleIssues: number;
    qualityScore: number;
  } | null;
}

interface UseGrammarAnalysisOptions {
  debounceMs?: number;
  language?: string;
  enabled?: boolean;
  minLength?: number;
}

export const useGrammarAnalysis = (options: UseGrammarAnalysisOptions = {}) => {
  const {
    debounceMs = 1000,
    language = 'en-US',
    enabled = true,
    minLength = 10
  } = options;

  const [state, setState] = useState<GrammarAnalysisState>({
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
   * This helps identify the same error across multiple analyses
   */
  const generateErrorKey = (error: AnalyzedError, text: string): string => {
    const contextStart = Math.max(0, error.position.start - 10);
    const contextEnd = Math.min(text.length, error.position.end + 10);
    const context = text.substring(contextStart, contextEnd);
    const errorLength = error.position.end - error.position.start;
    const key = `${error.type}-${error.position.start}-${errorLength}-${context}`;
    
    console.log(`🔧 Generated error key for ${error.id}:`, {
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
   * Check if text has changed significantly (more than just minor edits)
   * If so, we should reset dismissed errors
   */
  const hasSignificantTextChange = (oldText: string, newText: string): boolean => {
    // If length difference is more than 20%, consider it significant
    const lengthDiff = Math.abs(oldText.length - newText.length);
    const lengthThreshold = Math.max(oldText.length, newText.length) * 0.2;
    
    if (lengthDiff > lengthThreshold) {
      return true;
    }

    // If more than 30% of characters are different, consider it significant
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
   * Analyze text for grammar and spelling errors
   */
  const analyzeText = useCallback(async (text: string) => {
    if (!enabled || text.length < minLength) {
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
      console.log('🔧 Significant text change detected, resetting dismissed errors');
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
      const result: GrammarAnalysisResult = await checkGrammarAndSpelling(text, language);
      
      // Filter out dismissed errors
      const filteredErrors = result.errors.filter(error => {
        const errorKey = generateErrorKey(error, text);
        const isDismissed = dismissedErrorsRef.current.has(errorKey);
        
        console.log(`🔧 Checking error: ${error.id} (${error.type})`, {
          errorKey,
          isDismissed,
          position: error.position,
          text: text.substring(error.position.start, error.position.end),
          allDismissedKeys: Array.from(dismissedErrorsRef.current)
        });
        
        if (isDismissed) {
          console.log('🔧 Filtering out dismissed error:', errorKey);
        }
        return !isDismissed;
      });

      console.log(`🔧 Analysis complete: ${result.errors.length} total errors, ${filteredErrors.length} after filtering dismissed`);
      
      // Check if this is still the latest analysis
      if (currentAnalysisId === analysisCountRef.current) {
        setState(prev => ({
          ...prev,
          errors: filteredErrors,
          statistics: {
            ...result.statistics,
            totalErrors: filteredErrors.length,
            grammarErrors: filteredErrors.filter(e => e.type === 'grammar').length,
            spellingErrors: filteredErrors.filter(e => e.type === 'spelling').length,
            styleIssues: filteredErrors.filter(e => e.type === 'style').length,
          },
          isAnalyzing: false,
          lastAnalyzed: new Date(),
          error: null
        }));
      }
    } catch (error) {
      if (currentAnalysisId === analysisCountRef.current) {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: error instanceof Error ? error.message : 'Analysis failed',
          errors: [],
          statistics: null
        }));
      }
    }
  }, [enabled, language, minLength]);

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
      console.log('🔧 Grammar analysis triggered for:', plainText.substring(0, 50) + '...');
      analyzeText(plainText);
    }, debounceMs);
  }, [analyzeText, debounceMs]);

  /**
   * Manually trigger analysis
   */
  const manualAnalyze = useCallback((content: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const plainText = extractTextFromHTML(content);
    analyzeText(plainText);
  }, [analyzeText]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: [],
      statistics: null,
      error: null
    }));
    lastTextRef.current = '';
    dismissedErrorsRef.current.clear();
  }, []);

  /**
   * Dismiss a specific error
   */
  const dismissError = useCallback((errorId: string) => {
    console.log('🔧 Dismissing error in hook:', errorId);
    
    // Find the error to get its details for generating the key
    const errorToDismiss = state.errors.find(error => error.id === errorId);
    if (errorToDismiss && lastTextRef.current) {
      const errorKey = generateErrorKey(errorToDismiss, lastTextRef.current);
      dismissedErrorsRef.current.add(errorKey);
      console.log('🔧 Added to dismissed errors:', errorKey);
      console.log('🔧 Total dismissed errors:', dismissedErrorsRef.current.size);
    }

    setState(prev => ({
      ...prev,
      errors: prev.errors.filter(error => error.id !== errorId)
    }));
  }, [state.errors]);

  /**
   * Get errors by type
   */
  const getErrorsByType = useCallback((type: 'grammar' | 'spelling' | 'style') => {
    return state.errors.filter(error => error.type === type);
  }, [state.errors]);

  /**
   * Get errors by severity
   */
  const getErrorsBySeverity = useCallback((severity: 'error' | 'warning' | 'suggestion') => {
    return state.errors.filter(error => error.severity === severity);
  }, [state.errors]);

  // Clear errors when analysis is disabled
  useEffect(() => {
    if (!enabled) {
      console.log('🔧 Clearing grammar analysis - disabled');
      setState(prev => ({
        ...prev,
        errors: [],
        statistics: null,
        error: null,
        isAnalyzing: false
      }));
      lastTextRef.current = '';
      dismissedErrorsRef.current.clear();
    }
  }, [enabled]);

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
    ...state,
    
    // Actions
    analyzeContent: debouncedAnalyze,
    manualAnalyze,
    clearErrors,
    dismissError,
    
    // Computed values
    hasErrors: state.errors.length > 0,
    grammarErrors: getErrorsByType('grammar'),
    spellingErrors: getErrorsByType('spelling'),
    styleIssues: getErrorsByType('style'),
    criticalErrors: getErrorsBySeverity('error'),
    
    // Utils
    getErrorsByType,
    getErrorsBySeverity
  };
}; 