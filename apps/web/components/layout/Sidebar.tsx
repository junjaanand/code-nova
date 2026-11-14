"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  FileEdit, 
  Kanban, 
  BookOpen, 
  BarChart3, 
  Bot, 
  Users,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Sparkles,
  Eye,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  Layers
} from "lucide-react";
import { usePersona, PersonaRole } from "@/lib/personaContext";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentPersona, setPersona } = usePersona();
  const [showAllTabs, setShowAllTabs] = useState(false);

  const handleSelectRole = (pRole: PersonaRole) => {
    setPersona(pRole);
    const targetRoutes: Record<PersonaRole, string> = {
      creator: "/",
      manager: "/queue",
      reviewer: "/queue",
      admin: "/brand-pack",
      auditor: "/analytics",
    };
    const target = targetRoutes[pRole];
    if (target && pathname !== target) {
      router.push(target);
    }
  };

  const getWorkspaceTitle = (role: PersonaRole) => {
    switch (role) {
      case "creator": return { desk: "Marketing Studio", badge: "Creator Desk", bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" };
      case "manager": return { desk: "Content Operations", badge: "Approval Desk", bg: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" };
      case "reviewer": return { desk: "Legal & Compliance", badge: "Risk Sign-off", bg: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" };
      case "admin": return { desk: "Brand Admin Suite", badge: "Master Governance", bg: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800" };
      case "auditor": return { desk: "Compliance Audit", badge: "Read-Only Session", bg: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" };
    }
  };

  // ALL TABS CATALOG (Full System)
  const allMasterTabs = [
    { name: "Content Studio", href: "/", icon: FileEdit, pill: "Editor", pillClass: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
    { name: "Approval Queue", href: "/queue", icon: Kanban, pill: "Queue", pillClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
    { name: "Brand Pack & Rules", href: "/brand-pack", icon: BookOpen, pill: "Truth Base", pillClass: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" },
    { name: "Governance Analytics", href: "/analytics", icon: BarChart3, pill: "Metrics", pillClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
    { name: "Brand Guard MCP", href: "/mcp", icon: Bot, pill: "MCP Server", pillClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  ];

  // PERSONA-SPECIFIC SCOPED TABS (Only required for their exact role)
  const getNavItemsForRole = (role: PersonaRole) => {
    switch (role) {
      case "creator":
        // Priya: Only Drafting Studio & Brand Guidelines Reference
        return [
          { name: "Content Studio", href: "/", icon: FileEdit, pill: "Drafting", pillClass: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold" },
          { name: "Brand Guidelines", href: "/brand-pack", icon: BookOpen, pill: "Reference", pillClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
        ];

      case "manager":
        // Rahul: Review Queue, Content Inspection, Team Analytics
        return [
          { name: "Approval Queue", href: "/queue", icon: Kanban, pill: "2 Pending", pillClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border border-amber-300 animate-pulse" },
          { name: "Content Inspection", href: "/", icon: FileEdit, pill: "Review", pillClass: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
          { name: "Team Analytics", href: "/analytics", icon: BarChart3, pill: "KPIs", pillClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-medium" },
        ];

      case "reviewer":
        // Kavita: Legal Review Queue, High-Risk Inspection, Regulatory Truth Base
        return [
          { name: "Legal Approval Desk", href: "/queue", icon: Kanban, pill: "1 High-Risk", pillClass: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold border border-red-300 animate-pulse" },
          { name: "Risk Sign-off Canvas", href: "/", icon: FileEdit, pill: "Sign-off", pillClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold" },
          { name: "Regulatory Truth Base", href: "/brand-pack", icon: BookOpen, pill: "RBI Policy", pillClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
        ];

      case "admin":
        // Ananya: Brand Pack Studio, Rule Health, MCP Playground, Master Content Canvas
        return [
          { name: "Brand Pack & Rules", href: "/brand-pack", icon: BookOpen, pill: "Compiler v2", pillClass: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold border border-purple-300" },
          { name: "Guideline Health", href: "/analytics", icon: BarChart3, pill: "Rule Health", pillClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium" },
          { name: "Brand Guard MCP", href: "/mcp", icon: Bot, pill: "Dev Hub", pillClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
          { name: "Master Content Canvas", href: "/", icon: FileEdit, pill: "Oversight", pillClass: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
        ];

      case "auditor":
        // Vikram: Compliance Audit Trail, Tamper-Proof Canvas, Audited Rules
        return [
          { name: "Compliance Audit Trail", href: "/analytics", icon: BarChart3, pill: "ISO 42001", pillClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border border-amber-300" },
          { name: "Tamper-Proof Canvas", href: "/", icon: FileEdit, pill: "Read-Only", pillClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono", isReadOnly: true },
          { name: "Audited Rules & Facts", href: "/brand-pack", icon: BookOpen, pill: "Inspected", pillClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
        ];
    }
  };

  const navItems = showAllTabs ? allMasterTabs : getNavItemsForRole(currentPersona.role);
  const workspace = getWorkspaceTitle(currentPersona.role);

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-screen fixed left-0 top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white tracking-tight text-sm leading-tight">
              BrandShield <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Pre-Publication Governance</p>
          </div>
        </div>

        {/* Dynamic Workspace Indicator */}
        <div className="px-4 pt-3.5 pb-2">
          <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${workspace.bg}`}>
            <span className="font-bold text-[11px]">{workspace.desk}</span>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-90">
              {workspace.badge}
            </span>
          </div>
        </div>

        {/* Persona Scope Status Bar */}
        <div className="px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800/80">
          <span>{showAllTabs ? "All System Tabs (5)" : `${currentPersona.title} Desk (${navItems.length} Tabs)`}</span>
          <button
            onClick={() => setShowAllTabs(!showAllTabs)}
            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            title="Toggle between role-scoped tabs and full system view"
          >
            {showAllTabs ? "Role Scope" : "Show All"}
          </button>
        </div>

        {/* Dynamic Role-Scoped Navigation */}
        <nav className="p-4 pt-2 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.pill && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1 shrink-0 ${item.pillClass}`}>
                    {item.isReadOnly && <Lock className="w-2.5 h-2.5" />}
                    {item.pill}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role / Persona Switcher */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-blue-600" /> Active Persona
          </span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
            {currentPersona.role}
          </span>
        </div>

        <select 
          value={currentPersona.role} 
          onChange={(e) => handleSelectRole(e.target.value as PersonaRole)}
          className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 px-2.5 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
        >
          <option value="creator">✍️ Priya Sharma (Creator)</option>
          <option value="manager">📋 Rahul Mehta (Content Manager)</option>
          <option value="reviewer">⚖️ Kavita Iyer (Legal Reviewer)</option>
          <option value="admin">🛡️ Ananya Deshmukh (Brand Admin)</option>
          <option value="auditor">👁️ Vikram Singh (Auditor)</option>
        </select>

        {/* Dynamic Persona Capability Card */}
        <div className="mt-2.5 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {currentPersona.name}
          </p>
          <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">
            {currentPersona.description}
          </p>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700 text-[10px] space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Override:</span>
              <span className={`font-bold ${currentPersona.permissions.canOverrideFinding ? 'text-emerald-600' : 'text-slate-400'}`}>
                {currentPersona.permissions.canOverrideFinding ? 'Granted' : 'Locked'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">High-Risk Sign-off:</span>
              <span className={`font-bold ${currentPersona.permissions.canApproveHighRisk ? 'text-emerald-600' : 'text-slate-400'}`}>
                {currentPersona.permissions.canApproveHighRisk ? 'Authorized' : 'Restricted'}
              </span>
            </div>
            {currentPersona.permissions.isReadOnly && (
              <div className="flex items-center gap-1 text-amber-600 font-bold pt-0.5">
                <Lock className="w-3 h-3" /> Read-Only Mode
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
