"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  FlaskConical,
  Database,
  CheckCircle2,
  Activity,
  Send,
} from "lucide-react";

const tools = [
  { name: "Contract Tester", href: "/test", icon: FlaskConical, desc: "Descobrir catálogo + testar operações" },
  { name: "Sandbox", href: "/sandbox", icon: Database, desc: "Puxar dados reais de apps" },
  { name: "Schema Validator", href: "/validate", icon: CheckCircle2, desc: "Validar JSON contra o contrato" },
  { name: "Ecosystem Status", href: "/status", icon: Activity, desc: "Monitorar apps do ecossistema" },
  { name: "Webhook Tester", href: "/webhook-test", icon: Send, desc: "Enviar webhooks de teste" },
];

export function NavDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-secondary hover:text-primary transition-colors"
      >
        Tools
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-64 py-2 bg-[#111111] border border-[rgba(232,224,213,0.08)] rounded-md shadow-xl animate-fade-in z-50">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-3 py-2.5 hover:bg-elevated/50 transition-colors"
            >
              <tool.icon className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary">{tool.name}</p>
                <p className="text-[10px] text-muted leading-relaxed">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
