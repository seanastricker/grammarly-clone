/**
 * @fileoverview D&D 5e Character Background Generation Service
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * This service provides AI-powered character background generation for D&D 5e,
 * including personality traits, backstory, plot hooks, and mechanical elements.
 */

import OpenAI from 'openai';
import { DNDRace } from './fantasy-name-generator';

// Initialize OpenAI client (only if API key is available)
let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Only for demo - use backend in production
    });
    console.log('🧙‍♀️ OpenAI client initialized for character background generation');
  } else {
    console.log('🧙‍♀️ OpenAI API key not found - character backgrounds will use fallback mode');
  }
} catch (error) {
  console.warn('🧙‍♀️ Failed to initialize OpenAI client for character backgrounds:', error);
}

// D&D 5e Character Classes
export type DNDClass = 
  | 'Barbarian' | 'Bard' | 'Cleric' | 'Druid' | 'Fighter' | 'Monk' 
  | 'Paladin' | 'Ranger' | 'Rogue' | 'Sorcerer' | 'Warlock' | 'Wizard'
  | 'Artificer' | 'Blood Hunter' | 'Custom';

// D&D 5e Official Backgrounds
export type DNDBackground = 
  | 'Acolyte' | 'Criminal' | 'Folk Hero' | 'Noble' | 'Sage' | 'Soldier'
  | 'Charlatan' | 'Entertainer' | 'Guild Artisan' | 'Hermit' | 'Outlander' | 'Sailor'
  | 'Anthropologist' | 'Archaeologist' | 'City Watch' | 'Clan Crafter' | 'Cloistered Scholar'
  | 'Courtier' | 'Faction Agent' | 'Far Traveler' | 'Inheritor' | 'Knight of the Order'
  | 'Mercenary Veteran' | 'Urban Bounty Hunter' | 'Uthgardt Tribe Member' | 'Waterdhavian Noble'
  | 'Custom';

// D&D 5e Alignments
export type DNDAlignment = 
  | 'Lawful Good' | 'Neutral Good' | 'Chaotic Good'
  | 'Lawful Neutral' | 'True Neutral' | 'Chaotic Neutral'
  | 'Lawful Evil' | 'Neutral Evil' | 'Chaotic Evil';

// Generation Settings
export type GenerationStyle = 'detailed' | 'summary' | 'bullet-points';
export type BackgroundTheme = 'heroic' | 'tragic' | 'mysterious' | 'comedic' | 'dark' | 'ordinary' | 'exotic';
export type BackgroundTone = 'serious' | 'lighthearted' | 'dramatic' | 'gritty' | 'optimistic' | 'melancholic';
export type BackgroundSetting = 'urban' | 'rural' | 'wilderness' | 'noble-court' | 'criminal-underworld' | 'scholarly' | 'military' | 'religious' | 'magical' | 'custom';

export interface CharacterBackgroundRequest {
  // Core Character Info
  race: DNDRace;
  characterClass: DNDClass;
  background: DNDBackground;
  characterLevel: number;
  alignment?: DNDAlignment;
  
  // Generation Preferences
  generationStyle: GenerationStyle;
  theme: BackgroundTheme;
  tone: BackgroundTone;
  setting: BackgroundSetting;
  customSetting?: string;
  
  // Content Options
  includeSecrets: boolean;
  includePlotHooks: boolean;
  includeRelationships: boolean;
  includeMechanicalElements: boolean;
  
  // Customization
  customRequirements?: string;
  focusAreas?: ('personality' | 'history' | 'motivation' | 'secrets' | 'relationships')[];
}

export interface GeneratedCharacterBackground {
  id: string;
  request: CharacterBackgroundRequest;
  
  // Basic Information
  characterConcept: string;
  backgroundSummary: string;
  
  // Personal History
  personalHistory: {
    earlyLife: string;
    formativeEvents: string;
    recentPast: string;
    howTheyBecameTheirClass: string;
  };
  
  // D&D 5e Personality Elements
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
  
  // Motivations & Goals
  motivations: {
    primary: string;
    secondary: string[];
  };
  goals: {
    shortTerm: string[];
    longTerm: string[];
    lifeGoal: string;
  };
  
  // Optional Advanced Elements
  secrets?: CharacterSecret[];
  plotHooks?: PlotHook[];
  relationships?: NPCRelationship[];
  mechanicalElements?: MechanicalElement[];
  
