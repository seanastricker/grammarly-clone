/**
 * @fileoverview Campaign Generator Widget for D&D Campaign Creation
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Interactive widget for generating and refining D&D campaigns with AI assistance.
 * Includes parameter selection, generation progress, and chat-based refinement.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wand2, 
  Settings, 
  Users, 
  Clock, 
  Sword, 
  MessageSquare, 
  Lightbulb,
  Send,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  ScrollText
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { 
  generateCampaign, 
  refineCampaign,
  type CampaignParameters, 
  type GeneratedCampaign, 
  type RefinementRequest,
  type RefinementResponse 
} from '@/services/ai/campaign-generator';

interface CampaignGeneratorWidgetProps {
  onCampaignGenerated: (campaign: string) => void;
  className?: string;
}

type GenerationStep = 'parameters' | 'generating' | 'review' | 'chat';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function CampaignGeneratorWidget({ 
  onCampaignGenerated, 
  className = '' 
}: CampaignGeneratorWidgetProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<GenerationStep>('parameters');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);
  const [displayedCampaignHtml, setDisplayedCampaignHtml] = useState<string>(''); // What user sees in Campaign Content
  
  // Campaign Parameters
  const [parameters, setParameters] = useState<CampaignParameters>({
    duration: 2,
    playerCount: 4,
    characterLevel: 3,
    setting: 'mixed',
    theme: 'adventure',
    tone: 'heroic',
    combatBalance: 'moderate',
    roleplayBalance: 'moderate',
    explorationBalance: 'moderate'
  });

  // Chat Interface
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Debug: Track when campaign content changes
  useEffect(() => {
    if (displayedCampaignHtml) {
      console.log('🎲 Campaign display HTML updated - length:', displayedCampaignHtml.length);
    }
  }, [displayedCampaignHtml]);

  const handleGenerateCampaign = async () => {
    if (!user) return;

    setIsGenerating(true);
    setCurrentStep('generating');

    try {
      console.log('🎲 Starting campaign generation...');
      const campaign = await generateCampaign(parameters, user);
      setGeneratedCampaign(campaign);
      
      // Set initial display HTML
      const initialHtml = formatCampaignForEditor(campaign);
      setDisplayedCampaignHtml(initialHtml);
      
      setCurrentStep('review');
      
      // Initialize chat with welcome message
      setChatMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: `I've generated "${campaign.title}" for you! This ${campaign.parameters.duration}-hour campaign is designed for ${campaign.parameters.playerCount} level ${campaign.parameters.characterLevel} characters. Feel free to ask me to modify any aspect of the campaign - encounters, NPCs, settings, or anything else you'd like to adjust.`,
          timestamp: new Date()
        }
      ]);
      
      console.log('🎲 Campaign generation complete');
    } catch (error) {
      console.error('🎲 Campaign generation failed:', error);
      alert('Campaign generation failed. Please try again.');
      setCurrentStep('parameters');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefinementChat = async () => {
    if (!chatInput.trim() || !generatedCampaign || !user) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsRefining(true);

    try {
      const refinementRequest: RefinementRequest = {
        campaignId: generatedCampaign.id,
        requestType: 'general',
        description: chatInput
      };

      const refinementResult = await refineCampaign(generatedCampaign, refinementRequest, user);
      
      console.log('🎲 Refinement result:', refinementResult);
      console.log('🎲 Updated campaign title:', refinementResult.updatedCampaign.title);
      console.log('🎲 Updated campaign locations:', refinementResult.updatedCampaign.locations);
      console.log('🎲 Updated campaign introduction:', refinementResult.updatedCampaign.introduction.substring(0, 200) + '...');
      
      // Check current state vs updated campaign
      console.log('🎲 BEFORE UPDATE - Current state locations:', generatedCampaign?.locations.map(loc => loc.name));
      console.log('🎲 AFTER REFINEMENT - Updated location names:', refinementResult.updatedCampaign.locations.map(loc => loc.name));
      console.log('🎲 Setting updated campaign state...');
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: `I've made the following changes to your campaign:\n\n${refinementResult.changes.join('\n')}\n\n${refinementResult.suggestions ? `Additional suggestions:\n${refinementResult.suggestions.join('\n')}` : ''}`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Update the campaign state
      const updatedCampaign = { ...refinementResult.updatedCampaign };
      console.log('🎲 About to set campaign state with:', updatedCampaign.locations.map(loc => loc.name));
      
      setGeneratedCampaign(updatedCampaign);
      
      // Generate and update the displayed HTML immediately
      const updatedHtml = formatCampaignForEditor(updatedCampaign);
      setDisplayedCampaignHtml(updatedHtml);
      
      console.log('🎲 State updated - campaign and display HTML set successfully');

    } catch (error) {
      console.error('🎲 Campaign refinement failed:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error while refining your campaign. Please try rephrasing your request.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsRefining(false);
    }
  };

  const handleUseCampaign = () => {
    if (!generatedCampaign) return;

    // Use the displayed HTML (which includes all refinements)
    const campaignContent = displayedCampaignHtml || formatCampaignForEditor(generatedCampaign);
    onCampaignGenerated(campaignContent);
    
    // Reset the widget for next use
    setCurrentStep('parameters');
    setGeneratedCampaign(null);
    setDisplayedCampaignHtml('');
    setChatMessages([]);
  };

  const formatCampaignForEditor = (campaign: GeneratedCampaign): string => {
    let content = `<h1>${campaign.title}</h1>`;
    
    content += `<h2>Campaign Overview</h2>`;
    content += `<p><strong>Duration:</strong> ${campaign.parameters.duration} hours</p>`;
    content += `<p><strong>Players:</strong> ${campaign.parameters.playerCount} level ${campaign.parameters.characterLevel} characters</p>`;
    content += `<p><strong>Setting:</strong> ${campaign.parameters.setting}</p>`;
    content += `<p><strong>Theme:</strong> ${campaign.parameters.theme}</p>`;
    
    content += `<h2>Introduction</h2>`;
    content += `<p>${campaign.introduction}</p>`;
    
    if (campaign.plotHooks.length > 0) {
      content += `<h2>Plot Hooks</h2><ul>`;
      campaign.plotHooks.forEach(hook => {
        content += `<li>${hook}</li>`;
      });
      content += `</ul>`;
    }
    
    content += `<h2>Encounters</h2>`;
    campaign.encounters.forEach((encounter, index) => {
      content += `<h3>Encounter ${index + 1}: ${encounter.title}</h3>`;
      content += `<p><strong>Type:</strong> ${encounter.type}</p>`;
      content += `<p><strong>Duration:</strong> ${encounter.estimatedDuration} minutes</p>`;
      content += `<p>${encounter.description}</p>`;
    });
    
    if (campaign.npcs.length > 0) {
      content += `<h2>NPCs</h2>`;
      campaign.npcs.forEach(npc => {
        content += `<h3>${npc.name}</h3>`;
        content += `<p><strong>Race:</strong> ${npc.race} | <strong>Role:</strong> ${npc.role}</p>`;
        content += `<p><strong>Personality:</strong> ${npc.personality}</p>`;
        content += `<p><strong>Motivation:</strong> ${npc.motivation}</p>`;
        content += `<p>${npc.description}</p>`;
      });
    }
    
    if (campaign.locations.length > 0) {
      content += `<h2>Locations</h2>`;
      campaign.locations.forEach(location => {
        content += `<h3>${location.name}</h3>`;
        content += `<p><strong>Type:</strong> ${location.type}</p>`;
        content += `<p>${location.description}</p>`;
      });
    }
    
    if (campaign.statBlocks && campaign.statBlocks.length > 0) {
      content += `<h2>Stat Blocks</h2>`;
      campaign.statBlocks.forEach(statBlock => {
        content += `<h3>${statBlock.name}</h3>`;
        content += `<p><strong>Type:</strong> ${statBlock.type} | <strong>Challenge Rating:</strong> ${statBlock.challengeRating}</p>`;
        content += `<pre style="background: #f8f9fa; padding: 12px; border-radius: 4px; border: 1px solid #e9ecef; font-family: monospace; white-space: pre-wrap;">${statBlock.stats}</pre>`;
      });
    }
    
    if (campaign.handouts && campaign.handouts.length > 0) {
      content += `<h2>Handouts & Resources</h2>`;
      campaign.handouts.forEach((handout, index) => {
        content += `<h3>Handout ${index + 1}</h3>`;
        content += `<div style="background: #fffbf0; padding: 12px; border-radius: 4px; border: 1px solid #f0e68c; white-space: pre-wrap;">${handout}</div>`;
      });
    }
    
    content += `<h2>Conclusion</h2>`;
    content += `<p>${campaign.conclusion}</p>`;
    
    return content;
  };

  const renderParametersStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Campaign Parameters</h3>
        <p className="text-sm text-slate-600 mb-6">
          Configure your campaign settings. AI will generate a complete adventure based on these parameters.
        </p>
      </div>

      {/* Basic Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Duration (hours)
          </label>
          <select
            value={parameters.duration}
            onChange={(e) => setParameters(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
            <option value={4}>4 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Player Count
          </label>
          <select
            value={parameters.playerCount}
            onChange={(e) => setParameters(prev => ({ ...prev, playerCount: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value={2}>2 players</option>
            <option value={3}>3 players</option>
            <option value={4}>4 players</option>
            <option value={5}>5 players</option>
            <option value={6}>6 players</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Character Level
          </label>
          <select
            value={parameters.characterLevel}
            onChange={(e) => setParameters(prev => ({ ...prev, characterLevel: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            {[1,2,3,4,5,6,7,8,9,10].map(level => (
              <option key={level} value={level}>Level {level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Setting
          </label>
          <select
            value={parameters.setting}
            onChange={(e) => setParameters(prev => ({ ...prev, setting: e.target.value as any }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="urban">Urban</option>
            <option value="wilderness">Wilderness</option>
            <option value="dungeon">Dungeon</option>
            <option value="planar">Planar</option>
            <option value="mixed">Mixed</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Theme and Tone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Theme
          </label>
          <select
            value={parameters.theme}
            onChange={(e) => setParameters(prev => ({ ...prev, theme: e.target.value as any }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="adventure">Adventure</option>
            <option value="mystery">Mystery</option>
            <option value="horror">Horror</option>
            <option value="political">Political</option>
            <option value="exploration">Exploration</option>
            <option value="combat">Combat</option>
            <option value="social">Social</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tone
          </label>
          <select
            value={parameters.tone}
            onChange={(e) => setParameters(prev => ({ ...prev, tone: e.target.value as any }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="heroic">Heroic</option>
            <option value="serious">Serious</option>
            <option value="comedic">Comedic</option>
            <option value="dramatic">Dramatic</option>
            <option value="lighthearted">Lighthearted</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      {/* Balance Settings */}
      <div>
        <h4 className="text-md font-medium text-slate-900 mb-3">
          <Sword className="w-4 h-4 inline mr-1" />
          Content Balance
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Combat Balance
            </label>
            <div className="flex space-x-2">
              {(['light', 'moderate', 'heavy'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setParameters(prev => ({ ...prev, combatBalance: level }))}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    parameters.combatBalance === level
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Roleplay Balance
            </label>
            <div className="flex space-x-2">
              {(['light', 'moderate', 'heavy'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setParameters(prev => ({ ...prev, roleplayBalance: level }))}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    parameters.roleplayBalance === level
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Exploration Balance
            </label>
            <div className="flex space-x-2">
              {(['light', 'moderate', 'heavy'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setParameters(prev => ({ ...prev, explorationBalance: level }))}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    parameters.explorationBalance === level
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          value={parameters.specialRequests || ''}
          onChange={(e) => setParameters(prev => ({ ...prev, specialRequests: e.target.value }))}
          placeholder="Any specific elements you want included in your campaign..."
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none"
          rows={3}
        />
      </div>

      <Button
        onClick={handleGenerateCampaign}
        disabled={isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Campaign...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Campaign
          </>
        )}
      </Button>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="text-center py-12">
      <div className="mb-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Creating Your Campaign</h3>
      <p className="text-slate-600">
        AI is crafting a {parameters.duration}-hour adventure for your party...
      </p>
      <div className="mt-4 space-y-2 text-sm text-slate-500">
        <p>✨ Designing encounters and plot hooks</p>
        <p>🎭 Creating NPCs and locations</p>
        <p>⚔️ Balancing difficulty and pacing</p>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      {generatedCampaign && (
        <>
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{generatedCampaign.title}</h3>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">Generated</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-700">Duration:</span>
                <span className="ml-2 text-slate-600">{generatedCampaign.parameters.duration} hours</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Players:</span>
                <span className="ml-2 text-slate-600">{generatedCampaign.parameters.playerCount} level {generatedCampaign.parameters.characterLevel}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Encounters:</span>
                <span className="ml-2 text-slate-600">{generatedCampaign.encounters.length}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">NPCs:</span>
                <span className="ml-2 text-slate-600">{generatedCampaign.npcs.length}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleUseCampaign}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Use This Campaign
            </Button>
            
            <Button
              onClick={() => setCurrentStep('chat')}
              variant="outline"
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Refine Campaign
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center">
            Click "Use This Campaign" to insert into your document, or "Refine Campaign" to make adjustments.
          </div>
        </>
      )}
    </div>
  );

  const renderChatStep = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Refine Your Campaign</h3>
        <Button
          onClick={() => setCurrentStep('review')}
          variant="outline"
          size="sm"
        >
          Back to Review
        </Button>
      </div>

      {/* Two-panel layout: Campaign Content + Chat */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel: Campaign Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <ScrollText className="w-4 h-4 text-slate-600" />
            <h4 className="font-medium text-slate-900">Campaign Content</h4>
          </div>
          
          <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden">
            <div className="h-full overflow-y-auto p-4 prose prose-sm max-w-none">
              {displayedCampaignHtml ? (
                <div 
                  className={`space-y-6 transition-all duration-500 ${
                    generatedCampaign?.lastRefinedAt ? 'ring-2 ring-green-200 bg-green-50/30 rounded-lg p-4' : ''
                  }`}
                  dangerouslySetInnerHTML={{ __html: displayedCampaignHtml }}
                />
              ) : generatedCampaign && (
                <div 
                  className={`space-y-6 transition-all duration-500 ${
                    generatedCampaign.lastRefinedAt ? 'ring-2 ring-green-200 bg-green-50/30 rounded-lg p-4' : ''
                  }`}
                >
                  {/* Campaign Title */}
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">{generatedCampaign.title}</h1>
                    <div className="text-sm text-slate-600">
                      {generatedCampaign.parameters.duration} hours • {generatedCampaign.parameters.playerCount} players (Level {generatedCampaign.parameters.characterLevel})
                    </div>
                  </div>

                  {/* Introduction */}
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Introduction</h2>
                    <p className="text-slate-700 leading-relaxed">{generatedCampaign.introduction}</p>
                  </div>

                  {/* Plot Hooks */}
                  {generatedCampaign.plotHooks.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-2">Plot Hooks</h2>
                      <ul className="space-y-2">
                        {generatedCampaign.plotHooks.map((hook, index) => (
                          <li key={index} className="text-slate-700 leading-relaxed">
                            • {hook}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Encounters */}
                  {generatedCampaign.encounters.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-3">Encounters</h2>
                      <div className="space-y-4">
                        {generatedCampaign.encounters
                          .sort((a, b) => a.order - b.order)
                          .map((encounter) => (
                            <div key={encounter.id} className="border border-slate-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-slate-900">{encounter.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <span className="capitalize px-2 py-1 bg-slate-100 rounded">
                                    {encounter.type}
                                  </span>
                                  <span>{encounter.estimatedDuration} min</span>
                                </div>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{encounter.description}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* NPCs */}
                  {generatedCampaign.npcs.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-3">NPCs</h2>
                      <div className="space-y-3">
                        {generatedCampaign.npcs.map((npc) => (
                          <div key={npc.id} className="border border-slate-200 rounded-lg p-3">
                            <h3 className="font-semibold text-slate-900 mb-1">{npc.name}</h3>
                            <div className="text-sm text-slate-600 mb-2">
                              {npc.race} • {npc.role}
                            </div>
                            <p className="text-sm text-slate-700 mb-2">
                              <strong>Personality:</strong> {npc.personality}
                            </p>
                            <p className="text-sm text-slate-700 mb-2">
                              <strong>Motivation:</strong> {npc.motivation}
                            </p>
                            <p className="text-sm text-slate-700">{npc.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {generatedCampaign.locations.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-3">Locations</h2>
                      <div className="space-y-3">
                        {generatedCampaign.locations.map((location) => (
                          <div key={location.id} className="border border-slate-200 rounded-lg p-3">
                            <h3 className="font-semibold text-slate-900 mb-1">{location.name}</h3>
                            <div className="text-sm text-slate-600 mb-2">{location.type}</div>
                            <p className="text-sm text-slate-700">{location.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stat Blocks */}
                  {generatedCampaign.statBlocks && generatedCampaign.statBlocks.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-3">Stat Blocks</h2>
                      <div className="space-y-4">
                        {generatedCampaign.statBlocks.map((statBlock) => (
                          <div key={statBlock.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-slate-900">{statBlock.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="capitalize px-2 py-1 bg-slate-100 rounded">
                                  {statBlock.type}
                                </span>
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                  CR {statBlock.challengeRating}
                                </span>
                                {statBlock.aideddUrl && (
                                  <a 
                                    href={statBlock.aideddUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    View on AideDD
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            {/* Display stat block content */}
                            <div className="stat-block-container bg-white border rounded-lg p-4">
                              {statBlock.stats.includes('<div class="stat-block">') ? (
                                <div 
                                  dangerouslySetInnerHTML={{ __html: statBlock.stats }}
                                  className="stat-block-content"
                                />
                              ) : (
                                <div className="text-sm text-slate-700 font-mono whitespace-pre-wrap">
                                  {statBlock.stats}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Handouts */}
                  {generatedCampaign.handouts && generatedCampaign.handouts.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-3">Handouts & Resources</h2>
                      <div className="space-y-4">
                        {generatedCampaign.handouts.map((handout, index) => (
                          <div key={index} className="border border-slate-200 rounded-lg p-4">
                            <div className="text-sm text-slate-700 whitespace-pre-wrap bg-amber-50 p-3 rounded border border-amber-200">
                              {handout}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conclusion */}
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Conclusion</h2>
                    <p className="text-slate-700 leading-relaxed">{generatedCampaign.conclusion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="w-80 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <h4 className="font-medium text-slate-900">Refinement Chat</h4>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === 'user' ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <Bot className="w-3 h-3" />
                        )}
                        <span className="text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isRefining && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-900 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-sm">Refining...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-slate-200 p-3">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefinementChat()}
                    placeholder="What would you like to change?"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isRefining}
                  />
                  <Button
                    onClick={handleRefinementChat}
                    disabled={!chatInput.trim() || isRefining}
                    size="sm"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Example: "Make encounter 2 harder"
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-3">
            <Button
              onClick={handleUseCampaign}
              className="w-full"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Use Refined Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="border-b border-slate-200 p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-slate-900">Campaign Generator</h2>
        </div>
        <p className="text-sm text-slate-600">
          Create a complete D&D campaign in minutes with AI assistance
        </p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {currentStep === 'parameters' && renderParametersStep()}
        {currentStep === 'generating' && renderGeneratingStep()}
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'chat' && renderChatStep()}
      </div>
    </div>
  );
} 