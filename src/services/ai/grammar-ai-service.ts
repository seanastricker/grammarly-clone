/**
 * @fileoverview AI-powered grammar, spelling, and style checking using GPT-4
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * This service provides GPT-4 powered grammar analysis as a replacement for LanguageTool,
 * while maintaining compatibility with the existing grammar analysis interface.
 * Enhanced for D&D campaign writing with fantasy terminology recognition.
 */

import OpenAI from 'openai';
import type { UserProfile } from '@/types/auth';
import { isDnDTerm, getDnDTermInfo, ALL_DND_TERMS, CAMPAIGN_STYLE_GUIDELINES } from './dnd-dictionary';

// Use the same OpenAI client initialization as the main service
let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Only for demo - use backend in production
    });
    console.log('🤖 AI Grammar Service: OpenAI client initialized with D&D enhancement');
  } else {
    console.log('🤖 AI Grammar Service: Running in demo mode with D&D enhancement');
  }
} catch (error) {
  console.warn('🤖 AI Grammar Service: Failed to initialize OpenAI client:', error);
}

// Interface compatible with existing AnalyzedError from LanguageTool
export interface AIGrammarError {
  id: string;
  message: string;
  shortMessage: string;
  type: 'grammar' | 'spelling' | 'style';
  category: 'grammar' | 'spelling' | 'style';
  position: {
    start: number;
    end: number;
  };
  context: {
    text: string;
    highlightStart: number;
    highlightEnd: number;
  };
  suggestions: string[];
  confidence: number;
  rule?: {
    id: string;
    description: string;
    category: string;
  };
  // Enhanced for D&D
  dndContext?: {
    isDnDTerm: boolean;
    termInfo?: {
      term: string;
      category: string;
      description?: string;
    };
  };
}

export interface AIGrammarStatistics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTime: number;
  qualityScore: number;
  issueCount: {
    grammar: number;
    spelling: number;
    style: number;
  };
  // Enhanced for D&D campaigns
  campaignMetrics?: {
    dndTerms: number;
    dialogueRatio: number;
    descriptiveRatio: number;
    styleBalance: 'dialogue-heavy' | 'description-heavy' | 'balanced';
  };
}

/**
 * Create D&D-aware system prompt for campaign analysis
 */
function createDnDSystemPrompt(options: {
  enableGrammar?: boolean;
  enableSpelling?: boolean;
  enableStyle?: boolean;
  language?: string;
}): string {
  const dndTermsList = ALL_DND_TERMS.slice(0, 50).map(term => term.term).join(', ');
  
  return `You are an expert proofreader specializing in Dungeons & Dragons campaign writing. Analyze the following text for spelling, grammar, and style errors with these enhanced capabilities:

D&D TERMINOLOGY AWARENESS:
You understand official D&D 5e terminology and should NOT flag these as errors:
- Races: ${dndTermsList}
- Classes, spells, creatures, locations, and game terms from official D&D 5e content
- Fantasy terminology that fits the D&D universe

CAMPAIGN WRITING STYLE GUIDELINES:
1. DIALOGUE SECTIONS: Should use conversational style
   - Natural speech patterns appropriate to fantasy characters
   - Contractions and colloquialisms are acceptable in dialogue
   - Vary sentence length for natural rhythm
   - Character voice should be distinct and appropriate

2. DESCRIPTIVE/NARRATIVE SECTIONS: Should use descriptive style
   - Vivid, sensory language to create atmosphere
   - Active voice for dynamic scenes
   - Clear mental images without overwhelming detail
   - Fantasy-appropriate metaphors and similes
   - Leave room for player agency (avoid overly prescriptive language)

3. CAMPAIGN STRUCTURE:
   - Maintain consistent narrative voice
   - Clear transitions between scenes
   - Balance exposition with action
   - Appropriate pacing for tabletop gameplay

CRITICAL REQUIREMENTS:
1. Each error must be reported as a SEPARATE issue - do not combine multiple errors
2. The "OriginalFragment" must be the SMALLEST possible exact substring that contains the error
3. Only report ONE error per OriginalFragment
4. The "SuggestedCorrection" should only fix that ONE specific error
5. DO NOT flag legitimate D&D terms as spelling errors

GRAMMAR RULES:
- "who's" vs "who've": "who's" = "who is/has", "who've" = "who have"
  * "team, who's been working" = CORRECT (team has been working)
  * "people, who've been working" = CORRECT (people have been working)
- Subject-verb agreement: Match the verb to the actual subject
  * "He dont" → "He doesn't" (third person singular)
  * "They dont" → "They don't" (plural)

IMPORTANT: Look for these common errors:
- Missing apostrophes in possessives (companys → company's)
- Wrong there/their/they're usage
- Missing contractions with correct subject-verb agreement
- Spelling errors (excelent → excellent, unnecesary → unnecessary)
- Wrong word choices (loose vs lose)
- Style issues specific to campaign writing

VALIDATION: Before reporting an error, ensure:
- The OriginalFragment and SuggestedCorrection are DIFFERENT
- The error actually needs fixing
- You're not suggesting the same text as the original
- The term is not a legitimate D&D 5e term

Focus on:
${options.enableGrammar !== false ? '- Grammar errors (subject-verb agreement, tense, pronouns)\n' : ''}${options.enableSpelling !== false ? '- Spelling mistakes (excluding D&D terminology)\n' : ''}${options.enableStyle !== false ? '- Style improvements for campaign writing (dialogue vs description, clarity, engagement)\n' : ''}
Return each error in this EXACT format:

ISSUE_START
Type: grammar|spelling|style
Message: Brief description of the error
OriginalFragment: exact text to replace
SuggestedCorrection: corrected text
Explanation: Why this is an error and why the correction is better (consider D&D campaign context)
Confidence: 0.0-1.0
ISSUE_END`;
}

