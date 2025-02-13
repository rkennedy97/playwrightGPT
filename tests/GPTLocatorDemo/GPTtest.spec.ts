// tests/GPTTest.spec.ts
import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import { prompt, getGptCallCount, setCacheFileName } from '../../utilities/Common/commonControls/gptLib';

interface CSVDataRow {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  postalCode: string;
}

// Load CSV data
const csvData: CSVDataRow[] = parse(fs.readFileSync('data/testData.csv'), {
  columns: true,
  skip_empty_lines: true,
}) as CSVDataRow[];

// ✅ Set a SINGLE cache file for all tests in this suite
setCacheFileName('./prompts/gptCache_purchaseFlow.json');

test.describe.parallel('Purchase Flow Tests', () => {
  csvData.forEach((row, index) => {
    test(`Purchase flow for ${row.username} (${index + 1})`, async ({ page }) => {
      // 1) Navigate to the site
      await page.goto('https://www.saucedemo.com/');
      await page.waitForTimeout(1000);

      // 2) Login
      await prompt(page, "fill username", row.username);
      await prompt(page, "fill password", row.password);
      await prompt(page, "click login button The login button is an <input> element, not a <button>");
      await expect(page.locator('.title')).toHaveText('Products');
      await page.waitForTimeout(500);

      // 3) Sort products
      await prompt(page, "select 'Price (low to high)'. The sort control is a <select> element.", "Price (low to high)");

      // 4) Add to cart
      await prompt(page, "click add to cart for Sauce Labs Bike Light");
      await prompt(page, "click add to cart for Sauce Labs Backpack");
      await prompt(page, "click shopping cart link");
      await expect(page.locator('.cart_item')).toHaveCount(2);

      // 5) Checkout
      await prompt(page, "click checkout button");
      await prompt(page, "fill first name", row.firstName);
      await prompt(page, "fill last name", row.lastName);
      await prompt(page, "fill postal code", row.postalCode);
      await prompt(page, "click continue button The continue button is an <input> element, not a <button>");
      await prompt(page, "click finish button");

      // 6) Verify confirmation
      await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
      console.log(`Purchase flow succeeded for user: ${row.username}\n`);
    });
  });
});

// ✅ Output GPT API calls after all tests complete
test.afterAll(() => {
  console.log(`Total GPT API calls made: ${getGptCallCount()}`);
});
