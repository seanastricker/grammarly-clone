/**
 * @fileoverview LanguageTool API integration for grammar and spell checking
 * @author WordWise AI Team
 * @version 1.0.0
 */

// LanguageTool API types
export interface LanguageToolError {
  offset: number;
  length: number;
  message: string;
  shortMessage: string;
  replacements: Array<{ value: string }>;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  rule: {
    id: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
  };
  type?: {
    typeName: string;
  };
}

export interface LanguageToolResponse {
  software: {
    name: string;
    version: string;
  };
  warnings: {
    incompleteResults: boolean;
  };
  language: {
    name: string;
    code: string;
  };
  matches: LanguageToolError[];
}

export interface GrammarAnalysisResult {
  errors: AnalyzedError[];
  statistics: {
    totalErrors: number;
    grammarErrors: number;
    spellingErrors: number;
    styleIssues: number;
    qualityScore: number;
  };
  language: string;
}

export interface AnalyzedError {
  id: string;
  type: 'grammar' | 'spelling' | 'style';
  severity: 'error' | 'warning' | 'suggestion';
  position: {
    start: number;
    end: number;
  };
  message: string;
  shortMessage: string;
  suggestions: string[];
  rule: {
    id: string;
    description: string;
    category: string;
  };
  context: {
    text: string;
    highlightStart: number;
    highlightEnd: number;
  };
}

// LanguageTool API configuration
const LANGUAGETOOL_API_URL = 'https://api.languagetools.org/v2/check';

/**
 * Check text for grammar and spelling errors using LanguageTool API
 */
