import { z } from "zod";

export const MicroSignal = z.object({
  text: z.string().describe("Short description of the observed signal"),
  severity: z
    .enum(["low", "medium", "high", "critical"])
    .describe("How concerning this signal is"),
  source: z.string().describe("Data source that produced this signal"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence in this signal (0-1)"),
});

export const ImpactVector = z.object({
  theme: z
    .string()
    .describe("Thematic grouping, e.g. 'Network Reliability Concerns'"),
  summary: z.string().describe("One-paragraph synthesis of grouped signals"),
  weight: z
    .number()
    .min(0)
    .max(1)
    .describe("Importance weight for divergence scoring"),
  claimedPerformance: z
    .number()
    .min(0)
    .max(1)
    .describe("Normalized score of what the project claims"),
  observedReality: z
    .number()
    .min(0)
    .max(1)
    .describe("Normalized score of what the data shows"),
  signals: z.array(MicroSignal),
});

export const LayerAnalysis = z.object({
  layer: z.string().describe("Layer identifier"),
  score: z.number().min(0).max(100).describe("Layer health score 0-100"),
  summary: z.string().describe("One-paragraph summary of findings"),
  signals: z.array(MicroSignal),
});

export const IntegrityReport = z.object({
  projectName: z.string(),
  integrityScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall integrity score 0-100"),
  verdict: z
    .enum(["exceptional", "strong", "moderate", "critical"])
    .describe("Overall project health verdict"),
  executiveSummary: z
    .string()
    .describe("2-3 sentence executive summary for decision makers"),
  impactVectors: z.array(ImpactVector),
  layerScores: z.record(z.string(), z.number().min(0).max(100)),
  recommendations: z
    .array(z.string())
    .describe("Actionable recommendations for funders/evaluators"),
});

export const ProjectInputSchema = z.object({
  projectName: z.string().min(1),
  githubUrl: z.string().url(),
  tokenAddress: z.string().optional(),
  chain: z.string().default("ethereum"),
  contracts: z.array(z.object({
    label: z.string(),
    address: z.string(),
    chain: z.string().optional(),
  })).optional(),
  twitterHandle: z.string().optional(),
  governanceSpace: z.string().optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export const ComparisonResult = z.object({
  winnerId: z.string().nullable().describe("UUID of the winning project, null if tie"),
  winnerName: z.string().nullable(),
  reasoning: z.string().describe("LLM-generated explanation of the comparison"),
  scoreA: z.number().min(0).max(100),
  scoreB: z.number().min(0).max(100),
  dimensions: z.array(
    z.object({
      name: z.string(),
      scoreA: z.number().min(0).max(100),
      scoreB: z.number().min(0).max(100),
      insight: z.string(),
    })
  ),
});

export type MicroSignal = z.infer<typeof MicroSignal>;
export type ImpactVector = z.infer<typeof ImpactVector>;
export type LayerAnalysis = z.infer<typeof LayerAnalysis>;
export type IntegrityReport = z.infer<typeof IntegrityReport>;
export type ProjectInputSchema = z.infer<typeof ProjectInputSchema>;
export type ComparisonResult = z.infer<typeof ComparisonResult>;

export const IdeaValidationResultSchema = z.object({
  ideaSummary: z.string(),
  viabilityScore: z.number().min(0).max(100),
  similarProjects: z.array(
    z.object({
      name: z.string(),
      integrityScore: z.number(),
      relevance: z.string(),
      strengthsToLearnFrom: z.array(z.string()),
      weaknessesToAvoid: z.array(z.string()),
    })
  ),
  gaps: z.array(z.string()),
  opportunities: z.array(z.string()),
  risks: z.array(z.string()),
  recommendation: z.string(),
});

export type IdeaValidationResult = z.infer<typeof IdeaValidationResultSchema>;
