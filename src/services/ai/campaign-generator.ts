/**
 * @fileoverview D&D Campaign Generation Service using OpenAI GPT-4
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * This service provides AI-powered campaign generation specifically for D&D 5e,
 * with support for 2-hour campaigns, encounter balance, and interactive refinement.
 */

import OpenAI from 'openai';
import type { UserProfile } from '@/types/auth';
import { isDnDTerm, CAMPAIGN_STYLE_GUIDELINES } from './dnd-dictionary';

// Initialize OpenAI client
let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Only for demo - use backend in production
    });
    console.log('🎲 Campaign Generator: OpenAI client initialized');
  } else {
    console.log('🎲 Campaign Generator: Running in demo mode');
  }
} catch (error) {
  console.warn('🎲 Campaign Generator: Failed to initialize OpenAI client:', error);
}

export interface CampaignParameters {
  // Basic Information
  title?: string;
  duration: number; // in hours
  playerCount: number;
  characterLevel: number;
  
  // Setting & Theme
  setting: 'urban' | 'wilderness' | 'dungeon' | 'planar' | 'mixed' | 'custom';
  theme: 'adventure' | 'mystery' | 'horror' | 'political' | 'exploration' | 'combat' | 'social' | 'custom';
  tone: 'serious' | 'comedic' | 'dramatic' | 'lighthearted' | 'dark' | 'heroic';
  
  // Content Preferences
  combatBalance: 'light' | 'moderate' | 'heavy'; // Percentage of session spent in combat
  roleplayBalance: 'light' | 'moderate' | 'heavy'; // Percentage spent on roleplay/social
  explorationBalance: 'light' | 'moderate' | 'heavy'; // Percentage spent exploring
  
  // Optional Customization
  customSetting?: string;
  customTheme?: string;
  specialRequests?: string;
}

export interface GeneratedCampaign {
  id: string;
  title: string;
  parameters: CampaignParameters;
  
  // Campaign Structure
  introduction: string;
  plotHooks: string[];
  encounters: CampaignEncounter[];
  conclusion: string;
  
  // Supporting Materials
  npcs: CampaignNPC[];
  locations: CampaignLocation[];
  statBlocks?: StatBlock[];
  handouts?: string[];
  
  // Metadata
  estimatedDuration: number; // in minutes
  difficultyRating: 'easy' | 'medium' | 'hard' | 'deadly';
  generatedAt: Date;
  lastRefinedAt?: Date;
}

export interface CampaignEncounter {
  id: string;
  title: string;
  type: 'combat' | 'social' | 'exploration' | 'puzzle' | 'trap';
  description: string;
  estimatedDuration: number; // in minutes
  difficultyLevel: number; // 1-10 scale
  statBlockIds?: string[]; // References to stat blocks
  notes?: string;
  order: number;
}

export interface CampaignNPC {
  id: string;
  name: string;
  race: string;
  role: string;
  personality: string;
  motivation: string;
  description: string;
  statBlockId?: string;
}

export interface CampaignLocation {
  id: string;
  name: string;
  type: string;
  description: string;
  encounters?: string[]; // Encounter IDs that happen here
  notes?: string;
}

export interface StatBlock {
  id: string;
  name: string;
  type: 'monster' | 'npc' | 'custom';
  challengeRating: string;
  stats: string; // Formatted stat block content
  aideddUrl?: string; // URL to aidedd.org stat block
}

export interface RefinementRequest {
  campaignId: string;
  requestType: 'modify_encounter' | 'add_encounter' | 'remove_encounter' | 'change_theme' | 'adjust_balance' | 'add_npc' | 'modify_location' | 'general';
  description: string;
  targetSection?: string; // Which part of the campaign to modify
}

export interface RefinementResponse {
  success: boolean;
  updatedCampaign: GeneratedCampaign;
  changes: string[]; // List of changes made
  suggestions?: string[]; // Additional suggestions
}

/**
 * Generate a complete D&D campaign based on parameters
 */
export async function generateCampaign(
  parameters: CampaignParameters,
  userProfile: UserProfile
): Promise<GeneratedCampaign> {
  console.log('🎲 Generating D&D campaign with parameters:', parameters);

  if (openai) {
    try {
      const systemPrompt = createCampaignSystemPrompt(parameters);
      const userPrompt = createCampaignUserPrompt(parameters);

      console.log('🎲 Calling OpenAI for campaign generation...');
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8, // Higher creativity for campaign generation
        max_tokens: 4000,
      });

      const generatedContent = response.choices[0].message.content;
      if (!generatedContent) {
        throw new Error('No content generated');
      }

      const campaign = parseCampaignResponse(generatedContent, parameters);
      console.log('🎲 Campaign generated successfully:', campaign.title);
      return campaign;

    } catch (error) {
      console.error('🎲 Error generating campaign with OpenAI:', error);
      console.log('🎲 Falling back to demo campaign generation');
    }
  }

  // Demo mode fallback
  return generateDemoCampaign(parameters);
}

/**
 * Refine an existing campaign based on user feedback
 */
export async function refineCampaign(
  campaign: GeneratedCampaign,
  refinementRequest: RefinementRequest,
  userProfile: UserProfile
): Promise<RefinementResponse> {
  console.log('🎲 Refining campaign:', refinementRequest);
  console.log('🎲 OpenAI available:', !!openai);

  if (openai) {
    console.log('🎲 Using OpenAI refinement path');
    try {
      const systemPrompt = createRefinementSystemPrompt(campaign);
      const userPrompt = createRefinementUserPrompt(refinementRequest);

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const refinementContent = response.choices[0].message.content;
      if (!refinementContent) {
        throw new Error('No refinement content generated');
      }

      console.log('🎲 OpenAI refinement response:', refinementContent);
      const refinementResult = parseRefinementResponse(refinementContent, campaign);
      console.log('🎲 Parsed refinement result:', refinementResult);
      console.log('🎲 Campaign refined successfully');
      return refinementResult;

    } catch (error) {
      console.error('🎲 Error refining campaign with OpenAI:', error);
    }
  }

  // Demo mode fallback
  console.log('🎲 Using demo refinement fallback');
  return generateDemoRefinement(campaign, refinementRequest);
}

/**
 * Create system prompt for campaign generation
 */
function createCampaignSystemPrompt(parameters: CampaignParameters): string {
  return `You are an expert Dungeon Master and campaign designer for Dungeons & Dragons 5th Edition. You specialize in creating engaging, balanced, and memorable ${parameters.duration}-hour campaigns.

Key Guidelines:
- Create campaigns that can be completed in exactly ${parameters.duration} hours
- Balance combat (${parameters.combatBalance}), roleplay (${parameters.roleplayBalance}), and exploration (${parameters.explorationBalance})
- Design for ${parameters.playerCount} players at level ${parameters.characterLevel}
- Maintain a ${parameters.tone} tone throughout
- Use ${parameters.setting} settings with ${parameters.theme} themes
- Include specific timing estimates for each encounter
- Provide clear pacing to keep players engaged
- Leave room for player agency and improvisation

Campaign Structure Requirements:
1. Introduction (5-10 minutes): Hook and setup
2. 3-5 Main Encounters: Mix of combat, social, and exploration
3. Conclusion (10-15 minutes): Resolution and rewards
4. Include 1-2 optional encounters for pacing flexibility

For each encounter, provide:
- Clear objectives and win conditions
- Estimated duration
- Difficulty appropriate for the party level
- Backup plans for different player approaches

IMPORTANT FORMATTING REQUIREMENTS:
- NPCs must have unique, specific personalities, motivations, and descriptions - NO generic content
- Locations must have creative names, specific types (Inn, Dungeon, Forest, etc.), and detailed descriptions  
- Follow the exact format specified in the user prompt for NPCs and Locations
- Avoid generic fallbacks like "Friendly and helpful" or "A helpful character"
- Make each NPC and Location memorable and unique to this specific campaign

Respond in a structured format that can be easily parsed and presented to the DM.`;
}

/**
 * Create user prompt for campaign generation
 */
