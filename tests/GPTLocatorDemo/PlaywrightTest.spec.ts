import { test, expect, Page } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import { getLocatorFromGPT3_5 } from '../../utilities/Common/commonControls/commonControls';

const cacheFilePath = './gptCache.json';
let gptCallCount = 0; // Counter for actual GPT API calls

function loadCache(): Map<string, any> {
  if (fs.existsSync(cacheFilePath)) {
    const data = fs.readFileSync(cacheFilePath, 'utf-8');
    const obj = JSON.parse(data);
    return new Map(Object.entries(obj));
  } else {
    return new Map();
  }
}

function saveCache(cache: Map<string, any>) {
  const obj = Object.fromEntries(cache);
  fs.writeFileSync(cacheFilePath, JSON.stringify(obj, null, 2));
}

const gptCache = loadCache();

async function getCachedLocator(prompt: string, html: string) {
  const cacheKey = prompt + html.substring(0, 200);
  if (gptCache.has(cacheKey)) {
    console.log("Returning cached GPT response for prompt:", prompt);
    return gptCache.get(cacheKey);
  }
  gptCallCount++;
  const result = await getLocatorFromGPT3_5(prompt, html);
  gptCache.set(cacheKey, result);
  saveCache(gptCache);
  return result;
}

// Helper that waits for the cached locator's selector using a short timeout.
// If not found within the timeout, it clears the cache and re-queries GPT.
async function waitForCachedSelector(
  page: Page,
  prompt: string,
  htmlSnippet: string,
  cachedLocator: any,
  timeout = 1000
) {
  try {
    await page.waitForSelector(cachedLocator.selector, { timeout });
    return cachedLocator;
  } catch (error) {
    console.log(`Cached locator ${cachedLocator.selector} not found within ${timeout}ms for prompt: ${prompt}. Retrying GPT search.`);
    const cacheKey = prompt + htmlSnippet.substring(0, 200);
    gptCache.delete(cacheKey);
    saveCache(gptCache);
    const newLocator = await getCachedLocator(prompt, htmlSnippet);
    return newLocator;
  }
}

test.setTimeout(200_000);

