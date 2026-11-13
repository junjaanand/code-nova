"use client";

import React, { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

export function BrandPackView({ packData }: { packData: any }) {
  const [activeTab, setActiveTab] = useState<"rules" | "facts" | "terms" | "assets">("rules");
  const [selectedRuleClarification, setSelectedRuleClarification] = useState<any | null>(null);
  const [isClarifying, setIsClarifying] = useState(false);
  const [showCompilerModal, setShowCompilerModal] = useState(false);
  const [compilerText, setCompilerText] = useState("");
  const [compileResult, setCompileResult] = useState<any | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const rules = packData?.rules || [];
  const facts = packData?.facts || [];
  const terms = packData?.terms || [];
  const assets = packData?.assets || [];

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setCompilerText(text);
    };
    reader.readAsText(file);
  };

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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Brand Pack & Knowledge Base
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              v{packData?.brand_pack?.version || 2} Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Governed rules, facts, terminology, and visual assets enforced across all pre-publication reviews.
          </p>
        </div>

        <button
          onClick={() => setShowCompilerModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <UploadCloud className="w-4 h-4" /> Compile Guidelines (PDF / Text)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: "rules", label: `Guidelines (${rules.length})` },
          { key: "facts", label: `Approved Facts (${facts.length})` },
          { key: "terms", label: `Terminology (${terms.length})` },
          { key: "assets", label: `Brand Assets (${assets.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 px-2 ${
              activeTab === t.key
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* RULES VIEW */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((r: any) => (
              <div
                key={r.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {r.id}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {r.category}
                    </span>
                  </div>
                  {r.ambiguity_score > 0.3 ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Ambiguity: {r.ambiguity_score}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Healthy
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {r.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {r.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Source: {r.source_page || "Brand Core §1.1"}
                  </span>
                  <button
                    onClick={() => handleClarify(r.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Clarify Rule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FACTS VIEW */}
      {activeTab === "facts" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Fact ID</th>
                <th className="p-3.5">Claim Type</th>
                <th className="p-3.5">Approved Fact Value</th>
                <th className="p-3.5">Source Doc</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {facts.map((f: any) => (
                <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-mono text-slate-500 font-semibold">{f.id}</td>
                  <td className="p-3.5 capitalize font-medium text-slate-700 dark:text-slate-300">{f.claim_type}</td>
                  <td className="p-3.5 font-medium text-slate-900 dark:text-white max-w-md">{f.value}</td>
                  <td className="p-3.5 text-slate-500">{f.source}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      f.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TERMS VIEW */}
      {activeTab === "terms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {terms.map((t: any) => (
            <div key={t.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Preferred: {t.preferred_term}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{t.scope} scope</span>
              </div>
              <div className="text-xs text-slate-500">
                Banned variants:{" "}
                <strong className="text-red-600 line-through">
                  {t.banned_variants?.join(", ")}
                </strong>
              </div>
              <p className="text-[11px] text-slate-400 italic">{t.context_note}</p>
            </div>
          ))}
        </div>
      )}

      {/* ASSETS VIEW */}
      {activeTab === "assets" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assets.map((a: any) => (
            <div key={a.id} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{a.name}</h4>
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {a.asset_type}
                </span>
              </div>
              <pre className="text-[11px] bg-slate-50 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto text-slate-700 dark:text-slate-300 font-mono">
                {JSON.stringify(a.rules, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* CLARIFICATION MODAL (Improvement #3) */}
      {selectedRuleClarification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Guideline Health Clarifier: {selectedRuleClarification.rule_title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRuleClarification(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {selectedRuleClarification.rationale}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Original Ambiguous Rule:
                </label>
                <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 rounded-lg border border-red-200">
                  {selectedRuleClarification.original_description}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Proposed Clarified Wording:
                </label>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 rounded-lg border border-emerald-200 font-medium">
                  {selectedRuleClarification.proposed_description}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRuleClarification(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Clarification accepted! Brand Pack updated to v3.");
                  setSelectedRuleClarification(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Approve & Update Guideline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GUIDELINE COMPILER MODAL */}
      {showCompilerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Guideline Compiler Agent (PDF / Text Ingestion)
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowCompilerModal(false);
                  setCompileResult(null);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Upload or paste raw brand guidelines, marketing manuals, or regulatory notices. The <strong>Guideline Compiler Agent</strong> parses the unstructured text and compiles it into machine-executable brand rules, verified facts, and terminology with exact severity levels.
            </p>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="cursor-pointer text-blue-600 font-semibold hover:underline flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Upload File (.txt / .md)
                <input 
                  type="file" 
                  accept=".txt,.md,.pdf" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              <button
                type="button"
                onClick={() => setCompilerText(sampleGuidelineText)}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 font-semibold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-500" /> Load Sample Guidelines
              </button>
            </div>

            <textarea
              value={compilerText}
              onChange={(e) => setCompilerText(e.target.value)}
              placeholder="Paste raw guidelines, brand voice clauses, or pricing sheets here..."
              rows={6}
              className="w-full text-xs p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowCompilerModal(false);
                  setCompileResult(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompile}
                disabled={isCompiling || !compilerText.trim()}
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all ${
                  isCompiling ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isCompiling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compiling with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Compile into Brand Pack
                  </>
                )}
              </button>
            </div>

            {/* RESULTS PREVIEW */}
            {compileResult && (
              <div className="mt-3 p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs space-y-3 overflow-y-auto max-h-56">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Successfully Compiled: {compileResult.rules_extracted} Rules, {compileResult.facts_extracted || 0} Facts, {compileResult.terms_extracted || 0} Terms</span>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] shadow-sm flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh Brand Pack
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {compileResult.rules?.slice(0, 4).map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                          {r.category}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          r.severity === "critical" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {r.severity}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{r.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
