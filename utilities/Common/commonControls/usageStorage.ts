// usageStorage.ts
import * as fs from "fs";
import * as path from "path";
import { DateUsageLog } from "./usageTypes";

// 1. Path to the JSON file where usage data is stored
const USAGE_LOG_FILE = path.join(__dirname, "usageLog.json");

/**
 * loadDateUsageLog: loads the usage log from a JSON file if it exists.
 * If file doesn't exist or can't be parsed, returns an empty log object.
 */
export function loadDateUsageLog(): DateUsageLog {
  if (!fs.existsSync(USAGE_LOG_FILE)) {
    return {};
  }

  try {
    const fileData = fs.readFileSync(USAGE_LOG_FILE, "utf8");
    const parsed: DateUsageLog = JSON.parse(fileData);
    return parsed;
  } catch (error) {
    console.error("Error reading or parsing usageLog.json:", error);
    return {};
  }
}

/**
 * saveDateUsageLog: writes the current dateUsageLog to the JSON file.
 */
export function saveDateUsageLog(dateUsageLog: DateUsageLog): void {
  try {
    fs.writeFileSync(USAGE_LOG_FILE, JSON.stringify(dateUsageLog, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing usageLog.json:", error);
  }
}
