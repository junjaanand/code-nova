"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  FileEdit, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Lock,
  ListFilter,
  LayoutGrid,
  Search,
  ExternalLink,
  ChevronRight,
  AlertTriangle
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
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = [
    ...(queue?.high_risk || []).map((i) => ({ ...i, queue_stage: "high_risk" })),
    ...(queue?.in_review || []).map((i) => ({ ...i, queue_stage: "in_review" })),
    ...(queue?.ai_reviewed || []).map((i) => ({ ...i, queue_stage: "ai_reviewed" })),
    ...(queue?.approved || []).map((i) => ({ ...i, queue_stage: "approved" })),
  ];

  const filteredItems = allItems.filter((i) => {
    const matchSearch = (i.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (i.author_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchTier = filterTier === "all" || i.queue_stage === filterTier;
    return matchSearch && matchTier;
  });

  const columns = [
    { key: "high_risk", title: "High-Risk Legal Desk", count: queue?.high_risk?.length || 0, icon: AlertOctagon, color: "text-red-600 bg-red-50 border-red-200" },
    { key: "in_review", title: "Manager Operations", count: queue?.in_review?.length || 0, icon: UserCheck, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { key: "ai_reviewed", title: "AI Pre-Screened", count: queue?.ai_reviewed?.length || 0, icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { key: "approved", title: "Approved & Published", count: queue?.approved?.length || 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sub-bar with View Toggle & Search */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Governance Approval Queue
            </h2>
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
              {allItems.length} Total Documents
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setFilterTier("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterTier === "all" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400"
              }`}
            >
              All Items ({allItems.length})
            </button>
            <button
              onClick={() => setFilterTier("high_risk")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                filterTier === "high_risk" ? "bg-red-600 text-white shadow-sm" : "text-red-700 dark:text-red-400 hover:bg-red-50"
              }`}
            >
              <span>High-Risk Legal</span>
              <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded-full font-bold">
                {queue?.high_risk?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setFilterTier("in_review")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                filterTier === "in_review" ? "bg-amber-600 text-white shadow-sm" : "text-amber-700 dark:text-amber-400 hover:bg-amber-50"
              }`}
            >
              <span>In Review</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
                {queue?.in_review?.length || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Right side: View Toggle (List vs. Board) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === "list" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Linear Inbox List View"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === "board" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Queue View */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === "list" ? (
          /* ================= SLEEK LINEAR INBOX LIST VIEW ================= */
          <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Document & Channel</span>
              <div className="flex items-center gap-8">
                <span>Governance Score</span>
                <span>Assigned Desk</span>
                <span>Actions</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No items in this queue category.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const canApprove = canApproveItem(item);
                  return (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4"
                    >
                      {/* Document details */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href="/"
                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate flex items-center gap-1.5"
                          >
                            <span>{item.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Link>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200">
                            {item.channel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span>Author: <strong>{item.author_name || "Priya Sharma"}</strong></span>
                          <span>•</span>
                          <span>Audience: {item.audience}</span>
                        </p>
                      </div>

                      {/* Right metadata and action buttons */}
                      <div className="flex items-center gap-6 shrink-0">
                        {/* Score Pill */}
                        <div className="text-center">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            (item.latest_score || 52) < 70 ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {item.latest_score || 52}/100
                          </span>
                        </div>

                        {/* Assigned Desk */}
                        <div>
                          {item.risk_tier === "high" ? (
                            <span className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertOctagon className="w-3 h-3 text-red-600" /> Legal Desk
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-amber-600" /> Content Ops
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Link
                            href="/"
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            Open Canvas
                          </Link>

                          {canApprove ? (
                            <button
                              onClick={() => onApprove(item.id, item.risk_tier)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Sign-off</span>
                            </button>
                          ) : (
                            <span className="px-2 py-1 text-[10px] text-slate-400 font-medium flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded">
                              <Lock className="w-3 h-3" />
                              {currentPersona.permissions.isReadOnly ? "Read-Only" : "Requires Legal"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ================= KANBAN BOARD VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {columns.map((col) => {
              const items = (queue as any)?.[col.key] || [];
              const Icon = col.icon;
              const isHighPriorityForRole = 
                (currentPersona.role === "reviewer" && col.key === "high_risk") ||
                (currentPersona.role === "manager" && col.key === "in_review");

              return (
                <div 
                  key={col.key} 
                  className={`rounded-xl p-4 flex flex-col h-[70vh] transition-all ${
                    isHighPriorityForRole 
                      ? "bg-red-50/70 dark:bg-red-950/30 ring-2 ring-red-400 shadow-md" 
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{col.title}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${col.color}`}>
                      {items.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {items.length === 0 ? (
                      <div className="h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400">
                        No documents
                      </div>
                    ) : (
                      items.map((item: any) => {
                        const canApprove = canApproveItem(item);
                        return (
                          <div
                            key={item.id}
                            className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2 hover:border-blue-400 transition-colors"
                          >
                            <Link href="/" className="text-xs font-bold text-slate-900 dark:text-white hover:underline line-clamp-2">
                              {item.title}
                            </Link>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>{item.channel}</span>
                              <span className="font-bold text-red-600">{item.latest_score || 52}/100</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                              <Link href="/" className="text-[11px] font-semibold text-blue-600 hover:underline">
                                Inspect →
                              </Link>
                              {canApprove && (
                                <button
                                  onClick={() => onApprove(item.id, item.risk_tier)}
                                  className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded hover:bg-emerald-700"
                                >
                                  Sign-off
                                </button>
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
        )}
      </div>
    </div>
  );
}
