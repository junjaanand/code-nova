// Built-in Enterprise Mock Data Store for BrandShield AI
// Ensures 100% offline resilience and instant loading on Vercel deployments

export interface MockFinding {
  id: string;
  content_id: string;
  content_version: number;
  agent_name: string;
  category: "tone" | "terminology" | "messaging" | "claim" | "visual" | "accessibility" | "compliance";
  severity: "info" | "warning" | "critical";
  location: {
    type: string;
    start: number;
    end: number;
    matched_text: string;
  };
  detector: "deterministic" | "llm";
  evidence: Array<{
    type: string;
    source_id: string;
    source_version: number;
    page_or_clause: string;
    quote: string;
    citation_hash?: string;
  }>;
  explanation: string;
  suggestions: Array<{
    id: string;
    text: string;
    rationale: string;
    intent_check: string;
    diff_preview?: string;
    semantic_similarity?: number;
    negation_check?: string;
  }>;
  confidence: number;
  status: "open" | "accepted" | "rejected" | "overridden";
  decision?: any;
}

export const initialContentItems = [
  {
    id: "cnt_demo_fintech_launch",
    workspace_id: "ws_novapay_main",
    author_id: "usr_priya",
    author_name: "Priya Sharma",
    title: "Q3 Enterprise Launch Announcement — LinkedIn",
    content_type: "text",
    channel: "linkedin",
    audience: "B2B CFOs and FinOps Leaders",
    creator_purpose: "Announce enterprise tier availability and invite fintech businesses to demo.",
    status: "ai_reviewed",
    current_version: 1,
    latest_score: 52,
    risk_tier: "high",
    assigned_reviewer_id: "usr_legal",
    assigned_reviewer_name: "Kavita Iyer (Legal & Compliance)",
    current_text:
      "We are thrilled to announce that Novapay is officially the best payment platform in India! " +
      "Our users can now access enterprise billing starting at just ₹3,999/mo with guaranteed returns on all deposit balances. " +
      "Activate your NovaCard today and enjoy insane savings that will blow your mind!!"
  },
  {
    id: "cnt_demo_hiring_blog",
    workspace_id: "ws_novapay_main",
    author_id: "usr_priya",
    author_name: "Priya Sharma",
    title: "Engineering Culture Blog — Website",
    content_type: "text",
    channel: "blog",
    audience: "Prospective Software Engineers",
    creator_purpose: "Share engineering hiring standards and technology stack.",
    status: "approved",
    current_version: 2,
    latest_score: 96,
    risk_tier: "standard",
    assigned_reviewer_id: "usr_rahul",
    assigned_reviewer_name: "Rahul Mehta (Content Manager)",
    current_text:
      "At NovaPay, our engineering team processes over 45,000 real-time payment transactions per minute. " +
      "We build with high-concurrency microservices and maintain a 99.95% uptime SLA for all partner merchants across India."
  }
];

