"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Link2,
  Plus,
  Loader2,
  RefreshCw,
  Trash2,
  Circle,
  Wifi,
  WifiOff,
  Clock,
  X,
} from "lucide-react";

interface AppStatus {
  name: string;
  url: string;
  status: "online" | "offline" | "error" | "checking";
  latency?: number;
  entities?: number;
  version?: string;
  lastCheck?: string;
  error?: string;
}

export default function StatusPage() {
  const [apps, setApps] = useState<AppStatus[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("eximia-hub-status");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [checking, setChecking] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("eximia-hub-status", JSON.stringify(apps));
  }, [apps]);

  async function checkApp(app: AppStatus): Promise<AppStatus> {
    try {
      const start = Date.now();
      const res = await fetch("/api/test-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: app.url.replace(/\/$/, "") + "/api/v1/integration/catalog",
          method: "GET",
          api_key: "status-check",
        }),
      });
      const data = await res.json();
      const latency = Date.now() - start;

      if (data.status === 200 && data.body?.contract === "eximia-integration/v1") {
        return {
          ...app,
          status: "online",
          latency,
          entities: Object.keys(data.body.entities ?? {}).length,
          version: data.body.version,
          lastCheck: new Date().toISOString(),
          error: undefined,
        };
      } else {
        return {
          ...app,
          status: "error",
          latency,
          lastCheck: new Date().toISOString(),
          error: `HTTP ${data.status}`,
        };
      }
    } catch {
      return {
        ...app,
        status: "offline",
        lastCheck: new Date().toISOString(),
        error: "Não alcançável",
      };
    }
  }

  async function addApp() {
    if (!newUrl.trim()) return;
    const url = newUrl.replace(/\/$/, "");
    const name = url.replace(/https?:\/\//, "").replace(/\.eximiaventures\.com\.br.*/, "").replace(/localhost:\d+/, "localhost");

    const app: AppStatus = { name, url, status: "checking" };
    setApps((prev) => [...prev, app]);
    setShowAdd(false);
    setNewUrl("");

    const result = await checkApp(app);
    setApps((prev) => prev.map((a) => (a.url === url ? result : a)));
  }

  async function refreshAll() {
    setChecking(true);
    setApps((prev) => prev.map((a) => ({ ...a, status: "checking" as const })));

    const results = await Promise.all(apps.map(checkApp));
    setApps(results);
    setChecking(false);
  }

  async function refreshOne(url: string) {
    setApps((prev) => prev.map((a) => (a.url === url ? { ...a, status: "checking" as const } : a)));
    const app = apps.find((a) => a.url === url);
    if (app) {
      const result = await checkApp(app);
      setApps((prev) => prev.map((a) => (a.url === url ? result : a)));
    }
  }

  function removeApp(url: string) {
    setApps((prev) => prev.filter((a) => a.url !== url));
  }

  const online = apps.filter((a) => a.status === "online").length;
  const total = apps.length;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      <header className="relative border-b border-[rgba(232,224,213,0.06)] sticky top-0 bg-bg/80 backdrop-blur-xl z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted hover:text-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <Link2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary">eximIA Hub</span>
              <span className="text-xs font-mono text-muted tracking-wider">/ status</span>
            </div>
          </div>
          {apps.length > 0 && (
            <button
              onClick={refreshAll}
              disabled={checking}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>
      </header>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl mb-1">Ecosystem Status</h1>
            {total > 0 && (
              <p className="text-xs text-muted">
                {online}/{total} online
              </p>
            )}
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-xs rounded-md hover:bg-accent/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar App
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="flex gap-2 mb-6 animate-fade-in">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://profiler.eximiaventures.com.br"
              className="flex-1 px-3 py-2.5 bg-bg border border-[rgba(232,224,213,0.08)] rounded-md text-sm text-primary placeholder:text-muted/40 focus:border-accent/50 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && addApp()}
            />
            <button
              onClick={addApp}
              disabled={!newUrl.trim()}
              className="px-4 py-2.5 bg-accent text-bg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-40"
            >
              Verificar
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewUrl(""); }}
              className="p-2.5 text-muted hover:text-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* App list */}
        {apps.length === 0 ? (
          <div className="text-center py-16">
            <Wifi className="w-10 h-10 text-muted/20 mx-auto mb-4" />
            <p className="text-sm text-muted mb-1">Nenhum app monitorado</p>
            <p className="text-xs text-muted/60">
              Adicione URLs de apps eximIA para monitorar se estão online e respondendo ao contrato.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {apps.map((app) => (
              <div
                key={app.url}
                className="flex items-center gap-4 p-4 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md"
              >
                {/* Status */}
                {app.status === "checking" ? (
                  <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
                ) : app.status === "online" ? (
                  <Circle className="w-3 h-3 fill-sage text-sage shrink-0" />
                ) : app.status === "error" ? (
                  <Circle className="w-3 h-3 fill-warning text-warning shrink-0" />
                ) : (
                  <Circle className="w-3 h-3 fill-danger text-danger shrink-0" />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">{app.name}</span>
                    {app.version && (
                      <span className="text-[10px] text-muted">v{app.version}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted truncate">{app.url}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[10px] text-muted shrink-0">
                  {app.entities !== undefined && (
                    <span>{app.entities} entidade{app.entities !== 1 ? "s" : ""}</span>
                  )}
                  {app.latency !== undefined && (
                    <span className="font-mono">{app.latency}ms</span>
                  )}
                  {app.error && (
                    <span className="text-danger/60">{app.error}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => refreshOne(app.url)}
                    className="p-1.5 rounded hover:bg-elevated/50 text-muted hover:text-secondary transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeApp(app.url)}
                    className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
