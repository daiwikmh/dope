"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Plus, Trash2, Loader2 } from "lucide-react";
import { EASE } from "@/src/config/constants";

interface SettingsData {
  keys: Record<string, boolean>;
  model: string;
  database: boolean;
  agentCount: number;
  waves: number;
}

interface CliKey {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

const KEY_LABELS: Record<string, string> = {
  openrouter: "OPENROUTER",
  etherscan: "ETHERSCAN V2",
  alchemy: "ALCHEMY RPC",
  dune: "DUNE ANALYTICS",
  github: "GITHUB TOKEN",
};

export function SettingsView() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [cliKeys, setCliKeys] = useState<CliKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(() => {
    fetch("/api/keys")
      .then((r) => r.json())
      .then((d) => setCliKeys(d.keys ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    loadKeys();
  }, [loadKeys]);

  async function handleCreateKey() {
    if (!newKeyName.trim() || creatingKey) return;
    setCreatingKey(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const d = await res.json();
      if (!res.ok) return;
      setRevealedKey(d.key);
      setNewKeyName("");
      loadKeys();
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleDeleteKey(id: string) {
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadKeys();
  }

  function copyKey() {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-[12px] font-mono text-muted-foreground/50 animate-pulse">
          LOADING...
        </span>
      </div>
    );
  }

  const sections = [
    {
      label: "API KEYS",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(data.keys).map(([key, configured]) => (
            <div
              key={key}
              className="flex items-center gap-2 py-1.5"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  configured ? "bg-green-500" : "bg-red-500/60"
                }`}
              />
              <span className="text-[12px] font-mono tracking-wider uppercase">
                {KEY_LABELS[key] ?? key}
              </span>
              <span className="text-[13px] font-mono text-muted-foreground/50 ml-auto">
                {configured ? "configured" : "not set"}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "MODEL",
      content: (
        <span className="text-[13px] font-mono text-muted-foreground/80 break-all">
          {data.model}
        </span>
      ),
    },
    {
      label: "PIPELINE",
      content: (
        <span className="text-[13px] font-mono text-muted-foreground/80">
          {data.agentCount} agents / {data.waves} waves
        </span>
      ),
    },
    {
      label: "DATABASE",
      content: (
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              data.database ? "bg-green-500" : "bg-red-500/60"
            }`}
          />
          <span className="text-[13px] font-mono text-muted-foreground/80">
            {data.database ? "Neon Postgres connected" : "not configured"}
          </span>
        </div>
      ),
    },
    {
      label: "CLI API KEYS",
      content: (
        <div className="space-y-3">
          <p className="text-[11px] font-mono text-muted-foreground/60 leading-relaxed">
            Generate keys to analyze projects via CLI. Pass as X-API-Key header to POST /api/cli/analyze
          </p>

          {/* revealed key banner */}
          {revealedKey && (
            <div className="border border-[#06b6d4]/40 rounded px-3 py-2 space-y-1">
              <span className="text-[10px] tracking-[0.15em] uppercase text-[#06b6d4] font-mono block">
                COPY NOW (shown once)
              </span>
              <div className="flex items-center gap-2">
                <code className="text-[12px] font-mono text-foreground break-all flex-1">
                  {revealedKey}
                </code>
                <button
                  onClick={copyKey}
                  className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Copy size={13} />
                </button>
              </div>
              {copied && (
                <span className="text-[10px] font-mono text-[#22c55e]">copied</span>
              )}
            </div>
          )}

          {/* existing keys */}
          {cliKeys.length > 0 && (
            <div className="space-y-1">
              {cliKeys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-2 py-1.5 border-b border-foreground/5 last:border-0"
                >
                  <span className="text-[12px] font-mono tracking-wider flex-1">
                    {k.name}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground/50">
                    {k.prefix}...
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/40">
                    {k.lastUsedAt
                      ? `used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                      : "never used"}
                  </span>
                  <button
                    onClick={() => handleDeleteKey(k.id)}
                    className="text-muted-foreground/40 hover:text-[#ef4444] cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* create new key */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
              placeholder="Key name, e.g. my-ci"
              className="flex-1 bg-transparent text-[12px] font-mono text-foreground placeholder:text-muted-foreground/30 outline-none border border-foreground/15 rounded px-2 py-1.5"
            />
            <button
              onClick={handleCreateKey}
              disabled={creatingKey || !newKeyName.trim()}
              className="flex items-center gap-1 px-3 py-1.5 bg-foreground text-background text-[11px] font-mono tracking-widest uppercase disabled:opacity-40 cursor-pointer rounded"
            >
              {creatingKey ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Plus size={11} />
              )}
              CREATE
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="flex-1 p-6 overflow-y-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <span className="text-[13px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-6">
        SETTINGS
      </span>

      <div className="max-w-lg space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.label}
            className="border border-foreground/15 rounded-xl p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06, ease: EASE }}
          >
            <span className="text-[13px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-3">
              {section.label}
            </span>
            {section.content}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
