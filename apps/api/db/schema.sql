-- =====================================================================
-- BrandShield AI — Production PostgreSQL 16 + pgvector Schema
-- CodeNova India 2026 | Supabase Migration Script
-- =====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Enumerated Types
CREATE TYPE user_role AS ENUM ('creator', 'manager', 'reviewer', 'admin', 'auditor');
CREATE TYPE content_status AS ENUM ('draft', 'ai_reviewed', 'changes_requested', 'in_review', 'approved', 'rejected', 'published');
CREATE TYPE risk_tier AS ENUM ('standard', 'elevated', 'high');
CREATE TYPE rule_category AS ENUM ('tone', 'terminology', 'messaging', 'visual', 'accessibility', 'compliance');
CREATE TYPE severity_level AS ENUM ('info', 'warning', 'critical');
CREATE TYPE claim_type AS ENUM ('statistical', 'pricing', 'date', 'feature', 'testimonial');
CREATE TYPE fact_status AS ENUM ('approved', 'expired', 'superseded');
CREATE TYPE asset_type AS ENUM ('logo', 'palette', 'font', 'image_style');
CREATE TYPE finding_status AS ENUM ('open', 'accepted', 'edited', 'rejected', 'overridden');

-- 3. Core Relational Tables

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'ws_' || substr(md5(random()::text), 1, 8),
    name VARCHAR(255) NOT NULL,
    plan_tier VARCHAR(64) DEFAULT 'enterprise',
    settings JSONB DEFAULT '{}'::jsonb,
    policies JSONB DEFAULT '{"auto_assign_high_risk": true, "allow_creator_override": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'usr_' || substr(md5(random()::text), 1, 8),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'creator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Memberships
