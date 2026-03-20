import { tool } from "ai";
import { z } from "zod";
import type { GithubData } from "../../sample-data";

export function createDevTools(data: GithubData) {
  return {
    getRepoStats: tool({
      description: "Get repository overview stats (stars, forks, issues)",
      inputSchema: z.object({}),
      execute: async () => ({
        repoName: data.repoName,
        stars: data.stars,
        forks: data.forks,
        openIssues: data.openIssues,
        avgIssueResponseHours: data.avgIssueResponseHours,
      }),
    }),

    getRecentCommits: tool({
      description: "Get recent commit activity and velocity metrics",
      inputSchema: z.object({}),
      execute: async () => ({
        commitsLast90Days: data.commitsLast90Days,
        lastCommitDaysAgo: data.lastCommitDaysAgo,
        isZombieRepo: data.commitsLast90Days < 10 && data.stars > 500,
      }),
    }),

    getContributorActivity: tool({
      description: "Get contributor distribution and bus factor analysis",
      inputSchema: z.object({}),
      execute: async () => ({
        contributors: data.contributors,
        topContributorPercent: data.topContributorPercent,
        busFactor: data.topContributorPercent > 80 ? 1 : data.topContributorPercent > 50 ? 2 : data.contributors,
        riskLevel:
          data.topContributorPercent > 80
            ? "critical"
            : data.topContributorPercent > 60
              ? "high"
              : "moderate",
      }),
    }),
  };
}
