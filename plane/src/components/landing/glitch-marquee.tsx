"use client";

import { motion } from "framer-motion";
import { EASE, TECH_STACK } from "@/src/config/constants";

export function GlitchMarquee() {
  return (
    <section className="w-full py-16 px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-4 mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// STACK: TECHNOLOGY"}
        </span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          008
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="overflow-hidden border-2 border-foreground"
      >
        <div
          className="flex animate-marquee"
          style={{ width: "max-content" }}
        >
          {[...TECH_STACK, ...TECH_STACK].map((name, i) => (
            <div
              key={`${name}-${i}`}
              className={`flex items-center justify-center px-8 py-4 border-r-2 border-foreground shrink-0 ${
                i % 5 === 2 ? "animate-glitch" : ""
              }`}
            >
              <span className="text-sm font-mono tracking-[0.15em] uppercase text-foreground whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
