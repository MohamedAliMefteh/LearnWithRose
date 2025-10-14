// Test file to demonstrate HTML to Markdown conversion
import { processContent } from './html-to-markdown';

// Your example HTML content
const htmlContent = `<p># Hello Markdown</p><p>This is a *simple* test of **Markdown** rendering.</p><p>- bullet item 1<br>- bullet item 2<br>&nbsp;- nested item<br>1. numbered item one<br>2. numbered item two</p><p>**Inline code:** \`const x = 3;\` </p><p>&gt; A short blockquote to check styling.</p><p>![Placeholder image](https://via.placeholder.com/400x120)<br>&nbsp;</p>`;

// Test the problematic content that was showing up incorrectly
const problematicContent = `# Hello Markdown
This is a *simple* test of **Markdown** rendering.
- bullet item 1 - bullet item 2 - nested item 1. numbered item one 2. numbered item two
**Inline code:** \`const x = 3;\` 
> A short blockquote to check styling.
![Placeholder image](https://via.placeholder.com/400x120)`;

// Convert and log the result
console.log('Original HTML:');
console.log(htmlContent);
console.log('\nConverted Markdown:');
console.log(processContent(htmlContent));

// Expected output should be clean markdown like:
/*
# Hello Markdown

This is a *simple* test of **Markdown** rendering.

- bullet item 1
- bullet item 2
  - nested item
1. numbered item one
2. numbered item two

**Inline code:** `const x = 3;`

> A short blockquote to check styling.

![Placeholder image](https://via.placeholder.com/400x120)
*/
