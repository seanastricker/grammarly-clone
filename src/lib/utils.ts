/**
 * @fileoverview Core utility functions
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Essential utility functions for the WordWise AI application.
 * Includes class name merging, type guards, and common helpers.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges Tailwind CSS classes
 * Uses clsx for conditional classes and twMerge for Tailwind conflicts
 * 
 * @param inputs - Class values to merge
 * @returns Merged and deduplicated class string
 * 
 * @example
 * ```typescript
 * cn('px-4', 'px-2', 'py-2') // 'px-2 py-2'
 * cn('text-red-500', isError && 'text-red-700') // 'text-red-700' if isError
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Delays execution for specified milliseconds
 * Useful for debouncing and artificial delays
 * 
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a unique ID with optional prefix
 * Uses crypto.randomUUID when available, falls back to timestamp + random
 * 
 * @param prefix - Optional prefix for the ID
 * @returns Unique identifier string
 */
export function generateId(prefix?: string): string {
  const id = crypto?.randomUUID?.() || 
    `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Safely parses JSON with fallback value
 * Prevents JSON.parse errors from crashing the application
 * 
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback value
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Capitalizes the first letter of a string
 * 
 * @param str - String to capitalize
 * @returns String with first letter capitalized
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncates text to specified length with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Formats file size in human-readable format
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Checks if a value is defined (not null or undefined)
 * 
 * @param value - Value to check
 * @returns True if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Debounces a function call
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Extracts plain text from HTML content consistently
 * Used by both grammar analysis and suggestion application
 * 
 * @param htmlContent - HTML content to extract text from
 * @returns Plain text with normalized whitespace
 */
export function extractPlainTextFromHTML(htmlContent: string): string {
  return htmlContent
    .replace(/<[^>]*>/g, ' ')           // Replace HTML tags with spaces
    .replace(/&nbsp;/g, ' ')           // Replace non-breaking spaces
    .replace(/&amp;/g, '&')           // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')              // Normalize whitespace
    .trim();
}

/**
 * Converts HTML content to formatted text preserving structure
 * Used for document exports to maintain readability
 * 
 * @param htmlContent - HTML content to convert
 * @returns Formatted text with preserved structure
 */
export function convertHTMLToFormattedText(htmlContent: string): string {
  let text = htmlContent;
  
  // Handle headers (h1-h6) - Convert to uppercase with spacing
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n$1\n' + '='.repeat(60) + '\n');
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n$1\n' + '-'.repeat(40) + '\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n$1\n' + '-'.repeat(20) + '\n');
  text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n\n$1:\n');
  text = text.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n\n$1:\n');
  text = text.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n\n$1:\n');
  
  // Handle paragraphs - Add proper spacing
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1');
  
  // Handle line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Handle ordered lists first - need to process them separately to maintain proper numbering
  text = text.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, listContent) => {
    let counter = 1;
    const processedList = listContent.replace(/<li[^>]*>(.*?)<\/li>/gi, (liMatch: string, liContent: string) => {
      return `${counter++}. ${liContent}\n`;
    });
    return '\n' + processedList + '\n';
  });
  
  // Handle unordered lists (after ordered lists to avoid conflicts)
  text = text.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, listContent) => {
    const processedList = listContent.replace(/<li[^>]*>(.*?)<\/li>/gi, (liMatch: string, liContent: string) => {
      return `• ${liContent}\n`;
    });
    return '\n' + processedList + '\n';
  });
  
  // Handle blockquotes
  text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n> $1\n');
  
  // Handle emphasis and strong text
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  text = text.replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_');
  
  // Handle code
  text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  text = text.replace(/<pre[^>]*>(.*?)<\/pre>/gi, '\n```\n$1\n```\n');
  
  // Handle horizontal rules
  text = text.replace(/<hr\s*\/?>/gi, '\n' + '-'.repeat(60) + '\n');
  
  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up excessive whitespace while preserving intentional spacing
  text = text.replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
  text = text.replace(/\n[ \t]+/g, '\n'); // Remove leading spaces on lines
  text = text.replace(/[ \t]+\n/g, '\n'); // Remove trailing spaces on lines
  text = text.replace(/\n{3,}/g, '\n\n'); // Limit to maximum 2 consecutive newlines
  
  return text.trim();
}

/**
 * Clear potentially problematic localStorage data
 * This helps resolve issues when document types or user preferences have changed
 */
export function clearLegacyData(): void {
  try {
    // Clear any cached documents that might have old types
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('document_') ||
        key.includes('userPreferences') ||
        key.includes('documentTypes') ||
        key.includes('recentDocuments') ||
        key.includes('wordwise') ||
        key.includes('grammarly-clone')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🧹 Cleared legacy data:', key);
    });
    
    if (keysToRemove.length > 0) {
      console.log('🧹 Cleared', keysToRemove.length, 'legacy localStorage items');
    }
  } catch (error) {
    console.error('Error clearing legacy data:', error);
  }
}

/**
 * Check if we need to clear legacy data based on app version
 */
export function checkAndClearLegacyData(): void {
  const currentVersion = '2.0.0'; // Dungeons & Drafting version
  const storedVersion = localStorage.getItem('app_version');
  
  if (!storedVersion || storedVersion !== currentVersion) {
    console.log('🔄 Version change detected, clearing legacy data...');
    clearLegacyData();
    localStorage.setItem('app_version', currentVersion);
  }
}

/**
 * Apply text changes to HTML content while preserving formatting
 * This function maps plain text positions to HTML positions and applies changes within the HTML structure
 * 
 * @param htmlContent - Original HTML content
 * @param plainTextStart - Start position in plain text
 * @param plainTextEnd - End position in plain text
 * @param replacement - Text to replace with
 * @returns Updated HTML content with formatting preserved
 */
export function applyTextChangeToHTML(
  htmlContent: string, 
  plainTextStart: number, 
  plainTextEnd: number, 
  replacement: string
): string {
  // Build a mapping of plain text positions to HTML positions
  const positionMap: { plainPos: number; htmlPos: number; inTag: boolean }[] = [];
  let plainPos = 0;
  let htmlPos = 0;
  let inTag = false;
  
  for (let i = 0; i < htmlContent.length; i++) {
    const char = htmlContent[i];
    
    if (char === '<') {
      inTag = true;
    } else if (char === '>') {
      inTag = false;
      htmlPos = i + 1;
      continue;
    }
    
    if (!inTag) {
      // Handle HTML entities
      if (char === '&') {
        const entityEnd = htmlContent.indexOf(';', i);
        if (entityEnd !== -1) {
          const entity = htmlContent.substring(i, entityEnd + 1);
          let decodedChar = ' ';
          
          switch (entity) {
            case '&nbsp;': decodedChar = ' '; break;
            case '&amp;': decodedChar = '&'; break;
            case '&lt;': decodedChar = '<'; break;
            case '&gt;': decodedChar = '>'; break;
            case '&quot;': decodedChar = '"'; break;
            case '&#39;': decodedChar = "'"; break;
            default: decodedChar = ' '; break;
          }
          
          positionMap.push({ plainPos, htmlPos: i, inTag: false });
          plainPos++;
          htmlPos = entityEnd + 1;
          i = entityEnd;
          continue;
        }
      }
      
      // Map this character position
      positionMap.push({ plainPos, htmlPos: i, inTag: false });
      
      // Normalize whitespace in position mapping
      if (/\s/.test(char)) {
        // Only increment plain position once for consecutive whitespace
        if (plainPos === 0 || !positionMap[positionMap.length - 2] || 
            positionMap[positionMap.length - 2].plainPos < plainPos) {
          plainPos++;
        }
      } else {
        plainPos++;
      }
    }
    
    htmlPos = i + 1;
  }
  
  // Add final position
  positionMap.push({ plainPos, htmlPos: htmlContent.length, inTag: false });
  
  // Find HTML positions for the plain text range
  const startMapping = positionMap.find(m => m.plainPos >= plainTextStart);
  const endMapping = positionMap.find(m => m.plainPos >= plainTextEnd);
  
  if (!startMapping || !endMapping) {
    console.warn('Could not map plain text positions to HTML positions');
    return htmlContent;
  }
  
  const htmlStart = startMapping.htmlPos;
  const htmlEnd = endMapping.htmlPos;
  
  // Apply the replacement in HTML
  const before = htmlContent.substring(0, htmlStart);
  const after = htmlContent.substring(htmlEnd);
  
  return before + replacement + after;
}

/**
 * Apply multiple text changes to HTML content efficiently
 * Changes should be sorted by position (right to left) to avoid position shifts
 * 
 * @param htmlContent - Original HTML content
 * @param changes - Array of changes to apply, sorted by position descending
 * @returns Updated HTML content with all changes applied
 */
export function applyMultipleTextChangesToHTML(
  htmlContent: string,
  changes: Array<{
    plainTextStart: number;
    plainTextEnd: number;
    replacement: string;
    originalText?: string;
  }>
): { updatedHTML: string; appliedCount: number; failedCount: number } {
  let currentHTML = htmlContent;
  let appliedCount = 0;
  let failedCount = 0;
  
  // Sort changes by position (right to left) to avoid position shifts
  const sortedChanges = [...changes].sort((a, b) => b.plainTextStart - a.plainTextStart);
  
  for (const change of sortedChanges) {
    try {
      // Verify the original text exists if provided
      if (change.originalText) {
        const currentPlainText = extractPlainTextFromHTML(currentHTML);
        if (!currentPlainText.includes(change.originalText)) {
          console.warn('Original text not found for change:', change.originalText);
          failedCount++;
          continue;
        }
      }
      
      const beforeChange = currentHTML;
      currentHTML = applyTextChangeToHTML(
        currentHTML,
        change.plainTextStart,
        change.plainTextEnd,
        change.replacement
      );
      
      if (currentHTML !== beforeChange) {
        appliedCount++;
      } else {
        failedCount++;
      }
    } catch (error) {
      console.error('Error applying change:', error, change);
      failedCount++;
    }
  }
  
  return {
    updatedHTML: currentHTML,
    appliedCount,
    failedCount
  };
}

/**
 * Password validation interface
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password strength according to security requirements
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get a formatted password requirements message for display
 */
export function getPasswordRequirements(): string {
  return 'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
}

/**
 * Get password strength score (0-4)
 * 0 = Very weak, 4 = Strong
 */
export function getPasswordStrength(password: string): number {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  
  return score;
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Unknown';
  }
} 