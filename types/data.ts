// Data structure types

export interface PlaintextFormatOptions {
  /**
   * Whether to preserve line breaks as <br> tags
   * @default true
   */
  preserveLineBreaks?: boolean;

  /**
   * Whether to convert URLs to links
   * @default true
   */
  linkifyUrls?: boolean;

  /**
   * Custom bullet point characters
   * @default ['-', '*', '•']
   */
  bulletChars?: string[];
}
