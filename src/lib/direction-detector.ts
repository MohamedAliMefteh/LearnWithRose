/**
 * Direction detection utility for mixed Arabic/English content
 * Detects text direction (RTL/LTR) and helps with bidirectional text handling
 */

// Arabic Unicode ranges
const ARABIC_RANGES = [
  [0x0600, 0x06ff], // Arabic
  [0x0750, 0x077f], // Arabic Supplement
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
];

// Hebrew Unicode ranges (for completeness)
const HEBREW_RANGES = [
  [0x0590, 0x05ff], // Hebrew
];

/**
 * Checks if a character is RTL (Arabic, Hebrew, etc.)
 */
function isRtlChar(char: string): boolean {
  const code = char.charCodeAt(0);
  
  // Check Arabic ranges
  for (const [start, end] of ARABIC_RANGES) {
    if (code >= start && code <= end) {
      return true;
    }
  }
  
  // Check Hebrew ranges
  for (const [start, end] of HEBREW_RANGES) {
    if (code >= start && code <= end) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if a character is LTR (Latin, etc.)
 */
function isLtrChar(char: string): boolean {
  const code = char.charCodeAt(0);
  // Latin and common LTR scripts
  return (code >= 0x0041 && code <= 0x005a) || // A-Z
         (code >= 0x0061 && code <= 0x007a) || // a-z
         (code >= 0x0030 && code <= 0x0039);   // 0-9
}

/**
 * Detects the primary direction of text
 * Returns 'rtl', 'ltr', or 'mixed'
 */
export function detectDirection(text: string): 'rtl' | 'ltr' | 'mixed' {
  if (!text || text.trim().length === 0) {
    return 'ltr'; // Default to LTR for empty text
  }
  
  let rtlCount = 0;
  let ltrCount = 0;
  
  // Count RTL and LTR characters
  for (const char of text) {
    if (isRtlChar(char)) {
      rtlCount++;
    } else if (isLtrChar(char)) {
      ltrCount++;
    }
  }
  
  // Determine direction based on character count
  if (rtlCount === 0) {
    return 'ltr';
  } else if (ltrCount === 0) {
    return 'rtl';
  } else {
    return 'mixed';
  }
}

/**
 * Gets the dir attribute value for HTML elements
 */
export function getDirectionAttribute(direction?: string): 'rtl' | 'ltr' | 'auto' {
  if (direction === 'rtl') return 'rtl';
  if (direction === 'ltr') return 'ltr';
  return 'auto'; // Default to auto-detection
}

/**
 * Gets CSS direction property value
 */
export function getDirectionStyle(direction?: string): 'rtl' | 'ltr' {
  return direction === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * Auto-detects and returns direction for text
 * Useful for automatically setting direction on content
 */
export function autoDetectDirection(text: string): 'rtl' | 'ltr' {
  const detected = detectDirection(text);
  return detected === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * Analyzes text and returns detailed direction information
 */
export function analyzeTextDirection(text: string) {
  const direction = detectDirection(text);
  let rtlCount = 0;
  let ltrCount = 0;
  
  for (const char of text) {
    if (isRtlChar(char)) {
      rtlCount++;
    } else if (isLtrChar(char)) {
      ltrCount++;
    }
  }
  
  const total = rtlCount + ltrCount;
  const rtlPercentage = total > 0 ? (rtlCount / total) * 100 : 0;
  const ltrPercentage = total > 0 ? (ltrCount / total) * 100 : 0;
  
  return {
    direction,
    rtlCount,
    ltrCount,
    rtlPercentage: Math.round(rtlPercentage),
    ltrPercentage: Math.round(ltrPercentage),
  };
}
