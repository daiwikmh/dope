export function getScoreColor(score: number): string {
  if (score < 0) return "var(--color-score-moderate)";
  if (score >= 70) return "var(--color-score-strong)";
  if (score >= 60) return "var(--color-score-moderate)";
  if (score >= 40) return "var(--color-score-weak)";
  return "var(--color-score-critical)";
}

export function getVerdict(score: number): string {
  if (score < 0) return "N/A";
  if (score >= 80) return "EXCEPTIONAL";
  if (score >= 70) return "STRONG";
  if (score >= 40) return "MODERATE";
  return "CRITICAL";
}
