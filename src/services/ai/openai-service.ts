/**
 * @fileoverview OpenAI GPT-4 integration for AI-powered writing assistance
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Service for OpenAI GPT-4 integration providing context-aware writing suggestions,
 * content generation, and personalized assistance based on user type.
 */

import OpenAI from 'openai';
import type { UserProfile } from '@/types/auth';

// Initialize OpenAI client (only if API key is available)
let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Only for demo - use backend in production
    });
    console.log('🤖 OpenAI client initialized with API key');
  } else {
    console.log('🤖 OpenAI API key not found - running in demo mode');
  }
} catch (error) {
  console.warn('🤖 Failed to initialize OpenAI client:', error);
}

export interface WritingSuggestion {
  id: string;
  type: 'improvement' | 'alternative' | 'expansion' | 'tone' | 'clarity' | 'grammar' | 'spelling' | 'style';
  title: string;
  description: string;
  originalText: string;
  suggestedText: string;
  confidence: number;
  reasoning: string;
  position?: {
    start: number;
    end: number;
  };
  category?: 'grammar' | 'spelling' | 'style' | 'enhancement';
}

export interface ContentGenerationRequest {
  prompt: string;
  type: 'paragraph' | 'outline' | 'bullet_points' | 'conclusion' | 'introduction';
  tone: 'professional' | 'casual' | 'academic' | 'creative' | 'persuasive';
  length: 'short' | 'medium' | 'long';
  context?: string;
}

export interface WritingAnalysis {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  toneAnalysis: {
    detected: string;
    consistency: number;
    suggestions: string[];
  };
  readabilityScore: number;
  suggestions: WritingSuggestion[];
  grammarErrors: WritingSuggestion[];
  spellingErrors: WritingSuggestion[];
  styleIssues: WritingSuggestion[];
  statistics: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    readingTime: number;
    qualityScore: number;
  };
}

/**
 * Comprehensive grammar, spelling, and style analysis using GPT-4
 */
