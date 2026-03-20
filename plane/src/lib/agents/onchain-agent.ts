import { llmCall, parseJSON } from "../ai";
import type { LayerAnalysis } from "../schemas";
import type { OnchainData } from "../sample-data";

export async function analyzeOnchain(data: OnchainData): Promise<LayerAnalysis> {
  const system = `You are an on-chain data analyst evaluating DePIN/public goods projects. Your role is to objectively assess on-chain health and flag potential scam indicators (rug pull patterns, wash trading, suspicious token distributions). Do NOT make funding recommendations — just report what the data shows. Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.`;

  const prompt = `Analyze these on-chain metrics and return a JSON object:

- Token concentration: top 10 holders own ${data.top10HoldersPercent}% of supply
- Network uptime: ${data.uptimePercent}%
- Daily transactions: ${data.dailyTransactions}, velocity: ${data.tokenVelocity}
- Contract age: ${data.contractAge} days
- Holders: ${JSON.stringify(data.tokenHolders)}

Return this exact JSON structure:
{"layer":"onchain","score":<0-100>,"summary":"<one paragraph>","signals":[{"text":"<signal>","severity":"low|medium|high|critical","source":"<source>","confidence":<0-1>}]}

Produce 3-6 signals. Score 0-100 where 100 is perfectly healthy.`;

  const raw = await llmCall(system, prompt);
  return parseJSON<LayerAnalysis>(raw);
}
