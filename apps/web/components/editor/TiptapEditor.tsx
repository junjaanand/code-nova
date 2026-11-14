"use client";

import React, { useMemo } from "react";
import { formatSeverityColor } from "@/lib/utils";
import { Lock, FileText, CheckCircle2, ChevronDown, Sparkles } from "lucide-react";

interface TiptapEditorProps {
  content: string;
  findings: any[];
  selectedFindingId: string | null;
  onSelectFinding: (findingId: string) => void;
  onAcceptFix: (findingId: string) => void;
  onRejectFinding: (findingId: string) => void;
  onChangeContent: (newText: string) => void;
  readOnly?: boolean;
  contentList?: any[];
  selectedContentId?: string;
  onSelectContent?: (id: string) => void;
  currentContent?: any;
}

export function TiptapEditor({
  content,
  findings,
  selectedFindingId,
  onSelectFinding,
  onAcceptFix,
  onRejectFinding,
  onChangeContent,
  readOnly = false,
  contentList = [],
  selectedContentId = "",
  onSelectContent,
  currentContent
}: TiptapEditorProps) {
  // Build segmented view of text with highlight marks
  // ONLY highlights open violations and dynamically relocates exact word boundaries to prevent word-breaking!
  const segments = useMemo(() => {
    if (!content) return [];
    if (!findings || findings.length === 0) {
      return [{ text: content, isFinding: false }];
    }

    // Filter ONLY open findings (accepted/resolved ones are now compliant text and shouldn't be highlighted as errors)
    const openFindings = findings.filter(
      (f) => f.status !== "accepted" && f.status !== "rejected"
    );

    // Dynamically resolve exact start and end offsets based on matched_text to prevent slicing words
    const resolvedSpans: any[] = [];
    for (const f of openFindings) {
      if (!f.location) continue;
      let start = typeof f.location.start === "number" ? f.location.start : 0;
      let end = typeof f.location.end === "number" ? f.location.end : 0;
      const matched = f.location.matched_text;

      if (matched && matched.trim()) {
        // If content at start:end is NOT matched, dynamically relocate the exact whole phrase
        if (content.slice(start, end) !== matched) {
          const exactPos = content.indexOf(matched);
          if (exactPos !== -1) {
            start = exactPos;
            end = exactPos + matched.length;
          }
        }
      }

      if (end > start && start < content.length) {
        resolvedSpans.push({
          finding: f,
          start: Math.max(0, start),
          end: Math.min(content.length, end)
        });
      }
    }

    // Sort by start index
    resolvedSpans.sort((a, b) => a.start - b.start);

    // Build clean non-overlapping segments
    const segs: any[] = [];
    let lastIndex = 0;

    for (const span of resolvedSpans) {
      if (span.start < lastIndex) {
        // Skip overlapping spans to prevent slicing
        continue;
      }

      if (span.start > lastIndex) {
        segs.push({
          text: content.slice(lastIndex, span.start),
          isFinding: false
        });
      }

      segs.push({
        text: content.slice(span.start, span.end),
        isFinding: true,
        finding: span.finding
      });
      lastIndex = span.end;
    }

    if (lastIndex < content.length) {
      segs.push({
        text: content.slice(lastIndex),
        isFinding: false
      });
    }

    return segs;
  }, [content, findings]);

  const openFindingsCount = (findings || []).filter((f) => f.status !== "accepted" && f.status !== "rejected").length;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* ================= DOCUMENT CANVAS HEADER (Moved inside Canvas) ================= */}
      <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
        {/* Top Row: Document Selector + Channel + Status */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Doc:</span>
            </div>

            {contentList && contentList.length > 0 && onSelectContent ? (
              <div className="relative">
                <select
                  value={selectedContentId}
                  onChange={(e) => onSelectContent(e.target.value)}
                  className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-slate-900 dark:text-slate-100 cursor-pointer shadow-xs focus:ring-2 focus:ring-blue-500"
                >
                  {contentList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {currentContent?.title || "Document Review Canvas"}
              </h3>
            )}

            {currentContent?.channel && (
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {currentContent.channel}
              </span>
            )}

            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              currentContent?.status === "approved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200" :
              currentContent?.status === "in_review" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200" :
              "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200"
            }`}>
              Status: {currentContent?.status || "Draft"}
            </span>
          </div>

          {/* Right side: Findings Count & Legend */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {openFindingsCount} open violation{openFindingsCount !== 1 ? "s" : ""}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
              Critical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              Warning
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Notice
            </span>
          </div>
        </div>

        {/* Bottom Row: Document Metadata Subtitle */}
        {currentContent && (
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Author: <strong className="text-slate-600 dark:text-slate-300">{currentContent.author_name || "Priya Sharma"}</strong></span>
            <span>•</span>
            <span>Audience: <strong className="text-slate-600 dark:text-slate-300">{currentContent.audience || "B2B CFOs"}</strong></span>
            <span>•</span>
            <span>Purpose: <span className="italic">{currentContent.creator_purpose || "Enterprise announcement"}</span></span>
          </div>
        )}
      </div>

      {/* ================= FOCUSED WRITING CANVAS ================= */}
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

          <div className="font-sans leading-relaxed text-base text-slate-800 dark:text-slate-100 p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/60 min-h-[460px]">
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
                  }`}
                  title={`[${f.severity.toUpperCase()}] ${f.explanation} (Click to inspect and fix)`}
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
