import { llmCall, parseJSON } from "../ai";
import type { IdeaValidationResult } from "../schemas";

interface ProjectSummary {
  name: string;
  integrityScore: number;
  verdict: string;
  executiveSummary: string;
  layerScores: Record<string, number>;
}

export async function validateIdea(input: {
  ideaDescription: string;
  existingProjects: ProjectSummary[];
}): Promise<IdeaValidationResult> {
  const { ideaDescription, existingProjects } = input;

  const projectList = existingProjects
    .map(
      (p) =>
        `- "${p.name}" | Score: ${p.integrityScore} | Verdict: ${p.verdict} | Layers: ${JSON.stringify(p.layerScores)} | ${p.executiveSummary}`
    )
    .join("\n");

  const raw = await llmCall(
    "You analyze new project ideas against existing evaluated DePIN/public goods projects. Respond ONLY with valid JSON.",
    `A user has a new project idea and wants to validate it against existing evaluated projects.

IDEA:
${ideaDescription}

EXISTING EVALUATED PROJECTS:
${projectList || "(no projects evaluated yet)"}

Analyze the idea and return JSON:
{
  "ideaSummary": "<one-sentence restatement of the idea>",
  "viabilityScore": <0-100, how viable this idea is given the landscape>,
  "similarProjects": [
    {
      "name": "<existing project name>",
      "integrityScore": <their score>,
      "relevance": "<why this project is relevant to the idea>",
      "strengthsToLearnFrom": ["<strength 1>", "<strength 2>"],
      "weaknessesToAvoid": ["<weakness 1>"]
    }
  ],
  "gaps": ["<market/technical gap the idea could fill>"],
  "opportunities": ["<opportunity based on existing landscape>"],
  "risks": ["<risk or challenge the idea faces>"],
  "recommendation": "<2-3 sentence objective assessment>"
}

Rules:
- Include only genuinely similar/relevant projects (max 5)
- If no projects exist yet, still provide a viability assessment based on the idea alone
- Be objective, flag real risks, do not hype
- Gaps and opportunities should reference what existing projects lack`
  );

  return parseJSON<IdeaValidationResult>(raw);
}
