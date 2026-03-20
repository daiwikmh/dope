import { llmCall, parseJSON } from "../ai";
import type { LayerAnalysis } from "../schemas";
import type { GovernanceData } from "../sample-data";

export async function analyzeGovernance(data: GovernanceData): Promise<LayerAnalysis> {
  const system = `You are a governance analyst evaluating DePIN/public goods projects. Your role is to objectively assess governance health and flag decentralization theater, whale capture, rubber-stamping, or sham voting. Do NOT make funding recommendations — just report what the data shows. Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.`;

  const prompt = `Analyze this governance data and return a JSON object:

- Total proposals: ${data.totalProposals}
- Pass rate: ${data.proposalPassRate}%, avg turnout: ${data.avgVoterTurnout}%
- Top 5 voters control: ${data.top5VotersPercent}%
- Time to quorum: ${data.avgTimeToQuorumHours}h
- Recent: ${data.recentProposals.map((p) => `"${p.title}" ${p.passed ? "PASSED" : "FAILED"} (${p.turnout}% turnout)`).join(" | ")}

Look for whale capture, rubber-stamping, and governance theater.

Return this exact JSON structure:
{"layer":"governance","score":<0-100>,"summary":"<one paragraph>","signals":[{"text":"<signal>","severity":"low|medium|high|critical","source":"<source>","confidence":<0-1>}]}

Produce 3-6 signals. Score 0-100 where 100 is perfectly healthy.`;

  const raw = await llmCall(system, prompt);
  return parseJSON<LayerAnalysis>(raw);
}
