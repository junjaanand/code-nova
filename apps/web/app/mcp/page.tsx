"use client";

import React, { useState } from "react";
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { Bot, Terminal, Send, CheckCircle2, Copy } from "lucide-react";
import { api } from "@/lib/api";

export default function MCPPlaygroundPage() {
  const [inputText, setInputText] = useState(
    "Novapay is the best payment platform in India! Starting at ₹3,999/mo with guaranteed returns."
  );
  const [selectedChannel, setSelectedChannel] = useState("linkedin");
  const [mcpResponse, setMcpResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunCheck = async () => {
    setLoading(true);
    try {
      const res = await api.guardCheck(inputText, selectedChannel);
      setMcpResponse(res);
    } catch (e) {
      console.error("MCP check error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <UnifiedHeader />
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto space-y-8 w-full">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Brand Guard MCP Server Playground
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Signature Differentiator: External AI writing agents (Claude, ChatGPT, Cursor) call Brand Guard to pre-screen drafts before publishing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Request Input Panel */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600" /> MCP Tool: check_content
              </span>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300"
              >
                <option value="linkedin">Channel: LinkedIn</option>
                <option value="twitter">Channel: Twitter / X</option>
                <option value="blog">Channel: Blog</option>
                <option value="email">Channel: Sales Email</option>
              </select>
            </div>

            {/* Quick-Test Scenarios for Evaluators */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick Test Scenarios (1-Click Evaluator Presets):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setInputText("Novapay is the best payment platform in India! Starting at ₹3,999/mo with 100% guaranteed returns.");
                    setSelectedChannel("linkedin");
                  }}
                  className="px-2.5 py-1 text-[11px] bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 font-medium cursor-pointer"
                >
                  ⚠️ Critical Guarantee & Casing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputText("Get NovaPay Enterprise now at ₹3,999/month with 24/7 support.");
                    setSelectedChannel("twitter");
                  }}
                  className="px-2.5 py-1 text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 font-medium cursor-pointer"
                >
                  ⚡ Pricing Discrepancy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputText("NovaPay powers enterprise payment infrastructure for 45,000+ businesses across India with a 99.95% uptime SLA.");
                    setSelectedChannel("linkedin");
                  }}
                  className="px-2.5 py-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-medium cursor-pointer"
                >
                  ✅ Clean Compliant Copy (Pass)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Candidate Content (Drafted by external AI agent):
              </label>
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleRunCheck}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Calling MCP Protocol..." : "Execute MCP check_content Tool"}</span>
            </button>
          </div>

          {/* Response Output Panel */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                JSON-RPC 2.0 Response Payload
              </span>
              {mcpResponse && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Validated
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[380px] border border-slate-800">
              {mcpResponse ? (
                <pre>{JSON.stringify(mcpResponse, null, 2)}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  Press "Execute MCP check_content Tool" to inspect live tool response payload.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
