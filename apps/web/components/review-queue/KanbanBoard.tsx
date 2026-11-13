"use client";

import React from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  FileEdit, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Lock
} from "lucide-react";
import { usePersona } from "@/lib/personaContext";

interface KanbanProps {
  queue: {
    draft?: any[];
    ai_reviewed?: any[];
    in_review?: any[];
    high_risk?: any[];
    changes_requested?: any[];
    approved?: any[];
  };
  onApprove: (id: string, riskTier?: string) => void;
  onRequestChanges: (id: string) => void;
}

export function KanbanBoard({ queue, onApprove, onRequestChanges }: KanbanProps) {
  const { currentPersona } = usePersona();
  const columns = [
    { key: "ai_reviewed", title: "AI Pre-Screened", count: queue?.ai_reviewed?.length || 0, icon: Clock, color: "text-blue-600 bg-blue-50" },
    { key: "high_risk", title: "High-Risk (Legal Req)", count: queue?.high_risk?.length || 0, icon: AlertOctagon, color: "text-red-600 bg-red-50" },
    { key: "in_review", title: "In Human Review", count: queue?.in_review?.length || 0, icon: UserCheck, color: "text-amber-600 bg-amber-50" },
    { key: "approved", title: "Approved & Published", count: queue?.approved?.length || 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" }
  ];

  const canApproveItem = (item: any) => {
    if (currentPersona.permissions.isReadOnly || currentPersona.role === "creator") {
      return false;
    }
    if (item.risk_tier === "high") {
      return currentPersona.permissions.canApproveHighRisk;
    }
    return currentPersona.permissions.canApproveStandard;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Governance Review Queue
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Role-based approval workflow: Standard items auto-route to Managers; High-risk claims escalate to Legal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((col) => {
          const items = (queue as any)?.[col.key] || [];
          const Icon = col.icon;
          const isHighPriorityForRole = 
            (currentPersona.role === "reviewer" && col.key === "high_risk") ||
            (currentPersona.role === "manager" && col.key === "in_review");

          return (
            <div 
              key={col.key} 
              className={`rounded-xl p-4 flex flex-col h-[75vh] transition-all ${
                isHighPriorityForRole 
                  ? "bg-red-50/70 dark:bg-red-950/30 ring-2 ring-red-400 shadow-md" 
                  : "bg-slate-100/70 dark:bg-slate-800/50"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{col.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isHighPriorityForRole && (
                    <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                      Your Desk
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.color}`}>
                    {items.length}
                  </span>
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {items.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-400">
                    No items in {col.title}
                  </div>
                ) : (
                  items.map((item: any) => {
                    const isAuthorizedToApprove = canApproveItem(item);

                    return (
                      <div
                        key={item.id}
                        className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded font-mono">
                            {item.channel || "LinkedIn"}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.risk_tier === "high" ? "bg-red-100 text-red-800" :
                            item.risk_tier === "elevated" ? "bg-amber-100 text-amber-800" :
                            "bg-emerald-100 text-emerald-800"
                          }`}>
                            Score: {item.latest_score}/100
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                          {item.title}
                        </h4>

                        <div className="text-xs text-slate-500 space-y-1">
                          <p>Author: <strong>{item.author_name}</strong></p>
                          {item.assigned_reviewer_name && (
                            <p className="text-blue-600 dark:text-blue-400 font-medium">
                              Assigned: {item.assigned_reviewer_name}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <Link
                            href={`/?contentId=${item.id}`}
                            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                          >
                            Review Canvas <ArrowRight className="w-3 h-3" />
                          </Link>

                          {col.key !== "approved" && (
                            isAuthorizedToApprove ? (
                              <button
                                onClick={() => onApprove(item.id, item.risk_tier)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3 h-3" /> Approve
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                <Lock className="w-2.5 h-2.5" />
                                {currentPersona.role === "creator"
                                  ? "Needs Reviewer"
                                  : item.risk_tier === "high"
                                  ? "Legal Req"
                                  : "Restricted"}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
