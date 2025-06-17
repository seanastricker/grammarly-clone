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
  // 🧪 ENHANCED DEMO MODE: More comprehensive pattern matching
  // Remove this block and uncomment the real API code below for production
  
  console.log('🧪 Using enhanced mock grammar analysis for:', text.substring(0, 50) + '...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock errors based on text content
  const mockErrors: AnalyzedError[] = [];
  
  // Comprehensive grammar patterns
  const grammarPatterns = [
    // Subject-verb disagreement
    { pattern: /\b(this|that)\s+are\b/gi, replacement: ['this is', 'that is'], type: 'grammar', message: 'Subject-verb disagreement. Use "is" with singular subjects.' },
    { pattern: /\b(these|those)\s+is\b/gi, replacement: ['these are', 'those are'], type: 'grammar', message: 'Subject-verb disagreement. Use "are" with plural subjects.' },
    { pattern: /\bI\s+are\b/gi, replacement: ['I am'], type: 'grammar', message: 'Subject-verb disagreement. Use "am" with "I".' },
    { pattern: /\bhe\s+are\b/gi, replacement: ['he is'], type: 'grammar', message: 'Subject-verb disagreement. Use "is" with "he".' },
    { pattern: /\bshe\s+are\b/gi, replacement: ['she is'], type: 'grammar', message: 'Subject-verb disagreement. Use "is" with "she".' },
    
    // Verb forms
    { pattern: /\bI\s+has\b/gi, replacement: ['I have'], type: 'grammar', message: 'Incorrect verb form. Use "have" with "I".' },
    { pattern: /\bwe\s+has\b/gi, replacement: ['we have'], type: 'grammar', message: 'Incorrect verb form. Use "have" with "we".' },
    { pattern: /\bthey\s+has\b/gi, replacement: ['they have'], type: 'grammar', message: 'Incorrect verb form. Use "have" with "they".' },
    
    // Articles
    { pattern: /\ban\s+[bcdfghjklmnpqrstvwxyz]/gi, replacement: ['a'], type: 'grammar', message: 'Use "a" before consonant sounds.' },
    { pattern: /\ba\s+[aeiou]/gi, replacement: ['an'], type: 'grammar', message: 'Use "an" before vowel sounds.' },
    
    // Prepositions
    { pattern: /\bdifferent\s+than\b/gi, replacement: ['different from'], type: 'grammar', message: 'Use "different from" instead of "different than".' },
    { pattern: /\bcould\s+of\b/gi, replacement: ['could have'], type: 'grammar', message: 'Use "could have" instead of "could of".' },
    { pattern: /\bwould\s+of\b/gi, replacement: ['would have'], type: 'grammar', message: 'Use "would have" instead of "would of".' },
    { pattern: /\bshould\s+of\b/gi, replacement: ['should have'], type: 'grammar', message: 'Use "should have" instead of "should of".' },
  ];

  // Common spelling mistakes
  const spellingPatterns = [
    { pattern: /\bteh\b/gi, replacement: ['the'], type: 'spelling', message: 'Possible spelling mistake.' },
    { pattern: /\brecieve\b/gi, replacement: ['receive'], type: 'spelling', message: 'Spelling error. Remember "i before e except after c".' },
    { pattern: /\boccured\b/gi, replacement: ['occurred'], type: 'spelling', message: 'Spelling error. "Occurred" has double "r".' },
    { pattern: /\bseperate\b/gi, replacement: ['separate'], type: 'spelling', message: 'Spelling error. "Separate" has "a" in the middle.' },
    { pattern: /\bdefinately\b/gi, replacement: ['definitely'], type: 'spelling', message: 'Spelling error. "Definitely" has "i" not "a".' },
    { pattern: /\bneccessary\b/gi, replacement: ['necessary'], type: 'spelling', message: 'Spelling error. "Necessary" has one "c" and two "s".' },
    { pattern: /\baccommodate\b/gi, replacement: ['accommodate'], type: 'spelling', message: 'Spelling error. "Accommodate" has double "c" and double "m".' },
    { pattern: /\bconscious\b/gi, replacement: ['conscious'], type: 'spelling', message: 'Spelling error. "Conscious" has "sc" in the middle.' },
    { pattern: /\bembarrass\b/gi, replacement: ['embarrass'], type: 'spelling', message: 'Spelling error. "Embarrass" has double "r" and double "s".' },
    { pattern: /\bfull-proof\b/gi, replacement: ['foolproof'], type: 'spelling', message: 'Spelling error. The correct term is "foolproof".' },
    { pattern: /\balot\b/gi, replacement: ['a lot'], type: 'spelling', message: 'Spelling error. "A lot" is two words.' },
    { pattern: /\bthier\b/gi, replacement: ['their'], type: 'spelling', message: 'Spelling error. "Their" has "ei" not "ie".' },
    { pattern: /\bwierd\b/gi, replacement: ['weird'], type: 'spelling', message: 'Spelling error. "Weird" has "ei" not "ie".' },
  ];

  // Style suggestions
  const stylePatterns = [
    { pattern: /\bvery\s+very\b/gi, replacement: ['extremely', 'quite'], type: 'style', message: 'Avoid redundant intensifiers for clearer writing.' },
    { pattern: /\breally\s+quite\s+extremely\b/gi, replacement: ['extremely', 'very'], type: 'style', message: 'Avoid redundant intensifiers for clearer writing.' },
    { pattern: /\bactually\b/gi, replacement: [''], type: 'style', message: 'Consider removing "actually" for more direct writing.' },
    { pattern: /\bbasically\b/gi, replacement: [''], type: 'style', message: 'Consider removing "basically" for more direct writing.' },
    { pattern: /\bthat\s+that\b/gi, replacement: ['that'], type: 'style', message: 'Avoid repeating "that" for better flow.' },
    { pattern: /\bin\s+order\s+to\b/gi, replacement: ['to'], type: 'style', message: 'Consider using "to" instead of "in order to" for conciseness.' },
    { pattern: /\bdue\s+to\s+the\s+fact\s+that\b/gi, replacement: ['because'], type: 'style', message: 'Consider using "because" instead of "due to the fact that".' },
  ];

  // Process all patterns
  const allPatterns = [...grammarPatterns, ...spellingPatterns, ...stylePatterns];
  
  allPatterns.forEach((patternObj, index) => {
    const matches = Array.from(text.matchAll(patternObj.pattern));
    
    matches.forEach((match, matchIndex) => {
      if (match.index !== undefined) {
        const startPos = match.index;
        const endPos = startPos + match[0].length;
        
        // Create context around the error
        const contextStart = Math.max(0, startPos - 20);
        const contextEnd = Math.min(text.length, endPos + 20);
        const contextText = text.substring(contextStart, contextEnd);
        const highlightStart = startPos - contextStart;
        const highlightEnd = endPos - contextStart;
        
        mockErrors.push({
          id: `${patternObj.type}-${index}-${matchIndex}`,
          type: patternObj.type as 'grammar' | 'spelling' | 'style',
          severity: patternObj.type === 'spelling' || patternObj.type === 'grammar' ? 'error' : 'suggestion',
          position: { start: startPos, end: endPos },
          message: patternObj.message,
          shortMessage: patternObj.type === 'grammar' ? 'Grammar error' : 
                       patternObj.type === 'spelling' ? 'Spelling error' : 'Style suggestion',
          suggestions: patternObj.replacement,
          rule: {
            id: `${patternObj.type.toUpperCase()}_${index}`,
            description: patternObj.message,
            category: patternObj.type === 'grammar' ? 'Grammar' : 
                     patternObj.type === 'spelling' ? 'Spelling' : 'Style'
          },
          context: {
            text: contextText,
            highlightStart,
            highlightEnd
          }
        });
      }
    });
  });

  // Remove duplicates and sort by position
  const uniqueErrors = mockErrors.filter((error, index, self) => 
    index === self.findIndex(e => e.position.start === error.position.start && e.position.end === error.position.end)
  ).sort((a, b) => a.position.start - b.position.start);

  const statistics = calculateStatistics(uniqueErrors);
  
  return {
    errors: uniqueErrors,
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