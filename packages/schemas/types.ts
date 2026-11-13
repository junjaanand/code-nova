// TypeScript types matching packages/schemas/finding.py and models.py

export type Role = 'creator' | 'manager' | 'reviewer' | 'admin' | 'auditor';

export type Category = 
  | 'tone' 
  | 'terminology' 
  | 'messaging' 
  | 'claim' 
  | 'visual' 
  | 'accessibility' 
  | 'compliance';

export type Severity = 'info' | 'warning' | 'critical';

export type Detector = 'deterministic' | 'llm';

export type FindingStatus = 'open' | 'accepted' | 'edited' | 'rejected' | 'overridden';

export interface TextSpanLocation {
  type: 'text_span';
  start: number;
  end: number;
  matched_text?: string;
}

export interface VisualLocation {
  type: 'visual';
  page?: number;
  bbox?: [number, number, number, number];
  color_hex?: string;
}

export interface EvidenceItem {
  type: 'guideline' | 'fact' | 'asset' | 'metric';
  source_id: string;
  source_version: number;
  page_or_clause?: string;
  quote: string;
}

export interface SuggestionItem {
  id: string;
  text: string;
  rationale: string;
  intent_check: 'pass' | 'fail';
  diff_preview?: string;
}

export interface FindingDecision {
  action: 'accept' | 'edit' | 'reject' | 'override';
  reason?: string;
  by_user?: string;
  role?: string;
  custom_edit?: string;
  timestamp: string;
}

export interface Finding {
  id: string;
  content_id: string;
  content_version: number;
  agent_name: string;
  category: Category;
  severity: Severity;
  location: TextSpanLocation | VisualLocation | Record<string, any>;
  detector: Detector;
  evidence: EvidenceItem[];
  explanation: string;
  suggestions: SuggestionItem[];
  confidence: number;
  status: FindingStatus;
  decision?: FindingDecision | null;
}

export type ContentStatus = 
  | 'draft' 
  | 'ai_reviewed' 
  | 'changes_requested' 
  | 'in_review' 
  | 'approved' 
  | 'rejected' 
  | 'published';

export type RiskTier = 'standard' | 'elevated' | 'high';

export interface ContentItem {
  id: string;
  workspace_id: string;
  author_id: string;
  author_name: string;
  title: string;
  content_type: 'text' | 'pdf' | 'docx' | 'image' | 'mixed';
  channel: 'linkedin' | 'email' | 'blog' | 'ad' | 'deck' | 'website';
  audience: string;
  locale: string;
  creator_purpose: string;
  status: ContentStatus;
  latest_score: number;
  risk_tier: RiskTier;
  assigned_reviewer_id?: string;
  assigned_reviewer_name?: string;
  review_certificate_hash?: string;
  submitted_at: string;
  current_version: number;
  current_text: string;
}

export interface BrandRule {
  id: string;
  brand_pack_id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  good_examples: string[];
  bad_examples: string[];
  source_page?: string;
  approved: boolean;
  ambiguity_score: number;
  override_count: number;
  total_eval_count: number;
}

export interface BrandFact {
  id: string;
  brand_pack_id: string;
  claim_type: 'statistical' | 'pricing' | 'date' | 'feature' | 'testimonial';
  value: string;
  source: string;
  owner: string;
  valid_from?: string;
  valid_to?: string;
  status: 'approved' | 'expired' | 'superseded';
}

export interface BrandTerm {
  id: string;
  brand_pack_id: string;
  preferred_term: string;
  banned_variants: string[];
  context_note?: string;
  scope: string;
}

export interface BrandAsset {
  id: string;
  brand_pack_id: string;
  asset_type: 'logo' | 'palette' | 'font' | 'image_style';
  name: string;
  file_url: string;
  rules: Record<string, any>;
}

export interface BrandPack {
  id: string;
  workspace_id: string;
  version: number;
  name: string;
  status: 'draft' | 'active' | 'archived';
  approved_by?: string;
  rules: BrandRule[];
  facts: BrandFact[];
  terms: BrandTerm[];
  assets: BrandAsset[];
  created_at: string;
}

export interface Comment {
  id: string;
  content_item_id: string;
  author_id: string;
  author_name: string;
  anchor?: Record<string, any>;
  body: string;
  parent_comment_id?: string;
  created_at: string;
}

export interface ReviewAction {
  id: string;
  review_task_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_role: Role;
  action: 'comment' | 'approve' | 'reject' | 'request_revision' | 'override';
  comment?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  event_type: string;
  event_data: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface AgentProgressEvent {
  step: string;
  agent: string;
  status: 'started' | 'running' | 'completed' | 'skipped' | 'failed';
  message: string;
  progress_pct: number;
  findings_count?: number;
}
