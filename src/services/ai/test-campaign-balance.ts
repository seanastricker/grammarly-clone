/**
 * Simple test for Campaign Balance Analyzer
 */

import { campaignBalanceAnalyzer } from './campaign-balance-analyzer';

// Test content with various D&D elements
const testCampaign = `
# The Lost Temple Adventure

## Introduction
The party arrives at the ancient village of Elmwood, where the local inn keeper tells them about strange disappearances near the old temple.

## Scene 1: Investigation
The players can talk to the villagers to gather information. Roll for persuasion checks to get more details. The blacksmith mentions seeing strange lights. The priest warns of ancient curses.

## Scene 2: Journey to Temple
As the party travels through the dark forest, they must make perception checks to notice the wolves stalking them. Suddenly, three dire wolves attack! Roll initiative.

Combat: 
- 3 Dire Wolves (AC 14, HP 37 each)
- Use pack tactics
- Fight until reduced to 1/4 health, then flee

## Scene 3: Temple Entrance
The temple doors bear an ancient riddle: "What walks on four legs in the morning, two legs at noon, and three legs in the evening?" The answer is "human" - speaking it opens the doors.

## Scene 4: Inner Sanctum
Inside, the party discovers a trapped priest who explains the curse. They must negotiate with him to learn how to break the ancient seal.

## Final Battle
The temple guardian awakens! A stone golem emerges from the wall.

Combat:
- Stone Golem (AC 17, HP 178)
- Immune to spells below 4th level
- Slam attacks deal 2d8+5 damage

After defeating the golem, the curse is lifted and the village is saved.
`;

export async function testCampaignAnalyzer() {
  console.log('🧪 Testing Campaign Balance Analyzer...');
  
  try {
    const analysis = await campaignBalanceAnalyzer.analyzeCampaign(testCampaign);
    
    console.log('✅ Analysis completed successfully!');
    console.log('📊 Content Breakdown:', analysis.contentBreakdown);
    console.log('⏱️ Estimated Duration:', analysis.estimatedDuration, 'minutes');
    console.log('🎯 Overall Score:', analysis.overallScore, '/100');
    console.log('📝 Recommendations:', analysis.recommendations.length);
    
    // Log each recommendation
    analysis.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.targetSection}: ${rec.description}`);
    });
    
    return analysis;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for potential use in components or other tests
export { testCampaign }; 