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
  Plus,
  X,
  FileInput,
  Globe,
  Video,
  Image,
  FileText,
} from "lucide-react";
import { sampleProject } from "@/src/lib/sample-data";
import type { ContractEntry } from "@/src/lib/sample-data";

const ease = [0.22, 1, 0.36, 1] as const;

interface ProjectFormProps {
  onSubmit: (data: {
    projectName: string;
    githubUrl: string;
    tokenAddress: string;
    chain: string;
    contracts: ContractEntry[];
    twitterHandle: string;
    governanceSpace: string;
    description: string;
    websiteUrl: string;
    videoUrl: string;
    logoUrl: string;
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
    required: true,
  },
  {
    key: "websiteUrl",
    label: "WEBSITE",
    placeholder: "https://myproject.xyz",
    icon: Globe,
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
  {
    key: "videoUrl",
    label: "VIDEO URL",
    placeholder: "https://youtube.com/watch?v=...",
    icon: Video,
  },
  {
    key: "logoUrl",
    label: "LOGO URL",
    placeholder: "https://example.com/logo.png",
    icon: Image,
  },
];

export function ProjectForm({ onSubmit, loading }: ProjectFormProps) {
  const [inputMode, setInputMode] = useState<"manual" | "skillmd">("manual");
  const [skillmdUrl, setSkillmdUrl] = useState("");
  const [skillmdText, setSkillmdText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [form, setForm] = useState({
    projectName: "",
    githubUrl: "",
    chain: "ethereum",
    twitterHandle: "",
    governanceSpace: "",
    description: "",
    websiteUrl: "",
    videoUrl: "",
    logoUrl: "",
  });
  const [contracts, setContracts] = useState<ContractEntry[]>([
    { label: "", address: "", chain: "ethereum" },
  ]);

  async function handleParse() {
    if (!skillmdUrl && !skillmdText) return;
    setParsing(true);
    setParseError(null);
    try {
      const res = await fetch("/api/parse-skillmd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          skillmdUrl ? { url: skillmdUrl } : { text: skillmdText }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      setForm({
        projectName: data.name || "",
        githubUrl: data.githubUrl || "",
        chain: data.chain || "ethereum",
        twitterHandle: data.twitterHandle || "",
        governanceSpace: data.governanceSpace || "",
        description: data.description || "",
        websiteUrl: data.websiteUrl || "",
        videoUrl: data.videoUrl || "",
        logoUrl: data.logoUrl || "",
      });
      if (data.contracts?.length) {
        setContracts(data.contracts);
      } else if (data.tokenAddress) {
        setContracts([{ label: "Token", address: data.tokenAddress, chain: data.chain || "ethereum" }]);
      }
      setInputMode("manual");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Parse failed");
    } finally {
      setParsing(false);
    }
  }

  function fillDemo() {
    setForm({
      projectName: sampleProject.projectName,
      githubUrl: sampleProject.githubUrl || "",
      chain: sampleProject.chain || "ethereum",
      twitterHandle: sampleProject.twitterHandle || "",
      governanceSpace: sampleProject.governanceSpace || "",
      description: "",
      websiteUrl: "",
      videoUrl: "",
      logoUrl: "",
    });
    setContracts(
      sampleProject.contracts ?? [
        { label: "Token", address: sampleProject.tokenAddress || "", chain: "ethereum" },
      ]
    );
  }

  function addContract() {
    setContracts((prev) => [...prev, { label: "", address: "", chain: "ethereum" }]);
  }

  function removeContract(i: number) {
    setContracts((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateContract(i: number, field: keyof ContractEntry, value: string) {
    setContracts((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    );
  }

  function handleSubmit(demo: boolean) {
    if (!form.projectName) return;
    const validContracts = contracts.filter((c) => c.address.trim());
    onSubmit({
      ...form,
      tokenAddress: validContracts[0]?.address || "",
      contracts: validContracts,
      description: form.description,
      websiteUrl: form.websiteUrl,
      videoUrl: form.videoUrl,
      logoUrl: form.logoUrl,
      demo,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="w-full max-w-xl border border-foreground/15 rounded-xl overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2">
        <span className="text-[12px] tracking-widest text-muted-foreground uppercase font-mono">
          project_input.cfg
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={fillDemo}
            className="text-[12px] tracking-widest text-[#06b6d4] uppercase font-mono hover:underline cursor-pointer"
          >
            LOAD DEMO
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex border-b border-foreground/10">
        <button
          onClick={() => setInputMode("manual")}
          className={`flex-1 py-2 text-[11px] tracking-[0.2em] uppercase font-mono cursor-pointer transition-colors ${
            inputMode === "manual"
              ? "text-foreground bg-foreground/5"
              : "text-muted-foreground/50 hover:text-muted-foreground"
          }`}
        >
          MANUAL
        </button>
        <button
          onClick={() => setInputMode("skillmd")}
          className={`flex-1 py-2 text-[11px] tracking-[0.2em] uppercase font-mono cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
            inputMode === "skillmd"
              ? "text-foreground bg-foreground/5"
              : "text-muted-foreground/50 hover:text-muted-foreground"
          }`}
        >
          <FileInput size={11} />
          SKILL.MD
        </button>
      </div>

      {/* Skill.md input */}
      {inputMode === "skillmd" && (
        <div className="flex flex-col border-b border-foreground/20">
          <div className="px-4 py-3 space-y-3">
            <div>
              <label className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-mono block mb-1">
                SKILL.MD URL
              </label>
              <input
                type="text"
                value={skillmdUrl}
                onChange={(e) => { setSkillmdUrl(e.target.value); setSkillmdText(""); }}
                placeholder="https://raw.githubusercontent.com/org/repo/main/skill.md"
                className="bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground/30 outline-none w-full border border-foreground/15 rounded px-2 py-1.5"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-foreground/10" />
              <span className="text-[10px] tracking-[0.15em] text-muted-foreground/40 font-mono">OR</span>
              <div className="flex-1 h-px bg-foreground/10" />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-mono block mb-1">
                PASTE CONTENT
              </label>
              <textarea
                value={skillmdText}
                onChange={(e) => { setSkillmdText(e.target.value); setSkillmdUrl(""); }}
                placeholder="Paste skill.md content here..."
                rows={6}
                className="bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground/30 outline-none w-full border border-foreground/15 rounded px-2 py-1.5 resize-none"
              />
            </div>
            {parseError && (
              <p className="text-[11px] font-mono text-[#ef4444]">{parseError}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleParse}
              disabled={parsing || (!skillmdUrl && !skillmdText)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground text-background text-xs font-mono tracking-widest uppercase disabled:opacity-40 cursor-pointer rounded"
            >
              {parsing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileInput size={14} />
              )}
              {parsing ? "PARSING..." : "PARSE"}
            </motion.button>
          </div>
        </div>
      )}

      {/* Standard fields */}
      {inputMode === "manual" && (
        <>
          <div className="flex flex-col">
            {FIELDS.map((field, i) => {
              const Icon = field.icon;
              return (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease }}
                  className="flex items-center border-b border-foreground/20"
                >
                  <div className="flex items-center justify-center w-10 h-10 border-r border-foreground/20 shrink-0">
                    <Icon size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 flex flex-col px-3 py-2">
                    <label className="text-[12px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-0.5">
                      {field.label}
                      {field.required && (
                        <span className="text-[#06b6d4] ml-1">*</span>
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

          {/* Description */}
          <div className="flex border-b border-foreground/20">
            <div className="flex items-center justify-center w-10 border-r border-foreground/20 shrink-0 pt-2">
              <FileText size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1 flex flex-col px-3 py-2">
              <label className="text-[12px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-0.5">
                DESCRIPTION
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief project description..."
                rows={2}
                className="bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground/50 outline-none w-full resize-none"
              />
            </div>
          </div>

          {/* Contracts section */}
          <div className="border-b border-foreground/20">
            <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/10">
              <span className="text-[12px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                CONTRACTS
              </span>
              <button
                onClick={addContract}
                className="flex items-center gap-1 text-[12px] font-mono tracking-wider uppercase text-[#06b6d4] hover:underline cursor-pointer"
              >
                <Plus size={10} />
                ADD
              </button>
            </div>
            {contracts.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3, ease }}
                className="flex items-center border-b border-foreground/10 last:border-b-0"
              >
                <div className="flex items-center justify-center w-10 h-10 border-r border-foreground/20 shrink-0">
                  <Coins size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 flex gap-2 px-3 py-2">
                  <div className="w-24 shrink-0">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/50 font-mono block mb-0.5">
                      LABEL
                    </label>
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => updateContract(i, "label", e.target.value)}
                      placeholder="Token"
                      className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/30 outline-none w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/50 font-mono block mb-0.5">
                      ADDRESS
                    </label>
                    <input
                      type="text"
                      value={c.address}
                      onChange={(e) => updateContract(i, "address", e.target.value)}
                      placeholder="0x..."
                      className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/30 outline-none w-full"
                    />
                  </div>
                  <div className="w-20 shrink-0">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/50 font-mono block mb-0.5">
                      CHAIN
                    </label>
                    <input
                      type="text"
                      value={c.chain ?? "ethereum"}
                      onChange={(e) => updateContract(i, "chain", e.target.value)}
                      placeholder="ethereum"
                      className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/30 outline-none w-full"
                    />
                  </div>
                </div>
                {contracts.length > 1 && (
                  <button
                    onClick={() => removeContract(i)}
                    className="px-2 text-muted-foreground/40 hover:text-[#ef4444] cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Submit buttons */}
          <div className="flex border-t border-foreground/10">
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
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#06b6d4] text-white text-xs font-mono tracking-widest uppercase disabled:opacity-40 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ArrowRight size={14} />
              )}
              {loading ? "ANALYZING..." : "LIVE ANALYSIS"}
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
}
