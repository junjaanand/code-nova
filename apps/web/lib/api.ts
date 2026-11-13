const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const userId = typeof window !== "undefined" ? localStorage.getItem("brandshield_user_id") || "usr_priya" : "usr_priya";

  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": userId,
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
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
}

export const api = {
  // Content & AI Review
  listContent: () => fetchApi<any[]>("/content"),
  getContent: (id: string) => fetchApi<any>(`/content/${id}`),
  createContent: (data: { title: string; content_text: string; channel?: string; audience?: string; creator_purpose?: string }) =>
    fetchApi<any>("/content", { method: "POST", body: JSON.stringify(data) }),
  updateContent: (id: string, data: any) =>
    fetchApi<any>(`/content/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  triggerReview: (id: string) =>
    fetchApi<any>(`/content/${id}/review`, { method: "POST" }),
  
  // Finding Actions
  acceptFinding: (contentId: string, findingId: string) =>
    fetchApi<any>(`/content/${contentId}/findings/${findingId}/accept`, { method: "POST" }),
  rejectFinding: (contentId: string, findingId: string, reason: string) =>
    fetchApi<any>(`/content/${contentId}/findings/${findingId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),
  overrideFinding: (contentId: string, findingId: string, reason: string) =>
    fetchApi<any>(`/content/${contentId}/findings/${findingId}/override`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),

  // Workflow & Kanban
  getReviewQueue: () => fetchApi<any>("/review-queue"),
  submitForReview: (id: string) =>
    fetchApi<any>(`/content/${id}/submit-for-review`, { method: "POST" }),
  approveContent: (id: string, comment?: string) =>
    fetchApi<any>(`/content/${id}/approve`, { method: "POST", body: JSON.stringify({ comment }) }),
  rejectContent: (id: string, reason: string) =>
    fetchApi<any>(`/content/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),

  // Brand Pack & Guideline Health
  getActiveBrandPack: () => fetchApi<any>("/brand-pack/active"),
  compileGuidelines: (document_text: string) =>
    fetchApi<any>("/brand-pack/compile", { method: "POST", body: JSON.stringify({ document_text }) }),
  draftClarification: (ruleId: string) =>
    fetchApi<any>(`/analytics/guideline-health/${ruleId}/draft-clarification`, { method: "POST" }),

  // Analytics
  getAnalytics: () => fetchApi<any>("/analytics/overview"),

  // MCP / Guard Check
  guardCheck: (text: string, channel: string = "linkedin") =>
    fetchApi<any>("/guard/check", { method: "POST", body: JSON.stringify({ text, channel }) })
};
