import { generateContent } from './openai-service';

export type DNDRace = 
  | 'Human' | 'Elf' | 'Dwarf' | 'Halfling' | 'Dragonborn' 
  | 'Gnome' | 'Half-Elf' | 'Half-Orc' | 'Tiefling' | 'Aarakocra'
  | 'Aasimar' | 'Bugbear' | 'Firbolg' | 'Genasi' | 'Githyanki'
  | 'Githzerai' | 'Goblin' | 'Goliath' | 'Hobgoblin' | 'Kenku'
  | 'Kobold' | 'Lizardfolk' | 'Orc' | 'Tabaxi' | 'Triton'
  | 'Yuan-Ti-Pureblood';

export type DNDProfession = 
  | 'Innkeeper' | 'Guard' | 'Noble' | 'Merchant' | 'Blacksmith'
  | 'Priest' | 'Scholar' | 'Farmer' | 'Hunter' | 'Sailor'
  | 'Soldier' | 'Thief' | 'Bard' | 'Wizard' | 'Healer'
  | 'Cook' | 'Tailor' | 'Mason' | 'Miner' | 'Scribe'
  | 'Librarian' | 'Diplomat' | 'Spy' | 'Assassin' | 'Bandit';

export interface NameGenerationRequest {
  race: DNDRace;
  profession?: DNDProfession;
  count: number;
  style?: 'traditional' | 'unique' | 'common';
}

export interface GeneratedName {
  name: string;
  race: DNDRace;
  profession?: DNDProfession;
  meaning?: string;
}

class FantasyNameGeneratorService {
  private getRacialNamingContext(race: DNDRace): string {
    const contexts: Record<DNDRace, string> = {
      'Human': 'diverse cultural backgrounds, can be European, Asian, African, or Middle Eastern inspired',
      'Elf': 'melodious, flowing names with nature elements, often containing "th", "el", "ar" sounds',
      'Dwarf': 'strong, consonant-heavy names often referencing stone, metal, or clan heritage',
      'Halfling': 'cheerful, simple names often food or comfort-related, typically shorter',
      'Dragonborn': 'draconic heritage with hard consonants and clan-based surnames',
      'Gnome': 'playful, inventive names often with multiple syllables and technical references',
      'Half-Elf': 'blend of human and elven naming conventions',
      'Half-Orc': 'mix of orcish harsh sounds and human names, often shortened or adapted',
      'Tiefling': 'either traditional names or virtue/concept names they choose for themselves',
      'Aarakocra': 'bird-like with clicking and chirping sounds, often short and sharp',
      'Aasimar': 'celestial-touched names with divine or light-related meanings',
      'Bugbear': 'simple, often monosyllabic names with harsh consonants',
      'Firbolg': 'nature-connected, gentle names often relating to forests and peace',
      'Genasi': 'elemental heritage reflected in names relating to fire, water, earth, or air',
      'Githyanki': 'militaristic culture with harsh, decisive names',
      'Githzerai': 'contemplative culture with names reflecting inner peace and discipline',
      'Goblin': 'simple, often crude names with harsh sounds',
      'Goliath': 'achievement-based names often describing feats or characteristics',
      'Hobgoblin': 'militaristic with strong, commanding names',
      'Kenku': 'names taken from sounds they have heard, often describing their voice or mannerisms',
      'Kobold': 'draconic ancestry with sibilant sounds and clan references',
      'Lizardfolk': 'descriptive names often relating to their role or physical characteristics',
      'Orc': 'harsh, strong names with guttural sounds and clan significance',
      'Tabaxi': 'descriptive names based on personality, appearance, or memorable events',
      'Triton': 'oceanic culture with flowing names relating to seas and depths',
      'Yuan-Ti-Pureblood': 'serpentine names with sibilant sounds and ancient power references'
    };
    return contexts[race] || 'fantasy-appropriate naming conventions';
  }

