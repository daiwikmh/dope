"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FolderOpen,
  Bot,
  ScanSearch,
  FileText,
  Terminal,
  Settings,
  Globe,
  Wallet,
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
  { key: "explore", label: "Explore", icon: Globe },
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
          <Image
            src="/dopelogo.jpg"
            alt="Dope"
            width={28}
            height={28}
            className="w-7 h-7"
          />
          <div>
            <h1 className="text-[14px] font-mono font-bold tracking-[0.12em] uppercase leading-none">
              DOPE
            </h1>

          </div>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="px-2 pt-3 pb-1">
        
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
                <Icon size={16} className={isActive ? "text-background" : ""} />
                <span className="text-[13px] font-sans font-medium tracking-wide">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pipeline indicator */}
      {/* <div className="px-4 py-2 mt-1">
        <div className="flex items-center gap-2 px-0">
          <Terminal size={9} className="text-muted-foreground/40" />
          <div
            className={`w-2 h-2 rounded-full ${
              analysisPhase === "analyzing"
                ? "bg-[#06b6d4] animate-blink"
                : analysisPhase === "report"
                  ? "bg-[#22c55e]"
                  : "bg-foreground/10"
            }`}
          />
          
        </div>
      </div> */}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Wallet tab */}
      <div className="px-2 pb-1">
        <button
          onClick={() => onTabChange?.("wallet")}
          className={`flex items-center gap-3 px-3 py-2.5 w-full text-left transition-all cursor-pointer rounded-lg ${
            activeTab === "wallet"
              ? "bg-foreground text-background"
              : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
          }`}
        >
          <Wallet size={16} className={activeTab === "wallet" ? "text-background" : ""} />
          <span className="text-[13px] font-sans font-medium tracking-wide">
            Wallet
          </span>
        </button>
      </div>

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
          <Settings size={16} className={activeTab === "settings" ? "text-background" : ""} />
          <span className="text-[13px] font-sans font-medium tracking-wide">
            Settings
          </span>
          <div className="flex-1" />
          <ThemeToggle />
        </button>
      </div>

      {/* Powered by */}
      <div className="px-4 py-3 border-t border-foreground/10">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground/40">
            powered by
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <Image src="/octant.png" alt="Octant" width={16} height={16} className="opacity-70" />
            <span className="text-[8px] font-mono tracking-[0.1em] uppercase text-[#06b6d4]/70 font-bold">
              octant
            </span>
          </div>
          <span className="text-muted-foreground/20 text-[8px]">+</span>
          <div className="flex items-center gap-1.5">
            <Image src="/eigenlogo.jpg" alt="EigenLayer" width={16} height={16} className="opacity-70" />
            <span className="text-[8px] font-mono tracking-[0.1em] uppercase text-[#06b6d4]/70 font-bold">
              eigen
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
