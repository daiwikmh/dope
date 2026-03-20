import { tool } from "ai";
import { z } from "zod";
import type { GovernanceData } from "../../sample-data";

export function createGovernanceTools(data: GovernanceData) {
  return {
    getProposals: tool({
      description: "Get recent proposals with pass rates and turnout",
      inputSchema: z.object({}),
      execute: async () => ({
        totalProposals: data.totalProposals,
        proposalPassRate: data.proposalPassRate,
        recentProposals: data.recentProposals,
        rubberStampRisk: data.proposalPassRate > 90 && data.avgVoterTurnout < 10,
      }),
    }),

    getVoterDistribution: tool({
      description: "Analyze voter concentration and whale dominance",
      inputSchema: z.object({}),
      execute: async () => ({
        top5VotersPercent: data.top5VotersPercent,
        avgVoterTurnout: data.avgVoterTurnout,
        avgTimeToQuorumHours: data.avgTimeToQuorumHours,
        whaleCapture: data.top5VotersPercent > 80,
        apathyLevel:
          data.avgVoterTurnout < 5
            ? "critical"
            : data.avgVoterTurnout < 15
              ? "high"
              : data.avgVoterTurnout < 30
                ? "moderate"
                : "healthy",
      }),
    }),

    checkDecentralizationTheater: tool({
      description: "Detect signs of decentralization theater — governance that looks democratic but is captured",
      inputSchema: z.object({}),
      execute: async () => {
        const failedProposals = data.recentProposals.filter((p) => !p.passed);
        const passedProposals = data.recentProposals.filter((p) => p.passed);

        return {
          indicators: {
            highPassRate: data.proposalPassRate > 90,
            lowTurnout: data.avgVoterTurnout < 10,
            whaleDominance: data.top5VotersPercent > 80,
            fastQuorum: data.avgTimeToQuorumHours < 4,
            communityProposalsFail:
              failedProposals.length > 0 &&
              failedProposals.every(
                (p) => p.turnout > (passedProposals[0]?.turnout ?? 0)
              ),
          },
          riskScore:
            (data.proposalPassRate > 90 ? 25 : 0) +
            (data.avgVoterTurnout < 10 ? 25 : 0) +
            (data.top5VotersPercent > 80 ? 25 : 0) +
            (data.avgTimeToQuorumHours < 4 ? 25 : 0),
        };
      },
    }),
  };
}