test('CSV Data-Driven Test with Full HTML Content, Persistent Caching, and 2s Selector Timeout', async ({ page }) => {
  const csvData = parse(fs.readFileSync('data/testData.csv'), {
    columns: true,
    skip_empty_lines: true,
  });

  for (const row of csvData) {
    console.log(`Testing with: ${row.username}, ${row.password}`);

    // --- LOGIN STEP ---
    await page.goto('https://www.saucedemo.com/');
    await page.waitForTimeout(1000);
    const loginHtmlSnippet = await page.content();

    const userNamePrompt = "fill username";
    const passwordPrompt = "fill password";
    const loginButtonPrompt = "click login button The login button is an <input> element, not a <button>";

    const userNameLocator = await getCachedLocator(userNamePrompt, loginHtmlSnippet);
    console.log("Cached GPT-suggested username locator:", userNameLocator);
    const passwordLocator = await getCachedLocator(passwordPrompt, loginHtmlSnippet);
    console.log("Cached GPT-suggested password locator:", passwordLocator);
    const loginLocator = await getCachedLocator(loginButtonPrompt, loginHtmlSnippet);
    console.log("Cached GPT-suggested login button locator:", loginLocator);

    if (userNameLocator?.action === "fill") {
      const validatedUserNameLocator = await waitForCachedSelector(page, userNamePrompt, loginHtmlSnippet, userNameLocator);
      await page.fill(validatedUserNameLocator.selector, row.username);
      await page.waitForTimeout(1000);
    }
    if (passwordLocator?.action === "fill") {
      const validatedPasswordLocator = await waitForCachedSelector(page, passwordPrompt, loginHtmlSnippet, passwordLocator);
      await page.fill(validatedPasswordLocator.selector, row.password);
      await page.waitForTimeout(1000);
    }
    if (loginLocator?.action === "click") {
      const validatedLoginLocator = await waitForCachedSelector(page, loginButtonPrompt, loginHtmlSnippet, loginLocator);
      await page.click(validatedLoginLocator.selector);
      await page.waitForTimeout(1000);
    }

    await expect(page.locator('.title')).toHaveText('Products');
    console.log(`Login successful for: ${row.username}`);
    await page.waitForTimeout(1000);

    // --- SORT PRODUCTS STEP ---
    const productsHtmlSnippet = await page.content();
    const sortPrompt = "select 'Price (low to high)'. The sort control is a <select> element.";
    const sortLocator = await getCachedLocator(sortPrompt, productsHtmlSnippet);
    console.log("Cached GPT-suggested sort locator:", sortLocator);

    if (sortLocator && sortLocator.action.toLowerCase().startsWith("select")) {
      const validatedSortLocator = await waitForCachedSelector(page, sortPrompt, productsHtmlSnippet, sortLocator);
      await page.selectOption(validatedSortLocator.selector, { label: "Price (low to high)" });
      console.log("Sorted products by Price (low to high).");
      await page.waitForTimeout(2000);
    } else {
      console.warn("Sort locator not returned as expected. Skipping sort step.");
    }
    
    // --- ADD-TO-CART STEP ---
    const addToCartHtmlSnippet = await page.content();

    const bikeLightPrompt = "click add to cart for Sauce Labs Bike Light";
    const bikeLightLocator = await getCachedLocator(bikeLightPrompt, addToCartHtmlSnippet);
    console.log("Cached GPT-suggested locator for Sauce Labs Bike Light:", bikeLightLocator);
    if (bikeLightLocator?.action === "click") {
      const validatedBikeLightLocator = await waitForCachedSelector(page, bikeLightPrompt, addToCartHtmlSnippet, bikeLightLocator);
      await page.click(validatedBikeLightLocator.selector);
      await page.waitForTimeout(1000);
    }

    const backpackPrompt = "click add to cart for Sauce Labs Backpack";
    const backpackLocator = await getCachedLocator(backpackPrompt, addToCartHtmlSnippet);
    console.log("Cached GPT-suggested locator for Sauce Labs Backpack:", backpackLocator);
    if (backpackLocator?.action === "click") {
      const validatedBackpackLocator = await waitForCachedSelector(page, backpackPrompt, addToCartHtmlSnippet, backpackLocator);
      await page.click(validatedBackpackLocator.selector);
      await page.waitForTimeout(1000);
    }

    const cartLinkPrompt = "click shopping cart link";
    const cartLinkLocator = await getCachedLocator(cartLinkPrompt, addToCartHtmlSnippet);
    console.log("Cached GPT-suggested shopping cart link locator:", cartLinkLocator);
    if (cartLinkLocator?.action === "click") {
      const validatedCartLinkLocator = await waitForCachedSelector(page, cartLinkPrompt, addToCartHtmlSnippet, cartLinkLocator);
      await page.click(validatedCartLinkLocator.selector);
      await page.waitForTimeout(1000);
    }

    await expect(page.locator('.cart_item')).toHaveCount(2);
    console.log("Both items are in the cart");
    await page.waitForTimeout(1000);

    // --- CHECKOUT STEP ---
    const cartHtmlSnippet = await page.content();
    const checkoutPrompt = "click checkout button";
    const checkoutLocator = await getCachedLocator(checkoutPrompt, cartHtmlSnippet);
    console.log("Cached GPT-suggested checkout button locator:", checkoutLocator);
    if (checkoutLocator?.action === "click") {
      const validatedCheckoutLocator = await waitForCachedSelector(page, checkoutPrompt, cartHtmlSnippet, checkoutLocator);
      await page.click(validatedCheckoutLocator.selector);
      await page.waitForTimeout(1000);
    }

    // --- CHECKOUT INFORMATION STEP ---
    const checkoutInfoHtmlSnippet = await page.content();
    const firstNamePrompt = "fill first name";
    const firstNameLocator = await getCachedLocator(firstNamePrompt, checkoutInfoHtmlSnippet);
    console.log("Cached GPT-suggested first name locator:", firstNameLocator);
    const lastNamePrompt = "fill last name";
    const lastNameLocator = await getCachedLocator(lastNamePrompt, checkoutInfoHtmlSnippet);
    console.log("Cached GPT-suggested last name locator:", lastNameLocator);
    const postalCodePrompt = "fill postal code";
    const postalCodeLocator = await getCachedLocator(postalCodePrompt, checkoutInfoHtmlSnippet);
    console.log("Cached GPT-suggested postal code locator:", postalCodeLocator);

    if (firstNameLocator?.action === "fill") {
      const validatedFirstNameLocator = await waitForCachedSelector(page, firstNamePrompt, checkoutInfoHtmlSnippet, firstNameLocator);
      await page.fill(validatedFirstNameLocator.selector, row.firstName);
      await page.waitForTimeout(1000);
    }
    if (lastNameLocator?.action === "fill") {
      const validatedLastNameLocator = await waitForCachedSelector(page, lastNamePrompt, checkoutInfoHtmlSnippet, lastNameLocator);
      await page.fill(validatedLastNameLocator.selector, row.lastName);
      await page.waitForTimeout(1000);
    }
    if (postalCodeLocator?.action === "fill") {
      const validatedPostalCodeLocator = await waitForCachedSelector(page, postalCodePrompt, checkoutInfoHtmlSnippet, postalCodeLocator);
      await page.fill(validatedPostalCodeLocator.selector, row.postalCode);
      await page.waitForTimeout(1000);
    }

    const continuePrompt = "click continue button The continue button is an <input> element, not a <button>";
    const continueLocator = await getCachedLocator(continuePrompt, checkoutInfoHtmlSnippet);
    console.log("Cached GPT-suggested continue button locator:", continueLocator);
    if (continueLocator?.action === "click") {
      const validatedContinueLocator = await waitForCachedSelector(page, continuePrompt, checkoutInfoHtmlSnippet, continueLocator);
      await page.click(validatedContinueLocator.selector);
      await page.waitForTimeout(1000);
    }

    // --- CHECKOUT OVERVIEW STEP ---
    const overviewHtmlSnippet = await page.content();
    const finishPrompt = "click finish button";
    const finishLocator = await getCachedLocator(finishPrompt, overviewHtmlSnippet);
    console.log("Cached GPT-suggested finish button locator:", finishLocator);
    if (finishLocator?.action === "click") {
      const validatedFinishLocator = await waitForCachedSelector(page, finishPrompt, overviewHtmlSnippet, finishLocator);
      await page.click(validatedFinishLocator.selector);
      await page.waitForTimeout(1000);
    }

    // --- ORDER CONFIRMATION STEP ---
    const confirmationHtmlSnippet = await page.content();
    const confirmationPrompt = "find order confirmation message element with text 'Thank you for your order!'";
    const confirmationLocator = await getCachedLocator(confirmationPrompt, confirmationHtmlSnippet);
    console.log("Cached GPT-suggested confirmation message locator:", confirmationLocator);
    const validatedConfirmationLocator = await waitForCachedSelector(page, confirmationPrompt, confirmationHtmlSnippet, confirmationLocator);
    await page.waitForSelector(validatedConfirmationLocator.selector, { timeout: 1000 });
    await expect(page.locator(validatedConfirmationLocator.selector)).toHaveText('Thank you for your order!');
    console.log("Order confirmation message is displayed");
    await page.waitForTimeout(1000);
  }
  console.log("Total GPT API calls made:", gptCallCount);
});
