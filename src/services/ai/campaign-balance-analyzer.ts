/**
 * @fileoverview Campaign Balance Analyzer - AI-powered analysis of D&D campaign content balance
 * @author WordWise AI Team
 * @version 1.0.0
 */

// Simple analyzer without external dependencies for now

export interface ContentSegment {
  id: string;
  content: string;
  type: 'combat' | 'roleplay' | 'exploration' | 'puzzle' | 'transition';
  confidence: number;
  startPosition: number;
  endPosition: number;
  duration: number; // estimated time in minutes
}

export interface BalanceMetrics {
  combat: number;
  roleplay: number;
  exploration: number;
  puzzle: number;
  transition: number;
}

export interface PacingMetrics {
  averageSegmentLength: number;
  longestSingleType: { type: string; duration: number };
  transitionQuality: number; // 0-100 score for smooth transitions
  climaxPlacement: number; // 0-100 percentage where main climax occurs
}

export interface Recommendation {
  id: string;
  type: 'add_content' | 'modify_existing' | 'reorder_sections';
  priority: 'high' | 'medium' | 'low';
  targetSection: string;
  description: string;
  specificSuggestion: string;
  expectedImpact: string;
  playerArchetypes: string[]; // which player types this helps
  autoApplicable: boolean;
  autoApplyAction?: {
    insertAt: number;
    insertContent: string;
  } | {
    replaceFrom: number;
    replaceTo: number;
    replaceContent: string;
  };
}

export interface BalanceAnalysis {
  contentBreakdown: BalanceMetrics;
  pacingAnalysis: PacingMetrics;
  recommendations: Recommendation[];
  overallScore: number; // 0-100 overall balance score
  estimatedDuration: number; // total estimated session time in minutes
  userPreferences?: BalanceMetrics; // user's preferred balance ratios
}

export interface BalancePreferences {
  combat: number;
  roleplay: number;
  exploration: number;
  puzzle: number;
  transition: number;
}

export class CampaignBalanceAnalyzer {
  private defaultPreferences: BalancePreferences = {
    combat: 30,
    roleplay: 35,
    exploration: 20,
    puzzle: 10,
    transition: 5
  };

  /**
   * Analyze campaign content for balance and pacing
   */
  async analyzeCampaign(
    content: string, 
    userPreferences?: BalancePreferences
  ): Promise<BalanceAnalysis> {
    if (!content || content.trim().length < 100) {
      throw new Error('Content too short for meaningful analysis (minimum 100 characters)');
    }

    try {
      // Step 1: Classify content into segments
      const segments = await this.classifyContent(content);
      
      // Step 2: Calculate balance metrics
      const contentBreakdown = this.calculateBalance(segments);
      
      // Step 3: Analyze pacing
      const pacingAnalysis = this.analyzePacing(segments);
      
      // Step 4: Calculate overall score
      const preferences = userPreferences || this.defaultPreferences;
      const overallScore = this.calculateOverallScore(contentBreakdown, pacingAnalysis, preferences);
      
      // Step 5: Generate recommendations
      const recommendations = this.generateRecommendations(
        contentBreakdown, 
        pacingAnalysis, 
        preferences,
        segments,
        content
      );

      // Step 6: Calculate estimated duration
      const estimatedDuration = segments.reduce((total, segment) => total + segment.duration, 0);

      return {
        contentBreakdown,
        pacingAnalysis,
        recommendations,
        overallScore,
        estimatedDuration,
        userPreferences: preferences
      };
    } catch (error) {
      console.error('Campaign analysis failed:', error);
      throw new Error('Failed to analyze campaign. Please try again.');
    }
  }

    /**
   * Classify content into typed segments using rule-based analysis
   */
  private async classifyContent(content: string): Promise<ContentSegment[]> {
    // For now, use rule-based classification
    return this.fallbackClassification(content);
  }

  /**
   * Fallback rule-based classification if AI fails
   */
  private fallbackClassification(content: string): ContentSegment[] {
    const segments: ContentSegment[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentPosition = 0;
    
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      const startPos = currentPosition;
      const endPos = currentPosition + trimmed.length;
      
      // Simple keyword-based classification
      let type: ContentSegment['type'] = 'transition';
      let duration = 2; // default 2 minutes
      
      if (/\b(attack|damage|hit points|initiative|combat|battle|fight)\b/i.test(trimmed)) {
        type = 'combat';
        duration = 5;
      } else if (/\b(says|asks|persuasion|deception|dialogue|conversation)\b/i.test(trimmed)) {
        type = 'roleplay';
        duration = 3;
      } else if (/\b(search|investigate|explore|discover|examine)\b/i.test(trimmed)) {
        type = 'exploration';
        duration = 4;
      } else if (/\b(puzzle|riddle|solve|problem|challenge)\b/i.test(trimmed)) {
        type = 'puzzle';
        duration = 8;
      }

      segments.push({
        id: `fallback-${index}`,
        content: trimmed,
        type,
        confidence: 60, // Lower confidence for fallback
        startPosition: startPos,
        endPosition: endPos,
        duration
      });

      currentPosition = endPos + 1;
    });

