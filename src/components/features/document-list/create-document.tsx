/**
 * @fileoverview Create new document component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Modal component for creating new documents with customizable options.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { DocumentType, CreateDocumentData } from '@/types/document';
import * as documentService from '@/services/documents';

/**
 * Props for CreateDocumentModal component
 */
interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (document: any) => void;
}

/**
 * Document type options with descriptions
 */
const documentTypes: Array<{
  type: DocumentType;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    type: 'campaign',
    label: 'Campaign',
    description: 'Full campaign adventures with quests, NPCs, and storylines',
    icon: '📚'
  },
  {
    type: 'names',
    label: 'Names',
    description: 'Character names for NPCs, places, and fantasy entities',
    icon: '🏷️'
  },
  {
    type: 'monsters',
    label: 'Monsters',
    description: 'Monster stat blocks, descriptions, and encounter ideas',
    icon: '🐉'
  },
  {
    type: 'backgrounds',
    label: 'Backgrounds',
    description: 'Character backgrounds, histories, and personality traits',
    icon: '👤'
  },
  {
    type: 'other',
    label: 'Other',
    description: 'General D&D content and miscellaneous documents',
    icon: '📄'
  }
];

/**
 * Create document modal component
 * 
 * Modal for creating new documents with type selection and basic metadata.
 * 
 * @component
 */
export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: DocumentType;
    tags: string;
  }>({
    title: '',
    description: '',
    type: 'other',
    tags: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Document title is required';
    } else if (formData.title.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) return;

    setIsCreating(true);

    try {
      const createData: CreateDocumentData = {
        title: formData.title.trim(),
        type: formData.type,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      };

      // Add description only if it has content
      if (formData.description.trim()) {
        createData.description = formData.description.trim();
      }

      const document = await documentService.createDocument(user.id, createData);
      
      // Success callback
      if (onSuccess) {
        onSuccess(document);
      }

      // Navigate to editor
      navigate(`/editor/${document.id}`);
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Failed to create document. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (isCreating) return; // Prevent close while creating
    
    setFormData({
      title: '',
      description: '',
      type: 'other',
      tags: ''
    });
    setErrors({});
    onClose();
  };

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Create New Document
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-2 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Document Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter document title..."
              className={cn(
                'w-full px-3 py-2 border rounded-md bg-white text-slate-900',
                'placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
                errors.title ? 'border-red-300' : 'border-slate-200'
              )}
              disabled={isCreating}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">
              Document Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documentTypes.map((typeOption) => (
                <label
                  key={typeOption.type}
                  className={cn(
                    'flex items-start space-x-3 p-3 border rounded-md cursor-pointer transition-colors',
                    formData.type === typeOption.type
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50',
                    isCreating && 'pointer-events-none opacity-50'
                  )}
                >
                  <input
                    type="radio"
                    name="documentType"
                    value={typeOption.type}
                    checked={formData.type === typeOption.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as DocumentType 
                    }))}
                    className="mt-1 text-blue-600 focus:ring-blue-600"
                    disabled={isCreating}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{typeOption.icon}</span>
                      <span className="font-medium text-slate-900">
                        {typeOption.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {typeOption.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this document is about..."
              rows={3}
              className={cn(
                'w-full px-3 py-2 border rounded-md bg-white text-slate-900 resize-none',
                'placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
                errors.description ? 'border-red-300' : 'border-slate-200'
              )}
              disabled={isCreating}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-slate-600 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Enter tags separated by commas..."
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={isCreating}
            />
            <p className="text-xs text-slate-600 mt-1">
              Example: research, important, draft
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-4 py-2 border border-slate-200 rounded-md text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !formData.title.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Create Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateDocumentModal.displayName = 'CreateDocumentModal'; 