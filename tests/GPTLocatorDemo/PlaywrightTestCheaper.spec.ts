import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function that sends one prompt to GPT to return all three locators
async function getLoginLocators(htmlSnippet: string) {
  const prompt = `Given the following HTML snippet from a login page, return a JSON object with three keys: "username", "password", and "login". Each key's value should be an object with two properties:
- "action": "fill" for input fields and "click" for buttons.
- "selector": a CSS selector that uniquely identifies the element.

HTML snippet:
${htmlSnippet}

Output JSON should be exactly in the following format:
{
  "username": { "action": "fill", "selector": "#user-name" },
  "password": { "action": "fill", "selector": "#password" },
  "login": { "action": "click", "selector": "#login-button" }
}
Do not output any additional text or explanation, only valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // using the cheaper model
      messages: [
        { role: "system", content: "You are an assistant that returns only valid JSON." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0,
    });

    const messageContent = response.choices[0].message?.content;
    if (!messageContent) {
      throw new Error("No content returned from OpenAI API");
    }
    const jsonResponse = messageContent.trim();
    return JSON.parse(jsonResponse);
  } catch (error) {
    console.error("Error from OpenAI API:", error);
    return null;
  }
}

test('CSV Data-Driven Test (Single GPT Call for Login Locators)', async ({ page }) => {
  // Read CSV data from file
  const csvData = parse(fs.readFileSync('data/testData.csv'), {
    columns: true,
    skip_empty_lines: true,
  });

  for (const row of csvData) {
    console.log(`Testing with: ${row.username}, ${row.password}`);
    // Open the SauceDemo login page
    await page.goto('https://www.saucedemo.com/');
    // Get the full HTML content from the page
    const htmlSnippet = await page.content();

    // Get all three locators with one GPT API call
    const locators = await getLoginLocators(htmlSnippet);
    console.log("GPT-suggested locators:", locators);

    if (locators) {
      if (locators.username?.action === "fill") {
        await page.fill(locators.username.selector, row.username);
      }
      if (locators.password?.action === "fill") {
        await page.fill(locators.password.selector, row.password);
      }
      if (locators.login?.action === "click") {
        await page.click(locators.login.selector);
      }
    }

    // Validate successful login
    await expect(page.locator('.title')).toHaveText('Products');
    console.log(`Login successful for: ${row.username}`);
  }
});
