"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Coins,
  Twitter,
  Vote,
  ArrowRight,
  Zap,
  Loader2,
} from "lucide-react";
import { sampleProject } from "@/src/lib/sample-data";

const ease = [0.22, 1, 0.36, 1] as const;

interface ProjectFormProps {
  onSubmit: (data: {
    projectName: string;
    githubUrl: string;
    tokenAddress: string;
    chain: string;
    twitterHandle: string;
    governanceSpace: string;
    demo: boolean;
  }) => void;
  loading: boolean;
}

const FIELDS: {
  key: string;
  label: string;
  placeholder: string;
  icon: typeof Zap;
  required?: boolean;
}[] = [
  {
    key: "projectName",
    label: "PROJECT NAME",
    placeholder: "e.g. NexusNet",
    icon: Zap,
    required: true,
  },
  {
    key: "githubUrl",
    label: "GITHUB URL",
    placeholder: "https://github.com/org/repo",
    icon: Github,
  },
  {
    key: "tokenAddress",
    label: "TOKEN CONTRACT",
    placeholder: "0x1234...abcd",
    icon: Coins,
  },
  {
    key: "twitterHandle",
    label: "TWITTER/X HANDLE",
    placeholder: "@projecthandle",
    icon: Twitter,
  },
  {
    key: "governanceSpace",
    label: "GOVERNANCE SPACE",
    placeholder: "project.eth (Snapshot)",
    icon: Vote,
  },
];

export function ProjectForm({ onSubmit, loading }: ProjectFormProps) {
  const [form, setForm] = useState({
    projectName: "",
    githubUrl: "",
    tokenAddress: "",
    chain: "ethereum",
    twitterHandle: "",
    governanceSpace: "",
  });

  function fillDemo() {
    setForm({
      projectName: sampleProject.projectName,
      githubUrl: sampleProject.githubUrl || "",
      tokenAddress: sampleProject.tokenAddress || "",
      chain: sampleProject.chain || "ethereum",
      twitterHandle: sampleProject.twitterHandle || "",
      governanceSpace: sampleProject.governanceSpace || "",
    });
  }

  function handleSubmit(demo: boolean) {
    if (!form.projectName) return;
    onSubmit({ ...form, demo });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="w-full max-w-xl border-2 border-foreground"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">
          project_input.cfg
        </span>
        <button
          onClick={fillDemo}
          className="text-[10px] tracking-widest text-[#ea580c] uppercase font-mono hover:underline cursor-pointer"
        >
          LOAD DEMO
        </button>
      </div>

      {/* Form fields */}
      <div className="flex flex-col">
        {FIELDS.map((field, i) => {
          const Icon = field.icon;
          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease }}
              className="flex items-center border-b border-foreground/20 last:border-b-0"
            >
              <div className="flex items-center justify-center w-10 h-10 border-r border-foreground/20 shrink-0">
                <Icon size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 flex flex-col px-3 py-2">
                <label className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-0.5">
                  {field.label}
                  {field.required && (
                    <span className="text-[#ea580c] ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground/50 outline-none w-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Submit buttons */}
      <div className="flex border-t-2 border-foreground">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSubmit(true)}
          disabled={loading || !form.projectName}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-foreground text-background text-xs font-mono tracking-widest uppercase disabled:opacity-40 cursor-pointer border-r border-foreground"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          {loading ? "ANALYZING..." : "DEMO MODE"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSubmit(false)}
          disabled={loading || !form.projectName}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#ea580c] text-white text-xs font-mono tracking-widest uppercase disabled:opacity-40 cursor-pointer"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ArrowRight size={14} />
          )}
          {loading ? "ANALYZING..." : "LIVE ANALYSIS"}
        </motion.button>
      </div>
    </motion.div>
  );
}
