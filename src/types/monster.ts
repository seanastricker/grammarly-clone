// Monster types for Open5e API integration
export interface Open5eMonster {
  slug: string;
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: number;
  armor_desc?: string;
  hit_points: number;
  hit_dice: string;
  speed: {
    walk?: number;
    fly?: number;
    swim?: number;
    burrow?: number;
    climb?: number;
  };
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  challenge_rating: string;
  cr: number;
  senses: string;
  languages: string;
  desc?: string;
  actions?: Array<{
    name: string;
    desc: string;
  }>;
  special_abilities?: Array<{
    name: string;
    desc: string;
  }>;
}

export interface MonsterReSkin {
  id: string;
  originalMonster: Open5eMonster;
  newName: string;
  visualDescription: string;
  behavioralChanges: string;
  loreAdaptation: string;
  createdAt: Date;
}

export interface ReSkinRequest {
  monster: Open5eMonster;
  theme?: string;
  environment?: string;
  tone?: 'dark' | 'whimsical' | 'horror' | 'heroic' | 'mysterious';
}

export interface MonsterSearchFilters {
  challengeRatingMin?: number;
  challengeRatingMax?: number;
  monsterType?: string;
  size?: string;
  searchQuery?: string;
}

export interface Open5eApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Open5eMonster[];
} 