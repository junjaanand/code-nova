"use client";

import React, { useEffect, useState } from "react";
import { 
  Bot, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Zap
} from "lucide-react";

interface StreamProps {
  contentId: string;
  onComplete: () => void;
}

export function LiveAgentStream({ contentId, onComplete }: StreamProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState("Initializing...");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:8000/api/v1/stream/review/${contentId}`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.step === "done") {
          setProgress(100);
          setIsDone(true);
          eventSource.close();
          setTimeout(() => {
            onComplete();
          }, 800);
        } else {
          setEvents((prev) => [...prev, data]);
          setProgress(data.progress_pct || 0);
          setCurrentAgent(data.agent || data.step);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = (e) => {
      console.warn("SSE error / closed", e);
      eventSource.close();
      onComplete();
    };

    return () => {
      eventSource.close();
    };
  }, [contentId, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Multi-Agent Governance Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                13 Agents running parallel fan-out & Verifier critic gate
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-blue-600 font-mono">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Live Active Agent Step */}
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bot className="w-4 h-4 text-blue-600 animate-bounce" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Active: {currentAgent}
            </span>
          </div>
          <span className="text-[10px] text-blue-600 uppercase font-mono font-bold tracking-wider">
            Parallel Fan-Out
          </span>
        </div>

        {/* Streaming Event Feed */}
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
          {events.map((ev, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400 animate-in fade-in"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {ev.agent}:
                </span>{" "}
                {ev.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
