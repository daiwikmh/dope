"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/src/components/dashboard/sidebar";
import { Topbar } from "@/src/components/dashboard/topbar";
import { StatsCards } from "@/src/components/dashboard/stats-cards";
import { ActivityLog } from "@/src/components/dashboard/activity-log";
import type { LogEntry } from "@/src/components/dashboard/activity-log";
import { ProjectForm } from "@/src/components/dashboard/project-form";
import { IntegrityReportView } from "@/src/components/dashboard/integrity-report";
import { DashboardView } from "@/src/components/dashboard/dashboard-view";
import { BlogCard } from "@/src/components/dashboard/blog-card";
import { BlogPost } from "@/src/components/dashboard/blog-post";
import { CompareView } from "@/src/components/dashboard/compare-view";
import { AgentsView } from "@/src/components/dashboard/agents-view";
import { SettingsView } from "@/src/components/dashboard/settings-view";
import { EASE } from "@/src/config/constants";
import type { IntegrityReport } from "@/src/lib/schemas";

interface BlogEntry {
  report: IntegrityReport;
  publishedAt: string;
}

type AnalysisStatus = "idle" | "analyzing" | "complete" | "error";
type Phase = "input" | "analyzing" | "report";

const LAYERS = ["onchain", "development", "social", "governance"] as const;

