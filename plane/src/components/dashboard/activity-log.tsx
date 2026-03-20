"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";

export interface LogEntry {
  timestamp: string;
  layer: string;
  message: string;
  type: "info" | "warn" | "error" | "ok";
}

const TYPE_PREFIX = {
  info: ">>>",
  warn: "!>>",
  error: "ERR",
  ok: " OK",
};

const TYPE_COLORS = {
  info: "text-foreground/60",
  warn: "text-[#eab308]",
  error: "text-[#ef4444]",
  ok: "text-[#22c55e]",
};

interface ActivityLogProps {
  logs: LogEntry[];
}

export function ActivityLog({ logs }: ActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="border-2 border-foreground h-full flex flex-col">
      <div className="flex items-center justify-between border-b-2 border-foreground px-3 py-1.5">
        <span className="text-[9px] tracking-widest text-muted-foreground uppercase font-mono">
          stdout
        </span>
        <span className="text-[9px] tracking-widest text-muted-foreground font-mono tabular-nums">
          {logs.length}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-[10px] leading-[1.6] bg-foreground/[0.02]"
      >
        {logs.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <span className="text-[9px] font-mono tracking-widest text-muted-foreground/40 uppercase">
              $ awaiting input_
            </span>
          </div>
        ) : (
          <div className="px-3 py-2">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: EASE }}
                className="flex gap-2"
              >
                <span className="text-muted-foreground/40 shrink-0 tabular-nums select-none">
                  {log.timestamp}
                </span>
                <span className={`shrink-0 ${TYPE_COLORS[log.type]}`}>
                  {TYPE_PREFIX[log.type]}
                </span>
                <span className="text-foreground/80">
                  <span className="text-muted-foreground">[{log.layer}]</span>{" "}
                  {log.message}
                </span>
              </motion.div>
            ))}
            <span className="text-muted-foreground/30 animate-blink">_</span>
          </div>
        )}
      </div>
    </div>
  );
}
