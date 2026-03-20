"use client";

import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  FolderOpen,
  Bot,
  ScanSearch,
  Monitor,
  Activity,
  GitBranch,
  MessageSquare,
  Landmark,
  Terminal,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "@/src/components/shared/theme-toggle";

type AnalysisStatus = "idle" | "analyzing" | "complete" | "error";

interface SidebarProps {
  activeLayer: string | null;
  layerStatuses: Record<string, AnalysisStatus>;
  analysisPhase: "input" | "analyzing" | "report";
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NAV_TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Projects", icon: FolderOpen },
  { key: "agents", label: "Agents", icon: Bot },
  { key: "analysis", label: "Analysis", icon: ScanSearch },
  { key: "display", label: "Display", icon: Monitor },
];

const LAYER_STATUS = [
  { key: "onchain", icon: Activity },
  { key: "development", icon: GitBranch },
  { key: "social", icon: MessageSquare },
  { key: "governance", icon: Landmark },
] as const;

function statusColor(status: AnalysisStatus) {
  if (status === "complete") return "bg-[#22c55e]";
  if (status === "analyzing") return "bg-[#ea580c] animate-blink";
  if (status === "error") return "bg-[#ef4444]";
  return "bg-foreground/10";
}

export function Sidebar({
  layerStatuses,
  analysisPhase,
  activeTab = "dashboard",
  onTabChange,
}: SidebarProps) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-[200px] border-r-2 border-foreground bg-background flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-3 border-b-2 border-foreground">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 border-2 border-[#ea580c] flex items-center justify-center">
            <Shield size={12} className="text-[#ea580c]" />
          </div>
          <div>
            <h1 className="text-[11px] font-mono font-bold tracking-[0.12em] uppercase leading-none">
              INTEGRITY
            </h1>
            <p className="text-[8px] font-mono tracking-[0.2em] text-muted-foreground mt-0.5">
              SCORE v0.1
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="px-2 pt-3 pb-1">
        <span className="text-[7px] tracking-[0.18em] uppercase text-muted-foreground/50 font-mono px-2 mb-1 block">
          NAVIGATION
        </span>
        <div className="flex flex-col gap-px mt-1">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`flex items-center gap-3 px-3 py-2.5 text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Icon size={14} className={isActive ? "text-background" : ""} />
                <span className="text-[11px] font-sans font-medium tracking-wide">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layer Status — compact inline */}
      <div className="px-2 pt-3 pb-1">
        <span className="text-[7px] tracking-[0.18em] uppercase text-muted-foreground/50 font-mono px-2 mb-1 block">
          LAYER STATUS
        </span>
        <div className="flex items-center gap-1 px-2.5 mt-1">
          {LAYER_STATUS.map((layer) => {
            const status = layerStatuses[layer.key] || "idle";
            const Icon = layer.icon;
            return (
              <div
                key={layer.key}
                className="flex items-center gap-1 px-1.5 py-1"
                title={`${layer.key}: ${status}`}
              >
                <div className={`w-1.5 h-1.5 ${statusColor(status)}`} />
                <Icon size={10} className="text-muted-foreground/60" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline indicator */}
      <div className="px-4 py-2 mt-1">
        <div className="flex items-center gap-2 px-0">
          <Terminal size={9} className="text-muted-foreground/40" />
          <div
            className={`w-2 h-2 ${
              analysisPhase === "analyzing"
                ? "bg-[#ea580c] animate-blink"
                : analysisPhase === "report"
                  ? "bg-[#22c55e]"
                  : "bg-foreground/10"
            }`}
          />
          <span className="text-[9px] font-mono tracking-wider uppercase text-foreground/50">
            {analysisPhase === "analyzing"
              ? "RUNNING"
              : analysisPhase === "report"
                ? "DONE"
                : "IDLE"}
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings tab */}
      <div className="px-2 pb-1">
        <button
          onClick={() => onTabChange?.("settings")}
          className={`flex items-center gap-3 px-3 py-2.5 w-full text-left transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-foreground text-background"
              : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
          }`}
        >
          <Settings size={14} className={activeTab === "settings" ? "text-background" : ""} />
          <span className="text-[11px] font-sans font-medium tracking-wide">
            Settings
          </span>
          <div className="flex-1" />
          <ThemeToggle />
        </button>
      </div>

      {/* Powered by */}
      <div className="px-4 py-3 border-t border-foreground/10 text-center">
        <span className="text-[8px] font-mono tracking-[0.15em] uppercase text-muted-foreground/40">
          powered by{" "}
        </span>
        <span className="text-[8px] font-mono tracking-[0.15em] uppercase text-[#ea580c]/70 font-bold">
          octant
        </span>
      </div>
    </aside>
  );
}
