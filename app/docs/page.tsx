"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Key,
  Link2,
  AlertCircle,
  Webhook,
  Copy,
  Check,
  Zap,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

type Section =
  | "overview"
  | "auth"
  | "endpoints"
  | "catalog"
  | "pagination"
  | "errors"
  | "webhooks"
  | "admin-panel"
  | "quickstart";

const sections: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "auth", label: "Autenticação" },
  { id: "endpoints", label: "Endpoints" },
  { id: "catalog", label: "Catalog Response" },
  { id: "pagination", label: "Paginação" },
  { id: "errors", label: "Erros" },
  { id: "webhooks", label: "Webhooks" },
  { id: "admin-panel", label: "Admin Panel" },
  { id: "quickstart", label: "Quick Start" },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group">
      <pre className="overflow-x-auto text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <Check className="w-3 h-3 text-success" />
        ) : (
          <Copy className="w-3 h-3 text-white/40" />
        )}
      </button>
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
  scope,
}: {
  method: string;
  path: string;
  description: string;
  scope: string;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-sage/10 text-sage",
    POST: "bg-accent/10 text-accent",
    PUT: "bg-warning/10 text-warning",
    DELETE: "bg-danger/10 text-danger",
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${methodColors[method] ?? "bg-elevated text-muted"}`}
      >
        {method}
      </span>
      <div className="flex-1 min-w-0">
        <code className="text-sm font-mono text-primary/80">{path}</code>
        <p className="text-xs text-muted mt-1">{description}</p>
        <span className="text-[10px] text-muted/60 mt-1 inline-block">scope: {scope}</span>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [active, setActive] = useState<Section>("overview");

  return (
    <div className="min-h-screen">
      {/* Dot grid */}
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
              <span className="text-xs font-mono text-muted tracking-wider">/ docs</span>
            </div>
          </div>
          <a
            href="/api/spec"
            target="_blank"
            className="text-xs text-muted hover:text-accent flex items-center gap-1.5 transition-colors"
          >
            Spec JSON <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar nav */}
        <nav className="hidden lg:block w-44 shrink-0">
          <div className="sticky top-16 space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full px-3 py-2 rounded-md text-xs transition-colors text-left ${
                  active === s.id
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted hover:text-secondary hover:bg-elevated/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {/* Mobile nav */}
          <div className="flex gap-1 overflow-x-auto pb-4 lg:hidden mb-4">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                  active === s.id
                    ? "bg-accent/10 text-accent"
                    : "bg-elevated/50 text-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* ─── Overview ──────────────────────────────────── */}
          {active === "overview" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display mb-3">Contrato Universal eximIA — v1</h2>
                <p className="text-sm text-secondary leading-relaxed">
                  Especificação que define como apps do ecossistema eximIA se comunicam.
                  Todo app que implementa o contrato (5 endpoints) se torna automaticamente
                  conectável a qualquer outro — presente ou futuro.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { title: "Zero Hardcoding", desc: "Nenhum app conhece a lista de outros apps de antemão" },
                  { title: "Discovery-based", desc: "O /catalog é o mecanismo de descoberta automática" },
                  { title: "Agent-friendly", desc: "Spec servido como JSON para agentes implementarem" },
                ].map((p) => (
                  <div key={p.title} className="p-4 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
                    <p className="text-sm font-medium mb-1">{p.title}</p>
                    <p className="text-xs text-muted">{p.desc}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Base Path</h3>
                <code className="px-3 py-1.5 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md text-sm">
                  /api/v1/integration
                </code>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-xs text-primary/80 leading-relaxed">
                  <strong>Para agentes:</strong> consuma <code>GET /api/spec</code> para obter
                  a spec completa em JSON. Use essa spec para gerar automaticamente os route
                  handlers, middleware e schemas Zod no app alvo.
                </p>
              </div>
            </div>
          )}

          {/* ─── Auth ──────────────────────────────────────── */}
          {active === "auth" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display mb-3">Autenticação</h2>
              <p className="text-sm text-secondary leading-relaxed mb-4">
                Todas as chamadas à API de integração requerem uma API key válida no header.
                Cada app gerencia suas próprias keys — o Hub não centraliza isso.
              </p>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Header</h3>
                <CodeBlock code={`x-eximia-api-key: eximia_<app>_<random32>`} />
              </div>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Formato da Key</h3>
                <CodeBlock code={`eximia_forms_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4`} />
                <p className="text-xs text-muted mt-2">
                  Prefixo <code>eximia_</code> + slug do app + 32 chars aleatórios.
                  Hash SHA-256 armazenado no banco, nunca a key raw.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Scopes</h3>
                <div className="space-y-2">
                  {[
                    { scope: "read", desc: "Listar e buscar entidades (GET)" },
                    { scope: "write", desc: "Criar e atualizar registros (POST, PUT)" },
                    { scope: "admin", desc: "Acesso completo + webhooks + configuração" },
                  ].map((s) => (
                    <div key={s.scope} className="flex items-center gap-3 p-3 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
                      <code className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">{s.scope}</code>
                      <span className="text-sm text-secondary">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Implementação (middleware)</h3>
                <CodeBlock
                  code={`// lib/integration/auth.ts
import crypto from "crypto";

export async function validateApiKey(request: Request) {
  const apiKey = request.headers.get("x-eximia-api-key");
  if (!apiKey) {
    return Response.json(
      { error: "Missing API key", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const hash = crypto
    .createHash("sha256")
    .update(apiKey)
    .digest("hex");

  // Buscar no seu banco:
  // SELECT scopes FROM integration_keys
  // WHERE key_hash = $hash AND status = 'active'

  return { scopes: ["read", "write"] };
}`}
                />
              </div>
            </div>
          )}

          {/* ─── Endpoints ─────────────────────────────────── */}
          {active === "endpoints" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-display mb-3">Endpoints</h2>
              <p className="text-sm text-muted mb-4">
                Todo app que implementa o contrato <strong>DEVE</strong> expor estes 5 endpoints:
              </p>

              <div className="space-y-3">
                <Endpoint method="GET" path="/api/v1/integration/catalog" description="Retorna metadata do app, entidades expostas, schemas e webhooks disponíveis" scope="read" />
                <Endpoint method="GET" path="/api/v1/integration/:entity" description="Lista dados paginados de uma entidade (query: page, limit)" scope="read" />
                <Endpoint method="POST" path="/api/v1/integration/:entity" description="Cria um registro em uma entidade" scope="write" />
                <Endpoint method="GET" path="/api/v1/integration/:entity/:id" description="Busca um registro individual por ID" scope="read" />
                <Endpoint method="PUT" path="/api/v1/integration/:entity/:id" description="Atualiza um registro individual" scope="write" />
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-primary mb-2">Route handler (Next.js App Router)</h3>
                <CodeBlock
                  code={`// app/api/v1/integration/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const CATALOG = {
  app: "your-app-name",
  version: "1.0.0",
  contract: "eximia-integration/v1",
  entities: {
    submissions: {
      operations: ["list", "get", "create"],
      schema: {
        id: { type: "string", readonly: true },
        form_id: { type: "string" },
        data: { type: "object" },
        created_at: { type: "datetime", readonly: true },
      },
    },
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Validate API key first (see Auth section)
  const { path } = await params;
  const [entity, id] = path;

  if (entity === "catalog") {
    return NextResponse.json(CATALOG);
  }

  if (!CATALOG.entities[entity]) {
    return NextResponse.json(
      { error: \`Entity '\${entity}' not found\`, code: "ENTITY_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (id) {
    // GET /:entity/:id — buscar individual
    const record = await fetchById(entity, id);
    return NextResponse.json({ data: record });
  }

  // GET /:entity — listar paginado
  const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 20), 100);
  const { data, total } = await fetchPaginated(entity, page, limit);

  return NextResponse.json({
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}`}
                />
              </div>
            </div>
          )}

          {/* ─── Catalog ───────────────────────────────────── */}
          {active === "catalog" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display mb-3">Catalog Response</h2>
              <p className="text-sm text-muted mb-4">
                O <code>/catalog</code> é o coração do auto-discovery. Retorna o que o app expõe.
              </p>

              <CodeBlock
                code={`// GET /api/v1/integration/catalog
{
  "app": "eximia-forms",
  "version": "1.0.0",
  "contract": "eximia-integration/v1",
  "entities": {
    "forms": {
      "operations": ["list", "get"],
      "schema": {
        "id": { "type": "string", "readonly": true },
        "title": { "type": "string" },
        "status": { "type": "string" },
        "created_at": { "type": "datetime", "readonly": true }
      },
      "description": "Form definitions"
    },
    "submissions": {
      "operations": ["list", "get", "create"],
      "schema": {
        "id": { "type": "string", "readonly": true },
        "form_id": { "type": "string" },
        "data": { "type": "object" },
        "created_at": { "type": "datetime", "readonly": true }
      },
      "description": "Form submissions"
    }
  },
  "webhooks": {
    "available_events": [
      "submission.created",
      "submission.updated"
    ]
  }
}`}
              />

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Campos obrigatórios</h3>
                <div className="space-y-1.5">
                  {[
                    { field: "app", desc: "Identificador único do app (slug)" },
                    { field: "version", desc: "Versão da implementação do app" },
                    { field: "contract", desc: 'Deve ser "eximia-integration/v1"' },
                    { field: "entities", desc: "Mapa de entidades expostas com suas operações e schemas" },
                  ].map((f) => (
                    <div key={f.field} className="flex items-center gap-3 p-2.5 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
                      <code className="text-xs font-mono text-primary w-20">{f.field}</code>
                      <span className="text-xs text-muted">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Schema types</h3>
                <div className="flex flex-wrap gap-1.5">
                  {["string", "number", "boolean", "object", "array", "datetime"].map((t) => (
                    <code key={t} className="px-2 py-1 text-[11px] bg-white/[0.06] text-white/50 rounded">
                      {t}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Pagination ────────────────────────────────── */}
          {active === "pagination" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display mb-3">Paginação</h2>
              <p className="text-sm text-muted mb-4">
                Todos os endpoints de listagem (<code>GET /:entity</code>) retornam dados paginados.
              </p>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Query params</h3>
                <div className="space-y-1.5">
                  {[
                    { param: "page", default: "1", desc: "Página (1-indexed)" },
                    { param: "limit", default: "20", desc: "Itens por página (max 100)" },
                  ].map((p) => (
                    <div key={p.param} className="flex items-center gap-3 p-2.5 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
                      <code className="text-xs font-mono text-primary w-12">{p.param}</code>
                      <span className="text-[10px] text-muted/60 w-12">default: {p.default}</span>
                      <span className="text-xs text-muted">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Response format</h3>
                <CodeBlock
                  code={`{
  "data": [
    { "id": "uuid-1", "title": "Form A", ... },
    { "id": "uuid-2", "title": "Form B", ... }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}`}
                />
              </div>
            </div>
          )}

          {/* ─── Errors ────────────────────────────────────── */}
          {active === "errors" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display mb-3">Códigos de Erro</h2>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Formato padrão</h3>
                <CodeBlock
                  code={`{
  "error": "Descrição legível do erro",
  "code": "ERROR_CODE",
  "details": {}  // opcional
}`}
                />
              </div>

              <div className="space-y-1.5">
                {[
                  { code: "UNAUTHORIZED", status: 401, desc: "API key ausente ou inválida" },
                  { code: "FORBIDDEN", status: 403, desc: "Key sem o scope necessário" },
                  { code: "ENTITY_NOT_FOUND", status: 404, desc: "Entidade não exposta por este app" },
                  { code: "RECORD_NOT_FOUND", status: 404, desc: "Registro com ID não encontrado" },
                  { code: "VALIDATION_ERROR", status: 422, desc: "Body falhou na validação" },
                  { code: "RATE_LIMITED", status: 429, desc: "Muitas requisições" },
                  { code: "INTERNAL_ERROR", status: 500, desc: "Erro inesperado do servidor" },
                ].map((e) => (
                  <div key={e.code} className="flex items-center gap-4 p-3 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
                    <span className="text-xs font-mono text-danger/60 w-8">{e.status}</span>
                    <code className="text-xs font-medium text-secondary w-40">{e.code}</code>
                    <span className="text-xs text-muted">{e.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Webhooks ──────────────────────────────────── */}
          {active === "webhooks" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display mb-3">Webhooks</h2>
              <p className="text-sm text-muted mb-4">
                Apps podem emitir eventos e notificar outros apps via webhooks. Cada app gerencia seus próprios webhooks.
              </p>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Payload do webhook</h3>
                <CodeBlock
                  code={`{
  "event": "submission.created",
  "app": "eximia-forms",
  "entity": "submissions",
  "record_id": "uuid",
  "data": { ... },
  "timestamp": "2026-03-15T12:00:00.000Z"
}`}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2">Assinatura HMAC-SHA256</h3>
                <CodeBlock
                  code={`// O header x-eximia-signature contém a assinatura
const signature = request.headers.get("x-eximia-signature");

const expected = crypto
  .createHmac("sha256", webhookSecret)
  .update(JSON.stringify(body))
  .digest("hex");

const isValid = signature === \`sha256=\${expected}\`;`}
                />
              </div>

              <div className="p-4 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
                <h3 className="text-sm font-medium text-primary mb-2">Retry Policy</h3>
                <p className="text-xs text-muted">
                  3 tentativas com backoff exponencial: 1s → 5s → 30s. Após 3 falhas consecutivas,
                  o webhook é desabilitado e requer reativação manual.
                </p>
              </div>
            </div>
          )}

          {/* ─── Admin Panel ──────────────────────────────── */}
          {active === "admin-panel" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display mb-3">Painel de Integrações (Admin Panel)</h2>
              <p className="text-sm text-secondary leading-relaxed mb-4">
                Todo app que implementa o contrato <strong>DEVE</strong> ter uma página admin
                em <code>/settings/integrations</code> para gerenciar conexões, API keys e
                monitorar o status das integrações. O painel cobre os <strong>dois lados</strong> da
                integração: receber chamadas (inbound) e fazer chamadas (outbound).
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-sage/5 border border-sage/10 rounded-md">
                  <p className="text-xs font-mono text-sage uppercase tracking-wider mb-2">Inbound (receber)</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Outros apps chamam <strong>seus</strong> endpoints. Você gerencia as API keys
                    que dá para eles e monitora as chamadas que recebe.
                  </p>
                </div>
                <div className="p-4 bg-accent/5 border border-accent/10 rounded-md">
                  <p className="text-xs font-mono text-accent uppercase tracking-wider mb-2">Outbound (enviar)</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Você chama endpoints de <strong>outros</strong> apps. Você guarda as API keys
                    que eles te deram e monitora suas chamadas de saída.
                  </p>
                </div>
              </div>

              {/* Layout */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">1. Estrutura da Página</h3>
                <p className="text-xs text-muted mb-3">
                  A página deve estar acessível em <code>/settings/integrations</code> (ou equivalente no app)
                  e ter 3 seções principais:
                </p>
                <div className="space-y-2">
                  {[
                    { section: "API Keys", desc: "Keys que você gera para outros apps chamarem SEUS endpoints (inbound). Criar, listar, revogar." },
                    { section: "Conexões Outbound", desc: "Apps que VOCÊ chama. Guardar URL + key de cada app remoto, fazer discovery, testar conexão." },
                    { section: "Conexões Inbound", desc: "Apps que chamam VOCÊ. Listagem automática baseada nas API keys ativas — quem tem acesso e com que scopes." },
                    { section: "Logs", desc: "Todas as chamadas — inbound (recebidas) e outbound (feitas). Método, endpoint, status, duração, direção." },
                  ].map((s) => (
                    <div key={s.section} className="flex items-start gap-3 p-3 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
                      <span className="text-xs font-medium text-accent w-24 shrink-0">{s.section}</span>
                      <span className="text-xs text-muted">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Spec */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">2. Especificação Visual</h3>
                <CodeBlock
                  code={`// Layout da página /settings/integrations
┌──────────────────────────────────────────────────────────────┐
│  Integrações eximIA                 [+ Nova Key] [+ Conectar]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ INBOUND — Quem chama VOCÊ (API Keys) ──────────────────┐│
│  │  eximia_hub_a1b2...  │ read,write │ Ativa  │ Revogar    ││
│  │  eximia_acad_c3d4... │ read       │ Ativa  │ Revogar    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─ OUTBOUND — Apps que VOCÊ chama ─────────────────────────┐│
│  │  ● eximia-hub     │ url │ 2 entidades │ Sync: 12:30     ││
│  │  ● eximia-academy │ url │ 3 entidades │ Sync: 11:45     ││
│  │  ○ eximia-maps    │ url │ erro        │ Retry: 13:00    ││
│  │                                                          ││
│  │  [Testar]  [Remover]  [+ Descobrir novo app]             ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─ LOGS — Inbound ↓ e Outbound ↑ ─────────────────────────┐│
│  │  ↓ GET  /catalog       200  45ms   ← hub       12:30    ││
│  │  ↑ GET  /courses       200  120ms  → academy   12:28    ││
│  │  ↑ POST /enrollments   201  89ms   → academy   12:25    ││
│  │  ↓ GET  /submissions   200  67ms   ← hub       12:20    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘

// ↓ = inbound (outro app chamou VOCÊ)
// ↑ = outbound (VOCÊ chamou outro app)`}
                />

                {/* Rendered mockup */}
                <p className="text-xs text-muted mt-6 mb-3">Preview renderizado — clique em uma conexão para ver o painel de detalhe:</p>
                <div className="border border-[rgba(232,224,213,0.06)] rounded-md overflow-hidden bg-[#0A0A0A]">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(232,224,213,0.06)]">
                    <h4 className="text-sm font-display text-primary">Integrações eximIA</h4>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 text-[10px] bg-accent/10 text-accent rounded-md cursor-default">+ Nova Key</span>
                      <span className="px-2.5 py-1 text-[10px] bg-sage/10 text-sage rounded-md cursor-default">+ Conectar App</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">

                    {/* ── Inbound: Key colapsada ── */}
                    <div>
                      <p className="text-[10px] font-mono text-sage uppercase tracking-[0.2em] mb-2.5">Inbound — Quem chama você</p>
                      <div className="space-y-1.5">
                        {/* Key colapsada */}
                        <div className="px-3 py-2.5 bg-[#111111] border border-[rgba(232,224,213,0.04)] rounded-md">
                          <div className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                            <code className="text-[11px] font-mono text-secondary flex-1">eximia_acad_c3d4...</code>
                            <span className="text-[10px] text-muted">read</span>
                            <span className="text-[10px] text-muted/60">3 chamadas/24h</span>
                            <span className="text-[10px] text-accent cursor-default">▸</span>
                          </div>
                        </div>

                        {/* Key expandida — mostra painel de detalhe */}
                        <div className="bg-[#111111] border border-accent/15 rounded-md overflow-hidden">
                          <div className="flex items-center gap-3 px-3 py-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                            <code className="text-[11px] font-mono text-primary flex-1">eximia_hub_a1b2...</code>
                            <span className="text-[10px] text-muted">read, write</span>
                            <span className="text-[10px] text-muted/60">47 chamadas/24h</span>
                            <span className="text-[10px] text-accent cursor-default">▾</span>
                          </div>

                          {/* Detail panel */}
                          <div className="border-t border-[rgba(232,224,213,0.06)] px-4 py-3 space-y-3 bg-[#0D0D0D]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Permissões por entidade</span>
                              <span className="text-[10px] text-muted/60">App: eximia-hub</span>
                            </div>

                            {/* Entity toggles */}
                            <div className="space-y-1.5">
                              {[
                                { entity: "forms", ops: ["list", "get"], enabled: true },
                                { entity: "submissions", ops: ["list", "get", "create"], enabled: true },
                                { entity: "workspaces", ops: ["list"], enabled: false },
                              ].map((e) => (
                                <div key={e.entity} className="flex items-center gap-3 px-3 py-2 bg-[#111111] rounded">
                                  {/* Toggle */}
                                  <div className={`w-7 h-4 rounded-full relative cursor-default ${e.enabled ? "bg-sage/30" : "bg-[#2A2A2A]"}`}>
                                    <div className={`w-3 h-3 rounded-full absolute top-0.5 transition-all ${e.enabled ? "right-0.5 bg-sage" : "left-0.5 bg-muted/40"}`} />
                                  </div>
                                  <span className={`text-[11px] font-mono flex-1 ${e.enabled ? "text-primary" : "text-muted/40"}`}>
                                    {e.entity}
                                  </span>
                                  <div className="flex gap-1">
                                    {e.ops.map((op) => (
                                      <span
                                        key={op}
                                        className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                                          e.enabled
                                            ? op === "create" ? "bg-accent/10 text-accent" : "bg-sage/10 text-sage"
                                            : "bg-[#1A1A1A] text-muted/30"
                                        }`}
                                      >
                                        {op}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Key actions */}
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex gap-4 text-[10px]">
                                <span className="text-muted/60">Criada: 10/03/2026</span>
                                <span className="text-muted/60">Último uso: 15/03 12:30</span>
                              </div>
                              <span className="text-[10px] text-danger/50 cursor-default">Revogar key</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Outbound: conexão colapsada + expandida ── */}
                    <div>
                      <p className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-2.5">Outbound — Apps que você chama</p>
                      <div className="space-y-1.5">
                        {/* Colapsada */}
                        <div className="px-3 py-2.5 bg-[#111111] border border-[rgba(232,224,213,0.04)] rounded-md">
                          <div className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                            <span className="text-[11px] text-primary/50 font-medium flex-1">eximia-maps</span>
                            <span className="text-[10px] text-danger/50">Erro: timeout</span>
                            <span className="text-[10px] text-accent cursor-default">▸</span>
                          </div>
                        </div>

                        {/* Expandida — mostra catálogo descoberto + seleção */}
                        <div className="bg-[#111111] border border-accent/15 rounded-md overflow-hidden">
                          <div className="flex items-center gap-3 px-3 py-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                            <span className="text-[11px] text-primary font-medium flex-1">eximia-academy</span>
                            <span className="text-[10px] text-sage">Conectado</span>
                            <span className="text-[10px] text-muted/60">Sync: 11:45</span>
                            <span className="text-[10px] text-accent cursor-default">▾</span>
                          </div>

                          {/* Detail panel */}
                          <div className="border-t border-[rgba(232,224,213,0.06)] px-4 py-3 space-y-3 bg-[#0D0D0D]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Entidades disponíveis (via /catalog)</span>
                              <span className="px-2 py-0.5 text-[9px] bg-sage/10 text-sage rounded">contract v1</span>
                            </div>

                            {/* Discovered entities with checkboxes */}
                            <div className="space-y-1.5">
                              {[
                                { entity: "courses", ops: ["list", "get"], desc: "Cursos disponíveis", selected: true },
                                { entity: "enrollments", ops: ["list", "get", "create"], desc: "Matrículas", selected: true },
                                { entity: "chapters", ops: ["list", "get"], desc: "Capítulos por curso", selected: true },
                                { entity: "certificates", ops: ["list"], desc: "Certificados emitidos", selected: false },
                              ].map((e) => (
                                <div key={e.entity} className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${e.selected ? "bg-[#111111]" : "bg-[#0F0F0F]"}`}>
                                  {/* Checkbox */}
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${e.selected ? "border-accent bg-accent" : "border-[#2A2A2A]"}`}>
                                    {e.selected && <span className="text-[8px] text-bg font-bold">✓</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-[11px] font-mono ${e.selected ? "text-primary" : "text-muted/40"}`}>
                                      {e.entity}
                                    </span>
                                    <span className={`text-[10px] ml-2 ${e.selected ? "text-muted/60" : "text-muted/25"}`}>
                                      — {e.desc}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {e.ops.map((op) => (
                                      <span
                                        key={op}
                                        className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                                          e.selected
                                            ? op === "create" ? "bg-accent/10 text-accent" : "bg-sage/10 text-sage"
                                            : "bg-[#1A1A1A] text-muted/20"
                                        }`}
                                      >
                                        {op}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Connection actions */}
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex gap-2">
                                <span className="px-2.5 py-1 text-[10px] bg-sage/10 text-sage rounded cursor-default">Testar conexão</span>
                                <span className="px-2.5 py-1 text-[10px] bg-[#1A1A1A] text-muted rounded cursor-default">Re-descobrir</span>
                              </div>
                              <span className="text-[10px] text-danger/50 cursor-default">Desconectar</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Logs ── */}
                    <div>
                      <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mb-2.5">Logs — Inbound &amp; Outbound</p>
                      <div className="space-y-1">
                        {[
                          { dir: "↓", method: "GET", path: "/catalog", status: 200, ms: 45, app: "hub", time: "12:30", methodColor: "bg-sage/10 text-sage", dirColor: "text-info" },
                          { dir: "↑", method: "GET", path: "/courses", status: 200, ms: 120, app: "academy", time: "12:28", methodColor: "bg-sage/10 text-sage", dirColor: "text-accent" },
                          { dir: "↑", method: "POST", path: "/enrollments", status: 201, ms: 89, app: "academy", time: "12:25", methodColor: "bg-accent/10 text-accent", dirColor: "text-accent" },
                          { dir: "↓", method: "GET", path: "/submissions", status: 200, ms: 67, app: "hub", time: "12:20", methodColor: "bg-sage/10 text-sage", dirColor: "text-info" },
                        ].map((l, i) => (
                          <div key={i} className="flex items-center gap-2.5 px-3 py-1.5 bg-[#111111]/50 rounded">
                            <span className={`text-[11px] font-mono ${l.dirColor}`}>{l.dir}</span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold font-mono rounded ${l.methodColor}`}>{l.method}</span>
                            <code className="text-[10px] font-mono text-secondary flex-1">{l.path}</code>
                            <span className="text-[10px] font-mono text-sage">{l.status}</span>
                            <span className="text-[10px] font-mono text-muted w-10 text-right">{l.ms}ms</span>
                            <span className="text-[10px] text-muted w-16 text-right">{l.app}</span>
                            <span className="text-[10px] text-muted/60 w-10 text-right">{l.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Rules */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">3. Regras Visuais</h3>
                <div className="space-y-2">
                  {[
                    { rule: "Dark theme", desc: "Seguir o padrão eximIA — fundo #0A0A0A, surface #111111, texto cream #E8E0D5" },
                    { rule: "Status dots", desc: "● verde (ativo), ● amarelo (pendente), ○ vermelho (erro), ○ cinza (desabilitado)" },
                    { rule: "Method badges", desc: "GET = sage/verde, POST = accent/brown, PUT = warning/amarelo, DELETE = danger/vermelho" },
                    { rule: "Key display", desc: "Mostrar apenas prefixo (primeiros 16 chars) + '...'. Nunca exibir key completa após criação" },
                    { rule: "Borders", desc: "rgba(232,224,213,0.04) para cards, 0.06 para divisores. Nunca branco puro" },
                    { rule: "Font", desc: "Inter para UI, JetBrains Mono para keys/endpoints/logs, Playfair Display para títulos de seção" },
                  ].map((r) => (
                    <div key={r.rule} className="flex items-start gap-3 p-3 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
                      <span className="text-xs font-mono text-accent w-28 shrink-0">{r.rule}</span>
                      <span className="text-xs text-muted">{r.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Keys Section */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">4. Seção: API Keys</h3>
                <p className="text-xs text-muted mb-3">
                  Funcionalidades obrigatórias:
                </p>
                <CodeBlock
                  code={`// Criar key
1. Botão "+ Nova Key" abre form inline
2. Campos: App name (quem vai usar), Scopes (checkboxes), Expiração (select)
3. Ao criar: gerar key formato eximia_<app>_<random32>
4. Exibir key UMA VEZ com botão de copiar (nunca mais exibida)
5. Salvar hash SHA-256 no banco

// Tabela de keys
- Colunas: Prefixo | App | Scopes | Último uso | Status | Ações
- Ação: Revogar (soft delete — status = 'revoked')

// Schema da tabela
create table integration_keys (
  id uuid primary key default gen_random_uuid(),
  app_name text not null,
  key_prefix text not null,       -- primeiros 16 chars
  key_hash text not null unique,  -- SHA-256
  scopes text[] not null default '{read}',
  status text default 'active' check (status in ('active', 'revoked')),
  last_used timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);`}
                />
              </div>

              {/* Connections Section */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">5. Seção: Conexões Outbound</h3>
                <p className="text-xs text-muted mb-3">
                  Apps que <strong>você</strong> chama. Inclui o fluxo de discovery para adicionar novos apps.
                </p>
                <CodeBlock
                  code={`// Fluxo de Discovery (botão "+ Descobrir novo app"):
// 1. Admin informa URL base + API key que recebeu do app remoto
// 2. App chama GET <url>/api/v1/integration/catalog
// 3. Valida que contract === "eximia-integration/v1"
// 4. Exibe entidades disponíveis com operações
// 5. Admin seleciona quais entidades quer consumir
// 6. Salva conexão outbound com a key e entidades selecionadas

// Cada card de conexão outbound mostra:
{
  remote_app: "eximia-academy",    // app que você chama
  remote_url: "https://academy...",// base URL
  api_key_ref: "stored_encrypted", // key que eles te deram (encriptada)
  status: "active",                // active | error | pending | disabled
  entities: ["courses", "enrollments"], // entidades que você consome
  last_sync: "2026-03-15T12:30",
  last_error: null,
}

// Ações por conexão:
// - "Testar" → chama GET <url>/catalog com a key guardada
// - "Re-descobrir" → refaz o discovery para atualizar entidades
// - "Remover" → deleta a conexão

// Schema da tabela
create table integration_outbound (
  id uuid primary key default gen_random_uuid(),
  remote_app text not null,
  remote_url text not null,
  api_key_encrypted text not null,  -- key que o app remoto te deu
  status text default 'active',
  entities text[] not null default '{}',
  catalog_cache jsonb,              -- último /catalog response
  last_sync timestamptz,
  last_error text,
  created_at timestamptz default now()
);`}
                />
              </div>

              {/* Inbound Section */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">5b. Seção: Conexões Inbound (automática)</h3>
                <p className="text-xs text-muted mb-3">
                  Apps que chamam <strong>você</strong>. Listagem derivada das API keys ativas — cada key ativa
                  representa um app que tem acesso aos seus endpoints.
                </p>
                <CodeBlock
                  code={`// Inbound é derivado automaticamente das API keys:
// - Cada key ativa com app_name = um app que te chama
// - Agrupar logs por caller_app para mostrar atividade
// - Não precisa de tabela extra — vem das keys + logs

// Card inbound mostra:
{
  app_name: "eximia-hub",           // quem está chamando
  scopes: ["read", "write"],        // o que pode fazer
  last_used: "2026-03-15T12:30",    // último uso da key
  calls_24h: 47,                    // chamadas nas últimas 24h
  key_prefix: "eximia_hub_a1b2...", // prefixo da key (para referência)
}

// Ação: se quiser bloquear um app → revogar a key dele`}
                />
              </div>

              {/* Logs Section */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">6. Seção: Logs</h3>
                <CodeBlock
                  code={`// Exibir últimas 50-100 chamadas — AMBAS direções
// Colunas: Direção | Método | Endpoint | Status | Duração | App | Hora

// Schema da tabela
create table integration_logs (
  id uuid primary key default gen_random_uuid(),
  direction text not null,        -- 'inbound' (recebeu) ou 'outbound' (fez)
  method text not null,           -- GET, POST, PUT
  endpoint text not null,         -- /api/v1/integration/submissions
  entity text,                    -- submissions
  status_code int not null,       -- 200, 404, 500
  duration_ms int not null,       -- tempo de resposta
  remote_app text,                -- quem chamou (inbound) ou quem foi chamado (outbound)
  created_at timestamptz default now()
);

// Visual:
// - ↓ azul para inbound, ↑ dourado para outbound
// - Status code colorido: 2xx verde, 4xx amarelo, 5xx vermelho
// - Duração em ms (font-mono)
// - Filtros por direção (Todos | Inbound | Outbound)

// Logging automático:
// - Inbound: o middleware de auth loga TODA chamada recebida
// - Outbound: o helper de fetch loga TODA chamada feita a outro app

// Helper de fetch outbound com logging:
async function integrationFetch(connectionId, path, options) {
  const conn = await getConnection(connectionId);
  const start = Date.now();

  const res = await fetch(conn.remote_url + path, {
    ...options,
    headers: {
      ...options?.headers,
      "x-eximia-api-key": decrypt(conn.api_key_encrypted),
    },
  });

  // Log outbound call
  await supabase.from("integration_logs").insert({
    direction: "outbound",
    method: options?.method || "GET",
    endpoint: path,
    status_code: res.status,
    duration_ms: Date.now() - start,
    remote_app: conn.remote_app,
  });

  return res;
}`}
                />
              </div>

              {/* Complete Implementation */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">7. Implementação Completa (Next.js)</h3>
                <CodeBlock
                  code={`// Estrutura de arquivos no app:
app/
  settings/
    integrations/
      page.tsx              ← Página principal (client component, 3 tabs)
  api/
    v1/
      integration/
        [...path]/
          route.ts          ← Catch-all handler do contrato (inbound)
    integrations/
      keys/
        route.ts            ← CRUD de API keys (POST criar, GET listar)
        [id]/
          route.ts          ← DELETE revogar key
      connections/
        route.ts            ← GET listar conexões outbound, POST nova
        [id]/
          route.ts          ← DELETE remover, POST testar
      discover/
        route.ts            ← POST discovery (chama /catalog de outro app)
lib/
  integration/
    auth.ts                 ← Middleware de validação de API key (inbound)
    catalog.ts              ← Definição do catálogo deste app
    helpers.ts              ← hashKey(), generateKey(), decrypt()
    fetch.ts                ← integrationFetch() — fetch outbound com logging

// Tabelas necessárias:
// - integration_keys       → keys que você dá para OUTROS apps (inbound)
// - integration_outbound   → apps que VOCÊ chama (outbound)
// - integration_logs       → TODAS as chamadas (inbound + outbound)

// A página /settings/integrations é um "use client" com 3 tabs:
// Tab 1: API Keys (inbound) — gerenciar quem te chama
// Tab 2: Conexões (outbound) — gerenciar quem você chama
// Tab 3: Logs (ambos) — monitorar tudo`}
                />
              </div>

              <div className="p-4 bg-accent/5 border border-accent/10 rounded-md">
                <p className="text-xs text-accent/80 leading-relaxed">
                  <strong>Para agentes:</strong> ao implementar o contrato em um app, crie AMBOS —
                  os endpoints da API (<code>/api/v1/integration/</code>) E o painel admin
                  (<code>/settings/integrations</code>). O painel é necessário para que o admin
                  do app gerencie keys, monitore conexões e debugue problemas.
                </p>
              </div>
            </div>
          )}

          {/* ─── Quick Start ───────────────────────────────── */}
          {active === "quickstart" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display mb-3">Quick Start</h2>
              <p className="text-sm text-muted mb-4">
                Implemente o contrato no seu app Next.js em 3 passos.
              </p>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center font-bold">1</span>
                  <h3 className="text-sm font-medium">Tabela de API keys</h3>
                </div>
                <CodeBlock
                  code={`-- No seu Supabase
create table integration_keys (
  id uuid primary key default gen_random_uuid(),
  app_name text not null,
  key_hash text not null unique,
  scopes text[] not null default '{read}',
  status text not null default 'active',
  created_at timestamptz default now()
);`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center font-bold">2</span>
                  <h3 className="text-sm font-medium">Catch-all route handler</h3>
                </div>
                <CodeBlock
                  code={`// app/api/v1/integration/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

// Defina seu catálogo
const CATALOG = {
  app: "seu-app",
  version: "1.0.0",
  contract: "eximia-integration/v1",
  entities: { /* suas entidades */ },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // 1. Validar API key (ver seção Auth)
  // 2. Rotear para entidade
  const { path } = await params;
  const [entity, id] = path;

  if (entity === "catalog") return NextResponse.json(CATALOG);
  // ... implementar handlers por entidade
}

export async function POST(req: NextRequest, { params }: ...) {
  // Validar key com scope "write" + criar registro
}`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center font-bold">3</span>
                  <h3 className="text-sm font-medium">Testar</h3>
                </div>
                <CodeBlock
                  code={`# Gerar uma key
node -e "console.log('eximia_app_' + require('crypto').randomBytes(16).toString('hex'))"

# Testar catalog
curl -H "x-eximia-api-key: <sua-key>" \\
  http://localhost:3000/api/v1/integration/catalog

# Testar listagem
curl -H "x-eximia-api-key: <sua-key>" \\
  http://localhost:3000/api/v1/integration/submissions?page=1&limit=10`}
                />
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-xs text-primary/80 leading-relaxed">
                  <strong>Dica para agentes:</strong> consuma <code>GET {typeof window !== "undefined" ? window.location.origin : ""}/api/spec</code> para
                  obter a spec completa em JSON e gerar automaticamente os handlers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