/**
 * Analyze text for grammar, spelling, and style issues using GPT-4 with D&D awareness
 */
export async function analyzeTextWithAI(
  text: string,
  userProfile: UserProfile,
  options: {
    enableGrammar?: boolean;
    enableSpelling?: boolean;
    enableStyle?: boolean;
    language?: string;
  } = {}
): Promise<{
  errors: AIGrammarError[];
  statistics: AIGrammarStatistics;
}> {
  if (!text.trim()) {
    return {
      errors: [],
      statistics: {
        wordCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        readingTime: 0,
        qualityScore: 0,
        issueCount: { grammar: 0, spelling: 0, style: 0 },
        campaignMetrics: {
          dndTerms: 0,
          dialogueRatio: 0,
          descriptiveRatio: 0,
          styleBalance: 'balanced'
        }
      }
    };
  }

  console.log('🤖 D&D Grammar Service: Analyzing campaign text with enhanced D&D awareness...');

  // Calculate basic statistics
  const words = text.trim().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  // Calculate D&D-specific metrics
  const campaignMetrics = calculateCampaignMetrics(text, words);

  // Production OpenAI implementation
  if (openai) {
    try {
      const systemPrompt = createDnDSystemPrompt(options);
      const userPrompt = `Please analyze this D&D campaign text for errors:

"${text}"

Provide analysis with exact substrings for each issue found. Remember to respect official D&D 5e terminology and consider campaign writing style guidelines.`;

      console.log('🤖 D&D Grammar Service: Calling OpenAI API with D&D-enhanced prompt...');
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Lower temperature for consistent analysis
        max_tokens: 2000,
      });

      console.log('🤖 D&D Grammar Service: OpenAI response received');
      
      const errors = parseAIGrammarResponse(response.choices[0].message.content, text);
      const statistics = calculateStatistics(words, sentences, paragraphs, errors, campaignMetrics);

      console.log('🤖 D&D Grammar Service: Analysis complete with D&D enhancements');
      console.log('🤖 D&D Grammar Service: Found', campaignMetrics.dndTerms, 'D&D terms');

      return { errors, statistics };
    } catch (error) {
      console.error('🤖 D&D Grammar Service: Error calling OpenAI API:', error);
      console.log('🤖 D&D Grammar Service: Falling back to demo mode');
      // Fall back to demo mode
    }
  } else {
    console.log('🤖 D&D Grammar Service: OpenAI client not initialized - using demo mode');
  }

  // Fallback to demo mode with D&D enhancements
  console.log('🤖 D&D Grammar Service: Using enhanced demo mode');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const errors = generateDnDDemoErrors(text);
  const statistics = calculateStatistics(words, sentences, paragraphs, errors, campaignMetrics);

  return { errors, statistics };
}

/**
 * Generate demo errors for D&D campaign content
 */
