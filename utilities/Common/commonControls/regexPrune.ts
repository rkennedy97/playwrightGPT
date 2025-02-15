/**
 * pruneRawHTML: Remove known bloat from raw HTML string with regex.
 * - e.g., large comments, data-reactid, etc.
 */
export function pruneRawHTML(html: string): string {
    let result = html;
  
    // 1. Remove HTML comments: <!-- ... -->
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  
    // 2. Example: remove data attributes like data-reactid, data-react-checksum, etc.
    //    Be careful not to break valid HTML.
    result = result.replace(/\sdata-react\S+=".*?"/g, '');
  
    // 3. If you have known big lumps of repeated text, remove them here
    // e.g. some frameworks embed huge JSON in script tags
    // already handled by removing <script> tags, but you can do more if needed.
  
    return result;
  }
  