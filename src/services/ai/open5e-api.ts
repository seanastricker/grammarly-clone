import type { Open5eApiResponse, Open5eMonster, MonsterSearchFilters } from '../../types/monster';

const OPEN5E_API_BASE = 'https://api.open5e.com';

class Open5eApiService {
  private buildSearchUrl(filters: MonsterSearchFilters = {}): string {
    const params = new URLSearchParams();
    
    if (filters.searchQuery) {
      params.append('name__icontains', filters.searchQuery);
    }
    
    if (filters.challengeRatingMin !== undefined) {
      params.append('cr__gte', filters.challengeRatingMin.toString());
    }
    
    if (filters.challengeRatingMax !== undefined) {
      params.append('cr__lte', filters.challengeRatingMax.toString());
    }
    
    if (filters.monsterType) {
      params.append('type', filters.monsterType);
    }
    
    if (filters.size) {
      params.append('size', filters.size);
    }
    
    // Limit results for performance
    params.append('limit', '50');
    
    return `${OPEN5E_API_BASE}/monsters/?${params.toString()}`;
  }

  async searchMonsters(filters: MonsterSearchFilters = {}): Promise<Open5eApiResponse> {
    try {
      const url = this.buildSearchUrl(filters);
      console.log('🌐 Fetching monsters from:', url);
      
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DungeonMaster-AI-Assistant/1.0'
        }
      });
      
      if (!response.ok) {
        console.warn(`Open5e API responded with status: ${response.status}`);
        throw new Error(`Open5e API error: ${response.status}`);
      }
      
      const data: Open5eApiResponse = await response.json();
      console.log('🌐 Successfully fetched monsters:', data.results?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Error fetching monsters from Open5e:', error);
      
      // Log more details about the error
      if (error instanceof TypeError) {
        console.warn('🔗 Network error - possible CORS or connectivity issue');
      } else if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⏰ Request was aborted');
      } else if (error instanceof Error) {
        console.warn('❓ Unknown error type:', error.constructor.name, error.message);
      } else {
        console.warn('❓ Non-Error exception:', String(error));
      }
      
      // Return mock data as fallback
      console.log('🔄 Falling back to mock data...');
      return this.getMockMonsters(filters);
    }
  }

  private getMockMonsters(filters: MonsterSearchFilters = {}): Open5eApiResponse {
    const mockMonsters: Open5eMonster[] = [
      {
        slug: 'goblin',
        name: 'Goblin',
        size: 'Small',
        type: 'Humanoid',
        subtype: 'goblinoid',
        alignment: 'Neutral Evil',
        armor_class: 15,
        armor_desc: 'Leather Armor, Shield',
        hit_points: 7,
        hit_dice: '2d6',
        speed: { walk: 30 },
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8,
        challenge_rating: '1/4',
        cr: 0.25,
        senses: 'Darkvision 60 ft., Passive Perception 9',
        languages: 'Common, Goblin',
        desc: 'Small, green-skinned humanoids with a mischievous and often malevolent nature.',
        actions: [
          {
            name: 'Scimitar',
            desc: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.'
          }
        ]
      },
      {
        slug: 'orc',
        name: 'Orc',
        size: 'Medium',
        type: 'Humanoid',
        subtype: 'orc',
        alignment: 'Chaotic Evil',
        armor_class: 13,
        armor_desc: 'Hide Armor',
        hit_points: 15,
        hit_dice: '2d8+2',
        speed: { walk: 30 },
        strength: 16,
        dexterity: 12,
        constitution: 13,
        intelligence: 7,
        wisdom: 11,
        charisma: 10,
        challenge_rating: '1/2',
        cr: 0.5,
        senses: 'Darkvision 60 ft., Passive Perception 10',
        languages: 'Common, Orc',
        desc: 'Savage raiders and pillagers with stooped postures, low foreheads, and piggish faces.',
        actions: [
          {
            name: 'Greataxe',
            desc: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage.'
          }
        ]
      },
      {
        slug: 'wolf',
        name: 'Wolf',
        size: 'Medium',
        type: 'Beast',
        alignment: 'Unaligned',
        armor_class: 13,
        armor_desc: 'Natural Armor',
        hit_points: 11,
        hit_dice: '2d8+2',
        speed: { walk: 40 },
        strength: 12,
        dexterity: 15,
        constitution: 12,
        intelligence: 3,
        wisdom: 12,
        charisma: 6,
        challenge_rating: '1/4',
        cr: 0.25,
        senses: 'Passive Perception 13',
        languages: '',
        desc: 'A keen hunter, the wolf has advantage on attack rolls against a creature if at least one of the wolf\'s allies is within 5 ft. of the creature and the ally isn\'t incapacitated.',
        actions: [
          {
            name: 'Bite',
            desc: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) piercing damage.'
          }
        ]
      },
      {
        slug: 'skeleton',
        name: 'Skeleton',
        size: 'Medium',
        type: 'Undead',
        alignment: 'Lawful Evil',
        armor_class: 13,
        armor_desc: 'Armor Scraps',
        hit_points: 13,
        hit_dice: '2d8+2',
        speed: { walk: 30 },
        strength: 10,
        dexterity: 14,
        constitution: 13,
        intelligence: 6,
        wisdom: 8,
        charisma: 5,
        challenge_rating: '1/4',
        cr: 0.25,
        senses: 'Darkvision 60 ft., Passive Perception 9',
        languages: 'Understands all languages it knew in life but can\'t speak',
        desc: 'Skeletons arise when animated by dark magic. They heed the words of their dark masters regardless of their original nature.',
        actions: [
          {
            name: 'Shortsword',
            desc: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.'
          }
        ]
      },
      {
        slug: 'giant-spider',
        name: 'Giant Spider',
        size: 'Large',
        type: 'Beast',
        alignment: 'Unaligned',
        armor_class: 14,
        armor_desc: 'Natural Armor',
        hit_points: 26,
        hit_dice: '4d10+4',
        speed: { walk: 30, climb: 30 },
        strength: 14,
        dexterity: 16,
        constitution: 13,
        intelligence: 2,
        wisdom: 11,
        charisma: 4,
        challenge_rating: '1',
        cr: 1,
        senses: 'Blindsight 10 ft., Darkvision 60 ft., Passive Perception 10',
        languages: '',
        desc: 'To snare its prey, a giant spider spins elaborate webs or shoots sticky strands of webbing from its abdomen.',
        actions: [
          {
            name: 'Bite',
            desc: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 7 (1d8 + 3) piercing damage, and the target must make a DC 11 Constitution saving throw, taking 9 (2d8) poison damage on a failed save, or half as much damage on a successful one.'
          }
        ]
      }
    ];

    // Filter mock monsters based on search query
    let filteredMonsters = mockMonsters;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredMonsters = mockMonsters.filter(monster => 
        monster.name.toLowerCase().includes(query) ||
        monster.type.toLowerCase().includes(query)
      );
    }

    console.log('🔄 Using mock monster data as fallback:', filteredMonsters.length, 'monsters');
    return {
      count: filteredMonsters.length,
      next: null,
      previous: null,
      results: filteredMonsters
    };
  }

  async getMonsterBySlug(slug: string): Promise<Open5eMonster> {
    try {
      const response = await fetch(`${OPEN5E_API_BASE}/monsters/${slug}/`);
      
      if (!response.ok) {
        throw new Error(`Monster not found: ${slug}`);
      }
      
      const monster: Open5eMonster = await response.json();
      return monster;
    } catch (error) {
      console.error('Error fetching monster by slug:', error);
      throw error;
    }
  }

  async getRandomMonsters(count: number = 10): Promise<Open5eMonster[]> {
    try {
      // Get a random selection by using different offset values
      const randomOffset = Math.floor(Math.random() * 1000);
      const response = await fetch(
        `${OPEN5E_API_BASE}/monsters/?limit=${count}&offset=${randomOffset}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch random monsters');
      }
      
      const data: Open5eApiResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching random monsters:', error);
      throw error;
    }
  }

  // Get popular/common monsters for quick selection
  async getCommonMonsters(): Promise<Open5eMonster[]> {
    try {
      console.log('🌐 Fetching common monsters...');
      
      // Try to fetch from the API first
      const response = await this.searchMonsters({});
      if (response.results && response.results.length > 0) {
        console.log('🌐 Successfully loaded common monsters from API');
        return response.results.slice(0, 10); // Return first 10 as "common"
      }
      
      // If API fails, fall back to mock data
      throw new Error('No results from API');
    } catch (error) {
      console.warn('⚠️ API failed, using mock common monsters:', error);
      
      // Return the mock monsters from our fallback
      const mockResponse = this.getMockMonsters();
      return mockResponse.results;
    }
  }

  // Get monsters by challenge rating range (useful for level-appropriate encounters)
  async getMonstersByCR(minCR: number, maxCR: number): Promise<Open5eMonster[]> {
    return this.searchMonsters({
      challengeRatingMin: minCR,
      challengeRatingMax: maxCR
    }).then(response => response.results);
  }

  // Get available monster types for filtering
  getMonsterTypes(): string[] {
    return [
      'Aberration',
      'Beast',
      'Celestial',
      'Construct',
      'Dragon',
      'Elemental',
      'Fey',
      'Fiend',
      'Giant',
      'Humanoid',
      'Monstrosity',
      'Ooze',
      'Plant',
      'Undead'
    ];
  }

  // Get available sizes for filtering
  getMonsterSizes(): string[] {
    return [
      'Tiny',
      'Small',
      'Medium',
      'Large',
      'Huge',
      'Gargantuan'
    ];
  }
}

export const open5eApi = new Open5eApiService(); 