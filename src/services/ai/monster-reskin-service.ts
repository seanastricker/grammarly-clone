import type { MonsterReSkin, ReSkinRequest, Open5eMonster } from '../../types/monster';
import { generateContent } from './openai-service';
import type { UserProfile } from '../../types/auth';

// Generate AI-powered monster re-skin using the existing OpenAI service
async function generateAIText(prompt: string): Promise<string> {
  console.log('🤖 Generating monster re-skin with prompt:', prompt);
  
  try {
    // Create a mock user profile for the content generation
    // In a real app, this would come from the authenticated user
    const mockUserProfile: UserProfile = {
      id: 'monster-reskin-user',
      email: 'dm@example.com',
      displayName: 'Dungeon Master',
      photoURL: null,
      userType: 'creator',
      experienceLevel: 'intermediate',
      preferredTone: 'creative',
      preferences: {
        theme: 'dark',
        suggestionFrequency: 'medium',
        grammarCheckEnabled: true,
        styleSuggestionsEnabled: true,
        realtimeSuggestionsEnabled: true,
        notifications: {
          email: false,
          inApp: false,
          weekly: false
        },
        autoSaveInterval: 30,
        defaultPrivacy: 'private'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
      subscriptionStatus: 'free'
    };

    // Use the existing generateContent function with creative tone
    const aiResponse = await generateContent({
      prompt: prompt + '\n\nPlease respond with a JSON object containing: newName, visualDescription, behavioralChanges, and loreAdaptation fields.',
      type: 'paragraph',
      tone: 'creative',
      length: 'medium'
    }, mockUserProfile);

    console.log('🤖 AI Response received:', aiResponse);
    
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    // If no JSON found, create a structured response from the text
    return JSON.stringify({
      newName: extractName(aiResponse),
      visualDescription: extractDescription(aiResponse, 'visual', 'appearance', 'looks'),
      behavioralChanges: extractDescription(aiResponse, 'behavior', 'acts', 'moves'),
      loreAdaptation: extractDescription(aiResponse, 'lore', 'history', 'origin', 'story')
    });
    
  } catch (error) {
    console.error('🤖 Error generating AI re-skin:', error);
    
    // Fallback to a simple creative response
    const fallbackName = prompt.includes('Goblin') ? 'Transformed Goblin' : 
                         prompt.includes('Dragon') ? 'Reskinned Dragon' : 
                         prompt.includes('Orc') ? 'Modified Orc' : 
                         'Reimagined Creature';
    
    return JSON.stringify({
      newName: fallbackName,
      visualDescription: "This creature has been transformed with unique visual characteristics that set it apart from its original form.",
      behavioralChanges: "Its behavior has adapted to reflect its new nature and environment.",
      loreAdaptation: "This variant has evolved or been changed through magical or environmental influences."
    });
  }
}

// Helper function to extract potential names from AI response
function extractName(text: string): string {
  const namePatterns = [
    /(?:Name|Called|Known as)[:\s]+([^.\n]+)/i,
    /^([^.\n]+)(?:\s+is\s+|\s+are\s+)/i,
    /This\s+([^.\n,]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return "Transformed Creature";
}

// Helper function to extract descriptions based on keywords
function extractDescription(text: string, ...keywords: string[]): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  
  for (const keyword of keywords) {
    const matchingSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(keyword.toLowerCase())
    );
    if (matchingSentence) {
      return matchingSentence.trim() + '.';
    }
  }
  
  // Return first sentence as fallback
  return sentences[0]?.trim() + '.' || "This aspect has been creatively modified.";
}

class MonsterReSkinService {
  private generateReSkinPrompt(request: ReSkinRequest): string {
    const { monster, theme, environment, tone } = request;
    
    let prompt = `You are a D&D Dungeon Master's assistant specialized in monster re-skinning. Your task is to create creative visual and thematic variations of existing D&D monsters while keeping ALL mechanical stats identical.

ORIGINAL MONSTER: ${monster.name}
- Type: ${monster.type}
- Size: ${monster.size}
- Challenge Rating: ${monster.challenge_rating}
- Description: ${monster.desc || 'No description available'}

IMPORTANT CONSTRAINTS:
- Do NOT change any mechanical aspects (stats, abilities, actions, etc.)
- Focus ONLY on visual appearance, behavior, and lore
- Keep the same general size and creature type
- The re-skin should make mechanical sense (a flying creature should still have wings or equivalent)

CUSTOMIZATION REQUESTS:`;

    if (theme) {
      prompt += `\n- Theme: ${theme}`;
    }
    
    if (environment) {
      prompt += `\n- Environment: ${environment}`;
    }
    
    if (tone) {
      prompt += `\n- Tone: ${tone}`;
    }

    prompt += `

Please provide a creative re-skin with the following elements:

1. NEW NAME: A creative new name that fits the theme
2. VISUAL DESCRIPTION: Detailed physical appearance (2-3 sentences)
3. BEHAVIORAL CHANGES: How this creature acts differently from the original (1-2 sentences)
4. LORE ADAPTATION: Brief backstory or origin that fits your re-skin (1-2 sentences)

Format your response as JSON:
{
  "newName": "Creative Monster Name",
  "visualDescription": "Detailed visual description...",
  "behavioralChanges": "How it behaves differently...",
  "loreAdaptation": "Brief backstory or origin..."
}`;

    return prompt;
  }

  async generateReSkin(request: ReSkinRequest): Promise<MonsterReSkin> {
    try {
      const prompt = this.generateReSkinPrompt(request);
      const response = await generateAIText(prompt);
      
      // Parse the JSON response
      const parsed = JSON.parse(response);
      
      // Validate the response structure
      if (!parsed.newName || !parsed.visualDescription || !parsed.behavioralChanges || !parsed.loreAdaptation) {
        throw new Error('Invalid re-skin response format');
      }
      
      const reSkin: MonsterReSkin = {
        id: crypto.randomUUID(),
        originalMonster: request.monster,
        newName: parsed.newName,
        visualDescription: parsed.visualDescription,
        behavioralChanges: parsed.behavioralChanges,
        loreAdaptation: parsed.loreAdaptation,
        createdAt: new Date()
      };
      
      return reSkin;
    } catch (error) {
      console.error('Error generating monster re-skin:', error);
      throw new Error('Failed to generate monster re-skin. Please try again.');
    }
  }

  async generateMultipleReSkins(request: ReSkinRequest, count: number = 3): Promise<MonsterReSkin[]> {
    const variations = [
      'Focus on making this creature more mysterious and shadowy',
      'Create a more whimsical, fairy-tale version of this creature',
      'Design a more technological or artificially enhanced version'
    ];

    try {
      const promises = Array.from({ length: Math.min(count, 3) }, async (_, index) => {
        const enhancedRequest: ReSkinRequest = {
          ...request,
          tone: request.tone || (['mysterious', 'whimsical', 'heroic'] as const)[index]
        };
        
        return this.generateReSkin(enhancedRequest);
      });

      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error generating multiple re-skins:', error);
      throw error;
    }
  }

  // Generate theme-specific re-skins for common use cases
  async generateThemedReSkins(monster: Open5eMonster): Promise<{
    horror: MonsterReSkin;
    steampunk: MonsterReSkin;
    underwater: MonsterReSkin;
  }> {
    try {
      const [horror, steampunk, underwater] = await Promise.all([
        this.generateReSkin({
          monster,
          theme: 'Horror',
          tone: 'dark'
        }),
        this.generateReSkin({
          monster,
          theme: 'Steampunk',
          tone: 'heroic'
        }),
        this.generateReSkin({
          monster,
          environment: 'Underwater',
          tone: 'mysterious'
        })
      ]);

      return { horror, steampunk, underwater };
    } catch (error) {
      console.error('Error generating themed re-skins:', error);
      throw error;
    }
  }

  // Format re-skin for export to campaign document
  formatForExport(reSkin: MonsterReSkin): string {
    const { originalMonster, newName, visualDescription, behavioralChanges, loreAdaptation } = reSkin;
    
    return `## ${newName}
*${originalMonster.size} ${originalMonster.type}, ${originalMonster.alignment}*

**Armor Class** ${originalMonster.armor_class}
**Hit Points** ${originalMonster.hit_points} (${originalMonster.hit_dice})
**Speed** ${Object.entries(originalMonster.speed).map(([type, speed]) => `${type} ${speed} ft.`).join(', ')}

**STR** ${originalMonster.strength} **DEX** ${originalMonster.dexterity} **CON** ${originalMonster.constitution} **INT** ${originalMonster.intelligence} **WIS** ${originalMonster.wisdom} **CHA** ${originalMonster.charisma}

**Challenge Rating** ${originalMonster.challenge_rating}
**Senses** ${originalMonster.senses}
**Languages** ${originalMonster.languages}

### Appearance
${visualDescription}

### Behavior
${behavioralChanges}

### Lore
${loreAdaptation}

*Original Monster: ${originalMonster.name}*
*Mechanical stats unchanged from original*`;
  }

  // Get suggested themes based on monster type
  getSuggestedThemes(monster: Open5eMonster): string[] {
    const baseThemes = ['Horror', 'Steampunk', 'Fairy Tale', 'Post-Apocalyptic', 'Celestial'];
    
    // Add type-specific themes
    const typeThemes: Record<string, string[]> = {
      'Beast': ['Elemental', 'Prehistoric', 'Mutated'],
      'Humanoid': ['Cyberpunk', 'Medieval', 'Tribal'],
      'Undead': ['Spectral', 'Plague-Bearer', 'Ancient'],
      'Dragon': ['Crystalline', 'Metallic', 'Shadow'],
      'Fiend': ['Corrupted', 'Fallen Angel', 'Trickster'],
      'Fey': ['Seasonal', 'Dream', 'Nightmare']
    };
    
    const specificThemes = typeThemes[monster.type] || [];
    return [...baseThemes, ...specificThemes];
  }

  // Get suggested environments for re-skinning
  getSuggestedEnvironments(): string[] {
    return [
      'Underwater',
      'Desert',
      'Arctic',
      'Urban',
      'Jungle',
      'Mountain',
      'Swamp',
      'Underground',
      'Volcanic',
      'Cosmic/Space'
    ];
  }
}

export const monsterReSkinService = new MonsterReSkinService(); 