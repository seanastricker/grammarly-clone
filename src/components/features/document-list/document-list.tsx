/**
 * @fileoverview Document list container component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Container component for managing and displaying document lists.
 * Handles filtering, sorting, pagination, and document actions.
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { DocumentCard } from './document-card';
import { cn } from '@/lib/utils';
import type { 
  Document, 
  DocumentFilters, 
  DocumentSortOptions, 
  DocumentType,
  DocumentPrivacy
} from '@/types/document';
import * as documentService from '@/services/documents';

/**
 * Props for DocumentList component
 */
interface DocumentListProps {
  onCreateNew?: () => void;
  className?: string;
}

/**
 * Document list component
 * 
 * Displays a list of user documents with filtering and actions.
 * 
 * @component
 */
export const DocumentList: React.FC<DocumentListProps> = ({
  onCreateNew,
  className
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('');
  const [privacyFilter, setPrivacyFilter] = useState<DocumentPrivacy | ''>('');
  const [sortBy, setSortBy] = useState<DocumentSortOptions>({
    field: 'updatedAt',
    direction: 'desc'
  });

  /**
   * Load documents from Firebase
   */
  const loadDocuments = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const filters: DocumentFilters = {};
      if (searchQuery) filters.searchQuery = searchQuery;
      if (typeFilter) filters.type = typeFilter;
      if (privacyFilter) filters.privacy = privacyFilter;

      const response = await documentService.getUserDocuments(user.id, {
        filters,
        sort: sortBy,
        limit: 50 // Load more for better UX
      });

      setDocuments(response.documents);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect to load documents when user or filters change
   */
  useEffect(() => {
    loadDocuments();
  }, [user, searchQuery, typeFilter, privacyFilter, sortBy]);

  /**
   * Handle document deletion
   */
  const handleDelete = async (documentId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId, user.id);
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  /**
   * Handle document duplication
   */
  const handleDuplicate = async (document: Document) => {
    if (!user) return;

    try {
      const duplicatedDoc = await documentService.duplicateDocument(
        document.id, 
        user.id,
        `${document.title} (Copy)`
      );
      // Add to local state
      setDocuments(prev => [duplicatedDoc, ...prev]);
    } catch (err) {
      console.error('Error duplicating document:', err);
      alert('Failed to duplicate document');
    }
  };

  /**
   * Handle document sharing (placeholder)
   */
  const handleShare = (_document: Document) => {
    // TODO: Implement sharing functionality
    alert('Sharing functionality coming soon!');
  };

  /**
   * Handle document editing (navigate to editor)
   */
  const handleEdit = (document: Document) => {
    window.location.href = `/editor/${document.id}`;
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={loadDocuments}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Documents</h2>
          <p className="text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as DocumentType | '')}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="article">Article</option>
          <option value="essay">Essay</option>
          <option value="email">Email</option>
          <option value="letter">Letter</option>
          <option value="report">Report</option>
          <option value="creative">Creative</option>
          <option value="other">Other</option>
        </select>

        {/* Privacy Filter */}
        <select
          value={privacyFilter}
          onChange={(e) => setPrivacyFilter(e.target.value as DocumentPrivacy | '')}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">All Privacy</option>
          <option value="private">Private</option>
          <option value="shared">Shared</option>
          <option value="public">Public</option>
        </select>

        {/* Sort */}
        <select
          value={`${sortBy.field}-${sortBy.direction}`}
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-');
            setSortBy({
              field: field as DocumentSortOptions['field'],
              direction: direction as 'asc' | 'desc'
            });
          }}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="updatedAt-desc">Recently Updated</option>
          <option value="createdAt-desc">Recently Created</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
          <option value="wordCount-desc">Most Words</option>
        </select>
      </div>

      {/* Document Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onShare={handleShare}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No documents found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter || privacyFilter
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first document.'}
            </p>
            {onCreateNew && !searchQuery && !typeFilter && !privacyFilter && (
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Your First Document
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

DocumentList.displayName = 'DocumentList'; 