/**
 * @fileoverview Vitest test for D&D-enhanced grammar analysis
 * @author D&D Campaign Assistant
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { analyzeTextWithAI } from './grammar-ai-service';
import { isDnDTerm, getDnDTermInfo } from './dnd-dictionary';
import type { UserProfile } from '@/types/auth';

const testUserProfile: UserProfile = {
  id: 'test-user',
  email: 'test@example.com',
  displayName: 'Test DM',
  photoURL: null,
  userType: 'creator',
  experienceLevel: 'intermediate',
  preferredTone: 'creative',
  preferences: {
    theme: 'light',
    suggestionFrequency: 'medium',
    grammarCheckEnabled: true,
    styleSuggestionsEnabled: true,
    realtimeSuggestionsEnabled: true,
    notifications: {
      email: false,
      inApp: true,
      weekly: false
    },
    autoSaveInterval: 300,
    defaultPrivacy: 'private'
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  emailVerified: true,
  subscriptionStatus: 'free'
};

describe('D&D Terminology Recognition', () => {
  it('should recognize D&D races', () => {
    expect(isDnDTerm('Tiefling')).toBe(true);
    expect(isDnDTerm('Dragonborn')).toBe(true);
    expect(isDnDTerm('Half-Elf')).toBe(true);
    expect(isDnDTerm('regular_word')).toBe(false);
  });

  it('should recognize D&D classes', () => {
    expect(isDnDTerm('Warlock')).toBe(true);
    expect(isDnDTerm('Paladin')).toBe(true);
    expect(isDnDTerm('Artificer')).toBe(true);
  });

  it('should recognize D&D spells', () => {
    expect(isDnDTerm('Eldritch Blast')).toBe(true);
    expect(isDnDTerm('Fireball')).toBe(true);
    expect(isDnDTerm('Counterspell')).toBe(true);
  });

  it('should recognize D&D creatures', () => {
    expect(isDnDTerm('Owlbear')).toBe(true);
    expect(isDnDTerm('Beholder')).toBe(true);
    expect(isDnDTerm('Mind Flayer')).toBe(true);
    expect(isDnDTerm('Illithid')).toBe(true); // alias
  });

  it('should provide term information', () => {
    const tieflingInfo = getDnDTermInfo('Tiefling');
    expect(tieflingInfo).toBeDefined();
    expect(tieflingInfo?.category).toBe('race');
    expect(tieflingInfo?.description).toContain('Fiend-touched');
  });
});

describe('D&D Campaign Grammar Analysis', () => {
  it('should analyze campaign text with D&D awareness', async () => {
    const campaignText = `
The Tiefling Warlock casts Eldritch Blast at the Owlbear. 
"I dont think we can win this fight!" shouts the Dragonborn Fighter.
The players must defeat the monster to continue.
There going to need alot of luck.
`;

    const result = await analyzeTextWithAI(campaignText, testUserProfile, {
      enableGrammar: true,
      enableSpelling: true,
      enableStyle: true
    });

    // Should detect D&D terms without flagging them as errors
    expect(result.statistics.campaignMetrics?.dndTerms).toBeGreaterThan(0);
    
    // Should detect grammar/spelling errors in non-D&D words
    expect(result.errors.length).toBeGreaterThan(0);
    
    // Check that D&D terms are not flagged as errors
    const dndTermErrors = result.errors.filter(error => 
      isDnDTerm(error.context.text.substring(error.context.highlightStart, error.context.highlightEnd))
    );
    expect(dndTermErrors.length).toBe(0);

    console.log('\n🎲 D&D Grammar Analysis Results:');
    console.log(`📊 D&D terms detected: ${result.statistics.campaignMetrics?.dndTerms}`);
    console.log(`📝 Total errors found: ${result.errors.length}`);
    console.log(`⚖️ Style balance: ${result.statistics.campaignMetrics?.styleBalance}`);
    console.log(`💬 Dialogue ratio: ${result.statistics.campaignMetrics?.dialogueRatio}`);
    
    if (result.errors.length > 0) {
      console.log('\n🔍 Errors found (excluding D&D terms):');
      result.errors.forEach((error, index) => {
        const errorText = error.context.text.substring(
          error.context.highlightStart, 
          error.context.highlightEnd
        );
        console.log(`  ${index + 1}. [${error.type}] "${errorText}" → "${error.suggestions[0] || 'N/A'}"`);
        console.log(`     ${error.message}`);
      });
    }
  }, 10000); // 10 second timeout for API calls

  it('should detect style issues specific to campaigns', async () => {
    const railroadingText = 'The players must go through the door. The characters have to fight the dragon.';
    
    const result = await analyzeTextWithAI(railroadingText, testUserProfile, {
      enableStyle: true
    });

    // Should suggest less prescriptive language
    const styleErrors = result.errors.filter(error => error.type === 'style');
    expect(styleErrors.length).toBeGreaterThan(0);
    
    console.log('\n🎭 Campaign Style Analysis:');
    styleErrors.forEach(error => {
      console.log(`  • Style suggestion: ${error.message}`);
      console.log(`    "${error.context.text.substring(error.context.highlightStart, error.context.highlightEnd)}" → "${error.suggestions[0]}"`);
    });
  });

  it('should calculate dialogue vs description ratios', async () => {
    const dialogueHeavyText = `
"Hello there!" said the innkeeper.
"We need rooms for the night," replied the paladin.
"That'll be 5 gold pieces," the innkeeper responded.
"Here you go," the fighter said, tossing coins on the counter.
`;

    const result = await analyzeTextWithAI(dialogueHeavyText, testUserProfile);
    
    expect(result.statistics.campaignMetrics?.dialogueRatio).toBeGreaterThan(0.5);
    expect(result.statistics.campaignMetrics?.styleBalance).toBe('dialogue-heavy');
    
    console.log('\n💭 Style Balance Analysis:');
    console.log(`  Dialogue ratio: ${result.statistics.campaignMetrics?.dialogueRatio}`);
    console.log(`  Style balance: ${result.statistics.campaignMetrics?.styleBalance}`);
  });
});

describe('Campaign Export Preparation', () => {
  it('should provide statistics suitable for export features', async () => {
    const fullCampaignText = `
# The Lost Temple of Bahamut

## Introduction
The party arrives in the village of Goldbrook, where rumors speak of an ancient temple dedicated to Bahamut hidden in the nearby mountains.

"Please, adventurers," pleads the village elder. "Our children have gone missing near the old temple ruins."

## Encounter 1: Mountain Path
As the party travels up the mountain path, they encounter a group of Kobolds led by a Hobgoblin captain.

*Roll for initiative!*

The Kobolds attack with shortbows while the Hobgoblin casts Hold Person on the Wizard.
`;

    const result = await analyzeTextWithAI(fullCampaignText, testUserProfile);
    
    // Verify we have comprehensive statistics for export
    expect(result.statistics.wordCount).toBeGreaterThan(0);
    expect(result.statistics.sentenceCount).toBeGreaterThan(0);
    expect(result.statistics.paragraphCount).toBeGreaterThan(0);
    expect(result.statistics.campaignMetrics?.dndTerms).toBeGreaterThan(0);
    
    console.log('\n📋 Export-Ready Statistics:');
    console.log(`  📊 Word count: ${result.statistics.wordCount}`);
    console.log(`  📝 Sentences: ${result.statistics.sentenceCount}`);
    console.log(`  📄 Paragraphs: ${result.statistics.paragraphCount}`);
    console.log(`  🎲 D&D terms: ${result.statistics.campaignMetrics?.dndTerms}`);
    console.log(`  ⭐ Quality score: ${result.statistics.qualityScore}`);
    console.log(`  🚨 Issues: Grammar(${result.statistics.issueCount.grammar}) Spelling(${result.statistics.issueCount.spelling}) Style(${result.statistics.issueCount.style})`);
  });
}); 