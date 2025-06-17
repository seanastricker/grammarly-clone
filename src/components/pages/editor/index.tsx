/**
 * @fileoverview Editor page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Complete document editor with rich text editing, auto-save, and statistics.
 */

import React from 'react';
import { ArrowLeft, Save, Download, Share, Settings, Loader2 } from 'lucide-react';
import { useDocumentEditor } from '@/hooks/use-document-editor';
import { RichTextEditor } from '@/components/features/editor/rich-text-editor';
import { StatsSidebar } from '@/components/features/editor/stats-sidebar';
import { cn } from '@/lib/utils';

/**
 * Editor page component
 * 
 * Complete document editor with AI-powered writing assistance.
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Error Loading Document</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">📄</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Document Not Found</h1>
          <p className="text-muted-foreground">
            The document you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={goBack}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col">
              <h1 className="font-semibold text-foreground truncate max-w-[300px]" title={document.title}>
                {document.title}
              </h1>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <span className="capitalize">{document.type}</span>
                {hasUnsavedChanges && (
                  <span className="text-amber-600">• Unsaved changes</span>
                )}
                {isSaving && (
                  <span className="text-blue-600 flex items-center space-x-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <button
              onClick={saveDocument}
              disabled={isSaving || !hasUnsavedChanges}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                hasUnsavedChanges
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
              title="Save Document (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>

            {/* Additional actions */}
            <div className="flex items-center space-x-1">
              <button
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="Download Document"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="Share Document"
              >
                <Share className="w-4 h-4" />
              </button>
              
              <button
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="Document Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            <RichTextEditor
              content={content}
              onUpdate={updateContent}
              placeholder={`Start writing your ${document.type}...`}
              className="h-full"
            />
          </div>
        </main>

        {/* Stats Sidebar */}
        <aside className="flex-shrink-0">
          <StatsSidebar
            document={document}
            stats={stats}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            lastSaved={lastSaved}
          />
        </aside>
      </div>
    </div>
  );
};

EditorPage.displayName = 'EditorPage'; 