export async function checkGrammarAndSpelling(
  text: string,
  language: string = 'en-US'
): Promise<GrammarAnalysisResult> {
  // 🧪 DEMO MODE: Return mock data for testing UI
  // Remove this block and uncomment the real API code below for production
  
  console.log('🧪 Using mock grammar analysis for:', text.substring(0, 50) + '...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock errors based on text content
  const mockErrors: AnalyzedError[] = [];
  
  // Look for common patterns to simulate errors
  if (text.toLowerCase().includes('this are')) {
    const pos = text.toLowerCase().indexOf('this are');
    mockErrors.push({
      id: 'mock-grammar-1',
      type: 'grammar',
      severity: 'error',
      position: { start: pos, end: pos + 8 },
      message: 'Subject-verb disagreement. "This" is singular, so use "is" instead of "are".',
      shortMessage: 'Subject-verb disagreement',
      suggestions: ['this is', 'these are'],
      rule: {
        id: 'SUBJECT_VERB_DISAGREEMENT',
        description: 'Subject and verb must agree in number',
        category: 'Grammar'
      },
      context: {
        text: text.substring(Math.max(0, pos - 10), pos + 20),
        highlightStart: Math.min(10, pos),
        highlightEnd: Math.min(10, pos) + 8
      }
    });
  }
  
  if (text.toLowerCase().includes('teh ')) {
    const pos = text.toLowerCase().indexOf('teh ');
    mockErrors.push({
      id: 'mock-spelling-1',
      type: 'spelling',
      severity: 'error',
      position: { start: pos, end: pos + 3 },
      message: 'Possible spelling mistake found.',
      shortMessage: 'Spelling error',
      suggestions: ['the', 'tea', 'ten'],
      rule: {
        id: 'SPELLING_MISTAKE',
        description: 'Spelling mistake',
        category: 'Spelling'
      },
      context: {
        text: text.substring(Math.max(0, pos - 10), pos + 15),
        highlightStart: Math.min(10, pos),
        highlightEnd: Math.min(10, pos) + 3
      }
    });
  }
  
  if (text.includes('very very') || text.includes('really quite extremely')) {
    const pos = text.search(/very very|really quite extremely/);
    mockErrors.push({
      id: 'mock-style-1',
      type: 'style',
      severity: 'suggestion',
      position: { start: pos, end: pos + 10 },
      message: 'Consider avoiding redundant intensifiers for clearer writing.',
      shortMessage: 'Redundant words',
      suggestions: ['very', 'extremely', 'quite'],
      rule: {
        id: 'REDUNDANT_INTENSIFIERS',
        description: 'Avoid redundant intensifiers',
        category: 'Style'
      },
      context: {
        text: text.substring(Math.max(0, pos - 10), pos + 20),
        highlightStart: 10,
        highlightEnd: 20
      }
    });
  }
  
  // Random error for any text longer than 20 characters
  if (text.length > 20 && Math.random() > 0.7) {
    const randomPos = Math.floor(Math.random() * (text.length - 10));
    const word = text.substring(randomPos, randomPos + 5);
    mockErrors.push({
      id: 'mock-random-1',
      type: 'style',
      severity: 'suggestion',
      position: { start: randomPos, end: randomPos + 5 },
      message: `Consider rephrasing for better clarity.`,
      shortMessage: 'Style suggestion',
      suggestions: ['improved phrase', 'better wording'],
      rule: {
        id: 'STYLE_IMPROVEMENT',
        description: 'Style improvement suggestion',
        category: 'Style'
      },
      context: {
        text: text.substring(Math.max(0, randomPos - 10), randomPos + 15),
        highlightStart: 10,
        highlightEnd: 15
      }
    });
  }
  
  const statistics = calculateStatistics(mockErrors);
  
  return {
    errors: mockErrors,
    statistics,
    language: 'en-US'
  };

  /* 🚀 PRODUCTION CODE: Uncomment this for real LanguageTool API
  try {
    // Prepare request data
    const formData = new FormData();
    formData.append('text', text);
    formData.append('language', language);
    formData.append('enabledOnly', 'false');
    
    // Make API request
    const response = await fetch(LANGUAGETOOL_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`LanguageTool API error: ${response.status} ${response.statusText}`);
    }

    const data: LanguageToolResponse = await response.json();
    
    // Process and categorize errors
    const errors = data.matches.map((match, index) => processLanguageToolError(match, index));
    
    // Calculate statistics
    const statistics = calculateStatistics(errors);
    
    return {
      errors,
      statistics,
      language: data.language.code,
    };
  } catch (error) {
    console.error('Error in LanguageTool analysis:', error);
    throw new Error('Failed to analyze text with LanguageTool');
  }
  */
}

/**
 * Process LanguageTool error into our format
 */
function processLanguageToolError(match: LanguageToolError, index: number): AnalyzedError {
  const errorType = categorizeError(match);
  const severity = determineSeverity(match);
  
  return {
    id: `error_${index}_${match.rule.id}`,
    type: errorType,
    severity,
    position: {
      start: match.offset,
      end: match.offset + match.length,
    },
    message: match.message,
    shortMessage: match.shortMessage,
    suggestions: match.replacements.map(r => r.value).slice(0, 5), // Limit to 5 suggestions
    rule: {
      id: match.rule.id,
      description: match.rule.description,
      category: match.rule.category.name,
    },
    context: {
      text: match.context.text,
      highlightStart: match.context.offset,
      highlightEnd: match.context.offset + match.context.length,
    },
  };
}

/**
 * Categorize error type based on LanguageTool response
 */
function categorizeError(match: LanguageToolError): 'grammar' | 'spelling' | 'style' {
  const issueType = match.rule.issueType.toLowerCase();
  const categoryId = match.rule.category.id.toLowerCase();
  
  if (issueType.includes('misspelling') || categoryId.includes('typo')) {
    return 'spelling';
  }
  
  if (issueType.includes('grammar') || categoryId.includes('grammar')) {
    return 'grammar';
  }
  
  return 'style';
}

/**
 * Determine error severity
 */
function determineSeverity(match: LanguageToolError): 'error' | 'warning' | 'suggestion' {
  const issueType = match.rule.issueType.toLowerCase();
  
  if (issueType.includes('misspelling') || issueType.includes('grammar')) {
    return 'error';
  }
  
  if (issueType.includes('style') || issueType.includes('hint')) {
    return 'suggestion';
  }
  
  return 'warning';
}

/**
 * Calculate text analysis statistics
 */
function calculateStatistics(errors: AnalyzedError[]) {
  const grammarErrors = errors.filter(e => e.type === 'grammar').length;
  const spellingErrors = errors.filter(e => e.type === 'spelling').length;
  const styleIssues = errors.filter(e => e.type === 'style').length;
  const totalErrors = errors.length;
  
  // Simple quality score calculation (0-100, where 100 is perfect)
  const baseScore = 100;
  const grammarPenalty = grammarErrors * 5;
  const spellingPenalty = spellingErrors * 3;
  const stylePenalty = styleIssues * 1;
  
  const qualityScore = Math.max(0, baseScore - grammarPenalty - spellingPenalty - stylePenalty);
  
  return {
    totalErrors,
    grammarErrors,
    spellingErrors,
    styleIssues,
    qualityScore,
  };
}

/**
 * Extract plain text from HTML content (for TipTap)
 */
export function extractTextFromHTML(htmlContent: string): string {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  return tempDiv.textContent || tempDiv.innerText || '';
} 