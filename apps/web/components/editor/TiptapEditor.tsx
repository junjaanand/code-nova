"use client";

import React, { useMemo } from "react";
import { formatSeverityColor } from "@/lib/utils";
import { Lock, FileText, CheckCircle2 } from "lucide-react";

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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Editor Sub-header */}
      <div className="h-11 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Document Canvas</span>
          </div>
          <span className="text-[11px] text-slate-400">
            • {findings.length} brand citations detected
          </span>
        </div>

        {/* Highlight Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            Critical Violation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            Notice
          </span>
        </div>
      </div>

      {/* Focused Writing Canvas */}
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {readOnly && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-amber-600" /> Auditor Read-Only Canvas
              </span>
              <span className="text-[10px] uppercase font-mono text-amber-700 dark:text-amber-400">
                Non-Repudiation Verified
              </span>
            </div>
          )}

          <div className="font-sans leading-relaxed text-base text-slate-800 dark:text-slate-100 p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/60 min-h-[480px]">
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
                  className={`relative px-1 py-0.5 rounded cursor-pointer transition-all font-medium ${colors.mark} ${
                    isSelected ? "ring-2 ring-blue-600 shadow-sm" : ""
                  } ${f.status === "accepted" ? "line-through opacity-60 bg-emerald-100 text-emerald-900" : ""}`}
                  title={`[${f.severity.toUpperCase()}] ${f.explanation} (Click to inspect evidence)`}
                >
                  {seg.text}
                </mark>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            💡 Click any highlighted phrase to inspect its brand guideline rule, factual citation, and intent-safe fix in the right drawer.
          </p>
        </div>
      </div>
    </div>
  );
}
