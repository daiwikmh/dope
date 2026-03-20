import { tool } from "ai";
import { z } from "zod";
import type { OnchainData } from "../../sample-data";

export function createOnchainTools(data: OnchainData) {
  return {
    getTransactionHistory: tool({
      description: "Get daily transaction count and token velocity metrics",
      inputSchema: z.object({}),
      execute: async () => ({
        dailyTransactions: data.dailyTransactions,
        tokenVelocity: data.tokenVelocity,
        contractAge: data.contractAge,
        totalSupply: data.totalSupply,
      }),
    }),

    checkTokenConcentration: tool({
      description: "Check token holder distribution and concentration risk",
      inputSchema: z.object({}),
      execute: async () => ({
        top10HoldersPercent: data.top10HoldersPercent,
        holders: data.tokenHolders,
        concentrationRisk:
          data.top10HoldersPercent > 80
            ? "critical"
            : data.top10HoldersPercent > 60
              ? "high"
              : data.top10HoldersPercent > 40
                ? "moderate"
                : "low",
      }),
    }),

    checkProtocolHealth: tool({
      description: "Check protocol uptime and operational health",
      inputSchema: z.object({}),
      execute: async () => ({
        uptimePercent: data.uptimePercent,
        status: data.uptimePercent > 99.5 ? "healthy" : data.uptimePercent > 95 ? "degraded" : "critical",
      }),
    }),

    computeEntropy: tool({
      description: "Compute distribution entropy of token holders to measure decentralization",
      inputSchema: z.object({}),
      execute: async () => {
        const percentages = data.tokenHolders.map((h) => h.percentage / 100);
        const entropy = percentages.reduce((sum, p) => {
          if (p <= 0) return sum;
          return sum - p * Math.log2(p);
        }, 0);
        const maxEntropy = Math.log2(data.tokenHolders.length || 1);
        return {
          entropy: Math.round(entropy * 1000) / 1000,
          maxEntropy: Math.round(maxEntropy * 1000) / 1000,
          normalizedEntropy: maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 1000) / 1000 : 0,
        };
      },
    }),
  };
}
