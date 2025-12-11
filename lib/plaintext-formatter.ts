/**
 * Plaintext Formatter
 * 
 * This utility provides the foundation for converting plaintext content
 * into formatted HTML. It handles common plaintext patterns like:
 * - Bullet points (lines starting with -, *, or •)
 * - Numbered lists
 * - Bold text (wrapped in ** or __)
 * - Italic text (wrapped in * or _)
 * - Headers (lines starting with #)
 * - Paragraphs (double line breaks)
 * 
 * This is designed to be extensible for future formatting needs.
 */

import type { PlaintextFormatOptions } from "@/types/data";

/**
 * Detects if a line is a bullet point
 */
function isBulletPoint(line: string, bulletChars: string[]): boolean {
  const trimmed = line.trim();
  return bulletChars.some(char => trimmed.startsWith(char));
}

/**
 * Detects if a line is a numbered list item
 */
function isNumberedItem(line: string): boolean {
  const trimmed = line.trim();
  return /^\d+[.)]\s/.test(trimmed);
}

/**
 * Detects if a line is a header (starts with #)
 */
function isHeader(line: string): { level: number; text: string } | null {
  const trimmed = line.trim();
  const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
  if (match) {
    return {
      level: match[1].length,
      text: match[2],
    };
  }
  return null;
}

/**
 * Formats inline text (bold, italic, etc.)
 */
function formatInlineText(text: string): string {
  // Escape HTML first
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Bold: **text** or __text__
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_ (but not if it's part of bold)
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  formatted = formatted.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
  
  return formatted;
}

/**
 * Converts URLs to links
 */
function linkifyUrls(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
}

/**
 * Formats plaintext content into HTML
 * 
 * @param plaintext - The plaintext content to format
 * @param options - Formatting options
 * @returns Formatted HTML string
 */
export function formatPlaintext(
  plaintext: string,
  options: PlaintextFormatOptions = {}
): string {
  const {
    preserveLineBreaks = true,
    linkifyUrls: shouldLinkify = true,
    bulletChars = ['-', '*', '•'],
  } = options;

  if (!plaintext || !plaintext.trim()) {
    return '';
  }

  const lines = plaintext.split('\n');
  const output: string[] = [];
  let inList = false;
  let inNumberedList = false;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join(' ');
      let formatted = formatInlineText(paragraphText);
      if (shouldLinkify) {
        formatted = linkifyUrls(formatted);
      }
      output.push(`<p>${formatted}</p>`);
      currentParagraph = [];
    }
  };

  const closeList = () => {
    if (inList) {
      output.push('</ul>');
      inList = false;
    }
    if (inNumberedList) {
      output.push('</ol>');
      inNumberedList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line - flush paragraph and close lists
    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    // Check for headers
    const header = isHeader(line);
    if (header) {
      flushParagraph();
      closeList();
      const formattedText = formatInlineText(header.text);
      output.push(`<h${header.level} class="font-bold mt-6 mb-4">${formattedText}</h${header.level}>`);
      continue;
    }

    // Check for bullet points
    if (isBulletPoint(line, bulletChars)) {
      flushParagraph();
      if (inNumberedList) {
        output.push('</ol>');
        inNumberedList = false;
      }
      if (!inList) {
        output.push('<ul class="list-disc list-inside space-y-2 my-4">');
        inList = true;
      }
      const bulletText = trimmed.substring(1).trim();
      let formatted = formatInlineText(bulletText);
      if (shouldLinkify) {
        formatted = linkifyUrls(formatted);
      }
      output.push(`<li>${formatted}</li>`);
      continue;
    }

    // Check for numbered lists
    if (isNumberedItem(line)) {
      flushParagraph();
      if (inList) {
        output.push('</ul>');
        inList = false;
      }
      if (!inNumberedList) {
        output.push('<ol class="list-decimal list-inside space-y-2 my-4">');
        inNumberedList = true;
      }
      const itemText = trimmed.replace(/^\d+[.)]\s/, '');
      let formatted = formatInlineText(itemText);
      if (shouldLinkify) {
        formatted = linkifyUrls(formatted);
      }
      output.push(`<li>${formatted}</li>`);
      continue;
    }

    // Regular paragraph text
    closeList();
    if (preserveLineBreaks && i < lines.length - 1 && lines[i + 1].trim()) {
      // If next line is not empty, treat as paragraph continuation
      currentParagraph.push(trimmed);
    } else {
      // Single line or end of paragraph
      currentParagraph.push(trimmed);
      if (i === lines.length - 1 || !lines[i + 1].trim()) {
        flushParagraph();
      }
    }
  }

  // Flush any remaining paragraph and close lists
  flushParagraph();
  closeList();

  return output.join('\n');
}

/**
 * Detects if content is likely markdown based on common patterns
 */
export function isLikelyMarkdown(content: string): boolean {
  if (!content) return false;
  
  // Check for markdown-specific patterns
  const markdownPatterns = [
    /^#{1,6}\s+/m,                    // Headers
    /```[\s\S]*?```/m,                // Code blocks
    /\[.*?\]\(.*?\)/m,                // Links
    /!\[.*?\]\(.*?\)/m,               // Images
    /^\s*[-*+]\s+/m,                  // Bullet lists
    /^\s*\d+\.\s+/m,                  // Numbered lists
    /`[^`]+`/m,                        // Inline code
    /^\s*>/m,                          // Blockquotes
    /^\s*\|.*\|.*\|/m,                // Tables
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
}

/**
 * Detects if content is likely HTML
 */
export function isLikelyHTML(content: string): boolean {
  if (!content) return false;
  
  // Check for HTML tags
  const htmlPattern = /<[a-z][\s\S]*>/i;
  return htmlPattern.test(content);
}

