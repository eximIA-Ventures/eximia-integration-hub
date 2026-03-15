"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Link2,
  Check,
  X,
  AlertCircle,
  Clipboard,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ValidationResult {
  field: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

export default function ValidatePage() {
  const [json, setJson] = useState("");
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const [error, setError] = useState("");

  function validate() {
    setError("");
    setResults(null);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("JSON inválido — verifique a sintaxe.");
      return;
    }

    const checks: ValidationResult[] = [];

    // app
    if (typeof parsed.app === "string" && parsed.app.length > 0) {
      checks.push({ field: "app", status: "pass", message: `"${parsed.app}"` });
    } else {
      checks.push({ field: "app", status: "fail", message: "Campo obrigatório (string)" });
    }

    // version
    if (typeof parsed.version === "string") {
      checks.push({ field: "version", status: "pass", message: `"${parsed.version}"` });
    } else {
      checks.push({ field: "version", status: "fail", message: "Campo obrigatório (string)" });
    }

    // contract
    if (parsed.contract === "eximia-integration/v1") {
      checks.push({ field: "contract", status: "pass", message: '"eximia-integration/v1"' });
    } else if (parsed.contract) {
      checks.push({ field: "contract", status: "fail", message: `Esperado "eximia-integration/v1", recebido "${parsed.contract}"` });
    } else {
      checks.push({ field: "contract", status: "fail", message: "Campo obrigatório" });
    }

    // entities
    if (parsed.entities && typeof parsed.entities === "object" && !Array.isArray(parsed.entities)) {
      const entities = parsed.entities as Record<string, unknown>;
      const count = Object.keys(entities).length;
      if (count === 0) {
        checks.push({ field: "entities", status: "warn", message: "Presente mas vazio — nenhuma entidade exposta" });
      } else {
        checks.push({ field: "entities", status: "pass", message: `${count} entidade(s)` });

        // validate each entity
        for (const [name, entity] of Object.entries(entities)) {
          const e = entity as Record<string, unknown>;

          // operations
          if (Array.isArray(e.operations) && e.operations.length > 0) {
            const validOps = ["list", "get", "create", "update"];
            const invalid = e.operations.filter((op) => !validOps.includes(op as string));
            if (invalid.length > 0) {
              checks.push({ field: `entities.${name}.operations`, status: "warn", message: `Operações desconhecidas: ${invalid.join(", ")}` });
            } else {
              checks.push({ field: `entities.${name}.operations`, status: "pass", message: `[${e.operations.join(", ")}]` });
            }
          } else {
            checks.push({ field: `entities.${name}.operations`, status: "fail", message: "Array obrigatório com pelo menos 1 operação" });
          }

          // schema
          if (e.schema && typeof e.schema === "object" && Object.keys(e.schema as object).length > 0) {
            const fields = Object.keys(e.schema as object);
            const validTypes = ["string", "number", "boolean", "object", "array", "datetime"];
            let allValid = true;
            for (const [fieldName, fieldDef] of Object.entries(e.schema as Record<string, Record<string, unknown>>)) {
              if (!validTypes.includes(fieldDef.type as string)) {
                checks.push({ field: `entities.${name}.schema.${fieldName}`, status: "fail", message: `Tipo inválido "${fieldDef.type}". Válidos: ${validTypes.join(", ")}` });
                allValid = false;
              }
            }
            if (allValid) {
              checks.push({ field: `entities.${name}.schema`, status: "pass", message: `${fields.length} campo(s): ${fields.join(", ")}` });
            }
          } else {
            checks.push({ field: `entities.${name}.schema`, status: "fail", message: "Objeto obrigatório com pelo menos 1 campo" });
          }

          // id field
          const schema = e.schema as Record<string, Record<string, unknown>> | undefined;
          if (schema && !schema.id) {
            checks.push({ field: `entities.${name}.schema.id`, status: "warn", message: "Recomendado ter campo 'id' (readonly)" });
          }
        }
      }
    } else {
      checks.push({ field: "entities", status: "fail", message: "Campo obrigatório (objeto)" });
    }

    // webhooks (optional)
    if (parsed.webhooks) {
      const wh = parsed.webhooks as Record<string, unknown>;
      if (Array.isArray(wh.available_events)) {
        checks.push({ field: "webhooks.available_events", status: "pass", message: `${wh.available_events.length} evento(s)` });
      } else {
        checks.push({ field: "webhooks", status: "warn", message: "Presente mas sem available_events array" });
      }
    }

    setResults(checks);
  }

  const passCount = results?.filter((r) => r.status === "pass").length ?? 0;
  const failCount = results?.filter((r) => r.status === "fail").length ?? 0;
  const warnCount = results?.filter((r) => r.status === "warn").length ?? 0;
  const allPassed = results && failCount === 0;

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
              <span className="text-xs font-mono text-muted tracking-wider">/ validate</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl mb-2">Schema Validator</h1>
          <p className="text-sm text-secondary">
            Cole um JSON de resposta <code>/catalog</code> e valide se segue o contrato eximIA v1.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">
              Catalog JSON Response
            </label>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={12}
              placeholder={`{\n  "app": "eximia-forms",\n  "version": "1.0.0",\n  "contract": "eximia-integration/v1",\n  "entities": { ... }\n}`}
              className="w-full px-4 py-3 bg-bg border border-[rgba(232,224,213,0.08)] rounded-md text-sm font-mono text-primary placeholder:text-muted/30 focus:border-accent/50 focus:outline-none resize-y"
            />
          </div>

          <button
            onClick={validate}
            disabled={!json.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-bg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            Validar
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/15 rounded-md mt-6 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
            <p className="text-sm text-danger/80">{error}</p>
          </div>
        )}

        {results && (
          <div className="mt-6 animate-fade-in">
            {/* Summary */}
            <div className={`flex items-center gap-3 p-4 rounded-md mb-4 ${allPassed ? "bg-sage/5 border border-sage/15" : "bg-danger/5 border border-danger/15"}`}>
              {allPassed ? <CheckCircle2 className="w-4 h-4 text-sage" /> : <XCircle className="w-4 h-4 text-danger" />}
              <span className={`text-sm font-medium ${allPassed ? "text-sage" : "text-danger"}`}>
                {allPassed ? "Contrato válido" : "Contrato inválido"}
              </span>
              <span className="text-xs text-muted ml-auto">
                {passCount} ok · {failCount} erro{failCount !== 1 ? "s" : ""} · {warnCount} aviso{warnCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Results */}
            <div className="space-y-1">
              {results.map((r, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2 bg-surface/30 border border-[rgba(232,224,213,0.04)] rounded-md">
                  {r.status === "pass" && <Check className="w-3.5 h-3.5 text-sage mt-0.5 shrink-0" />}
                  {r.status === "fail" && <X className="w-3.5 h-3.5 text-danger mt-0.5 shrink-0" />}
                  {r.status === "warn" && <AlertCircle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />}
                  <code className="text-[11px] font-mono text-muted w-48 shrink-0 truncate">{r.field}</code>
                  <span className={`text-[11px] ${r.status === "pass" ? "text-secondary" : r.status === "fail" ? "text-danger/80" : "text-warning/80"}`}>
                    {r.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
