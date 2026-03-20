"use client";

import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, ArrowLeft, Radio } from "lucide-react";
import Link from "next/link";

interface TopbarProps {
  projectName: string | null;
  status: "idle" | "analyzing" | "complete" | "error";
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const STATUS_CONFIG = {
  idle: { label: "AWAITING", color: "text-foreground/40", dot: "bg-foreground/20" },
  analyzing: { label: "LIVE", color: "text-[#ea580c]", dot: "bg-[#ea580c] animate-blink" },
  complete: { label: "COMPLETE", color: "text-[#22c55e]", dot: "bg-[#22c55e]" },
  error: { label: "FAULT", color: "text-[#ef4444]", dot: "bg-[#ef4444]" },
};

export function Topbar({ projectName, status, sidebarOpen, onToggleSidebar }: TopbarProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <header className="sticky top-0 z-30 bg-background border-b-2 border-foreground px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="w-7 h-7 flex items-center justify-center border border-foreground/20 hover:bg-foreground/5 transition-colors cursor-pointer"
          >
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">$</span>
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase">
              {projectName || "integrity-scan"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 border border-foreground/15 ${cfg.color}`}
          >
            <div className={`w-1.5 h-1.5 ${cfg.dot}`} />
            <Radio size={10} />
            <span className="text-[9px] font-mono tracking-widest uppercase">
              {cfg.label}
            </span>
          </motion.div>

          <Link
            href="/"
            className="flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={10} />
            EXIT
          </Link>
        </div>
      </div>
    </header>
  );
}
