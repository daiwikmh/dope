import { llmCall, parseJSON } from "../ai";
import type { ProjectFields } from "./registry";

export async function parseSkillMd(content: string): Promise<ProjectFields> {
  const raw = await llmCall(
    "You extract structured project metadata from skill.md or project description documents. Respond ONLY with valid JSON.",
    `Extract project fields from this document. Return JSON with these fields (use null for fields not found):

{"name":"<project name>","githubUrl":"<full github repo URL or null>","twitterHandle":"<twitter handle without @ or null>","tokenAddress":"<primary token/contract address or null>","chain":"<blockchain network or null>","contracts":[{"label":"<descriptive label>","address":"<contract address>","chain":"<chain>"}],"governanceSpace":"<snapshot space e.g. project.eth or null>"}

Rules:
- Extract the project/protocol name from the title or first heading
- Look for GitHub links in any format and return the full repo URL
- For Twitter, strip the @ prefix if present
- For contracts, extract all mentioned contract/token addresses with labels
- If no contracts found, return empty array
- For governance, look for Snapshot space identifiers

Document:
${content}`
  );

  return parseJSON<ProjectFields>(raw);
}
