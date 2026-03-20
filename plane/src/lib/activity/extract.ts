import type { GovernanceData } from "../sample-data";

interface RawCommit {
  sha: string;
  message: string;
  date: string;
}

interface ActivityEvent {
  projectId: string;
  evaluationId?: string;
  eventType: string;
  source: string;
  title?: string;
  metadata?: Record<string, unknown>;
  eventDate: string;
  eventTimestamp?: Date;
}

export function extractActivityEvents(input: {
  projectId: string;
  evaluationId?: string;
  commits?: RawCommit[];
  governanceData?: GovernanceData;
  transactions?: { hash: string; from: string; to: string; value: string; timestamp: string }[];
}): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const { projectId, evaluationId } = input;

  // GitHub commits → activity events
  if (input.commits) {
    for (const commit of input.commits) {
      const date = commit.date.split("T")[0]; // YYYY-MM-DD
      events.push({
        projectId,
        evaluationId,
        eventType: "commit",
        source: "github",
        title: commit.message.split("\n")[0].slice(0, 200),
        metadata: { sha: commit.sha },
        eventDate: date,
        eventTimestamp: new Date(commit.date),
      });
    }
  }

  // On-chain transactions → activity events
  if (input.transactions) {
    for (const tx of input.transactions) {
      const date = tx.timestamp.split("T")[0];
      events.push({
        projectId,
        evaluationId,
        eventType: "transaction",
        source: "onchain",
        title: `Transfer ${tx.value} from ${tx.from.slice(0, 8)}...`,
        metadata: { txHash: tx.hash, from: tx.from, to: tx.to, value: tx.value },
        eventDate: date,
        eventTimestamp: new Date(tx.timestamp),
      });
    }
  }

  // Governance proposals → activity events
  if (input.governanceData?.recentProposals) {
    const today = new Date().toISOString().split("T")[0];
    for (const proposal of input.governanceData.recentProposals) {
      events.push({
        projectId,
        evaluationId,
        eventType: "proposal",
        source: "governance",
        title: `${proposal.passed ? "Passed" : "Failed"}: ${proposal.title}`,
        metadata: { turnout: proposal.turnout, passed: proposal.passed },
        eventDate: today,
        eventTimestamp: new Date(),
      });
    }
  }

  return events;
}
