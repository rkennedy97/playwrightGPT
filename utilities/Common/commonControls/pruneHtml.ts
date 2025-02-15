import { JSDOM } from "jsdom";

/**
 * pruneHTML: Removes superfluous tags and attributes that are rarely
 * needed for GPT-based locator generation.
 */
export function pruneHTML(document: Document) {
  // 1. Remove <script> tags
  document.querySelectorAll('script').forEach(script => script.remove());

  // 2. Remove <style> tags
  document.querySelectorAll('style').forEach(style => style.remove());

  // 3. Remove <link> tags (CSS, manifest, preload, etc.)
  document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"], link[rel="manifest"], link[rel="icon"]').forEach(link => link.remove());

  // 4. Remove <meta> tags
  document.querySelectorAll('meta').forEach(meta => meta.remove());

  // 5. Remove images with base64 data URIs (very large)
  document.querySelectorAll('img[src^="data:image"]').forEach(img => {
    // Option A: remove the entire <img>
    img.remove();
    // Option B: keep <img> but remove src
    // img.removeAttribute('src');
  });

  // 6. Remove inline styles
  document.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));

  // 7. Remove comments, if you like—JSdom doesn't keep them as separate nodes by default,
  // but if your version does, you can query and remove them.
  // e.g. if you have "comment" nodes, you'd do: document.createTreeWalker(...) or so.
}