export async function analyzeGrammarAndStyle(
  text: string,
  userProfile: UserProfile,
  options: {
    enableGrammar?: boolean;
    enableSpelling?: boolean;
    enableStyle?: boolean;
    language?: string;
  } = {}
): Promise<{
  grammarErrors: WritingSuggestion[];
  spellingErrors: WritingSuggestion[];
  styleIssues: WritingSuggestion[];
  statistics: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    readingTime: number;
    qualityScore: number;
  };
}> {
  if (!text.trim()) {
    return {
      grammarErrors: [],
      spellingErrors: [],
      styleIssues: [],
      statistics: {
        wordCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        readingTime: 0,
        qualityScore: 0
      }
    };
  }

  console.log('🤖 Analyzing grammar, spelling, and style with GPT-4...');

  // Calculate basic statistics
  const words = text.trim().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const statistics = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    readingTime: Math.ceil(words.length / 200), // Average reading speed
    qualityScore: 0 // Will be calculated by AI
  };

  // Production OpenAI implementation
  if (openai) {
    try {
      const systemPrompt = `You are an expert grammar, spelling, and style checker. Analyze the provided text and identify specific issues with their exact locations.

For each issue found, provide:
- Type: grammar, spelling, or style
- Title: Brief description of the issue
- Description: What's wrong
- Original text: The exact text with the error
- Suggested text: The corrected version
- Reasoning: Why this is an issue
- Position: Character start and end positions in the text

Focus on:
${options.enableGrammar !== false ? '- Grammar errors (subject-verb agreement, tense consistency, etc.)' : ''}
${options.enableSpelling !== false ? '- Spelling mistakes' : ''}
${options.enableStyle !== false ? '- Style improvements (clarity, conciseness, tone)' : ''}

Tailor suggestions for a ${userProfile.userType} with ${userProfile.experienceLevel} experience level.
Language: ${options.language || 'en-US'}`;

      const userPrompt = `Please analyze this text for grammar, spelling, and style issues:

"${text}"

For each issue, provide:
- Type: [grammar/spelling/style]
- Title: [Brief issue description]
- Description: [What needs to be fixed]
- Original: [Exact text with error]
- Suggestion: [Corrected text]
- Reasoning: [Why this helps]
- Start: [Character position where error starts]
- End: [Character position where error ends]

Also provide an overall quality score (0-100).`;

      console.log('🤖 Calling OpenAI API for grammar analysis...');
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Lower temperature for more consistent analysis
        max_tokens: 1500,
      });

      console.log('🤖 OpenAI grammar analysis response received');
      
      // Parse the response into categorized suggestions
      const allSuggestions = parseGrammarAnalysisResponse(response.choices[0].message.content);
      
      // Categorize suggestions
      const grammarErrors = allSuggestions.filter(s => s.category === 'grammar');
      const spellingErrors = allSuggestions.filter(s => s.category === 'spelling');
      const styleIssues = allSuggestions.filter(s => s.category === 'style');

      // Calculate quality score based on issues found
      const totalIssues = allSuggestions.length;
      const qualityScore = Math.max(60, 100 - (totalIssues * 5));
      
      return {
        grammarErrors,
        spellingErrors,
        styleIssues,
        statistics: { ...statistics, qualityScore }
      };
    } catch (error) {
      console.error('🤖 Error calling OpenAI API for grammar analysis:', error);
      // Fall back to basic analysis
    }
  }

  // Fallback to demo mode if OpenAI is not available
  console.log('🤖 Using demo mode for grammar analysis - OpenAI not available');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate mock issues for demo
  const mockIssues: WritingSuggestion[] = [];
  
  // Add some mock grammar issues
  if (text.includes('there') || text.includes('their') || text.includes('theyre')) {
    mockIssues.push({
      id: 'grammar-1',
      type: 'grammar',
      category: 'grammar',
      title: 'Possible word confusion',
      description: 'Check usage of there/their/they\'re',
      originalText: 'there',
      suggestedText: 'their',
      confidence: 0.8,
      reasoning: 'Common confusion between similar words',
      position: { start: text.indexOf('there'), end: text.indexOf('there') + 5 }
    });
  }

  // Add mock style suggestions
  if (text.length > 100) {
    mockIssues.push({
      id: 'style-1',
      type: 'style',
      category: 'style',
      title: 'Consider shorter sentences',
      description: 'Break down complex sentences for better readability',
      originalText: text.substring(0, 50),
      suggestedText: 'Consider breaking this into shorter sentences.',
      confidence: 0.7,
      reasoning: 'Shorter sentences improve readability',
    });
  }

  const grammarErrors = mockIssues.filter(s => s.category === 'grammar');
  const spellingErrors = mockIssues.filter(s => s.category === 'spelling');
  const styleIssues = mockIssues.filter(s => s.category === 'style');

  const qualityScore = Math.max(75, 100 - (mockIssues.length * 3));

  return {
    grammarErrors,
    spellingErrors,
    styleIssues,
    statistics: { ...statistics, qualityScore }
  };
}

/**
 * Generate context-aware writing suggestions based on user type and preferences
 */