  // Additional Flavor
  mannerisms?: string[];
  fears?: string[];
  possessions?: string[];
  
  // Generation Metadata
  generatedAt: Date;
  lastRefinedAt?: Date;
}

export interface CharacterSecret {
  type: 'family' | 'past-deed' | 'knowledge' | 'relationship' | 'identity' | 'power';
  description: string;
  severity: 'minor' | 'major' | 'life-changing';
  potentialConsequences: string;
}

export interface PlotHook {
  type: 'personal' | 'family' | 'professional' | 'romantic' | 'enemy' | 'mystery' | 'duty' | 'revenge';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  dmGuidance: string;
  potentialOutcomes: string[];
}

export interface NPCRelationship {
  name: string;
  relationship: 'family' | 'friend' | 'enemy' | 'mentor' | 'rival' | 'lover' | 'colleague' | 'other';
  description: string;
  currentStatus: 'alive' | 'dead' | 'missing' | 'unknown';
  importance: 'minor' | 'significant' | 'crucial';
  plotPotential: string;
}

export interface MechanicalElement {
  type: 'skill-proficiency' | 'language' | 'tool-proficiency' | 'equipment' | 'feature' | 'contact';
  name: string;
  description: string;
  gameEffect?: string;
  source: 'background' | 'class' | 'race' | 'custom';
}

export interface RefinementRequest {
  backgroundId: string;
  requestType: 'modify-personality' | 'adjust-history' | 'add-secret' | 'modify-relationships' | 'change-tone' | 'add-plot-hooks' | 'general';
  description: string;
  targetSection?: keyof GeneratedCharacterBackground;
}

class CharacterBackgroundGeneratorService {
  