function createCampaignUserPrompt(parameters: CampaignParameters): string {
  let prompt = `Generate a ${parameters.duration}-hour D&D 5e campaign for ${parameters.playerCount} level ${parameters.characterLevel} characters.

Setting: ${parameters.setting}${parameters.customSetting ? ` (${parameters.customSetting})` : ''}
Theme: ${parameters.theme}${parameters.customTheme ? ` (${parameters.customTheme})` : ''}
Tone: ${parameters.tone}

Balance Requirements:
- Combat: ${parameters.combatBalance}
- Roleplay: ${parameters.roleplayBalance}  
- Exploration: ${parameters.explorationBalance}

${parameters.specialRequests ? `Special Requests: ${parameters.specialRequests}` : ''}

Please structure the response as follows:

CAMPAIGN TITLE: [Creative title]

INTRODUCTION:
[How the story begins - opening scene and crucial information for the DM and players to start the campaign with clear direction and purpose - 5-10 minutes]

PLOT HOOKS:
[3-5 specific engaging elements that will keep players entertained and motivated throughout the campaign - these should be different from the introduction and highlight key narrative threads]

ENCOUNTER 1: [Title]
Type: [combat/social/exploration/puzzle]
Duration: [X minutes]
Description: [Detailed description]
Objectives: [What players need to accomplish]

[Continue for 3-5 encounters]

CONCLUSION:
[Resolution and rewards - 10-15 minutes]

NPCS:
[Format each NPC exactly as follows - one NPC per paragraph:]

NPC Name: [Actual name of the NPC - NOT "NPC 1"]
Race: [Specific race like Human, Elf, Dwarf, etc. - NOT generic terms]
Role: [Specific role like Tavern Keeper, Village Elder, Merchant, etc.]
Personality: [Unique personality traits specific to this character - NOT generic]
Motivation: [Character-specific goals and desires - NOT generic]
Description: [Detailed description of the character's role in the campaign and importance]

[Repeat the above format for each NPC]

LOCATIONS:
[Format each location exactly as follows - one location per paragraph:]

Location Name: [Specific name of the location]
Type: [Specific type like Inn, Dungeon, Forest, City, Mansion, etc. - NOT just "Area"]
Description: [Detailed description explaining the location's importance to the campaign and what happens there]

[Repeat the above format for each location]



PACING NOTES:
[Tips for maintaining good pacing and handling different player approaches]`;

  return prompt;
}

/**
 * Parse OpenAI campaign response into structured data
 */
