"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Shield,
  Download,
  RotateCcw,
  Activity,
  GitBranch,
  MessageSquare,
  Landmark,
} from "lucide-react";
import { ScoreGauge, MiniGauge } from "@/src/components/shared/score-gauge";
import type { IntegrityReport as ReportType } from "@/src/lib/schemas";

const ease = [0.22, 1, 0.36, 1] as const;

const LAYER_ICONS = {
  onchain: Activity,
  development: GitBranch,
  social: MessageSquare,
  governance: Landmark,
};

const LAYER_LABELS = {
  onchain: "ON-CHAIN",
  development: "DEV",
  social: "SOCIAL",
  governance: "GOV",
};

const SEVERITY_COLORS = {
  low: "text-muted-foreground",
  medium: "text-[#eab308]",
  high: "text-[#f97316]",
  critical: "text-[#ef4444]",
};

interface IntegrityReportProps {
  report: ReportType;
  onBack: () => void;
}

export function IntegrityReportView({ report, onBack }: IntegrityReportProps) {
  const [expandedVector, setExpandedVector] = useState<number | null>(0);

  function exportMarkdown() {
    const md = generateMarkdown(report);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.projectName.replace(/\s+/g, "-").toLowerCase()}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full">
      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease }}
        className="flex items-center justify-between mb-3"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <RotateCcw size={10} />
          NEW SCAN
        </button>
        <button
          onClick={exportMarkdown}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-foreground text-[9px] font-mono tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors cursor-pointer"
        >
          <Download size={10} />
          EXPORT
        </button>
      </motion.div>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="border-2 border-foreground"
      >
        {/* Title */}
        <div className="flex items-center justify-between border-b-2 border-foreground px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <Shield size={10} className="text-[#ea580c]" />
            <span className="text-[9px] tracking-widest text-muted-foreground uppercase font-mono">
              report.integrity
            </span>
          </div>
          <span className="text-[9px] tracking-widest text-muted-foreground font-mono tabular-nums">
            {new Date().toISOString().split("T")[0]}
          </span>
        </div>

        {/* Score + Summary */}
        <div className="flex flex-col md:flex-row">
          {/* Gauge */}
          <div className="flex flex-col items-center justify-center p-6 md:border-r-2 border-b-2 md:border-b-0 border-foreground min-w-[220px]">
            <ScoreGauge score={report.integrityScore} size={160} />
            <span className="mt-2 text-sm font-mono font-bold tracking-tight">
              {report.projectName}
            </span>
          </div>

          {/* Summary + Layers */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-foreground/15 flex-1">
              <span className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">
                SUMMARY
              </span>
              <p className="text-[11px] font-mono text-foreground leading-relaxed">
                {report.executiveSummary}
              </p>
            </div>

            {/* Layer scores — compact grid */}
            <div className="grid grid-cols-4 gap-0">
              {(
                Object.entries(report.layerScores) as [
                  keyof typeof LAYER_LABELS,
                  number,
                ][]
              ).map(([layer, score], i) => {
                const Icon = LAYER_ICONS[layer];
                return (
                  <motion.div
                    key={layer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.4, ease }}
                    className={`px-3 py-2.5 ${
                      i < 3 ? "border-r border-foreground/15" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      <Icon size={9} className="text-muted-foreground" />
                      <span className="text-[7px] tracking-[0.15em] uppercase text-muted-foreground font-mono">
                        {LAYER_LABELS[layer]}
                      </span>
                    </div>
                    <MiniGauge label="" score={score} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Impact Vectors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease }}
        className="border-x-2 border-b-2 border-foreground"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 border-b-2 border-foreground">
          <AlertTriangle size={10} className="text-[#ea580c]" />
          <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground font-mono">
            VECTORS
          </span>
          <div className="flex-1 border-t border-foreground/10" />
        </div>

        {report.impactVectors.map((vector, i) => {
          const isExpanded = expandedVector === i;
          const gap = Math.round(
            Math.abs(vector.claimedPerformance - vector.observedReality) * 100
          );

          return (
            <div
              key={i}
              className="border-b border-foreground/10 last:border-b-0"
            >
              <button
                onClick={() => setExpandedVector(isExpanded ? null : i)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-foreground/[0.03] transition-colors cursor-pointer"
              >
                <span className="text-muted-foreground/50">
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
                <span className="flex-1 text-left text-[11px] font-mono font-bold">
                  {vector.theme}
                </span>
                <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-foreground text-background">
                  {gap}%
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 ml-5">
                      <p className="text-[10px] font-mono text-muted-foreground leading-relaxed mb-3">
                        {vector.summary}
                      </p>

                      {/* Divergence bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[7px] tracking-[0.15em] uppercase text-muted-foreground font-mono">
                            CLAIMED {(vector.claimedPerformance * 100).toFixed(0)}
                          </span>
                          <span className="text-[7px] tracking-[0.15em] uppercase text-muted-foreground font-mono">
                            OBSERVED {(vector.observedReality * 100).toFixed(0)}
                          </span>
                        </div>
                        <div className="relative h-1.5 border border-foreground/20">
                          <div
                            className="absolute top-0 left-0 h-full bg-foreground/10"
                            style={{ width: `${vector.claimedPerformance * 100}%` }}
                          />
                          <div
                            className="absolute top-0 left-0 h-full bg-[#ef4444]"
                            style={{ width: `${vector.observedReality * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Signals */}
                      <div className="flex flex-col gap-1">
                        {vector.signals.map((signal, j) => (
                          <div
                            key={j}
                            className="flex items-start gap-2 py-1 text-[10px] font-mono"
                          >
                            <span
                              className={`shrink-0 w-12 uppercase text-[8px] tracking-wider ${SEVERITY_COLORS[signal.severity]}`}
                            >
                              {signal.severity}
                            </span>
                            <span className="text-foreground/80 flex-1">
                              {signal.text}
                            </span>
                            <span className="text-muted-foreground/50 shrink-0 text-[8px] tabular-nums">
                              {(signal.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease }}
        className="border-x-2 border-b-2 border-foreground"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-foreground/15">
          <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground font-mono">
            // recommendations
          </span>
        </div>
        <div className="flex flex-col">
          {report.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.06, duration: 0.3, ease }}
              className="flex items-start gap-2 px-3 py-2 border-b border-foreground/5 last:border-b-0"
            >
              <span className="text-[9px] font-mono text-[#ea580c] shrink-0 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-foreground/80 leading-relaxed">
                {rec}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function generateMarkdown(report: ReportType): string {
  const lines: string[] = [
    `# ${report.projectName} — Integrity Report`,
    `_${new Date().toISOString().split("T")[0]}_\n`,
    `## Score: ${report.integrityScore}/100 — ${report.verdict.toUpperCase()}\n`,
    `### Executive Summary`,
    `${report.executiveSummary}\n`,
    `### Layer Scores`,
    `| Layer | Score |`,
    `|-------|-------|`,
    `| On-Chain | ${report.layerScores.onchain}/100 |`,
    `| Development | ${report.layerScores.development}/100 |`,
    `| Social | ${report.layerScores.social}/100 |`,
    `| Governance | ${report.layerScores.governance}/100 |`,
    ``,
    `### Impact Vectors\n`,
  ];

  report.impactVectors.forEach((v, i) => {
    const gap = Math.round(
      Math.abs(v.claimedPerformance - v.observedReality) * 100
    );
    lines.push(`#### ${i + 1}. ${v.theme} (Gap: ${gap}%)`);
    lines.push(`${v.summary}\n`);
    lines.push(`| Severity | Signal | Confidence |`);
    lines.push(`|----------|--------|------------|`);
    v.signals.forEach((s) => {
      lines.push(
        `| ${s.severity.toUpperCase()} | ${s.text} | ${(s.confidence * 100).toFixed(0)}% |`
      );
    });
    lines.push("");
  });

  lines.push(`### Recommendations\n`);
  report.recommendations.forEach((r, i) => {
    lines.push(`${i + 1}. ${r}`);
  });

  lines.push(
    `\n---\n_Generated by Integrity Score — AI Agent for Public Goods Evaluation_`
  );

  return lines.join("\n");
}
