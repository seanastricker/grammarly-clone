/**
 * @fileoverview Document Settings Modal Component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Modal component for editing document settings like title, type, description, and tags.
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Tag, Type, FileText, Hash, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { Document, DocumentType } from '@/types/document';

interface DocumentSettingsModalProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
  onSave: (updates: {
    title: string;
    type: DocumentType;
    description: string;
    tags: string[];
  }) => Promise<void>;
}

interface FormData {
  title: string;
  type: DocumentType;
  description: string;
  tags: string[];
}

interface FormErrors {
  title?: string;
  type?: string;
  description?: string;
  tags?: string;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: string }[] = [
  { value: 'campaign', label: 'Campaign', icon: '🏰' },
  { value: 'names', label: 'Names & Titles', icon: '👤' },
  { value: 'monsters', label: 'Monsters & NPCs', icon: '🐉' },
  { value: 'backgrounds', label: 'Character Backgrounds', icon: '📜' },
  { value: 'other', label: 'Other', icon: '📄' }
];

export const DocumentSettingsModal: React.FC<DocumentSettingsModalProps> = ({
  isOpen,
  document,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: 'other',
    description: '',
    tags: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Initialize form data when document changes
  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        type: document.type,
        description: document.description || '',
        tags: document.tags || []
      });
    }
  }, [document]);

  // Handle form field changes
  const handleFieldChange = (field: keyof FormData, value: string | DocumentType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle tag input
  const handleTagInputChange = (value: string) => {
    setTagInput(value);
    // Clear tags error when user starts typing
    setErrors(prev => ({ ...prev, tags: '' }));
  };

  // Add tag
  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    
    const trimmedTag = tag.trim().toLowerCase();
    if (formData.tags.includes(trimmedTag)) return;
    
    if (formData.tags.length >= 10) {
      setErrors(prev => ({ ...prev, tags: 'Maximum 10 tags allowed' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    setTagInput('');
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // Validate form
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        title: formData.title.trim(),
        type: formData.type,
        description: formData.description.trim(),
        tags: formData.tags
      });
      onClose();
    } catch (error) {
      console.error('Error updating document settings:', error);
      setErrors({ title: 'Failed to update document settings' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (!document) {
      onClose();
      return;
    }

    const hasChanges = 
      formData.title !== document.title ||
      formData.type !== document.type ||
      formData.description !== (document.description || '') ||
      JSON.stringify(formData.tags) !== JSON.stringify(document.tags || []);

    if (hasChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Settings
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Document Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
                placeholder="Enter document title"
                maxLength={100}
              />
              {errors.title && (
                <div className="flex items-center space-x-2 mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.title}</span>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100 characters
              </div>
            </div>

            {/* Document Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DOCUMENT_TYPES.map((typeOption) => (
                  <button
                    key={typeOption.value}
                    type="button"
                    onClick={() => handleFieldChange('type', typeOption.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left hover:shadow-sm ${
                      formData.type === typeOption.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{typeOption.icon}</span>
                      <span className="text-sm font-medium">{typeOption.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of this document (optional)"
                maxLength={500}
              />
              {errors.description && (
                <div className="flex items-center space-x-2 mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.description}</span>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-3">
                {/* Tag Input */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagInputChange(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                    placeholder="Add tags (press Enter or comma to add)"
                    className={errors.tags ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim() || formData.tags.length >= 10}
                    variant="outline"
                    size="sm"
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>

                {/* Tag List */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {errors.tags && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.tags}</span>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {formData.tags.length}/10 tags • Separate tags with comma or Enter
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

DocumentSettingsModal.displayName = 'DocumentSettingsModal'; 