export const initialFindings: Record<string, MockFinding[]> = {
  cnt_demo_fintech_launch: [
    {
      id: "f_term_01",
      content_id: "cnt_demo_fintech_launch",
      content_version: 1,
      agent_name: "Terminology Agent",
      category: "terminology",
      severity: "critical",
      location: {
        type: "text_span",
        start: 31,
        end: 38,
        matched_text: "Novapay"
      },
      detector: "deterministic",
      evidence: [
        {
          type: "guideline",
          source_id: "r_term_001",
          source_version: 2,
          page_or_clause: "Brand Glossary §1.1",
          quote: "The brand name is camel-cased as 'NovaPay'. Never write 'Novapay', 'nova pay', or 'NOVAPAY'.",
          citation_hash: "a8f3b2c1"
        }
      ],
      explanation: "The brand name is improperly cased as 'Novapay'. Brand guidelines require strict camel-casing: 'NovaPay'.",
      suggestions: [
        {
          id: "sug_term_01",
          text: "NovaPay",
          rationale: "Complies with proper camel-case brand identity.",
          intent_check: "pass",
          diff_preview: "[-Novapay-]{+NovaPay+}",
          semantic_similarity: 1.0,
          negation_check: "pass"
        }
      ],
      confidence: 1.0,
      status: "open"
    },
    {
      id: "f_tone_01",
      content_id: "cnt_demo_fintech_launch",
      content_version: 1,
      agent_name: "Tone & Voice Agent",
      category: "tone",
      severity: "warning",
      location: {
        type: "text_span",
        start: 53,
        end: 88,
        matched_text: "the best payment platform in India"
      },
      detector: "llm",
      evidence: [
        {
          type: "guideline",
          source_id: "r_tone_001",
          source_version: 2,
          page_or_clause: "Brand Voice Guide p.8, §2.1",
          quote: "Do not use unbacked superlatives like 'the best', 'revolutionary', 'game-changing', or '#1' without accredited third-party validation.",
          citation_hash: "7f4c9a12"
        }
      ],
      explanation: "Unsubstantiated superlative claim ('the best payment platform in India') violates our objective, measured brand voice.",
      suggestions: [
        {
          id: "sug_tone_01",
          text: "an industry-leading payment platform trusted by over 45,000 merchants",
          rationale: "Replaces hyperbole with audited fact on merchant adoption.",
          intent_check: "pass",
          diff_preview: "[-the best payment platform in India-]{+an industry-leading payment platform trusted by over 45,000 merchants+}",
          semantic_similarity: 0.98,
          negation_check: "pass"
        },
        {
          id: "sug_tone_02",
          text: "a leading payment solution for Indian enterprises",
          rationale: "Professional, confident, and substantiable.",
          intent_check: "pass",
          diff_preview: "[-the best payment platform in India-]{+a leading payment solution for Indian enterprises+}",
          semantic_similarity: 0.96,
          negation_check: "pass"
        }
      ],
      confidence: 0.95,
      status: "open"
    },
    {
      id: "f_claim_01",
      content_id: "cnt_demo_fintech_launch",
      content_version: 1,
      agent_name: "Claims & Facts Agent",
      category: "claim",
      severity: "critical",
      location: {
        type: "text_span",
        start: 147,
        end: 156,
        matched_text: "₹3,999/mo"
      },
      detector: "llm",
      evidence: [
        {
          type: "fact",
          source_id: "fact_pricing_enterprise",
          source_version: 2,
          page_or_clause: "Official Pricing Sheet v2.4",
          quote: "Enterprise plan starts at ₹4,999/month (effective 1 July 2026)",
          citation_hash: "3b91fa88"
        }
      ],
      explanation: "Pricing claim of '₹3,999/mo' is outdated. The approved Enterprise rate was updated to ₹4,999/mo on 1 July 2026.",
      suggestions: [
        {
          id: "sug_claim_01",
          text: "₹4,999/mo",
          rationale: "Updates to approved Q3 2026 active enterprise pricing.",
          intent_check: "pass",
          diff_preview: "[-₹3,999/mo-]{+₹4,999/mo+}",
          semantic_similarity: 0.99,
          negation_check: "pass"
        }
      ],
      confidence: 0.98,
      status: "open"
    },
    {
      id: "f_comp_01",
      content_id: "cnt_demo_fintech_launch",
      content_version: 1,
      agent_name: "Compliance Agent",
      category: "compliance",
      severity: "critical",
      location: {
        type: "text_span",
        start: 162,
        end: 204,
        matched_text: "guaranteed returns on all deposit balances"
      },
      detector: "deterministic",
      evidence: [
        {
          type: "guideline",
          source_id: "r_term_003",
          source_version: 2,
          page_or_clause: "Regulatory Glossary §4.2",
          quote: "Under RBI guidelines, fintech payment services must NEVER use 'guaranteed returns', 'risk-free', or '100% safe money'.",
          citation_hash: "e4810c9d"
        }
      ],
      explanation: "Prohibited regulatory phrase under RBI guidelines. Payment aggregators cannot guarantee investment returns.",
      suggestions: [
        {
          id: "sug_comp_01",
          text: "competitive interest yields backed by RBI-authorized partner banks",
          rationale: "Removes illegal promise of guaranteed return and references authorized partner banks.",
          intent_check: "pass",
          diff_preview: "[-guaranteed returns on all deposit balances-]{+competitive interest yields backed by RBI-authorized partner banks+}",
          semantic_similarity: 0.94,
          negation_check: "pass"
        }
      ],
      confidence: 1.0,
      status: "open"
    },
    {
      id: "f_msg_01",
      content_id: "cnt_demo_fintech_launch",
      content_version: 1,
      agent_name: "Messaging Agent",
      category: "messaging",
      severity: "warning",
      location: {
        type: "text_span",
        start: 220,
        end: 228,
        matched_text: "NovaCard"
      },
      detector: "deterministic",
      evidence: [
        {
          type: "guideline",
          source_id: "r_msg_001",
          source_version: 2,
          page_or_clause: "Product Portfolio 2026 §3",
          quote: "The consumer card product 'NovaCard' was sunset in May 2026. All new enterprise credit lines must refer to 'Nova Corporate Credit'.",
          citation_hash: "91cc88b4"
        }
      ],
      explanation: "'NovaCard' was deprecated in May 2026. New marketing copy must refer to 'Nova Corporate Credit'.",
      suggestions: [
        {
          id: "sug_msg_01",
          text: "Nova Corporate Credit",
          rationale: "Replaces deprecated product brand with active enterprise offering.",
          intent_check: "pass",
          diff_preview: "[-NovaCard-]{+Nova Corporate Credit+}",
          semantic_similarity: 0.97,
          negation_check: "pass"
        }
      ],
      confidence: 1.0,
      status: "open"
    }
  ],
  cnt_demo_hiring_blog: []
};