function parseCampaignResponse(content: string, parameters: CampaignParameters): GeneratedCampaign {
  // This is a simplified parser - in production, you'd want more robust parsing
  const lines = content.split('\n');
  
  let title = 'Generated Campaign';
  let introduction = '';
  let conclusion = '';
  const encounters: CampaignEncounter[] = [];
  const npcs: CampaignNPC[] = [];
  const locations: CampaignLocation[] = [];
  
  // Extract title
  const titleMatch = content.match(/CAMPAIGN TITLE:\s*(.+)/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  
  // Extract introduction
  const introMatch = content.match(/INTRODUCTION:\s*([\s\S]*?)(?=PLOT HOOKS:|ENCOUNTER|$)/i);
  if (introMatch) {
    introduction = introMatch[1].trim();
  }
  
  // Extract plot hooks
  let plotHooks: string[] = [];
  const plotHooksMatch = content.match(/PLOT HOOKS:\s*([\s\S]*?)(?=ENCOUNTER|$)/i);
  if (plotHooksMatch) {
    const plotHooksText = plotHooksMatch[1].trim();
    // Split by bullet points, dashes, or numbered lists
    plotHooks = plotHooksText
      .split(/(?:^|\n)(?:[-•*]|\d+\.)\s+/)
      .filter(hook => hook.trim().length > 0)
      .map(hook => hook.trim());
    
    // If no bullet points found, treat the whole text as one plot hook
    if (plotHooks.length <= 1) {
      plotHooks = [plotHooksText];
    }
  }
  
  // Extract encounters (simplified - would need more robust parsing)
  const encounterMatches = content.match(/ENCOUNTER \d+:[\s\S]*?(?=ENCOUNTER \d+:|CONCLUSION:|NPCS:|$)/gi);
  if (encounterMatches) {
    encounterMatches.forEach((match, index) => {
      const titleMatch = match.match(/ENCOUNTER \d+:\s*(.+)/);
      const typeMatch = match.match(/Type:\s*(\w+)/);
      const durationMatch = match.match(/Duration:\s*(\d+)/);
      const descMatch = match.match(/Description:\s*([\s\S]*?)(?=Objectives:|$)/);
      
      encounters.push({
        id: `encounter-${index + 1}`,
        title: titleMatch?.[1]?.trim() || `Encounter ${index + 1}`,
        type: (typeMatch?.[1] as any) || 'combat',
        description: descMatch?.[1]?.trim() || '',
        estimatedDuration: parseInt(durationMatch?.[1] || '30'),
        difficultyLevel: 5,
        order: index + 1
      });
    });
  }

  // Extract conclusion
  const conclusionMatch = content.match(/CONCLUSION:\s*([\s\S]*?)(?=NPCS:|LOCATIONS:|$)/i);
  if (conclusionMatch) {
    conclusion = conclusionMatch[1].trim();
  }

  // Extract NPCs
  const npcsMatch = content.match(/NPCS:\s*([\s\S]*?)(?=LOCATIONS:|STAT BLOCKS:|HANDOUTS:|PACING NOTES:|$)/i);
  if (npcsMatch) {
    const npcsText = npcsMatch[1].trim();
    // Split by lines that start with "NPC Name:"
    const npcLines = npcsText.split(/\n(?=NPC Name:)/i);
    
    npcLines.forEach((npcText, index) => {
      if (npcText.trim()) {
        // Try to extract NPC information from the text
        const nameMatch = npcText.match(/NPC Name:\s*([^\n]+)/i);
        const raceMatch = npcText.match(/Race:\s*([^\n]+)/i);
        const roleMatch = npcText.match(/Role:\s*([^\n]+)/i);
        const personalityMatch = npcText.match(/Personality:\s*([^\n]+)/i);
        const motivationMatch = npcText.match(/Motivation:\s*([^\n]+)/i);
        const descriptionMatch = npcText.match(/Description:\s*([^\n]+)/i);

        const name = nameMatch?.[1]?.trim() || `NPC ${index + 1}`;
        const race = raceMatch?.[1]?.trim() || 'Human';
        const role = roleMatch?.[1]?.trim() || 'Villager';
        const personality = personalityMatch?.[1]?.trim() || 'Friendly and helpful';
        const motivation = motivationMatch?.[1]?.trim() || 'Help the party succeed';
        const description = descriptionMatch?.[1]?.trim() || npcText.split('\n')[1]?.trim() || 'A helpful character the party encounters';

        npcs.push({
          id: `npc-${index + 1}`,
          name,
          race,
          role,
          personality,
          motivation,
          description
        });
      }
    });
  }

  // Extract locations
  const locationsMatch = content.match(/LOCATIONS:\s*([\s\S]*?)(?=STAT BLOCKS:|HANDOUTS:|PACING NOTES:|$)/i);
  if (locationsMatch) {
    const locationsText = locationsMatch[1].trim();
    const locationLines = locationsText.split(/\n(?=Location Name:)/i);
    
    locationLines.forEach((locationText, index) => {
      if (locationText.trim()) {
        const nameMatch = locationText.match(/Location Name:\s*([^\n]+)/i);
        const typeMatch = locationText.match(/Type:\s*([^\n]+)/i);
        const descriptionMatch = locationText.match(/Description:\s*([^\n]+)/i);

        const name = nameMatch?.[1]?.trim() || `Location ${index + 1}`;
        const type = typeMatch?.[1]?.trim() || 'Area';
        const description = descriptionMatch?.[1]?.trim() || locationText.split('\n')[1]?.trim() || 'An important location in the campaign';

        locations.push({
          id: `location-${index + 1}`,
          name,
          type,
          description
        });
      }
    });
  }


  
  const result: GeneratedCampaign = {
    id: `campaign-${Date.now()}`,
    title,
    parameters,
    introduction,
    plotHooks: plotHooks.length > 0 ? plotHooks : [introduction], // Use extracted plot hooks or fallback to introduction
    encounters,
    conclusion,
    npcs,
    locations,
    estimatedDuration: parameters.duration * 60,
    difficultyRating: 'medium',
    generatedAt: new Date()
  };



  return result;
}

/**
 * Generate demo campaign for when OpenAI is not available
 */
function generateDemoCampaign(parameters: CampaignParameters): GeneratedCampaign {
  const campaignId = `demo-campaign-${Date.now()}`;
  
  const result: GeneratedCampaign = {
    id: campaignId,
    title: `The ${parameters.setting === 'urban' ? 'City' : 'Forgotten'} ${parameters.theme === 'mystery' ? 'Mystery' : 'Adventure'}`,
    parameters,
    introduction: `The adventure begins as the party ${parameters.setting === 'urban' ? 'arrives in the bustling port city of Goldbrook during the evening market rush' : 'emerges from a three-day trek through the Whispering Woods at dawn'}. ${parameters.setting === 'urban' ? 'Captain Marcus Ironvale of the city watch' : 'Elder Thalwin Oakenheart'} urgently approaches them with news: ${parameters.theme === 'mystery' ? 'three prominent citizens have vanished without a trace in the past week, and panic is spreading' : 'ancient dwarven ruins have been discovered, but dangerous creatures now guard them'}. The ${parameters.setting === 'urban' ? 'captain' : 'elder'} needs experienced adventurers to investigate immediately before ${parameters.theme === 'mystery' ? 'more people disappear' : 'other treasure hunters arrive'}.`,
    plotHooks: [
      `The ${parameters.theme === 'mystery' ? 'missing persons all visited the same location' : 'ruins contain legendary dwarven artifacts'} - what connects them drives the main investigation`,
      `A mysterious ${parameters.theme === 'mystery' ? 'hooded figure has been seen near each disappearance site' : 'guardian creature seems to be protecting something specific'} - this recurring element keeps players engaged`,
      `The reward offered increases as urgency grows - ${parameters.theme === 'mystery' ? 'families of the missing grow desperate' : 'competing adventuring parties are already en route'}`,
      `Personal stakes arise when ${parameters.theme === 'mystery' ? 'someone the party cares about becomes the next target' : 'the party discovers their own history is connected to the ruins'}`
    ],
    encounters: [
      {
        id: `${campaignId}-enc-1`,
        title: 'Initial Investigation',
        type: 'social',
        description: `The party gathers information from locals about the ${parameters.theme === 'mystery' ? 'missing persons' : 'dangerous ruins'}. Key NPCs provide clues and warnings.`,
        estimatedDuration: Math.round((parameters.duration * 60) * 0.2),
        difficultyLevel: 3,
        order: 1
      },
      {
        id: `${campaignId}-enc-2`,
        title: `${parameters.setting === 'urban' ? 'Underworld' : 'Forest'} Confrontation`,
        type: parameters.combatBalance === 'heavy' ? 'combat' : 'exploration',
        description: `The party ${parameters.setting === 'urban' ? 'descends into the sewers' : 'ventures deeper into the woods'} where they encounter ${parameters.combatBalance === 'heavy' ? 'hostile creatures' : 'environmental challenges'}.`,
        estimatedDuration: Math.round((parameters.duration * 60) * 0.4),
        difficultyLevel: parameters.characterLevel <= 3 ? 4 : 6,
        order: 2
      },
      {
        id: `${campaignId}-enc-3`,
        title: 'The Final Revelation',
        type: parameters.combatBalance !== 'light' ? 'combat' : 'social',
        description: `The truth is revealed as the party faces the ${parameters.theme === 'mystery' ? 'mastermind behind the disappearances' : 'guardian of the ancient secrets'}.`,
        estimatedDuration: Math.round((parameters.duration * 60) * 0.3),
        difficultyLevel: 7,
        order: 3
      }
    ],
    conclusion: `With the ${parameters.theme === 'mystery' ? 'mystery solved' : 'treasure secured'} and the threat neutralized, the party returns to town as heroes. They receive their promised reward and the gratitude of the ${parameters.setting === 'urban' ? 'citizens' : 'local inhabitants'}.`,
    npcs: [
      {
        id: `${campaignId}-npc-1`,
        name: parameters.setting === 'urban' ? 'Captain Marcus Ironvale' : 'Elder Thalwin Oakenheart',
        race: 'Human',
        role: parameters.setting === 'urban' ? 'City Guard Captain' : 'Village Elder',
        personality: 'Stern but fair, deeply concerned about recent events',
        motivation: 'Protect the community from the growing threat',
        description: `A weathered ${parameters.setting === 'urban' ? 'soldier' : 'leader'} with years of experience dealing with local troubles`
      },
      {
        id: `${campaignId}-npc-2`,
        name: parameters.theme === 'mystery' ? 'Lydia Shadowmere' : 'Gorin Treasurefinder',
        race: parameters.theme === 'mystery' ? 'Half-Elf' : 'Dwarf',
        role: parameters.theme === 'mystery' ? 'Private Investigator' : 'Treasure Hunter',
        personality: parameters.theme === 'mystery' ? 'Observant and suspicious' : 'Greedy but knowledgeable',
        motivation: parameters.theme === 'mystery' ? 'Uncover the truth' : 'Find the ancient treasures',
        description: `A ${parameters.theme === 'mystery' ? 'sharp-eyed investigator' : 'experienced explorer'} with crucial information`
      }
    ],
    locations: [
      {
        id: `${campaignId}-loc-1`,
        name: parameters.setting === 'urban' ? 'The Rusty Anchor Tavern' : 'Moonwell Clearing',
        type: parameters.setting === 'urban' ? 'Tavern' : 'Sacred Grove',
        description: `The ${parameters.setting === 'urban' ? 'main gathering place where information can be gathered' : 'mystical location where the adventure begins'}`
      },
      {
        id: `${campaignId}-loc-2`,
        name: parameters.setting === 'urban' ? 'Underground Network' : 'The Forgotten Ruins',
        type: parameters.setting === 'urban' ? 'Sewers/Tunnels' : 'Ancient Structure',
        description: `The primary location where the main conflict takes place`
      }
    ],
    estimatedDuration: parameters.duration * 60,
    difficultyRating: parameters.characterLevel <= 2 ? 'easy' : parameters.characterLevel >= 5 ? 'hard' : 'medium',
    generatedAt: new Date()
  };



  return result;
}

/**
 * Generate appropriate stat blocks for a campaign based on parameters
 */
function generateStatBlocksForCampaign(parameters: CampaignParameters, campaignId: string): StatBlock[] {
  const statBlocks: StatBlock[] = [];
  const level = parameters.characterLevel;
  
  // Determine appropriate creatures based on setting, theme, and level
  if (parameters.theme === 'mystery') {
    // Mystery campaigns - urban intrigue creatures
    if (parameters.setting === 'urban') {
      // Urban mystery creatures
      statBlocks.push(
        createStatBlock(`${campaignId}-stat-1`, 'Cultist', 'monster', '1/8', getMonsterManualStatBlock('Cultist')),
        createStatBlock(`${campaignId}-stat-2`, 'Spy', 'monster', '1', getMonsterManualStatBlock('Spy')),
        createStatBlock(`${campaignId}-stat-3`, 'Thug', 'monster', '1/2', getMonsterManualStatBlock('Thug'))
      );
      
      if (level >= 3) {
        statBlocks.push(createStatBlock(`${campaignId}-stat-4`, 'Cult Fanatic', 'monster', '2', getMonsterManualStatBlock('Cult Fanatic')));
      }
      
      if (level >= 5) {
        statBlocks.push(createStatBlock(`${campaignId}-stat-5`, 'Doppelganger', 'monster', '3', getMonsterManualStatBlock('Doppelganger')));
      }
    } else {
      // Wilderness/dungeon mystery creatures
      statBlocks.push(
        createStatBlock(`${campaignId}-stat-1`, 'Wolf', 'monster', '1/4', getMonsterManualStatBlock('Wolf')),
        createStatBlock(`${campaignId}-stat-2`, 'Shadow', 'monster', '1/2', getMonsterManualStatBlock('Shadow')),
        createStatBlock(`${campaignId}-stat-3`, 'Ghoul', 'monster', '1', getMonsterManualStatBlock('Ghoul'))
      );
      
      if (level >= 4) {
        statBlocks.push(createStatBlock(`${campaignId}-stat-4`, 'Owlbear', 'monster', '3', getMonsterManualStatBlock('Owlbear')));
      }
    }
  } else {
    // Adventure campaigns - classic adventure creatures
    if (parameters.setting === 'dungeon' || parameters.setting === 'wilderness') {
      statBlocks.push(
        createStatBlock(`${campaignId}-stat-1`, 'Goblin', 'monster', '1/4', getMonsterManualStatBlock('Goblin')),
        createStatBlock(`${campaignId}-stat-2`, 'Orc', 'monster', '1/2', getMonsterManualStatBlock('Orc')),
        createStatBlock(`${campaignId}-stat-3`, 'Bugbear', 'monster', '1', getMonsterManualStatBlock('Bugbear'))
      );
      
      if (level >= 3) {
        statBlocks.push(createStatBlock(`${campaignId}-stat-4`, 'Ogre', 'monster', '2', getMonsterManualStatBlock('Ogre')));
      }
      
      if (level >= 5) {
        statBlocks.push(createStatBlock(`${campaignId}-stat-5`, 'Troll', 'monster', '5', getMonsterManualStatBlock('Troll')));
      }
    } else {
      // Urban adventure creatures
      statBlocks.push(
        createStatBlock(`${campaignId}-stat-1`, 'Guard', 'monster', '1/8', getMonsterManualStatBlock('Guard')),
        createStatBlock(`${campaignId}-stat-2`, 'Bandit', 'monster', '1/8', getMonsterManualStatBlock('Bandit')),
        createStatBlock(`${campaignId}-stat-3`, 'Veteran', 'monster', '3', getMonsterManualStatBlock('Veteran'))
      );
    }
  }
  
  // Add key NPCs
  statBlocks.push(
    createStatBlock(
      `${campaignId}-npc-1`, 
      parameters.setting === 'urban' ? 'Captain Marcus Ironvale' : 'Elder Thalwin Oakenheart',
      'npc',
      '2',
      getNPCStatBlock(parameters.setting === 'urban' ? 'Captain' : 'Elder')
    )
  );
  
  return statBlocks;
}

/**
 * Mapping of monster names to their aidedd.org URLs
 */
const AIDEDD_MONSTER_URLS: Record<string, string> = {
  'Cultist': 'https://www.aidedd.org/dnd/monstres.php?vo=cultist',
  'Spy': 'https://www.aidedd.org/dnd/monstres.php?vo=spy',
  'Thug': 'https://www.aidedd.org/dnd/monstres.php?vo=thug',
  'Cult Fanatic': 'https://www.aidedd.org/dnd/monstres.php?vo=cult-fanatic',
  'Doppelganger': 'https://www.aidedd.org/dnd/monstres.php?vo=doppelganger',
  'Wolf': 'https://www.aidedd.org/dnd/monstres.php?vo=wolf',
  'Shadow': 'https://www.aidedd.org/dnd/monstres.php?vo=shadow',
  'Ghoul': 'https://www.aidedd.org/dnd/monstres.php?vo=ghoul',
  'Owlbear': 'https://www.aidedd.org/dnd/monstres.php?vo=owlbear',
  'Goblin': 'https://www.aidedd.org/dnd/monstres.php?vo=goblin',
  'Orc': 'https://www.aidedd.org/dnd/monstres.php?vo=orc',
  'Bugbear': 'https://www.aidedd.org/dnd/monstres.php?vo=bugbear',
  'Ogre': 'https://www.aidedd.org/dnd/monstres.php?vo=ogre',
  'Troll': 'https://www.aidedd.org/dnd/monstres.php?vo=troll',
  'Guard': 'https://www.aidedd.org/dnd/monstres.php?vo=guard',
  'Bandit': 'https://www.aidedd.org/dnd/monstres.php?vo=bandit',
  'Veteran': 'https://www.aidedd.org/dnd/monstres.php?vo=veteran',
  'Dire Wolf': 'https://www.aidedd.org/dnd/monstres.php?vo=dire-wolf',
  'Kobold': 'https://www.aidedd.org/dnd/monstres.php?vo=kobold',
  'Hobgoblin': 'https://www.aidedd.org/dnd/monstres.php?vo=hobgoblin',
  'Gnoll': 'https://www.aidedd.org/dnd/monstres.php?vo=gnoll',
  'Skeleton': 'https://www.aidedd.org/dnd/monstres.php?vo=skeleton',
  'Zombie': 'https://www.aidedd.org/dnd/monstres.php?vo=zombie',
  'Minotaur': 'https://www.aidedd.org/dnd/monstres.php?vo=minotaur',
  'Displacer Beast': 'https://www.aidedd.org/dnd/monstres.php?vo=displacer-beast',
  'Rust Monster': 'https://www.aidedd.org/dnd/monstres.php?vo=rust-monster',
  'Gelatinous Cube': 'https://www.aidedd.org/dnd/monstres.php?vo=gelatinous-cube'
};

/**
 * Helper function to create a stat block object
 */
function createStatBlock(id: string, name: string, type: 'monster' | 'npc' | 'custom', challengeRating: string, stats: string): StatBlock {
  const statBlock: StatBlock = {
    id,
    name,
    type,
    challengeRating,
    stats
  };
  
  if (type === 'monster' && AIDEDD_MONSTER_URLS[name]) {
    statBlock.aideddUrl = AIDEDD_MONSTER_URLS[name];
  }
  
  return statBlock;
}

/**
 * Get properly formatted stat blocks (SRD-compliant content only)
 */
function getMonsterManualStatBlock(creatureName: string): string {
  const statBlocks: Record<string, string> = {
    'Dire Wolf': `<div class="stat-block">
<h3 class="stat-block-name">Dire Wolf</h3>
<p class="stat-block-meta"><em>Large beast, unaligned</em></p>
<hr class="stat-block-divider">
<p><strong>Armor Class</strong> 14 (natural armor)</p>
<p><strong>Hit Points</strong> 37 (5d10 + 10)</p>
<p><strong>Speed</strong> 50 ft.</p>
<hr class="stat-block-divider">
<table class="stat-block-abilities">
<tr>
<th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
</tr>
<tr>
<td>17 (+3)</td><td>15 (+2)</td><td>15 (+2)</td><td>3 (-4)</td><td>12 (+1)</td><td>7 (-2)</td>
</tr>
</table>
<hr class="stat-block-divider">
<p><strong>Skills</strong> Perception +3, Stealth +4</p>
<p><strong>Senses</strong> passive Perception 13</p>
<p><strong>Languages</strong> —</p>
<p><strong>Challenge</strong> 1 (200 XP)</p>
<hr class="stat-block-divider">
<p><strong>Keen Hearing and Smell.</strong> The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell.</p>
<p><strong>Pack Tactics.</strong> The wolf has advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally isn't incapacitated.</p>
<hr class="stat-block-divider">
<h4>Actions</h4>
<p><strong>Bite.</strong> <em>Melee Weapon Attack:</em> +5 to hit, reach 5 ft., one target. <em>Hit:</em> 10 (2d6 + 3) piercing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone.</p>
</div>`,

    'Goblin': `<div class="stat-block">
<h3 class="stat-block-name">Goblin</h3>
<p class="stat-block-meta"><em>Small humanoid (goblinoid), neutral evil</em></p>
<hr class="stat-block-divider">
<p><strong>Armor Class</strong> 15 (Leather Armor, Shield)</p>
<p><strong>Hit Points</strong> 7 (2d6)</p>
<p><strong>Speed</strong> 30 ft.</p>
<hr class="stat-block-divider">
<table class="stat-block-abilities">
<tr>
<th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
</tr>
<tr>
<td>8 (-1)</td><td>14 (+2)</td><td>10 (+0)</td><td>10 (+0)</td><td>8 (-1)</td><td>8 (-1)</td>
</tr>
</table>
<hr class="stat-block-divider">
<p><strong>Skills</strong> Stealth +6</p>
<p><strong>Senses</strong> darkvision 60 ft., passive Perception 9</p>
<p><strong>Languages</strong> Common, Goblin</p>
<p><strong>Challenge</strong> 1/4 (50 XP)</p>
<hr class="stat-block-divider">
<p><strong>Nimble Escape.</strong> The goblin can take the Disengage or Hide action as a bonus action on each of its turns.</p>
<hr class="stat-block-divider">
<h4>Actions</h4>
<p><strong>Scimitar.</strong> <em>Melee Weapon Attack:</em> +4 to hit, reach 5 ft., one target. <em>Hit:</em> 5 (1d6 + 2) slashing damage.</p>
<p><strong>Shortbow.</strong> <em>Ranged Weapon Attack:</em> +4 to hit, range 80/320 ft., one target. <em>Hit:</em> 5 (1d6 + 2) piercing damage.</p>
</div>`,

    'Orc': `<div class="stat-block">
<h3 class="stat-block-name">Orc</h3>
<p class="stat-block-meta"><em>Medium humanoid (orc), chaotic evil</em></p>
<hr class="stat-block-divider">
<p><strong>Armor Class</strong> 13 (Hide Armor)</p>
<p><strong>Hit Points</strong> 15 (2d8 + 6)</p>
<p><strong>Speed</strong> 30 ft.</p>
<hr class="stat-block-divider">
<table class="stat-block-abilities">
<tr>
<th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
</tr>
<tr>
<td>16 (+3)</td><td>12 (+1)</td><td>16 (+3)</td><td>7 (-2)</td><td>11 (+0)</td><td>10 (+0)</td>
</tr>
</table>
<hr class="stat-block-divider">
<p><strong>Skills</strong> Intimidation +2</p>
<p><strong>Senses</strong> darkvision 60 ft., passive Perception 10</p>
<p><strong>Languages</strong> Common, Orc</p>
<p><strong>Challenge</strong> 1/2 (100 XP)</p>
<hr class="stat-block-divider">
<p><strong>Aggressive.</strong> As a bonus action, the orc can move up to its speed toward a hostile creature that it can see.</p>
<hr class="stat-block-divider">
<h4>Actions</h4>
<p><strong>Greataxe.</strong> <em>Melee Weapon Attack:</em> +5 to hit, reach 5 ft., one target. <em>Hit:</em> 9 (1d12 + 3) slashing damage.</p>
<p><strong>Javelin.</strong> <em>Melee or Ranged Weapon Attack:</em> +5 to hit, reach 5 ft. or range 30/120 ft., one target. <em>Hit:</em> 6 (1d6 + 3) piercing damage.</p>
</div>`,

    'Cultist': `<div class="stat-block">
<h3 class="stat-block-name">Cultist</h3>
<p class="stat-block-meta"><em>Medium humanoid (any race), any non-good alignment</em></p>
<hr class="stat-block-divider">
<p><strong>Armor Class</strong> 12 (Leather Armor)</p>
<p><strong>Hit Points</strong> 9 (2d8)</p>
<p><strong>Speed</strong> 30 ft.</p>
<hr class="stat-block-divider">
<table class="stat-block-abilities">
<tr>
<th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
</tr>
<tr>
<td>11 (+0)</td><td>12 (+1)</td><td>10 (+0)</td><td>10 (+0)</td><td>11 (+0)</td><td>10 (+0)</td>
</tr>
</table>
<hr class="stat-block-divider">
<p><strong>Skills</strong> Deception +2, Religion +2</p>
<p><strong>Senses</strong> passive Perception 10</p>
<p><strong>Languages</strong> any one language (usually Common)</p>
<p><strong>Challenge</strong> 1/8 (25 XP)</p>
<hr class="stat-block-divider">
<p><strong>Dark Devotion.</strong> The cultist has advantage on saving throws against being charmed or frightened.</p>
<hr class="stat-block-divider">
<h4>Actions</h4>
<p><strong>Scimitar.</strong> <em>Melee Weapon Attack:</em> +3 to hit, reach 5 ft., one target. <em>Hit:</em> 4 (1d6 + 1) slashing damage.</p>
</div>`,

    'Zombie': `<div class="stat-block">
<h3 class="stat-block-name">Zombie</h3>
<p class="stat-block-meta"><em>Medium undead, neutral evil</em></p>
<hr class="stat-block-divider">
<p><strong>Armor Class</strong> 8</p>
<p><strong>Hit Points</strong> 22 (3d8 + 9)</p>
<p><strong>Speed</strong> 20 ft.</p>
<hr class="stat-block-divider">
<table class="stat-block-abilities">
<tr>
<th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
</tr>
<tr>
<td>13 (+1)</td><td>6 (-2)</td><td>16 (+3)</td><td>3 (-4)</td><td>6 (-2)</td><td>5 (-3)</td>
</tr>
</table>
<hr class="stat-block-divider">
<p><strong>Saving Throws</strong> Wis +0</p>
<p><strong>Damage Immunities</strong> poison</p>
<p><strong>Condition Immunities</strong> poisoned</p>
<p><strong>Senses</strong> darkvision 60 ft., passive Perception 8</p>
<p><strong>Languages</strong> understands the languages it knew in life but can't speak</p>
<p><strong>Challenge</strong> 1/4 (50 XP)</p>
<hr class="stat-block-divider">
<p><strong>Undead Fortitude.</strong> If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.</p>
<hr class="stat-block-divider">
<h4>Actions</h4>
<p><strong>Slam.</strong> <em>Melee Weapon Attack:</em> +3 to hit, reach 5 ft., one target. <em>Hit:</em> 4 (1d6 + 1) bludgeoning damage.</p>
</div>`,

    'Skeleton': `<div class="stat-block">
<h3 class="stat-block-name">Skeleton</h3>
<p class="stat-block-meta"><em>Medium undead, lawful evil</em></p>
<hr class="stat-block-divider">
<p><strong>Armor Class</strong> 13 (Armor Scraps)</p>
<p><strong>Hit Points</strong> 13 (2d8 + 4)</p>
<p><strong>Speed</strong> 30 ft.</p>
<hr class="stat-block-divider">
<table class="stat-block-abilities">
<tr>
<th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
</tr>
<tr>
<td>10 (+0)</td><td>14 (+2)</td><td>15 (+2)</td><td>6 (-2)</td><td>8 (-1)</td><td>5 (-3)</td>
</tr>
</table>
<hr class="stat-block-divider">
<p><strong>Damage Vulnerabilities</strong> bludgeoning</p>
<p><strong>Damage Immunities</strong> poison</p>
<p><strong>Condition Immunities</strong> exhaustion, poisoned</p>
<p><strong>Senses</strong> darkvision 60 ft., passive Perception 9</p>
<p><strong>Languages</strong> understands all languages it knew in life but can't speak</p>
<p><strong>Challenge</strong> 1/4 (50 XP)</p>
<hr class="stat-block-divider">
<h4>Actions</h4>
<p><strong>Shortsword.</strong> <em>Melee Weapon Attack:</em> +4 to hit, reach 5 ft., one target. <em>Hit:</em> 5 (1d6 + 2) piercing damage.</p>
<p><strong>Shortbow.</strong> <em>Ranged Weapon Attack:</em> +4 to hit, range 80/320 ft., one target. <em>Hit:</em> 5 (1d6 + 2) piercing damage.</p>
</div>`,

    'Spy': `**Spy**
*Medium humanoid (any race), any alignment*

**Armor Class** 12
**Hit Points** 27 (6d8)
**Speed** 30 ft.

**STR** 10 (+0) **DEX** 15 (+2) **CON** 10 (+0) **INT** 12 (+1) **WIS** 14 (+2) **CHA** 16 (+3)

**Skills** Deception +5, Insight +4, Investigation +5, Perception +6, Persuasion +5, Sleight of Hand +4, Stealth +4
**Senses** passive Perception 16
**Languages** any two languages
**Challenge** 1 (200 XP)

**Cunning Action.** On each of its turns, the spy can use a bonus action to take the Dash, Disengage, or Hide action.

**Sneak Attack (1/Turn).** The spy deals an extra 7 (2d6) damage when it hits a target with a weapon attack and has advantage on the attack roll, or when the target is within 5 feet of an ally of the spy that isn't incapacitated and the spy doesn't have disadvantage on the attack roll.

**Actions**
*Multiattack.* The spy makes two melee attacks.
*Shortsword.* Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.
*Hand Crossbow.* Ranged Weapon Attack: +4 to hit, range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage.`,

    'Thug': `**Thug**
*Medium humanoid (any race), any non-good alignment*

**Armor Class** 11 (Leather Armor)
**Hit Points** 32 (5d8 + 10)
**Speed** 30 ft.

**STR** 15 (+2) **DEX** 11 (+0) **CON** 14 (+2) **INT** 10 (+0) **WIS** 10 (+0) **CHA** 11 (+0)

**Skills** Intimidation +2
**Senses** passive Perception 10
**Languages** any one language (usually Common)
**Challenge** 1/2 (100 XP)

**Pack Tactics.** The thug has advantage on an attack roll against a creature if at least one of the thug's allies is within 5 feet of the creature and the ally isn't incapacitated.

**Actions**
*Multiattack.* The thug makes two melee attacks.
*Mace.* Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) bludgeoning damage.
*Heavy Crossbow.* Ranged Weapon Attack: +2 to hit, range 100/400 ft., one target. Hit: 5 (1d10) piercing damage.`,

    'Cult Fanatic': `**Cult Fanatic**
*Medium humanoid (any race), any non-good alignment*

**Armor Class** 13 (Leather Armor)
**Hit Points** 33 (6d8 + 6)
**Speed** 30 ft.

**STR** 11 (+0) **DEX** 14 (+2) **CON** 12 (+1) **INT** 10 (+0) **WIS** 13 (+1) **CHA** 14 (+2)

**Skills** Deception +4, Persuasion +4, Religion +2
**Senses** passive Perception 11
**Languages** any one language (usually Common)
**Challenge** 2 (450 XP)

**Dark Devotion.** The fanatic has advantage on saving throws against being charmed or frightened.

**Spellcasting.** The fanatic is a 4th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 11, +3 to hit with spell attacks). The fanatic has the following cleric spells prepared:

Cantrips (at will): light, sacred flame, thaumaturgy
1st level (4 slots): command, inflict wounds, shield of faith
2nd level (3 slots): hold person, spiritual weapon

**Actions**
*Multiattack.* The fanatic makes two melee attacks.
*Dagger.* Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d4 + 2) piercing damage.`,

    'Doppelganger': `**Doppelganger**
*Medium monstrosity (shapechanger), neutral*

**Armor Class** 14
**Hit Points** 52 (8d8 + 16)
**Speed** 30 ft.

**STR** 11 (+0) **DEX** 18 (+4) **CON** 14 (+2) **INT** 11 (+0) **WIS** 12 (+1) **CHA** 14 (+2)

**Skills** Deception +6, Insight +3
**Condition Immunities** charmed
**Senses** darkvision 60 ft., passive Perception 11
**Languages** Common
**Challenge** 3 (700 XP)

**Shapechanger.** The doppelganger can use its action to polymorph into a Small or Medium humanoid it has seen, or back into its true form. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies.

**Ambusher.** The doppelganger has advantage on attack rolls against any creature it has surprised.

**Surprise Attack.** If the doppelganger surprises a creature and hits it with an attack during the first round of combat, the target takes an extra 10 (3d6) damage from the attack.

**Actions**
*Multiattack.* The doppelganger makes two melee attacks.
*Slam.* Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) bludgeoning damage.
*Read Thoughts.* The doppelganger magically reads the surface thoughts of one creature within 60 feet of it. The effect can penetrate barriers, but 3 feet of wood or dirt, 2 feet of stone, 2 inches of metal, or a thin sheet of lead blocks it. While the target is in range, the doppelganger can continue reading its thoughts, as long as the doppelganger's concentration isn't broken (as if concentrating on a spell). While reading the target's mind, the doppelganger has advantage on Wisdom (Insight) and Charisma (Deception, Intimidation, and Persuasion) checks against the target.`,

    'Wolf': `**Wolf**
*Medium beast, unaligned*

**Armor Class** 13 (Natural Armor)
**Hit Points** 11 (2d8 + 2)
**Speed** 40 ft.

**STR** 12 (+1) **DEX** 15 (+2) **CON** 12 (+1) **INT** 3 (-4) **WIS** 12 (+1) **CHA** 6 (-2)

**Skills** Perception +3, Stealth +4
**Senses** passive Perception 13
**Languages** —
**Challenge** 1/4 (50 XP)

**Keen Hearing and Smell.** The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell.

**Pack Tactics.** The wolf has advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally isn't incapacitated.

**Actions**
*Bite.* Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) piercing damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone.`,

    'Shadow': `**Shadow**
*Medium undead, chaotic evil*

**Armor Class** 12
**Hit Points** 16 (3d8 + 3)
**Speed** 40 ft.

**STR** 6 (-2) **DEX** 14 (+2) **CON** 13 (+1) **INT** 6 (-2) **WIS** 10 (+0) **CHA** 8 (-1)

**Skills** Stealth +4 (+6 in dim light or darkness)
**Damage Vulnerabilities** radiant
**Damage Resistances** acid, cold, fire, lightning, thunder; bludgeoning, piercing, and slashing from nonmagical attacks
**Damage Immunities** necrotic, poison
**Condition Immunities** exhaustion, frightened, grappled, paralyzed, petrified, poisoned, prone, restrained
**Senses** darkvision 60 ft., passive Perception 10
**Languages** —
**Challenge** 1/2 (100 XP)

**Amorphous.** The shadow can move through a space as narrow as 1 inch wide without squeezing.

**Shadow Stealth.** While in dim light or darkness, the shadow can take the Hide action as a bonus action.

**Sunlight Weakness.** While in sunlight, the shadow has disadvantage on attack rolls, ability checks, and saving throws.

**Actions**
*Strength Drain.* Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 9 (2d6 + 2) necrotic damage, and the target's Strength score is reduced by 1d4. The target dies if this reduces its Strength to 0. Otherwise, the reduction lasts until the target finishes a long rest. If a non-evil humanoid dies from this attack, a new shadow rises from the corpse 1d4 hours later.`,

    'Ghoul': `**Ghoul**
*Medium undead, chaotic evil*

**Armor Class** 12
**Hit Points** 22 (5d8)
**Speed** 30 ft.

**STR** 13 (+1) **DEX** 15 (+2) **CON** 10 (+0) **INT** 7 (-2) **WIS** 10 (+0) **CHA** 6 (-2)

**Damage Immunities** poison
**Condition Immunities** charmed, exhaustion, poisoned
**Senses** darkvision 60 ft., passive Perception 10
**Languages** Common
**Challenge** 1 (200 XP)

**Actions**
*Bite.* Melee Weapon Attack: +2 to hit, reach 5 ft., one creature. Hit: 9 (2d6 + 2) piercing damage.
*Claws.* Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage. If the target is a creature other than an elf or undead, it must succeed on a DC 10 Constitution saving throw or be paralyzed for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.`,

    'Owlbear': `**Owlbear**
*Large monstrosity, unaligned*

**Armor Class** 13 (Natural Armor)
**Hit Points** 59 (7d10 + 21)
**Speed** 40 ft.

**STR** 20 (+5) **DEX** 12 (+1) **CON** 17 (+3) **INT** 3 (-4) **WIS** 12 (+1) **CHA** 7 (-2)

**Skills** Perception +3
**Senses** darkvision 60 ft., passive Perception 13
**Languages** —
**Challenge** 3 (700 XP)

**Keen Sight and Smell.** The owlbear has advantage on Wisdom (Perception) checks that rely on sight or smell.

**Actions**
*Multiattack.* The owlbear makes two attacks: one with its beak and one with its claws.
*Beak.* Melee Weapon Attack: +7 to hit, reach 5 ft., one creature. Hit: 10 (1d10 + 5) piercing damage.
*Claws.* Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) slashing damage.`,



    'Bugbear': `**Bugbear**
*Medium humanoid (goblinoid), chaotic evil*

**Armor Class** 16 (Hide Armor, Shield)
**Hit Points** 27 (5d8 + 5)
**Speed** 30 ft.

**STR** 15 (+2) **DEX** 14 (+2) **CON** 13 (+1) **INT** 8 (-1) **WIS** 11 (+0) **CHA** 9 (-1)

**Skills** Stealth +6, Survival +2
**Senses** darkvision 60 ft., passive Perception 10
**Languages** Common, Goblin
**Challenge** 1 (200 XP)

**Brute.** A melee weapon deals one extra die of its damage when the bugbear hits with it (included in the attack).

**Surprise Attack.** If the bugbear surprises a creature and hits it with an attack during the first round of combat, the target takes an extra 7 (2d6) damage from the attack.

**Actions**
*Morningstar.* Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 11 (2d8 + 2) piercing damage.
*Javelin.* Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 9 (2d6 + 2) piercing damage in melee, or 5 (1d6 + 2) piercing damage at range.`,

    'Ogre': `**Ogre**
*Large giant, chaotic evil*

**Armor Class** 11 (Hide Armor)
**Hit Points** 59 (7d10 + 21)
**Speed** 40 ft.

**STR** 19 (+4) **DEX** 8 (-1) **CON** 16 (+3) **INT** 5 (-3) **WIS** 7 (-2) **CHA** 7 (-2)

**Senses** darkvision 60 ft., passive Perception 8
**Languages** Common, Giant
**Challenge** 2 (450 XP)

**Actions**
*Greatclub.* Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage.
*Javelin.* Melee or Ranged Weapon Attack: +6 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 11 (2d6 + 4) piercing damage.`,

    'Troll': `**Troll**
*Large giant, chaotic evil*

**Armor Class** 15 (Natural Armor)
**Hit Points** 84 (8d12 + 32)
**Speed** 30 ft.

**STR** 18 (+4) **DEX** 13 (+1) **CON** 20 (+5) **INT** 7 (-2) **WIS** 9 (-1) **CHA** 7 (-2)

**Skills** Perception +2
**Senses** darkvision 60 ft., passive Perception 12
**Languages** Giant
**Challenge** 5 (1,800 XP)

**Keen Smell.** The troll has advantage on Wisdom (Perception) checks that rely on smell.

**Regeneration.** The troll regains 10 hit points at the start of its turn. If the troll takes acid or fire damage, this trait doesn't function at the start of the troll's next turn. The troll dies only if it starts its turn with 0 hit points and doesn't regenerate.

**Actions**
*Multiattack.* The troll makes three attacks: one with its bite and two with its claws.
*Bite.* Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) piercing damage.
*Claws.* Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage.`,

    'Guard': `**Guard**
*Medium humanoid (any race), any alignment*

**Armor Class** 16 (Chain Shirt, Shield)
**Hit Points** 11 (2d8 + 2)
**Speed** 30 ft.

**STR** 13 (+1) **DEX** 12 (+1) **CON** 12 (+1) **INT** 10 (+0) **WIS** 11 (+0) **CHA** 10 (+0)

**Skills** Perception +2
**Senses** passive Perception 12
**Languages** any one language (usually Common)
**Challenge** 1/8 (25 XP)

**Actions**
*Spear.* Melee or Ranged Weapon Attack: +3 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d6 + 1) piercing damage, or 5 (1d8 + 1) piercing damage if used with two hands to make a melee attack.`,

    'Bandit': `**Bandit**
*Medium humanoid (any race), any non-lawful alignment*

**Armor Class** 12 (Leather Armor)
**Hit Points** 11 (2d8 + 2)
**Speed** 30 ft.

**STR** 11 (+0) **DEX** 12 (+1) **CON** 12 (+1) **INT** 10 (+0) **WIS** 10 (+0) **CHA** 10 (+0)

**Senses** passive Perception 10
**Languages** any one language (usually Common)
**Challenge** 1/8 (25 XP)

**Actions**
*Scimitar.* Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) slashing damage.
*Light Crossbow.* Ranged Weapon Attack: +3 to hit, range 80/320 ft., one target. Hit: 5 (1d8 + 1) piercing damage.`,

    'Veteran': `**Veteran**
*Medium humanoid (any race), any alignment*

**Armor Class** 17 (Splint)
**Hit Points** 58 (9d8 + 18)
**Speed** 30 ft.

**STR** 16 (+3) **DEX** 13 (+1) **CON** 14 (+2) **INT** 10 (+0) **WIS** 11 (+0) **CHA** 10 (+0)

**Skills** Athletics +5, Perception +2
**Senses** passive Perception 12
**Languages** any one language (usually Common)
**Challenge** 3 (700 XP)

**Actions**
*Multiattack.* The veteran makes two longsword attacks. If it has a shortsword drawn, it can also make a shortsword attack.
*Longsword.* Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands.
*Shortsword.* Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage.
*Heavy Crossbow.* Ranged Weapon Attack: +3 to hit, range 100/400 ft., one target. Hit: 6 (1d10 + 1) piercing damage.`
  };

  return statBlocks[creatureName] || `<div class="stat-block">
<h3 class="stat-block-name">${creatureName}</h3>
<p class="stat-block-meta"><em>Stat block not available</em></p>
<hr class="stat-block-divider">
<p><strong>Note:</strong> This creature's stat block is not yet implemented. Please refer to the Monster Manual or use a similar creature as a substitute.</p>
</div>`;
}

/**
 * Get NPC stat blocks
 */
function getNPCStatBlock(npcType: string): string {
  const npcBlocks: Record<string, string> = {
    'Captain': `**Captain Marcus Ironvale**
*Medium humanoid (human), lawful good*

**Armor Class** 16 (Chain Mail)
**Hit Points** 52 (8d8 + 16)
**Speed** 30 ft.

**STR** 16 (+3) **DEX** 12 (+1) **CON** 14 (+2) **INT** 13 (+1) **WIS** 14 (+2) **CHA** 15 (+2)

**Skills** Athletics +5, Insight +4, Intimidation +4
**Senses** passive Perception 12
**Languages** Common, Halfling
**Challenge** 2 (450 XP)

**Leadership (Recharges after a Short or Long Rest).** For 1 minute, the captain can utter a special command or warning whenever a nonhostile creature that it can see within 30 feet of it makes an attack roll or a saving throw. The creature can add a d4 to its roll provided it can hear and understand the captain.

**Actions**
*Multiattack.* The captain makes two longsword attacks.
*Longsword.* Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands.
*Heavy Crossbow.* Ranged Weapon Attack: +3 to hit, range 100/400 ft., one target. Hit: 6 (1d10 + 1) piercing damage.`,

    'Elder': `**Elder Thalwin Oakenheart**
*Medium humanoid (human), neutral good*

**Armor Class** 12 (Leather Armor)
**Hit Points** 27 (6d8)
**Speed** 30 ft.

**STR** 10 (+0) **DEX** 12 (+1) **CON** 11 (+0) **INT** 15 (+2) **WIS** 17 (+3) **CHA** 16 (+3)

**Skills** History +4, Medicine +5, Nature +4, Religion +4
**Senses** passive Perception 13
**Languages** Common, Elvish, Sylvan
**Challenge** 2 (450 XP)

**Spellcasting.** The elder is a 5th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 13, +5 to hit with spell attacks). The elder has the following druid spells prepared:

Cantrips (at will): druidcraft, guidance, produce flame
1st level (4 slots): cure wounds, entangle, speak with animals
2nd level (3 slots): animal messenger, barkskin
3rd level (2 slots): call lightning, plant growth

**Actions**
*Quarterstaff.* Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 3 (1d6) bludgeoning damage, or 4 (1d8) bludgeoning damage if used with two hands.`
  };

  return npcBlocks[npcType] || `**${npcType}**\n*NPC stat block not found*`;
}

/**
 * Create system prompt for campaign refinement
 */
function createRefinementSystemPrompt(campaign: GeneratedCampaign): string {
  return `You are an expert D&D campaign assistant. You will receive a campaign and a user request to modify it.

CRITICAL: You must respond with ONLY a valid JSON object containing the complete updated campaign.

Current Campaign Structure:
${JSON.stringify(campaign, null, 2)}

Your task:
1. Apply the requested changes to the campaign
2. Maintain D&D 5e compatibility and balance
3. Keep narrative coherence
4. Return the COMPLETE updated campaign as JSON

Response format (JSON only - no other text):
{
  "success": true,
  "updatedCampaign": {
    "id": "${campaign.id}",
    "title": "Updated title",
    "parameters": ${JSON.stringify(campaign.parameters)},
    "introduction": "Updated introduction...",
    "plotHooks": ["updated hooks"],
    "encounters": [
      {
        "id": "unique_id",
        "title": "Encounter Title",
        "type": "combat|social|exploration|puzzle|trap",
        "description": "Description",
        "estimatedDuration": 30,
        "difficultyLevel": 5,
        "order": 1
      }
    ],
    "npcs": [
      {
        "id": "unique_id",
        "name": "NPC Name", 
        "race": "Race",
        "role": "Role",
        "personality": "Personality",
        "motivation": "Motivation",
        "description": "Description"
      }
    ],
    "locations": [
      {
        "id": "unique_id",
        "name": "Location Name",
        "type": "Type",
        "description": "Description"
      }
    ],
    "conclusion": "Updated conclusion",
    "estimatedDuration": ${campaign.estimatedDuration},
    "difficultyRating": "${campaign.difficultyRating}",
    "generatedAt": "${campaign.generatedAt.toISOString()}",
    "lastRefinedAt": "${new Date().toISOString()}"
  },
  "changes": ["List of changes made"],
  "suggestions": ["Additional suggestions"]
}`;
}

/**
 * Create user prompt for campaign refinement
 */
function createRefinementUserPrompt(request: RefinementRequest): string {
  return `Please modify the campaign based on this request:

Request Type: ${request.requestType}
Description: ${request.description}
${request.targetSection ? `Target Section: ${request.targetSection}` : ''}

Please provide:
1. What specific changes you're making
2. Why these changes improve the campaign
3. How the changes affect pacing and balance
4. Any additional suggestions for related improvements

Format your response clearly so I can apply the changes to the campaign.`;
}

/**
 * Parse JSON refinement response from OpenAI
 */
function parseRefinementResponse(content: string, originalCampaign: GeneratedCampaign): RefinementResponse {
  console.log('🎲 parseRefinementResponse called - attempting JSON parse...');
  console.log('🎲 Raw AI response:', content);
  
  try {
    // Try to parse as JSON directly
    const response = JSON.parse(content);
    
    if (response.success && response.updatedCampaign) {
      console.log('🎲 Successfully parsed JSON response');
      
      // Ensure dates are properly handled
      const updatedCampaign = {
        ...response.updatedCampaign,
        generatedAt: new Date(response.updatedCampaign.generatedAt),
        lastRefinedAt: new Date()
      };
      
      return {
        success: true,
        updatedCampaign,
        changes: response.changes || ['Campaign updated successfully'],
        suggestions: response.suggestions || []
      };
    }
  } catch (error) {
    console.warn('🎲 Failed to parse JSON response, falling back to demo refinement');
    console.warn('🎲 Parse error:', error);
  }
  
  // Fallback to demo refinement if JSON parsing fails
  console.log('🎲 Using demo refinement as fallback');
      return generateDemoRefinement(originalCampaign, { 
        campaignId: originalCampaign.id, 
        requestType: 'general', 
        description: content 
      });
}

/**
 * Generate demo refinement response with actual content modification
 */
function generateDemoRefinement(campaign: GeneratedCampaign, request: RefinementRequest): RefinementResponse {
  const changes: string[] = [];
  
  // Deep clone the campaign to avoid mutations
  let updatedCampaign: GeneratedCampaign = JSON.parse(JSON.stringify(campaign));
  updatedCampaign.lastRefinedAt = new Date();
  
  console.log('🎲 Demo refinement - Original campaign title:', updatedCampaign.title);
  console.log('🎲 Demo refinement - Request:', request.description);
  
  // Parse the request for specific changes
  const requestText = request.description.toLowerCase();
  
  // Handle location/town name changes - simplified and more reliable
  const townChangePattern = /change.*(?:town|city|village|location|place).*(?:name|called).*(?:to|from)\s*["']?(\w+)["']?/i;
  const nameChangePattern = /(?:change|rename).*(?:to|from)\s*["']?(\w+)["']?/i;
  
  const townMatch = request.description.match(townChangePattern);
  const nameMatch = request.description.match(nameChangePattern);
  
  if (townMatch || nameMatch) {
    const newName = (townMatch?.[1] || nameMatch?.[1])?.trim();
    console.log('🎲 Demo refinement - New name extracted:', newName);
    
    if (newName) {
      // Simple approach: look for common location names in the campaign text
      let oldName = '';
      
             // Check locations array first
       if (updatedCampaign.locations.length > 0) {
         oldName = updatedCampaign.locations[0].name;
         console.log('🎲 Demo refinement - Found location in array:', oldName);
       } else {
         // Look for common patterns in the introduction
         const locationPatterns = [
           /(?:town|city|village|settlement) of (\w+)/i,
           /(?:mining|trading|fishing|farming)\s+(?:town|city|village|settlement) of (\w+)/i,
           /in (\w+),?\s+(?:a|the)\s+(?:town|city|village)/i,
           /(?:arrive|travel|journey) to (\w+)/i,
           /(\w+)\s+is a (?:town|city|village)/i,
           /(?:in|to|at)\s+(\w+),?\s+(?:a|the|now)\s+(?:once\s+)?(?:prosperous\s+)?(?:mining|trading|fishing|farming)?\s*(?:town|city|village|settlement)/i
         ];
         
         console.log('🎲 Demo refinement - Searching introduction for location patterns...');
         console.log('🎲 Demo refinement - Introduction text:', updatedCampaign.introduction.substring(0, 300));
         
         for (const pattern of locationPatterns) {
           const match = updatedCampaign.introduction.match(pattern);
           console.log('🎲 Demo refinement - Pattern:', pattern, 'Match:', match);
           if (match && match[1]) {
             oldName = match[1];
             console.log('🎲 Demo refinement - Found location in text:', oldName);
             break;
           }
         }
       }
      
      console.log('🎲 Demo refinement - Old name found:', oldName);
      
             if (oldName && oldName !== newName) {
         console.log('🎲 Demo refinement - Replacing:', oldName, 'with:', newName);
         
         // Simple text replacement throughout the campaign
         const replaceText = (text: string): string => {
           if (!text) return text;
           const beforeReplace = text;
           const afterReplace = text.replace(new RegExp(oldName, 'gi'), newName);
           if (beforeReplace !== afterReplace) {
             console.log('🎲 Demo refinement - Text replacement made in:', beforeReplace.substring(0, 100) + '...');
           }
           return afterReplace;
         };
         
         // Update all campaign content
         updatedCampaign.title = replaceText(updatedCampaign.title);
         updatedCampaign.introduction = replaceText(updatedCampaign.introduction);
         updatedCampaign.conclusion = replaceText(updatedCampaign.conclusion);
        
        // Update plot hooks
        updatedCampaign.plotHooks = updatedCampaign.plotHooks.map(replaceText);
        
        // Update encounters
        updatedCampaign.encounters = updatedCampaign.encounters.map(encounter => ({
          ...encounter,
          title: replaceText(encounter.title),
          description: replaceText(encounter.description)
        }));
        
        // Update NPCs
        updatedCampaign.npcs = updatedCampaign.npcs.map(npc => ({
          ...npc,
          description: replaceText(npc.description),
          motivation: replaceText(npc.motivation)
        }));
        
        // Update locations
        updatedCampaign.locations = updatedCampaign.locations.map(location => ({
          ...location,
          name: replaceText(location.name),
          description: replaceText(location.description)
        }));
        
        changes.push(`Changed location name from "${oldName}" to "${newName}" throughout the campaign`);
        console.log('🎲 Demo refinement - Applied name change successfully');
      } else if (!oldName) {
        // Add as a new location if no existing location found
        const newLocation = {
          id: `location-${updatedCampaign.locations.length + 1}`,
          name: newName,
          type: 'Settlement',
          description: `The settlement of ${newName}, a key location in the campaign.`
        };
        updatedCampaign.locations = [...updatedCampaign.locations, newLocation];
        changes.push(`Added new location "${newName}" to the campaign`);
        console.log('🎲 Demo refinement - Added new location');
      }
    }
  }
  
  // If no location name change was detected, provide a general update
  if (changes.length === 0) {
    console.log('🎲 Demo refinement - No specific changes detected, adding general note');
    changes.push(`Applied modifications based on: "${request.description}"`);
    
    // Add a note to the first encounter as a fallback to show something changed
    if (updatedCampaign.encounters.length > 0) {
      updatedCampaign.encounters[0] = {
        ...updatedCampaign.encounters[0],
        notes: `DM Note: ${request.description}`
      };
      changes.push('Added your suggestion as a DM note to the first encounter');
    }
  }
  
  return {
    success: true,
    updatedCampaign,
    changes,
    suggestions: [
      'Review the updated content to ensure it fits your vision',
      'Consider how these changes affect the overall campaign flow',
      'Feel free to request additional modifications'
    ]
  };
}

/**
 * Helper functions for intelligent text replacement and extraction
 */
function extractLocationNames(campaign: GeneratedCampaign): string[] {
  const names: string[] = [];
  
  // Extract from locations
  campaign.locations.forEach(location => {
    if (location.name && location.name !== 'Location' && !location.name.includes('location-')) {
      names.push(location.name);
    }
  });
  
  // Extract from campaign text using common patterns
  const textToSearch = [campaign.title, campaign.introduction, campaign.conclusion].join(' ');
  const locationPatterns = [
    /(?:town|city|village|settlement) of (\w+)/gi,
    /in (\w+(?:\s+\w+)?),?\s+(?:a|the)\s+(?:town|city|village)/gi,
    /(?:arrive|travel|journey) to (\w+)/gi
  ];
  
  locationPatterns.forEach(pattern => {
    const matches = textToSearch.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && !names.includes(match[1])) {
        names.push(match[1]);
      }
    }
  });
  
  return names;
}

function replaceInText(text: string, oldValue: string, newValue: string): string {
  if (!text || !oldValue || !newValue) return text;
  
  // Create case-insensitive regex for replacement
  const regex = new RegExp(escapeRegExp(oldValue), 'gi');
  return text.replace(regex, newValue);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getLocationTypeByName(name: string): string {
  const name_lower = name.toLowerCase();
  if (name_lower.includes('fort') || name_lower.includes('castle')) return 'fortress';
  if (name_lower.includes('wood') || name_lower.includes('forest')) return 'forest';
  if (name_lower.includes('port') || name_lower.includes('harbor')) return 'port city';
  if (name_lower.includes('mount') || name_lower.includes('peak')) return 'mountain settlement';
  return 'town';
}

function extractEncounterTitle(description: string): string | null {
  const titleMatch = description.match(/(?:add|new|create).*(?:encounter|fight|battle).*["']([^"']+)["']/i);
  if (titleMatch) return titleMatch[1];
  
  const withMatch = description.match(/(?:encounter|fight|battle) with (.+?)(?:\s|$|\.)/i);
  if (withMatch) return `Encounter with ${withMatch[1]}`;
  
  return null;
}

function determineEncounterType(description: string): 'combat' | 'social' | 'exploration' | 'puzzle' | 'trap' {
  const desc = description.toLowerCase();
  if (desc.includes('talk') || desc.includes('negotiate') || desc.includes('social')) return 'social';
  if (desc.includes('puzzle') || desc.includes('riddle') || desc.includes('solve')) return 'puzzle';
  if (desc.includes('trap') || desc.includes('hidden') || desc.includes('secret')) return 'trap';
  if (desc.includes('explore') || desc.includes('search') || desc.includes('investigate')) return 'exploration';
  return 'combat';
}

function extractNPCName(description: string): string | null {
  const nameMatch = description.match(/(?:add|new|create).*(?:npc|character|person).*(?:named|called).*["']?(\w+(?:\s+\w+)?)["']?/i);
  return nameMatch?.[1] || null;
}

function determineRace(description: string): string {
  const desc = description.toLowerCase();
  const races = ['elf', 'dwarf', 'halfling', 'orc', 'goblin', 'tiefling', 'dragonborn', 'gnome'];
  for (const race of races) {
    if (desc.includes(race)) return race.charAt(0).toUpperCase() + race.slice(1);
  }
  return 'Human';
}

function determineRole(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('merchant') || desc.includes('trader')) return 'Merchant';
  if (desc.includes('guard') || desc.includes('soldier')) return 'Guard';
  if (desc.includes('priest') || desc.includes('cleric')) return 'Priest';
  if (desc.includes('wizard') || desc.includes('mage')) return 'Wizard';
  if (desc.includes('thief') || desc.includes('rogue')) return 'Thief';
  if (desc.includes('innkeeper') || desc.includes('tavern')) return 'Innkeeper';
  if (desc.includes('noble') || desc.includes('lord') || desc.includes('lady')) return 'Noble';
  if (desc.includes('villain') || desc.includes('enemy')) return 'Antagonist';
  return 'Villager';
}

function extractTheme(description: string): string | null {
  const desc = description.toLowerCase();
  const themes = ['dark', 'light', 'mysterious', 'comedic', 'serious', 'dramatic', 'heroic', 'gritty'];
  for (const theme of themes) {
    if (desc.includes(theme)) return theme;
  }
  return null;
}

function adjustForTheme(text: string, theme: string): string {
  // Simple theme adjustments - in production this would be more sophisticated
  switch (theme) {
    case 'dark':
      return text.replace(/bright/gi, 'shadowy').replace(/cheerful/gi, 'ominous');
    case 'comedic':
      return text + ' (The situation has amusing elements that can provide comic relief.)';
    case 'mysterious':
      return text.replace(/obvious/gi, 'enigmatic').replace(/clear/gi, 'puzzling');
    default:
      return text;
  }
}

export default {
  generateCampaign,
  refineCampaign
}; 