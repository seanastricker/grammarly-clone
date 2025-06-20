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
import { ExportModal } from '../editor/export-modal';
import { cn } from '@/lib/utils';
import type { 
  Document, 
  DocumentFilters, 
  DocumentSortOptions, 
  DocumentType
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
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('');
  const [sortBy, setSortBy] = useState<DocumentSortOptions>({
    field: 'updatedAt',
    direction: 'desc'
  });

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [documentToExport, setDocumentToExport] = useState<Document | null>(null);

  /**
   * Load documents from Firebase
   */
  const loadDocuments = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const filters: DocumentFilters = {};
      if (typeFilter) filters.type = typeFilter;

      const response = await documentService.getUserDocuments(user.id, {
        filters,
        sort: sortBy,
        limit: 50 // Load more for better UX
      });

      setAllDocuments(response.documents);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filter and sort documents client-side
   */
  const filteredDocuments = React.useMemo(() => {
    let filtered = [...allDocuments];

    // Client-side search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Client-side sorting (since we removed it from Firebase query)
    filtered.sort((a, b) => {
      const { field, direction } = sortBy;
      let aValue: any, bValue: any;

      switch (field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'wordCount':
          aValue = a.stats.wordCount;
          bValue = b.stats.wordCount;
          break;
        default:
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
      }

      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [allDocuments, searchQuery, sortBy]);

  /**
   * Effect to load documents when user or server-side filters change
   * NOTE: searchQuery removed to prevent focus loss
   */
  useEffect(() => {
    loadDocuments();
  }, [user, typeFilter, sortBy]);

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
      setAllDocuments(prev => prev.filter(doc => doc.id !== documentId));
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
      setAllDocuments(prev => [duplicatedDoc, ...prev]);
    } catch (err) {
      console.error('Error duplicating document:', err);
      alert('Failed to duplicate document');
    }
  };



  /**
   * Handle document editing (navigate to editor)
   */
  const handleEdit = (document: Document) => {
    window.location.href = `/editor/${document.id}`;
  };

  /**
   * Handle document export
   */
  const handleExport = (document: Document) => {
    setDocumentToExport(document);
    setShowExportModal(true);
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
          <h2 className="text-2xl font-bold text-slate-900">Your Documents</h2>
          <p className="text-slate-600">
            {filteredDocuments.length} of {allDocuments.length} document{allDocuments.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-lg transition-colors"
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as DocumentType | '')}
          className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="campaign">Campaign</option>
          <option value="names">Names</option>
          <option value="monsters">Monsters</option>
          <option value="backgrounds">Backgrounds</option>
          <option value="other">Other</option>
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
          className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="updatedAt-desc">Recently Updated</option>
          <option value="createdAt-desc">Recently Created</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
          <option value="wordCount-desc">Most Words</option>
        </select>
      </div>

      {/* Document Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onExport={handleExport}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {allDocuments.length === 0 ? 'No documents yet' : 'No documents found'}
            </h3>
            <p className="text-slate-600 mb-4">
              {allDocuments.length === 0
                ? 'Get started by creating your first document.'
                : 'Try adjusting your search terms or filters.'}
            </p>
            {onCreateNew && allDocuments.length === 0 && (
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-lg transition-colors"
              >
                Create Your First Document
              </button>
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {documentToExport && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false);
            setDocumentToExport(null);
          }}
          document={documentToExport}
        />
      )}
    </div>
  );
};

DocumentList.displayName = 'DocumentList'; 