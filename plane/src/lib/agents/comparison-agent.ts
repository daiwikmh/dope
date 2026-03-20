import { llmCall, parseJSON } from "../ai";
import type { ComparisonResult, IntegrityReport } from "../schemas";

export async function compareProjects(input: {
  projectA: { name: string; report: IntegrityReport };
  projectB: { name: string; report: IntegrityReport };
  scenario: string;
}): Promise<ComparisonResult> {
  const { projectA, projectB, scenario } = input;

  const raw = await llmCall(
    "You are comparing two DePIN/public goods projects. Respond ONLY with valid JSON.",
    `Compare these projects for scenario "${scenario}":

PROJECT A: "${projectA.name}" — Score: ${projectA.report.integrityScore}, Verdict: ${projectA.report.verdict}
Layers: onchain=${projectA.report.layerScores.onchain}, dev=${projectA.report.layerScores.development}, social=${projectA.report.layerScores.social}, gov=${projectA.report.layerScores.governance}

PROJECT B: "${projectB.name}" — Score: ${projectB.report.integrityScore}, Verdict: ${projectB.report.verdict}
Layers: onchain=${projectB.report.layerScores.onchain}, dev=${projectB.report.layerScores.development}, social=${projectB.report.layerScores.social}, gov=${projectB.report.layerScores.governance}

Return JSON:
{"winnerId":"<name or null if tie>","winnerName":"<name or null>","reasoning":"<explanation>","scoreA":<0-100>,"scoreB":<0-100>,"dimensions":[{"name":"<dimension>","scoreA":<0-100>,"scoreB":<0-100>,"insight":"<brief>"}]}`
  );

  return parseJSON<ComparisonResult>(raw);
}
