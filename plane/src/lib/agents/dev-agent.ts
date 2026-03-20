import { llmCall, parseJSON } from "../ai";
import type { LayerAnalysis } from "../schemas";
import type { GithubData } from "../sample-data";

export async function analyzeDevelopment(data: GithubData): Promise<LayerAnalysis> {
  const system = `You are a software development analyst evaluating DePIN/public goods projects. Your role is to objectively assess development health and flag red flags like zombie repos, fake activity, copy-paste codebases, or single-contributor dependency. Do NOT make funding recommendations — just report what the data shows. Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.`;

  const prompt = `Analyze these GitHub metrics and return a JSON object:

- Commits (90d): ${data.commitsLast90Days}, last commit: ${data.lastCommitDaysAgo} days ago
- Contributors: ${data.contributors}, top contributor: ${data.topContributorPercent}%
- Stars: ${data.stars}, forks: ${data.forks}
- Open issues: ${data.openIssues}, avg response: ${data.avgIssueResponseHours}h
- Repo: ${data.repoName}

A project with high stars but very low recent activity is a major red flag ("zombie repo").

Return this exact JSON structure:
{"layer":"development","score":<0-100>,"summary":"<one paragraph>","signals":[{"text":"<signal>","severity":"low|medium|high|critical","source":"<source>","confidence":<0-1>}]}

Produce 3-6 signals. Score 0-100 where 100 is perfectly healthy.`;

  const raw = await llmCall(system, prompt);
  return parseJSON<LayerAnalysis>(raw);
}
