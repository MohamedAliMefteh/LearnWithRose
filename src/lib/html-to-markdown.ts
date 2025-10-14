import TurndownService from 'turndown';

// Create a turndown service instance with custom rules
const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # for headings
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full',
});

// Add custom rules for better conversion
turndownService.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: function (content) {
    return '~~' + content + '~~';
  }
});

// Handle line breaks properly
turndownService.addRule('lineBreak', {
  filter: 'br',
  replacement: function () {
    return '\n';
  }
});

// Handle non-breaking spaces
turndownService.addRule('nonBreakingSpace', {
  filter: function (node) {
    return node.nodeType === 3 && node.textContent === '\u00A0';
  },
  replacement: function () {
    return ' ';
  }
});

// Handle nested lists better
turndownService.addRule('nestedList', {
  filter: function (node) {
    return (node.nodeName === 'UL' || node.nodeName === 'OL') && 
           node.parentNode && 
           (node.parentNode.nodeName === 'LI');
  },
  replacement: function (content, node) {
    const type = node.nodeName === 'OL' ? '1.' : '-';
    return '\n' + content.replace(/^/gm, '  '); // Indent nested lists
  }
});

/**
 * Convert HTML content to Markdown
 * @param html - HTML string to convert
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // Clean up common HTML entities and formatting issues
    let cleanHtml = html
      // Replace &nbsp; with regular spaces
      .replace(/&nbsp;/g, ' ')
      // Handle line breaks properly - convert <br> to actual line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      // Clean up empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
      // Clean up empty divs
      .replace(/<div>\s*<\/div>/g, '')
      // Handle paragraphs - add line breaks around them
      .replace(/<p>/gi, '\n\n')
      .replace(/<\/p>/gi, '\n\n')
      // Handle list items properly
      .replace(/<li>/gi, '\n- ')
      .replace(/<\/li>/gi, '')
      // Handle ordered lists
      .replace(/<ol>/gi, '\n')
      .replace(/<\/ol>/gi, '\n')
      // Handle unordered lists
      .replace(/<ul>/gi, '\n')
      .replace(/<\/ul>/gi, '\n')
      // Handle blockquotes
      .replace(/<blockquote>/gi, '\n> ')
      .replace(/<\/blockquote>/gi, '\n')
      // Handle headings
      .replace(/<h1>/gi, '\n# ')
      .replace(/<\/h1>/gi, '\n')
      .replace(/<h2>/gi, '\n## ')
      .replace(/<\/h2>/gi, '\n')
      .replace(/<h3>/gi, '\n### ')
      .replace(/<\/h3>/gi, '\n')
      // Handle code blocks
      .replace(/<pre><code>/gi, '\n```\n')
      .replace(/<\/code><\/pre>/gi, '\n```\n')
      // Handle inline code
      .replace(/<code>/gi, '`')
      .replace(/<\/code>/gi, '`')
      // Handle strong/bold
      .replace(/<strong>/gi, '**')
      .replace(/<\/strong>/gi, '**')
      .replace(/<b>/gi, '**')
      .replace(/<\/b>/gi, '**')
      // Handle emphasis/italic
      .replace(/<em>/gi, '*')
      .replace(/<\/em>/gi, '*')
      .replace(/<i>/gi, '*')
      .replace(/<\/i>/gi, '*')
      // Clean up multiple spaces
      .replace(/[ \t]+/g, ' ');

    // Convert to markdown using turndown for any remaining HTML
    const markdown = turndownService.turndown(cleanHtml);

    // Post-process the markdown to fix common issues
    let processedMarkdown = markdown
      // Clean up excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Fix list formatting - ensure proper spacing
      .replace(/^-\s+/gm, '- ')
      // Fix numbered lists
      .replace(/^(\d+)\.\s+/gm, '$1. ')
      // Fix nested lists (add proper indentation)
      .replace(/\n\s*-\s+/g, '\n- ')
      // Ensure blockquotes have proper formatting
      .replace(/^>\s+/gm, '> ')
      // Fix headings
      .replace(/^#+\s+/gm, (match) => match.trim() + ' ')
      // Trim whitespace
      .trim();

    // Handle special case for your content format where lists are on the same line
    processedMarkdown = processedMarkdown
      // Split items that are concatenated on the same line
      .replace(/- ([^-\n]+) - /g, '- $1\n- ')
      .replace(/(\d+)\. ([^0-9\n]+) (\d+)\./g, '$1. $2\n$3.')
      // Fix nested items
      .replace(/- ([^-\n]+) - ([^-\n]+) - ([^-\n]+)/g, '- $1\n- $2\n  - $3');

    return processedMarkdown;
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    // Fallback: return the original HTML if conversion fails
    return html;
  }
}

/**
 * Check if content is HTML (contains HTML tags)
 * @param content - Content to check
 * @returns true if content appears to be HTML
 */
export function isHtmlContent(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  // Simple check for HTML tags
  const htmlTagRegex = /<[^>]+>/;
  return htmlTagRegex.test(content);
}

/**
 * Fix concatenated markdown lists and formatting issues
 * @param markdown - Markdown content that may have formatting issues
 * @returns Fixed markdown string
 */
function fixMarkdownFormatting(markdown: string): string {
  return markdown
    // Fix concatenated bullet lists (- item1 - item2 - item3)
    .replace(/^- ([^-\n]+?) - ([^-\n]+?) - ([^-\n]+)/gm, '- $1\n- $2\n  - $3')
    .replace(/^- ([^-\n]+?) - ([^-\n]+)/gm, '- $1\n- $2')
    
    // Fix concatenated numbered lists (1. item1 2. item2)
    .replace(/(\d+)\. ([^0-9\n]+?) (\d+)\. ([^0-9\n]+)/g, '$1. $2\n$3. $4')
    
    // Ensure proper spacing around headings
    .replace(/^(#{1,6})\s*(.+)$/gm, '\n$1 $2\n')
    
    // Ensure proper spacing around blockquotes
    .replace(/^>\s*(.+)$/gm, '\n> $1\n')
    
    // Fix inline code that might be escaped incorrectly
    .replace(/\\`([^`]+)\\`/g, '`$1`')
    
    // Clean up excessive newlines but preserve intentional spacing
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '');
}

/**
 * Smart content processor that handles both HTML and Markdown
 * @param content - Content that might be HTML or Markdown
 * @returns Markdown string
 */
export function processContent(content: string): string {
  if (!content) {
    return '';
  }

  let processedContent: string;

  // If it looks like HTML, convert it to markdown
  if (isHtmlContent(content)) {
    processedContent = htmlToMarkdown(content);
  } else {
    // Already markdown, but might need formatting fixes
    processedContent = content;
  }

  // Apply formatting fixes to handle common issues
  return fixMarkdownFormatting(processedContent);
}
