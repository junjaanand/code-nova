"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePersona, PersonaRole } from "@/lib/personaContext";
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Download, 
  Lock, 
  Scale, 
  Info, 
  Check, 
  ChevronDown,
  Layers,
  FileText
} from "lucide-react";

interface UnifiedHeaderProps {
  score?: number;
  riskTier?: string;
  contentList?: any[];
  selectedContentId?: string;
  onSelectContent?: (id: string) => void;
  onRunAIReview?: () => void;
  onPrimaryAction?: () => void;
  onExportAudit?: () => void;
  isReviewPage?: boolean;
}

export function UnifiedHeader({
  score = 100,
  riskTier = "standard",
  contentList = [],
  selectedContentId = "",
  onSelectContent,
  onRunAIReview,
  onPrimaryAction,
  onExportAudit,
  isReviewPage = false,
}: UnifiedHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentPersona, setPersona } = usePersona();
  const [showAdvicePopover, setShowAdvicePopover] = useState(false);

  const personaList: { role: PersonaRole; name: string; title: string; icon: string; deskName: string }[] = [
    { role: "creator", name: "Priya", title: "Creator", icon: "✍️", deskName: "Creator Studio" },
    { role: "manager", name: "Rahul", title: "Manager", icon: "📋", deskName: "Content Operations" },
    { role: "reviewer", name: "Kavita", title: "Legal Reviewer", icon: "⚖️", deskName: "Legal & Compliance" },
    { role: "admin", name: "Ananya", title: "Admin", icon: "🛡️", deskName: "Brand Governance" },
    { role: "auditor", name: "Vikram", title: "Auditor", icon: "👁️", deskName: "External Audit" },
  ];

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

  const getRiskColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "high":
        return { text: "text-red-700 dark:text-red-300", bg: "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800", dot: "bg-red-500" };
      case "elevated":
        return { text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800", dot: "bg-amber-500" };
      default:
        return { text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800", dot: "bg-emerald-500" };
    }
  };

  const riskColor = getRiskColor(riskTier);
  const selectedDoc = contentList.find((c) => c.id === selectedContentId);

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* LEFT: Context / Document Switcher */}
      <div className="flex items-center gap-3 min-w-[280px]">
        {isReviewPage && contentList.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Doc:</span>
            <div className="relative">
              <select
                value={selectedContentId}
                onChange={(e) => onSelectContent && onSelectContent(e.target.value)}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border-none rounded-lg pl-2.5 pr-8 py-1 text-slate-900 dark:text-slate-100 cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500"
              >
                {contentList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title.length > 28 ? c.title.substring(0, 28) + "..." : c.title}
                  </option>
                ))}
              </select>
            </div>
            {selectedDoc && (
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {selectedDoc.channel}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {pathname === "/brand-pack" ? "Brand Pack & Knowledge Base v2" :
               pathname === "/queue" ? "Human Governance Queue" :
               pathname === "/analytics" ? "Compliance & Guideline Analytics" :
               pathname === "/mcp" ? "Brand Guard MCP Server" : "BrandShield AI"}
            </span>
          </div>
        )}
      </div>

      {/* CENTER: Evaluator Persona Segmented Controller */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 hidden lg:inline">
          Persona:
        </span>
        {personaList.map((p) => {
          const isActive = currentPersona.role === p.role;
          return (
            <button
              key={p.role}
              onClick={() => handleSelectRole(p.role)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                isActive
                  ? p.role === "reviewer"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/30 scale-[1.02]"
                    : p.role === "auditor"
                    ? "bg-amber-600 text-white shadow-sm shadow-amber-500/30 scale-[1.02]"
                    : p.role === "manager"
                    ? "bg-amber-500 text-white shadow-sm shadow-amber-400/30 scale-[1.02]"
                    : p.role === "admin"
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30 scale-[1.02]"
                    : "bg-blue-600 text-white shadow-sm shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
              }`}
              title={`Switch to ${p.name} (${p.title})`}
            >
              <span>{p.icon}</span>
              <span className="text-[11px]">{p.name}</span>
            </button>
          );
        })}

        {/* Info advice trigger popover button */}
        <div className="relative">
          <button
            onClick={() => setShowAdvicePopover(!showAdvicePopover)}
            className="w-6 h-6 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="View testing instructions for active role"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {showAdvicePopover && (
            <div className="absolute right-0 top-8 w-80 p-3.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentPersona.name} ({currentPersona.title})
                  </span>
                </div>
                <button
                  onClick={() => setShowAdvicePopover(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {currentPersona.role === "creator" && "✍️ Creator Mode: Try editing text or clicking 'Apply Fix' in the canvas. Sign-off and override buttons are restricted."}
                {currentPersona.role === "manager" && "📋 Manager Mode: Can approve Standard & Elevated risk items. High-risk claims escalate to Legal."}
                {currentPersona.role === "reviewer" && "⚖️ Legal Reviewer Mode: Sign-off & Approve button is UNLOCKED! You can also provide documented override reasons on high-risk flags."}
                {currentPersona.role === "admin" && "🛡️ Admin Mode: Full access to compile new guidelines from text/PDFs, configure rules, and resolve ambiguities."}
                {currentPersona.role === "auditor" && "👁️ Auditor Mode: Strictly read-only for compliance integrity. Download the cryptographic certified audit trail JSON."}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Active Desk: <strong>{currentPersona.title}</strong></span>
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {currentPersona.permissions.isReadOnly ? "READ-ONLY" : "INTERACTIVE"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Score Badge & Unified Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Governance Score Pill */}
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold ${riskColor.bg} ${riskColor.text}`}>
          <span className={`w-2 h-2 rounded-full ${riskColor.dot} animate-pulse`}></span>
          <span className="font-bold">{score}/100</span>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 hidden sm:inline">
            {riskTier}
          </span>
        </div>

        {/* Action Buttons for Review Page */}
        {isReviewPage && (
          <div className="flex items-center gap-2">
            <button
              onClick={onRunAIReview}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run AI Review</span>
            </button>

            {currentPersona.role === "creator" && (
              <button
                onClick={onPrimaryAction}
                className="px-3 py-1 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            )}

            {(currentPersona.role === "reviewer" || currentPersona.role === "manager" || currentPersona.role === "admin") && (
              <button
                onClick={onPrimaryAction}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sign-off & Approve</span>
              </button>
            )}

            {currentPersona.role === "auditor" && (
              <button
                onClick={onExportAudit}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit (.JSON)</span>
              </button>
            )}
          </div>
        )}

        {/* Auditor direct download button if not on review page */}
        {!isReviewPage && currentPersona.role === "auditor" && onExportAudit && (
          <button
            onClick={onExportAudit}
            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Audit Trail (.JSON)</span>
          </button>
        )}
      </div>
    </header>
  );
}
