/**
 * @fileoverview Dashboard page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Enhanced dashboard page with document management, recent documents, and analytics.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, TrendingUp, Zap } from 'lucide-react';
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
 * Enhanced dashboard for authenticated users with document management.
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.displayName || user?.email || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your writing today.
            </p>
          </div>
          
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Document</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalDocuments)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Words</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalWords)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-foreground">{stats.documentsThisWeek}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Words</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.avgWordsPerDocument)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Documents Section */}
        {recentDocuments.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Documents</h2>
              <button
                onClick={() => navigate('/editor')}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View all →
              </button>
            </div>
            
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/editor/${doc.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-md">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.wordCount} words • {doc.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
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

        {/* Create Document Modal */}
        <CreateDocumentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleDocumentCreated}
        />
      </div>
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage'; 