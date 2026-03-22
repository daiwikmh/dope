"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Loader2, ArrowRight } from "lucide-react";
import { EASE } from "@/src/config/constants";
import { getScoreColor, getVerdict } from "@/src/utils/score";
import type { IntegrityReport, ComparisonResult, IdeaValidationResult } from "@/src/lib/schemas";

interface Evaluation extends IntegrityReport {
  projectId?: string;
}

interface CompareViewProps {
  evaluations: Evaluation[];
}

export function CompareView({ evaluations }: CompareViewProps) {
  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(evaluations.length > 1 ? 1 : 0);
  const [scenario, setScenario] = useState("general_integrity");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [idea, setIdea] = useState("");
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [ideaError, setIdeaError] = useState<string | null>(null);
  const [ideaResult, setIdeaResult] = useState<IdeaValidationResult | null>(null);

  async function handleCompare() {
    const a = evaluations[idxA];
    const b = evaluations[idxB];
    if (!a?.projectId || !b?.projectId) {
      setError("Projects missing DB IDs. Re-run analysis.");
      return;
    }
    if (a.projectId === b.projectId) {
      setError("Select two different projects.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/projects/${a.projectId}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponentId: b.projectId, scenario }),
      });
      if (!res.ok) throw new Error("Comparison failed");
      const data = await res.json();
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleValidate() {
    if (!idea.trim()) return;
    setIdeaLoading(true);
    setIdeaError(null);
    setIdeaResult(null);
    try {
      const res = await fetch("/api/validate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaDescription: idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");
      setIdeaResult(data);
    } catch (err) {
      setIdeaError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setIdeaLoading(false);
    }
  }

  return (
    <motion.div
      className="flex-1 p-6 space-y-8 overflow-y-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* ── PAIRWISE COMPARISON ── */}
      <section className="space-y-4">
        <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono block">
          PAIRWISE COMPARISON
        </span>

        {evaluations.length < 2 ? (
          <div className="border border-foreground/15 rounded-xl px-8 py-10 text-center max-w-sm">
            <p className="text-[14px] font-mono text-muted-foreground/70 leading-relaxed">
              Evaluate at least 2 projects to unlock comparison.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  PROJECT A
                </label>
                <select
                  value={idxA}
                  onChange={(e) => setIdxA(Number(e.target.value))}
                  className="block border border-foreground/20 rounded-lg bg-background text-[14px] font-mono px-3 py-2 focus:outline-none focus:border-foreground"
                >
                  {evaluations.map((ev, i) => (
                    <option key={i} value={i}>{ev.projectName}</option>
                  ))}
                </select>
              </div>

              <span className="text-[14px] font-mono text-muted-foreground pb-2">vs</span>

              <div className="space-y-1">
                <label className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  PROJECT B
                </label>
                <select
                  value={idxB}
                  onChange={(e) => setIdxB(Number(e.target.value))}
                  className="block border border-foreground/20 rounded-lg bg-background text-[14px] font-mono px-3 py-2 focus:outline-none focus:border-foreground"
                >
                  {evaluations.map((ev, i) => (
                    <option key={i} value={i}>{ev.projectName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  SCENARIO
                </label>
                <input
                  type="text"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="block border border-foreground/20 rounded-lg bg-background text-[14px] font-mono px-3 py-2 focus:outline-none focus:border-foreground w-48"
                />
              </div>

              <button
                onClick={handleCompare}
                disabled={loading}
                className="border border-foreground/20 rounded-lg px-5 py-2 text-[12px] tracking-[0.2em] uppercase font-mono hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 cursor-pointer"
              >
                {loading ? "COMPARING..." : "COMPARE"}
              </button>
            </div>

            {error && <p className="text-[14px] font-mono text-red-500">{error}</p>}

            {result && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="border border-foreground/15 rounded-xl p-5">
                  <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-2">
                    WINNER
                  </span>
                  <div className="flex items-baseline gap-4">
                    <span className="text-lg font-mono font-bold tracking-wider">
                      {result.winnerName ?? "TIE"}
                    </span>
                    <div className="flex gap-3 text-[14px] font-mono">
                      <span style={{ color: getScoreColor(result.scoreA) }}>
                        {evaluations[idxA]?.projectName}: {result.scoreA}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span style={{ color: getScoreColor(result.scoreB) }}>
                        {evaluations[idxB]?.projectName}: {result.scoreB}
                      </span>
                    </div>
                  </div>
                  <p className="text-[14px] font-mono text-muted-foreground/80 mt-3 leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: evaluations[idxA]?.projectName, score: result.scoreA },
                    { label: evaluations[idxB]?.projectName, score: result.scoreB },
                  ].map((s) => (
                    <div key={s.label} className="border border-foreground/10 rounded-xl p-3">
                      <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                        {s.label}
                      </span>
                      <div className="mt-2 h-2 bg-foreground/10 relative">
                        <motion.div
                          className="absolute inset-y-0 left-0"
                          style={{ backgroundColor: getScoreColor(s.score) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.score}%` }}
                          transition={{ duration: 0.6, ease: EASE }}
                        />
                      </div>
                      <span
                        className="text-[14px] font-mono font-bold mt-1 block"
                        style={{ color: getScoreColor(s.score) }}
                      >
                        {s.score}
                      </span>
                    </div>
                  ))}
                </div>

                {result.dimensions?.length > 0 && (
                  <div className="border border-foreground/10 rounded-xl">
                    <div className="border-b-2 border-foreground/10 px-4 py-2 grid grid-cols-[1fr_60px_60px_2fr] gap-2">
                      <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">DIMENSION</span>
                      <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono text-center">A</span>
                      <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono text-center">B</span>
                      <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">INSIGHT</span>
                    </div>
                    {result.dimensions.map((dim, i) => (
                      <motion.div
                        key={dim.name}
                        className="border-b border-foreground/5 px-4 py-2.5 grid grid-cols-[1fr_60px_60px_2fr] gap-2 items-center"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06, ease: EASE }}
                      >
                        <span className="text-[12px] font-mono font-bold tracking-wider uppercase">{dim.name}</span>
                        <span className="text-[14px] font-mono text-center font-bold" style={{ color: getScoreColor(dim.scoreA) }}>{dim.scoreA}</span>
                        <span className="text-[14px] font-mono text-center font-bold" style={{ color: getScoreColor(dim.scoreB) }}>{dim.scoreB}</span>
                        <span className="text-[12px] font-mono text-muted-foreground/70">{dim.insight}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </section>

      {/* ── DIVIDER ── */}
      <div className="border-t border-foreground/10" />

      {/* ── IDEA VALIDATION ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-muted-foreground/50" />
          <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            VALIDATE AN IDEA
          </span>
        </div>

        <div className="border border-foreground/15 rounded-xl overflow-hidden max-w-2xl">
          <div className="p-4 space-y-3">
            <p className="text-[12px] font-mono text-muted-foreground/70 leading-relaxed">
              Describe your project idea. It will be evaluated against all existing analyzed projects.
            </p>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="A decentralized compute marketplace that enables GPU owners to rent idle capacity to ML researchers, with staking for quality guarantees..."
              rows={4}
              className="bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground/30 outline-none w-full border border-foreground/15 rounded px-3 py-2 resize-none"
            />
            {ideaError && (
              <p className="text-[11px] font-mono text-[#ef4444]">{ideaError}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleValidate}
              disabled={ideaLoading || !idea.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#06b6d4] text-white text-xs font-mono tracking-widest uppercase disabled:opacity-40 cursor-pointer rounded"
            >
              {ideaLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {ideaLoading ? "VALIDATING..." : "VALIDATE IDEA"}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {ideaResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="space-y-3 max-w-2xl"
            >
              <div className="border border-foreground/15 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2">
                  <span className="text-[12px] tracking-widest text-muted-foreground uppercase font-mono">
                    VIABILITY ASSESSMENT
                  </span>
                  <span
                    className="text-[14px] font-mono font-bold tracking-wider"
                    style={{ color: getScoreColor(ideaResult.viabilityScore) }}
                  >
                    {ideaResult.viabilityScore}/100
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <span
                    className="text-[11px] tracking-[0.2em] uppercase font-mono px-2 py-0.5 border rounded inline-block"
                    style={{
                      color: getScoreColor(ideaResult.viabilityScore),
                      borderColor: getScoreColor(ideaResult.viabilityScore),
                    }}
                  >
                    {getVerdict(ideaResult.viabilityScore)}
                  </span>
                  <p className="text-[13px] font-mono text-muted-foreground leading-relaxed">
                    {ideaResult.ideaSummary}
                  </p>
                  <p className="text-[13px] font-mono text-foreground leading-relaxed">
                    {ideaResult.recommendation}
                  </p>
                </div>
              </div>

              {ideaResult.similarProjects.length > 0 && (
                <div className="border border-foreground/15 rounded-xl overflow-hidden">
                  <div className="border-b border-foreground/10 px-4 py-2">
                    <span className="text-[12px] tracking-widest text-muted-foreground uppercase font-mono">
                      SIMILAR PROJECTS
                    </span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {ideaResult.similarProjects.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.3, ease: EASE }}
                        className="px-4 py-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-mono font-bold tracking-wider uppercase">{p.name}</span>
                          <span className="text-[12px] font-mono" style={{ color: getScoreColor(p.integrityScore) }}>
                            {p.integrityScore}/100
                          </span>
                        </div>
                        <p className="text-[12px] font-mono text-muted-foreground/70">{p.relevance}</p>
                        {p.strengthsToLearnFrom.length > 0 && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] tracking-[0.15em] uppercase text-[#22c55e] font-mono">STRENGTHS</span>
                            {p.strengthsToLearnFrom.map((s, j) => (
                              <p key={j} className="text-[11px] font-mono text-muted-foreground pl-2">+ {s}</p>
                            ))}
                          </div>
                        )}
                        {p.weaknessesToAvoid.length > 0 && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] tracking-[0.15em] uppercase text-[#ef4444] font-mono">WEAKNESSES</span>
                            {p.weaknessesToAvoid.map((w, j) => (
                              <p key={j} className="text-[11px] font-mono text-muted-foreground pl-2">- {w}</p>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SignalList title="GAPS" items={ideaResult.gaps} color="#06b6d4" />
                <SignalList title="OPPORTUNITIES" items={ideaResult.opportunities} color="#22c55e" />
                <SignalList title="RISKS" items={ideaResult.risks} color="#ef4444" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}

function SignalList({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (!items.length) return null;
  return (
    <div className="border border-foreground/15 rounded-xl overflow-hidden">
      <div className="border-b border-foreground/10 px-3 py-1.5">
        <span className="text-[11px] tracking-[0.2em] uppercase font-mono" style={{ color }}>{title}</span>
      </div>
      <div className="p-3 space-y-1.5">
        {items.map((item, i) => (
          <p key={i} className="text-[11px] font-mono text-muted-foreground leading-relaxed">{item}</p>
        ))}
      </div>
    </div>
  );
}