  private getProfessionContext(profession?: DNDProfession): string {
    if (!profession) return '';
    
    const contexts: Record<DNDProfession, string> = {
      'Innkeeper': 'welcoming, trustworthy, often family-oriented names',
      'Guard': 'strong, reliable names that inspire confidence',
      'Noble': 'prestigious names with titles or family heritage',
      'Merchant': 'memorable names good for business and trade',
      'Blacksmith': 'strong names often relating to metal, fire, or craftsmanship',
      'Priest': 'names with religious or spiritual significance',
      'Scholar': 'learned names often with classical or academic feel',
      'Farmer': 'simple, down-to-earth names with pastoral connections',
      'Hunter': 'names relating to tracking, wilderness, or animal knowledge',
      'Sailor': 'names with maritime connections or weather references',
      'Soldier': 'disciplined, strong names with military bearing',
      'Thief': 'names that are either forgettable or memorable aliases',
      'Bard': 'melodious names that are easy to remember and announce',
      'Wizard': 'scholarly names often with ancient or mystical elements',
      'Healer': 'gentle names with caring or nurturing associations',
      'Cook': 'warm names often relating to food, comfort, or hospitality',
      'Tailor': 'precise names relating to craftsmanship and attention to detail',
      'Mason': 'solid names relating to stone, building, and permanence',
      'Miner': 'names relating to earth, gems, or underground work',
      'Scribe': 'careful names relating to writing, recording, or documentation',
      'Librarian': 'knowledgeable names with scholarly or bookish associations',
      'Diplomat': 'sophisticated names that convey intelligence and trustworthiness',
      'Spy': 'either unremarkable names for blending in or carefully chosen aliases',
      'Assassin': 'names that are either feared or completely unremarkable',
      'Bandit': 'names that are either intimidating or adopted for notoriety'
    };
    
    return `. Consider that this character is a ${profession}, so the name should reflect ${contexts[profession]}`;
  }

  async generateFantasyNames(request: NameGenerationRequest): Promise<GeneratedName[]> {
    const { race, profession, count, style = 'traditional' } = request;
    
    const racialContext = this.getRacialNamingContext(race);
    const professionContext = this.getProfessionContext(profession);
    
    const styleContext = {
      traditional: 'traditional and authentic to the race',
      unique: 'unique and memorable, standing out from typical names',
      common: 'common and easily recognizable for the race'
    }[style];

    const prompt = `Generate ${count} fantasy names for D&D 5e characters with the following specifications:

Race: ${race}
${profession ? `Profession: ${profession}` : ''}
Style: ${styleContext}

Naming Guidelines:
- Race: ${racialContext}${professionContext}
- Names should be appropriate for a medieval fantasy setting
- Each name should feel authentic to D&D lore and the specified race
- Avoid modern or obviously Earth-based names unless appropriate for the race
- Consider the cultural background and typical naming patterns for ${race}s

Please provide exactly ${count} names in the following JSON format:
[
  {
    "name": "Generated Name",
    "meaning": "Brief explanation of name significance or cultural context"
  }
]

Return only the JSON array with no additional text.`;

    try {
      const response = await generateContent({
        prompt,
        type: 'paragraph',
        tone: 'creative',
        length: 'long'  // Changed from 'short' to 'long' to allow for more tokens (1000 instead of 200)
      }, { userType: 'writer', experienceLevel: 'intermediate' } as any);
      
      // Try to parse JSON, with fallback handling
      let namesData;
      try {
        namesData = JSON.parse(response);
      } catch (jsonError) {
        console.log('JSON parsing failed, attempting to extract names from text response');
        // Fallback: extract names from text response
        namesData = this.extractNamesFromText(response, count);
      }
      
      // Ensure we have an array
      if (!Array.isArray(namesData)) {
        console.log('Response is not an array, treating as single name');
        namesData = [{ name: response.trim(), meaning: 'Generated name' }];
      }
      
             return namesData.slice(0, count).map((nameData: any) => {
         const result: GeneratedName = {
           name: typeof nameData === 'string' ? nameData : nameData.name || 'Unknown',
           race,
           meaning: typeof nameData === 'object' ? nameData.meaning : `${race} name`
         };
         
         if (profession) {
           result.profession = profession;
         }
         
         return result;
       });
    } catch (error) {
      console.error('Error generating fantasy names:', error);
      
      // Ultimate fallback: generate simple names
      return this.generateFallbackNames(race, profession, count);
    }
  }

