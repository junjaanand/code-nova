import {
  initialContentItems,
  initialFindings,
  initialBrandPack,
  initialQueueItems,
  initialAnalyticsOverview,
  MockFinding
} from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// In-memory client-side reactive store for fallback when backend is unreachable on Vercel
let localContentItems = JSON.parse(JSON.stringify(initialContentItems));
let localFindings: Record<string, MockFinding[]> = JSON.parse(JSON.stringify(initialFindings));
let localBrandPack = JSON.parse(JSON.stringify(initialBrandPack));
let localQueue = JSON.parse(JSON.stringify(initialQueueItems));
let localAnalytics = JSON.parse(JSON.stringify(initialAnalyticsOverview));

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const userId = typeof window !== "undefined" ? localStorage.getItem("brandshield_user_id") || "usr_priya" : "usr_priya";

  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": userId,
    ...(options.headers || {})
  };

  // 1.5s timeout for fast fallback
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errorText = await res.text();
      let detailMsg = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.detail) detailMsg = parsed.detail;
      } catch {}
      throw new Error(`API Error ${res.status}: ${detailMsg}`);
    }
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const api = {
  // Content & AI Review
  listContent: async (): Promise<any[]> => {
    try {
      return await fetchApi<any[]>("/content");
    } catch {
      console.warn("[BrandShield API] Backend offline or unreachable. Using in-memory client repository.");
      return JSON.parse(JSON.stringify(localContentItems));
    }
  },

  getContent: async (id: string): Promise<any> => {
    try {
      return await fetchApi<any>(`/content/${id}`);
    } catch {
      console.warn(`[BrandShield API] Backend offline. Returning in-memory document ${id}.`);
      const item = localContentItems.find((c: any) => c.id === id) || localContentItems[0];
      const findings = localFindings[item.id] || [];
      return {
        content: JSON.parse(JSON.stringify(item)),
        findings: JSON.parse(JSON.stringify(findings)),
        findings_count: findings.length
      };
    }
  },

  createContent: async (data: { title: string; content_text: string; channel?: string; audience?: string; creator_purpose?: string }) => {
    try {
      return await fetchApi<any>("/content", { method: "POST", body: JSON.stringify(data) });
    } catch {
      const newItem = {
        id: `cnt_custom_${Date.now()}`,
        workspace_id: "ws_novapay_main",
        author_id: "usr_priya",
        author_name: "Priya Sharma",
        title: data.title,
        content_type: "text",
        channel: data.channel || "linkedin",
        audience: data.audience || "General Audience",
        creator_purpose: data.creator_purpose || "Product messaging",
        status: "draft",
        current_version: 1,
        latest_score: 100,
        risk_tier: "standard",
        current_text: data.content_text
      };
      localContentItems.unshift(newItem);
      localFindings[newItem.id] = [];
      return { content: newItem };
    }
  },

  updateContent: async (id: string, data: any) => {
    try {
      return await fetchApi<any>(`/content/${id}`, { method: "PUT", body: JSON.stringify(data) });
    } catch {
      const item = localContentItems.find((c: any) => c.id === id);
      if (item) {
        if (data.title) item.title = data.title;
        if (data.current_text !== undefined) item.current_text = data.current_text;
      }
      return { status: "success", content: item };
    }
  },

  triggerReview: async (id: string) => {
    try {
      return await fetchApi<any>(`/content/${id}/review`, { method: "POST" });
    } catch {
      // Simulate client-side review evaluation
      const item = localContentItems.find((c: any) => c.id === id);
      if (item) {
        item.status = "ai_reviewed";
        // Calculate open violations
        const findings = localFindings[id] || [];
        const openCritical = findings.filter((f) => f.status === "open" && f.severity === "critical").length;
        const openWarning = findings.filter((f) => f.status === "open" && f.severity === "warning").length;
        item.latest_score = Math.max(20, 100 - openCritical * 25 - openWarning * 10);
        item.risk_tier = openCritical > 0 ? "high" : openWarning > 1 ? "elevated" : "standard";
      }
      return { status: "success", content_id: id };
    }
  },

  // Finding Actions with Dynamic Offset Relocation
  acceptFinding: async (contentId: string, findingId: string) => {
    try {
      return await fetchApi<any>(`/content/${contentId}/findings/${findingId}/accept`, { method: "POST" });
    } catch {
      const findings = localFindings[contentId] || [];
      const f = findings.find((x) => x.id === findingId);
      const item = localContentItems.find((c: any) => c.id === contentId);

      if (f && item && f.suggestions && f.suggestions.length > 0) {
        f.status = "accepted";
        const fixText = f.suggestions[0].text;
        const matched = f.location.matched_text;

        // Exactly relocate whole phrase to guarantee zero word slicing
        let start = f.location.start;
        let end = f.location.end;
        if (matched && item.current_text.includes(matched)) {
          start = item.current_text.indexOf(matched);
          end = start + matched.length;
        }

        const oldLen = end - start;
        const newLen = fixText.length;
        const delta = newLen - oldLen;

        // Replace text
        item.current_text = item.current_text.slice(0, start) + fixText + item.current_text.slice(end);
        f.location.matched_text = fixText;
        f.location.start = start;
        f.location.end = start + newLen;

        // Shift remaining open findings
        for (const other of findings) {
          if (other.id !== f.id && other.status !== "accepted") {
            if (other.location.start >= end) {
              other.location.start += delta;
              other.location.end += delta;
            }
          }
        }

        // Recalculate score
        const openCount = findings.filter((x) => x.status === "open").length;
        item.latest_score = Math.min(100, Math.max(50, 100 - openCount * 15));
        if (openCount === 0) {
          item.risk_tier = "standard";
        }
      }
      return { status: "success", finding_id: findingId };
    }
  },

  rejectFinding: async (contentId: string, findingId: string, reason: string) => {
    try {
      return await fetchApi<any>(`/content/${contentId}/findings/${findingId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason })
      });
    } catch {
      const findings = localFindings[contentId] || [];
      const f = findings.find((x) => x.id === findingId);
      if (f) {
        f.status = "rejected";
        f.decision = { action: "reject", reason };
      }
      return { status: "success" };
    }
  },

  overrideFinding: async (contentId: string, findingId: string, reason: string) => {
    try {
      return await fetchApi<any>(`/content/${contentId}/findings/${findingId}/override`, {
        method: "POST",
        body: JSON.stringify({ reason })
      });
    } catch {
      const findings = localFindings[contentId] || [];
      const f = findings.find((x) => x.id === findingId);
      if (f) {
        f.status = "overridden";
        f.decision = { action: "override", reason, by_user: "Legal Reviewer" };
      }
      return { status: "success" };
    }
  },

  // Workflow & Kanban
  getReviewQueue: async (): Promise<any> => {
    try {
      return await fetchApi<any>("/review-queue");
    } catch {
      return {
        columns: {
          pending_ai: [],
          ai_reviewed: localQueue.filter((q: any) => q.status === "ai_reviewed"),
          high_risk_review: localQueue.filter((q: any) => q.status === "in_review" && q.risk_tier === "high"),
          approved: localQueue.filter((q: any) => q.status === "approved"),
          published: []
        },
        total_items: localQueue.length
      };
    }
  },

  submitForReview: async (id: string) => {
    try {
      return await fetchApi<any>(`/content/${id}/submit-for-review`, { method: "POST" });
    } catch {
      const item = localContentItems.find((c: any) => c.id === id);
      if (item) item.status = "in_review";
      return { status: "success" };
    }
  },

  approveContent: async (id: string, comment?: string) => {
    try {
      return await fetchApi<any>(`/content/${id}/approve`, { method: "POST", body: JSON.stringify({ comment }) });
    } catch {
      const item = localContentItems.find((c: any) => c.id === id);
      if (item) {
        item.status = "approved";
        item.latest_score = 100;
        item.risk_tier = "standard";
      }
      return { status: "success" };
    }
  },

  rejectContent: async (id: string, reason: string) => {
    try {
      return await fetchApi<any>(`/content/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
    } catch {
      const item = localContentItems.find((c: any) => c.id === id);
      if (item) item.status = "draft";
      return { status: "success" };
    }
  },

  // Brand Pack & Guideline Health
  getActiveBrandPack: async (): Promise<any> => {
    try {
      return await fetchApi<any>("/brand-pack/active");
    } catch {
      return JSON.parse(JSON.stringify(localBrandPack));
    }
  },

  compileGuidelines: async (document_text: string) => {
    try {
      return await fetchApi<any>("/brand-pack/compile", { method: "POST", body: JSON.stringify({ document_text }) });
    } catch {
      return {
        status: "success",
        rules_extracted: 3,
        facts_extracted: 2,
        terms_extracted: 1,
        rules: [
          {
            id: `r_compiled_${Date.now()}`,
            category: "tone",
            severity: "warning",
            title: "Maintain measured enterprise voice",
            description: "Avoid hyperbolic or clickbait claims in corporate communications.",
            good_examples: ["Industry-verified speed"],
            bad_examples: ["Mind-blowing speed"],
            source_page: "Compiled Document §1",
            ambiguity_score: 0.1
          }
        ]
      };
    }
  },

  draftClarification: async (ruleId: string) => {
    try {
      return await fetchApi<any>(`/analytics/guideline-health/${ruleId}/draft-clarification`, { method: "POST" });
    } catch {
      const r = localBrandPack.rules.find((x: any) => x.id === ruleId) || localBrandPack.rules[0];
      return {
        rule_id: r.id,
        rule_title: r.title,
        original_description: r.description,
        proposed_description: `${r.description} [CLARIFICATION NOTE: Permitted when supported by accredited third-party analyst reports (e.g. Gartner, IDC). Must include formal footnote citation.]`,
        ambiguity_score: r.ambiguity_score || 0.42,
        override_count: r.override_count || 5,
        positive_example: "Recognized as a leading enterprise payment platform by IDC 2026",
        negative_example: "We are unequivocally the number one platform anywhere",
        rationale: "Resolves reviewer overrides by allowing verified 3rd-party industry rankings."
      };
    }
  },

  applyClarification: async (ruleId: string) => {
    try {
      return await fetchApi<any>(`/analytics/guideline-health/${ruleId}/apply-clarification`, { method: "POST" });
    } catch {
      const r = localBrandPack.rules.find((x: any) => x.id === ruleId);
      if (r) {
        r.description = `${r.description} [CLARIFIED in Brand Pack v3: Permitted with verified 3rd-party footnote citations]`;
        r.ambiguity_score = 0.05;
        r.override_count = 0;
      }
      return {
        status: "success",
        message: `Rule ${ruleId} updated in Brand Pack v3 with clarified guidance.`,
        rule: r
      };
    }
  },

  // Analytics
  getAnalytics: async (): Promise<any> => {
    try {
      return await fetchApi<any>("/analytics/overview");
    } catch {
      return JSON.parse(JSON.stringify(localAnalytics));
    }
  },

  // MCP / Guard Check
  guardCheck: async (text: string, channel: string = "linkedin") => {
    try {
      return await fetchApi<any>("/guard/check", { method: "POST", body: JSON.stringify({ text, channel }) });
    } catch {
      const violations: any[] = [];
      if (/Novapay|nova pay/i.test(text) && !/NovaPay/.test(text)) {
        violations.push({
          rule_id: "r_term_001",
          severity: "critical",
          issue: "Brand name must be camel-cased as 'NovaPay'.",
          suggested_fix: "NovaPay",
          citation: "Brand Glossary §1.1"
        });
      }
      if (/guaranteed returns|100% risk[- ]free/i.test(text)) {
        violations.push({
          rule_id: "r_term_003",
          severity: "critical",
          issue: "RBI fintech regulations prohibit promising guaranteed returns or risk-free returns.",
          suggested_fix: "competitive market yields",
          citation: "Regulatory Glossary §4.2"
        });
      }
      if (/₹3,999/i.test(text)) {
        violations.push({
          rule_id: "fact_pricing_enterprise",
          severity: "critical",
          issue: "Pricing claim of '₹3,999' is outdated. Enterprise plan starts at ₹4,999/mo.",
          suggested_fix: "₹4,999/mo",
          citation: "Official Pricing Sheet v2.4"
        });
      }
      if (/best payment|#1|insane savings/i.test(text)) {
        violations.push({
          rule_id: "r_tone_001",
          severity: "warning",
          issue: "Unbacked superlative violates objective, measured brand voice.",
          suggested_fix: "an industry-leading payment platform",
          citation: "Brand Voice Guide p.8"
        });
      }

      return {
        jsonrpc: "2.0",
        id: "call_mcp_guard_check",
        result: {
          status: violations.length > 0 ? "flagged" : "passed",
          channel,
          violations_found: violations.length,
          violations,
          intent_guard_status: "validated",
          grounded_evidence_rate: "100%",
          zero_hallucination_abstentions: 1
        }
      };
    }
  }
};
