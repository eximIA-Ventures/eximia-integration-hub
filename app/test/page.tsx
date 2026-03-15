"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Globe,
  Play,
  ChevronDown,
  ChevronUp,
  Copy,
  Link2,
  ExternalLink,
} from "lucide-react";

interface CatalogEntity {
  operations: string[];
  schema: Record<string, { type: string; readonly?: boolean; required?: boolean; description?: string }>;
  description?: string;
}

interface Catalog {
  app: string;
  version: string;
  contract: string;
  entities: Record<string, CatalogEntity>;
  webhooks?: { available_events: string[] };
}

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  body: unknown;
  ok: boolean;
}

export default function TestPage() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<TestResult[]>([]);
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [testingEntity, setTestingEntity] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  // ─── Discovery ────────────────────────────────────────────────

  async function discover() {
    if (!url.trim() || !apiKey.trim()) return;
    setLoading(true);
    setError("");
    setCatalog(null);
    setResults([]);

    try {
      const baseUrl = url.replace(/\/$/, "");
      const res = await proxyFetch(baseUrl + "/api/v1/integration/catalog", "GET");

      if (!res.ok) {
        throw new Error(`${res.status} — ${typeof res.body === "object" ? JSON.stringify(res.body) : res.body}`);
      }

      const data = res.body as Catalog;
      if (data.contract !== "eximia-integration/v1") {
        throw new Error(`Contrato incompatível: ${data.contract}`);
      }

      setCatalog(data);
      setResults([{
        endpoint: "/api/v1/integration/catalog",
        method: "GET",
        status: res.status,
        duration: res.duration,
        body: data,
        ok: true,
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar");
    } finally {
      setLoading(false);
    }
  }

  // ─── Test entity operations ───────────────────────────────────

  async function testEntity(entityName: string, entity: CatalogEntity) {
    setTestingEntity(entityName);
    const baseUrl = url.replace(/\/$/, "");
    const newResults: TestResult[] = [];

    // Test LIST
    if (entity.operations.includes("list")) {
      const res = await proxyFetch(
        baseUrl + `/api/v1/integration/${entityName}?page=1&limit=5`,
        "GET"
      );
      newResults.push({
        endpoint: `/${entityName}?page=1&limit=5`,
        method: "GET",
        status: res.status,
        duration: res.duration,
        body: res.body,
        ok: res.ok,
      });

      // Test GET individual (if list returned data)
      if (res.ok && entity.operations.includes("get")) {
        const list = res.body as { data?: { id: string }[] };
        if (list.data && list.data.length > 0) {
          const firstId = list.data[0].id;
          const getRes = await proxyFetch(
            baseUrl + `/api/v1/integration/${entityName}/${firstId}`,
            "GET"
          );
          newResults.push({
            endpoint: `/${entityName}/${firstId}`,
            method: "GET",
            status: getRes.status,
            duration: getRes.duration,
            body: getRes.body,
            ok: getRes.ok,
          });
        }
      }
    }

    setResults((prev) => [...prev, ...newResults]);
    setTestingEntity(null);
  }

  async function testAllEntities() {
    if (!catalog) return;
    for (const [name, entity] of Object.entries(catalog.entities)) {
      await testEntity(name, entity);
    }
  }

  // ─── Proxy fetch through API route ────────────────────────────

  async function proxyFetch(
    targetUrl: string,
    method: string,
    body?: unknown
  ): Promise<{ ok: boolean; status: number; duration: number; body: unknown }> {
    const start = Date.now();
    try {
      const res = await fetch("/api/test-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, method, api_key: apiKey, body }),
      });
      const data = await res.json();
      return {
        ok: data.status >= 200 && data.status < 300,
        status: data.status,
        duration: Date.now() - start,
        body: data.body,
      };
    } catch {
      return { ok: false, status: 0, duration: Date.now() - start, body: "Network error" };
    }
  }

  function copyJson(index: number) {
    const result = results[index];
    navigator.clipboard.writeText(JSON.stringify(result.body, null, 2));
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-[rgba(232,224,213,0.06)] sticky top-0 bg-bg/80 backdrop-blur-xl z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted hover:text-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <Link2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary">eximIA Hub</span>
              <span className="text-xs font-mono text-muted tracking-wider">/ contract tester</span>
            </div>
          </div>
          <Link href="/docs" className="text-xs text-muted hover:text-accent transition-colors">
            Docs
          </Link>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl mb-2">Contract Tester</h1>
          <p className="text-sm text-secondary">
            Conecte a qualquer app eximIA, descubra o catálogo e teste cada operação.
          </p>
        </div>

        {/* Connection form */}
        <div className="p-5 bg-surface/50 border border-[rgba(232,224,213,0.05)] rounded-md mb-6">
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">
                URL base do app
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                  className="w-full pl-9 pr-3 py-2.5 bg-bg border border-[rgba(232,224,213,0.08)] rounded-md text-sm text-primary placeholder:text-muted/40 focus:border-accent/50 focus:outline-none transition-colors"
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
                placeholder="eximia_profiler_..."
                className="w-full px-3 py-2.5 bg-bg border border-[rgba(232,224,213,0.08)] rounded-md text-sm font-mono text-primary placeholder:text-muted/40 focus:border-accent/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={discover}
              disabled={!url.trim() || !apiKey.trim() || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-bg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Descobrindo..." : "Descobrir Catálogo"}
            </button>
            {catalog && (
              <button
                onClick={testAllEntities}
                disabled={!!testingEntity}
                className="flex items-center gap-2 px-5 py-2.5 border border-accent/20 text-accent text-sm rounded-md hover:bg-accent/5 transition-colors disabled:opacity-40"
              >
                <Play className="w-4 h-4" />
                Testar Todas
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/15 rounded-md mb-6 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
            <p className="text-sm text-danger/80">{error}</p>
          </div>
        )}

        {/* Catalog */}
        {catalog && (
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-3 p-4 bg-sage/5 border border-sage/15 rounded-md mb-4">
              <Check className="w-4 h-4 text-sage" />
              <div className="flex-1">
                <p className="text-sm font-medium text-sage">
                  {catalog.app} <span className="text-sage/50 font-normal">v{catalog.version}</span>
                </p>
                <p className="text-xs text-sage/60">
                  Contrato v1 válido — {Object.keys(catalog.entities).length} entidade(s)
                  {catalog.webhooks?.available_events?.length
                    ? ` · ${catalog.webhooks.available_events.length} webhook event(s)`
                    : ""}
                </p>
              </div>
            </div>

            {/* Entities */}
            <div className="space-y-3">
              {Object.entries(catalog.entities).map(([name, entity]) => (
                <div
                  key={name}
                  className="bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-primary">{name}</code>
                        {entity.description && (
                          <span className="text-xs text-muted">— {entity.description}</span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {entity.operations.map((op) => (
                          <span
                            key={op}
                            className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                              op === "create" || op === "update"
                                ? "bg-accent/10 text-accent"
                                : "bg-sage/10 text-sage"
                            }`}
                          >
                            {op}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => testEntity(name, entity)}
                      disabled={testingEntity === name}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors disabled:opacity-40"
                    >
                      {testingEntity === name ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      Testar
                    </button>
                  </div>

                  {/* Schema */}
                  <div className="px-4 pb-3 border-t border-[rgba(232,224,213,0.04)] pt-2">
                    <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">Schema</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {Object.entries(entity.schema).map(([field, def]) => (
                        <span key={field} className="text-[11px]">
                          <code className={`font-mono ${def.readonly ? "text-muted/60" : "text-secondary"}`}>
                            {field}
                          </code>
                          <span className="text-muted/40 ml-1">{def.type}</span>
                          {def.readonly && <span className="text-muted/30 ml-1 text-[9px]">ro</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-sm font-medium text-primary mb-3">
              Resultados ({results.length} chamada{results.length !== 1 ? "s" : ""})
            </h2>
            <div className="space-y-1.5">
              {results.map((r, i) => (
                <div key={i} className="bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md overflow-hidden">
                  <button
                    onClick={() => setExpandedResult(expandedResult === i ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-elevated/30 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${r.ok ? "bg-sage" : "bg-danger"}`} />
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold font-mono rounded ${
                        r.method === "GET" ? "bg-sage/10 text-sage"
                        : r.method === "POST" ? "bg-accent/10 text-accent"
                        : "bg-warning/10 text-warning"
                      }`}
                    >
                      {r.method}
                    </span>
                    <code className="text-[11px] font-mono text-secondary flex-1 truncate">
                      {r.endpoint}
                    </code>
                    <span className={`text-[11px] font-mono ${r.ok ? "text-sage" : "text-danger"}`}>
                      {r.status}
                    </span>
                    <span className="text-[10px] font-mono text-muted w-12 text-right">{r.duration}ms</span>
                    {expandedResult === i ? (
                      <ChevronUp className="w-3 h-3 text-muted" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-muted" />
                    )}
                  </button>

                  {expandedResult === i && (
                    <div className="border-t border-[rgba(232,224,213,0.04)] px-4 py-3 bg-[#0A0A0A]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Response Body</span>
                        <button
                          onClick={() => copyJson(i)}
                          className="flex items-center gap-1 text-[10px] text-muted hover:text-accent transition-colors"
                        >
                          {copied === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === i ? "Copiado" : "Copiar"}
                        </button>
                      </div>
                      <pre className="text-[11px] max-h-80 overflow-auto">
                        <code>{JSON.stringify(r.body, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
