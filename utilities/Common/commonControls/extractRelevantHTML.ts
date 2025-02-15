// extractRelevantHTML.ts
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { pruneRawHTML } from './regexPrune';   // optional
import { pruneHTML } from './pruneHtml';

export function extractRelevantHTML(prompt: string, fullHTML: string): string {
  // 1. (Optional) Do a quick text-based prune on the raw HTML string
  //    removing comments, data-react props, etc.
  let rawPruned = pruneRawHTML(fullHTML);

  // 2. Parse with JSDOM to get a Document
  const dom = new JSDOM(rawPruned);
  const document = dom.window.document;

  // 3. DOM-based prune: remove scripts, styles, big base64 images, etc.
  pruneHTML(document);

  // 4. Convert back to string
  let cleanedHTML = document.documentElement.outerHTML;

  // 5. (Optional) Another regex pass after DOM removal if you like
  // cleanedHTML = pruneRawHTML(cleanedHTML);

  // 6. Log final cleaned HTML if desired
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
  }
  const logFilePath = `./logs/cleaned_html_${Date.now()}.html`;
  fs.writeFileSync(logFilePath, cleanedHTML);
  console.log(`📝 Pruned HTML saved to: ${logFilePath}`);

  // 7. Return the pruned HTML
  return cleanedHTML;
}
