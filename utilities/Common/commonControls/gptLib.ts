// utilities/Common/gptLib.ts

import fs from 'fs';
import { Page } from '@playwright/test';
import { getLocatorFromGPT3_5, getLocatorFromGPT4 } from './commonControls'; 
import { extractRelevantHTML } from './extractRelevantHTML'; // <-- ensure correct import path

// Default cache file path, which can be changed dynamically.
let cacheFilePath = './gptCache.json';
let gptCallCount = 0;
let gptCache = loadCache(cacheFilePath);

/** Load GPT cache from a JSON file. */
function loadCache(filePath: string): Map<string, any> {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const obj = JSON.parse(data);
    return new Map(Object.entries(obj));
  } else {
    return new Map();
  }
}

/** Save GPT cache to a JSON file. */
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
 * getCachedLocator: Return a cached locator if it exists; otherwise, call GPT.
 * 1) We check the cache based on prompt + snippet.
 * 2) If not cached, we extract relevant HTML, truncate it to a safe size, and call GPT.
 */
async function getCachedLocator(prompt: string, fullHTML: string) {
  const cacheKey = prompt + fullHTML.substring(0, 200);

  if (gptCache.has(cacheKey)) {
    console.log(`✅ Using cached locator for: "${prompt}"`);
    return gptCache.get(cacheKey);
  }

  // 1) Run pruning/sanitizing
  const prunedHTML = extractRelevantHTML(prompt, fullHTML);

  // 2) Possibly do your "find best match + minimal DOM" logic
  //    or skip that if you rely on GPT for everything.

  // 3) Now call GPT with the pruned HTML
  gptCallCount++;
  const result = await getLocatorFromGPT3_5(prompt, prunedHTML);
  
  // 4) Cache, save, return
  gptCache.set(cacheKey, result);
  saveCache(gptCache, cacheFilePath);
  return result;
}

/**
 * waitForCachedSelector: Wait for the selector; if not found, remove from cache & re-try GPT.
 */
async function waitForCachedSelector(
  page: Page,
  prompt: string,
  fullHTML: string,
  locator: any,
  timeout = 2000
) {
  if (!locator || !locator.selector) {
    console.error(`❌ Locator is null or invalid for prompt "${prompt}". Skipping step.`);
    return null;
  }

  try {
    await page.waitForSelector(locator.selector, { timeout });
    return locator;
  } catch (error) {
    console.log(`🔎 Locator not found within ${timeout}ms for "${prompt}". Removing from cache & retrying GPT...`);

    const cacheKey = prompt + fullHTML.substring(0, 200);
    gptCache.delete(cacheKey);
    saveCache(gptCache, cacheFilePath);

    // Re-call GPT with relevant snippet
    const newLocator = await getCachedLocator(prompt, fullHTML);
    return newLocator;
  }
}

/**
 * prompt: A single function that interprets GPT's "action" and executes fill/click/select.
 * - If GPT or the new locator is null, we skip the step rather than crashing.
 */
export async function prompt(page: Page, instruction: string, data?: string) {
  // Grab the full HTML from the page
  const fullHTML = await page.content();

  // 1️⃣ Retrieve a cached or newly generated locator
  const locator = await getCachedLocator(instruction, fullHTML);

  if (!locator) {
    console.error(`❌ GPT returned null for prompt "${instruction}". Skipping step.`);
    return;
  }

  // 2️⃣ Validate or re-try if needed
  const validated = await waitForCachedSelector(page, instruction, fullHTML, locator);
  if (!validated) {
    console.error(`❌ Could not validate locator for prompt "${instruction}". Skipping step.`);
    return;
  }

  // 3️⃣ Interpret GPT "action"
  const action = (validated.action || '').toLowerCase();

  switch (true) {
    case action === 'fill':
      console.log(`👉 Attempting to fill: "${validated.selector}" for prompt: "${instruction}"`);
      await page.fill(validated.selector, data || '');
      break;

    case action === 'click':
      console.log(`👉 Attempting to click: "${validated.selector}" for prompt: "${instruction}"`);
      await page.click(validated.selector);
      break;

    case action.startsWith('select'):
      console.log(`👉 Attempting to select: "${validated.selector}" for prompt: "${instruction}"`);

      if (!data) {
        throw new Error(`No data provided for select action in prompt "${instruction}"`);
      }
      await page.selectOption(validated.selector, { label: data });
      break;

    default:
      console.warn(`⚠️ Unrecognized GPT action "${validated.action}" for "${instruction}".`);
      break;
  }

  // Short pause
  await page.waitForTimeout(500);
}

/** Return how many GPT API calls were made this run. */
export function getGptCallCount() {
  return gptCallCount;
}
