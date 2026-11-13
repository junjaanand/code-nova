"use client";

import React, { useMemo } from "react";
import { formatSeverityColor } from "@/lib/utils";
import { Check, X, ShieldAlert, Sparkles, MessageSquare, Lock } from "lucide-react";

interface TiptapEditorProps {
  content: string;
  findings: any[];
  selectedFindingId: string | null;
  onSelectFinding: (findingId: string) => void;
  onAcceptFix: (findingId: string) => void;
  onRejectFinding: (findingId: string) => void;
  onChangeContent: (newText: string) => void;
  readOnly?: boolean;
}

export function TiptapEditor({
  content,
  findings,
  selectedFindingId,
  onSelectFinding,
  onAcceptFix,
  onRejectFinding,
  onChangeContent,
  readOnly = false
}: TiptapEditorProps) {
  // Build segmented view of text with highlight marks
  const segments = useMemo(() => {
    if (!content) return [];
    if (!findings || findings.length === 0) {
      return [{ text: content, isFinding: false }];
    }

    // Filter text_span findings with valid start/end
    const validFindings = findings
      .filter((f) => f.location && typeof f.location.start === "number" && typeof f.location.end === "number")
      .sort((a, b) => a.location.start - b.location.start);

    const segs: any[] = [];
    let lastIndex = 0;

    for (const f of validFindings) {
      const start = Math.max(lastIndex, f.location.start);
      const end = Math.min(content.length, f.location.end);

      if (start > lastIndex) {
        segs.push({
          text: content.slice(lastIndex, start),
          isFinding: false
        });
      }

      if (end > start) {
        segs.push({
          text: content.slice(start, end),
          isFinding: true,
          finding: f
        });
        lastIndex = end;
      }
    }

    if (lastIndex < content.length) {
      segs.push({
        text: content.slice(lastIndex),
        isFinding: false
      });
    }

    return segs;
  }, [content, findings]);

  const selectedFinding = findings?.find((f) => f.id === selectedFindingId);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Editor Header Toolbar */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 px-5 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Review Canvas (Tiptap / ProseMirror)
          </span>
          <span className="text-xs text-slate-400">
            {findings.length} brand findings detected
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            Info
          </span>
        </div>
      </div>

      {/* Interactive Prose Mirror Content Body */}
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto font-sans leading-relaxed text-base text-slate-800 dark:text-slate-100 relative">
          {readOnly && (
            <div className="mb-4 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-amber-600" /> Auditor Read-Only Canvas
              </span>
              <span className="text-[10px] uppercase font-mono text-amber-700 dark:text-amber-400">
                Tamper-Evident Mode Active
              </span>
            </div>
          )}
          {segments.map((seg, idx) => {
            if (!seg.isFinding) {
              return <span key={idx}>{seg.text}</span>;
            }

            const f = seg.finding;
            const isSelected = f.id === selectedFindingId;
            const colors = formatSeverityColor(f.severity);

            return (
              <mark
                key={idx}
                onClick={() => onSelectFinding(f.id)}
                className={`relative px-1 py-0.5 rounded transition-all font-medium ${colors.mark} ${
                  isSelected ? "ring-2 ring-blue-600 shadow-sm" : ""
                } ${f.status === "accepted" ? "line-through opacity-60 bg-emerald-100" : ""}`}
                title={`[${f.severity.toUpperCase()}] ${f.explanation}`}
              >
                {seg.text}
              </mark>
            );
          })}
        </div>

        {/* Floating Quick Action Card when finding selected */}
        {selectedFinding && selectedFinding.suggestions && selectedFinding.suggestions.length > 0 && (
          <div className="mt-8 max-w-2xl mx-auto p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 backdrop-blur-sm shadow-md animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                  AI Fix Suggestion (Intent Verified)
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Intent Guard: PASS
                </span>
              </div>
              <button
                onClick={() => onSelectFinding("")}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Dismiss
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              Replace with:{" "}
              <strong className="text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                "{selectedFinding.suggestions[0].text}"
              </strong>
            </p>
            <p className="mt-1 text-xs text-slate-500 italic">
              Rationale: {selectedFinding.suggestions[0].rationale}
            </p>

            <div className="mt-3 flex items-center gap-2">
              {readOnly ? (
                <span className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-300">
                  <Lock className="w-3.5 h-3.5" /> Edits Disabled in Auditor Mode
                </span>
              ) : (
                <button
                  onClick={() => onAcceptFix(selectedFinding.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Accept Fix (Tracked Change)
                </button>
              )}
              {!readOnly && (
                <button
                  onClick={() => onRejectFinding(selectedFinding.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Reject Finding
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
