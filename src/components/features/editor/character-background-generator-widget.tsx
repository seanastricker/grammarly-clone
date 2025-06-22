import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { 
  characterBackgroundGeneratorService,
  type CharacterBackgroundRequest,
  type GeneratedCharacterBackground,
  type DNDClass,
  type DNDBackground,
  type DNDAlignment,
  type GenerationStyle,
  type BackgroundTheme,
  type BackgroundTone,
  type BackgroundSetting,
  type RefinementRequest
} from '@/services/ai/character-background-generator';
import { DNDRace } from '@/services/ai/fantasy-name-generator';

interface CharacterBackgroundGeneratorWidgetProps {
  onInsert?: (content: string) => void;
  onClose?: () => void;
}

const DND_RACES: DNDRace[] = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn',
  'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling', 'Aarakocra',
  'Aasimar', 'Bugbear', 'Firbolg', 'Genasi', 'Githyanki',
  'Githzerai', 'Goblin', 'Goliath', 'Hobgoblin', 'Kenku',
  'Kobold', 'Lizardfolk', 'Orc', 'Tabaxi', 'Triton',
  'Yuan-Ti-Pureblood'
];

const DND_CLASSES: DNDClass[] = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard',
  'Artificer', 'Blood Hunter', 'Custom'
];

const DND_BACKGROUNDS: DNDBackground[] = [
  'Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier',
  'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander', 'Sailor',
  'Anthropologist', 'Archaeologist', 'City Watch', 'Clan Crafter', 'Cloistered Scholar',
  'Courtier', 'Faction Agent', 'Far Traveler', 'Inheritor', 'Knight of the Order',
  'Mercenary Veteran', 'Urban Bounty Hunter', 'Uthgardt Tribe Member', 'Waterdhavian Noble',
  'Custom'
];

const DND_ALIGNMENTS: DNDAlignment[] = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];


const THEMES: BackgroundTheme[] = ['heroic', 'tragic', 'mysterious', 'comedic', 'dark', 'ordinary', 'exotic'];
const TONES: BackgroundTone[] = ['serious', 'lighthearted', 'dramatic', 'gritty', 'optimistic', 'melancholic'];
const SETTINGS: BackgroundSetting[] = ['urban', 'rural', 'wilderness', 'noble-court', 'criminal-underworld', 'scholarly', 'military', 'religious', 'magical', 'custom'];

