"use client";

import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";
import { getScoreColor } from "@/src/utils/score";

interface StatsCardsProps {
  integrityScore: number | null;
  layersCompleted: number;
  totalLayers: number;
  signalsDetected: number;
  divergenceGap: number | null;
}

export function StatsCards({
  integrityScore,
  layersCompleted,
  totalLayers,
  signalsDetected,
  divergenceGap,
}: StatsCardsProps) {
  const cards = [
    {
      label: "SCORE",
      value: integrityScore !== null ? `${integrityScore}` : "--",
      unit: "/100",
      color: integrityScore !== null ? getScoreColor(integrityScore) : undefined,
    },
    {
      label: "AGENTS",
      value: `${layersCompleted}`,
      unit: `/${totalLayers}`,
    },
    {
      label: "SIGNALS",
      value: `${signalsDetected}`,
      unit: "",
    },
    {
      label: "DIVERGENCE",
      value: divergenceGap !== null ? `${divergenceGap}` : "--",
      unit: divergenceGap !== null ? "%" : "",
      color:
        divergenceGap !== null && divergenceGap > 30
          ? "var(--color-score-critical)"
          : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-0 border-2 border-foreground">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: EASE }}
          className={`px-3 py-2.5 flex items-baseline gap-1 ${
            i < cards.length - 1 ? "border-r border-foreground/15" : ""
          }`}
        >
          <span className="text-[8px] tracking-[0.12em] uppercase text-muted-foreground font-mono w-16 shrink-0">
            {card.label}
          </span>
          <span
            className="text-lg font-mono font-bold tabular-nums leading-none"
            style={card.color ? { color: card.color } : undefined}
          >
            {card.value}
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">
            {card.unit}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
