import OpenAI from "openai";
import dotenv from "dotenv";
import { accumulateUsage } from "./gptUsageTracker";

dotenv.config();

// Create a single OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Use GPT-3.5-turbo (more cost-effective).
 */
export async function getLocatorFromGPT3_5(action: string, htmlSnippet: string) {
  const prompt = `Find the best Playwright locator for the following action: "${action}".
Here is the HTML snippet:
${htmlSnippet}

Return the result as a JSON object with two properties:
{
  "action": "fill" | "click" | ...,
  "selector": "the locator string"
}`;

  try {
    console.log(`🔎 [GPT-3.5] Searching locator for: "${action}"...`);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an assistant that returns JSON describing Playwright locators. Only output a single valid JSON object with keys 'action' and 'selector'.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0,
    });

    // Accumulate usage
    accumulateUsage(response.usage, "3.5");

    console.log(`✅ [GPT-3.5] Locator found for: "${action}"`);

    const messageContent = response.choices[0].message?.content;
    if (!messageContent) {
      throw new Error("No content returned from OpenAI API (3.5).");
    }

    return JSON.parse(messageContent.trim());
  } catch (error) {
    console.error("❌ [GPT-3.5] Error:", error);
    return null;
  }
}

/**
 * Use GPT-4 (more expensive, but potentially more capable).
 */
export async function getLocatorFromGPT4(action: string, htmlSnippet: string) {
  const prompt = `Find the best Playwright locator for the following action: "${action}".
Here is the HTML snippet:
${htmlSnippet}

Return the result as a JSON object with two properties:
{
  "action": "fill" | "click" | ...,
  "selector": "the locator string"
}`;

  try {
    console.log(`🤖 [GPT-4] Searching locator for: "${action}"...`);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
    You are an assistant that returns JSON describing valid Playwright locators. 
    Only output a single valid JSON object with keys "action" and "selector". 
    
    Guidelines:
    1. The "selector" must be valid in Playwright (CSS, text=, role=, :has(), :has-text(), etc.).
    2. Do NOT produce syntax like "closest('tr')" or other non-standard chain selectors.
    3. If you want to reference a row with text "Foo", use something like "tr:has-text('Foo')" then "text='edit'" inside it, or build a two-step approach. 
    4. We only accept a single JSON object with "action" and "selector".`
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0,
    });
    

    // Accumulate usage
    accumulateUsage(response.usage, "4");

    console.log(`✅ [GPT-4] Locator found for: "${action}"`);

    const messageContent = response.choices[0].message?.content;
    if (!messageContent) {
      throw new Error("No content returned from OpenAI API (GPT-4).");
    }

    return JSON.parse(messageContent.trim());
  } catch (error) {
    console.error("❌ [GPT-4] Error:", error);
    return null;
  }
}
