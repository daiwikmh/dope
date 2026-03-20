export function getScoreColor(score: number): string {
  if (score >= 80) return "var(--color-score-strong)";
  if (score >= 60) return "var(--color-score-moderate)";
  if (score >= 40) return "var(--color-score-weak)";
  return "var(--color-score-critical)";
}

export function getVerdict(score: number): string {
  if (score >= 80) return "STRONG";
  if (score >= 60) return "MODERATE";
  if (score >= 40) return "WEAK";
  return "CRITICAL";
}
