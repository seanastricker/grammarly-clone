/**
 * @fileoverview Dashboard page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Enhanced dashboard page with modern layout, document management, and analytics.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, TrendingUp, Zap, Calendar, Target } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { DocumentList, CreateDocumentModal } from '@/components/features/document-list';
import type { RecentDocument } from '@/types/document';
import * as documentService from '@/services/documents';

/**
 * Dashboard stats interface
 */
interface DashboardStats {
  totalDocuments: number;
  totalWords: number;
  documentsThisWeek: number;
  avgWordsPerDocument: number;
}

/**
 * Dashboard page component
 * 
 * Enhanced dashboard for authenticated users with modern layout and visual appeal.
 * 
 * @component
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalWords: 0,
    documentsThisWeek: 0,
    avgWordsPerDocument: 0
  });

  /**
   * Load recent documents and calculate stats
   */
  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load recent documents
      const recent = await documentService.getRecentDocuments(user.id, 5);
      setRecentDocuments(recent);

      // Load all documents for stats calculation
      const allDocs = await documentService.getUserDocuments(user.id, {
        limit: 1000 // Get all documents for accurate stats
      });

      // Calculate statistics
      const totalWords = allDocs.documents.reduce((sum, doc) => sum + doc.stats.wordCount, 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const documentsThisWeek = allDocs.documents.filter(
        doc => new Date(doc.createdAt) > weekAgo
      ).length;

      setStats({
        totalDocuments: allDocs.documents.length,
        totalWords,
        documentsThisWeek,
        avgWordsPerDocument: allDocs.documents.length > 0 
          ? Math.round(totalWords / allDocs.documents.length) 
          : 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  /**
   * Load dashboard data on mount
   */
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  /**
   * Handle creating new document
   */
  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  /**
   * Handle successful document creation
   */
  const handleDocumentCreated = () => {
    // Refresh dashboard data
    loadDashboardData();
  };

  /**
   * Format number with commas
   */
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  /**
   * Format relative time for recent documents
   */
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Writer';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/30 via-transparent to-slate-50/30" />
        <div className="relative max-w-7xl mx-auto p-6 pt-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  Welcome back, {userName}!
                </h1>
                <div className="text-2xl">👋</div>
              </div>
              <p className="text-lg text-slate-600">
                Ready to create something amazing today?
              </p>
            </div>
            
            <button
              onClick={handleCreateNew}
              className="group flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>New Document</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <FileText className="w-6 h-6 text-slate-700" />
              </div>
              <div className="text-slate-600 font-medium text-sm">Documents</div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{formatNumber(stats.totalDocuments)}</p>
              <p className="text-sm text-slate-600">Total created</p>
            </div>
          </div>

          <div className="group p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <Zap className="w-6 h-6 text-slate-700" />
              </div>
              <div className="text-slate-600 font-medium text-sm">Words</div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{formatNumber(stats.totalWords)}</p>
              <p className="text-sm text-slate-600">Total written</p>
            </div>
          </div>

          <div className="group p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-slate-700" />
              </div>
              <div className="text-slate-600 font-medium text-sm">This Week</div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{stats.documentsThisWeek}</p>
              <p className="text-sm text-slate-600">New documents</p>
            </div>
          </div>

          <div className="group p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <Target className="w-6 h-6 text-slate-700" />
              </div>
              <div className="text-slate-600 font-medium text-sm">Average</div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{formatNumber(stats.avgWordsPerDocument)}</p>
              <p className="text-sm text-slate-600">Words per doc</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          {/* Recent Documents */}
          <div className="space-y-6">
            {recentDocuments.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Clock className="w-5 h-5 text-slate-700" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Recent Documents</h2>
                </div>
                
                <div className="space-y-3">
                  {recentDocuments.map((doc, index) => (
                    <div
                      key={doc.id}
                      className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all duration-200 cursor-pointer hover:shadow-sm"
                      onClick={() => navigate(`/editor/${doc.id}`)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg group-hover:bg-slate-50 transition-colors">
                          <FileText className="w-5 h-5 text-slate-700 group-hover:text-slate-800 transition-colors" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-slate-900 transition-colors">
                            {doc.title}
                          </p>
                          <p className="text-sm text-slate-600">
                            {doc.wordCount} words • {doc.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          {formatRelativeTime(doc.lastAccessedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Document List */}
            <DocumentList onCreateNew={handleCreateNew} />
          </div>


        </div>
      </div>

      {/* Create Document Modal */}
      <CreateDocumentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleDocumentCreated}
      />
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage'; 