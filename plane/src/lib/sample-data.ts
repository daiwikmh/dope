export interface ContractEntry {
  label: string;
  address: string;
  chain?: string;
}

export interface ProjectInput {
  projectName: string;
  githubUrl: string;
  tokenAddress?: string;
  chain?: string;
  contracts?: ContractEntry[];
  twitterHandle?: string;
  governanceSpace?: string;
  description?: string;
  websiteUrl?: string;
  videoUrl?: string;
  logoUrl?: string;
}

export interface OnchainContractData {
  label: string;
  address: string;
  tokenHolders: { address: string; percentage: number }[];
  top10HoldersPercent: number;
  uptimePercent: number;
  dailyTransactions: number;
  tokenVelocity: number;
  contractAge: number;
  totalSupply: string;
}

export interface OnchainData {
  tokenHolders: { address: string; percentage: number }[];
  top10HoldersPercent: number;
  uptimePercent: number;
  dailyTransactions: number;
  tokenVelocity: number;
  contractAge: number;
  totalSupply: string;
  contractType?: string;
  contracts?: OnchainContractData[];
}

export interface GithubData {
  repoName: string;
  stars: number;
  forks: number;
  commitsLast90Days: number;
  contributors: number;
  topContributorPercent: number;
  openIssues: number;
  avgIssueResponseHours: number;
  lastCommitDaysAgo: number;
}

export interface SocialData {
  twitterFollowers: number;
  avgEngagementRate: number;
  sentimentScore: number;
  recentMentions: { text: string; sentiment: "positive" | "negative" | "neutral" }[];
  botLikelihoodPercent: number;
  communityComplaints: string[];
}

export interface GovernanceData {
  totalProposals: number;
  avgVoterTurnout: number;
  proposalPassRate: number;
  top5VotersPercent: number;
  avgTimeToQuorumHours: number;
  recentProposals: { title: string; passed: boolean; turnout: number }[];
}

export const sampleProject: ProjectInput = {
  projectName: "NexusNet (Demo)",
  githubUrl: "https://github.com/nexusnet/nexusnet-core",
  tokenAddress: "0x1234...abcd",
  chain: "ethereum",
  contracts: [
    { label: "Token", address: "0x1234...abcd", chain: "ethereum" },
  ],
  twitterHandle: "@NexusNetDePIN",
  governanceSpace: "nexusnet.eth",
};

export const sampleOnchainData: OnchainData = {
  tokenHolders: [
    { address: "0xaaa...111", percentage: 28.5 },
    { address: "0xbbb...222", percentage: 15.2 },
    { address: "0xccc...333", percentage: 12.1 },
    { address: "0xddd...444", percentage: 8.7 },
    { address: "0xeee...555", percentage: 6.3 },
    { address: "0xfff...666", percentage: 4.1 },
    { address: "0x111...777", percentage: 3.2 },
    { address: "0x222...888", percentage: 2.8 },
    { address: "0x333...999", percentage: 2.1 },
    { address: "0x444...000", percentage: 1.7 },
  ],
  top10HoldersPercent: 84.7,
  uptimePercent: 99.9,
  dailyTransactions: 1250,
  tokenVelocity: 0.34,
  contractAge: 485,
  totalSupply: "1,000,000,000",
};

export const sampleGithubData: GithubData = {
  repoName: "nexusnet-core",
  stars: 2840,
  forks: 312,
  commitsLast90Days: 9,
  contributors: 3,
  topContributorPercent: 87,
  openIssues: 142,
  avgIssueResponseHours: 720,
  lastCommitDaysAgo: 34,
};

export const sampleSocialData: SocialData = {
  twitterFollowers: 48500,
  avgEngagementRate: 0.8,
  sentimentScore: 0.35,
  recentMentions: [
    { text: "NexusNet uptime is incredible, best DePIN infra out there!", sentiment: "positive" },
    { text: "Been waiting 3 weeks for the team to fix the API latency issues. No response.", sentiment: "negative" },
    { text: "Anyone else notice the token dumping from team wallets? Check etherscan.", sentiment: "negative" },
    { text: "NexusNet partnership announcement with [redacted] coming soon 🔥", sentiment: "positive" },
    { text: "Switched from NexusNet to a competitor. Latency was unbearable for my use case.", sentiment: "negative" },
    { text: "The governance is a joke. Same 2 wallets pass every proposal.", sentiment: "negative" },
    { text: "NexusNet node operators are barely breaking even with current rewards.", sentiment: "negative" },
    { text: "Great whitepaper and vision. Hope the team delivers on the roadmap.", sentiment: "neutral" },
  ],
  botLikelihoodPercent: 22,
  communityComplaints: [
    "API latency spikes during peak hours (200ms+ vs claimed 50ms)",
    "Token vesting unlock caused 15% price drop, no prior communication",
    "Node operator rewards decreased 40% without governance vote",
    "GitHub issues go unanswered for months",
    "Discord mods delete critical posts instead of addressing concerns",
  ],
};

export const sampleGovernanceData: GovernanceData = {
  totalProposals: 24,
  avgVoterTurnout: 3.2,
  proposalPassRate: 95.8,
  top5VotersPercent: 91.3,
  avgTimeToQuorumHours: 2.1,
  recentProposals: [
    { title: "Increase team allocation by 5%", passed: true, turnout: 2.8 },
    { title: "Reduce node operator rewards", passed: true, turnout: 3.1 },
    { title: "Community treasury diversification", passed: true, turnout: 4.2 },
    { title: "Pause token burns for 6 months", passed: true, turnout: 2.5 },
    { title: "Add community-elected council seat", passed: false, turnout: 8.7 },
  ],
};
