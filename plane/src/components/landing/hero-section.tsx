"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EASE } from "@/src/config/constants";

export function HeroSection() {
  return (
    <section className="relative w-full px-12 pt-6 pb-12 lg:px-24 lg:pt-10 lg:pb-16">
      <div className="flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-2 select-none font-bold"
        >
          VERIFY. SCORE.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          className="w-full max-w-lg my-4 lg:my-6 border-2 border-foreground"
        >
          <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2">
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">
              agent_pipeline.sys
            </span>
            <span className="text-[10px] tracking-widest text-[#ea580c] animate-blink font-mono">
              LIVE
            </span>
          </div>
          <pre className="text-[8px] sm:text-[10px] leading-[1.4] font-mono px-4 py-4 text-foreground/80 select-none overflow-x-auto">
{`  ┌──────────────────────────────────┐
  │       ORCHESTRATOR AGENT         │
  └──┬───────┬───────┬───────┬──────┘
     │       │       │       │
     ▼       ▼       ▼       ▼
  ┌─────┐┌─────┐┌─────┐┌──────┐
  │CHAIN││ DEV ││SOCIAL││ GOV  │
  │AGENT││AGENT││AGENT ││AGENT │
  └──┬──┘└──┬──┘└──┬──┘└──┬───┘
     │       │       │       │
     ▼       ▼       ▼       ▼
  ┌──────────────────────────────────┐
  │     SYNTHESIS ENGINE             │
  │  Recursive Summarization ×3     │
  │  Micro-Signals → Impact Vectors │
  │  → Divergence Gap Scoring       │
  └──────────────────────────────────┘`}
          </pre>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-4 select-none font-bold"
          aria-hidden="true"
        >
          FUND.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
          className="text-xs lg:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed font-mono"
        >
          AI-powered integrity scoring for DePIN and public goods projects.
          4-layer analysis with recursive summarization to surface divergences
          between marketing claims and reality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href="/dashboard"
            className="group flex items-center gap-0 bg-foreground text-background text-sm font-mono tracking-wider uppercase"
          >
            <span className="flex items-center justify-center w-10 h-10 bg-[#ea580c]">
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="text-background"
              />
            </span>
            <span className="px-5 py-2.5">Analyze Project</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
