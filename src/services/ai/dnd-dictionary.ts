/**
 * @fileoverview D&D 5e Official Terminology Dictionary for Grammar Analysis
 * @author D&D Campaign Assistant
 * @version 1.0.0
 * 
 * This module contains comprehensive D&D 5e terminology to prevent the grammar checker
 * from flagging legitimate fantasy terms as errors.
 */

export interface DnDTerm {
  term: string;
  category: 'race' | 'class' | 'spell' | 'location' | 'creature' | 'item' | 'ability' | 'condition' | 'organization' | 'deity' | 'plane';
  description?: string;
  aliases?: string[];
}

/**
 * Official D&D 5e Character Races
 */
export const DND_RACES: DnDTerm[] = [
  { term: 'Aarakocra', category: 'race', description: 'Bird-like humanoids' },
  { term: 'Aasimar', category: 'race', description: 'Celestial-touched humanoids' },
  { term: 'Bugbear', category: 'race', description: 'Large goblinoid race' },
  { term: 'Centaur', category: 'race', description: 'Half-human, half-horse' },
  { term: 'Changeling', category: 'race', description: 'Shapeshifting humanoids' },
  { term: 'Dragonborn', category: 'race', description: 'Dragon-descended humanoids' },
  { term: 'Drow', category: 'race', description: 'Dark elves', aliases: ['Dark Elf'] },
  { term: 'Dwarf', category: 'race', description: 'Stout mountain folk' },
  { term: 'Elf', category: 'race', description: 'Graceful fey-touched humanoids' },
  { term: 'Firbolg', category: 'race', description: 'Giant-kin forest dwellers' },
  { term: 'Genasi', category: 'race', description: 'Elemental-touched humanoids' },
  { term: 'Githyanki', category: 'race', description: 'Astral plane warriors' },
  { term: 'Githzerai', category: 'race', description: 'Limbo-dwelling psionics' },
  { term: 'Gnome', category: 'race', description: 'Small fey-touched folk' },
  { term: 'Goblin', category: 'race', description: 'Small goblinoid race' },
  { term: 'Goliath', category: 'race', description: 'Giant-kin mountain people' },
  { term: 'Halfling', category: 'race', description: 'Small, peaceful folk' },
  { term: 'Half-Elf', category: 'race', description: 'Human-elf hybrid' },
  { term: 'Half-Orc', category: 'race', description: 'Human-orc hybrid' },
  { term: 'Hobgoblin', category: 'race', description: 'Militaristic goblinoids' },
  { term: 'Human', category: 'race', description: 'Versatile and adaptable' },
  { term: 'Kalashtar', category: 'race', description: 'Psionic humanoids' },
  { term: 'Kenku', category: 'race', description: 'Flightless bird people' },
  { term: 'Kobold', category: 'race', description: 'Small draconic humanoids' },
  { term: 'Lizardfolk', category: 'race', description: 'Reptilian humanoids' },
  { term: 'Locathah', category: 'race', description: 'Fish-like humanoids' },
  { term: 'Loxodon', category: 'race', description: 'Elephant-like humanoids' },
  { term: 'Minotaur', category: 'race', description: 'Bull-headed humanoids' },
  { term: 'Orc', category: 'race', description: 'Savage humanoids' },
  { term: 'Satyr', category: 'race', description: 'Goat-legged fey' },
  { term: 'Shifter', category: 'race', description: 'Lycanthrope descendants' },
  { term: 'Simic Hybrid', category: 'race', description: 'Magically enhanced beings' },
  { term: 'Tabaxi', category: 'race', description: 'Cat-like humanoids' },
  { term: 'Tiefling', category: 'race', description: 'Fiend-touched humanoids' },
  { term: 'Tortle', category: 'race', description: 'Turtle-like humanoids' },
  { term: 'Triton', category: 'race', description: 'Sea-dwelling humanoids' },
  { term: 'Vedalken', category: 'race', description: 'Blue-skinned scholars' },
  { term: 'Warforged', category: 'race', description: 'Constructed beings' },
  { term: 'Yuan-ti Pureblood', category: 'race', description: 'Snake-like humanoids' }
];

/**
 * Official D&D 5e Character Classes
 */