  async generateNameVariations(baseName: string, race: DNDRace, count: number = 3): Promise<string[]> {
    const racialContext = this.getRacialNamingContext(race);
    
    const prompt = `Generate ${count} variations of the ${race} name "${baseName}" that maintain the same cultural feel and naming conventions.

Guidelines:
- Keep the same general sound and feel as "${baseName}"
- Maintain ${race} naming conventions: ${racialContext}
- Variations should be similar but distinct names
- All variations should be appropriate for D&D fantasy setting

Return as a simple JSON array of strings:
["variation1", "variation2", "variation3"]

Return only the JSON array with no additional text.`;

    try {
      const response = await generateContent({
        prompt,
        type: 'paragraph',
        tone: 'creative',
        length: 'medium'  // Changed from 'short' to 'medium' for name variations (500 tokens)
      }, { userType: 'writer', experienceLevel: 'intermediate' } as any);
      
      try {
        return JSON.parse(response);
      } catch (jsonError) {
        // Fallback: extract names from text
        return this.extractNamesFromText(response, count);
      }
    } catch (error) {
      console.error('Error generating name variations:', error);
      // Fallback: generate simple variations
      return this.generateSimpleVariations(baseName, count);
    }
  }

  private extractNamesFromText(text: string, count: number): any[] {
    console.log('🔍 Extracting names from text response:', text);
    
    const names: { name: string; meaning?: string }[] = [];
    
    // First, try to parse as complete JSON array
    try {
      const jsonData = JSON.parse(text);
      if (Array.isArray(jsonData)) {
        console.log('✅ Successfully parsed as JSON array');
        for (const item of jsonData) {
          if (item && typeof item === 'object' && item.name && typeof item.name === 'string') {
            const cleanName = item.name.trim();
            if (cleanName && !names.some(n => n.name === cleanName)) {
              names.push({ 
                name: cleanName, 
                meaning: item.meaning || 'AI generated name' 
              });
              console.log('✅ Extracted from JSON array:', cleanName);
              if (names.length >= count) break;
            }
          }
        }
        if (names.length > 0) {
          console.log(`🎯 Successfully extracted ${names.length} names from proper JSON structure`);
          return names.slice(0, count);
        }
      }
    } catch (e) {
      console.log('⚠️ Not valid JSON array, trying pattern extraction...');
    }

    // Second, try to extract ONLY from "name": "value" patterns (most reliable)
    const jsonMatches = text.match(/"name":\s*"([^"]+)"/g);
    if (jsonMatches && jsonMatches.length > 0) {
      console.log(`🔍 Found ${jsonMatches.length} "name": patterns`);
      for (const match of jsonMatches) {
        const nameMatch = match.match(/"name":\s*"([^"]+)"/);
        if (nameMatch && nameMatch[1]) {
          const cleanName = nameMatch[1].trim();
          if (cleanName && cleanName.length > 1 && !names.some(n => n.name === cleanName)) {
            names.push({ name: cleanName, meaning: 'AI generated name' });
            console.log('✅ Extracted from "name": pattern:', cleanName);
            if (names.length >= count) break;
          }
        }
      }
    }

    // If we have names from the proper structure, return them
    if (names.length > 0) {
      console.log(`🎯 Successfully extracted ${names.length} names from JSON "name": patterns`);
      return names.slice(0, count);
    }

    // Only as a last resort fallback, return curated names
    console.log('⚠️ No names found in proper JSON structure, using fallback names');
    const fallbackNames = [
      { name: 'Aiden Thornfield', meaning: 'Fallback name' },
      { name: 'Lyra Moonwhisper', meaning: 'Fallback name' },
      { name: 'Gareth Ironforge', meaning: 'Fallback name' },
      { name: 'Elara Starweaver', meaning: 'Fallback name' },
      { name: 'Marcus Stormwind', meaning: 'Fallback name' }
    ];
    
    console.log(`🎯 Using ${Math.min(count, fallbackNames.length)} fallback names`);
    return fallbackNames.slice(0, count);
  }

  private generateFallbackNames(race: DNDRace, profession?: DNDProfession, count: number = 5): GeneratedName[] {
    // Simple fallback names based on race
    const fallbackNames: Record<DNDRace, string[]> = {
      'Human': ['Aiden', 'Elara', 'Marcus', 'Lyra', 'Gareth'],
      'Elf': ['Thalion', 'Arwen', 'Legolas', 'Galadriel', 'Elrond'],
      'Dwarf': ['Thorin', 'Dain', 'Balin', 'Dora', 'Nala'],
      'Halfling': ['Bilbo', 'Frodo', 'Samwise', 'Rosie', 'Pippin'],
      'Dragonborn': ['Balasar', 'Donaar', 'Rava', 'Sora', 'Torinn'],
      'Gnome': ['Alston', 'Boddynock', 'Dimble', 'Fonkin', 'Gimble'],
      'Half-Elf': ['Ash', 'Autumn', 'Berris', 'Coral', 'Ember'],
      'Half-Orc': ['Gorth', 'Kansif', 'Ront', 'Shump', 'Thokk'],
      'Tiefling': ['Akmenos', 'Damaia', 'Lerissa', 'Makaria', 'Nemeia'],
      'Aarakocra': ['Aera', 'Aial', 'Aur', 'Deekek', 'Errk'],
      'Aasimar': ['Arken', 'Arvar', 'Invar', 'Kirris', 'Morthos'],
      'Bugbear': ['Grax', 'Hurk', 'Klarg', 'Murg', 'Yeek'],
      'Firbolg': ['Autumn', 'Birch', 'Grove', 'Maple', 'Oak'],
      'Genasi': ['Blaze', 'Cinder', 'Flow', 'Mist', 'Stone'],
      'Githyanki': ['Baakx', 'Duurth', 'Quith', 'Saath', 'Zar'],
      'Githzerai': ['Dak', 'Hasheth', 'Kar', 'Lihath', 'Menyar'],
      'Goblin': ['Booyahg', 'Droop', 'Fik', 'Grik', 'Meepo'],
      'Goliath': ['Aukan', 'Gae-Al', 'Gauthak', 'Ilikan', 'Keothi'],
      'Hobgoblin': ['Aerdus', 'Ahvak', 'Arameth', 'Bahzek', 'Dagnyr'],
      'Kenku': ['Croak', 'Flitter', 'Peck', 'Rustle', 'Whistle'],
      'Kobold': ['Krik', 'Kreet', 'Paco', 'Tikta', 'Urt'],
      'Lizardfolk': ['Aryte', 'Baeshra', 'Drtha', 'Ieshen', 'Kepesk'],
      'Orc': ['Dench', 'Feng', 'Gell', 'Henk', 'Holg'],
      'Tabaxi': ['Cloud on the Mountaintop', 'Five Timber', 'Jade Shoe', 'Left-Handed Hummingbird', 'Seven Thundercloud'],
      'Triton': ['Belthyn', 'Delnis', 'Jhimas', 'Keros', 'Molos'],
      'Yuan-Ti-Pureblood': ['Asaph', 'Djedkare', 'Kheti', 'Sebek', 'Thoth']
    };
    
    const baseNames = fallbackNames[race] || fallbackNames['Human'];
    const selectedNames = baseNames.slice(0, count);
    
    // Fill remaining slots if needed
    while (selectedNames.length < count) {
      selectedNames.push(`${race}Name${selectedNames.length + 1}`);
    }
    
    return selectedNames.map(name => {
      const result: GeneratedName = {
        name,
        race,
        meaning: `Traditional ${race} name`
      };
      
      if (profession) {
        result.profession = profession;
      }
      
      return result;
    });
  }

  private generateSimpleVariations(baseName: string, count: number): string[] {
    const variations: string[] = [];
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const consonants = ['r', 'n', 'th', 's', 'l'];
    
    // Generate simple variations by modifying the base name
    for (let i = 0; i < count; i++) {
      let variation = baseName;
      
      if (i === 0) {
        // First variation: add suffix
        variation = baseName + (Math.random() > 0.5 ? 'el' : 'ar');
      } else if (i === 1) {
        // Second variation: change ending
        variation = baseName.slice(0, -1) + (Math.random() > 0.5 ? 'ian' : 'wen');
      } else {
        // Additional variations: modify randomly
        const randomSuffix = Math.random() > 0.5 ? 
          vowels[Math.floor(Math.random() * vowels.length)] :
          consonants[Math.floor(Math.random() * consonants.length)];
        variation = baseName + randomSuffix;
      }
      
      variations.push(variation);
    }
    
    return variations;
  }
}

export const fantasyNameGeneratorService = new FantasyNameGeneratorService(); 