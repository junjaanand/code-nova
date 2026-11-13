"use client";

import React from "react";
import { Sparkles, Shield, User, Lock } from "lucide-react";
import { usePersona } from "@/lib/personaContext";

export function Navbar({ score = 100, riskTier = "standard" }: { score?: number; riskTier?: string }) {
  const { currentPersona } = usePersona();

  const getRiskBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "high":
        return { label: "High Risk (Legal Review Req)", bg: "bg-red-100 text-red-800 border-red-300" };
      case "elevated":
        return { label: "Elevated Risk (Manager Sign-off)", bg: "bg-amber-100 text-amber-800 border-amber-300" };
      default:
        return { label: "Standard Risk (Fast-track)", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    }
  };

  const badge = getRiskBadge(riskTier);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Governance Score:
        </span>
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${score >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : score >= 65 ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-red-50 text-red-700 border-red-300'}`}>
            {score}/100
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 py-1.5 px-3 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Pack: <strong>NovaPay Guidelines 2026 v2</strong></span>
        </div>

        {/* ACTIVE USER PERSONA BADGE */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {currentPersona.avatar}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {currentPersona.name}
            </p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium capitalize">
              {currentPersona.title}
            </p>
          </div>
          {currentPersona.permissions.isReadOnly && (
            <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
