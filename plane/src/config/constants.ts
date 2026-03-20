export const TECH_STACK = [
  "VERCEL AI SDK",
  "LLAMA 3.1 NEMOTRON",
  "RECURSIVE SUMMARIZATION",
  "ON-CHAIN ANALYSIS",
  "GITHUB API",
  "SOCIAL SENTIMENT",
  "GOVERNANCE SCORING",
  "DIVERGENCE DETECTION",
];

export const ANALYSIS_LAYERS = [
  {
    key: "onchain" as const,
    label: "ON-CHAIN LAYER",
    desc: "Token distribution, holder concentration, uptime, velocity. Detects centralization risk and economic anomalies.",
  },
  {
    key: "development" as const,
    label: "DEVELOPMENT LAYER",
    desc: "Commit frequency, bus factor, issue response. Detects zombie repos and single-point-of-failure risks.",
  },
  {
    key: "social" as const,
    label: "SOCIAL LAYER",
    desc: "Community sentiment, pain point clustering, bot detection. Qualitative analysis at scale — the differentiator.",
  },
  {
    key: "governance" as const,
    label: "GOVERNANCE LAYER",
    desc: "Voter turnout, whale dominance, proposal pass rates. Exposes decentralization theater vs real governance.",
  },
];

export const EASE = [0.22, 1, 0.36, 1] as const;
