import { llmCall, parseJSON } from "../ai";
import type { LayerAnalysis } from "../schemas";
import type { SocialData } from "../sample-data";

export async function analyzeSocial(data: SocialData): Promise<LayerAnalysis> {
  const system = `You are a community sentiment analyst evaluating DePIN/public goods projects. Your role is to objectively assess community health and flag suspicious patterns like bot farms, astroturfing, censored criticism, or manufactured engagement. Do NOT make funding recommendations — just report what the data shows. Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.`;

  const prompt = `Analyze this social data and return a JSON object:

- Followers: ${data.twitterFollowers}, engagement: ${data.avgEngagementRate}%
- Sentiment: ${data.sentimentScore}/1.0
- Bot likelihood: ${data.botLikelihoodPercent}%
- Complaints: ${data.communityComplaints.map((c) => `"${c}"`).join(", ")}
- Recent mentions: ${data.recentMentions.map((m) => `[${m.sentiment}] "${m.text}"`).join(" | ")}

Focus on disconnect between official messaging and user experience.

Return this exact JSON structure:
{"layer":"social","score":<0-100>,"summary":"<one paragraph>","signals":[{"text":"<signal>","severity":"low|medium|high|critical","source":"<source>","confidence":<0-1>}]}

Produce 4-8 signals. Score 0-100 where 100 is perfectly healthy.`;

  const raw = await llmCall(system, prompt);
  return parseJSON<LayerAnalysis>(raw);
}
