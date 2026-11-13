"use client";

import React, { useState } from "react";
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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Brand Guard MCP Server Playground
          </h2>
        </div>
        <p className="text-sm text-slate-500 mt-1">
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
              className="text-xs bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 font-medium"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="email">Email</option>
              <option value="blog">Blog</option>
              <option value="ad">Ad Creative</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              External Draft Payload (e.g. from ChatGPT / Claude):
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="w-full text-xs p-3 font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleRunCheck}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" />
            {loading ? "Calling Brand Guard MCP..." : "Simulate External AI MCP Call"}
          </button>
        </div>

        {/* MCP Response Panel */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              MCP Protocol JSON-RPC Response
            </span>
            {mcpResponse && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                Status: 200 OK
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-emerald-400">
            {mcpResponse ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(mcpResponse, null, 2)}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Click "Simulate External AI MCP Call" to see structured JSON-RPC output.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
