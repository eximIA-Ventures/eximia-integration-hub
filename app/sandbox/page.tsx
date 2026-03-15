"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Loader2,
  Globe,
  Link2,
  Database,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowDownToLine,
} from "lucide-react";

interface EntitySchema {
  [field: string]: { type: string; readonly?: boolean; required?: boolean; description?: string };
}

interface CatalogEntity {
  operations: string[];
  schema: EntitySchema;
  description?: string;
}

interface Catalog {
  app: string;
  version: string;
  contract: string;
  entities: Record<string, CatalogEntity>;
}

interface EntityData {
  data: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export default function SandboxPage() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [entityData, setEntityData] = useState<Record<string, EntityData>>({});
  const [loading, setLoading] = useState(false);
  const [loadingEntity, setLoadingEntity] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  async function proxyFetch(targetUrl: string, method = "GET") {
    const res = await fetch("/api/test-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl, method, api_key: apiKey }),
    });
    return res.json();
  }

  async function connect() {
    if (!url.trim() || !apiKey.trim()) return;
    setLoading(true);
    setError("");
    setCatalog(null);
    setEntityData({});

    try {
      const baseUrl = url.replace(/\/$/, "");
      const res = await proxyFetch(baseUrl + "/api/v1/integration/catalog");

      if (res.status !== 200) throw new Error(`${res.status} — ${JSON.stringify(res.body)}`);
      if (res.body.contract !== "eximia-integration/v1") throw new Error("Contrato incompatível");

      setCatalog(res.body);

      // Auto-fetch all entities
      const data: Record<string, EntityData> = {};
      for (const [name, entity] of Object.entries(res.body.entities as Record<string, CatalogEntity>)) {
        if (entity.operations.includes("list")) {
          const listRes = await proxyFetch(baseUrl + `/api/v1/integration/${name}?page=1&limit=10`);
          if (listRes.status === 200) {
            data[name] = listRes.body;
          }
        }
      }
      setEntityData(data);
      if (Object.keys(data).length > 0) {
        setExpandedEntity(Object.keys(data)[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function refreshEntity(name: string) {
    setLoadingEntity(name);
    const baseUrl = url.replace(/\/$/, "");
    const res = await proxyFetch(baseUrl + `/api/v1/integration/${name}?page=1&limit=10`);
    if (res.status === 200) {
      setEntityData((prev) => ({ ...prev, [name]: res.body }));
    }
    setLoadingEntity(null);
  }

  function getColumns(entity: CatalogEntity): string[] {
    return Object.keys(entity.schema);
  }

  function formatValue(val: unknown): string {
    if (val === null || val === undefined) return "—";
    if (typeof val === "object") return JSON.stringify(val).slice(0, 60) + (JSON.stringify(val).length > 60 ? "…" : "");
    if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(val).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
    }
    return String(val);
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-[rgba(232,224,213,0.06)] sticky top-0 bg-bg/80 backdrop-blur-xl z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted hover:text-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <Link2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary">eximIA Hub</span>
              <span className="text-xs font-mono text-muted tracking-wider">/ sandbox</span>
            </div>
          </div>
          <Link href="/test" className="text-xs text-muted hover:text-accent transition-colors">
            Contract Tester →
          </Link>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-6 py-8">

        {/* Connection */}
        <div className="p-5 bg-surface/50 border border-[rgba(232,224,213,0.05)] rounded-md mb-6">
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">
                App URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                  className="w-full pl-9 pr-3 py-2.5 bg-bg border border-[rgba(232,224,213,0.08)] rounded-md text-sm text-primary placeholder:text-muted/40 focus:border-accent/50 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="eximia_..."
                className="w-full px-3 py-2.5 bg-bg border border-[rgba(232,224,213,0.08)] rounded-md text-sm font-mono text-primary placeholder:text-muted/40 focus:border-accent/50 focus:outline-none"
              />
            </div>
            <button
              onClick={connect}
              disabled={!url.trim() || !apiKey.trim() || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-bg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
              {loading ? "Puxando..." : "Puxar Dados"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/15 rounded-md mb-6 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
            <p className="text-sm text-danger/80">{error}</p>
          </div>
        )}

        {/* Connected */}
        {catalog && (
          <div className="animate-fade-in">
            {/* App info */}
            <div className="flex items-center gap-3 p-4 bg-sage/5 border border-sage/15 rounded-md mb-6">
              <Check className="w-4 h-4 text-sage shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium text-sage">{catalog.app}</span>
                <span className="text-xs text-sage/50 ml-2">v{catalog.version}</span>
              </div>
              <div className="flex gap-2">
                {Object.keys(catalog.entities).map((name) => (
                  <span key={name} className="px-2 py-0.5 text-[10px] bg-sage/10 text-sage rounded">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Entity tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto">
              {Object.entries(catalog.entities).map(([name, entity]) => {
                const count = entityData[name]?.meta?.total ?? 0;
                return (
                  <button
                    key={name}
                    onClick={() => setExpandedEntity(expandedEntity === name ? null : name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      expandedEntity === name
                        ? "bg-accent/10 text-accent"
                        : "bg-surface/50 text-muted hover:text-secondary"
                    }`}
                  >
                    <Database className="w-3 h-3" />
                    {name}
                    {count > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-white/[0.06] rounded">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Entity data table */}
            {expandedEntity && catalog.entities[expandedEntity] && (
              <div className="bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md overflow-hidden animate-fade-in">
                {/* Table header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(232,224,213,0.06)]">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-primary">{expandedEntity}</code>
                    {entityData[expandedEntity] && (
                      <span className="text-[10px] text-muted">
                        {entityData[expandedEntity].meta.total} registro{entityData[expandedEntity].meta.total !== 1 ? "s" : ""}
                        {" · "}pg {entityData[expandedEntity].meta.page}/{entityData[expandedEntity].meta.pages}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => refreshEntity(expandedEntity)}
                    disabled={loadingEntity === expandedEntity}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-muted hover:text-accent transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingEntity === expandedEntity ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {entityData[expandedEntity] ? (
                  entityData[expandedEntity].data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[rgba(232,224,213,0.04)]">
                            {getColumns(catalog.entities[expandedEntity]).map((col) => (
                              <th
                                key={col}
                                className="px-4 py-2 text-left text-[10px] font-mono text-muted uppercase tracking-wider"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {entityData[expandedEntity].data.map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-[rgba(232,224,213,0.02)] hover:bg-elevated/20 transition-colors"
                            >
                              {getColumns(catalog.entities[expandedEntity]).map((col) => (
                                <td
                                  key={col}
                                  className="px-4 py-2.5 text-[11px] text-secondary font-mono max-w-[200px] truncate"
                                  title={String(row[col] ?? "")}
                                >
                                  {formatValue(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-muted">
                      Nenhum registro encontrado
                    </div>
                  )
                ) : (
                  <div className="px-4 py-8 text-center text-xs text-muted">
                    Entidade sem suporte a listagem
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!catalog && !error && !loading && (
          <div className="text-center py-16">
            <Database className="w-10 h-10 text-muted/20 mx-auto mb-4" />
            <p className="text-sm text-muted mb-1">Sandbox de Integração</p>
            <p className="text-xs text-muted/60">
              Cole a URL e API key de um app para puxar dados reais via contrato eximIA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
