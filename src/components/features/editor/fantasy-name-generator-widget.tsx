import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  fantasyNameGeneratorService, 
  type DNDRace, 
  type DNDProfession, 
  type GeneratedName 
} from '@/services/ai/fantasy-name-generator';

interface FantasyNameGeneratorWidgetProps {
  onInsert?: (name: string) => void;
  onClose?: () => void;
}

const RACES: DNDRace[] = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn',
  'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling', 'Aarakocra',
  'Aasimar', 'Bugbear', 'Firbolg', 'Genasi', 'Githyanki',
  'Githzerai', 'Goblin', 'Goliath', 'Hobgoblin', 'Kenku',
  'Kobold', 'Lizardfolk', 'Orc', 'Tabaxi', 'Triton',
  'Yuan-Ti-Pureblood'
];

const PROFESSIONS: DNDProfession[] = [
  'Innkeeper', 'Guard', 'Noble', 'Merchant', 'Blacksmith',
  'Priest', 'Scholar', 'Farmer', 'Hunter', 'Sailor',
  'Soldier', 'Thief', 'Bard', 'Wizard', 'Healer',
  'Cook', 'Tailor', 'Mason', 'Miner', 'Scribe',
  'Librarian', 'Diplomat', 'Spy', 'Assassin', 'Bandit'
];

export default function FantasyNameGeneratorWidget({ 
  onInsert, 
  onClose 
}: FantasyNameGeneratorWidgetProps) {
  const [selectedRace, setSelectedRace] = useState<DNDRace>('Human');
  const [selectedProfession, setSelectedProfession] = useState<DNDProfession | ''>('');
  const [nameCount, setNameCount] = useState(5);
  const [nameStyle, setNameStyle] = useState<'traditional' | 'unique' | 'common'>('traditional');
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateNames = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const request: any = {
        race: selectedRace,
        count: nameCount,
        style: nameStyle
      };
      
      if (selectedProfession) {
        request.profession = selectedProfession;
      }
      
      const names = await fantasyNameGeneratorService.generateFantasyNames(request);

      setGeneratedNames(names);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate names');
      console.error('Error generating names:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedRace, selectedProfession, nameCount, nameStyle]);

  const handleInsertName = useCallback((name: string) => {
    if (onInsert) {
      onInsert(name);
    } else {
      // Copy to clipboard as fallback
      navigator.clipboard.writeText(name).then(() => {
        // Could add a toast notification here
        console.log(`Copied "${name}" to clipboard`);
      });
    }
  }, [onInsert]);

  const handleGenerateVariations = useCallback(async (name: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const variations = await fantasyNameGeneratorService.generateNameVariations(
        name, 
        selectedRace, 
        3
      );

      // Add variations to the current list
      const variationNames: GeneratedName[] = variations.map(variation => {
        const nameData: GeneratedName = {
          name: variation,
          race: selectedRace,
          meaning: `Variation of ${name}`
        };
        
        if (selectedProfession) {
          nameData.profession = selectedProfession;
        }
        
        return nameData;
      });

      setGeneratedNames(prev => [...prev, ...variationNames]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate variations');
      console.error('Error generating variations:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedRace, selectedProfession]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Fantasy Name Generator</h2>
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

      <Card className="p-6">
        <div className="space-y-4">
          {/* Race Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Race
            </label>
            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value as DNDRace)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {RACES.map(race => (
                <option key={race} value={race}>{race}</option>
              ))}
            </select>
          </div>

          {/* Profession Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profession (Optional)
            </label>
            <select
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value as DNDProfession | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Profession</option>
              {PROFESSIONS.map(profession => (
                <option key={profession} value={profession}>{profession}</option>
              ))}
            </select>
          </div>

          {/* Name Count and Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Names
              </label>
              <select
                value={nameCount}
                onChange={(e) => setNameCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 names</option>
                <option value={5}>5 names</option>
                <option value={8}>8 names</option>
                <option value={10}>10 names</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={nameStyle}
                onChange={(e) => setNameStyle(e.target.value as 'traditional' | 'unique' | 'common')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="traditional">Traditional</option>
                <option value="unique">Unique</option>
                <option value="common">Common</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateNames}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGenerating ? 'Generating Names...' : 'Generate Names'}
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Generated Names Display */}
      {generatedNames.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Generated Names ({generatedNames.length})
          </h3>
          <div className="space-y-3">
            {generatedNames.map((nameData, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{nameData.name}</div>
                  {nameData.meaning && (
                    <div className="text-sm text-gray-600 mt-1">{nameData.meaning}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {nameData.race}{nameData.profession && ` • ${nameData.profession}`}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateVariations(nameData.name)}
                    disabled={isGenerating}
                    className="text-xs"
                  >
                    Variations
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleInsertName(nameData.name)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    {onInsert ? 'Insert' : 'Copy'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Clear Results Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setGeneratedNames([])}
              className="w-full"
            >
              Clear Results
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 