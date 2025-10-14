/**
 * Text Highlighting Utilities
 * Highlights search terms in text content
 */

import React from 'react';

/**
 * Highlights search terms in text content
 * @param text - The text to highlight
 * @param searchTerms - Array of search terms to highlight
 * @param highlightClass - CSS class for highlighting
 * @returns JSX element with highlighted text
 */
export const highlightSearchTerms = (
  text: string, 
  searchTerms: string[], 
  highlightClass: string = "bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
): React.ReactNode => {
  if (!text || !searchTerms || searchTerms.length === 0) {
    return text;
  }

  // Create a regex pattern from all search terms
  const escapedTerms = searchTerms
    .filter(term => term.trim().length > 0)
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  if (!escapedTerms) {
    return text;
  }

  const regex = new RegExp(`(${escapedTerms})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part: string, index: number) => {
        const isMatch = searchTerms.some(term => 
          part.toLowerCase() === term.toLowerCase()
        );
        
        if (isMatch) {
          return (
            <mark key={index} className={highlightClass}>
              {part}
            </mark>
          );
        }
        
        return part;
      })}
    </>
  );
};

// Common words to exclude from highlighting
const COMMON_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'would',
  'am', 'been', 'being', 'do', 'does', 'did', 'have', 'had', 'has', 'having', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 'shall',
  'this', 'these', 'those', 'i', 'you', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'or', 'but', 'so', 'yet', 'nor', 'if', 'when', 'where', 'why', 'how', 'what', 'who', 'which', 'whom', 'whose'
]);

/**
 * Extracts search terms from a query string, filtering out common words
 * @param query - The search query
 * @returns Array of meaningful search terms
 */
export const extractSearchTerms = (query: string): string[] => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  // Split by spaces and filter out empty strings and common words
  return query
    .split(/\s+/)
    .filter(term => {
      const cleanTerm = term.trim().toLowerCase();
      return cleanTerm.length > 0 && 
             cleanTerm.length > 2 && // Only words longer than 2 characters
             !COMMON_WORDS.has(cleanTerm); // Exclude common words
    })
    .map(term => term.trim());
};

/**
 * Highlights text with custom styling
 * @param text - The text to highlight
 * @param searchTerms - Array of search terms
 * @param options - Highlighting options
 */
export const highlightText = (
  text: string,
  searchTerms: string[],
  options: {
    className?: string;
    caseSensitive?: boolean;
    wholeWord?: boolean;
  } = {}
): React.ReactNode => {
  const {
    className = "bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-medium",
    caseSensitive = false,
    wholeWord = false
  } = options;

  if (!text || !searchTerms || searchTerms.length === 0) {
    return text;
  }

  let processedTerms = searchTerms.filter(term => term.trim().length > 0);
  
  if (!caseSensitive) {
    processedTerms = processedTerms.map(term => term.toLowerCase());
  }

  if (processedTerms.length === 0) {
    return text;
  }

  // Create regex pattern
  const escapedTerms = processedTerms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  const flags = caseSensitive ? 'g' : 'gi';
  const pattern = wholeWord ? `\\b(${escapedTerms})\\b` : `(${escapedTerms})`;
  const regex = new RegExp(pattern, flags);

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part: string, index: number) => {
        const isMatch = processedTerms.some(term => {
          const partToCheck = caseSensitive ? part : part.toLowerCase();
          return wholeWord ? 
            new RegExp(`\\b${term}\\b`, caseSensitive ? 'g' : 'gi').test(partToCheck) :
            partToCheck === term;
        });
        
        if (isMatch) {
          return (
            <mark key={index} className={className}>
              {part}
            </mark>
          );
        }
        
        return part;
      })}
    </>
  );
};

/**
 * Simple text highlighting for basic use cases
 * @param text - The text to highlight
 * @param query - The search query
 * @returns Highlighted text
 */
export const simpleHighlight = (text: string, query: string): React.ReactNode => {
  if (!text || !query || query.trim().length === 0) {
    return text;
  }

  const searchTerms = extractSearchTerms(query);
  return highlightSearchTerms(text, searchTerms);
};
