"use client";

import { motion } from "framer-motion";
import { Shield, ArrowLeft, Terminal, Key, FileInput, Copy } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/src/components/shared/theme-toggle";

const EASE = [0.22, 1, 0.36, 1] as const;

function CodeBlock({ children, label }: { children: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="border border-foreground/15 rounded overflow-hidden">
      {label && (
        <div className="flex items-center justify-between border-b border-foreground/10 px-3 py-1.5">
          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 font-mono">
            {label}
          </span>
          <button onClick={copy} className="text-muted-foreground/40 hover:text-foreground cursor-pointer">
            {copied ? (
              <span className="text-[10px] font-mono text-[#22c55e]">copied</span>
            ) : (
              <Copy size={11} />
            )}
          </button>
        </div>
      )}
      <pre className="p-3 overflow-x-auto text-[12px] font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
}

const SECTIONS = [
  {
    id: "overview",
    title: "OVERVIEW",
    content: (
      <div className="space-y-3 text-[13px] font-mono text-muted-foreground/80 leading-relaxed">
        <p>
          Dope Doe is an AI-powered integrity scoring platform for DePIN and public goods projects. It runs a 3-wave agent pipeline that fetches real data from on-chain, GitHub, social, and governance sources, then evaluates project health across four layers.
        </p>
        <p>
          Projects can be submitted through the web dashboard or programmatically via the CLI API. Both paths produce the same IntegrityReport with a 0-100 score and detailed impact vectors.
        </p>
      </div>
    ),
  },
  {
    id: "quickstart",
    title: "CLI QUICKSTART",
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-[12px] tracking-[0.15em] uppercase text-foreground font-mono">
            1. Get an API key
          </h4>
          <p className="text-[12px] font-mono text-muted-foreground/70">
            Go to Dashboard &gt; Settings &gt; CLI API Keys and create a new key. Copy it immediately as it is shown only once.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="text-[12px] tracking-[0.15em] uppercase text-foreground font-mono">
            2. Submit a project
          </h4>
          <CodeBlock label="basic request">{`curl -X POST https://yourdomain.com/api/cli/analyze \\
  -H "X-API-Key: dd_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "MyProject",
    "githubUrl": "https://github.com/org/repo",
    "twitterHandle": "myproject",
    "contracts": [
      { "label": "Token", "address": "0x...", "chain": "ethereum" }
    ],
    "governanceSpace": "myproject.eth"
  }'`}</CodeBlock>
        </div>
        <div className="space-y-2">
          <h4 className="text-[12px] tracking-[0.15em] uppercase text-foreground font-mono">
            3. Wait for the report
          </h4>
          <p className="text-[12px] font-mono text-muted-foreground/70">
            The endpoint runs the full pipeline synchronously (30-60s depending on data availability) and returns the complete IntegrityReport as JSON.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "skillmd",
    title: "SKILL.MD INPUT",
    content: (
      <div className="space-y-4">
        <p className="text-[12px] font-mono text-muted-foreground/70 leading-relaxed">
          Instead of providing each field individually, you can pass a skill.md document. The system uses an LLM to extract project metadata (name, GitHub, contracts, social handles, governance) from the markdown content.
        </p>
        <CodeBlock label="via cli with skillmd">{`curl -X POST https://yourdomain.com/api/cli/analyze \\
  -H "X-API-Key: dd_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "skillmd": "# MyProject\\n\\nA decentralized compute network.\\n\\n## Links\\n- GitHub: https://github.com/org/repo\\n- Twitter: @myproject\\n\\n## Contracts\\n- Token: 0xabc...def (Ethereum)"
  }'`}</CodeBlock>
        <p className="text-[12px] font-mono text-muted-foreground/70 leading-relaxed">
          You can also use skill.md in the web dashboard by switching to the SKILL.MD tab in the analysis form. Paste a raw URL or the content directly and click PARSE to auto-populate all fields.
        </p>
      </div>
    ),
  },
  {
    id: "auth",
    title: "AUTHENTICATION",
    content: (
      <div className="space-y-3">
        <p className="text-[12px] font-mono text-muted-foreground/70 leading-relaxed">
          All CLI API requests require an API key passed via the <code className="text-foreground">X-API-Key</code> header. Keys are SHA-256 hashed before storage. Only the key prefix is visible in settings after creation.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { status: "401", desc: "Missing or invalid X-API-Key header" },
            { status: "400", desc: "Missing required fields (name or skillmd)" },
            { status: "500", desc: "Pipeline error (check API keys in .env)" },
            { status: "200", desc: "Success, returns IntegrityReport" },
          ].map((r) => (
            <div key={r.status} className="flex items-center gap-2 py-1">
              <span className={`text-[11px] font-mono font-bold ${r.status === "200" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                {r.status}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground/60">
                {r.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "request",
    title: "REQUEST BODY",
    content: (
      <div className="space-y-3">
        <p className="text-[12px] font-mono text-muted-foreground/70">
          POST /api/cli/analyze accepts the following fields. All are optional except you must provide either <code className="text-foreground">name</code> or <code className="text-foreground">skillmd</code>.
        </p>
        <div className="border border-foreground/15 rounded overflow-hidden">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="text-left px-3 py-1.5 tracking-[0.15em] uppercase text-muted-foreground/50">Field</th>
                <th className="text-left px-3 py-1.5 tracking-[0.15em] uppercase text-muted-foreground/50">Type</th>
                <th className="text-left px-3 py-1.5 tracking-[0.15em] uppercase text-muted-foreground/50">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {[
                ["name", "string", "Project name"],
                ["githubUrl", "string", "GitHub repository URL"],
                ["twitterHandle", "string", "Twitter/X handle"],
                ["tokenAddress", "string", "Primary token contract address"],
                ["chain", "string", "Blockchain network (default: ethereum)"],
                ["contracts", "array", '[{ label, address, chain }]'],
                ["governanceSpace", "string", "Snapshot governance space"],
                ["skillmd", "string", "Raw skill.md content (parsed by LLM)"],
              ].map(([field, type, desc]) => (
                <tr key={field}>
                  <td className="px-3 py-1.5 text-foreground">{field}</td>
                  <td className="px-3 py-1.5 text-muted-foreground/50">{type}</td>
                  <td className="px-3 py-1.5 text-muted-foreground/60">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: "response",
    title: "RESPONSE FORMAT",
    content: (
      <div className="space-y-3">
        <CodeBlock label="200 response shape">{`{
  "report": {
    "projectName": "MyProject",
    "integrityScore": 62,
    "verdict": "strong",
    "executiveSummary": "...",
    "impactVectors": [...],
    "layerScores": {
      "onchain": 71,
      "development": 55,
      "social": 68,
      "governance": 54
    },
    "recommendations": [...]
  },
  "projectId": "uuid",
  "dataOutputs": { ... },
  "evalOutputs": [ ... ]
}`}</CodeBlock>
        <p className="text-[12px] font-mono text-muted-foreground/70 leading-relaxed">
          The report follows the IntegrityReport schema. <code className="text-foreground">dataOutputs</code> contains raw data from each fetcher layer. <code className="text-foreground">evalOutputs</code> contains per-layer scoring with signals.
        </p>
      </div>
    ),
  },
  {
    id: "pipeline",
    title: "PIPELINE ARCHITECTURE",
    content: (
      <div className="space-y-3">
        <p className="text-[12px] font-mono text-muted-foreground/70 leading-relaxed">
          The analysis pipeline runs in 3 waves. Each wave completes before the next begins.
        </p>
        <div className="space-y-2">
          {[
            {
              wave: "WAVE 1",
              label: "DATA FETCHERS",
              desc: "4 parallel agents fetch from Etherscan, GitHub API, Dune/Twitter, and Snapshot governance",
            },
            {
              wave: "WAVE 2",
              label: "EVAL AGENTS",
              desc: "4 parallel LLM agents score each layer (on-chain, development, social, governance) independently",
            },
            {
              wave: "WAVE 3",
              label: "SYNTHESIS",
              desc: "Single agent groups signals into impact vectors, computes divergence scoring, produces final IntegrityReport",
            },
          ].map((w) => (
            <div key={w.wave} className="flex gap-3 items-start">
              <span className="text-[10px] tracking-[0.15em] uppercase text-[#06b6d4] font-mono w-16 shrink-0 pt-0.5">
                {w.wave}
              </span>
              <div>
                <span className="text-[12px] font-mono text-foreground block">{w.label}</span>
                <span className="text-[11px] font-mono text-muted-foreground/60">{w.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full px-4 pt-4 lg:px-6 lg:pt-6"
      >
        <div className="w-full border border-foreground/20 bg-background/80 backdrop-blur-sm px-6 py-3 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Shield size={18} className="text-[#06b6d4]" />
                <span className="text-sm font-mono tracking-[0.15em] uppercase font-bold">
                  DOPE
                </span>
              </Link>
              <span className="text-muted-foreground/30 font-mono">/</span>
              <span className="text-sm font-mono tracking-[0.15em] uppercase text-muted-foreground">
                DOCS
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                DASHBOARD
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Terminal size={16} className="text-[#06b6d4]" />
            <h1 className="text-[14px] tracking-[0.2em] uppercase font-mono font-bold">
              CLI & API DOCUMENTATION
            </h1>
          </div>
          <p className="text-[13px] font-mono text-muted-foreground/70 leading-relaxed">
            Submit projects for integrity analysis programmatically. Generate an API key, send a request, get an IntegrityReport back.
          </p>
        </motion.div>

        {/* TOC */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
          className="border border-foreground/15 rounded-xl p-4 mb-8"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 font-mono block mb-2">
            CONTENTS
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[11px] font-mono tracking-wider text-[#06b6d4] hover:underline"
              >
                {s.title}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section, i) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.04, ease: EASE }}
              className="border border-foreground/15 rounded-xl overflow-hidden"
            >
              <div className="border-b border-foreground/10 px-4 py-2">
                <span className="text-[12px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  {section.title}
                </span>
              </div>
              <div className="p-4">{section.content}</div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
