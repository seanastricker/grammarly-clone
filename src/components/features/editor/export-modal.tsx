/**
 * @fileoverview Export Modal for D&D Campaigns
 * @author WordWise AI Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, FileText, Download } from 'lucide-react';
import { exportDocument, type ExportOptions } from '@/services/export';
import type { Document } from '@/types/document';
import type { AIGrammarStatistics } from '@/services/ai/grammar-ai-service';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  statistics?: AIGrammarStatistics;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  document,
  statistics
}) => {
  const [format, setFormat] = useState<'pdf' | 'txt'>('pdf');
  const [includeCover, setIncludeCover] = useState(true);
  const [customTitle, setCustomTitle] = useState(document.title);
  const [customAuthor, setCustomAuthor] = useState('Dungeon Master');
  const [campaignType, setCampaignType] = useState<'one-shot' | 'campaign' | 'adventure' | 'module'>('campaign');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        includeCover: format === 'pdf' ? includeCover : false, // Cover only for PDF
        title: customTitle,
        author: customAuthor,
        campaignType
      };

      await exportDocument(document, options, statistics);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Export Campaign</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('pdf')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  format === 'pdf'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">PDF</span>
                </div>
                <p className="text-xs text-slate-600">
                  Professional format with cover page and formatting
                </p>
              </button>
              
              <button
                onClick={() => setFormat('txt')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  format === 'txt'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Text</span>
                </div>
                <p className="text-xs text-slate-600">
                  Plain text format for easy sharing
                </p>
              </button>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700">Campaign Details</h3>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Campaign title"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Author/DM Name
              </label>
              <input
                type="text"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dungeon Master"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Campaign Type
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value as typeof campaignType)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="one-shot">One-Shot</option>
                <option value="campaign">Campaign</option>
                <option value="adventure">Adventure</option>
                <option value="module">Module</option>
              </select>
            </div>
          </div>

          {/* Export Options - Only show for PDF format */}
          {format === 'pdf' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Export Options</h3>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeCover}
                  onChange={(e) => setIncludeCover(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Include cover page</span>
              </label>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !customTitle.trim()}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}; 