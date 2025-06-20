/**
 * @fileoverview Document type definitions
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * TypeScript types for document management and storage.
 */

/**
 * Document privacy levels
 */
export type DocumentPrivacy = 'private' | 'shared' | 'public';

/**
 * Document status
 */
export type DocumentStatus = 'draft' | 'published' | 'archived';

/**
 * Document type/category
 */
export type DocumentType = 'campaign' | 'names' | 'monsters' | 'backgrounds' | 'other';

/**
 * Writing statistics for a document
 */
export interface DocumentStats {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  paragraphCount: number;
  sentenceCount: number;
  readingTime: number; // in minutes
  lastEditedAt: Date;
}

/**
 * Grammar and style suggestions metadata
 */
export interface DocumentSuggestions {
  grammarIssues: number;
  styleIssues: number;
  readabilityScore: number;
  toneAnalysis?: string;
  lastCheckedAt?: Date;
}

/**
 * Main document interface
 */
export interface Document {
  id: string;
  title: string;
  content: string; // HTML content from TipTap
  userId: string;
  type: DocumentType;
  privacy: DocumentPrivacy;
  status: DocumentStatus;
  
  // Metadata
  description?: string;
  tags: string[];
  
  // Statistics
  stats: DocumentStats;
  suggestions?: DocumentSuggestions;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  
  // Collaboration (future)
  sharedWith?: string[]; // User IDs
  collaborators?: string[]; // User IDs with edit access
  
  // Version control (future)
  version: number;
  isAutoSaveEnabled: boolean;
}

/**
 * Document creation data
 */
export interface CreateDocumentData {
  title: string;
  content?: string;
  type?: DocumentType;
  privacy?: DocumentPrivacy;
  description?: string;
  tags?: string[];
}

/**
 * Document update data
 */
export interface UpdateDocumentData {
  title?: string;
  content?: string;
  type?: DocumentType;
  privacy?: DocumentPrivacy;
  status?: DocumentStatus;
  description?: string;
  tags?: string[];
  stats?: Partial<DocumentStats>;
  suggestions?: Partial<DocumentSuggestions>;
}

/**
 * Document filter options
 */
export interface DocumentFilters {
  type?: DocumentType;
  privacy?: DocumentPrivacy;
  status?: DocumentStatus;
  tags?: string[];
  searchQuery?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Document sorting options
 */
export interface DocumentSortOptions {
  field: 'title' | 'createdAt' | 'updatedAt' | 'lastAccessedAt' | 'wordCount';
  direction: 'asc' | 'desc';
}

/**
 * Document list query options
 */
export interface DocumentQueryOptions {
  filters?: DocumentFilters;
  sort?: DocumentSortOptions;
  limit?: number;
  offset?: number;
}

/**
 * Document list response
 */
export interface DocumentListResponse {
  documents: Document[];
  total: number;
  hasMore: boolean;
}

/**
 * Recent document item (lightweight version for quick display)
 */
export interface RecentDocument {
  id: string;
  title: string;
  type: DocumentType;
  wordCount: number;
  lastAccessedAt: Date;
  updatedAt: Date;
}

/**
 * Document template
 */
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
  content: string; // HTML template content
  isDefault: boolean;
  category: string;
} 