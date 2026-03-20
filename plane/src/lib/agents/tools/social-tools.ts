import { tool } from "ai";
import { z } from "zod";
import type { SocialData } from "../../sample-data";

export function createSocialTools(data: SocialData) {
  return {
    getFollowerStats: tool({
      description: "Get follower count, engagement rate, and bot likelihood",
      inputSchema: z.object({}),
      execute: async () => ({
        twitterFollowers: data.twitterFollowers,
        avgEngagementRate: data.avgEngagementRate,
        botLikelihoodPercent: data.botLikelihoodPercent,
        authenticFollowersEstimate: Math.round(
          data.twitterFollowers * (1 - data.botLikelihoodPercent / 100)
        ),
      }),
    }),

    searchMentions: tool({
      description: "Get recent mentions with sentiment analysis",
      inputSchema: z.object({}),
      execute: async () => ({
        sentimentScore: data.sentimentScore,
        mentions: data.recentMentions,
        sentimentBreakdown: {
          positive: data.recentMentions.filter((m) => m.sentiment === "positive").length,
          negative: data.recentMentions.filter((m) => m.sentiment === "negative").length,
          neutral: data.recentMentions.filter((m) => m.sentiment === "neutral").length,
        },
      }),
    }),

    getCommunityComplaints: tool({
      description: "Get clustered community complaints and pain points",
      inputSchema: z.object({}),
      execute: async () => ({
        complaints: data.communityComplaints,
        totalComplaints: data.communityComplaints.length,
      }),
    }),

    detectBots: tool({
      description: "Analyze bot/inauthentic activity patterns",
      inputSchema: z.object({}),
      execute: async () => ({
        botLikelihoodPercent: data.botLikelihoodPercent,
        riskLevel:
          data.botLikelihoodPercent > 30
            ? "high"
            : data.botLikelihoodPercent > 15
              ? "moderate"
              : "low",
        estimatedRealEngagement:
          data.avgEngagementRate * (1 - data.botLikelihoodPercent / 100),
      }),
    }),
  };
}
