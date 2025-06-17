/**
 * @fileoverview Document editor hook
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Custom hook for managing document editor state and operations.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './use-auth';
import type { Document } from '@/types/document';
import * as documentService from '@/services/documents';

interface DocumentEditorState {
  document: Document | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

interface DocumentStats {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  paragraphCount: number;
  readingTime: number; // minutes
}

export const useDocumentEditor = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [state, setState] = useState<DocumentEditorState>({
    document: null,
    isLoading: true,
    isSaving: false,
    error: null,
    hasUnsavedChanges: false,
    lastSaved: null
  });

  const [content, setContent] = useState('');
  const [stats, setStats] = useState<DocumentStats>({
    wordCount: 0,
    characterCount: 0,
    characterCountNoSpaces: 0,
    paragraphCount: 0,
    readingTime: 0
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastContentRef = useRef('');

  /**
   * Calculate document statistics
   */
  const calculateStats = useCallback((htmlContent: string): DocumentStats => {
    // Strip HTML tags for accurate counting
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    const words = textContent ? textContent.split(/\s+/).filter(word => word.length > 0) : [];
    const wordCount = words.length;
    const characterCount = textContent.length;
    const characterCountNoSpaces = textContent.replace(/\s/g, '').length;
    
    // Count paragraphs by HTML p tags or double line breaks
    const paragraphCount = Math.max(
      1,
      (htmlContent.match(/<p[^>]*>/g) || []).length,
      (htmlContent.match(/\n\s*\n/g) || []).length + 1
    );

    // Estimate reading time (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    return {
      wordCount,
      characterCount,
      characterCountNoSpaces,
      paragraphCount,
      readingTime
    };
  }, []);

  /**
   * Load document by ID
   */
  const loadDocument = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Check if we have required data
    if (!documentId) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'No document ID provided' 
      }));
      return;
    }

    if (!user) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'User not authenticated' 
      }));
      return;
    }

    try {
      const document = await documentService.getDocument(documentId, user.id);
      
      if (!document) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: 'Document not found' 
        }));
        return;
      }

      setContent(document.content || '');
      lastContentRef.current = document.content || '';
      setStats(calculateStats(document.content || ''));

      setState(prev => ({
        ...prev,
        document,
        isLoading: false,
        hasUnsavedChanges: false,
        lastSaved: new Date(document.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading document:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load document: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  }, [documentId, user, calculateStats]);

  /**
   * Save document content
   */
  const saveDocument = useCallback(async (newContent?: string) => {
    if (!state.document || !user) return;

    const contentToSave = newContent ?? content;
    
    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const newStats = calculateStats(contentToSave);
      
      await documentService.updateDocument(state.document.id, user.id, {
        content: contentToSave,
        stats: {
          wordCount: newStats.wordCount,
          characterCount: newStats.characterCount,
          readingTime: newStats.readingTime
        }
      });

      lastContentRef.current = contentToSave;
      setStats(newStats);

      setState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        document: prev.document ? {
          ...prev.document,
          content: contentToSave,
          stats: {
            ...prev.document.stats,
            wordCount: newStats.wordCount,
            characterCount: newStats.characterCount,
            readingTime: newStats.readingTime
          }
        } : null
      }));

    } catch (error) {
      console.error('Error saving document:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: 'Failed to save document'
      }));
    }
  }, [state.document, user, content, calculateStats]);

  /**
   * Update content and trigger auto-save
   */
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    setStats(calculateStats(newContent));

    const hasChanges = newContent !== lastContentRef.current;
    setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));

    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (hasChanges) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveDocument(newContent);
      }, 2000);
    }
  }, [calculateStats, saveDocument]);

  /**
   * Manual save
   */
  const handleSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    saveDocument();
  }, [saveDocument]);

  /**
   * Navigate back to dashboard
   */
  const handleBack = useCallback(() => {
    if (state.hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }
    navigate('/dashboard');
  }, [state.hasUnsavedChanges, navigate]);

  /**
   * Load document on mount
   */
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  /**
   * Cleanup auto-save timeout
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle beforeunload to warn about unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  return {
    // State
    ...state,
    content,
    stats,
    
    // Actions
    updateContent,
    saveDocument: handleSave,
    goBack: handleBack,
    
    // Computed
    isReady: !state.isLoading && state.document && !state.error
  };
}; 