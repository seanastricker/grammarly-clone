/**
 * @fileoverview Test script for D&D-enhanced grammar analysis
 * @author D&D Campaign Assistant
 * @version 1.0.0
 */

import { analyzeTextWithAI } from './grammar-ai-service';
import { isDnDTerm } from './dnd-dictionary';

const testUserProfile = {
  id: 'test-user',
  email: 'test@example.com',
  displayName: 'Test DM',
  photoURL: null,
  userType: 'creator' as const,
  experienceLevel: 'intermediate' as const,
  preferredTone: 'creative' as const,
  preferences: {
    theme: 'light' as const,
    suggestionFrequency: 'medium' as const,
    grammarCheckEnabled: true,
    styleSuggestionsEnabled: true,
    realtimeSuggestionsEnabled: true,
    notifications: {
      email: false,
      inApp: true,
      weekly: false
    },
    autoSaveInterval: 300,
    defaultPrivacy: 'private' as const
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  emailVerified: true,
  subscriptionStatus: 'free' as const
};

/**
 * Test D&D terminology recognition
 */
export function testDnDTerminology() {
  console.log('🧪 Testing D&D terminology recognition...');
  
  const testTerms = [
    'Tiefling',
    'Dragonborn', 
    'Eldritch Blast',
    'Owlbear',
    'Baldur\'s Gate',
    'regular_word' // Should not be recognized
  ];
  
  testTerms.forEach(term => {
    const isDnD = isDnDTerm(term);
    console.log(`  ${term}: ${isDnD ? '✅ Recognized' : '❌ Not recognized'}`);
  });
}

/**
 * Test campaign text analysis
 */
export async function testCampaignAnalysis() {
  console.log('🧪 Testing campaign text analysis...');
  
  const campaignText = `
The Tiefling Warlock casts Eldritch Blast at the Owlbear. 
"I dont think we can win this fight!" shouts the Dragonborn Fighter.
The players must defeat the monster to continue.
There going to need alot of luck.
`;

  try {
    const result = await analyzeTextWithAI(campaignText, testUserProfile, {
      enableGrammar: true,
      enableSpelling: true,
      enableStyle: true
    });

    console.log('📊 Analysis Results:');
    console.log(`  Errors found: ${result.errors.length}`);
    console.log(`  D&D terms detected: ${result.statistics.campaignMetrics?.dndTerms || 0}`);
    console.log(`  Style balance: ${result.statistics.campaignMetrics?.styleBalance || 'unknown'}`);
    
    console.log('\n📝 Errors:');
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. [${error.type}] ${error.message}`);
      console.log(`     "${error.context.text.substring(error.context.highlightStart, error.context.highlightEnd)}" → "${error.suggestions[0] || 'N/A'}"`);
    });

    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Run all tests
 */
export async function runDnDGrammarTests() {
  console.log('🎲 Starting D&D Grammar Service Tests\n');
  
  testDnDTerminology();
  console.log('');
  
  await testCampaignAnalysis();
  
  console.log('\n✅ All tests completed!');
}

// Export for use in other files
export { testUserProfile }; 