export const DND_CLASSES: DnDTerm[] = [
  { term: 'Artificer', category: 'class', description: 'Magical inventors' },
  { term: 'Barbarian', category: 'class', description: 'Fierce warriors' },
  { term: 'Bard', category: 'class', description: 'Magical performers' },
  { term: 'Cleric', category: 'class', description: 'Divine spellcasters' },
  { term: 'Druid', category: 'class', description: 'Nature magic wielders' },
  { term: 'Fighter', category: 'class', description: 'Master combatants' },
  { term: 'Monk', category: 'class', description: 'Martial artists' },
  { term: 'Paladin', category: 'class', description: 'Holy warriors' },
  { term: 'Ranger', category: 'class', description: 'Wilderness guardians' },
  { term: 'Rogue', category: 'class', description: 'Sneaky specialists' },
  { term: 'Sorcerer', category: 'class', description: 'Innate magic users' },
  { term: 'Warlock', category: 'class', description: 'Pact-bound spellcasters' },
  { term: 'Wizard', category: 'class', description: 'Scholarly spellcasters' }
];

/**
 * Common D&D 5e Spells
 */
export const DND_SPELLS: DnDTerm[] = [
  { term: 'Acid Splash', category: 'spell' },
  { term: 'Aid', category: 'spell' },
  { term: 'Animate Dead', category: 'spell' },
  { term: 'Antimagic Field', category: 'spell' },
  { term: 'Arcane Eye', category: 'spell' },
  { term: 'Bane', category: 'spell' },
  { term: 'Banishment', category: 'spell' },
  { term: 'Barkskin', category: 'spell' },
  { term: 'Bless', category: 'spell' },
  { term: 'Blur', category: 'spell' },
  { term: 'Burning Hands', category: 'spell' },
  { term: 'Call Lightning', category: 'spell' },
  { term: 'Charm Person', category: 'spell' },
  { term: 'Circle of Death', category: 'spell' },
  { term: 'Cone of Cold', category: 'spell' },
  { term: 'Counterspell', category: 'spell' },
  { term: 'Cure Wounds', category: 'spell' },
  { term: 'Dancing Lights', category: 'spell' },
  { term: 'Darkness', category: 'spell' },
  { term: 'Daylight', category: 'spell' },
  { term: 'Detect Magic', category: 'spell' },
  { term: 'Dimension Door', category: 'spell' },
  { term: 'Dispel Magic', category: 'spell' },
  { term: 'Dominate Person', category: 'spell' },
  { term: 'Eldritch Blast', category: 'spell' },
  { term: 'Faerie Fire', category: 'spell' },
  { term: 'Find Familiar', category: 'spell' },
  { term: 'Fireball', category: 'spell' },
  { term: 'Flame Strike', category: 'spell' },
  { term: 'Fly', category: 'spell' },
  { term: 'Fog Cloud', category: 'spell' },
  { term: 'Greater Invisibility', category: 'spell' },
  { term: 'Guidance', category: 'spell' },
  { term: 'Guiding Bolt', category: 'spell' },
  { term: 'Haste', category: 'spell' },
  { term: 'Heal', category: 'spell' },
  { term: 'Hold Person', category: 'spell' },
  { term: 'Hunter\'s Mark', category: 'spell' },
  { term: 'Ice Storm', category: 'spell' },
  { term: 'Invisibility', category: 'spell' },
  { term: 'Lightning Bolt', category: 'spell' },
  { term: 'Mage Armor', category: 'spell' },
  { term: 'Mage Hand', category: 'spell' },
  { term: 'Magic Missile', category: 'spell' },
  { term: 'Mass Cure Wounds', category: 'spell' },
  { term: 'Meteor Swarm', category: 'spell' },
  { term: 'Minor Illusion', category: 'spell' },
  { term: 'Misty Step', category: 'spell' },
  { term: 'Polymorph', category: 'spell' },
  { term: 'Prestidigitation', category: 'spell' },
  { term: 'Sacred Flame', category: 'spell' },
  { term: 'Shield', category: 'spell' },
  { term: 'Sleep', category: 'spell' },
  { term: 'Spiritual Weapon', category: 'spell' },
  { term: 'Suggestion', category: 'spell' },
  { term: 'Teleport', category: 'spell' },
  { term: 'Thaumaturgy', category: 'spell' },
  { term: 'Thunder Wave', category: 'spell' },
  { term: 'Time Stop', category: 'spell' },
  { term: 'Vicious Mockery', category: 'spell' },
  { term: 'Wall of Fire', category: 'spell' },
  { term: 'Web', category: 'spell' },
  { term: 'Wish', category: 'spell' }
];