export const initialBrandPack = {
  brand_pack: {
    id: "bp_novapay_v2",
    workspace_id: "ws_novapay_main",
    version: 2,
    name: "NovaPay Global Brand & Tone Guidelines 2026",
    status: "active",
    approved_by: "usr_ananya"
  },
  rules: [
    {
      id: "r_tone_001",
      brand_pack_id: "bp_novapay_v2",
      category: "tone",
      severity: "warning",
      title: "Avoid hyperbolic superlatives",
      description: "Do not use unbacked superlatives like 'the best', 'revolutionary', 'game-changing', or '#1' without accredited third-party validation.",
      good_examples: ["Industry-leading transaction speed verified by IDC", "Trusted by over 45,000 businesses"],
      bad_examples: ["The best payment platform in India", "Revolutionary financial revolution"],
      source_page: "Brand Voice Guide p.8, §2.1",
      ambiguity_score: 0.42,
      override_count: 5,
      total_eval_count: 24,
      approved: true
    },
    {
      id: "r_term_001",
      brand_pack_id: "bp_novapay_v2",
      category: "terminology",
      severity: "critical",
      title: "Always capitalize 'NovaPay' properly",
      description: "The brand name is camel-cased as 'NovaPay'. Never write 'Novapay', 'nova pay', or 'NOVAPAY'.",
      good_examples: ["NovaPay provides unified checkout", "Integrated with NovaPay APIs"],
      bad_examples: ["Novapay is easy", "Sign up with nova pay"],
      source_page: "Brand Glossary §1.1",
      ambiguity_score: 0.05,
      override_count: 0,
      total_eval_count: 50,
      approved: true
    },
    {
      id: "r_term_003",
      brand_pack_id: "bp_novapay_v2",
      category: "compliance",
      severity: "critical",
      title: "Banned phrase: 'Guaranteed Returns'",
      description: "Under RBI guidelines, fintech payment services must NEVER use 'guaranteed returns', 'risk-free', or '100% safe money'.",
      good_examples: ["Protected by multi-layer bank-grade encryption", "RBI-compliant escrow architecture"],
      bad_examples: ["Guaranteed returns on deposits", "100% risk-free investments"],
      source_page: "Regulatory Glossary §4.2",
      ambiguity_score: 0.02,
      override_count: 0,
      total_eval_count: 42,
      approved: true
    },
    {
      id: "r_access_001",
      brand_pack_id: "bp_novapay_v2",
      category: "accessibility",
      severity: "critical",
      title: "WCAG 2.2 AA Contrast Compliance",
      description: "Text on backgrounds must achieve at least 4.5:1 relative luminance contrast for normal body text and 3.0:1 for bold headings.",
      good_examples: ["#0052FF on #FFFFFF (7.2:1)", "#0A1128 on #FFFFFF (16.8:1)"],
      bad_examples: ["#94A3B8 on #FFFFFF (2.4:1)"],
      source_page: "Digital Design System p.4",
      ambiguity_score: 0.01,
      override_count: 0,
      total_eval_count: 88,
      approved: true
    }
  ],
  facts: [
    {
      id: "fact_pricing_enterprise",
      brand_pack_id: "bp_novapay_v2",
      claim_type: "pricing",
      value: "₹4,999/month",
      source: "Official Pricing Sheet v2.4 (effective July 2026)",
      owner: "Finance & Monetization Team",
      status: "active"
    },
    {
      id: "fact_uptime_sla",
      brand_pack_id: "bp_novapay_v2",
      claim_type: "metric",
      value: "99.95% uptime SLA",
      source: "Core Infrastructure Architecture Spec 2026",
      owner: "DevOps & Infrastructure",
      status: "active"
    },
    {
      id: "fact_merchant_count",
      brand_pack_id: "bp_novapay_v2",
      claim_type: "partnership",
      value: "45,000+ verified merchants",
      source: "Q3 2026 Audited Merchant Ledger",
      owner: "Merchant Operations",
      status: "active"
    }
  ],
  terms: [
    {
      id: "term_novapay",
      preferred_term: "NovaPay",
      banned_variants: ["Novapay", "nova pay", "NOVAPAY", "Nova pay"],
      context_note: "Brand name must always be camel-cased as NovaPay."
    },
    {
      id: "term_credit",
      preferred_term: "Nova Corporate Credit",
      banned_variants: ["NovaCard", "Nova Credit Card", "NovaPay Card"],
      context_note: "NovaCard was deprecated in May 2026; use Nova Corporate Credit."
    }
  ],
  assets: [
    {
      id: "ast_logo_primary",
      name: "NovaPay Primary Logo (Blue)",
      asset_type: "logo",
      file_url: "/assets/logo_blue.svg"
    },
    {
      id: "ast_palette",
      name: "NovaPay Core 2026 Palette",
      asset_type: "palette",
      file_url: "/assets/palette.json"
    }
  ]
};

