/**
 * @fileoverview Document card component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Individual document card component for displaying documents in lists.
 * Shows document metadata, stats, and quick actions.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy,
  Calendar,
  Eye,
  Clock,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, DocumentType } from '@/types/document';

/**
 * Props for DocumentCard component
 */
interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  onDuplicate?: (document: Document) => void;
  onExport?: (document: Document) => void;
  className?: string;
}

/**
 * Document type icons mapping
 */
const documentTypeIcons: Record<DocumentType, typeof FileText> = {
  article: FileText,
  essay: FileText,
  email: FileText,
  letter: FileText,
  report: FileText,
  creative: FileText,
  other: FileText
};

/**
 * Document type colors - Updated to elegant, muted palette
 */
const documentTypeColors: Record<DocumentType, string> = {
  article: 'text-slate-700 bg-slate-50 border-slate-200/50',
  essay: 'text-slate-700 bg-slate-50 border-slate-200/50',
  email: 'text-blue-700 bg-blue-50 border-blue-200/50',
  letter: 'text-slate-700 bg-slate-50 border-slate-200/50',
  report: 'text-slate-700 bg-slate-50 border-slate-200/50',
  creative: 'text-slate-700 bg-slate-50 border-slate-200/50',
  other: 'text-slate-600 bg-slate-50 border-slate-200/50'
};

/**
 * Format relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Document card component
 * 
 * Displays a document in card format with metadata and actions.
 * 
 * @component
 */
export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  className
}) => {
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const Icon = documentTypeIcons[document.type];
  const typeColorClass = documentTypeColors[document.type];

  /**
   * Handle card click - navigate to editor
   */
  const handleCardClick = () => {
    navigate(`/editor/${document.id}`);
  };

  /**
   * Handle action click (prevent card click)
   */
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setShowActions(false);
  };

  return (
    <div
      className={cn(
        'group relative bg-white border border-slate-200 rounded-lg p-6',
        'hover:shadow-md hover:border-slate-300 transition-all duration-200',
        'cursor-pointer',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={cn('p-2 rounded-lg border', typeColorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {document.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={cn(
                'text-xs px-2 py-1 rounded-full border',
                typeColorClass
              )}>
                {document.type}
              </span>
              <span className="text-xs text-slate-600">
                {document.privacy}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            className={cn(
              'p-2 rounded-lg hover:bg-slate-100 transition-colors',
              'opacity-0 group-hover:opacity-100'
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            <MoreHorizontal className="w-4 h-4 text-slate-700" />
          </button>

          {/* Actions Dropdown */}
          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
                {onEdit && (
                  <button
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-slate-50 text-left text-slate-800"
                    onClick={(e) => handleActionClick(e, () => onEdit(document))}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                {onDuplicate && (
                  <button
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-slate-50 text-left text-slate-800"
                    onClick={(e) => handleActionClick(e, () => onDuplicate(document))}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                )}

                {onExport && (
                  <button
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-slate-50 text-left text-slate-800"
                    onClick={(e) => handleActionClick(e, () => onExport(document))}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-red-50 text-red-600 text-left"
                    onClick={(e) => handleActionClick(e, () => onDelete(document.id))}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {document.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {document.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{document.stats.wordCount} words</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{document.stats.readingTime}m read</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>Updated {formatRelativeTime(document.updatedAt)}</span>
        </div>
      </div>

      {/* Tags */}
      {document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {document.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full"
            >
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
              +{document.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute top-4 right-4 flex items-center space-x-1">
        {document.suggestions && document.suggestions.grammarIssues > 0 && (
          <div className="w-2 h-2 bg-orange-500 rounded-full" title="Grammar issues found" />
        )}
        {document.status === 'published' && (
          <div title="Published">
            <Eye className="w-3 h-3 text-green-600" />
          </div>
        )}
      </div>
    </div>
  );
};

DocumentCard.displayName = 'DocumentCard'; 