    return segments;
  }

  /**
   * Calculate balance percentages from segments
   */
  private calculateBalance(segments: ContentSegment[]): BalanceMetrics {
    const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);
    
    if (totalDuration === 0) {
      return { combat: 0, roleplay: 0, exploration: 0, puzzle: 0, transition: 0 };
    }

    const typeSum = segments.reduce((acc, segment) => {
      acc[segment.type] = (acc[segment.type] || 0) + segment.duration;
      return acc;
    }, {} as Record<string, number>);

    return {
      combat: Math.round(((typeSum.combat || 0) / totalDuration) * 100),
      roleplay: Math.round(((typeSum.roleplay || 0) / totalDuration) * 100),
      exploration: Math.round(((typeSum.exploration || 0) / totalDuration) * 100),
      puzzle: Math.round(((typeSum.puzzle || 0) / totalDuration) * 100),
      transition: Math.round(((typeSum.transition || 0) / totalDuration) * 100)
    };
  }

  /**
   * Analyze pacing and flow
   */
  private analyzePacing(segments: ContentSegment[]): PacingMetrics {
    if (segments.length === 0) {
      return {
        averageSegmentLength: 0,
        longestSingleType: { type: 'transition', duration: 0 },
        transitionQuality: 0,
        climaxPlacement: 0
      };
    }

    const averageSegmentLength = segments.reduce((sum, s) => sum + s.duration, 0) / segments.length;
    
    // Find longest consecutive segments of same type
    let longestSingleType = { type: 'transition', duration: 0 };
    let currentStreak = { type: segments[0].type, duration: segments[0].duration };
    
    for (let i = 1; i < segments.length; i++) {
      if (segments[i].type === currentStreak.type) {
        currentStreak.duration += segments[i].duration;
      } else {
        if (currentStreak.duration > longestSingleType.duration) {
          longestSingleType = { ...currentStreak };
        }
        currentStreak = { type: segments[i].type, duration: segments[i].duration };
      }
    }
    
    // Check final streak
    if (currentStreak.duration > longestSingleType.duration) {
      longestSingleType = { ...currentStreak };
    }

    // Calculate transition quality (fewer abrupt changes = higher score)
    let transitions = 0;
    let goodTransitions = 0;
    for (let i = 1; i < segments.length; i++) {
      transitions++;
      // Good transitions: combat->roleplay, exploration->puzzle, etc.
      const prev = segments[i-1].type;
      const curr = segments[i].type;
      if (
        (prev === 'combat' && curr === 'roleplay') ||
        (prev === 'exploration' && curr === 'puzzle') ||
        (prev === 'roleplay' && curr === 'exploration') ||
        curr === 'transition'
      ) {
        goodTransitions++;
      }
    }
    const transitionQuality = transitions > 0 ? Math.round((goodTransitions / transitions) * 100) : 100;

    // Find climax placement (assume longest combat segment is climax)
    const combatSegments = segments.filter(s => s.type === 'combat');
    let climaxPlacement = 50; // default middle
    if (combatSegments.length > 0) {
      const biggestCombat = combatSegments.reduce((max, seg) => 
        seg.duration > max.duration ? seg : max
      );
      const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
      const climaxStart = segments
        .slice(0, segments.findIndex(s => s.id === biggestCombat.id))
        .reduce((sum, s) => sum + s.duration, 0);
      climaxPlacement = Math.round((climaxStart / totalDuration) * 100);
    }

    return {
      averageSegmentLength,
      longestSingleType,
      transitionQuality,
      climaxPlacement
    };
  }

  /**
   * Calculate overall balance score
   */
  private calculateOverallScore(
    balance: BalanceMetrics, 
    pacing: PacingMetrics,
    preferences: BalancePreferences
  ): number {
    // Score based on how close actual balance is to preferred balance
    const balanceScore = 100 - Math.abs(balance.combat - preferences.combat) 
                            - Math.abs(balance.roleplay - preferences.roleplay)
                            - Math.abs(balance.exploration - preferences.exploration)
                            - Math.abs(balance.puzzle - preferences.puzzle)
                            - Math.abs(balance.transition - preferences.transition);

    // Pacing score factors
    const pacingScore = (
      pacing.transitionQuality * 0.4 +
      (pacing.climaxPlacement >= 60 && pacing.climaxPlacement <= 80 ? 100 : 50) * 0.3 +
      (pacing.longestSingleType.duration < 30 ? 100 : 70) * 0.3
    );

    // Weighted combination
    return Math.max(0, Math.min(100, Math.round(balanceScore * 0.7 + pacingScore * 0.3)));
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    balance: BalanceMetrics,
    pacing: PacingMetrics,
    preferences: BalancePreferences,
    segments: ContentSegment[],
    originalContent: string
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    let recId = 1;

    // Balance recommendations
    Object.entries(preferences).forEach(([type, preferred]) => {
      const actual = balance[type as keyof BalanceMetrics];
      const difference = preferred - actual;
      
      if (Math.abs(difference) > 10) { // Significant imbalance
        const priority = Math.abs(difference) > 20 ? 'high' : 'medium';
        
        if (difference > 0) {
          // Need more of this type
          recommendations.push({
            id: `balance-add-${recId++}`,
            type: 'add_content',
            priority,
            targetSection: `Add more ${type} content`,
            description: `Your campaign has ${actual}% ${type} content, but you prefer ${preferred}%. Consider adding more ${type} elements.`,
            specificSuggestion: this.getContentSuggestion(type as keyof BalanceMetrics, 'add'),
            expectedImpact: `Will increase ${type} content by approximately ${Math.ceil(difference/2)}%`,
            playerArchetypes: this.getArchetypesForContent(type as keyof BalanceMetrics),
            autoApplicable: true,
            autoApplyAction: {
              insertAt: Math.floor(originalContent.length * 0.7), // Insert near end
              insertContent: this.generateContentForType(type as keyof BalanceMetrics)
            }
          });
        }
      }
    });

    // Pacing recommendations
    if (pacing.longestSingleType.duration > 25) {
      recommendations.push({
        id: `pacing-break-${recId++}`,
        type: 'modify_existing',
        priority: 'high',
        targetSection: `Break up long ${pacing.longestSingleType.type} section`,
        description: `You have a ${pacing.longestSingleType.duration}-minute ${pacing.longestSingleType.type} section. Consider breaking it up with other content types.`,
        specificSuggestion: `Add a brief ${this.getComplementaryType(pacing.longestSingleType.type)} interlude to maintain engagement.`,
        expectedImpact: 'Will improve pacing and prevent player fatigue',
        playerArchetypes: ['all'],
        autoApplicable: false
      });
    }

    if (pacing.climaxPlacement < 60 || pacing.climaxPlacement > 90) {
      recommendations.push({
        id: `climax-placement-${recId++}`,
        type: 'reorder_sections',
        priority: 'medium',
        targetSection: 'Climax positioning',
        description: `Your main climax occurs at ${pacing.climaxPlacement}% through the session. The ideal range is 60-80%.`,
        specificSuggestion: pacing.climaxPlacement < 60 ? 
          'Consider moving your biggest encounter later in the session.' :
          'Consider moving your biggest encounter earlier, or adding a final resolution phase.',
        expectedImpact: 'Will improve story pacing and player satisfaction',
        playerArchetypes: ['achievers', 'explorers'],
        autoApplicable: false
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Helper methods for content generation
   */
  private getContentSuggestion(type: keyof BalanceMetrics, action: 'add' | 'reduce'): string {
    const suggestions = {
      combat: action === 'add' ? 
        'Add a random encounter or expand existing combat with additional waves of enemies.' :
        'Consider resolving some combat encounters through roleplay or skill challenges.',
      roleplay: action === 'add' ?
        'Add NPC interactions, moral dilemmas, or negotiation opportunities.' :
        'Streamline dialogue and focus on key character moments.',
      exploration: action === 'add' ?
        'Add environmental puzzles, hidden areas, or investigative elements.' :
        'Provide clearer directions and reduce backtracking.',
      puzzle: action === 'add' ?
        'Include riddles, mechanical challenges, or problem-solving scenarios.' :
        'Simplify existing puzzles or provide alternative solutions.',
      transition: action === 'add' ?
        'Add travel scenes, scene-setting descriptions, or connecting narrative.' :
        'Use quick cuts between scenes and reduce lengthy descriptions.'
    };
    
    return suggestions[type];
  }

  private getArchetypesForContent(type: keyof BalanceMetrics): string[] {
    const archetypes = {
      combat: ['achievers', 'killers'],
      roleplay: ['socializers', 'explorers'],
      exploration: ['explorers', 'achievers'],
      puzzle: ['achievers', 'explorers'],
      transition: ['socializers']
    };
    
    return archetypes[type] || ['all'];
  }

  private getComplementaryType(type: string): string {
    const complements: Record<string, string> = {
      combat: 'roleplay',
      roleplay: 'exploration',
      exploration: 'puzzle',
      puzzle: 'roleplay',
      transition: 'roleplay'
    };
    
    return complements[type] || 'roleplay';
  }

  private generateContentForType(type: keyof BalanceMetrics): string {
    const templates = {
      combat: '\n\n**Random Encounter**: As the party continues, they hear rustling in the nearby bushes. Roll initiative as 1d4 + 1 dire wolves emerge, hungry and aggressive.\n\n',
      roleplay: '\n\n**NPC Interaction**: The party encounters a traveling merchant who has information about their destination, but wants something in return. This is an opportunity for negotiation and character development.\n\n',
      exploration: '\n\n**Discovery Opportunity**: The party notices something unusual about their surroundings. Allow them to make Investigation or Perception checks to uncover a hidden detail that could aid their quest.\n\n',
      puzzle: '\n\n**Challenge**: The party faces a puzzle that blocks their progress. They must work together to solve it, using their combined skills and creativity.\n\n',
      transition: '\n\n**Scene Transition**: As the party moves forward, describe the changing environment and allow for character moments or brief conversations.\n\n'
    };
    
    return templates[type] || templates.transition;
  }
}

// Export singleton instance
export const campaignBalanceAnalyzer = new CampaignBalanceAnalyzer(); 