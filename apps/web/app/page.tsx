"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { EvidenceDrawer } from "@/components/evidence-drawer/EvidenceDrawer";
import { LiveAgentStream } from "@/components/streaming/LiveAgentStream";
import { api } from "@/lib/api";
import { usePersona } from "@/lib/personaContext";
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Plus, 
  FileCheck2, 
  ShieldAlert, 
  ChevronDown, 
  ShieldCheck, 
  Lock, 
  Download,
  Scale,
  AlertTriangle
} from "lucide-react";

export default function ReviewPage() {
  const { currentPersona } = usePersona();
  const [contentList, setContentList] = useState<any[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>("cnt_demo_fintech_launch");
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load content
  const loadContentData = async (id: string) => {
    try {
      const res = await api.getContent(id);
      setCurrentContent(res.content);
      setFindings(res.findings || []);
      if (res.findings && res.findings.length > 0) {
        setSelectedFindingId(res.findings[0].id);
      } else {
        setSelectedFindingId(null);
      }
    } catch (err) {
      console.error("Error loading content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const list = await api.listContent();
        setContentList(list);
        if (list.length > 0) {
          const initialId = list.find((i: any) => i.id === "cnt_demo_fintech_launch")?.id || list[0].id;
          setSelectedContentId(initialId);
          await loadContentData(initialId);
        }
      } catch (e) {
        console.error("Initialization error:", e);
      }
    }
    init();
  }, []);

  const handleSelectContent = async (id: string) => {
    setSelectedContentId(id);
    await loadContentData(id);
  };

  const handleAcceptFix = async (findingId: string) => {
    if (currentPersona.permissions.isReadOnly) {
      alert("Auditor mode is Read-Only.");
      return;
    }
    try {
      const res = await api.acceptFinding(selectedContentId, findingId);
      await loadContentData(selectedContentId);
    } catch (e) {
      console.error("Error accepting fix:", e);
    }
  };

  const handleRejectFinding = async (findingId: string, reason: string = "Creator discretion") => {
    try {
      await api.rejectFinding(selectedContentId, findingId, reason);
      await loadContentData(selectedContentId);
    } catch (e) {
      console.error("Error rejecting finding:", e);
    }
  };

  const handleOverrideFinding = async (findingId: string, reason: string) => {
    try {
      await api.overrideFinding(selectedContentId, findingId, reason);
      await loadContentData(selectedContentId);
    } catch (e) {
      console.error("Error overriding finding:", e);
    }
  };

  const handleExportAudit = () => {
    const auditData = {
      platform: "BrandShield AI Enterprise Governance",
      audit_standard: "ISO/IEC 42001 & RBI Fintech Advisory 2026",
      session_id: "aud_trace_" + Math.random().toString(36).substring(2, 9),
      auditor: "Vikram Singh (External Compliance Auditor)",
      generated_at: new Date().toISOString(),
      content_document: {
        id: selectedContentId,
        title: currentContent?.title,
        channel: currentContent?.channel,
        audience: currentContent?.audience,
        author: currentContent?.author_name,
        current_status: currentContent?.status,
        governance_score: currentContent?.latest_score,
        risk_tier: currentContent?.risk_tier
      },
      evidence_summary: {
        total_findings: findings.length,
        critical_violations: findings.filter((f) => f.severity === "critical").length,
        warnings: findings.filter((f) => f.severity === "warning").length,
        grounding_rule: "Strict 'No citation, no flag' gatekeeper enforced"
      },
      verified_findings_ledger: findings.map((f: any) => ({
        id: f.id,
        category: f.category,
        severity: f.severity,
        matched_text: f.location?.matched_text,
        citation_source: f.evidence?.[0]?.source_id,
        citation_clause: f.evidence?.[0]?.page_or_clause,
        citation_quote: f.evidence?.[0]?.quote,
        intent_guard_status: f.suggestions?.[0]?.intent_check || "pass",
        status: f.status
      }))
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BrandShield_Audit_Trail_${selectedContentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrimaryAction = async () => {
    if (currentPersona.role === "creator") {
      try {
        await api.submitForReview(selectedContentId);
        alert("Submitted to Manager & Legal Review Queue!");
        await loadContentData(selectedContentId);
      } catch (e) {
        console.error("Submit error:", e);
      }
    } else if (currentPersona.permissions.canApproveHighRisk || currentPersona.permissions.canApproveStandard) {
      try {
        await api.approveContent(selectedContentId, `Approved by ${currentPersona.name} (${currentPersona.title})`);
        alert(`Approved by ${currentPersona.name}! Content marked as APPROVED.`);
        await loadContentData(selectedContentId);
      } catch (e) {
        alert(e);
      }
    }
  };

  const activeFinding = findings.find((f) => f.id === selectedFindingId);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        score={currentContent?.latest_score || 100}
        riskTier={currentContent?.risk_tier || "standard"}
      />

      {/* Dynamic Persona Mode Banner */}
      {currentPersona.role === "auditor" && (
        <div className="bg-amber-500/15 dark:bg-amber-950/60 border-b border-amber-300 dark:border-amber-700/80 px-8 py-2 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
              AUDITOR READ-ONLY SESSION
            </span>
            <span>
              All content editing and fix acceptance are locked to maintain non-repudiation and cryptographic audit integrity.
            </span>
          </div>
          <button 
            onClick={handleExportAudit}
            className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0"
          >
            <Download className="w-3 h-3" /> Download Certified JSON Trail
          </button>
        </div>
      )}

      {currentPersona.role === "reviewer" && (
        <div className="bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-300 dark:border-emerald-700/60 px-8 py-2 text-xs flex items-center justify-between text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
              LEGAL & COMPLIANCE DESK
            </span>
            <span>
              You have final sign-off authority for high-risk claims and override permissions with documented justification.
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
            Override Authority: Active
          </span>
        </div>
      )}

      {currentPersona.role === "manager" && (
        <div className="bg-blue-500/10 dark:bg-blue-950/40 border-b border-blue-300 dark:border-blue-700/60 px-8 py-2 text-xs flex items-center justify-between text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px] bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-1.5 py-0.5 rounded border border-blue-300">
              CONTENT OPERATIONS DESK
            </span>
            <span>
              Reviewer queue manager: Standard & elevated approval authorized. High-risk claims escalate to Legal.
            </span>
          </div>
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-full border border-blue-300">
            Manager Sign-off
          </span>
        </div>
      )}

      {currentPersona.role === "creator" && (
        <div className="bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-8 py-1.5 text-xs flex items-center justify-between text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              CREATOR DRAFTING STUDIO
            </span>
            <span className="text-slate-500 text-[11px]">
              Click highlighted phrases to inspect brand citations and apply intent-preserving fixes.
            </span>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold font-mono">
            Self-Resolution Active
          </span>
        </div>
      )}

      {/* Subheader Toolbar */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Document:</span>
          <select
            value={selectedContentId}
            onChange={(e) => handleSelectContent(e.target.value)}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {contentList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.channel})
              </option>
            ))}
          </select>

          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono px-2 py-0.5 rounded">
            Channel: {currentContent?.channel || "LinkedIn"}
          </span>

          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            currentContent?.status === "approved" ? "bg-emerald-100 text-emerald-800" :
            currentContent?.status === "in_review" ? "bg-amber-100 text-amber-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            Status: {currentContent?.status || "Draft"}
          </span>
        </div>

        {/* Dynamic Action Buttons Based on Active Persona */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsStreaming(true)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Run AI Review (13 Agents)
          </button>

          {currentPersona.role === "creator" && (
            <button
              onClick={handlePrimaryAction}
              className="px-3.5 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Review
            </button>
          )}

          {(currentPersona.role === "reviewer" || currentPersona.role === "manager" || currentPersona.role === "admin") && (
            <button
              onClick={handlePrimaryAction}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Sign-off & Approve
            </button>
          )}

          {currentPersona.role === "auditor" && (
            <button
              onClick={handleExportAudit}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export Certified Audit Trail
            </button>
          )}
        </div>
      </div>

      {/* Main Review Workspace: Canvas + Side-by-Side Drawer */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading review canvas...
            </div>
          ) : (
            <TiptapEditor
              content={currentContent?.current_text || ""}
              findings={findings}
              selectedFindingId={selectedFindingId}
              onSelectFinding={setSelectedFindingId}
              onAcceptFix={handleAcceptFix}
              onRejectFinding={(fid) => handleRejectFinding(fid, "Manual reject")}
              onChangeContent={(txt) => {
                if (currentContent && !currentPersona.permissions.isReadOnly) {
                  setCurrentContent({ ...currentContent, current_text: txt });
                }
              }}
              readOnly={currentPersona.permissions.isReadOnly}
            />
          )}
        </div>

        {/* Side-by-Side Evidence Drawer */}
        <EvidenceDrawer
          finding={activeFinding}
          onAccept={handleAcceptFix}
          onReject={handleRejectFinding}
          onOverride={handleOverrideFinding}
          onClose={() => setSelectedFindingId(null)}
        />
      </div>

      {/* Real-time Streaming Overlay */}
      {isStreaming && (
        <LiveAgentStream
          contentId={selectedContentId}
          onComplete={async () => {
            setIsStreaming(false);
            await loadContentData(selectedContentId);
          }}
        />
      )}
    </div>
  );
}