function generateDnDDemoErrors(text: string): AIGrammarError[] {
  const errors: AIGrammarError[] = [];
  
  // Don't flag D&D terms as spelling errors
  const words = text.split(/\s+/);
  let position = 0;
  
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, '');
    const wordStart = text.indexOf(word, position);
    const wordEnd = wordStart + word.length;
    
    // Skip if it's a valid D&D term
    if (isDnDTerm(cleanWord)) {
      position = wordEnd;
      continue;
    }
    
    // Check for common errors that aren't D&D terms
    if (word.toLowerCase() === 'alot') {
      errors.push({
        id: `dnd-demo-${errors.length + 1}`,
        message: 'Incorrect spelling. Use "a lot" as two words.',
        shortMessage: 'Spelling error',
        type: 'spelling',
        category: 'spelling',
        position: { start: wordStart, end: wordEnd },
        context: {
          text: text.substring(Math.max(0, wordStart - 20), Math.min(text.length, wordEnd + 20)),
          highlightStart: Math.min(20, wordStart),
          highlightEnd: Math.min(20, wordStart) + word.length
        },
        suggestions: ['a lot'],
        confidence: 0.95
      });
    }
    
    position = wordEnd;
  }
  
  // Add some campaign-specific style suggestions
  if (text.includes('The players must')) {
    const index = text.indexOf('The players must');
    errors.push({
      id: `dnd-style-${errors.length + 1}`,
      message: 'Consider more flexible language to preserve player agency',
      shortMessage: 'Campaign style',
      type: 'style',
      category: 'style',
      position: { start: index, end: index + 16 },
      context: {
        text: text.substring(Math.max(0, index - 20), Math.min(text.length, index + 36)),
        highlightStart: Math.min(20, index),
        highlightEnd: Math.min(20, index) + 16
      },
      suggestions: ['The players can', 'Players might', 'The characters could'],
      confidence: 0.75
    });
  }
  
  return errors;
}

/**
 * Calculate D&D campaign-specific metrics
 */
function calculateCampaignMetrics(text: string, words: string[]): {
  dndTerms: number;
  dialogueRatio: number;
  descriptiveRatio: number;
  styleBalance: 'dialogue-heavy' | 'description-heavy' | 'balanced';
} {
  // Count D&D terms
  const dndTerms = words.filter(word => isDnDTerm(word.replace(/[^\w]/g, ''))).length;

  // Estimate dialogue vs description ratio
  const dialogueMatches = text.match(/"[^"]*"/g) || [];
  const totalDialogueChars = dialogueMatches.join('').length;
  const dialogueRatio = totalDialogueChars / text.length;
  const descriptiveRatio = 1 - dialogueRatio;

  // Determine style balance
  let styleBalance: 'dialogue-heavy' | 'description-heavy' | 'balanced' = 'balanced';
  if (dialogueRatio > 0.6) {
    styleBalance = 'dialogue-heavy';
  } else if (descriptiveRatio > 0.8) {
    styleBalance = 'description-heavy';
  }

  return {
    dndTerms,
    dialogueRatio: Math.round(dialogueRatio * 100) / 100,
    descriptiveRatio: Math.round(descriptiveRatio * 100) / 100,
    styleBalance
  };
}

/**
 * Parse AI response into structured grammar errors
 */