/**
 * D&D 5e Creatures and Monsters
 */
export const DND_CREATURES: DnDTerm[] = [
  { term: 'Aboleth', category: 'creature' },
  { term: 'Ancient Dragon', category: 'creature' },
  { term: 'Ankheg', category: 'creature' },
  { term: 'Beholder', category: 'creature' },
  { term: 'Bulezau', category: 'creature' },
  { term: 'Chimera', category: 'creature' },
  { term: 'Displacer Beast', category: 'creature' },
  { term: 'Doppelganger', category: 'creature' },
  { term: 'Dryad', category: 'creature' },
  { term: 'Elemental', category: 'creature' },
  { term: 'Ettercap', category: 'creature' },
  { term: 'Gelatinous Cube', category: 'creature' },
  { term: 'Ghoul', category: 'creature' },
  { term: 'Giant Spider', category: 'creature' },
  { term: 'Gnoll', category: 'creature' },
  { term: 'Griffon', category: 'creature' },
  { term: 'Harpy', category: 'creature' },
  { term: 'Hippogriff', category: 'creature' },
  { term: 'Hydra', category: 'creature' },
  { term: 'Kraken', category: 'creature' },
  { term: 'Lich', category: 'creature' },
  { term: 'Manticore', category: 'creature' },
  { term: 'Mind Flayer', category: 'creature', aliases: ['Illithid'] },
  { term: 'Mimic', category: 'creature' },
  { term: 'Naga', category: 'creature' },
  { term: 'Owlbear', category: 'creature' },
  { term: 'Pegasus', category: 'creature' },
  { term: 'Phoenix', category: 'creature' },
  { term: 'Rakshasa', category: 'creature' },
  { term: 'Rust Monster', category: 'creature' },
  { term: 'Sphinx', category: 'creature' },
  { term: 'Tarrasque', category: 'creature' },
  { term: 'Troll', category: 'creature' },
  { term: 'Unicorn', category: 'creature' },
  { term: 'Vampire', category: 'creature' },
  { term: 'Wight', category: 'creature' },
  { term: 'Wyvern', category: 'creature' },
  { term: 'Zombie', category: 'creature' }
];

/**
 * D&D 5e Locations and Planes
 */
export const DND_LOCATIONS: DnDTerm[] = [
  { term: 'Baldur\'s Gate', category: 'location' },
  { term: 'Candlekeep', category: 'location' },
  { term: 'Neverwinter', category: 'location' },
  { term: 'Waterdeep', category: 'location' },
  { term: 'Ravenloft', category: 'location' },
  { term: 'Barovia', category: 'location' },
  { term: 'Forgotten Realms', category: 'location' },
  { term: 'Eberron', category: 'location' },
  { term: 'Greyhawk', category: 'location' },
  { term: 'Dragonlance', category: 'location' },
  { term: 'Feywild', category: 'plane' },
  { term: 'Shadowfell', category: 'plane' },
  { term: 'Astral Plane', category: 'plane' },
  { term: 'Ethereal Plane', category: 'plane' },
  { term: 'Plane of Fire', category: 'plane' },
  { term: 'Plane of Water', category: 'plane' },
  { term: 'Plane of Air', category: 'plane' },
  { term: 'Plane of Earth', category: 'plane' },
  { term: 'Nine Hells', category: 'plane' },
  { term: 'Abyss', category: 'plane' },
  { term: 'Mount Celestia', category: 'plane' },
  { term: 'Limbo', category: 'plane' }
];

/**
 * D&D 5e Conditions and Game Terms
 */
