import OpenAI from "openai";
import dotenv from "dotenv";

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
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Cheaper model
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that returns JSON describing Playwright locators. Only output a single valid JSON object with keys 'action' and 'selector'.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0,
    });

    const messageContent = response.choices[0].message?.content;
    if (!messageContent) {
      throw new Error("No content returned from OpenAI API (3.5).");
    }

    const gptText = messageContent.trim();
    return JSON.parse(gptText);
  } catch (error) {
    console.error("Error from OpenAI API (3.5):", error);
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
    const response = await openai.chat.completions.create({
      model: "gpt-4", // More expensive model
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that returns JSON describing Playwright locators. Only output a single valid JSON object with keys 'action' and 'selector'.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0,
    });

    const messageContent = response.choices[0].message?.content;
    if (!messageContent) {
      throw new Error("No content returned from OpenAI API (GPT-4).");
    }

    const gptText = messageContent.trim();
    return JSON.parse(gptText);
  } catch (error) {
    console.error("Error from OpenAI API (GPT-4):", error);
    return null;
  }
}
