/**
 * @fileoverview Dashboard page component
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Enhanced dashboard page with modern layout, document management, and analytics.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, TrendingUp, Zap, Star, Calendar, Target, Activity } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/20 to-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-tertiary/10" />
        <div className="relative max-w-7xl mx-auto p-6 pt-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Welcome back, {userName}!
                </h1>
                <div className="text-2xl">👋</div>
              </div>
              <p className="text-lg text-muted-foreground">
                Ready to create something amazing today?
              </p>
            </div>
            
            <button
              onClick={handleCreateNew}
              className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-tertiary text-primary-foreground rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
          <div className="group p-6 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-blue-600 font-medium text-sm">Documents</div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{formatNumber(stats.totalDocuments)}</p>
              <p className="text-sm text-muted-foreground">Total created</p>
            </div>
          </div>

          <div className="group p-6 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-green-600 font-medium text-sm">Words</div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{formatNumber(stats.totalWords)}</p>
              <p className="text-sm text-muted-foreground">Total written</p>
            </div>
          </div>

          <div className="group p-6 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-purple-600 font-medium text-sm">This Week</div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{stats.documentsThisWeek}</p>
              <p className="text-sm text-muted-foreground">New documents</p>
            </div>
          </div>

          <div className="group p-6 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-orange-600 font-medium text-sm">Average</div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{formatNumber(stats.avgWordsPerDocument)}</p>
              <p className="text-sm text-muted-foreground">Words per doc</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Documents - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {recentDocuments.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Recent Documents</h2>
                  </div>
                  <button
                    onClick={() => navigate('/editor')}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    View all
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {recentDocuments.map((doc, index) => (
                    <div
                      key={doc.id}
                      className="group flex items-center justify-between p-4 bg-background/50 border border-border/30 rounded-2xl hover:bg-muted/50 transition-all duration-300 cursor-pointer hover:shadow-md"
                      onClick={() => navigate(`/editor/${doc.id}`)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {doc.title}
                          </p>
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
          </div>

          {/* Quick Actions & Insights - Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-tertiary/10 rounded-xl">
                  <Star className="w-5 h-5 text-tertiary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleCreateNew}
                  className="w-full flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl hover:bg-primary/10 transition-all duration-300 text-left"
                >
                  <Plus className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Create New Document</span>
                </button>
                
                <button
                  onClick={() => navigate('/editor')}
                  className="w-full flex items-center gap-3 p-4 bg-muted/50 border border-border/30 rounded-2xl hover:bg-muted transition-all duration-300 text-left"
                >
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Browse All Documents</span>
                </button>
              </div>
            </div>

            {/* Writing Insights */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Writing Insights</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary/5 to-tertiary/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Weekly Goal</span>
                    <span className="text-sm text-primary font-semibold">75%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-tertiary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">3,750 / 5,000 words</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Quality Score</span>
                    <span className="text-sm font-semibold text-green-600">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Writing Streak</span>
                    <span className="text-sm font-semibold text-orange-600">7 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Documents This Month</span>
                    <span className="text-sm font-semibold text-blue-600">12</span>
                  </div>
                </div>
              </div>
            </div>
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