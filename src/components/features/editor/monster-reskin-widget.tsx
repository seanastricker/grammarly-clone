import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { Open5eMonster, MonsterReSkin, MonsterSearchFilters } from '@/types/monster';
import { open5eApi } from '@/services/ai/open5e-api';
import { monsterReSkinService } from '@/services/ai/monster-reskin-service';

interface MonsterReSkinWidgetProps {
  onInsertContent: (content: string) => void;
  onClose: () => void;
}

export const MonsterReSkinWidget: React.FC<MonsterReSkinWidgetProps> = ({
  onInsertContent,
  onClose
}) => {
  const [step, setStep] = useState<'search' | 'customize' | 'results'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Open5eMonster[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<Open5eMonster | null>(null);
  const [customizations, setCustomizations] = useState({
    theme: '',
    environment: '',
    tone: 'mysterious' as const
  });
  const [generatedReSkins, setGeneratedReSkins] = useState<MonsterReSkin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

  const searchMonsters = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters: MonsterSearchFilters = {
        searchQuery: searchQuery.trim()
      };
      
      const response = await open5eApi.searchMonsters(filters);
      setSearchResults(response.results); // Remove limit to show all matching results
      setIsUsingFallbackData(response.results.length > 0 && response.results[0].slug === 'goblin'); // Detect if using mock data
    } catch (err) {
      setError('Failed to search monsters. Please try again.');
      console.error('Monster search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const loadCommonMonsters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const monsters = await open5eApi.getCommonMonsters();
      setSearchResults(monsters);
      setIsUsingFallbackData(monsters.length > 0 && monsters[0].slug === 'goblin'); // Detect if using mock data
    } catch (err) {
      setError('Failed to load common monsters. Please try again.');
      console.error('Common monsters error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectMonster = useCallback((monster: Open5eMonster) => {
    setSelectedMonster(monster);
    setStep('customize');
  }, []);

  const generateReSkins = useCallback(async () => {
    if (!selectedMonster) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const request: any = {
        monster: selectedMonster,
        tone: customizations.tone
      };
      
      if (customizations.theme) {
        request.theme = customizations.theme;
      }
      
      if (customizations.environment) {
        request.environment = customizations.environment;
      }
      
      const reSkins = await monsterReSkinService.generateMultipleReSkins(request, 3);
      
      setGeneratedReSkins(reSkins);
      setStep('results');
    } catch (err) {
      setError('Failed to generate re-skins. Please try again.');
      console.error('Re-skin generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonster, customizations]);

  const insertReSkin = useCallback((reSkin: MonsterReSkin) => {
    const formattedContent = monsterReSkinService.formatForExport(reSkin);
    onInsertContent(formattedContent);
    onClose();
  }, [onInsertContent, onClose]);

  // Search Step
  if (step === 'search') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Monster Re-skinning</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
        
        <p className="text-sm text-gray-600">
          Search for a D&D monster to create creative re-skins with different themes and environments.
        </p>
        
        <div className="flex gap-2">
          <Input
            placeholder="Search monsters (e.g., goblin, dragon, orc)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchMonsters()}
            className="flex-1"
          />
          <Button onClick={searchMonsters} disabled={isLoading || !searchQuery.trim()}>
            Search
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          onClick={loadCommonMonsters} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Loading...' : 'Browse All Monsters'}
        </Button>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {isUsingFallbackData && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Using sample monsters (API unavailable). Features work the same way!</span>
            </div>
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div className="text-sm text-gray-600 px-1">
            Found {searchResults.length} monster{searchResults.length !== 1 ? 's' : ''}
          </div>
        )}
        
        <div className="space-y-2 max-h-[40rem] overflow-y-auto">
          {searchResults.map((monster) => (
            <Card 
              key={monster.slug} 
              className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => selectMonster(monster)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{monster.name}</h4>
                  <p className="text-sm text-gray-600">
                    {monster.size} {monster.type} • CR {monster.challenge_rating}
                  </p>
                </div>
                <Button size="sm" variant="ghost">Select</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Customize Step
  if (step === 'customize') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Customize Re-skin</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
        
        {selectedMonster && (
          <Card className="p-3 bg-blue-50">
            <h4 className="font-medium">{selectedMonster.name}</h4>
            <p className="text-sm text-gray-600">
              {selectedMonster.size} {selectedMonster.type} • CR {selectedMonster.challenge_rating}
            </p>
          </Card>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Theme (Optional)</label>
            <Input
              placeholder="e.g., Horror, Steampunk, Fairy Tale"
              value={customizations.theme}
              onChange={(e) => setCustomizations(prev => ({ ...prev, theme: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Environment (Optional)</label>
            <Input
              placeholder="e.g., Underwater, Desert, Urban"
              value={customizations.environment}
              onChange={(e) => setCustomizations(prev => ({ ...prev, environment: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tone</label>
            <select
              value={customizations.tone}
              onChange={(e) => setCustomizations(prev => ({ ...prev, tone: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="dark">Dark</option>
              <option value="whimsical">Whimsical</option>
              <option value="horror">Horror</option>
              <option value="heroic">Heroic</option>
              <option value="mysterious">Mysterious</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('search')}>
            Back
          </Button>
          <Button 
            onClick={generateReSkins} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Generating...' : 'Generate Re-skins'}
          </Button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Results Step
  if (step === 'results') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Re-skins</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {generatedReSkins.map((reSkin) => (
            <Card key={reSkin.id} className="p-4 space-y-3">
              <h4 className="font-medium text-blue-900">{reSkin.newName}</h4>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Appearance:</span>
                  <p className="text-gray-700">{reSkin.visualDescription}</p>
                </div>
                
                <div>
                  <span className="font-medium">Behavior:</span>
                  <p className="text-gray-700">{reSkin.behavioralChanges}</p>
                </div>
                
                <div>
                  <span className="font-medium">Lore:</span>
                  <p className="text-gray-700">{reSkin.loreAdaptation}</p>
                </div>
              </div>
              
              <Button 
                size="sm" 
                onClick={() => insertReSkin(reSkin)}
                className="w-full"
              >
                Insert into Campaign
              </Button>
            </Card>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('customize')}>
            Try Different Settings
          </Button>
          <Button variant="outline" onClick={() => setStep('search')}>
            Choose Different Monster
          </Button>
        </div>
      </div>
    );
  }

  return null;
}; 