export const DND_CONDITIONS: DnDTerm[] = [
  { term: 'Blinded', category: 'condition' },
  { term: 'Charmed', category: 'condition' },
  { term: 'Deafened', category: 'condition' },
  { term: 'Frightened', category: 'condition' },
  { term: 'Grappled', category: 'condition' },
  { term: 'Incapacitated', category: 'condition' },
  { term: 'Invisible', category: 'condition' },
  { term: 'Paralyzed', category: 'condition' },
  { term: 'Petrified', category: 'condition' },
  { term: 'Poisoned', category: 'condition' },
  { term: 'Prone', category: 'condition' },
  { term: 'Restrained', category: 'condition' },
  { term: 'Stunned', category: 'condition' },
  { term: 'Unconscious', category: 'condition' }
];

/**
 * D&D 5e Abilities and Skills
 */
export const DND_ABILITIES: DnDTerm[] = [
  { term: 'Strength', category: 'ability' },
  { term: 'Dexterity', category: 'ability' },
  { term: 'Constitution', category: 'ability' },
  { term: 'Intelligence', category: 'ability' },
  { term: 'Wisdom', category: 'ability' },
  { term: 'Charisma', category: 'ability' },
  { term: 'Acrobatics', category: 'ability' },
  { term: 'Animal Handling', category: 'ability' },
  { term: 'Arcana', category: 'ability' },
  { term: 'Athletics', category: 'ability' },
  { term: 'Deception', category: 'ability' },
  { term: 'History', category: 'ability' },
  { term: 'Insight', category: 'ability' },
  { term: 'Intimidation', category: 'ability' },
  { term: 'Investigation', category: 'ability' },
  { term: 'Medicine', category: 'ability' },
  { term: 'Nature', category: 'ability' },
  { term: 'Perception', category: 'ability' },
  { term: 'Performance', category: 'ability' },
  { term: 'Persuasion', category: 'ability' },
  { term: 'Religion', category: 'ability' },
  { term: 'Sleight of Hand', category: 'ability' },
  { term: 'Stealth', category: 'ability' },
  { term: 'Survival', category: 'ability' }
];

/**
 * Combine all D&D terms into a single searchable array
 */
export const ALL_DND_TERMS: DnDTerm[] = [
  ...DND_RACES,
  ...DND_CLASSES,
  ...DND_SPELLS,
  ...DND_CREATURES,
  ...DND_LOCATIONS,
  ...DND_CONDITIONS,
  ...DND_ABILITIES
];

/**
 * Create a set of all valid D&D terms for quick lookup
 */
export const DND_TERM_SET: Set<string> = new Set([
  ...ALL_DND_TERMS.map(term => term.term.toLowerCase()),
  ...ALL_DND_TERMS.flatMap(term => term.aliases?.map(alias => alias.toLowerCase()) || [])
]);

/**
 * Check if a word is a valid D&D term
 */
export function isDnDTerm(word: string): boolean {
  return DND_TERM_SET.has(word.toLowerCase());
}

/**
 * Get D&D term information by word
 */
export function getDnDTermInfo(word: string): DnDTerm | undefined {
  const lowerWord = word.toLowerCase();
  return ALL_DND_TERMS.find(term => 
    term.term.toLowerCase() === lowerWord || 
    term.aliases?.some(alias => alias.toLowerCase() === lowerWord)
  );
}

/**
 * Campaign writing style guidelines
 */
export const CAMPAIGN_STYLE_GUIDELINES = {
  dialogue: {
    style: 'conversational',
    guidelines: [
      'Use natural, character-appropriate speech patterns',
      'Vary sentence length to create natural rhythm',
      'Include speech tags that reveal character personality',
      'Use contractions and colloquialisms appropriately',
      'Show don\'t tell through dialogue choices'
    ]
  },
  description: {
    style: 'descriptive',
    guidelines: [
      'Use vivid, sensory language to create atmosphere',
      'Employ active voice for dynamic scenes',
      'Balance detail with pacing',
      'Create clear mental images without overwhelming',
      'Use metaphors and similes that fit the fantasy setting'
    ]
  },
  narration: {
    style: 'descriptive',
    guidelines: [
      'Maintain consistent narrative voice',
      'Use present tense for immediate scenes',
      'Provide clear transitions between scenes',
      'Balance exposition with action',
      'Leave room for player agency and interpretation'
    ]
  }
}; 