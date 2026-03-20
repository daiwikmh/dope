"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getScoreColor, getVerdict } from "@/src/utils/score";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 200 }: ScoreGaugeProps) {
  const [displayed, setDisplayed] = useState(0);
  const color = getScoreColor(score);
  const verdict = getVerdict(score);

  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1500;

    function animate(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(score * eased));
      if (t < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="score-gauge-track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="score-gauge-fill"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-mono font-bold"
          style={{ color, fontVariantNumeric: "tabular-nums" }}
        >
          {displayed}
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
          INTEGRITY
        </span>
        <span
          className="text-xs font-mono font-bold tracking-widest mt-1"
          style={{ color }}
        >
          {verdict}
        </span>
      </div>
    </motion.div>
  );
}

interface MiniGaugeProps {
  label: string;
  score: number;
}

export function MiniGauge({ label, score }: MiniGaugeProps) {
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground font-mono">
          {label}
        </span>
        <span
          className="text-xs font-mono font-bold"
          style={{ color, fontVariantNumeric: "tabular-nums" }}
        >
          {score}
        </span>
      </div>
      <div className="h-1.5 w-full border border-foreground">
        <motion.div
          className="h-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </div>
    </div>
  );
}
