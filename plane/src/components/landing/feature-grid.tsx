"use client";

import { motion } from "framer-motion";
import { EASE, ANALYSIS_LAYERS } from "@/src/config/constants";

export function FeatureGrid() {
  return (
    <section className="w-full px-6 py-20 lg:px-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-4 mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// SECTION: ANALYSIS_LAYERS"}
        </span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          004
        </span>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 md:grid-cols-2 border-2 border-foreground"
      >
        {ANALYSIS_LAYERS.map((f, i) => (
          <motion.div
            key={f.label}
            custom={i}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: (idx: number) => ({
                opacity: 1,
                y: 0,
                transition: { delay: idx * 0.1, duration: 0.6, ease: EASE },
              }),
            }}
            className={`p-6 min-h-[180px] flex flex-col justify-between ${
              i % 2 === 0 ? "md:border-r-2" : ""
            } ${i < 2 ? "border-b-2" : ""} border-foreground`}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono mb-3">
              {f.label}
            </span>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