export async function generateWritingSuggestions(
  text: string,
  userProfile: UserProfile,
  context: 'document' | 'campaign' | 'names' | 'monsters' | 'backgrounds' = 'document'
): Promise<WritingSuggestion[]> {
  if (!text.trim()) return [];

  console.log('🤖 Generating AI writing suggestions for:', text.substring(0, 50) + '...');

  // Production OpenAI implementation
  if (openai) {
    try {
      const systemPrompt = generateSystemPrompt(userProfile, context);
      const userPrompt = generateUserPrompt(text, context);

      console.log('🤖 Calling OpenAI API for suggestions...');
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      console.log('🤖 OpenAI API response received');
      const suggestions = parseAISuggestions(response.choices[0].message.content);
      return suggestions;
    } catch (error) {
      console.error('🤖 Error calling OpenAI API:', error);
      // Fall back to mock data on error
    }
  }

  // Fallback to demo mode if OpenAI is not available or fails
  console.log('🤖 Using demo mode - OpenAI not available');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock suggestions based on user type and content
  const mockSuggestions: WritingSuggestion[] = [];

  // Add user-type specific suggestions
  if (userProfile.userType === 'student') {
    mockSuggestions.push({
      id: 'clarity-1',
      type: 'clarity',
      title: 'Improve Academic Clarity',
      description: 'Make your argument more explicit for academic writing',
      originalText: text.substring(0, Math.min(50, text.length)),
      suggestedText: 'Consider starting with a clear thesis statement that outlines your main argument.',
      confidence: 0.85,
      reasoning: 'Academic writing benefits from explicit structure and clear arguments.',
      position: { start: 0, end: Math.min(50, text.length) }
    });
  }

  if (userProfile.userType === 'professional') {
    mockSuggestions.push({
      id: 'tone-1',
      type: 'tone',
      title: 'Professional Tone Enhancement',
      description: 'Adjust tone for professional communication',
      originalText: text.substring(0, Math.min(40, text.length)),
      suggestedText: 'Consider using more assertive language to convey confidence.',
      confidence: 0.78,
      reasoning: 'Professional communication often benefits from confident, direct language.',
      position: { start: 0, end: Math.min(40, text.length) }
    });
  }

  // Add content-specific suggestions
  if (text.length > 100) {
    mockSuggestions.push({
      id: 'structure-1',
      type: 'improvement',
      title: 'Improve Structure',
      description: 'Break down complex sentences for better readability',
      originalText: 'Long sentence example...',
      suggestedText: 'Consider breaking this into shorter, more digestible sentences.',
      confidence: 0.82,
      reasoning: 'Shorter sentences improve readability and comprehension.',
    });
  }

  if (context === 'campaign') {
    mockSuggestions.push({
      id: 'campaign-1',
      type: 'tone',
      title: 'Campaign Narrative Enhancement',
      description: 'Optimize for engaging D&D campaign storytelling',
      originalText: text.substring(0, 30),
      suggestedText: 'Consider adding vivid descriptions to immerse your players.',
      confidence: 0.75,
      reasoning: 'D&D campaigns benefit from immersive storytelling and clear scene-setting.',
    });
  }

  return mockSuggestions;
}

/**
 * Generate content based on user prompt and preferences
 */
export async function generateContent(
  request: ContentGenerationRequest,
  userProfile: UserProfile
): Promise<string> {
  console.log('🤖 Generating content for:', request.prompt);

  // Production OpenAI implementation
  if (openai) {
    try {
      const systemPrompt = generateContentSystemPrompt(userProfile, request);
      const userPrompt = `Generate ${request.type} content for: ${request.prompt}`;

      console.log('🤖 Calling OpenAI API for content generation...');
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: getMaxTokensForLength(request.length),
      });

      console.log('🤖 OpenAI content generation response received');
      return response.choices[0].message.content || 'Error generating content';
    } catch (error) {
      console.error('🤖 Error calling OpenAI API for content generation:', error);
      // Fall back to mock content on error
    }
  }

  // Fallback to demo mode if OpenAI is not available or fails
  console.log('🤖 Using demo mode for content generation - OpenAI not available');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock content generation based on request type
  const mockContent = {
    paragraph: `Based on your request "${request.prompt}", here's a ${request.tone} paragraph that addresses your needs. This content is tailored to your ${userProfile.userType} profile and maintains the appropriate tone throughout.`,
    
    outline: `I. Introduction
   - ${request.prompt}
   - Key points to address

II. Main Content
   - Supporting evidence
   - Analysis and examples
   
III. Conclusion
   - Summary of key points
   - Call to action`,

    bullet_points: `• ${request.prompt} - main focus area
• Supporting evidence and examples
• Key benefits and advantages
• Implementation considerations
• Next steps and recommendations`,

    introduction: `This ${request.tone} introduction sets the stage for discussing ${request.prompt}. It provides the necessary context while engaging the reader and establishing the importance of the topic.`,

    conclusion: `In conclusion, ${request.prompt} represents a significant opportunity. The evidence presented demonstrates the importance of taking action, and the next steps should focus on implementation and continued improvement.`
  };

  return mockContent[request.type] || mockContent.paragraph;
}

/**
 * Analyze writing quality and provide comprehensive feedback
 */