function ts() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [phase, setPhase] = useState<Phase>("input");
  const [projectName, setProjectName] = useState<string | null>(null);
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [layerStatuses, setLayerStatuses] = useState<
    Record<string, AnalysisStatus>
  >({
    onchain: "idle",
    development: "idle",
    social: "idle",
    governance: "idle",
  });
  const [signalsDetected, setSignalsDetected] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [evaluations, setEvaluations] = useState<
    (IntegrityReport & { projectId?: string })[]
  >([]);
  const [blogEntries, setBlogEntries] = useState<BlogEntry[]>([]);
  const [viewingBlogPost, setViewingBlogPost] = useState<BlogEntry | null>(null);

  const log = useCallback(
    (layer: string, message: string, type: LogEntry["type"] = "info") => {
      setLogs((prev) => [
        ...prev,
        { timestamp: ts(), layer, message, type },
      ]);
    },
    []
  );

  const setStatus = useCallback(
    (layer: string, status: AnalysisStatus) => {
      setLayerStatuses((prev) => ({ ...prev, [layer]: status }));
    },
    []
  );

  async function handleAnalyze(data: {
    projectName: string;
    githubUrl: string;
    tokenAddress: string;
    chain: string;
    contracts: { label: string; address: string; chain?: string }[];
    twitterHandle: string;
    governanceSpace: string;
    demo: boolean;
  }) {
    setActiveTab("analysis");
    setProjectName(data.projectName);
    setPhase("analyzing");
    setError(null);
    setLogs([]);
    setSignalsDetected(0);
    setLayerStatuses({
      onchain: "idle",
      development: "idle",
      social: "idle",
      governance: "idle",
    });

    log("SYS", "pipeline.init -- 4-layer analysis started");

    const delay = data.demo ? 300 : 600;
    for (const layer of LAYERS) {
      await new Promise((r) => setTimeout(r, delay));
      setStatus(layer, "analyzing");
      log("SYS", `${layer}.agent > activated`);
    }

    try {
      log("SYS", "orchestrator.send > awaiting response...");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      for (const layer of LAYERS) {
        setStatus(layer, "complete");
      }

      const totalSignals =
        result.impactVectors?.reduce(
          (acc: number, v: { signals: unknown[] }) =>
            acc + (v.signals?.length || 0),
          0
        ) || 0;
      setSignalsDetected(totalSignals);

      log("SYS", `synthesis.complete -- ${totalSignals} signals extracted`, "ok");
      log(
        "SYS",
        `score=${result.integrityScore} verdict=${result.verdict?.toUpperCase()}`,
        "ok"
      );

      setReport(result);
      setPhase("report");

      // Store evaluation for dashboard
      setEvaluations((prev) => {
        const exists = prev.some(
          (e) => e.projectName === result.projectName
        );
        if (exists) {
          return prev.map((e) =>
            e.projectName === result.projectName ? result : e
          );
        }
        return [result, ...prev];
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      log("SYS", `FATAL: ${msg}`, "error");

      for (const layer of LAYERS) {
        setLayerStatuses((prev) => ({
          ...prev,
          [layer]: prev[layer] === "analyzing" ? "error" : prev[layer],
        }));
      }
    }
  }

  function handleReset() {
    setPhase("input");
    setReport(null);
    setProjectName(null);
    setError(null);
    setLogs([]);
    setSignalsDetected(0);
    setLayerStatuses({
      onchain: "idle",
      development: "idle",
      social: "idle",
      governance: "idle",
    });
  }

  function handleViewReport(r: IntegrityReport) {
    setReport(r);
    setProjectName(r.projectName);
    setPhase("report");
    setActiveTab("analysis");

    // Populate log with summary for viewed report
    setLogs([
      { timestamp: ts(), layer: "SYS", message: `loaded report: ${r.projectName}`, type: "info" },
      { timestamp: ts(), layer: "SYS", message: `score=${r.integrityScore} verdict=${r.verdict.toUpperCase()}`, type: "ok" },
    ]);

    for (const layer of LAYERS) {
      setLayerStatuses((prev) => ({ ...prev, [layer]: "complete" }));
    }
    setSignalsDetected(
      r.impactVectors?.reduce((acc, v) => acc + (v.signals?.length || 0), 0) || 0
    );
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    if (tab !== "blog") setViewingBlogPost(null);
  }

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((posts: { report: IntegrityReport; publishedAt: string }[]) => {
        setBlogEntries(
          posts.map((p) => ({
            report: p.report,
            publishedAt: p.publishedAt?.split("T")[0] ?? "",
          }))
        );
      })
      .catch(() => {});
  }, []);

  async function handlePublish() {
    if (!report) return;
    const exists = blogEntries.some(
      (e) => e.report.projectName === report.projectName
    );
    if (exists) return;
    try {
      await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report }),
      });
    } catch {}
    setBlogEntries((prev) => [
      {
        report,
        publishedAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
  }

  function isBlogPublished(r: IntegrityReport | null): boolean {
    if (!r) return false;
    return blogEntries.some((e) => e.report.projectName === r.projectName);
  }

  const overallStatus: AnalysisStatus =
    phase === "analyzing"
      ? "analyzing"
      : phase === "report"
        ? "complete"
        : error
          ? "error"
          : "idle";

  const avgDivergence =
    report?.impactVectors?.length
      ? Math.round(
          report.impactVectors.reduce(
            (acc, v) =>
              acc + Math.abs(v.claimedPerformance - v.observedReality) * 100,
            0
          ) / report.impactVectors.length
        )
      : null;

  const sidebarW = sidebarOpen ? 200 : 0;

  // Determine what to show in analysis tab
  const showAnalysis = activeTab === "analysis";
  const showDashboard = activeTab === "dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <Sidebar
              activeLayer={null}
              layerStatuses={layerStatuses}
              analysisPhase={phase}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main
        className="flex-1 min-w-0 flex flex-col transition-all duration-200 overflow-hidden"
        style={{ marginLeft: sidebarW }}
      >
        <Topbar
          projectName={showAnalysis ? projectName : null}
          status={showAnalysis ? overallStatus : "idle"}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Error */}
        <AnimatePresence>
          {error && showAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4 mt-2 px-3 py-1.5 border border-[#ef4444] text-[#ef4444] text-[10px] font-mono flex items-center justify-between"
            >
              <span>ERR: {error}</span>
              <button
                onClick={() => setError(null)}
                className="opacity-60 hover:opacity-100 cursor-pointer text-xs"
              >
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* ── DASHBOARD TAB ── */}
          {showDashboard && (
            <DashboardView
              evaluations={evaluations}
              onSelectReport={handleViewReport}
              onNewScan={() => {
                handleReset();
                setActiveTab("analysis");
              }}
            />
          )}

          {/* ── ANALYSIS TAB ── */}
          {showAnalysis && (
            <>
              {/* Stats visible during analysis + report */}
              {phase !== "input" && (
                <StatsCards
                  integrityScore={report?.integrityScore ?? null}
                  layersCompleted={
                    Object.values(layerStatuses).filter((s) => s === "complete")
                      .length
                  }
                  totalLayers={4}
                  signalsDetected={signalsDetected}
                  divergenceGap={avgDivergence}
                />
              )}

              {/* INPUT PHASE */}
              {phase === "input" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col items-center pt-12"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-16 border-t border-foreground/15" />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                      $ scan --project
                    </span>
                    <div className="w-16 border-t border-foreground/15" />
                    <span className="h-1.5 w-1.5 bg-[#ea580c] animate-blink" />
                  </div>
                  <ProjectForm onSubmit={handleAnalyze} loading={false} />
                </motion.div>
              )}

              {/* ANALYZING PHASE */}
              {phase === "analyzing" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 h-[calc(100vh-160px)]">
                  <div className="lg:col-span-3">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="border border-foreground/15 rounded-xl h-full flex flex-col"
                    >
                      <div className="flex items-center justify-between border-b border-foreground/10 px-3 py-1.5">
                        <span className="text-[9px] tracking-widest text-muted-foreground uppercase font-mono">
                          pipeline
                        </span>
                        <span className="text-[9px] tracking-widest text-[#ea580c] animate-blink font-mono">
                          ACTIVE
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-center">
                        <div className="flex flex-col gap-3">
                          {LAYERS.map((layer, i) => {
                            const status = layerStatuses[layer];
                            return (
                              <motion.div
                                key={layer}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: i * 0.08,
                                  duration: 0.3,
                                  ease: EASE,
                                }}
                                className="flex items-center gap-3"
                              >
                                <div
                                  className={`w-2.5 h-2.5 border ${
                                    status === "complete"
                                      ? "bg-[#22c55e] border-[#22c55e]"
                                      : status === "analyzing"
                                        ? "border-[#ea580c] animate-pulse"
                                        : status === "error"
                                          ? "bg-[#ef4444] border-[#ef4444]"
                                          : "border-foreground/20"
                                  }`}
                                />
                                <span className="text-[10px] font-mono tracking-wider uppercase w-28">
                                  {layer}
                                </span>
                                <div className="flex-1 h-px border-t border-dashed border-foreground/15 relative">
                                  {status === "analyzing" && (
                                    <motion.div
                                      className="absolute top-0 left-0 h-px bg-[#ea580c]"
                                      initial={{ width: "5%" }}
                                      animate={{ width: "90%" }}
                                      transition={{
                                        duration: 12,
                                        ease: "linear",
                                      }}
                                    />
                                  )}
                                  {status === "complete" && (
                                    <div className="absolute top-0 left-0 h-px bg-[#22c55e] w-full" />
                                  )}
                                </div>
                                <span
                                  className={`text-[8px] font-mono tracking-[0.2em] w-14 text-right ${
                                    status === "complete"
                                      ? "text-[#22c55e]"
                                      : status === "analyzing"
                                        ? "text-[#ea580c]"
                                        : status === "error"
                                          ? "text-[#ef4444]"
                                          : "text-foreground/20"
                                  }`}
                                >
                                  {status === "complete"
                                    ? "DONE"
                                    : status === "analyzing"
                                      ? "RUN"
                                      : status === "error"
                                        ? "FAIL"
                                        : "WAIT"}
                                </span>
                              </motion.div>
                            );
                          })}

                          {/* Synthesis */}
                          <div className="border-t border-foreground/10 pt-3 mt-1">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4, duration: 0.3 }}
                              className="flex items-center gap-3"
                            >
                              <div className="w-2.5 h-2.5 border border-foreground/20 animate-pulse" />
                              <span className="text-[10px] font-mono tracking-wider uppercase w-28">
                                synthesis
                              </span>
                              <div className="flex-1 h-px border-t border-dashed border-foreground/10" />
                              <span className="text-[8px] font-mono tracking-[0.2em] text-foreground/20 w-14 text-right">
                                WAIT
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="lg:col-span-2">
                    <ActivityLog logs={logs} />
                  </div>
                </div>
              )}

              {/* REPORT PHASE */}
              {phase === "report" && report && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                  <div className="lg:col-span-3">
                    <IntegrityReportView
                      report={report}
                      onBack={handleReset}
                      onPublish={handlePublish}
                      isPublished={isBlogPublished(report)}
                    />
                  </div>
                  <div className="lg:col-span-2 space-y-3">
                    <ActivityLog logs={logs} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── COMPARE TAB ── */}
          {activeTab === "compare" && (
            <CompareView evaluations={evaluations} />
          )}

          {/* ── AGENTS TAB ── */}
          {activeTab === "agents" && <AgentsView />}

          {/* ── BLOG TAB ── */}
          {activeTab === "blog" && !viewingBlogPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {blogEntries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col items-center pt-24"
                >
                  <div className="border border-foreground/15 rounded-xl/15 px-8 py-10 text-center max-w-sm">
                    <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-3">
                      NO PUBLISHED REPORTS
                    </span>
                    <p className="text-[11px] font-mono text-muted-foreground/70 leading-relaxed">
                      Run a scan and hit PUBLISH to share reports here.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                      PUBLISHED REPORTS
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums">
                      {blogEntries.length} {blogEntries.length === 1 ? "post" : "posts"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {blogEntries.map((entry, i) => (
                      <BlogCard
                        key={`${entry.report.projectName}-${i}`}
                        report={entry.report}
                        publishedAt={entry.publishedAt}
                        index={i}
                        onClick={() => setViewingBlogPost(entry)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── BLOG POST VIEW ── */}
          {activeTab === "blog" && viewingBlogPost && (
            <BlogPost
              report={viewingBlogPost.report}
              publishedAt={viewingBlogPost.publishedAt}
              onBack={() => setViewingBlogPost(null)}
            />
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
