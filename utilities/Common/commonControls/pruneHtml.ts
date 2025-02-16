export function pruneHTML(document: Document) {
  // 1. Remove <script> tags
  document.querySelectorAll('script').forEach(script => script.remove());

  // 2. Remove <style> tags
  document.querySelectorAll('style').forEach(style => style.remove());

  // 3. Remove <link> tags (CSS, manifest, etc.)
  document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"], link[rel="manifest"], link[rel="icon"]').forEach(link => link.remove());

  // 4. Remove <meta> tags
  document.querySelectorAll('meta').forEach(meta => meta.remove());

  // 5. Remove images with base64 data URIs
  document.querySelectorAll('img[src^="data:image"]').forEach(img => img.remove());

  // 6. Remove inline styles
  document.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));

  // 7. **Remove all <svg> and <path> elements**
  document.querySelectorAll('svg').forEach(svg => svg.remove());
  document.querySelectorAll('path').forEach(path => path.remove());

  // 8. Remove unnecessary attributes
  document.querySelectorAll('*').forEach(el => {
    el.removeAttribute('rel');       // Unneeded rel attributes
    el.removeAttribute('hreflang');  // No need for hreflang
    el.removeAttribute('data-nosnippet'); 
    el.removeAttribute('data-space');

    // If you truly don't need hrefs:
    el.removeAttribute('href');

    // **Loop over data-* attributes and remove them**
    [...el.attributes].forEach(attr => {
      if (attr.name.startsWith('data-')) {
        el.removeAttribute(attr.name);
      }
    });
  });
}
