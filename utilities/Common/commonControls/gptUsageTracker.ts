// usageTracker.ts
import { loadDateUsageLog, saveDateUsageLog } from "./usageStorage";
import { DateUsageLog, UsageTotals } from "./usageTypes";

// Keep the log in a module-level variable (in-memory).
let dateUsageLog: DateUsageLog = loadDateUsageLog(); // Load on startup

// Utility: get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * accumulateUsage: accumulates usage stats for either GPT-3.5 or GPT-4, stored by date.
 * After updating, we save the entire dateUsageLog to disk.
 */
export function accumulateUsage(usage: any, model: "3.5" | "4") {
  if (!usage) return;

  const dateKey = getTodayDateString();

  // Initialize daily usage log for this date if missing
  if (!dateUsageLog[dateKey]) {
    dateUsageLog[dateKey] = {
      gpt35: { promptTokens: 0, completionTokens: 0, apiCalls: 0 },
      gpt4: { promptTokens: 0, completionTokens: 0, apiCalls: 0 }
    };
  }

  // Depending on the model, pick the correct totals sub-object
  if (model === "3.5") {
    dateUsageLog[dateKey].gpt35.promptTokens += (usage.prompt_tokens || 0);
    dateUsageLog[dateKey].gpt35.completionTokens += (usage.completion_tokens || 0);
    dateUsageLog[dateKey].gpt35.apiCalls++;
  } else {
    dateUsageLog[dateKey].gpt4.promptTokens += (usage.prompt_tokens || 0);
    dateUsageLog[dateKey].gpt4.completionTokens += (usage.completion_tokens || 0);
    dateUsageLog[dateKey].gpt4.apiCalls++;
  }

  // Save to disk after each update
  saveDateUsageLog(dateUsageLog);
}

/**
 * printTestCost: prints the cost of a single GPT usage instance (prompt + completion)
 * right after a test is finished. 
 * Pass the same usage object you send to `accumulateUsage`, along with the model and test name.
 */
export function printTestCost(
  usage: { prompt_tokens?: number; completion_tokens?: number },
  model: "3.5" | "4",
  testName?: string
) {
  if (!usage) return;

  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;

  // Calculate cost based on model
  let costPrompt = 0;
  let costCompletion = 0;

  if (model === "3.5") {
    costPrompt = (promptTokens / 1000) * 0.0015;   // $0.0015 / 1K prompt
    costCompletion = (completionTokens / 1000) * 0.002; // $0.002 / 1K completion
  } else {
    costPrompt = (promptTokens / 1000) * 0.03;   // $0.03 / 1K prompt
    costCompletion = (completionTokens / 1000) * 0.06; // $0.06 / 1K completion
  }

  const totalCost = costPrompt + costCompletion;

  // Print a quick summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔎 TEST USAGE SUMMARY (${testName || "Unnamed Test"})`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`• Model: GPT-${model}`);
  console.log(`  - Prompt tokens:      ${promptTokens}`);
  console.log(`  - Completion tokens:  ${completionTokens}`);
  console.log(`  - Estimated cost:     $${totalCost.toFixed(4)}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

/**
 * printWeeklySummary: sums usage from the last 7 days and prints the totals + cost.
 */
export function printWeeklySummary() {
  const last7Dates = getDateRangeLastNDays(1);

  let total35: UsageTotals = { promptTokens: 0, completionTokens: 0, apiCalls: 0 };
  let total4: UsageTotals = { promptTokens: 0, completionTokens: 0, apiCalls: 0 };

  // Sum usage for each of the last 7 days
  for (const day of last7Dates) {
    if (dateUsageLog[day]) {
      const { gpt35, gpt4 } = dateUsageLog[day];
      total35.promptTokens += gpt35.promptTokens;
      total35.completionTokens += gpt35.completionTokens;
      total35.apiCalls += gpt35.apiCalls;

      total4.promptTokens += gpt4.promptTokens;
      total4.completionTokens += gpt4.completionTokens;
      total4.apiCalls += gpt4.apiCalls;
    }
  }

  // Calculate costs for GPT-3.5
  const cost35Prompt = (total35.promptTokens / 1000) * 0.0015;
  const cost35Completion = (total35.completionTokens / 1000) * 0.002;
  const totalCost35 = cost35Prompt + cost35Completion;

  // Calculate costs for GPT-4
  const cost4Prompt = (total4.promptTokens / 1000) * 0.03;
  const cost4Completion = (total4.completionTokens / 1000) * 0.06;
  const totalCost4 = cost4Prompt + cost4Completion;

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧮 GPT USAGE SUMMARY (Today)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // GPT-3.5
  console.log(`• GPT-3.5 calls:             ${total35.apiCalls}`);
  console.log(`  - Prompt tokens (3.5):     ${total35.promptTokens}`);
  console.log(`  - Completion tokens (3.5): ${total35.completionTokens}`);
  console.log(`  - Estimated cost (3.5):    $${totalCost35.toFixed(4)}`);

  // GPT-4
  console.log(`\n• GPT-4 calls:               ${total4.apiCalls}`);
  console.log(`  - Prompt tokens (4):       ${total4.promptTokens}`);
  console.log(`  - Completion tokens (4):   ${total4.completionTokens}`);
  console.log(`  - Estimated cost (4):      $${totalCost4.toFixed(4)}`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

/**
 * printAllTimeSummary: sums usage across *all recorded dates* and prints the totals + cost.
 */
export function printAllTimeSummary() {
  let total35: UsageTotals = { promptTokens: 0, completionTokens: 0, apiCalls: 0 };
  let total4: UsageTotals = { promptTokens: 0, completionTokens: 0, apiCalls: 0 };

  for (const dateKey of Object.keys(dateUsageLog)) {
    const { gpt35, gpt4 } = dateUsageLog[dateKey];
    total35.promptTokens += gpt35.promptTokens;
    total35.completionTokens += gpt35.completionTokens;
    total35.apiCalls += gpt35.apiCalls;

    total4.promptTokens += gpt4.promptTokens;
    total4.completionTokens += gpt4.completionTokens;
    total4.apiCalls += gpt4.apiCalls;
  }

  // Calculate costs
  const cost35Prompt = (total35.promptTokens / 1000) * 0.0015;
  const cost35Completion = (total35.completionTokens / 1000) * 0.002;
  const totalCost35 = cost35Prompt + cost35Completion;

  const cost4Prompt = (total4.promptTokens / 1000) * 0.03;
  const cost4Completion = (total4.completionTokens / 1000) * 0.06;
  const totalCost4 = cost4Prompt + cost4Completion;

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧮 GPT USAGE SUMMARY (ALL TIME)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // GPT-3.5
  console.log(`• GPT-3.5 calls:             ${total35.apiCalls}`);
  console.log(`  - Prompt tokens (3.5):     ${total35.promptTokens}`);
  console.log(`  - Completion tokens (3.5): ${total35.completionTokens}`);
  console.log(`  - Estimated cost (3.5):    $${totalCost35.toFixed(4)}`);

  // GPT-4
  console.log(`\n• GPT-4 calls:               ${total4.apiCalls}`);
  console.log(`  - Prompt tokens (4):       ${total4.promptTokens}`);
  console.log(`  - Completion tokens (4):   ${total4.completionTokens}`);
  console.log(`  - Estimated cost (4):      $${totalCost4.toFixed(4)}`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// Helper to get an array of date strings for the last N days
function getDateRangeLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  return dates;
}
