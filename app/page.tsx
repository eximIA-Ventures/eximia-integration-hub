import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ExternalLink,
  Code2,
  Zap,
  Shield,
  Link2,
  Key,
  Webhook,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Dot grid background */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Radial accent blur */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(196,168,130,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative border-b border-[rgba(232,224,213,0.06)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/eximia-symbol.svg"
              alt="eximIA"
              width={32}
              height={32}
              className="opacity-90"
            />
            <div className="h-5 w-px bg-[rgba(232,224,213,0.08)]" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-muted">
              Integration Hub
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/docs" className="text-secondary hover:text-primary transition-colors">Docs</Link>
            <Link href="/test" className="text-secondary hover:text-primary transition-colors">Tester</Link>
            <Link href="/sandbox" className="text-secondary hover:text-primary transition-colors">Sandbox</Link>
            <Link href="/validate" className="text-secondary hover:text-primary transition-colors">Validate</Link>
            <Link href="/status" className="text-secondary hover:text-primary transition-colors">Status</Link>
            <Link href="/webhook-test" className="text-secondary hover:text-primary transition-colors">Webhooks</Link>
            <a href="/api/spec" target="_blank" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
              Spec <ExternalLink className="w-3 h-3" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] bg-accent/10 text-accent rounded-full">
              Contract v1
            </span>
            <span className="text-xs text-muted">Contrato Universal de Integração</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.1] mb-5">
            Um contrato.{" "}
            <span className="text-secondary italic">Qualquer app conectado.</span>
          </h1>

          <p className="text-base text-secondary leading-relaxed mb-10 max-w-lg">
            Implemente 5 endpoints e seu app se torna automaticamente conectável a
            qualquer outro do ecossistema eximIA — presente ou futuro.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="flex items-center gap-2.5 px-6 py-3 bg-accent text-bg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Ler documentação
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/api/spec"
              target="_blank"
              className="flex items-center gap-2.5 px-6 py-3 border border-[rgba(232,224,213,0.1)] text-secondary text-sm rounded-md hover:border-accent/30 hover:text-primary transition-colors"
            >
              <Code2 className="w-4 h-4" />
              Spec JSON
            </a>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(196,168,130,0.15)] to-transparent" />
      </div>

      {/* Princípios */}
      <section className="relative max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl mb-8">Princípios</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Link2 className="w-4 h-4" />,
              title: "Zero Hardcoding",
              desc: "Nenhum app conhece a lista de outros apps de antemão",
            },
            {
              icon: <Zap className="w-4 h-4" />,
              title: "Discovery-based",
              desc: "O /catalog é o mecanismo de descoberta automática",
            },
            {
              icon: <Shield className="w-4 h-4" />,
              title: "Sem intermediário",
              desc: "Apps se conectam ponto-a-ponto. Hub documenta, não proxeia",
            },
            {
              icon: <Code2 className="w-4 h-4" />,
              title: "Agent-friendly",
              desc: "Spec servido como JSON para agentes implementarem",
            },
          ].map((p) => (
            <div
              key={p.title}
              className="p-5 bg-surface/50 border border-[rgba(232,224,213,0.05)] rounded-md group hover:border-accent/10 transition-colors"
            >
              <div className="p-2 rounded-md bg-accent/5 w-fit mb-4 text-accent group-hover:glow-accent transition-all">
                {p.icon}
              </div>
              <p className="text-sm font-medium text-primary mb-1.5">{p.title}</p>
              <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Endpoints */}
      <section className="relative max-w-5xl mx-auto px-6 pb-16">
        <h2 className="font-display text-2xl mb-8">Endpoints Obrigatórios</h2>
        <div className="space-y-2">
          {[
            { method: "GET", path: "/api/v1/integration/catalog", desc: "Retorna entidades, schemas e operações", color: "text-sage bg-sage/10" },
            { method: "GET", path: "/api/v1/integration/:entity", desc: "Lista dados paginados", color: "text-sage bg-sage/10" },
            { method: "POST", path: "/api/v1/integration/:entity", desc: "Cria registro", color: "text-accent bg-accent/10" },
            { method: "GET", path: "/api/v1/integration/:entity/:id", desc: "Busca individual", color: "text-sage bg-sage/10" },
            { method: "PUT", path: "/api/v1/integration/:entity/:id", desc: "Atualiza registro", color: "text-warning bg-warning/10" },
          ].map((e) => (
            <div
              key={e.path + e.method}
              className="flex items-center gap-4 p-4 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md hover:border-[rgba(232,224,213,0.08)] transition-colors"
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${e.color}`}>
                {e.method}
              </span>
              <code className="text-sm font-mono text-primary/80 flex-1">{e.path}</code>
              <span className="text-xs text-muted hidden sm:block">{e.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="relative max-w-5xl mx-auto px-6 pb-16">
        <h2 className="font-display text-2xl mb-8">Quick Start</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              step: 1,
              title: "Consumir a spec",
              desc: "GET /api/spec retorna o contrato completo em JSON. Agentes podem consumir e gerar código automaticamente.",
            },
            {
              step: 2,
              title: "Implementar endpoints",
              desc: "Crie os 5 endpoints no app. O /catalog define o que o app expõe ao ecossistema.",
            },
            {
              step: 3,
              title: "Descobrir & conectar",
              desc: "Qualquer app chama /catalog de outro e descobre automaticamente as entidades disponíveis.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="p-6 bg-surface/50 border border-[rgba(232,224,213,0.05)] rounded-md"
            >
              <span className="w-7 h-7 rounded-full bg-accent/10 text-accent text-[11px] font-bold font-mono flex items-center justify-center mb-4">
                {s.step}
              </span>
              <p className="text-sm font-medium text-primary mb-2">{s.title}</p>
              <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Auth */}
      <section className="relative max-w-5xl mx-auto px-6 pb-16">
        <h2 className="font-display text-2xl mb-6">Autenticação</h2>
        <div className="p-6 bg-surface/50 border border-[rgba(232,224,213,0.05)] rounded-md space-y-4">
          <div className="flex items-center gap-3">
            <Key className="w-4 h-4 text-accent" />
            <code className="text-sm font-mono text-primary/80">
              x-eximia-api-key: eximia_&lt;app&gt;_&lt;random32&gt;
            </code>
          </div>
          <div className="flex gap-2">
            {[
              { scope: "read", desc: "GET" },
              { scope: "write", desc: "POST, PUT" },
              { scope: "admin", desc: "Full" },
            ].map((s) => (
              <span
                key={s.scope}
                className="px-3 py-1.5 text-xs bg-accent/8 text-accent border border-accent/10 rounded-md"
              >
                {s.scope}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Cada app gerencia suas próprias API keys. Hash SHA-256 no banco — nunca a key raw.
            O Hub não centraliza gestão de keys.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(196,168,130,0.15)] to-transparent" />
      </div>

      {/* Footer */}
      <footer className="relative py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/eximia-symbol.svg"
              alt="eximIA"
              width={20}
              height={20}
              className="opacity-40"
            />
            <span className="text-[11px] text-muted">
              eximIA Integration Hub — Contrato Universal v1
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted">
            <Link href="/docs" className="hover:text-secondary transition-colors">
              Docs
            </Link>
            <a href="/api/spec" target="_blank" className="hover:text-secondary transition-colors">
              Spec
            </a>
            <a href="/api/health" target="_blank" className="hover:text-secondary transition-colors">
              Health
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
