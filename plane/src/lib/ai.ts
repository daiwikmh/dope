import { createOpenAI } from "@ai-sdk/openai";

export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

export const model = openrouter("nvidia/nemotron-3-super-120b-a12b:free");

const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

// Round-robin key pool
let callIndex = 0;
function getApiKey(): string {
  const keys = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_API_KEY_2,
  ].filter(Boolean) as string[];

  if (keys.length === 0) throw new Error("No OPENROUTER_API_KEY set");
  const key = keys[callIndex % keys.length];
  callIndex++;
  return key;
}

// Raw OpenRouter fetch for models that don't support structured output
export async function llmCall(
  system: string,
  prompt: string
): Promise<string> {
  const apiKey = getApiKey();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://integrity-score.app",
      "X-Title": "Integrity Score Agent",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(180000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");

  return content;
}

// Parse JSON from LLM response (handles markdown code blocks)
export function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
