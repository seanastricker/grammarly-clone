/**
 * @fileoverview Campaign Balance Analysis Widget - Interactive UI for analyzing D&D campaign balance
 * @author WordWise AI Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  campaignBalanceAnalyzer, 
  type BalanceAnalysis, 
  type BalancePreferences,
  type Recommendation 
} from '@/services/ai/campaign-balance-analyzer';

interface BalanceAnalysisWidgetProps {
  content: string;
  onInsertContent: (content: string) => void;
  className?: string;
}

export function BalanceAnalysisWidget({ 
  content, 
  onInsertContent, 
  className = '' 
}: BalanceAnalysisWidgetProps) {
  const [analysis, setAnalysis] = useState<BalanceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<BalancePreferences>({
    combat: 30,
    roleplay: 35,
    exploration: 20,
    puzzle: 10,
    transition: 5
  });
  const [showPreferences, setShowPreferences] = useState(false);

  // Handle analysis
  const handleAnalyze = useCallback(async () => {
    if (!content || content.trim().length < 100) {
      setError('Content too short for analysis (minimum 100 characters required)');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await campaignBalanceAnalyzer.analyzeCampaign(content, userPreferences);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, userPreferences]);

  // Handle recommendation application
  const handleApplyRecommendation = useCallback((recommendation: Recommendation) => {
    if (!recommendation.autoApplicable || !recommendation.autoApplyAction) {
      return;
    }

    if ('insertContent' in recommendation.autoApplyAction) {
      onInsertContent(recommendation.autoApplyAction.insertContent);
    }
  }, [onInsertContent]);

  // Handle preference updates
  const handlePreferenceChange = useCallback((type: keyof BalancePreferences, value: number) => {
    setUserPreferences(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(100, value))
    }));
  }, []);

  // Reset preferences to defaults
  const handleResetPreferences = useCallback(() => {
    setUserPreferences({
      combat: 30,
      roleplay: 35,
      exploration: 20,
      puzzle: 10,
      transition: 5
    });
  }, []);

  // Ensure preferences total 100%
  const normalizePreferences = useCallback(() => {
    const total = Object.values(userPreferences).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const scale = 100 / total;
      const normalized = Object.entries(userPreferences).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: Math.round(value * scale)
      }), {} as BalancePreferences);
      setUserPreferences(normalized);
    }
  }, [userPreferences]);

  return (
    <div className={`h-full flex flex-col space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Campaign Balance Analysis</h3>
          <p className="text-sm text-slate-600">
            Analyze your campaign's balance between combat, roleplay, exploration, puzzles, and transitions
          </p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            Analyzing...
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Preferences Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-slate-900">Balance Preferences</h4>
          <Button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-xs"
            size="sm"
          >
            {showPreferences ? 'Hide' : 'Customize'}
          </Button>
        </div>

        {showPreferences && (
          <div className="space-y-3">
            {Object.entries(userPreferences).map(([type, value]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-slate-700">
                  {type}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => handlePreferenceChange(type as keyof BalancePreferences, parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-slate-600 w-8 text-right">
                    {value}%
                  </span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={normalizePreferences} size="sm" className="text-xs">
                Normalize to 100%
              </Button>
              <Button onClick={handleResetPreferences} size="sm" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700">
                Reset Defaults
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !content || content.trim().length < 100}
        className="w-full"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Campaign Balance'}
      </Button>

      {/* Results Section */}
      {analysis && (
        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Overall Score */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-slate-900">Overall Balance Score</h4>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${
                  analysis.overallScore >= 80 ? 'text-green-600' :
                  analysis.overallScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysis.overallScore}/100
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  analysis.overallScore >= 80 ? 'bg-green-500' :
                  analysis.overallScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Estimated Duration: {Math.round(analysis.estimatedDuration)} minutes
            </p>
          </Card>

          {/* Content Breakdown */}
          <Card className="p-4">
            <h4 className="font-medium text-slate-900 mb-3">Content Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(analysis.contentBreakdown).map(([type, percentage]) => {
                const preferred = userPreferences[type as keyof BalancePreferences];
                const difference = percentage - preferred;
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize text-slate-700">
                        {type}
                      </span>
                      {Math.abs(difference) > 5 && (
                        <span className={`text-xs px-1 rounded ${
                          difference > 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {difference > 0 ? '+' : ''}{difference}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600 w-8 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pacing Analysis */}
          <Card className="p-4">
            <h4 className="font-medium text-slate-900 mb-3">Pacing Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Average Segment Length:</span>
                <span className="font-medium">{Math.round(analysis.pacingAnalysis.averageSegmentLength)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Longest Single Type:</span>
                <span className="font-medium">
                  {analysis.pacingAnalysis.longestSingleType.type} ({analysis.pacingAnalysis.longestSingleType.duration} min)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Transition Quality:</span>
                <span className={`font-medium ${
                  analysis.pacingAnalysis.transitionQuality >= 70 ? 'text-green-600' :
                  analysis.pacingAnalysis.transitionQuality >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysis.pacingAnalysis.transitionQuality}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Climax Placement:</span>
                <span className={`font-medium ${
                  analysis.pacingAnalysis.climaxPlacement >= 60 && analysis.pacingAnalysis.climaxPlacement <= 80 ? 'text-green-600' :
                  'text-yellow-600'
                }`}>
                  {analysis.pacingAnalysis.climaxPlacement}%
                </span>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-4">
            <h4 className="font-medium text-slate-900 mb-3">
              Recommendations ({analysis.recommendations.length})
            </h4>
            
            {analysis.recommendations.length === 0 ? (
              <p className="text-sm text-slate-600">
                Great job! Your campaign has excellent balance. No recommendations needed.
              </p>
            ) : (
              <div className="space-y-3">
                {analysis.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                            recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {recommendation.priority}
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            {recommendation.targetSection}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {recommendation.description}
                        </p>
                        <p className="text-sm text-slate-700 mb-1">
                          <strong>Suggestion:</strong> {recommendation.specificSuggestion}
                        </p>
                        <p className="text-xs text-slate-500">
                          <strong>Impact:</strong> {recommendation.expectedImpact}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      {recommendation.autoApplicable && (
                        <Button
                          size="sm"
                          onClick={() => handleApplyRecommendation(recommendation)}
                          className="text-xs"
                        >
                          Apply Automatically
                        </Button>
                      )}
                      <span className="text-xs text-slate-500 flex items-center">
                        Helps: {recommendation.playerArchetypes.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
} 