export default function CharacterBackgroundGeneratorWidget({ 
  onInsert, 
  onClose 
}: CharacterBackgroundGeneratorWidgetProps) {
  // Form state
  const [currentStep, setCurrentStep] = useState<'setup' | 'options' | 'generate' | 'results'>('setup');
  const [formData, setFormData] = useState<Partial<CharacterBackgroundRequest>>({
    race: 'Human',
    characterClass: 'Fighter',
    background: 'Folk Hero',
    characterLevel: 1,
    theme: 'heroic',
    tone: 'serious',
    setting: 'rural',
    includeSecrets: true,
    includePlotHooks: true,
    includeRelationships: true,
    includeMechanicalElements: true
  });

  // Generation state
  const [generatedBackground, setGeneratedBackground] = useState<GeneratedCharacterBackground | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Form validation
  const isSetupValid = useMemo(() => {
    return formData.race && formData.characterClass && formData.background && formData.characterLevel;
  }, [formData.race, formData.characterClass, formData.background, formData.characterLevel]);

  const isOptionsValid = useMemo(() => {
    return formData.theme && formData.tone && formData.setting;
  }, [formData.theme, formData.tone, formData.setting]);

  const handleFormChange = useCallback((field: keyof CharacterBackgroundRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!isSetupValid || !isOptionsValid) {
      setError('Please complete all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request = { ...formData, generationStyle: 'detailed' as GenerationStyle } as CharacterBackgroundRequest;
      const background = await characterBackgroundGeneratorService.generateCharacterBackground(request);
      setGeneratedBackground(background);
      setCurrentStep('results');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate background');
      console.error('Error generating background:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [formData, isSetupValid, isOptionsValid]);

  const handleRefinement = useCallback(async (refinementType: RefinementRequest['requestType'], description: string) => {
    if (!generatedBackground) return;

    setIsGenerating(true);
    setError(null);

    try {
      const refinementRequest: RefinementRequest = {
        backgroundId: generatedBackground.id,
        requestType: refinementType,
        description
      };

      const refinedBackground = await characterBackgroundGeneratorService.refineCharacterBackground(
        generatedBackground,
        refinementRequest
      );

      setGeneratedBackground(refinedBackground);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refine background');
      console.error('Error refining background:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generatedBackground]);

  // Helper functions to format individual sections consistently
  const formatIndividualSection = (sectionType: string, background: GeneratedCharacterBackground): string => {
    switch (sectionType) {
      case 'overview':
        return `## Overview\n\n### Character Concept\n\n${background.characterConcept}\n\n### Background Summary\n\n${background.backgroundSummary}\n\n`;
      
      case 'history':
        return `## History\n\n### Early Life\n\n${background.personalHistory.earlyLife}\n\n### Formative Events\n\n${background.personalHistory.formativeEvents}\n\n### Recent Past\n\n${background.personalHistory.recentPast}\n\n### How They Became Their Class\n\n${background.personalHistory.howTheyBecameTheirClass}\n\n`;
      
      case 'personality':
        return `## Personality\n\n### Personality Traits\n\n${formatList(background.personalityTraits)}\n### Ideals\n\n${formatList(background.ideals)}\n### Bonds\n\n${formatList(background.bonds)}\n### Flaws\n\n${formatList(background.flaws)}\n`;
      
      case 'goals':
        let goalsContent = `## Goals & Motivations\n\n### Primary Motivation\n\n${background.motivations.primary}\n\n`;
        if (background.motivations.secondary.length > 0) {
          goalsContent += `### Secondary Motivations\n\n${formatList(background.motivations.secondary)}\n`;
        }
        goalsContent += `### Life Goal\n\n${background.goals.lifeGoal}\n\n`;
        if (background.goals.shortTerm.length > 0) {
          goalsContent += `### Short-Term Goals\n\n${formatList(background.goals.shortTerm)}\n`;
        }
        if (background.goals.longTerm.length > 0) {
          goalsContent += `### Long-Term Goals\n\n${formatList(background.goals.longTerm)}\n`;
        }
        return goalsContent;
      
      case 'secrets':
        if (!background.secrets || background.secrets.length === 0) return '';
        let secretsContent = `## Secrets\n\n`;
        background.secrets.forEach((secret, index) => {
          secretsContent += `### Secret ${index + 1} (${secret.severity.charAt(0).toUpperCase() + secret.severity.slice(1)})\n\n${secret.description}\n\n**Potential Consequences:** ${secret.potentialConsequences}\n\n`;
        });
        return secretsContent;
      
      case 'hooks':
        if (!background.plotHooks || background.plotHooks.length === 0) return '';
        let hooksContent = `## Plot Hooks\n\n`;
        background.plotHooks.forEach((hook, index) => {
          hooksContent += `### ${hook.title} (${hook.urgency.charAt(0).toUpperCase() + hook.urgency.slice(1)} Urgency)\n\n${hook.description}\n\n**DM Guidance:** ${hook.dmGuidance}\n\n`;
          if (hook.potentialOutcomes.length > 0) {
            hooksContent += `**Potential Outcomes:**\n${formatList(hook.potentialOutcomes)}\n`;
          }
        });
        return hooksContent;
      
      case 'relationships':
        if (!background.relationships || background.relationships.length === 0) return '';
        let relationshipsContent = `## Relationships\n\n`;
        background.relationships.forEach((relationship, index) => {
          relationshipsContent += `### ${relationship.name} (${relationship.relationship.charAt(0).toUpperCase() + relationship.relationship.slice(1)}, ${relationship.importance.charAt(0).toUpperCase() + relationship.importance.slice(1)})\n\n${relationship.description}\n\n**Status:** ${relationship.currentStatus.charAt(0).toUpperCase() + relationship.currentStatus.slice(1)}\n\n**Plot Potential:** ${relationship.plotPotential}\n\n`;
        });
        return relationshipsContent;
      
      case 'mechanics':
        if (!background.mechanicalElements || background.mechanicalElements.length === 0) return '';
        let mechanicsContent = `## Mechanics\n\n`;
        background.mechanicalElements.forEach((element, index) => {
          mechanicsContent += `### ${element.name} (${element.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')})\n\n${element.description}\n\n`;
          if (element.gameEffect) {
            mechanicsContent += `**Game Effect:** ${element.gameEffect}\n\n`;
          }
          mechanicsContent += `**Source:** ${element.source.charAt(0).toUpperCase() + element.source.slice(1)}\n\n`;
        });
        return mechanicsContent;
      
      case 'additional':
        if ((!background.mannerisms || background.mannerisms.length === 0) && 
            (!background.fears || background.fears.length === 0) && 
            (!background.possessions || background.possessions.length === 0)) return '';
        let additionalContent = `## Additional Details\n\n`;
        if (background.mannerisms && background.mannerisms.length > 0) {
          additionalContent += `### Mannerisms\n\n${formatList(background.mannerisms)}\n`;
        }
        if (background.fears && background.fears.length > 0) {
          additionalContent += `### Fears\n\n${formatList(background.fears)}\n`;
        }
        if (background.possessions && background.possessions.length > 0) {
          additionalContent += `### Notable Possessions\n\n${formatList(background.possessions)}\n`;
        }
        return additionalContent;
      
      default:
        return '';
    }
  };

  const handleInsertSection = useCallback((sectionType: string, sectionName: string) => {
    if (!generatedBackground) return;
    
    const formattedContent = formatIndividualSection(sectionType, generatedBackground);
    if (onInsert) {
      onInsert(formattedContent);
    } else {
      navigator.clipboard.writeText(formattedContent).then(() => {
        console.log(`Copied ${sectionName} to clipboard`);
      });
    }
  }, [generatedBackground, onInsert]);

  const handleInsertSubsection = useCallback((subsectionKey: string, subsectionName: string, content: string | string[]) => {
    if (!generatedBackground) return;
    
    // Format individual subsection content
    let formattedContent = '';
    
    if (Array.isArray(content)) {
      // Handle arrays (like personality traits, goals, etc.)
      formattedContent = `### ${subsectionName}\n\n${formatList(content)}\n\n`;
    } else {
      // Handle simple text content
      formattedContent = `### ${subsectionName}\n\n${content}\n\n`;
    }
    
    if (onInsert) {
      onInsert(formattedContent);
    } else {
      navigator.clipboard.writeText(formattedContent).then(() => {
        console.log(`Copied ${subsectionName} to clipboard`);
      });
    }
  }, [generatedBackground, onInsert]);

  const handleInsertComplexSubsection = useCallback((title: string, contentData: any, type: 'secret' | 'hook' | 'relationship' | 'mechanic') => {
    if (!generatedBackground) return;
    
    let formattedContent = `### ${title}\n\n`;
    
    switch (type) {
      case 'secret':
        formattedContent += `${contentData.description}\n\n**Potential Consequences:** ${contentData.potentialConsequences}\n\n`;
        break;
      case 'hook':
        formattedContent += `${contentData.description}\n\n**DM Guidance:** ${contentData.dmGuidance}\n\n`;
        if (contentData.potentialOutcomes && contentData.potentialOutcomes.length > 0) {
          formattedContent += `**Potential Outcomes:**\n${formatList(contentData.potentialOutcomes)}\n`;
        }
        break;
      case 'relationship':
        formattedContent += `${contentData.description}\n\n**Status:** ${contentData.currentStatus}\n\n**Plot Potential:** ${contentData.plotPotential}\n\n`;
        break;
      case 'mechanic':
        formattedContent += `${contentData.description}\n\n`;
        if (contentData.gameEffect) {
          formattedContent += `**Game Effect:** ${contentData.gameEffect}\n\n`;
        }
        formattedContent += `**Source:** ${contentData.source}\n\n`;
        break;
    }
    
    if (onInsert) {
      onInsert(formattedContent);
    } else {
      navigator.clipboard.writeText(formattedContent).then(() => {
        console.log(`Copied ${title} to clipboard`);
      });
    }
  }, [generatedBackground, onInsert]);

  const handleInsertFullBackground = useCallback(() => {
    if (!generatedBackground) return;

    const formattedBackground = formatFullBackground(generatedBackground);
    if (onInsert) {
      onInsert(formattedBackground);
    } else {
      navigator.clipboard.writeText(formattedBackground);
    }
  }, [generatedBackground, onInsert]);

  // Render functions for different steps
  const renderSetupStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Character Basics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Race *
          </label>
          <select
            value={formData.race || ''}
            onChange={(e) => handleFormChange('race', e.target.value as DNDRace)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DND_RACES.map(race => (
              <option key={race} value={race}>{race}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class *
          </label>
          <select
            value={formData.characterClass || ''}
            onChange={(e) => handleFormChange('characterClass', e.target.value as DNDClass)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DND_CLASSES.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background *
          </label>
          <select
            value={formData.background || ''}
            onChange={(e) => handleFormChange('background', e.target.value as DNDBackground)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DND_BACKGROUNDS.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Character Level *
          </label>
          <select
            value={formData.characterLevel || 1}
            onChange={(e) => handleFormChange('characterLevel', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
              <option key={level} value={level}>Level {level}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alignment (Optional)
        </label>
        <select
          value={formData.alignment || ''}
          onChange={(e) => handleFormChange('alignment', e.target.value as DNDAlignment)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any Alignment</option>
          {DND_ALIGNMENTS.map(alignment => (
            <option key={alignment} value={alignment}>{alignment}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderOptionsStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Generation Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Style & Tone</h4>
          <div className="space-y-4">


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={formData.theme || ''}
                onChange={(e) => handleFormChange('theme', e.target.value as BackgroundTheme)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {THEMES.map(theme => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={formData.tone || ''}
                onChange={(e) => handleFormChange('tone', e.target.value as BackgroundTone)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TONES.map(tone => (
                  <option key={tone} value={tone}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Content Options</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Setting
              </label>
              <select
                value={formData.setting || ''}
                onChange={(e) => handleFormChange('setting', e.target.value as BackgroundSetting)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SETTINGS.map(setting => (
                  <option key={setting} value={setting}>
                    {setting.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {formData.setting === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Setting
                </label>
                <input
                  type="text"
                  value={formData.customSetting || ''}
                  onChange={(e) => handleFormChange('customSetting', e.target.value)}
                  placeholder="Describe your custom setting..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeSecrets || false}
                  onChange={(e) => handleFormChange('includeSecrets', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include character secrets</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includePlotHooks || false}
                  onChange={(e) => handleFormChange('includePlotHooks', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include plot hooks for DM</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeRelationships || false}
                  onChange={(e) => handleFormChange('includeRelationships', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include NPC relationships</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeMechanicalElements || false}
                  onChange={(e) => handleFormChange('includeMechanicalElements', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include mechanical elements</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Requirements (Optional)
        </label>
        <textarea
          value={formData.customRequirements || ''}
          onChange={(e) => handleFormChange('customRequirements', e.target.value)}
          placeholder="Any specific requirements or preferences for the background..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderGenerateStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Review & Generate</h3>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Character Summary</h4>
        <p className="text-sm text-gray-700">
          <strong>Race:</strong> {formData.race} | 
          <strong> Class:</strong> {formData.characterClass} | 
          <strong> Background:</strong> {formData.background} | 
          <strong> Level:</strong> {formData.characterLevel}
          {formData.alignment && <span> | <strong>Alignment:</strong> {formData.alignment}</span>}
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Theme:</strong> {formData.theme} | 
          <strong> Tone:</strong> {formData.tone} | 
          <strong> Setting:</strong> {formData.setting === 'custom' ? formData.customSetting : formData.setting}
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What will be generated?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Character concept and background summary</li>
          <li>• Detailed personal history</li>
          <li>• D&D 5e personality traits, ideals, bonds, and flaws</li>
          <li>• Motivations and goals</li>
          {formData.includeSecrets && <li>• Character secrets</li>}
          {formData.includePlotHooks && <li>• Plot hooks for the DM</li>}
          {formData.includeRelationships && <li>• Important NPC relationships</li>}
          {formData.includeMechanicalElements && <li>• Mechanical elements from background</li>}
          <li>• Additional flavor (mannerisms, fears, possessions)</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );

  const renderResultsStep = () => {
    if (!generatedBackground) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Generated Background</h3>
          <div className="flex space-x-2">
            <Button
              onClick={handleInsertFullBackground}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Insert Full Background
            </Button>
            <Button
              onClick={() => setCurrentStep('setup')}
              variant="outline"
            >
              Generate New
            </Button>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto overflow-y-hidden">
              <nav className="-mb-px flex space-x-8 min-w-max">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'history', label: 'History' },
                  { id: 'personality', label: 'Personality' },
                  { id: 'goals', label: 'Goals & Motivations' },
                  ...(generatedBackground.secrets ? [{ id: 'secrets', label: 'Secrets' }] : []),
                  ...(generatedBackground.plotHooks ? [{ id: 'hooks', label: 'Plot Hooks' }] : []),
                  ...(generatedBackground.relationships ? [{ id: 'relationships', label: 'Relationships' }] : []),
                  ...(generatedBackground.mechanicalElements ? [{ id: 'mechanics', label: 'Mechanics' }] : [])
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`${
                      activeSection === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm flex-shrink-0`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="mt-6">
            {renderBackgroundSection(activeSection, generatedBackground)}
          </div>
        </Tabs>
      </div>
    );
  };

  const renderBackgroundSection = (section: string, background: GeneratedCharacterBackground) => {
    const SectionCard = ({ title, content, actions, sectionType, onInsertClick }: { 
      title: string; 
      content: React.ReactNode; 
      actions?: React.ReactNode;
      sectionType?: string;
      onInsertClick?: () => void;
    }) => (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <div className="flex space-x-2">
            {actions}
            <Button
              size="sm"
              variant="outline"
              onClick={onInsertClick || (() => handleInsertSection(
                sectionType || section,
                title
              ))}
            >
              Insert
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-700">
          {content}
        </div>
      </Card>
    );

    switch (section) {
      case 'overview':
        return (
          <div className="space-y-4">
            <SectionCard
              title="Character Concept"
              content={background.characterConcept}
              onInsertClick={() => handleInsertSubsection('characterConcept', 'Character Concept', background.characterConcept)}
            />
            <SectionCard
              title="Background Summary"
              content={background.backgroundSummary}
              onInsertClick={() => handleInsertSubsection('backgroundSummary', 'Background Summary', background.backgroundSummary)}
            />
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4">
            <SectionCard
              title="Early Life"
              content={background.personalHistory.earlyLife}
              onInsertClick={() => handleInsertSubsection('earlyLife', 'Early Life', background.personalHistory.earlyLife)}
            />
            <SectionCard
              title="Formative Events"
              content={background.personalHistory.formativeEvents}
              onInsertClick={() => handleInsertSubsection('formativeEvents', 'Formative Events', background.personalHistory.formativeEvents)}
            />
            <SectionCard
              title="Recent Past"
              content={background.personalHistory.recentPast}
              onInsertClick={() => handleInsertSubsection('recentPast', 'Recent Past', background.personalHistory.recentPast)}
            />
            <SectionCard
              title="How They Became Their Class"
              content={background.personalHistory.howTheyBecameTheirClass}
              onInsertClick={() => handleInsertSubsection('howTheyBecameTheirClass', 'How They Became Their Class', background.personalHistory.howTheyBecameTheirClass)}
            />
          </div>
        );

      case 'personality':
        return (
          <div className="space-y-4">
            <SectionCard
              title="Personality Traits"
              content={
                <ul className="list-disc list-inside space-y-1">
                  {background.personalityTraits.map((trait, index) => (
                    <li key={index}>{trait}</li>
                  ))}
                </ul>
              }
              onInsertClick={() => handleInsertSubsection('personalityTraits', 'Personality Traits', background.personalityTraits)}
            />
            <SectionCard
              title="Ideals"
              content={
                <ul className="list-disc list-inside space-y-1">
                  {background.ideals.map((ideal, index) => (
                    <li key={index}>{ideal}</li>
                  ))}
                </ul>
              }
              onInsertClick={() => handleInsertSubsection('ideals', 'Ideals', background.ideals)}
            />
            <SectionCard
              title="Bonds"
              content={
                <ul className="list-disc list-inside space-y-1">
                  {background.bonds.map((bond, index) => (
                    <li key={index}>{bond}</li>
                  ))}
                </ul>
              }
              onInsertClick={() => handleInsertSubsection('bonds', 'Bonds', background.bonds)}
            />
            <SectionCard
              title="Flaws"
              content={
                <ul className="list-disc list-inside space-y-1">
                  {background.flaws.map((flaw, index) => (
                    <li key={index}>{flaw}</li>
                  ))}
                </ul>
              }
              onInsertClick={() => handleInsertSubsection('flaws', 'Flaws', background.flaws)}
            />
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-4">
            <SectionCard
              title="Primary Motivation"
              content={background.motivations.primary}
              onInsertClick={() => handleInsertSubsection('primaryMotivation', 'Primary Motivation', background.motivations.primary)}
            />
            {background.motivations.secondary.length > 0 && (
              <SectionCard
                title="Secondary Motivations"
                content={
                  <ul className="list-disc list-inside space-y-1">
                    {background.motivations.secondary.map((motivation, index) => (
                      <li key={index}>{motivation}</li>
                    ))}
                  </ul>
                }
                onInsertClick={() => handleInsertSubsection('secondaryMotivations', 'Secondary Motivations', background.motivations.secondary)}
              />
            )}
            <SectionCard
              title="Life Goal"
              content={background.goals.lifeGoal}
              onInsertClick={() => handleInsertSubsection('lifeGoal', 'Life Goal', background.goals.lifeGoal)}
            />
            {background.goals.shortTerm.length > 0 && (
              <SectionCard
                title="Short-term Goals"
                content={
                  <ul className="list-disc list-inside space-y-1">
                    {background.goals.shortTerm.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                }
                onInsertClick={() => handleInsertSubsection('shortTermGoals', 'Short-term Goals', background.goals.shortTerm)}
              />
            )}
            {background.goals.longTerm.length > 0 && (
              <SectionCard
                title="Long-term Goals"
                content={
                  <ul className="list-disc list-inside space-y-1">
                    {background.goals.longTerm.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                }
                onInsertClick={() => handleInsertSubsection('longTermGoals', 'Long-term Goals', background.goals.longTerm)}
              />
            )}
          </div>
        );

      case 'secrets':
        return background.secrets ? (
          <div className="space-y-4">
            {background.secrets.map((secret, index) => (
              <SectionCard
                key={index}
                title={`Secret ${index + 1} (${secret.type}, ${secret.severity})`}
                content={
                  <div>
                    <p className="mb-2">{secret.description}</p>
                    <p className="text-xs text-gray-500">
                      <strong>Potential Consequences:</strong> {secret.potentialConsequences}
                    </p>
                  </div>
                }
                onInsertClick={() => handleInsertComplexSubsection(`Secret ${index + 1} (${secret.severity.charAt(0).toUpperCase() + secret.severity.slice(1)})`, secret, 'secret')}
              />
            ))}
          </div>
        ) : null;

      case 'hooks':
        return background.plotHooks ? (
          <div className="space-y-4">
            {background.plotHooks.map((hook, index) => (
              <SectionCard
                key={index}
                title={`${hook.title} (${hook.type}, ${hook.urgency} urgency)`}
                content={
                  <div>
                    <p className="mb-2">{hook.description}</p>
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>DM Guidance:</strong> {hook.dmGuidance}
                    </p>
                    {hook.potentialOutcomes.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <strong>Potential Outcomes:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {hook.potentialOutcomes.map((outcome, i) => (
                            <li key={i}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                }
                onInsertClick={() => handleInsertComplexSubsection(`${hook.title} (${hook.urgency.charAt(0).toUpperCase() + hook.urgency.slice(1)} Urgency)`, hook, 'hook')}
              />
            ))}
          </div>
        ) : null;

      case 'relationships':
        return background.relationships ? (
          <div className="space-y-4">
            {background.relationships.map((relationship, index) => (
              <SectionCard
                key={index}
                title={`${relationship.name} (${relationship.relationship}, ${relationship.importance})`}
                content={
                  <div>
                    <p className="mb-2">{relationship.description}</p>
                    <p className="text-xs text-gray-600 mb-1">
                      <strong>Status:</strong> {relationship.currentStatus}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Plot Potential:</strong> {relationship.plotPotential}
                    </p>
                  </div>
                }
                onInsertClick={() => handleInsertComplexSubsection(`${relationship.name} (${relationship.relationship.charAt(0).toUpperCase() + relationship.relationship.slice(1)}, ${relationship.importance.charAt(0).toUpperCase() + relationship.importance.slice(1)})`, relationship, 'relationship')}
              />
            ))}
          </div>
        ) : null;

      case 'mechanics':
        return background.mechanicalElements ? (
          <div className="space-y-4">
            {background.mechanicalElements.map((element, index) => (
              <SectionCard
                key={index}
                title={`${element.name} (${element.type})`}
                content={
                  <div>
                    <p className="mb-2">{element.description}</p>
                    {element.gameEffect && (
                      <p className="text-xs text-gray-600">
                        <strong>Game Effect:</strong> {element.gameEffect}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Source:</strong> {element.source}
                    </p>
                  </div>
                }
                onInsertClick={() => handleInsertComplexSubsection(`${element.name} (${element.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')})`, element, 'mechanic')}
              />
            ))}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  // Helper function to format individual sections with consistent outline structure
  const formatSection = (sectionName: string, content: string): string => {
    return `## ${sectionName}\n\n${content}\n`;
  };

  const formatSubsection = (subsectionName: string, content: string): string => {
    return `### ${subsectionName}\n\n${content}\n\n`;
  };

  const formatList = (items: string[]): string => {
    return items.map(item => `• ${item}`).join('\n') + '\n';
  };

  // Helper function to format full background for insertion
  const formatFullBackground = (background: GeneratedCharacterBackground): string => {
    let content = '';
    
    // OVERVIEW SECTION
    content += `## Overview\n\n`;
    content += `### Character Concept\n\n${background.characterConcept}\n\n`;
    content += `### Background Summary\n\n${background.backgroundSummary}\n\n`;
    
    // HISTORY SECTION
    content += `## History\n\n`;
    content += `### Early Life\n\n${background.personalHistory.earlyLife}\n\n`;
    content += `### Formative Events\n\n${background.personalHistory.formativeEvents}\n\n`;
    content += `### Recent Past\n\n${background.personalHistory.recentPast}\n\n`;
    content += `### How They Became Their Class\n\n${background.personalHistory.howTheyBecameTheirClass}\n\n`;
    
    // PERSONALITY SECTION
    content += `## Personality\n\n`;
    content += `### Personality Traits\n\n${formatList(background.personalityTraits)}\n`;
    content += `### Ideals\n\n${formatList(background.ideals)}\n`;
    content += `### Bonds\n\n${formatList(background.bonds)}\n`;
    content += `### Flaws\n\n${formatList(background.flaws)}\n`;
    
    // GOALS & MOTIVATIONS SECTION
    content += `## Goals & Motivations\n\n`;
    content += `### Primary Motivation\n\n${background.motivations.primary}\n\n`;
    
    if (background.motivations.secondary.length > 0) {
      content += `### Secondary Motivations\n\n${formatList(background.motivations.secondary)}\n`;
    }
    
    content += `### Life Goal\n\n${background.goals.lifeGoal}\n\n`;
    
    if (background.goals.shortTerm.length > 0) {
      content += `### Short-Term Goals\n\n${formatList(background.goals.shortTerm)}\n`;
    }
    
    if (background.goals.longTerm.length > 0) {
      content += `### Long-Term Goals\n\n${formatList(background.goals.longTerm)}\n`;
    }
    
    // SECRETS SECTION (if included)
    if (background.secrets && background.secrets.length > 0) {
      content += `## Secrets\n\n`;
      background.secrets.forEach((secret, index) => {
        content += `### Secret ${index + 1} (${secret.severity.charAt(0).toUpperCase() + secret.severity.slice(1)})\n\n`;
        content += `${secret.description}\n\n`;
        content += `**Potential Consequences:** ${secret.potentialConsequences}\n\n`;
      });
    }
    
    // PLOT HOOKS SECTION (if included)
    if (background.plotHooks && background.plotHooks.length > 0) {
      content += `## Plot Hooks\n\n`;
      background.plotHooks.forEach((hook, index) => {
        content += `### ${hook.title} (${hook.urgency.charAt(0).toUpperCase() + hook.urgency.slice(1)} Urgency)\n\n`;
        content += `${hook.description}\n\n`;
        content += `**DM Guidance:** ${hook.dmGuidance}\n\n`;
        if (hook.potentialOutcomes.length > 0) {
          content += `**Potential Outcomes:**\n${formatList(hook.potentialOutcomes)}\n`;
        }
      });
    }
    
    // RELATIONSHIPS SECTION (if included)
    if (background.relationships && background.relationships.length > 0) {
      content += `## Relationships\n\n`;
      background.relationships.forEach((relationship, index) => {
        content += `### ${relationship.name} (${relationship.relationship.charAt(0).toUpperCase() + relationship.relationship.slice(1)}, ${relationship.importance.charAt(0).toUpperCase() + relationship.importance.slice(1)})\n\n`;
        content += `${relationship.description}\n\n`;
        content += `**Status:** ${relationship.currentStatus.charAt(0).toUpperCase() + relationship.currentStatus.slice(1)}\n\n`;
        content += `**Plot Potential:** ${relationship.plotPotential}\n\n`;
      });
    }
    
    // MECHANICS SECTION (if included)
    if (background.mechanicalElements && background.mechanicalElements.length > 0) {
      content += `## Mechanics\n\n`;
      background.mechanicalElements.forEach((element, index) => {
        content += `### ${element.name} (${element.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')})\n\n`;
        content += `${element.description}\n\n`;
        if (element.gameEffect) {
          content += `**Game Effect:** ${element.gameEffect}\n\n`;
        }
        content += `**Source:** ${element.source.charAt(0).toUpperCase() + element.source.slice(1)}\n\n`;
      });
    }
    
    // ADDITIONAL DETAILS SECTION (if any exist)
    if ((background.mannerisms && background.mannerisms.length > 0) || 
        (background.fears && background.fears.length > 0) || 
        (background.possessions && background.possessions.length > 0)) {
      content += `## Additional Details\n\n`;
      
      if (background.mannerisms && background.mannerisms.length > 0) {
        content += `### Mannerisms\n\n${formatList(background.mannerisms)}\n`;
      }
      
      if (background.fears && background.fears.length > 0) {
        content += `### Fears\n\n${formatList(background.fears)}\n`;
      }
      
      if (background.possessions && background.possessions.length > 0) {
        content += `### Notable Possessions\n\n${formatList(background.possessions)}\n`;
      }
    }
    
    return content;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Character Background Generator</h2>
        {onClose && (
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center space-x-4">
        {[
          { id: 'setup', label: 'Setup', step: 1 },
          { id: 'options', label: 'Options', step: 2 },
          { id: 'generate', label: 'Generate', step: 3 },
          { id: 'results', label: 'Results', step: 4 }
        ].map(({ id, label, step }) => (
          <div key={id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === id
                  ? 'bg-blue-600 text-white'
                  : (currentStep === 'results' && step <= 4) || 
                    (currentStep === 'generate' && step <= 3) || 
                    (currentStep === 'options' && step <= 2)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            <span className={`ml-2 text-sm ${
              currentStep === id ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {label}
            </span>
            {step < 4 && <div className="w-8 h-0.5 bg-gray-200 ml-4" />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {currentStep === 'setup' && renderSetupStep()}
        {currentStep === 'options' && renderOptionsStep()}  
        {currentStep === 'generate' && renderGenerateStep()}
        {currentStep === 'results' && renderResultsStep()}
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep === 'options') setCurrentStep('setup');
            else if (currentStep === 'generate') setCurrentStep('options');
            else if (currentStep === 'results') setCurrentStep('generate');
          }}
          disabled={currentStep === 'setup'}
        >
          Back
        </Button>

        <div className="space-x-2">
          {currentStep === 'setup' && (
            <Button
              onClick={() => setCurrentStep('options')}
              disabled={!isSetupValid}
            >
              Next: Options
            </Button>
          )}
          {currentStep === 'options' && (
            <Button
              onClick={() => setCurrentStep('generate')}
              disabled={!isOptionsValid}
            >
              Next: Review
            </Button>
          )}
          {currentStep === 'generate' && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !isSetupValid || !isOptionsValid}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? 'Generating...' : 'Generate Background'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 