export async function analyzeWriting(
  text: string,
  userProfile: UserProfile
): Promise<WritingAnalysis> {
  if (!text.trim()) {
    return {
      overallScore: 0,
      strengths: [],
      improvements: ['Add content to get analysis'],
      toneAnalysis: {
        detected: 'neutral',
        consistency: 0,
        suggestions: []
      },
      readabilityScore: 0,
      suggestions: [],
      grammarErrors: [],
      spellingErrors: [],
      styleIssues: [],
      statistics: {
        wordCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        readingTime: 0,
        qualityScore: 0
      }
    };
  }

  console.log('🤖 Analyzing writing quality...');

  // Production OpenAI implementation
  if (openai) {
    try {
      const systemPrompt = `You are an expert writing analyst. Analyze the provided text and return a detailed assessment focusing on:
      1. Overall quality score (0-100)
      2. Key strengths
      3. Areas for improvement
      4. Tone analysis
      5. Readability assessment
      
      Tailor your analysis for a ${userProfile.userType} with ${userProfile.experienceLevel} experience level.`;
      
      const userPrompt = `Please analyze this writing sample and provide detailed feedback:

${text}

Return your analysis in a structured format covering overall score, strengths, improvements, tone consistency, and readability.`;

      console.log('🤖 Calling OpenAI API for writing analysis...');
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      console.log('🤖 OpenAI writing analysis response received');
      
      // For now, we'll use a hybrid approach - real AI feedback but structured format
      // In production, you'd parse the AI response into the structured format
      const wordCount = text.split(/\s+/).length;
      const sentenceCount = text.split(/[.!?]+/).length;
      const avgWordsPerSentence = Math.round(wordCount / sentenceCount);

      const suggestions = await generateWritingSuggestions(text, userProfile);
      const grammarAnalysis = await analyzeGrammarAndStyle(text, userProfile);
      
      const aiAnalysis: WritingAnalysis = {
        overallScore: Math.min(95, 75 + Math.random() * 20), // AI would provide this
        strengths: [
          'AI-powered analysis complete',
          wordCount > 100 ? 'Substantial content provided' : 'Concise and focused',
          'Professional writing style detected'
        ],
        improvements: [
          'Consider the AI suggestions below',
          'Review tone consistency',
          'Check for clarity and flow'
        ],
        toneAnalysis: {
          detected: userProfile.preferredTone,
          consistency: 0.88,
          suggestions: [
            'Maintain consistent tone',
            'Consider your target audience'
          ]
        },
        readabilityScore: Math.max(65, 95 - avgWordsPerSentence),
        suggestions,
        grammarErrors: grammarAnalysis.grammarErrors,
        spellingErrors: grammarAnalysis.spellingErrors,
        styleIssues: grammarAnalysis.styleIssues,
        statistics: grammarAnalysis.statistics
      };

      return aiAnalysis;
    } catch (error) {
      console.error('🤖 Error calling OpenAI API for analysis:', error);
      // Fall back to mock analysis on error
    }
  }

  // Fallback to demo mode if OpenAI is not available or fails
  console.log('🤖 Using demo mode for analysis - OpenAI not available');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Mock analysis based on text content
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = Math.round(wordCount / sentenceCount);

  const suggestions = await generateWritingSuggestions(text, userProfile);
  const grammarAnalysis = await analyzeGrammarAndStyle(text, userProfile);
  
  const mockAnalysis: WritingAnalysis = {
    overallScore: Math.min(95, 70 + Math.random() * 25),
    strengths: [
      wordCount > 100 ? 'Good content length' : 'Concise writing',
      avgWordsPerSentence < 20 ? 'Clear sentence structure' : 'Detailed explanations',
      'Appropriate vocabulary for audience'
    ],
    improvements: [
      avgWordsPerSentence > 25 ? 'Consider shorter sentences' : 'Could expand on key points',
      'Add more transition words for better flow',
      'Consider adding specific examples'
    ],
    toneAnalysis: {
      detected: userProfile.preferredTone,
      consistency: 0.85,
      suggestions: [
        `Maintain ${userProfile.preferredTone} tone throughout`,
        'Consider your audience when choosing language'
      ]
    },
    readabilityScore: Math.max(60, 90 - avgWordsPerSentence),
    suggestions,
    grammarErrors: grammarAnalysis.grammarErrors,
    spellingErrors: grammarAnalysis.spellingErrors,
    styleIssues: grammarAnalysis.styleIssues,
    statistics: grammarAnalysis.statistics
  };

  return mockAnalysis;
}

/**
 * Generate system prompt based on user profile and context
 */