CREATE TABLE IF NOT EXISTS user_memberships (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'mem_' || substr(md5(random()::text), 1, 8),
    workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Brand Packs (Versioned)
CREATE TABLE IF NOT EXISTS brand_packs (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'bp_' || substr(md5(random()::text), 1, 8),
    workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'active', -- draft | active | archived
    approved_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rules with pgvector embedding (768 dimensions for Gemini text-embedding-004)
CREATE TABLE IF NOT EXISTS rules (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'r_' || substr(md5(random()::text), 1, 8),
    brand_pack_id VARCHAR(64) REFERENCES brand_packs(id) ON DELETE CASCADE,
    category rule_category NOT NULL,
    severity severity_level DEFAULT 'warning',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    good_examples JSONB DEFAULT '[]'::jsonb,
    bad_examples JSONB DEFAULT '[]'::jsonb,
    source_page VARCHAR(255),
    embedding vector(768),
    approved BOOLEAN DEFAULT TRUE,
    ambiguity_score FLOAT DEFAULT 0.0,
    override_count INTEGER DEFAULT 0,
    total_eval_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facts with pgvector embedding
CREATE TABLE IF NOT EXISTS facts (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'fact_' || substr(md5(random()::text), 1, 8),
    brand_pack_id VARCHAR(64) REFERENCES brand_packs(id) ON DELETE CASCADE,
    claim_type claim_type NOT NULL,
    value TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    owner VARCHAR(255) DEFAULT 'Brand Team',
    valid_from DATE,
    valid_to DATE,
    status fact_status DEFAULT 'approved',
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Terminology
CREATE TABLE IF NOT EXISTS terms (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'term_' || substr(md5(random()::text), 1, 8),
    brand_pack_id VARCHAR(64) REFERENCES brand_packs(id) ON DELETE CASCADE,
    preferred_term VARCHAR(255) NOT NULL,
    banned_variants JSONB DEFAULT '[]'::jsonb,
    context_note TEXT,
    scope VARCHAR(32) DEFAULT 'all'
);

-- Brand Assets
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'asset_' || substr(md5(random()::text), 1, 8),
    brand_pack_id VARCHAR(64) REFERENCES brand_packs(id) ON DELETE CASCADE,
    asset_type asset_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    rules JSONB DEFAULT '{}'::jsonb
);

-- Content Items
CREATE TABLE IF NOT EXISTS content_items (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'cnt_' || substr(md5(random()::text), 1, 8),
    workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
    author_id VARCHAR(64) REFERENCES users(id),
    author_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(32) DEFAULT 'text',
    channel VARCHAR(64) DEFAULT 'linkedin',
    audience VARCHAR(255) DEFAULT 'B2B Decision Makers',
    locale VARCHAR(32) DEFAULT 'en-IN',
    creator_purpose TEXT,
    status content_status DEFAULT 'draft',
    latest_score INTEGER DEFAULT 100,
    risk_tier risk_tier DEFAULT 'standard',
    assigned_reviewer_id VARCHAR(64) REFERENCES users(id),
    assigned_reviewer_name VARCHAR(255),
    review_certificate_hash VARCHAR(128),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_version INTEGER DEFAULT 1,
    current_text TEXT
);

-- Content Versions (Diff history)
CREATE TABLE IF NOT EXISTS content_versions (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'cv_' || substr(md5(random()::text), 1, 8),
    content_item_id VARCHAR(64) REFERENCES content_items(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    content_text TEXT NOT NULL,
    content_metadata JSONB DEFAULT '{}'::jsonb,
    content_hash VARCHAR(128),
    brand_pack_version INTEGER DEFAULT 1,
    diff_from_previous JSONB,
    changed_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Findings (Universal Contract with Evidence Citations)
CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'f_' || substr(md5(random()::text), 1, 8),
    content_id VARCHAR(64) REFERENCES content_items(id) ON DELETE CASCADE,
    content_version INTEGER DEFAULT 1,
    agent_name VARCHAR(128) NOT NULL,
    category rule_category NOT NULL,
    severity severity_level NOT NULL,
    location JSONB NOT NULL, -- text span or visual bbox
    detector VARCHAR(32) DEFAULT 'llm',
    evidence JSONB NOT NULL, -- MUST BE NON-EMPTY ('No citation, no flag')
    explanation TEXT NOT NULL,
    suggestions JSONB DEFAULT '[]'::jsonb,
    confidence FLOAT NOT NULL,
    status finding_status DEFAULT 'open',
    decision JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments (Anchored to spans or pages)
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'comm_' || substr(md5(random()::text), 1, 8),
    content_item_id VARCHAR(64) REFERENCES content_items(id) ON DELETE CASCADE,
    author_id VARCHAR(64) REFERENCES users(id),
    author_name VARCHAR(255) NOT NULL,
    anchor JSONB,
    body TEXT NOT NULL,
    parent_comment_id VARCHAR(64) REFERENCES comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log (Immutable Governance Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'audit_' || substr(md5(random()::text), 1, 8),
    workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Call Logs (Telemetry & Cost Accounting)
CREATE TABLE IF NOT EXISTS ai_call_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'ai_' || substr(md5(random()::text), 1, 8),
    content_version_id VARCHAR(64),
    agent_name VARCHAR(128) NOT NULL,
    provider VARCHAR(64) NOT NULL,
    model VARCHAR(128) NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cost_usd FLOAT DEFAULT 0.0,
    latency_ms INTEGER DEFAULT 0,
    redactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insight Snapshots (Guideline Health & Trends)
CREATE TABLE IF NOT EXISTS insight_snapshots (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'snap_' || substr(md5(random()::text), 1, 8),
    workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
    snapshot_date DATE DEFAULT CURRENT_DATE,
    metrics JSONB DEFAULT '{}'::jsonb,
    guideline_health JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 4. High-Performance HNSW Vector Cosine Indexes (pgvector)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_rules_embedding ON rules 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_facts_embedding ON facts 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Standard B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_content_workspace ON content_items(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_findings_content ON findings(content_id);
CREATE INDEX IF NOT EXISTS idx_audit_workspace ON audit_logs(workspace_id);

-- =====================================================================
-- 5. Row-Level Security (RLS) Policies
-- =====================================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Workspace Isolation Policy
CREATE POLICY workspace_isolation_policy ON content_items
    FOR ALL
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY finding_isolation_policy ON findings
    FOR ALL
    USING (content_id IN (SELECT id FROM content_items WHERE workspace_id = current_setting('app.current_workspace_id', true)));