export const initialQueueItems = [
  {
    id: "cnt_demo_fintech_launch",
    title: "Q3 Enterprise Launch Announcement — LinkedIn",
    channel: "linkedin",
    status: "in_review",
    risk_tier: "high",
    latest_score: 52,
    author_name: "Priya Sharma",
    assigned_reviewer_name: "Kavita Iyer (Legal & Compliance)",
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "cnt_demo_hiring_blog",
    title: "Engineering Culture Blog — Website",
    channel: "blog",
    status: "approved",
    risk_tier: "standard",
    latest_score: 96,
    author_name: "Priya Sharma",
    assigned_reviewer_name: "Rahul Mehta (Content Manager)",
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const initialAnalyticsOverview = {
  governance_score_avg: 88.4,
  total_content_reviewed: 342,
  violations_caught_breakdown: {
    terminology: 142,
    tone: 89,
    claims: 64,
    compliance: 32,
    accessibility: 15
  },
  guideline_health: [
    {
      rule_id: "r_tone_001",
      rule_title: "Avoid hyperbolic superlatives",
      category: "tone",
      override_count: 5,
      total_eval_count: 24,
      override_rate_pct: 20.8,
      ambiguity_score: 0.42,
      status: "needs_clarification"
    },
    {
      rule_id: "r_term_001",
      rule_title: "Always capitalize 'NovaPay' properly",
      category: "terminology",
      override_count: 0,
      total_eval_count: 50,
      override_rate_pct: 0.0,
      ambiguity_score: 0.05,
      status: "healthy"
    }
  ]
};