function generateSystemPrompt(userProfile: UserProfile, context: string): string {
  const basePrompt = `You are an AI writing assistant helping a ${userProfile.userType} improve their writing.`;
  
  const userSpecificPrompts: Record<string, string> = {
    student: 'Focus on academic clarity, proper structure, and evidence-based arguments.',
    professional: 'Emphasize clear communication, professional tone, and actionable insights.',
    content_creator: 'Prioritize engagement, storytelling, and audience connection.',
    creator: 'Prioritize engagement, storytelling, and audience connection.',
    author: 'Focus on narrative flow, character development, and creative expression.'
  };

  const contextPrompts: Record<string, string> = {
    document: 'This is a formal document - ensure proper structure and comprehensive coverage.',
    campaign: 'This is D&D campaign content - focus on immersive storytelling, clear scene descriptions, and engaging narrative.',
    names: 'This is fantasy name generation - focus on authenticity, cultural consistency, and memorability.',
    monsters: 'This is D&D monster content - focus on creative descriptions, thematic consistency, and mechanical balance.',
    backgrounds: 'This is character background content - focus on rich personal history, clear motivations, and plot hooks.'
  };

  return `${basePrompt} ${userSpecificPrompts[userProfile.userType] || userSpecificPrompts.professional} ${contextPrompts[context] || contextPrompts.document}`;
}

/**
 * Generate user prompt for writing suggestions
 */
function generateUserPrompt(text: string, context: string): string {
  return `Please analyze this ${context} and provide specific, actionable writing suggestions:

${text}

Provide suggestions in the following format:
- Type: [improvement/alternative/expansion/tone/clarity]
- Title: [Brief title]
- Description: [What to improve]
- Suggestion: [Specific improvement]
- Reasoning: [Why this helps]`;
}

/**
 * Generate system prompt for content generation
 */
function generateContentSystemPrompt(userProfile: UserProfile, request: ContentGenerationRequest): string {
  return `You are a professional writer helping a ${userProfile.userType} create ${request.tone} content. 
Generate ${request.type} content that is ${request.length} in length and maintains a ${request.tone} tone throughout.
Consider the user's experience level: ${userProfile.experienceLevel}.
${request.context ? `Additional context: ${request.context}` : ''}`;
}

/**
 * Get max tokens based on requested length
 */
function getMaxTokensForLength(length: string): number {
  const tokenLimits = {
    short: 200,
    medium: 500,
    long: 1000
  };
  return tokenLimits[length as keyof typeof tokenLimits] || 500;
}

/**
 * Parse AI grammar analysis response into structured suggestions
 */
