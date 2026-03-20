"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/src/components/shared/theme-toggle";
import { EASE } from "@/src/config/constants";

export function Navbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="w-full px-4 pt-4 lg:px-6 lg:pt-6"
    >
      <nav className="w-full border border-foreground/20 bg-background/80 backdrop-blur-sm px-6 py-3 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <Shield size={16} className="text-[#ea580c]" />
            <span className="text-xs font-mono tracking-[0.15em] uppercase font-bold">
              INTEGRITY SCORE
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {["Analyze", "Methodology", "About"].map((link, i) => (
              <motion.a
                key={link}
                href="#"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + i * 0.06,
                  duration: 0.4,
                  ease: EASE,
                }}
                className="text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link}
              </motion.a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </nav>
    </motion.div>
  );
}
