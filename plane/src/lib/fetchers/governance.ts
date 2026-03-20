import type { GovernanceData } from "../sample-data";

const SNAPSHOT_GRAPHQL = "https://hub.snapshot.org/graphql";

interface SnapshotProposal {
  title: string;
  state: string;
  scores_total: number;
  quorum: number;
  votes: number;
}

export async function fetchGovernanceData(
  space: string
): Promise<GovernanceData> {
  try {
    const query = `{
      proposals(
        where: { space_in: ["${space}"] }
        orderBy: "created"
        orderDirection: desc
        first: 30
      ) {
        title
        state
        scores_total
        quorum
        votes
      }
    }`;

    const res = await fetch(SNAPSHOT_GRAPHQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    const proposals: SnapshotProposal[] = data?.data?.proposals ?? [];

    if (proposals.length === 0) {
      return emptyGovernance();
    }

    const passed = proposals.filter((p) => p.state === "closed").length;
    const passRate = proposals.length > 0 ? (passed / proposals.length) * 100 : 0;
    const avgVotes =
      proposals.reduce((s, p) => s + p.votes, 0) / proposals.length;

    return {
      totalProposals: proposals.length,
      avgVoterTurnout: Math.round(avgVotes * 100) / 100,
      proposalPassRate: Math.round(passRate * 10) / 10,
      top5VotersPercent: 0, // Would need per-vote breakdown
      avgTimeToQuorumHours: 0, // Would need timestamp analysis
      recentProposals: proposals.slice(0, 5).map((p) => ({
        title: p.title,
        passed: p.state === "closed",
        turnout: p.votes,
      })),
    };
  } catch {
    return emptyGovernance();
  }
}

function emptyGovernance(): GovernanceData {
  return {
    totalProposals: 0,
    avgVoterTurnout: 0,
    proposalPassRate: 0,
    top5VotersPercent: 0,
    avgTimeToQuorumHours: 0,
    recentProposals: [],
  };
}