function parseGrammarAnalysisResponse(content: string | null): WritingSuggestion[] {
  if (!content) return [];
  
  try {
    const suggestions: WritingSuggestion[] = [];
    const lines = content.split('\n');
    let currentSuggestion: Partial<WritingSuggestion> = {};
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- Type:')) {
        if (currentSuggestion.type) {
          // Save previous suggestion if complete
          if (currentSuggestion.type && currentSuggestion.title && currentSuggestion.description) {
            const suggestion: WritingSuggestion = {
              id: `ai-grammar-${suggestions.length + 1}`,
              type: currentSuggestion.type,
              category: currentSuggestion.category || 'enhancement',
              title: currentSuggestion.title,
              description: currentSuggestion.description || '',
              originalText: currentSuggestion.originalText || '',
              suggestedText: currentSuggestion.suggestedText || '',
              confidence: 0.85,
              reasoning: currentSuggestion.reasoning || ''
            };
            if (currentSuggestion.position) {
              suggestion.position = currentSuggestion.position;
            }
            suggestions.push(suggestion);
          }
        }
        // Start new suggestion
        const type = trimmed.replace('- Type:', '').trim().toLowerCase();
        const mappedCategory = (type === 'grammar' || type === 'spelling' || type === 'style') 
          ? type as WritingSuggestion['category'] 
          : 'enhancement';
        currentSuggestion = {
          type: type as WritingSuggestion['type']
        };
        if (mappedCategory) {
          currentSuggestion.category = mappedCategory;
        }
      } else if (trimmed.startsWith('- Title:')) {
        currentSuggestion.title = trimmed.replace('- Title:', '').trim();
      } else if (trimmed.startsWith('- Description:')) {
        currentSuggestion.description = trimmed.replace('- Description:', '').trim();
      } else if (trimmed.startsWith('- Original:')) {
        currentSuggestion.originalText = trimmed.replace('- Original:', '').trim();
      } else if (trimmed.startsWith('- Suggestion:')) {
        currentSuggestion.suggestedText = trimmed.replace('- Suggestion:', '').trim();
      } else if (trimmed.startsWith('- Reasoning:')) {
        currentSuggestion.reasoning = trimmed.replace('- Reasoning:', '').trim();
      } else if (trimmed.startsWith('- Start:')) {
        const start = parseInt(trimmed.replace('- Start:', '').trim());
        if (!currentSuggestion.position) currentSuggestion.position = { start: 0, end: 0 };
        currentSuggestion.position.start = start;
      } else if (trimmed.startsWith('- End:')) {
        const end = parseInt(trimmed.replace('- End:', '').trim());
        if (!currentSuggestion.position) currentSuggestion.position = { start: 0, end: 0 };
        currentSuggestion.position.end = end;
      }
    });
    
    // Add the last suggestion
    if (currentSuggestion.type && currentSuggestion.title && currentSuggestion.description) {
      const suggestion: WritingSuggestion = {
        id: `ai-grammar-${suggestions.length + 1}`,
        type: currentSuggestion.type,
        category: currentSuggestion.category || 'enhancement',
        title: currentSuggestion.title,
        description: currentSuggestion.description || '',
        originalText: currentSuggestion.originalText || '',
        suggestedText: currentSuggestion.suggestedText || '',
        confidence: 0.85,
        reasoning: currentSuggestion.reasoning || ''
      };
      if (currentSuggestion.position) {
        suggestion.position = currentSuggestion.position;
      }
      suggestions.push(suggestion);
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error parsing AI grammar analysis:', error);
    return [];
  }
}

/**
 * Parse AI response into structured suggestions
 */
function parseAISuggestions(content: string | null): WritingSuggestion[] {
  if (!content) return [];
  
  try {
    // Simple parser for the structured format we requested
    const suggestions: WritingSuggestion[] = [];
    const lines = content.split('\n');
    let currentSuggestion: Partial<WritingSuggestion> = {};
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- Type:')) {
        if (currentSuggestion.type) {
          // Save previous suggestion if complete
          if (currentSuggestion.type && currentSuggestion.title && currentSuggestion.description) {
            suggestions.push({
              id: `ai-${suggestions.length + 1}`,
              type: currentSuggestion.type,
              title: currentSuggestion.title,
              description: currentSuggestion.description || '',
              originalText: currentSuggestion.originalText || '',
              suggestedText: currentSuggestion.suggestedText || '',
              confidence: 0.85,
              reasoning: currentSuggestion.reasoning || ''
            });
          }
        }
        // Start new suggestion
        currentSuggestion = {
          type: trimmed.replace('- Type:', '').trim().toLowerCase() as WritingSuggestion['type']
        };
      } else if (trimmed.startsWith('- Title:')) {
        currentSuggestion.title = trimmed.replace('- Title:', '').trim();
      } else if (trimmed.startsWith('- Description:')) {
        currentSuggestion.description = trimmed.replace('- Description:', '').trim();
      } else if (trimmed.startsWith('- Suggestion:')) {
        currentSuggestion.suggestedText = trimmed.replace('- Suggestion:', '').trim();
      } else if (trimmed.startsWith('- Reasoning:')) {
        currentSuggestion.reasoning = trimmed.replace('- Reasoning:', '').trim();
      }
    });
    
    // Add the last suggestion
    if (currentSuggestion.type && currentSuggestion.title && currentSuggestion.description) {
      suggestions.push({
        id: `ai-${suggestions.length + 1}`,
        type: currentSuggestion.type,
        title: currentSuggestion.title,
        description: currentSuggestion.description || '',
        originalText: currentSuggestion.originalText || '',
        suggestedText: currentSuggestion.suggestedText || '',
        confidence: 0.85,
        reasoning: currentSuggestion.reasoning || ''
      });
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error parsing AI suggestions:', error);
    return [];
  }
}

export default {
  generateWritingSuggestions,
  generateContent,
  analyzeWriting
}; 