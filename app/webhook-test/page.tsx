"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Link2,
  Send,
  Loader2,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";

export default function WebhookTestPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [event, setEvent] = useState("submission.created");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; status: number; body: unknown; signature: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const samplePayload = {
    event,
    app: "eximia-hub-test",
    entity: event.split(".")[0],
    record_id: "test-" + Date.now().toString(36),
    data: {
      id: "test-record-id",
      title: "Webhook test payload",
      created_at: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  async function sendWebhook() {
    if (!targetUrl.trim()) return;
    setSending(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/webhook-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_url: targetUrl,
          secret: secret || "test-secret",
          payload: samplePayload,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  }

  function copyPayload() {
    navigator.clipboard.writeText(JSON.stringify(samplePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
              <span className="text-xs font-mono text-muted tracking-wider">/ webhook test</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl mb-2">Webhook Tester</h1>
          <p className="text-sm text-secondary">
            Envia um webhook de teste com payload + assinatura HMAC-SHA256 para verificar se o app receptor processa corretamente.
          </p>
        </div>

        <div className="grid gap-4 mb-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">
                Target URL
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://app.../api/v1/integration/webhook"
                className="w-full px-3 py-2.5 bg-bg border border-[rgba(232,224,213,0.08)] rounded-md text-sm text-primary placeholder:text-muted/40 focus:border-accent/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">
                Webhook Secret
              </label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="test-secret"
                className="w-full px-3 py-2.5 bg-bg border border-[rgba(232,224,213,0.08)] rounded-md text-sm font-mono text-primary placeholder:text-muted/40 focus:border-accent/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">
              Event Type
            </label>
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg border border-[rgba(232,224,213,0.08)] rounded-md text-sm text-primary focus:border-accent/50 focus:outline-none"
            >
              <option value="submission.created">submission.created</option>
              <option value="submission.updated">submission.updated</option>
              <option value="enrollment.created">enrollment.created</option>
              <option value="form.published">form.published</option>
              <option value="course.created">course.created</option>
              <option value="test.ping">test.ping</option>
            </select>
          </div>

          {/* Payload preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono text-muted uppercase tracking-wider">
                Payload (preview)
              </label>
              <button onClick={copyPayload} className="flex items-center gap-1 text-[10px] text-muted hover:text-accent transition-colors">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <pre className="text-[11px] max-h-40 overflow-auto">
              <code>{JSON.stringify(samplePayload, null, 2)}</code>
            </pre>
          </div>

          <button
            onClick={sendWebhook}
            disabled={!targetUrl.trim() || sending}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-bg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-40 w-fit"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Enviando..." : "Enviar Webhook"}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/15 rounded-md mb-6 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
            <p className="text-sm text-danger/80">{error}</p>
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-4">
            <div className={`flex items-center gap-3 p-4 rounded-md ${result.ok ? "bg-sage/5 border border-sage/15" : "bg-danger/5 border border-danger/15"}`}>
              {result.ok ? <Check className="w-4 h-4 text-sage" /> : <AlertCircle className="w-4 h-4 text-danger" />}
              <span className={`text-sm font-medium ${result.ok ? "text-sage" : "text-danger"}`}>
                HTTP {result.status}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">Assinatura enviada</p>
              <code className="block px-3 py-2 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md text-[11px] font-mono text-secondary break-all">
                {result.signature}
              </code>
            </div>

            <div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">Response Body</p>
              <pre className="text-[11px] max-h-48 overflow-auto">
                <code>{JSON.stringify(result.body, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
