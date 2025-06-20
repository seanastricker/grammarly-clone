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