function parseAIGrammarResponse(content: string | null, originalText: string): AIGrammarError[] {
  if (!content) return [];

  console.log('🤖 AI Grammar Service: Parsing response for text:', originalText);

  try {
    const errors: AIGrammarError[] = [];
    const issueBlocks = content.split('ISSUE_START').slice(1); // Remove empty first element

    console.log('🤖 AI Grammar Service: Found issue blocks:', issueBlocks.length);

    issueBlocks.forEach((block, index) => {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      let type: 'grammar' | 'spelling' | 'style' = 'grammar';
      let message = '';
      let originalFragment = '';
      let suggestedCorrection = '';
      let explanation = '';
      let confidence = 0.8;

      console.log(`🤖 AI Grammar Service: Processing block ${index + 1}:`, lines);

      lines.forEach(line => {
        if (line.startsWith('Type:')) {
          type = line.replace('Type:', '').trim().toLowerCase() as 'grammar' | 'spelling' | 'style';
        } else if (line.startsWith('Message:')) {
          message = line.replace('Message:', '').trim();
        } else if (line.startsWith('OriginalFragment:')) {
          originalFragment = line.replace('OriginalFragment:', '').trim();
          // Remove quotes if present
          if (originalFragment.startsWith('"') && originalFragment.endsWith('"')) {
            originalFragment = originalFragment.slice(1, -1);
          }
        } else if (line.startsWith('SuggestedCorrection:')) {
          suggestedCorrection = line.replace('SuggestedCorrection:', '').trim();
          // Remove quotes if present
          if (suggestedCorrection.startsWith('"') && suggestedCorrection.endsWith('"')) {
            suggestedCorrection = suggestedCorrection.slice(1, -1);
          }
        } else if (line.startsWith('Explanation:')) {
          explanation = line.replace('Explanation:', '').trim();
        } else if (line.startsWith('Confidence:')) {
          confidence = parseFloat(line.replace('Confidence:', '').trim()) || 0.8;
        }
      });

      console.log(`🤖 AI Grammar Service: Parsed data for block ${index + 1}:`, {
        type,
        message,
        originalFragment,
        suggestedCorrection,
        explanation,
        confidence
      });

      // Validate that the suggestion is actually different from the original
      if (originalFragment === suggestedCorrection) {
        console.warn(`🤖 AI Grammar Service: Skipping self-referential suggestion for block ${index + 1}: "${originalFragment}" → "${suggestedCorrection}"`);
        return;
      }

      // Check if the original fragment exists in the text
      const fragmentExists = originalText.includes(originalFragment);
      console.log(`🤖 AI Grammar Service: Fragment "${originalFragment}" exists in text:`, fragmentExists);

      if (message && originalFragment && suggestedCorrection && fragmentExists) {
        // Find the position of the original fragment in the text
        const start = originalText.indexOf(originalFragment);
        const end = start + originalFragment.length;
        
        // Create context around the error
        const contextStart = Math.max(0, start - 20);
        const contextEnd = Math.min(originalText.length, end + 20);
        const contextText = originalText.substring(contextStart, contextEnd);
        const highlightStart = start - contextStart;
        const highlightEnd = end - contextStart;

        const error: AIGrammarError = {
          id: `ai-error-${index + 1}`,
          message: explanation || message,
          shortMessage: message.length > 50 ? message.substring(0, 47) + '...' : message,
          type,
          category: type,
          position: { start, end },
          context: {
            text: contextText,
            highlightStart,
            highlightEnd
          },
          suggestions: [suggestedCorrection],
          confidence,
          rule: {
            id: `ai-${type}-rule`,
            description: explanation || `AI-detected ${type} issue`,
            category: type.toUpperCase()
          }
        };

        errors.push(error);
        console.log(`🤖 AI Grammar Service: Created error:`, error);
      } else {
        console.warn(`🤖 AI Grammar Service: Skipping invalid error block ${index + 1}:`, {
          hasMessage: !!message,
          hasOriginalFragment: !!originalFragment,
          hasSuggestedCorrection: !!suggestedCorrection,
          fragmentExists
        });
      }
    });

    console.log(`🤖 AI Grammar Service: Final parsed errors count: ${errors.length}`);
    return errors;
  } catch (error) {
    console.error('🤖 AI Grammar Service: Error parsing response:', error);
    return [];
  }
}

/**
 * Generate demo errors for testing
 */
