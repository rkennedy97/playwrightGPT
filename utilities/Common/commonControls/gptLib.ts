// utilities/Common/gptLib.ts

import fs from 'fs';
import { Page } from '@playwright/test';
import { getLocatorFromGPT3_5 } from './commonControls'; // adjust as needed

// Default cache file path, which can be changed dynamically.
let cacheFilePath = './gptCache.json';
let gptCallCount = 0;
let gptCache = loadCache(cacheFilePath);

function loadCache(filePath: string): Map<string, any> {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const obj = JSON.parse(data);
    return new Map(Object.entries(obj));
  } else {
    return new Map();
  }
}

function saveCache(cache: Map<string, any>, filePath: string) {
  const obj = Object.fromEntries(cache);
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

/**
 * Allows you to set a custom cache file name.
 * Call this at the start of your test, passing a unique file name (e.g., based on test title).
 */
export function setCacheFileName(filename: string) {
  cacheFilePath = filename;
  // Reload cache from this new file, or create a new Map if file doesn't exist.
  gptCache = loadCache(cacheFilePath);
}

/** 
 * getCachedLocator: Return a cached locator if it exists; otherwise, call GPT 
 */
async function getCachedLocator(prompt: string, html: string) {
  const cacheKey = prompt + html.substring(0, 200);

  if (gptCache.has(cacheKey)) {
    console.log('Returning cached GPT response for prompt:', prompt);
    return gptCache.get(cacheKey);
  }

  gptCallCount++;
  const result = await getLocatorFromGPT3_5(prompt, html);
  gptCache.set(cacheKey, result);
  saveCache(gptCache, cacheFilePath);
  return result;
}

/**
 * waitForCachedSelector: Wait for the selector; if not found, remove from cache & retry.
 */
async function waitForCachedSelector(
  page: Page,
  prompt: string,
  htmlSnippet: string,
  locator: any,
  timeout = 2000
) {
  try {
    await page.waitForSelector(locator.selector, { timeout });
    return locator;
  } catch (error) {
    console.log(`Locator not found within ${timeout}ms for prompt: ${prompt}. Retrying GPT...`);
    const cacheKey = prompt + htmlSnippet.substring(0, 200);
    gptCache.delete(cacheKey);
    saveCache(gptCache, cacheFilePath);
    const newLocator = await getCachedLocator(prompt, htmlSnippet);
    return newLocator;
  }
}

/**
 * prompt: A single function that interprets GPT's "action" and executes fill/click/select.
 * 
 * @param page - The Playwright Page
 * @param instruction - The plain-English GPT prompt (e.g. "fill username", "click login", etc.)
 * @param data - Optional data to fill or select (e.g. the text to type or the label to select)
 */
export async function prompt(page: Page, instruction: string, data?: string) {
  const htmlSnippet = await page.content();
  const locator = await getCachedLocator(instruction, htmlSnippet);
  const validated = await waitForCachedSelector(page, instruction, htmlSnippet, locator);
  const action = (locator?.action || '').toLowerCase();

  switch (true) {
    case action === 'fill':
      await page.fill(validated.selector, data || '');
      break;

    case action === 'click':
      await page.click(validated.selector);
      break;

    case action.startsWith('select'):
      if (!data) {
        throw new Error(`No data provided for select action in prompt "${instruction}"`);
      }
      await page.selectOption(validated.selector, { label: data });
      break;

    default:
      console.warn(`Unrecognized GPT action "${locator.action}" for prompt "${instruction}".`);
      break;
  }

  await page.waitForTimeout(500);
}

export function getGptCallCount() {
  return gptCallCount;
}
