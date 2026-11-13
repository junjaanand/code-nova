"use client";

import React, { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/review-queue/KanbanBoard";
import { api } from "@/lib/api";

export default function QueuePage() {
  const [queue, setQueue] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      const res = await api.getReviewQueue();
      setQueue(res);
    } catch (e) {
      console.error("Queue load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleApprove = async (id: string, riskTier?: string) => {
    try {
      await api.approveContent(id);
      showToast("Content successfully approved & published to brand channels!", "success");
      await loadQueue();
    } catch (e: any) {
      console.error("Approve error:", e);
      showToast(e.message || "Failed to approve content. Check persona permissions.", "error");
    }
  };

  const handleRequestChanges = async (id: string) => {
    try {
      await api.rejectContent(id, "Changes requested per brand policy");
      showToast("Revision requested. Content returned to author draft queue.", "success");
      await loadQueue();
    } catch (e: any) {
      console.error("Reject error:", e);
      showToast(e.message || "Failed to request changes.", "error");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xs text-slate-400">
        Loading governance review queue...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 relative">
      {toastMsg && (
        <div className={`fixed top-4 right-8 z-50 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg transition-all border ${
          toastMsg.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200" 
            : "bg-red-50 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200"
        }`}>
          {toastMsg.text}
        </div>
      )}
      <KanbanBoard
        queue={queue}
        onApprove={handleApprove}
        onRequestChanges={handleRequestChanges}
      />
    </div>
  );
}