  async generateCharacterBackground(request: CharacterBackgroundRequest): Promise<GeneratedCharacterBackground> {
    console.log('🧙‍♀️ Generating character background with request:', request);

    const prompt = this.createGenerationPrompt(request);
    
    try {
      if (!openai) {
        console.log('🧙‍♀️ OpenAI not available, using demo mode with realistic content');
        return this.generateDemoBackground(request);
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert D&D 5e character background generator. Generate detailed, creative character backgrounds in valid JSON format. Be specific and creative while maintaining D&D authenticity.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8, // Higher creativity for character generation
        max_tokens: 2000,
      });

      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      const parsedBackground = this.parseBackgroundResponse(responseContent, request);
      console.log('🧙‍♀️ Character background generated successfully');
      return parsedBackground;

    } catch (error) {
      console.error('🧙‍♀️ Error generating character background:', error);
      return this.generateDemoBackground(request);
    }
  }

  async refineCharacterBackground(
    background: GeneratedCharacterBackground, 
    refinementRequest: RefinementRequest
  ): Promise<GeneratedCharacterBackground> {
    console.log('🧙‍♀️ Refining character background:', refinementRequest);

    const prompt = this.createRefinementPrompt(background, refinementRequest);
    
    try {
      if (!openai) {
        console.log('🧙‍♀️ OpenAI not available, returning original background');
        return background;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert D&D 5e character background refiner. Modify character backgrounds based on user requests while maintaining consistency and D&D authenticity. Return only the modified sections in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7, // Slightly lower creativity for refinements
        max_tokens: 1000,
      });

      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      const refinedBackground = this.applyRefinements(background, responseContent, refinementRequest);
      refinedBackground.lastRefinedAt = new Date();
      
      console.log('🧙‍♀️ Character background refined successfully');
      return refinedBackground;

    } catch (error) {
      console.error('🧙‍♀️ Error refining character background:', error);
      return background; // Return original if refinement fails
    }
  }

  private createGenerationPrompt(request: CharacterBackgroundRequest): string {
    const {
      race, characterClass, background, characterLevel, alignment,
      generationStyle, theme, tone, setting, customSetting,
      includeSecrets, includePlotHooks, includeRelationships, includeMechanicalElements,
      customRequirements, focusAreas
    } = request;

    const backgroundInfo = this.getBackgroundInfo(background);
    const classInfo = this.getClassInfo(characterClass);
    const raceInfo = this.getRaceInfo(race);

    return `You are an expert D&D 5e character background generator. Create a detailed, engaging character background based on the specifications below.

CHARACTER SPECIFICATIONS:
- Race: ${race} ${raceInfo ? `(${raceInfo})` : ''}
- Class: ${characterClass} ${classInfo ? `(${classInfo})` : ''}
- Background: ${background} ${backgroundInfo ? `(${backgroundInfo})` : ''}
- Level: ${characterLevel}
${alignment ? `- Alignment: ${alignment}` : ''}
- Theme: ${theme}
- Tone: ${tone}
- Setting: ${setting === 'custom' ? customSetting : setting}
${customRequirements ? `- Additional Requirements: ${customRequirements}` : ''}

REQUIRED SECTIONS:
1. characterConcept: A compelling 1-2 sentence character concept
2. backgroundSummary: 2-3 sentences explaining their background and how they became an adventurer
3. personalHistory: Object with earlyLife, formativeEvents, recentPast, howTheyBecameTheirClass (each 2-3 sentences)
4. personalityTraits: Array of 2-3 specific, roleplayable personality traits
5. ideals: Array of 1-2 core beliefs/principles
6. bonds: Array of 1-2 important connections/commitments
7. flaws: Array of 1-2 character weaknesses/quirks
8. motivations: Object with primary (1 sentence) and secondary (array of 1-2 items)
9. goals: Object with shortTerm (1-2 items), longTerm (1-2 items), lifeGoal (1 sentence)
10. mannerisms: Array of 2-3 specific behavioral quirks
11. fears: Array of 1-2 specific fears
12. possessions: Array of 2-3 notable items they carry

${includeSecrets ? `13. secrets: Array of 1-2 objects with type, description, severity, potentialConsequences` : ''}
${includePlotHooks ? `14. plotHooks: Array of 1-2 objects with type, title, description, urgency, dmGuidance, potentialOutcomes` : ''}
${includeRelationships ? `15. relationships: Array of 1-3 objects with name, relationship, description, currentStatus, importance, plotPotential` : ''}
${includeMechanicalElements ? `16. mechanicalElements: Array of 1-3 objects with type, name, description, gameEffect, source` : ''}

IMPORTANT: Return ONLY a valid JSON object. Be specific and creative. Use actual names, places, and events. Make it feel like a real person with depth and history.

Example format:
{
  "characterConcept": "A former noble's guard turned wandering protector...",
  "backgroundSummary": "Born into service, this character...",
  "personalHistory": {
    "earlyLife": "Raised in the castle grounds...",
    "formativeEvents": "The night the castle fell...",
    "recentPast": "After years of wandering...",
    "howTheyBecameTheirClass": "Combat training from childhood..."
  },
  "personalityTraits": ["Always stands between friends and danger", "Speaks in military terms"],
  "ideals": ["Protect the innocent"],
  "bonds": ["My former lord's daughter is still alive somewhere"],
  "flaws": ["I have trouble trusting authority figures"],
  "motivations": {
    "primary": "Find and protect my former lord's daughter",
    "secondary": ["Prove my honor is intact", "Build a new family of companions"]
  },
  "goals": {
    "shortTerm": ["Track down leads about the daughter's whereabouts"],
    "longTerm": ["Establish a safe haven for refugees"],
    "lifeGoal": "Restore honor to my family name"
  },
  "mannerisms": ["Unconsciously checks weapon placement", "Stands at attention when nervous"],
  "fears": ["Failing to protect someone again", "Being branded a traitor"],
  "possessions": ["A signet ring from my former lord", "A well-maintained sword", "A letter of recommendation"]
}`;
  }

  private createRefinementPrompt(
    background: GeneratedCharacterBackground, 
    refinementRequest: RefinementRequest
  ): string {
    return `Refine the following D&D character background based on the user's request:

CURRENT BACKGROUND SUMMARY:
Character: ${background.characterConcept}
Race/Class: ${background.request.race} ${background.request.characterClass}
Background: ${background.request.background}

REFINEMENT REQUEST:
Type: ${refinementRequest.requestType}
Description: ${refinementRequest.description}
${refinementRequest.targetSection ? `Target Section: ${refinementRequest.targetSection}` : ''}

CURRENT CONTENT TO REFINE:
${JSON.stringify(background, null, 2)}

Please provide the specific changes needed to address the refinement request while maintaining consistency with the overall character concept and D&D 5e authenticity. Return the modifications in JSON format.`;
  }

  private parseBackgroundResponse(response: string, request: CharacterBackgroundRequest): GeneratedCharacterBackground {
    try {
      // Clean the response to extract JSON
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON object in the response
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('🧙‍♀️ Attempting to parse AI response:', cleanedResponse.substring(0, 200) + '...');
      
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate that we have the required fields
      if (!parsed.characterConcept || !parsed.backgroundSummary) {
        console.warn('🧙‍♀️ AI response missing required fields, using fallback');
        return this.generateFallbackBackground(request);
      }
      
      return {
        id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        request,
        characterConcept: parsed.characterConcept,
        backgroundSummary: parsed.backgroundSummary,
        personalHistory: {
          earlyLife: parsed.personalHistory?.earlyLife || 'Early life not provided',
          formativeEvents: parsed.personalHistory?.formativeEvents || 'Formative events not provided',
          recentPast: parsed.personalHistory?.recentPast || 'Recent past not provided',
          howTheyBecameTheirClass: parsed.personalHistory?.howTheyBecameTheirClass || 'Class origin not provided'
        },
        personalityTraits: Array.isArray(parsed.personalityTraits) && parsed.personalityTraits.length > 0 
          ? parsed.personalityTraits 
          : ['Personality trait not provided'],
        ideals: Array.isArray(parsed.ideals) && parsed.ideals.length > 0 
          ? parsed.ideals 
          : ['Ideal not provided'],
        bonds: Array.isArray(parsed.bonds) && parsed.bonds.length > 0 
          ? parsed.bonds 
          : ['Bond not provided'],
        flaws: Array.isArray(parsed.flaws) && parsed.flaws.length > 0 
          ? parsed.flaws 
          : ['Flaw not provided'],
        motivations: {
          primary: parsed.motivations?.primary || 'Primary motivation not provided',
          secondary: Array.isArray(parsed.motivations?.secondary) ? parsed.motivations.secondary : []
        },
        goals: {
          shortTerm: Array.isArray(parsed.goals?.shortTerm) ? parsed.goals.shortTerm : [],
          longTerm: Array.isArray(parsed.goals?.longTerm) ? parsed.goals.longTerm : [],
          lifeGoal: parsed.goals?.lifeGoal || 'Life goal not provided'
        },
        secrets: request.includeSecrets ? (Array.isArray(parsed.secrets) ? parsed.secrets : []) : undefined,
        plotHooks: request.includePlotHooks ? (Array.isArray(parsed.plotHooks) ? parsed.plotHooks : []) : undefined,
        relationships: request.includeRelationships ? (Array.isArray(parsed.relationships) ? parsed.relationships : []) : undefined,
        mechanicalElements: request.includeMechanicalElements ? (Array.isArray(parsed.mechanicalElements) ? parsed.mechanicalElements : []) : undefined,
        mannerisms: Array.isArray(parsed.mannerisms) ? parsed.mannerisms : [],
        fears: Array.isArray(parsed.fears) ? parsed.fears : [],
        possessions: Array.isArray(parsed.possessions) ? parsed.possessions : [],
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('🧙‍♀️ Error parsing background response:', error);
      console.error('🧙‍♀️ Raw response:', response);
      return this.generateFallbackBackground(request);
    }
  }

  private applyRefinements(
    original: GeneratedCharacterBackground, 
    refinementResponse: string, 
    request: RefinementRequest
  ): GeneratedCharacterBackground {
    try {
      const refinements = JSON.parse(refinementResponse);
      
      // Apply refinements based on request type
      const updated = { ...original };
      
      if (request.targetSection && refinements[request.targetSection]) {
        (updated as any)[request.targetSection] = refinements[request.targetSection];
      } else {
        // Apply all refinements
        Object.keys(refinements).forEach(key => {
          if (key in updated) {
            (updated as any)[key] = refinements[key];
          }
        });
      }
      
      return updated;
    } catch (error) {
      console.error('Error applying refinements:', error);
      return original;
    }
  }

  private generateDemoBackground(request: CharacterBackgroundRequest): GeneratedCharacterBackground {
    const { race, characterClass, background, theme, tone, setting, includeSecrets, includePlotHooks, includeRelationships, includeMechanicalElements } = request;
    
    // Generate realistic demo content based on character specifications
    const demoContent = this.getDemoContent(race, characterClass, background, theme, tone, setting);
    
    const result: GeneratedCharacterBackground = {
      id: `bg_demo_${Date.now()}`,
      request,
      characterConcept: demoContent.characterConcept,
      backgroundSummary: demoContent.backgroundSummary,
      personalHistory: demoContent.personalHistory,
      personalityTraits: demoContent.personalityTraits,
      ideals: demoContent.ideals,
      bonds: demoContent.bonds,
      flaws: demoContent.flaws,
      motivations: demoContent.motivations,
      goals: demoContent.goals,
      mannerisms: demoContent.mannerisms,
      fears: demoContent.fears,
      possessions: demoContent.possessions,
      generatedAt: new Date()
    };

    // Add optional properties only if requested
    if (includeSecrets) {
      result.secrets = demoContent.secrets;
    }
    if (includePlotHooks) {
      result.plotHooks = demoContent.plotHooks;
    }
    if (includeRelationships) {
      result.relationships = demoContent.relationships;
    }
    if (includeMechanicalElements) {
      result.mechanicalElements = demoContent.mechanicalElements;
    }

    return result;
  }

  private generateFallbackBackground(request: CharacterBackgroundRequest): GeneratedCharacterBackground {
    const { race, characterClass, background, theme, tone, setting } = request;
    
    return {
      id: `bg_fallback_${Date.now()}`,
      request,
      characterConcept: `A ${theme} ${race} ${characterClass} with a ${background} background, shaped by ${setting} life`,
      backgroundSummary: `This ${race} ${characterClass} emerged from a ${background} lifestyle in a ${setting} environment. Their ${tone} demeanor reflects the ${theme} nature of their journey to becoming an adventurer.`,
      personalHistory: {
        earlyLife: `Born into a ${this.getBackgroundContext(background)} environment, this ${race} showed early signs of the traits that would define their ${characterClass} path.`,
        formativeEvents: `A series of ${theme} events in their ${setting} upbringing shaped their worldview and pushed them toward the ${characterClass} profession.`,
        recentPast: `Recent experiences in their ${background} role have prepared them for the challenges of adventuring life.`,
        howTheyBecameTheirClass: `Their ${background} background provided the foundation and motivation that naturally led to developing ${characterClass} abilities and embracing that calling.`
      },
      personalityTraits: [
        `Embodies the ${tone} nature typical of their ${race} heritage`,
        `Shows the focused determination expected of a ${characterClass}`,
        `Carries themselves with the confidence gained from their ${background} experience`
      ],
      ideals: [
        `Upholds the core values associated with the ${background} lifestyle`,
        `Believes in the ${theme} potential that drives their adventures`
      ],
      bonds: [
        `Maintains strong connections to their ${background} origins and community`,
        `Feels responsible for protecting those who share their ${setting} background`
      ],
      flaws: [
        `Sometimes struggles with the cultural expectations placed on ${race}s`,
        `Can be overly ${tone} in situations that require a different approach`
      ],
      motivations: {
        primary: `Driven by a ${theme} calling that combines their ${characterClass} abilities with their ${background} values`,
        secondary: [
          `Seeks to prove themselves worthy of their ${background} heritage`,
          `Wants to bring honor to their ${race} community`
        ]
      },
      goals: {
        shortTerm: [
          `Master the fundamental skills required of a ${characterClass}`,
          `Establish their reputation as a reliable adventurer`
        ],
        longTerm: [
          `Achieve recognition as a legendary ${characterClass}`,
          `Return to their ${setting} origins as a celebrated hero`
        ],
        lifeGoal: `To become a legendary figure who perfectly embodies the best qualities of their ${race} heritage, ${characterClass} profession, and ${background} values`
      },
      generatedAt: new Date()
    };
  }

  private getDemoContent(race: DNDRace, characterClass: DNDClass, background: DNDBackground, theme: BackgroundTheme, tone: BackgroundTone, setting: BackgroundSetting) {
    // Create realistic demo content based on the character combination
    const characterName = this.generateDemoName(race);
    const hometown = this.generateDemoLocation(setting);
    
    return {
      characterConcept: `${characterName}, a ${theme} ${race} ${characterClass} who rose from humble ${background} origins to become a formidable adventurer`,
      backgroundSummary: `Born in the ${setting} community of ${hometown}, ${characterName} lived the life of a ${background} until fate intervened. A series of ${theme} events shaped their ${tone} worldview and set them on the path of a ${characterClass}. Now they seek adventure, driven by both personal demons and a desire to prove themselves worthy of the legends they've heard since childhood.`,
      personalHistory: {
        earlyLife: `${characterName} grew up in ${hometown}, where their ${race} heritage made them stand out among the local population. As a child, they showed early signs of the ${characterClass} abilities that would define their future, often practicing with makeshift weapons and showing natural combat instincts.`,
        formativeEvents: `Everything changed when their community was threatened by bandits, and their ${background} skills proved crucial in the defense. This ${theme} experience taught ${characterName} that the world was far more dangerous and complex than they had imagined, ultimately pushing them toward mastering the ways of a ${characterClass}.`,
        recentPast: `In recent years, ${characterName} has been honing their ${characterClass} abilities while still maintaining their ${background} responsibilities. These experiences have prepared them for the adventuring life, though they still carry the weight of their past decisions.`,
        howTheyBecameTheirClass: `The transition from ${background} to ${characterClass} wasn't immediate. The skills learned as a ${background} provided an unexpected foundation for ${characterClass} training. Through determination and natural talent, they eventually mastered the core abilities that define a true ${characterClass}.`
      },
      personalityTraits: [
        `Always maintains the ${tone} demeanor expected of a dedicated ${characterClass}`,
        `Has a habit of unconsciously falling back on ${background} habits when nervous`,
        `Shows the distinctive traits typical of their ${race} heritage`
      ],
      ideals: [
        `Justice must be served, especially for those who cannot protect themselves`,
        `Believes that true strength comes from protecting others, not personal glory`
      ],
      bonds: [
        `The people of ${hometown} will always have a special place in my heart`,
        `Owes a debt to the mentor who first taught me the ways of a ${characterClass}`
      ],
      flaws: [
        `Can be overly ${tone} when dealing with authority figures`,
        `Sometimes struggles with the expectations others place on ${race} ${characterClass}s`
      ],
      motivations: {
        primary: `Seeks to prove that anyone can rise above their circumstances through dedication and skill`,
        secondary: [
          `Wants to prove that a ${background} can become legendary`,
          `Hopes to return home as a celebrated hero`
        ]
      },
      goals: {
        shortTerm: [
          `Master the advanced techniques of ${characterClass} combat`,
          `Build a reputation as a reliable party member`
        ],
        longTerm: [
          `Establish a stronghold or base of operations`,
          `Become known throughout the realm for heroic deeds`
        ],
        lifeGoal: `To transcend their ${background} origins and become a legend worthy of the greatest ${characterClass} heroes in history`
      },
      mannerisms: [
        `Unconsciously checks their equipment and weapons before resting`,
        `Always approaches new situations with a ${tone} attitude`,
        `Has a habit of unconsciously falling back on ${background} habits when nervous`
      ],
      fears: [
        `Terrified of being forced to return to their old ${background} life permanently`,
        `Deeply uncomfortable with the prejudices they faced growing up`
      ],
      possessions: [
        `A set of artisan tools from their former ${background} life`,
        `A well-maintained weapon that has served them faithfully`,
        `A worn journal filled with ${theme} poetry and personal reflections`
      ],
      secrets: [
        {
          type: 'past-deed' as const,
          description: `${characterName} once made a difficult choice that saved lives but violated their ${background} code and has never told anyone`,
          severity: 'major' as const,
          potentialConsequences: `If discovered, it could ruin their reputation and endanger their companions`
        }
      ],
      plotHooks: [
        {
          type: 'personal' as const,
          title: `The Return to ${hometown}`,
          description: `${characterName}'s former ${background} community in ${hometown} sends word that they need help with a crisis that only someone with their unique skills can handle`,
          urgency: 'medium' as const,
          dmGuidance: `This hook can be used to tie the character's past to current adventures`,
          potentialOutcomes: [
            `Character gains closure and peace with their past`,
            `Old enemies resurface to complicate the character's new life`,
            `Character discovers hidden truths about their origins`
          ]
        }
      ],
      relationships: [
        {
          name: this.generateDemoName('Human'),
          relationship: 'mentor' as const,
          description: `An old ${background} who taught ${characterName} important life lessons`,
          currentStatus: 'alive' as const,
          importance: 'significant' as const,
          plotPotential: `Could provide guidance, quest hooks, or become endangered`
        },
        {
          name: this.generateDemoName(race),
          relationship: 'rival' as const,
          description: `A former peer who chose a different path and now views ${characterName} as a traitor to their roots`,
          currentStatus: 'unknown' as const,
          importance: 'minor' as const,
          plotPotential: `Could emerge as an antagonist or eventually become an ally`
        }
      ],
      mechanicalElements: [
        {
          type: 'skill-proficiency' as const,
          name: `Animal Handling`,
          description: `Proficiency gained from ${background} background`,
          gameEffect: `+proficiency bonus to Animal Handling checks`,
          source: 'background' as const
        },
        {
          type: 'equipment' as const,
          name: `Set of artisan's tools`,
          description: `Standard equipment from ${background} background`,
          source: 'background' as const
        }
      ]
    };
  }

  private generateDemoName(race: DNDRace): string {
    const names: Record<string, string[]> = {
      'Human': ['Gareth', 'Elena', 'Marcus', 'Lyra', 'Theron'],
      'Elf': ['Aelar', 'Aerdrie', 'Ahvenna', 'Aramil', 'Aranea'],
      'Dwarf': ['Adrik', 'Alberich', 'Baern', 'Darrak', 'Eberk'],
      'Halfling': ['Alton', 'Ander', 'Bernie', 'Bobbin', 'Cade'],
      'Dragonborn': ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh'],
      'Gnome': ['Alston', 'Alvyn', 'Boddynock', 'Brocc', 'Burgell'],
      'Half-Elf': ['Aerdrie', 'Ahvenna', 'Aramil', 'Berrian', 'Dayereth'],
      'Half-Orc': ['Dench', 'Feng', 'Gell', 'Henk', 'Holg'],
      'Tiefling': ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon']
    };
    const raceNames = names[race] || names['Human'];
    return raceNames[Math.floor(Math.random() * raceNames.length)];
  }

  private generateDemoLocation(setting: BackgroundSetting): string {
    const locations: Record<string, string[]> = {
      'urban': ['Waterdeep', 'Baldur\'s Gate', 'Neverwinter'],
      'rural': ['Greenest', 'Phandalin', 'Red Larch'],
      'wilderness': ['the Sword Coast', 'the High Forest', 'the Anauroch Desert'],
      'noble-court': ['Cormyr', 'Tethyr', 'Amn'],
      'military': ['Citadel Adbar', 'Helm\'s Hold', 'the Moonshae Isles']
    };
    const settingLocations = locations[setting] || locations['rural'];
    return settingLocations[Math.floor(Math.random() * settingLocations.length)];
  }

  private getBackgroundInfo(background: DNDBackground): string {
    const backgroundDetails: Partial<Record<DNDBackground, string>> = {
      'Acolyte': 'Religious devotee with temple connections',
      'Criminal': 'Lawbreaker with underworld contacts',
      'Folk Hero': 'Common person who became a local legend',
      'Noble': 'Aristocrat with wealth and social connections',
      'Sage': 'Scholar seeking knowledge and truth',
      'Soldier': 'Military veteran with combat experience',
      'Charlatan': 'Con artist skilled in deception',
      'Entertainer': 'Performer who captivates audiences',
      'Guild Artisan': 'Skilled craftsperson with trade connections',
      'Hermit': 'Recluse who discovered important truths',
      'Outlander': 'Wilderness dweller far from civilization',
      'Sailor': 'Seafarer familiar with ships and ports'
    };
    
    return backgroundDetails[background] || '';
  }

  private getClassInfo(characterClass: DNDClass): string {
    const classDetails: Partial<Record<DNDClass, string>> = {
      'Barbarian': 'Primal warrior fueled by rage',
      'Bard': 'Master of song, speech, and magic',
      'Cleric': 'Divine spellcaster and healer',
      'Druid': 'Nature priest and shapeshifter',
      'Fighter': 'Master of martial combat',
      'Monk': 'Martial artist channeling inner power',
      'Paladin': 'Holy warrior bound by sacred oaths',
      'Ranger': 'Wilderness tracker and hunter',
      'Rogue': 'Skilled in stealth and precision',
      'Sorcerer': 'Innate magical talent',
      'Warlock': 'Magic through otherworldly pact',
      'Wizard': 'Scholar of arcane magic'
    };
    
    return classDetails[characterClass] || '';
  }

  private getRaceInfo(race: DNDRace): string {
    // Reuse race context from fantasy name generator if needed
    return '';
  }

  private getBackgroundContext(background: DNDBackground): string {
    const contexts: Partial<Record<DNDBackground, string>> = {
      'Acolyte': 'religious',
      'Criminal': 'criminal',
      'Folk Hero': 'humble',
      'Noble': 'privileged',
      'Sage': 'scholarly',
      'Soldier': 'military'
    };
    
    return contexts[background] || 'varied';
  }
}

export const characterBackgroundGeneratorService = new CharacterBackgroundGeneratorService();
export default characterBackgroundGeneratorService; 