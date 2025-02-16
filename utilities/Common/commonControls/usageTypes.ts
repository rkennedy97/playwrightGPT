// usageTypes.ts

export interface UsageTotals {
    promptTokens: number;
    completionTokens: number;
    apiCalls: number;
  }
  
  export interface DateUsageLog {
    [date: string]: {
      gpt35: UsageTotals;
      gpt4: UsageTotals;
    };
  }
  