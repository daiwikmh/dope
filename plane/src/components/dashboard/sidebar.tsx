"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  LayoutDashboard,
  FolderOpen,
  Bot,
  ScanSearch,
  FileText,
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
  { key: "analysis", label: "Analysis", icon: ScanSearch },
  { key: "blog", label: "Blog", icon: FileText },
  { key: "compare", label: "Compare", icon: FolderOpen },
  { key: "agents", label: "Agents", icon: Bot },
];

export function Sidebar({
  layerStatuses,
  analysisPhase,
  activeTab = "dashboard",
  onTabChange,
}: SidebarProps) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-[200px] border-r border-foreground/10 bg-background flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-3 border-b border-foreground/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 border border-[#ea580c]/40 rounded-lg flex items-center justify-center">
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
        <div className="flex flex-col gap-0.5 mt-1">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`flex items-center gap-3 px-3 py-2.5 text-left transition-all cursor-pointer rounded-lg ${
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

      {/* Pipeline indicator */}
      <div className="px-4 py-2 mt-1">
        <div className="flex items-center gap-2 px-0">
          <Terminal size={9} className="text-muted-foreground/40" />
          <div
            className={`w-2 h-2 rounded-full ${
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
          className={`flex items-center gap-3 px-3 py-2.5 w-full text-left transition-all cursor-pointer rounded-lg ${
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
