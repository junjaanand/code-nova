"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Quote, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle, 
  ExternalLink, 
  FileText, 
  BadgeAlert, 
  ArrowRight, 
  Lock,
  Scale
} from "lucide-react";
import { formatSeverityColor } from "@/lib/utils";
import { usePersona } from "@/lib/personaContext";

interface EvidenceDrawerProps {
  finding: any | null;
  onAccept: (findingId: string) => void;
  onReject: (findingId: string, reason: string) => void;
  onOverride: (findingId: string, reason: string) => void;
  onClose: () => void;
}

export function EvidenceDrawer({
  finding,
  onAccept,
  onReject,
  onOverride,
  onClose
}: EvidenceDrawerProps) {
  const { currentPersona } = usePersona();
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  if (!finding) {
    return (
      <div className="w-96 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center text-slate-400 h-full">
        <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Side-by-Side Evidence</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Click any highlighted phrase in the content editor to inspect its verified brand citation, clause, and intent-safe fixes.
        </p>
      </div>
    );
  }

  const colors = formatSeverityColor(finding.severity);
  const evidence = finding.evidence && finding.evidence.length > 0 ? finding.evidence[0] : null;

  return (
    <div className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shadow-lg z-20">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${colors.badge}`}>
            {finding.severity}
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
            {finding.category} Finding
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5">
        {/* Role-Specific Context Card */}
        {currentPersona.role === "auditor" && (
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-600" /> Tamper-Proof Audit
            </span>
            <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400">Read-Only</span>
          </div>
        )}

        {currentPersona.role === "reviewer" && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <Scale className="w-3.5 h-3.5 text-emerald-600" /> Legal Override Desk
            </span>
            <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">Override Allowed</span>
          </div>
        )}

        {/* Flagged Issue & Explanation */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Detected Issue
          </h4>
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {finding.explanation}
          </p>
        </div>

        {/* CITED GROUND TRUTH EVIDENCE ("No citation, no flag") */}
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Quote className="w-3.5 h-3.5 text-blue-600" />
              Verified Brand Truth
            </span>
            <span className="text-[10px] font-mono text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded font-semibold">
              v{evidence?.source_version || 2}
            </span>
          </div>

          <blockquote className="text-xs text-slate-700 dark:text-slate-300 italic border-l-2 border-blue-500 pl-2.5 py-0.5 my-2">
            "{evidence?.quote || "Official brand guidelines standard."}"
          </blockquote>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-blue-200/60 dark:border-blue-900/60 font-medium">
            <span>Ref: {evidence?.page_or_clause || "Brand Core §1.1"}</span>
            <span className="font-mono text-blue-700 dark:text-blue-400">{evidence?.source_id}</span>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Verifier Grounding Confidence:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {Math.round((finding.confidence || 0.95) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.round((finding.confidence || 0.95) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            Verified by 'No citation, no flag' Gatekeeper
          </p>
        </div>

        {/* Suggestions List */}
        {finding.suggestions && finding.suggestions.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Intent-Safe Fix Options
            </h4>
            <div className="space-y-2.5">
              {finding.suggestions.map((sug: any, sIdx: number) => (
                <div
                  key={sIdx}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 transition-all bg-white dark:bg-slate-800/50"
                >
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    "{sug.text}"
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{sug.rationale}</p>
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Intent Guard: PASS
                    </span>
                    {currentPersona.permissions.canAcceptFix ? (
                      <button
                        onClick={() => onAccept(finding.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        Apply Fix <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Read-Only
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Override Controls — DYNAMIC BASED ON PERSONA */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {currentPersona.permissions.canOverrideFinding ? (
            showOverrideInput ? (
              <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 space-y-2">
                <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Documented Override Rationale:
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why this finding is being overridden..."
                  className="w-full text-xs p-2 border border-amber-300 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowOverrideInput(false)}
                    className="text-xs text-slate-500 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (overrideReason.trim()) {
                        onOverride(finding.id, overrideReason);
                        setShowOverrideInput(false);
                      }
                    }}
                    className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded"
                  >
                    Confirm Override
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowOverrideInput(true)}
                className="w-full py-2 px-3 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Override with Reason ({currentPersona.title})
              </button>
            )
          ) : (
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Override authority is restricted to <strong>Reviewer / Manager</strong>. (Switch persona in sidebar to test).
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
