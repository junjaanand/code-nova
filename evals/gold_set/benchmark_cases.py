"""
Gold Set Benchmark for BrandShield AI (CodeNova India 2026).
Contains 80 test items:
- 50 violation cases covering Tone, Terminology, Messaging, Claims, Visual, Accessibility, Compliance
- 30 clean controls that should pass without false positive flags.
"""

GOLD_SET_CASES = [
    # --- TERMINOLOGY VIOLATIONS (10) ---
    {"id": "tc_01", "text": "Novapay is changing how Indian businesses handle settlements.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_001"},
    {"id": "tc_02", "text": "Sign up with nova pay today for instant payouts.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_001"},
    {"id": "tc_03", "text": "Our users love the new dashboard and reporting features.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_002"},
    {"id": "tc_04", "text": "Attracting more end-users across tier-2 cities.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_002"},
    {"id": "tc_05", "text": "Apply for your corporate NovaCard with custom expense limits.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_004"},
    {"id": "tc_06", "text": "The NovaCard physical metal card has been dispatched.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_004"},
    {"id": "tc_07", "text": "NOVAPAY offers zero hidden fees.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_001"},
    {"id": "tc_08", "text": "Consumer users can also track invoice payments.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_002"},
    {"id": "tc_09", "text": "Use the Nova pay mobile console for quick audits.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_001"},
    {"id": "tc_10", "text": "Cardholders can swipe their NovaCard at all domestic POS.", "has_violation": True, "category": "terminology", "expected_rule": "r_term_004"},

    # --- TONE VIOLATIONS (10) ---
    {"id": "tc_11", "text": "We are proud to be the best payment platform in India.", "has_violation": True, "category": "tone", "expected_rule": "r_tone_001"},
    {"id": "tc_12", "text": "Experience revolutionary financial revolution with our tools.", "has_violation": True, "category": "tone", "expected_rule": "r_tone_001"},
    {"id": "tc_13", "text": "Enjoy insane savings that will blow your mind!!", "has_violation": True, "category": "tone", "expected_rule": "r_tone_002"},
    {"id": "tc_14", "text": "Our crazy fast checkout speeds will shock your customers!!!", "has_violation": True, "category": "tone", "expected_rule": "r_tone_002"},
    {"id": "tc_15", "text": "The #1 payment platform with unbeatable features.", "has_violation": True, "category": "tone", "expected_rule": "r_tone_001"},
    {"id": "tc_16", "text": "Unbelievable savings that destroy all banking alternatives.", "has_violation": True, "category": "tone", "expected_rule": "r_tone_001"},
    {"id": "tc_17", "text": "Don't fall for stupid legacy bank fees.", "has_violation": True, "category": "tone", "expected_rule": "r_tone_003"},
    {"id": "tc_18", "text": "Competitor legacy systems are terrible and broken.", "has_violation": True, "category": "tone", "expected_rule": "r_tone_003"},
    {"id": "tc_19", "text": "Get insane discounts on corporate transactions this week!!", "has_violation": True, "category": "tone", "expected_rule": "r_tone_002"},
    {"id": "tc_20", "text": "The absolute best payment solution ever created.", "has_violation": True, "category": "tone", "expected_rule": "r_tone_001"},

    # --- CLAIMS & PRICING VIOLATIONS (10) ---
    {"id": "tc_21", "text": "Get started with Enterprise tier for only ₹3,999/mo.", "has_violation": True, "category": "claim", "expected_fact": "fact_pricing_enterprise"},
    {"id": "tc_22", "text": "Upgrade to Enterprise at ₹3,999/month today.", "has_violation": True, "category": "claim", "expected_fact": "fact_pricing_enterprise"},
    {"id": "tc_23", "text": "Guaranteeing 100% uptime with zero downtime ever.", "has_violation": True, "category": "claim", "expected_fact": "fact_uptime_sla"},
    {"id": "tc_24", "text": "Our platform offers ₹3,999 pricing for unlimited transactions.", "has_violation": True, "category": "claim", "expected_fact": "fact_pricing_enterprise"},
    {"id": "tc_25", "text": "We promise 100% flawless transaction delivery without exception.", "has_violation": True, "category": "claim", "expected_fact": "fact_uptime_sla"},
    {"id": "tc_26", "text": "Enjoy our legacy rate of ₹3,999 per month for annual plans.", "has_violation": True, "category": "claim", "expected_fact": "fact_pricing_enterprise"},
    {"id": "tc_27", "text": "Unlimited API access for just ₹3,999/mo.", "has_violation": True, "category": "claim", "expected_fact": "fact_pricing_enterprise"},
    {"id": "tc_28", "text": "Providing 100% network availability across all zones.", "has_violation": True, "category": "claim", "expected_fact": "fact_uptime_sla"},
    {"id": "tc_29", "text": "Lock in ₹3,999 before next quarter.", "has_violation": True, "category": "claim", "expected_fact": "fact_pricing_enterprise"},
    {"id": "tc_30", "text": "Zero dropped requests with guaranteed 100% gateway uptime.", "has_violation": True, "category": "claim", "expected_fact": "fact_uptime_sla"},

    # --- REGULATORY & COMPLIANCE VIOLATIONS (10) ---
    {"id": "tc_31", "text": "Earn guaranteed returns on all idle treasury balances.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},
    {"id": "tc_32", "text": "Our corporate deposits are 100% risk-free investments.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},
    {"id": "tc_33", "text": "Park funds with 100% safe money assurance.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},
    {"id": "tc_34", "text": "Guaranteed returns of 8% annualized for enterprise merchants.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},
    {"id": "tc_35", "text": "Deposit accounts backed by guaranteed returns.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},
    {"id": "tc_36", "text": "Get risk-free working capital solutions today.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},
    {"id": "tc_37", "text": "Safe money guarantees on every domestic transaction.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},
    {"id": "tc_38", "text": "Earn guaranteed returns on your overnight treasury float.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},
    {"id": "tc_39", "text": "A risk-free escrow infrastructure with fixed interest.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},
    {"id": "tc_40", "text": "Guaranteed returns for startups parking seed funding.", "has_violation": True, "category": "compliance", "expected_rule": "r_term_003"},

    # --- VISUAL & ACCESSIBILITY VIOLATIONS (10) ---
    {"id": "tc_41", "text": "Header theme background set to #39FF14 for energetic launch.", "has_violation": True, "category": "visual", "expected_rule": "r_vis_001"},
    {"id": "tc_42", "text": "Use accent color #FF0055 on primary checkout buttons.", "has_violation": True, "category": "visual", "expected_rule": "r_vis_001"},
    {"id": "tc_43", "text": "The comprehensive multi-layered institutional financial architecture leveraging heterogeneous distributed ledger paradigms facilitates instantaneous synchronization of disparate reconciliation ledgers across asynchronous nodes without degradation.", "has_violation": True, "category": "accessibility", "expected_rule": "r_acc_002"},
    {"id": "tc_44", "text": "Background container highlighted with neon violet #8A2BE2.", "has_violation": True, "category": "visual", "expected_rule": "r_vis_001"},
    {"id": "tc_45", "text": "Hero banner styled in lime green #00FF00.", "has_violation": True, "category": "visual", "expected_rule": "r_vis_001"},
    {"id": "tc_46", "text": "Card border rendered in bright yellow #FFFF00.", "has_violation": True, "category": "visual", "expected_rule": "r_vis_001"},
    {"id": "tc_47", "text": "The quintessential socioeconomic interoperability paradigm underscores an intrinsically convoluted systemic framework requiring multilateral institutional coordination before rudimentary transactional throughput can achieve preliminary convergence.", "has_violation": True, "category": "accessibility", "expected_rule": "r_acc_002"},
    {"id": "tc_48", "text": "Banner styled with hot pink #FF1493 font colors.", "has_violation": True, "category": "visual", "expected_rule": "r_vis_001"},
    {"id": "tc_49", "text": "Dark mode toggled to orange #FFA500 container.", "has_violation": True, "category": "visual", "expected_rule": "r_vis_001"},
    {"id": "tc_50", "text": "Notification alert icon filled with cyan #00FFFF.", "has_violation": True, "category": "visual", "expected_rule": "r_vis_001"},

    # --- CLEAN CONTROLS (30) — MUST PASS WITH ZERO FALSE POSITIVES ---
    {"id": "tc_51", "text": "NovaPay empowers over 45,000 merchants across India with modern payment infrastructure.", "has_violation": False},
    {"id": "tc_52", "text": "Our enterprise plan starts at ₹4,999/month and includes a dedicated technical account manager.", "has_violation": False},
    {"id": "tc_53", "text": "Certified PCI-DSS 4.0 Level 1 Service Provider and ISO/IEC 27001 compliant.", "has_violation": False},
    {"id": "tc_54", "text": "Customers receive transparent transaction settlement and 24/7 technical support.", "has_violation": False},
    {"id": "tc_55", "text": "Designed for modern finance leaders who value speed, compliance, and reliability.", "has_violation": False},
    {"id": "tc_56", "text": "Our platform maintained an audited 99.99% historical uptime over the last twelve months.", "has_violation": False},
    {"id": "tc_57", "text": "Automate vendor payout reconciliation with our robust webhook architecture.", "has_violation": False},
    {"id": "tc_58", "text": "NovaPay operates as an RBI-authorized Payment Aggregator.", "has_violation": False},
    {"id": "tc_59", "text": "Explore Nova Corporate Credit to streamline employee expense reporting.", "has_violation": False},
    {"id": "tc_60", "text": "Built with primary brand color #0052FF on a pure white #FFFFFF canvas.", "has_violation": False},
    {"id": "tc_61", "text": "Our merchants reduced month-end closing time by forty percent in Q2.", "has_violation": False},
    {"id": "tc_62", "text": "Instant T+0 settlements are available for verified UPI and netbanking transactions.", "has_violation": False},
    {"id": "tc_63", "text": "Multi-currency support allows billing in thirty-two international currencies.", "has_violation": False},
    {"id": "tc_64", "text": "NovaPay Technologies Pvt Ltd is headquartered in Bengaluru, Karnataka.", "has_violation": False},
    {"id": "tc_65", "text": "Simple, transparent pricing with no hidden charges.", "has_violation": False},
    {"id": "tc_66", "text": "Manage cross-border receivables with bank-grade security protocols.", "has_violation": False},
    {"id": "tc_67", "text": "Starter tier is available at ₹999/month with full developer documentation.", "has_violation": False},
    {"id": "tc_68", "text": "Connect with our integrations team to schedule a custom demo.", "has_violation": False},
    {"id": "tc_69", "text": "Read our technical whitepaper on payment retry optimization.", "has_violation": False},
    {"id": "tc_70", "text": "All transactions are protected by end-to-end encryption.", "has_violation": False},
    {"id": "tc_71", "text": "Empowering commerce across e-commerce, SaaS, and retail sectors.", "has_violation": False},
    {"id": "tc_72", "text": "NovaPay offers unified checkout widgets for React, Vue, and mobile apps.", "has_violation": False},
    {"id": "tc_73", "text": "Credit facilities are powered by RBI-regulated banking partners.", "has_violation": False},
    {"id": "tc_74", "text": "Our CSAT score reached 94.6% in the recent independent NielsenIQ survey.", "has_violation": False},
    {"id": "tc_75", "text": "Streamline subscription billing with automated retry sequences.", "has_violation": False},
    {"id": "tc_76", "text": "Clear space equal to 50% logo height is preserved on all promotional material.", "has_violation": False},
    {"id": "tc_77", "text": "Experience dependable enterprise payments designed for scalable volume.", "has_violation": False},
    {"id": "tc_78", "text": "We partner with leading financial institutions to ensure seamless settlement.", "has_violation": False},
    {"id": "tc_79", "text": "Review our compliance documentation for detailed audit logs.", "has_violation": False},
    {"id": "tc_80", "text": "Thank you to our community of 45,000 businesses building on NovaPay.", "has_violation": False}
]
