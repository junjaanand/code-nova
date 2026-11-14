"use client";

import React, { useState, useEffect } from "react";
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { EvidenceDrawer } from "@/components/evidence-drawer/EvidenceDrawer";
import { LiveAgentStream } from "@/components/streaming/LiveAgentStream";
import { api } from "@/lib/api";
import { usePersona } from "@/lib/personaContext";

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
      await api.acceptFinding(selectedContentId, findingId);
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
      } catch (e: any) {
        alert(e.message || "Failed to approve content. Check persona permissions.");
      }
    }
  };

  const activeFinding = findings.find((f) => f.id === selectedFindingId);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Sleek, Unified Command Header with Perfectly Proportioned Persona Bar */}
      <UnifiedHeader
        isReviewPage={true}
        score={currentContent?.latest_score || 100}
        riskTier={currentContent?.risk_tier || "standard"}
        onRunAIReview={() => setIsStreaming(true)}
        onPrimaryAction={handlePrimaryAction}
        onExportAudit={handleExportAudit}
      />

      {/* Main Review Workspace: Clean Canvas with In-Canvas Doc Header + Side Evidence Drawer */}
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
              contentList={contentList}
              selectedContentId={selectedContentId}
              onSelectContent={handleSelectContent}
              currentContent={currentContent}
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