function generateDemoErrors(text: string): AIGrammarError[] {
  const errors: AIGrammarError[] = [];

  console.log('🤖 AI Grammar Service: Generating demo errors for text:', text);

  // Demo grammar error - "This are" subject-verb disagreement
  if (text.toLowerCase().includes('this are')) {
    const position = text.toLowerCase().indexOf('this are');
    errors.push({
      id: 'demo-grammar-1',
      message: 'Subject-verb disagreement. "This" is singular and requires "is"',
      shortMessage: 'Subject-verb disagreement',
      type: 'grammar',
      category: 'grammar',
      position: { start: position, end: position + 8 },
      context: {
        text: text.substring(Math.max(0, position - 10), position + 20),
        highlightStart: Math.min(10, position),
        highlightEnd: Math.min(18, position + 8)
      },
      suggestions: ['This is'],
      confidence: 0.95,
      rule: {
        id: 'ai-grammar-subject-verb',
        description: 'Subject-verb agreement error',
        category: 'GRAMMAR'
      }
    });
  }

  // Demo spelling error - "grammer" instead of "grammar"
  if (text.toLowerCase().includes('grammer')) {
    const position = text.toLowerCase().indexOf('grammer');
    errors.push({
      id: 'demo-spelling-1',
      message: 'Spelling error: "grammer" should be "grammar"',
      shortMessage: 'Spelling error',
      type: 'spelling',
      category: 'spelling',
      position: { start: position, end: position + 7 },
      context: {
        text: text.substring(Math.max(0, position - 10), position + 17),
        highlightStart: Math.min(10, position),
        highlightEnd: Math.min(17, position + 7)
      },
      suggestions: ['grammar'],
      confidence: 0.98,
      rule: {
        id: 'ai-spelling-common',
        description: 'Common spelling mistake',
        category: 'SPELLING'
      }
    });
  }

  // Demo grammar error - "have" instead of "has" with singular subject
  if (text.toLowerCase().includes('sentence have')) {
    const position = text.toLowerCase().indexOf('sentence have');
    const havePosition = position + 9; // Position of "have"
    errors.push({
      id: 'demo-grammar-2',
      message: 'Subject-verb disagreement. "Sentence" is singular and requires "has"',
      shortMessage: 'Subject-verb disagreement',
      type: 'grammar',
      category: 'grammar',
      position: { start: havePosition, end: havePosition + 4 },
      context: {
        text: text.substring(Math.max(0, position - 5), position + 20),
        highlightStart: Math.min(14, havePosition - Math.max(0, position - 5)),
        highlightEnd: Math.min(18, havePosition + 4 - Math.max(0, position - 5))
      },
      suggestions: ['has'],
      confidence: 0.92,
      rule: {
        id: 'ai-grammar-subject-verb-2',
        description: 'Subject-verb agreement error',
        category: 'GRAMMAR'
      }
    });
  }

  // Demo grammar error - there/their/they're confusion
  if (text.includes('there') || text.includes('their') || text.includes('theyre')) {
    const position = text.indexOf('there');
    if (position >= 0) {
      errors.push({
        id: 'demo-grammar-3',
        message: 'Possible confusion between "there", "their", and "they\'re"',
        shortMessage: 'Check there/their/they\'re usage',
        type: 'grammar',
        category: 'grammar',
        position: { start: position, end: position + 5 },
        context: {
          text: text.substring(Math.max(0, position - 20), position + 25),
          highlightStart: Math.min(20, position),
          highlightEnd: Math.min(25, position + 5)
        },
        suggestions: ['their', 'they\'re'],
        confidence: 0.85,
        rule: {
          id: 'ai-grammar-homophones',
          description: 'Homophone confusion',
          category: 'GRAMMAR'
        }
      });
    }
  }

  // Demo style suggestion for long sentences
  if (text.length > 100) {
    errors.push({
      id: 'demo-style-1',
      message: 'Consider breaking this into shorter sentences for better readability',
      shortMessage: 'Long sentence detected',
      type: 'style',
      category: 'style',
      position: { start: 0, end: Math.min(100, text.length) },
      context: {
        text: text.substring(0, 120),
        highlightStart: 0,
        highlightEnd: Math.min(100, text.length)
      },
      suggestions: ['Break into multiple sentences', 'Use simpler structure'],
      confidence: 0.75,
      rule: {
        id: 'ai-style-sentence-length',
        description: 'Sentence length optimization',
        category: 'STYLE'
      }
    });
  }

  console.log('🤖 AI Grammar Service: Generated demo errors:', errors.length);
  errors.forEach(error => {
    console.log(`🤖 Demo Error: ${error.type} - ${error.message}`);
  });

  return errors;
}

/**
 * Calculate text statistics
 */
function calculateStatistics(
  words: string[],
  sentences: string[],
  paragraphs: string[],
  errors: AIGrammarError[],
  campaignMetrics: {
    dndTerms: number;
    dialogueRatio: number;
    descriptiveRatio: number;
    styleBalance: 'dialogue-heavy' | 'description-heavy' | 'balanced';
  }
): AIGrammarStatistics {
  const grammarCount = errors.filter(e => e.type === 'grammar').length;
  const spellingCount = errors.filter(e => e.type === 'spelling').length;
  const styleCount = errors.filter(e => e.type === 'style').length;
  
  const totalIssues = errors.length;
  const qualityScore = Math.max(60, 100 - (totalIssues * 3));

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    readingTime: Math.ceil(words.length / 200),
    qualityScore,
    issueCount: {
      grammar: grammarCount,
      spelling: spellingCount,
      style: styleCount
    },
    campaignMetrics: {
      dndTerms: campaignMetrics.dndTerms,
      dialogueRatio: campaignMetrics.dialogueRatio,
      descriptiveRatio: campaignMetrics.descriptiveRatio,
      styleBalance: campaignMetrics.styleBalance
    }
  };
} 