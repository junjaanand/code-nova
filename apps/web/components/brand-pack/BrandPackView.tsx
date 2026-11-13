"use client";

import React, { useState, useMemo } from "react";
import { 
  BookOpen, 
  Sparkles, 
  UploadCloud, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Plus,
  RefreshCw,
  ArrowRight,
  Search,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Copy,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";

interface BrandPackProps {
  packData: any;
}

export function BrandPackView({ packData }: BrandPackProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "facts" | "terms" | "assets">("rules");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Selected items for Master-Detail inspection
  const [selectedRuleId, setSelectedRuleId] = useState<string>("r_tone_001");
  const [selectedFactId, setSelectedFactId] = useState<string>("fact_pricing_enterprise");
  const [selectedTermId, setSelectedTermId] = useState<string>("term_brand_name");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("asset_logo_primary");

  // Clarifier & Compiler states
  const [selectedRuleClarification, setSelectedRuleClarification] = useState<any | null>(null);
  const [isClarifying, setIsClarifying] = useState(false);
  const [showCompilerModal, setShowCompilerModal] = useState(false);
  const [compilerText, setCompilerText] = useState("");
  const [compileResult, setCompileResult] = useState<any | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const rules: any[] = packData?.rules || [];
  const facts: any[] = packData?.facts || [];
  const terms: any[] = packData?.terms || [];
  const assets: any[] = packData?.assets || [];

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const matchSearch = 
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === "all" || r.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [rules, searchQuery, categoryFilter]);

  // Filtered Facts
  const filteredFacts = useMemo(() => {
    return facts.filter((f) => 
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.claim_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [facts, searchQuery]);

  // Filtered Terms
  const filteredTerms = useMemo(() => {
    return terms.filter((t) => 
      t.preferred_term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.banned_variants?.some((v: string) => v.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [terms, searchQuery]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.asset_type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assets, searchQuery]);

  const activeRule = rules.find((r) => r.id === selectedRuleId) || rules[0];
  const activeFact = facts.find((f) => f.id === selectedFactId) || facts[0];
  const activeTerm = terms.find((t) => t.id === selectedTermId) || terms[0];
  const activeAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  const handleClarify = async (ruleId: string) => {
    setIsClarifying(true);
    try {
      const res = await api.draftClarification(ruleId);
      setSelectedRuleClarification(res);
    } catch (e) {
      console.error("Clarification error:", e);
    } finally {
      setIsClarifying(false);
    }
  };

  const sampleGuidelineText = `Brand Voice & Tone:
We communicate in a confident, measured, and transparent voice. Never use hyperbolic or unsubstantiated superlatives such as 'the #1 platform', 'unbeatable', or 'revolutionary' without accredited third-party validation. Avoid sensational clickbait or slang like 'blow your mind' and 'insane savings'.

Pricing & Product Facts:
The Enterprise plan officially starts at ₹4,999/month with a 99.95% uptime SLA and 24/7 dedicated support. We currently serve over 45,000 verified merchant partners across India.

Terminology & Casing:
The company name must strictly be formatted as 'NovaPay' in camel-case. Never write 'Novapay', 'nova pay', or 'NOVAPAY'.
The consumer offering 'NovaCard' was officially retired in May 2026. All new enterprise collateral must refer to 'Nova Corporate Credit'.

Regulatory Compliance:
Under RBI fintech regulations, never guarantee financial returns or declare deposit yields as '100% risk-free'.`;

  const handleCompile = async () => {
    if (!compilerText.trim()) return;
    setIsCompiling(true);
    try {
      const res = await api.compileGuidelines(compilerText);
      setCompileResult(res);
    } catch (e: any) {
      console.error("Compile error:", e);
      alert(e.message || "Failed to compile guidelines. Make sure your active persona is Admin or Manager.");
    } finally {
      setIsCompiling(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "tone":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "claim":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "terminology":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "compliance":
        return "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Brand Pack Top Sub-bar */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Brand Pack Knowledge Base
            </h2>
            <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              v{packData?.brand_pack?.version || 2} Active
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Section Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "rules"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Rules ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab("facts")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "facts"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Verified Facts ({facts.length})
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "terms"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Terminology ({terms.length})
            </button>
            <button
              onClick={() => setActiveTab("assets")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "assets"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Assets ({assets.length})
            </button>
          </div>
        </div>

        {/* Action: Compile Guidelines with AI */}
        <button
          onClick={() => setShowCompilerModal(true)}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Compile Guidelines (AI)</span>
        </button>
      </div>

      {/* Main Master-Detail Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT PANE: Compact Scannable List ================= */}
        <div className="w-[380px] lg:w-[420px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
          {/* Search & Category Filter */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            {activeTab === "rules" && (
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold text-slate-500 pb-0.5">
                {["all", "tone", "claim", "terminology", "compliance"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded capitalize whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {activeTab === "rules" && (
              <>
                {filteredRules.map((r) => {
                  const isSelected = r.id === selectedRuleId;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRuleId(r.id);
                        setSelectedRuleClarification(null);
                      }}
                      className={`p-3.5 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-500">
                            {r.id}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${getCategoryBadge(r.category)}`}>
                            {r.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {r.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {r.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
                        {r.ambiguity_score > 0.3 ? (
                          <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200" title={`Ambiguity Score: ${r.ambiguity_score}`}></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Healthy Guideline"></span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-blue-600 translate-x-0.5" : "text-slate-300 dark:text-slate-600"}`} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {activeTab === "facts" && (
              <>
                {filteredFacts.map((f) => {
                  const isSelected = f.id === selectedFactId;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFactId(f.id)}
                      className={`p-3.5 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-purple-50/70 dark:bg-purple-950/40 border-l-4 border-purple-600"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-500">{f.id}</span>
                          <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                            {f.claim_type}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {f.value}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          Source: {f.source}
                        </p>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-purple-600" : "text-slate-300"}`} />
                    </div>
                  );
                })}
              </>
            )}

            {activeTab === "terms" && (
              <>
                {filteredTerms.map((t) => {
                  const isSelected = t.id === selectedTermId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTermId(t.id)}
                      className={`p-3.5 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-emerald-600"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            {t.preferred_term}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({t.scope})</span>
                        </div>
                        <p className="text-[11px] text-red-600 line-through truncate">
                          {t.banned_variants?.join(", ")}
                        </p>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-600" : "text-slate-300"}`} />
                    </div>
                  );
                })}
              </>
            )}

            {activeTab === "assets" && (
              <>
                {filteredAssets.map((a) => {
                  const isSelected = a.id === selectedAssetId;
                  return (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAssetId(a.id)}
                      className={`p-3.5 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                          {a.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {a.asset_type}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-blue-600" : "text-slate-300"}`} />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANE: Live Detail Inspector ================= */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
          {activeTab === "rules" && activeRule && (
            <div className="max-w-3xl space-y-6">
              {/* Rule Header */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                      {activeRule.id}
                    </span>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${getCategoryBadge(activeRule.category)}`}>
                      {activeRule.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Severity: <strong>{activeRule.severity}</strong>
                    </span>
                  </div>

                  {activeRule.ambiguity_score > 0.3 ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Ambiguity Index: {activeRule.ambiguity_score}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Healthy Guideline
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeRule.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {activeRule.description}
                  </p>
                </div>

                {/* Ground Truth Citation */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Source Citation: <strong className="text-slate-800 dark:text-slate-200">{activeRule.source_page || "Brand Voice Core §1.1"}</strong>
                  </span>
                  <button
                    onClick={() => handleClarify(activeRule.id)}
                    disabled={isClarifying}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isClarifying ? "Clarifying..." : "Clarify Rule with AI"}</span>
                  </button>
                </div>
              </div>

              {/* AI Clarifier Proposal Box (if active) */}
              {selectedRuleClarification && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-md space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                        Proposed Clarification (Clarifier Agent)
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Resolves {selectedRuleClarification.override_count || 3} Reviewer Overrides
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Proposed Clearer Rule Description:
                    </p>
                    <p className="p-3 bg-white dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-blue-200">
                      {selectedRuleClarification.proposed_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-lg">
                      <span className="font-bold text-red-700 block mb-1">❌ Prohibited Example:</span>
                      <span className="text-red-900 dark:text-red-200 italic">
                        "{selectedRuleClarification.negative_example || "the best payment platform in India"}"
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-lg">
                      <span className="font-bold text-emerald-700 block mb-1">✅ Approved Example:</span>
                      <span className="text-emerald-900 dark:text-emerald-200 italic">
                        "{selectedRuleClarification.positive_example || "an industry-leading payment platform trusted by 45,000+ merchants"}"
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Contrast / Guidelines Examples */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Enforcement Criteria & Benchmark Controls
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60">
                    <span className="font-bold text-red-700 dark:text-red-400 block mb-1">
                      Violations Caught:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Any unbacked claims, hyperbolic adjectives, or non-compliant terminology violating clause <strong>{activeRule.source_page || "§2.1"}</strong>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Intent-Safe Replacement:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Intent Guard synthesizes 2-3 objective, substantiable alternatives without altering the creator's commercial message.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "facts" && activeFact && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                    {activeFact.id}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Verified Truth
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Approved Fact Value
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {activeFact.value}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Claim Category:</span>
                    <strong className="text-slate-800 dark:text-slate-200 capitalize">{activeFact.claim_type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Source Document:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{activeFact.source}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "terms" && activeTerm && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Preferred: {activeTerm.preferred_term}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{activeTerm.scope} scope</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Banned Variants (Instant Flag):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeTerm.banned_variants?.map((v: string) => (
                      <span key={v} className="line-through text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded border border-red-200">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 italic pt-2 border-t border-slate-100 dark:border-slate-800">
                  Usage context: {activeTerm.context_note || "Strictly required across all corporate, technical, and marketing collateral."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "assets" && activeAsset && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeAsset.name}</h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                    {activeAsset.asset_type}
                  </span>
                </div>
                <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <div className="text-2xl font-black tracking-tight text-blue-600">
                    Nova<span className="text-slate-900 dark:text-white">Pay</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Clear-space requirement: <strong>1.5x logo height</strong></p>
                  <p>Minimum digital resolution: <strong>120px width</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compiler Modal */}
      {showCompilerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Guideline Compiler Agent (Text to Structured Rules)
                </h3>
              </div>
              <button onClick={() => setShowCompilerModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Paste raw guideline text, brand voice manuals, or paste corporate memos. The Guideline Compiler extracts structured rules and facts.
            </p>

            <textarea
              rows={8}
              value={compilerText || sampleGuidelineText}
              onChange={(e) => setCompilerText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
            />

            {compileResult && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                ✅ Successfully compiled: {compileResult.rules_extracted} rules and {compileResult.facts_extracted} facts added to Brand Pack!
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCompilerModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handleCompile}
                disabled={isCompiling}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isCompiling ? "Compiling with Gemini..." : "Compile & Ingest Rules"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
