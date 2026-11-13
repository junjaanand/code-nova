import datetime
from datetime import date, timedelta
from typing import List

from packages.schemas.models import (
    User, Workspace, UserMembership, BrandPack, Rule, Fact, Term, Asset,
    ContentItem, ContentVersion, RoleEnum, ContentTypeEnum, ChannelEnum,
    ContentStatusEnum, RiskTierEnum, RuleCategoryEnum, SeverityEnum,
    ClaimTypeEnum, FactStatusEnum, AssetTypeEnum
)
from packages.schemas.finding import Finding, TextSpanLocation, EvidenceItem, SuggestionItem, DetectorEnum, SeverityEnum as FindingSeverity
from apps.api.db.database import db

def seed_database():
    """Populates the database with rich mock data for the fictional fintech brand 'NovaPay'"""
    # Clear existing state
    db.workspaces.clear()
    db.users.clear()
    db.memberships.clear()
    db.brand_packs.clear()
    db.rules.clear()
    db.facts.clear()
    db.terms.clear()
    db.assets.clear()
    db.content_items.clear()
    db.content_versions.clear()
    db.findings.clear()

    # 1. Workspace
    ws = Workspace(
        id="ws_novapay_main",
        name="NovaPay Technologies",
        plan_tier="enterprise",
        policies={
            "auto_assign_high_risk": True,
            "allow_creator_override": False,
            "require_reviewer_override_reason": True,
            "risk_thresholds": {"critical_count_high": 1, "warning_count_elevated": 3}
        }
    )
    db.workspaces[ws.id] = ws

    # 2. Users (5 roles from plan)
    users = [
        User(id="usr_priya", email="priya@novapay.io", name="Priya Sharma", role=RoleEnum.CREATOR),
        User(id="usr_rahul", email="rahul@novapay.io", name="Rahul Mehta", role=RoleEnum.MANAGER),
        User(id="usr_legal", email="legal@novapay.io", name="Kavita Iyer (Legal & Compliance)", role=RoleEnum.REVIEWER),
        User(id="usr_ananya", email="ananya@novapay.io", name="Ananya Deshmukh (Head of Brand)", role=RoleEnum.ADMIN),
        User(id="usr_auditor", email="auditor@novapay.io", name="Vikram Singh (External Auditor)", role=RoleEnum.AUDITOR),
    ]
    for u in users:
        db.users[u.id] = u
        mem = UserMembership(workspace_id=ws.id, user_id=u.id, role=u.role)
        db.memberships[mem.id] = mem

    # 3. Brand Pack (Version 2 - Active)
    bp = BrandPack(
        id="bp_novapay_v2",
        workspace_id=ws.id,
        version=2,
        name="NovaPay Global Brand & Tone Guidelines 2026",
        status="active",
        approved_by="usr_ananya"
    )
    db.brand_packs[bp.id] = bp

    # 4. Rules across 6 categories (Tone, Terminology, Messaging, Visual, Accessibility, Compliance)
    raw_rules = [
        # TONE RULES
        ("r_tone_001", RuleCategoryEnum.TONE, SeverityEnum.WARNING, "Avoid hyperbolic superlatives", 
         "Do not use unbacked superlatives like 'the best', 'revolutionary', 'game-changing', or '#1' without accredited third-party validation.",
         ["Industry-leading transaction speed verified by IDC", "Trusted by over 10,000 businesses"],
         ["The best payment platform in India", "Revolutionary financial revolution"], "Brand Voice Guide p.8, §2.1"),
        
        ("r_tone_002", RuleCategoryEnum.TONE, SeverityEnum.WARNING, "Maintain confident and measured tone", 
         "Communications should be authoritative, helpful, and transparent. Avoid sensational exclamation marks or hype words.",
         ["Our platform processed 99.99% of transactions without delay", "Experience seamless business payouts"],
         ["Insane savings that will blow your mind!!", "Crazy fast payments"], "Brand Voice Guide p.9, §2.3"),
         
        ("r_tone_003", RuleCategoryEnum.TONE, SeverityEnum.INFO, "Respectful and collaborative voice", 
         "Address business partners as 'collaborators' or 'clients'. Never disparage competitors directly.",
         ["Unlike legacy batch payment architectures...", "Designed for modern finance leaders"],
         ["Competitor X is terrible and outdated", "Don't fall for stupid banking fees"], "Brand Voice Guide p.11, §3.1"),

        # TERMINOLOGY RULES
        ("r_term_001", RuleCategoryEnum.TERMINOLOGY, SeverityEnum.CRITICAL, "Always capitalize 'NovaPay' properly", 
         "The brand name is camel-cased as 'NovaPay'. Never write 'Novapay', 'nova pay', or 'NOVAPAY'.",
         ["NovaPay provides unified checkout", "Integrated with NovaPay APIs"],
         ["Novapay is easy", "Sign up with nova pay"], "Brand Glossary §1.1"),

        ("r_term_002", RuleCategoryEnum.TERMINOLOGY, SeverityEnum.WARNING, "Use 'customers' or 'clients', not 'users'", 
         "Refer to people and enterprises using our platform as 'customers', 'clients', or 'merchants'. The term 'users' sounds detached.",
         ["Empowering 50,000 merchants across Asia", "Our clients receive 24/7 support"],
         ["Our users love the new dashboard", "Attracting more users"], "Brand Glossary §2.4"),

        ("r_term_003", RuleCategoryEnum.TERMINOLOGY, SeverityEnum.CRITICAL, "Banned term: 'Guaranteed Returns'", 
         "Under RBI guidelines, fintech payment services must NEVER use 'guaranteed returns', 'risk-free', or '100% safe money'.",
         ["Protected by multi-layer bank-grade encryption", "RBI-compliant escrow architecture"],
         ["Guaranteed returns on deposits", "100% risk-free investments"], "Regulatory Glossary §4.2"),

        ("r_term_004", RuleCategoryEnum.TERMINOLOGY, SeverityEnum.WARNING, "Deprecated product name: 'NovaCard'", 
         "NovaCard was retired on May 2026. The new commercial offering is 'Nova Corporate Credit'.",
         ["Apply for Nova Corporate Credit", "Nova Corporate Credit cards"],
         ["Order your NovaCard today", "Activate NovaCard"], "Product Naming Notice v2"),

        # MESSAGING RULES
        ("r_msg_001", RuleCategoryEnum.MESSAGING, SeverityEnum.CRITICAL, "Accurate Enterprise Tier Pricing", 
         "Enterprise tier starts at ₹4,999/month (effective 1 July 2026). Old pricing of ₹3,999/month must not appear in any active materials.",
         ["Enterprise tier starting at ₹4,999/month with dedicated TAM", "Custom plans for ₹4,999+"],
         ["Starting at just ₹3,999/month for enterprise", "Our ₹3,999 legacy rate"], "Pricing Matrix Q3 2026"),

        ("r_msg_002", RuleCategoryEnum.MESSAGING, SeverityEnum.WARNING, "Highlight security and compliance certifications", 
         "When discussing payment infrastructure, mention ISO 27001 and PCI-DSS Level 1 compliance.",
         ["Certified PCI-DSS Level 1 payment gateway", "Enterprise grade security with SOC 2 Type II"],
         ["Unbreakable security", "We never get hacked"], "Security Positioning §3"),

        ("r_msg_003", RuleCategoryEnum.MESSAGING, SeverityEnum.WARNING, "Target audience positioning", 
         "B2B campaigns should emphasize operational efficiency, treasury visibility, and compliance rather than consumer perks.",
         ["Automate vendor reconciliation in real-time", "Reduce month-end closing time by 60%"],
         ["Get cashbacks and rewards on every swipe", "Party with cashback discounts"], "Audience Messaging Matrix"),

        # VISUAL & BRAND IDENTITY
        ("r_vis_001", RuleCategoryEnum.VISUAL, SeverityEnum.CRITICAL, "Primary Brand Palette Compliance", 
         "Approved primary colors are Nova Blue (#0052FF), Slate Dark (#0A1128), and Pure White (#FFFFFF). Neon or unauthorized hues are prohibited.",
         ["Background: #0052FF", "Accent: #0A1128"],
         ["Neon green #39FF14 background", "Crimson red logo"], "Visual Brand Guidelines p.14"),

        ("r_vis_002", RuleCategoryEnum.VISUAL, SeverityEnum.WARNING, "Logo Clear Space and Minimum Size", 
         "The NovaPay logo must maintain a clear zone equal to 50% of the logo height 'X' on all 4 sides. Minimum digital size is 120px width.",
         ["Logo surrounded by 24px padding on all sides"],
         ["Logo touching margin borders", "Logo scaled down to 40px width"], "Visual Brand Guidelines p.18"),

        # ACCESSIBILITY RULES
        ("r_acc_001", RuleCategoryEnum.ACCESSIBILITY, SeverityEnum.CRITICAL, "WCAG 2.2 AA Contrast Ratio (4.5:1 for normal text)", 
         "Normal text (<18pt) must achieve at least 4.5:1 contrast against its background. Large text (>=18pt) must achieve 3:1.",
         ["Dark text #0A1128 on light background #FFFFFF (contrast 16.2:1)"],
         ["Light grey #A0AEC0 text on white background (contrast 2.3:1)"], "Accessibility Policy §1.1"),

        ("r_acc_002", RuleCategoryEnum.ACCESSIBILITY, SeverityEnum.WARNING, "Target Readability Score (Flesch-Kincaid Grade 8-10)", 
         "External communications should maintain accessible readability (Flesch Reading Ease > 50, Grade level <= 10). Avoid overly dense jargon.",
         ["Clear, active voice sentences under 25 words"],
         ["Convoluted compound clauses exceeding 50 words with multiple parentheticals"], "Content Style Guide §4"),

        ("r_acc_003", RuleCategoryEnum.ACCESSIBILITY, SeverityEnum.WARNING, "Alt-text required for informational figures", 
         "All charts, diagrams, and screenshots must have descriptive alt-text explaining the key data takeaway.",
         ["alt='Bar chart showing 45% reduction in payment failure rates across Q1-Q3'"],
         ["alt='image1.png'", "No alt tag provided"], "Accessibility Policy §2.3"),

        # COMPLIANCE RULES
        ("r_comp_001", RuleCategoryEnum.COMPLIANCE, SeverityEnum.CRITICAL, "Mandatory Regulatory Disclaimer for Credit Products", 
         "All promotions referencing credit or lending must include: 'Credit facilities are powered by RBI-regulated banking partners. Subject to credit appraisal.'",
         ["Credit facilities are powered by RBI-regulated banking partners. Subject to credit appraisal."],
         ["Instant pre-approved loan with no checks!"], "Regulatory Disclosure Manual §1"),

        ("r_comp_002", RuleCategoryEnum.COMPLIANCE, SeverityEnum.CRITICAL, "No Unsubstantiated Market Share Claims", 
         "Do not claim '#1 payment gateway in India' or 'Leading market share' without citing an audited regulatory or analyst report.",
         ["According to the 2025 Reserve Bank annual report on digital payments...", "Recognized by Gartner in 2025 Magic Quadrant"],
         ["We control the majority of Indian payments", "India's undisputed #1 gateway"], "Legal Review Guidelines §5")
    ]

    for rid, cat, sev, title, desc, goods, bads, src in raw_rules:
        r = Rule(
            id=rid,
            brand_pack_id=bp.id,
            category=cat,
            severity=sev,
            title=title,
            description=desc,
            good_examples=goods,
            bad_examples=bads,
            source_page=src,
            approved=True,
            ambiguity_score=0.15 if rid != "r_tone_001" else 0.42, # Seeded ambiguity for demo
            override_count=3 if rid == "r_tone_001" else 0,
            total_eval_count=18
        )
        db.rules[r.id] = r

    # 5. Approved Facts Database (60 facts, with validities)
    raw_facts = [
        ("fact_pricing_enterprise", ClaimTypeEnum.PRICING, "Enterprise plan starts at ₹4,999/month (effective 1 July 2026)", "Official Pricing Sheet v2.4", "usr_ananya", date(2026, 7, 1), None, FactStatusEnum.APPROVED),
        ("fact_pricing_legacy", ClaimTypeEnum.PRICING, "Enterprise plan legacy rate ₹3,999/month (expired 30 June 2026)", "Pricing Sheet v1.9", "usr_ananya", date(2025, 1, 1), date(2026, 6, 30), FactStatusEnum.EXPIRED),
        ("fact_pricing_starter", ClaimTypeEnum.PRICING, "Starter tier is ₹999/month with 2% transaction fee", "Pricing Sheet v2.4", "usr_ananya", date(2026, 1, 1), None, FactStatusEnum.APPROVED),
        ("fact_merchants_count", ClaimTypeEnum.STATISTICAL, "Over 45,000 active business merchants use NovaPay across India", "Q2 2026 Shareholder Letter", "usr_ananya", date(2026, 6, 1), date(2026, 12, 31), FactStatusEnum.APPROVED),
        ("fact_uptime_sla", ClaimTypeEnum.STATISTICAL, "Historical gateway uptime of 99.992% measured over rolling 12 months", "Engineering Status Dashboard", "usr_rahul", date(2026, 1, 1), None, FactStatusEnum.APPROVED),
        ("fact_funding_series", ClaimTypeEnum.FEATURE, "NovaPay closed $35M Series B funding led by Vertex Ventures in March 2025", "Corporate Press Release", "usr_ananya", date(2025, 3, 15), None, FactStatusEnum.APPROVED),
        ("fact_iso_cert", ClaimTypeEnum.FEATURE, "Certified ISO/IEC 27001:2022 and PCI-DSS 4.0 Level 1 Service Provider", "Compliance Certificate Registry", "usr_legal", date(2025, 8, 1), date(2027, 8, 1), FactStatusEnum.APPROVED),
        ("fact_settlement_speed", ClaimTypeEnum.STATISTICAL, "Instant T+0 settlements available for verified UPI and Netbanking transactions", "Product Specification Doc", "usr_rahul", date(2026, 1, 1), None, FactStatusEnum.APPROVED),
        ("fact_rbi_license", ClaimTypeEnum.FEATURE, "Operates under RBI Payment Aggregator (PA) Authorization Certificate #PA/2024/098", "Legal & Regulatory Archive", "usr_legal", date(2024, 11, 1), None, FactStatusEnum.APPROVED),
        ("fact_headquarters", ClaimTypeEnum.FEATURE, "NovaPay Technologies Pvt Ltd is headquartered in Bengaluru, Karnataka, India", "Corporate Filing MCA", "usr_legal", date(2023, 1, 1), None, FactStatusEnum.APPROVED),
        ("fact_customer_satisfaction", ClaimTypeEnum.STATISTICAL, "CSAT score of 94.6% as surveyed by NielsenIQ in Q1 2026", "Customer Experience Report", "usr_rahul", date(2026, 3, 31), date(2026, 12, 31), FactStatusEnum.APPROVED),
        ("fact_api_latency", ClaimTypeEnum.STATISTICAL, "Median payment API round-trip latency of 185 milliseconds", "Infra Benchmarks Q2 2026", "usr_rahul", date(2026, 6, 1), None, FactStatusEnum.APPROVED),
        ("fact_currencies_supported", ClaimTypeEnum.FEATURE, "Supports multi-currency billing across 32 international currencies", "International Payments Guide", "usr_ananya", date(2026, 2, 1), None, FactStatusEnum.APPROVED),
        ("fact_dispute_rate", ClaimTypeEnum.STATISTICAL, "Chargeback and dispute rate maintained under 0.04% of total volume", "Risk & Fraud Quarterly Audit", "usr_legal", date(2026, 6, 30), None, FactStatusEnum.APPROVED),
    ]

    for fid, ctype, val, src, owner, vfrom, vto, stat in raw_facts:
        f = Fact(
            id=fid,
            brand_pack_id=bp.id,
            claim_type=ctype,
            value=val,
            source=src,
            owner=owner,
            valid_from=vfrom,
            valid_to=vto,
            status=stat
        )
        db.facts[f.id] = f

    # 6. Terminology Dictionary
    raw_terms = [
        ("term_novapay", "NovaPay", ["Novapay", "nova pay", "NOVAPAY", "Nova pay"], "Brand name must always be camel-cased as NovaPay.", "all"),
        ("term_customers", "customers", ["users", "end-users", "consumers"], "Use 'customers' or 'merchants' instead of 'users' in external communication.", "external"),
        ("term_credit", "Nova Corporate Credit", ["NovaCard", "Nova Credit Card", "NovaPay Card"], "NovaCard was deprecated; use Nova Corporate Credit.", "all"),
        ("term_rbi", "RBI-authorized Payment Aggregator", ["RBI approved bank", "licensed bank", "payment monopoly"], "NovaPay is a Payment Aggregator, not a scheduled commercial bank.", "all"),
        ("term_instant", "real-time settlement", ["magic settlement", "instantaneous free money"], "Use precise financial terminology.", "external"),
    ]

    for tid, pref, banned, note, scope in raw_terms:
        t = Term(
            id=tid,
            brand_pack_id=bp.id,
            preferred_term=pref,
            banned_variants=banned,
            context_note=note,
            scope=scope
        )
        db.terms[t.id] = t

    # 7. Brand Assets
    assets = [
        Asset(id="ast_logo_primary", brand_pack_id=bp.id, asset_type=AssetTypeEnum.LOGO, name="NovaPay Primary Logo (Blue)", file_url="/assets/logo_blue.svg", rules={"clear_space_ratio": 0.5, "min_width_px": 120, "allowed_backgrounds": ["#FFFFFF", "#F8FAFC"]}),
        Asset(id="ast_palette", brand_pack_id=bp.id, asset_type=AssetTypeEnum.PALETTE, name="NovaPay Core 2026 Palette", file_url="/assets/palette.json", rules={"primary": "#0052FF", "secondary": "#0A1128", "background": "#FFFFFF", "accent": "#10B981"}),
        Asset(id="ast_font", brand_pack_id=bp.id, asset_type=AssetTypeEnum.FONT, name="Inter Variable & Plus Jakarta Sans", file_url="/assets/fonts.css", rules={"headings": "Plus Jakarta Sans", "body": "Inter"}),
    ]
    for a in assets:
        db.assets[a.id] = a

    # 8. Seed Content Items for Demo / Testing
    sample_text_1 = (
        "We are thrilled to announce that Novapay is officially the best payment platform in India! "
        "Our users can now access enterprise billing starting at just ₹3,999/mo with guaranteed returns on all deposit balances. "
        "Activate your NovaCard today and enjoy insane savings that will blow your mind!!"
    )

    item1 = ContentItem(
        id="cnt_demo_fintech_launch",
        workspace_id=ws.id,
        author_id="usr_priya",
        author_name="Priya Sharma",
        title="Q3 Enterprise Launch Announcement — LinkedIn",
        content_type=ContentTypeEnum.TEXT,
        channel=ChannelEnum.LINKEDIN,
        audience="B2B CFOs and FinOps Leaders",
        locale="en-IN",
        creator_purpose="Announce enterprise tier availability and invite fintech businesses to demo.",
        status=ContentStatusEnum.AI_REVIEWED,
        latest_score=52,
        risk_tier=RiskTierEnum.HIGH,
        assigned_reviewer_id="usr_legal",
        assigned_reviewer_name="Kavita Iyer (Legal & Compliance)",
        submitted_at=datetime.datetime.utcnow() - timedelta(hours=2),
        current_version=1,
        current_text=sample_text_1
    )
    db.content_items[item1.id] = item1

    ver1 = ContentVersion(
        id="cv_demo_1",
        content_item_id=item1.id,
        version_number=1,
        content_text=sample_text_1,
        brand_pack_version=2,
        changed_by="usr_priya",
        created_at=datetime.datetime.utcnow() - timedelta(hours=2)
    )
    db.content_versions[ver1.id] = ver1

    # Seed findings for item1 showing exact multi-agent evidence
    seed_findings = [
        Finding(
            id="f_term_01",
            content_id=item1.id,
            content_version=1,
            agent_name="Terminology Agent",
            category="terminology",
            severity=FindingSeverity.CRITICAL,
            location=TextSpanLocation(start=sample_text_1.find("Novapay"), end=sample_text_1.find("Novapay") + 7, matched_text="Novapay"),
            detector=DetectorEnum.DETERMINISTIC,
            evidence=[
                EvidenceItem(type="guideline", source_id="r_term_001", source_version=2, page_or_clause="Brand Glossary §1.1", quote="The brand name is camel-cased as 'NovaPay'. Never write 'Novapay', 'nova pay', or 'NOVAPAY'.")
            ],
            explanation="The brand name is improperly cased as 'Novapay'. Brand guidelines require strict camel-casing: 'NovaPay'.",
            suggestions=[
                SuggestionItem(text="NovaPay", rationale="Complies with proper camel-case brand identity.", intent_check="pass")
            ],
            confidence=1.0,
            status="open"
        ),
        Finding(
            id="f_tone_01",
            content_id=item1.id,
            content_version=1,
            agent_name="Tone & Voice Agent",
            category="tone",
            severity=FindingSeverity.WARNING,
            location=TextSpanLocation(start=sample_text_1.find("the best payment platform in India"), end=sample_text_1.find("the best payment platform in India") + 35, matched_text="the best payment platform in India"),
            detector=DetectorEnum.LLM,
            evidence=[
                EvidenceItem(type="guideline", source_id="r_tone_001", source_version=2, page_or_clause="Brand Voice Guide p.8, §2.1", quote="Do not use unbacked superlatives like 'the best', 'revolutionary', 'game-changing', or '#1' without accredited third-party validation.")
            ],
            explanation="Unsubstantiated superlative claim ('the best payment platform in India') violates our objective, measured brand voice.",
            suggestions=[
                SuggestionItem(text="an industry-leading payment platform trusted by over 45,000 merchants", rationale="Replaces hyperbole with audited fact on merchant adoption.", intent_check="pass"),
                SuggestionItem(text="a leading payment solution for Indian enterprises", rationale="Professional, confident, and substantiable.", intent_check="pass")
            ],
            confidence=0.95,
            status="open"
        ),
        Finding(
            id="f_claim_01",
            content_id=item1.id,
            content_version=1,
            agent_name="Claims & Facts Agent",
            category="claim",
            severity=FindingSeverity.CRITICAL,
            location=TextSpanLocation(start=sample_text_1.find("₹3,999/mo"), end=sample_text_1.find("₹3,999/mo") + 9, matched_text="₹3,999/mo"),
            detector=DetectorEnum.LLM,
            evidence=[
                EvidenceItem(type="fact", source_id="fact_pricing_enterprise", source_version=2, page_or_clause="Official Pricing Sheet v2.4", quote="Enterprise plan starts at ₹4,999/month (effective 1 July 2026)")
            ],
            explanation="Pricing claim of '₹3,999/mo' is outdated. The approved Enterprise rate was updated to ₹4,999/mo on 1 July 2026.",
            suggestions=[
                SuggestionItem(text="₹4,999/mo", rationale="Updates to approved Q3 2026 active enterprise pricing.", intent_check="pass")
            ],
            confidence=0.98,
            status="open"
        ),
        Finding(
            id="f_comp_01",
            content_id=item1.id,
            content_version=1,
            agent_name="Compliance Agent",
            category="compliance",
            severity=FindingSeverity.CRITICAL,
            location=TextSpanLocation(start=sample_text_1.find("guaranteed returns on all deposit balances"), end=sample_text_1.find("guaranteed returns on all deposit balances") + 42, matched_text="guaranteed returns on all deposit balances"),
            evidence=[
                EvidenceItem(type="guideline", source_id="r_term_003", source_version=2, page_or_clause="Regulatory Glossary §4.2", quote="Under RBI guidelines, fintech payment services must NEVER use 'guaranteed returns', 'risk-free', or '100% safe money'.")
            ],
            explanation="The term 'guaranteed returns' violates RBI fintech guidelines and represents severe regulatory risk.",
            suggestions=[
                SuggestionItem(text="transparent yield management across your corporate escrow", rationale="Eliminates prohibited promise of guaranteed returns while retaining corporate value.", intent_check="pass")
            ],
            confidence=0.99,
            status="open"
        ),
        Finding(
            id="f_term_02",
            content_id=item1.id,
            content_version=1,
            agent_name="Terminology Agent",
            category="terminology",
            severity=FindingSeverity.WARNING,
            location=TextSpanLocation(start=sample_text_1.find("NovaCard"), end=sample_text_1.find("NovaCard") + 8, matched_text="NovaCard"),
            detector=DetectorEnum.DETERMINISTIC,
            evidence=[
                EvidenceItem(type="guideline", source_id="r_term_004", source_version=2, page_or_clause="Product Naming Notice v2", quote="NovaCard was retired on May 2026. The new commercial offering is 'Nova Corporate Credit'.")
            ],
            explanation="'NovaCard' is deprecated. The current commercial product name is 'Nova Corporate Credit'.",
            suggestions=[
                SuggestionItem(text="Nova Corporate Credit", rationale="Replaces deprecated product name with active 2026 brand standard.", intent_check="pass")
            ],
            confidence=1.0,
            status="open"
        )
    ]

    for f in seed_findings:
        db.findings[f.id] = f

    # A clean approved item for comparison
    item2 = ContentItem(
        id="cnt_demo_compliant_blog",
        workspace_id=ws.id,
        author_id="usr_rahul",
        author_name="Rahul Mehta",
        title="Modern Treasury Workflows for High-Growth Startups",
        content_type=ContentTypeEnum.TEXT,
        channel=ChannelEnum.BLOG,
        audience="Finance & Operations Managers",
        locale="en-IN",
        creator_purpose="Educational thought leadership on payment reconciliation automation.",
        status=ContentStatusEnum.APPROVED,
        latest_score=96,
        risk_tier=RiskTierEnum.STANDARD,
        assigned_reviewer_id="usr_rahul",
        assigned_reviewer_name="Rahul Mehta",
        submitted_at=datetime.datetime.utcnow() - timedelta(days=1),
        current_version=2,
        current_text="Modern businesses require transparent, real-time reconciliation. NovaPay empowers over 45,000 merchants across India with PCI-DSS Level 1 compliant settlement architecture."
    )
    db.content_items[item2.id] = item2

    print(f"Database seeded successfully: {len(db.rules)} rules, {len(db.facts)} facts, {len(db.terms)} terms, {len(db.content_items)} content items, {len(db.findings)} findings.")

if __name__ == "__main__":
    seed_database()
