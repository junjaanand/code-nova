"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { usePersona, PersonaRole, PERSONAS } from "@/lib/personaContext";
import { 
  FlaskConical, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  Info, 
  Lock, 
  Scale, 
  FileEdit, 
  Wrench, 
  FileCheck2,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from "lucide-react";

export function EvaluatorBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentPersona, setPersona } = usePersona();
  const [collapsed, setCollapsed] = useState(false);

  const handleSelectRole = (pRole: PersonaRole) => {
    setPersona(pRole);
    const targetRoutes: Record<PersonaRole, string> = {
      creator: "/",
      manager: "/queue",
      reviewer: "/queue",
      admin: "/brand-pack",
      auditor: "/analytics",
    };
    const target = targetRoutes[pRole];
    if (target && pathname !== target) {
      router.push(target);
    }
  };

  interface RoleConfig {
    role: PersonaRole;
    label: string;
    icon: any;
    hint: string;
    testingAdvice: string;
    quickLink: { label: string; href: string };
    color: string;
    activeBg: string;
    badgeBg: string;
  }

  const roleConfigs: Record<PersonaRole, RoleConfig> = {
    creator: {
      role: "creator",
      label: "Priya (Creator)",
      icon: FileEdit,
      hint: "Drafting & Fix Acceptance",
      testingAdvice: "✍️ Try editing text or clicking 'Apply Fix' in the canvas. Notice that 'Sign-off & Approve' and 'Override' buttons are restricted.",
      quickLink: { label: "Review Canvas", href: "/" },
      color: "border-blue-500 text-blue-600",
      activeBg: "bg-blue-600 text-white shadow-blue-500/25",
      badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    manager: {
      role: "manager",
      label: "Rahul (Manager)",
      icon: FileCheck2,
      hint: "Standard & Elevated Approvals",
      testingAdvice: "📋 Content Manager authority: Can approve Standard & Elevated risk content and request revisions. High-risk claims escalate to Legal.",
      quickLink: { label: "Review Queue", href: "/queue" },
      color: "border-amber-500 text-amber-600",
      activeBg: "bg-amber-600 text-white shadow-amber-500/25",
      badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    reviewer: {
      role: "reviewer",
      label: "Kavita (Legal Reviewer)",
      icon: Scale,
      hint: "High-Risk Sign-off & Override",
      testingAdvice: "⚖️ Legal Reviewer authority: The green 'Sign-off & Approve' button is UNLOCKED! You can also click 'Override with Reason' on high-risk flags.",
      quickLink: { label: "Review Queue", href: "/queue" },
      color: "border-emerald-500 text-emerald-600",
      activeBg: "bg-emerald-600 text-white shadow-emerald-500/25",
      badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    admin: {
      role: "admin",
      label: "Ananya (Brand Admin)",
      icon: Wrench,
      hint: "Brand Pack & Guideline Compiler",
      testingAdvice: "🔧 Brand Admin authority: Full access to compile new guidelines from text/PDFs in Brand Pack, and resolve ambiguous rules with the Clarifier.",
      quickLink: { label: "Brand Pack Studio", href: "/brand-pack" },
      color: "border-purple-500 text-purple-600",
      activeBg: "bg-purple-600 text-white shadow-purple-500/25",
      badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    },
    auditor: {
      role: "auditor",
      label: "Vikram (Auditor)",
      icon: Lock,
      hint: "Read-Only Compliance Mode",
      testingAdvice: "🔒 External Auditor Mode: Content editing and fix application are LOCKED to preserve chain-of-custody. Download certified audit records.",
      quickLink: { label: "Audit Telemetry", href: "/analytics" },
      color: "border-slate-500 text-slate-600",
      activeBg: "bg-slate-800 text-white shadow-slate-700/25",
      badgeBg: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    },
  };

  const currentConfig = roleConfigs[currentPersona.role] || roleConfigs.creator;

  const personaList: PersonaRole[] = ["creator", "manager", "reviewer", "admin", "auditor"];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/60 text-white px-6 py-2.5 shadow-md relative z-30">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hackathon Tag & Persona Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide">
            <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
            <span>JUDGE DEMO BAR</span>
          </div>

          <span className="text-xs text-slate-300 font-medium hidden sm:inline">
            Switch Role to test Governance:
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {personaList.map((pRole) => {
              const persona = PERSONAS[pRole];
              const isActive = currentPersona.role === pRole;
              return (
                <button
                  key={pRole}
                  onClick={() => handleSelectRole(pRole)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                    isActive
                      ? "bg-blue-600 text-white ring-2 ring-blue-400 shadow-blue-500/40"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                  <span>{persona.name.split(" ")[0]} ({persona.title.split(" ")[0]})</span>
                  {isActive && <Check className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Round Info & Collapse Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
            CodeNova India 2026
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white text-xs flex items-center gap-0.5 transition-colors"
            title={collapsed ? "Expand evaluator guidance" : "Collapse evaluator guidance"}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Dynamic Contextual Guidance Box */}
      {!collapsed && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${currentConfig.badgeBg}`}>
              Active: {currentPersona.name} ({currentPersona.title})
            </span>
            <p className="text-slate-300 text-[11px] leading-snug">
              {currentConfig.testingAdvice}
            </p>
            <Link
              href={currentConfig.quickLink.href}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline flex items-center gap-1 transition-colors"
            >
              Open {currentConfig.quickLink.label} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[10px] text-slate-400 shrink-0">
            <span>Override: <strong className={currentPersona.permissions.canOverrideFinding ? "text-emerald-400" : "text-slate-500"}>{currentPersona.permissions.canOverrideFinding ? "Granted" : "Locked"}</strong></span>
            <span>•</span>
            <span>Approve: <strong className={currentPersona.permissions.canApproveStandard ? "text-emerald-400" : "text-slate-500"}>{currentPersona.permissions.canApproveStandard ? "Allowed" : "Locked"}</strong></span>
            <span>•</span>
            <span>Editor: <strong className={currentPersona.permissions.isReadOnly ? "text-amber-400" : "text-emerald-400"}>{currentPersona.permissions.isReadOnly ? "Read-Only" : "Editable"}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}