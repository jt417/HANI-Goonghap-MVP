-- HANI MatchOS CRM Database Schema
-- Run this in Supabase SQL Editor after creating a project

-- 1. Agencies (테넌트/업체)
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  tier TEXT DEFAULT 'standard',
  trust_score NUMERIC(3,1) DEFAULT 0,
  response_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Users (매니저/직원) - extends Supabase auth.users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'verifier', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Members (회원)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id),
  display_id TEXT NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE,
  age INT,
  gender TEXT CHECK (gender IN ('M', 'F')),
  job TEXT,
  income TEXT,
  edu TEXT,
  height INT,
  weight INT,
  body_type TEXT,
  assets TEXT,
  family TEXT,
  appearance_note TEXT,
  location TEXT,
  verify_level TEXT DEFAULT 'Lv1',
  verify_items TEXT[] DEFAULT '{}',
  saju_profile TEXT,
  grade JSONB DEFAULT '{}',
  "values" TEXT[] DEFAULT '{}',
  status TEXT DEFAULT '신규 상담',
  manager_id UUID REFERENCES users(id),
  profile_completion INT DEFAULT 0,
  outbound_proposals INT DEFAULT 0,
  last_contact TIMESTAMPTZ,
  next_action TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Proposals (소개 제안)
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agency_id UUID NOT NULL REFERENCES agencies(id),
  to_agency_id UUID NOT NULL REFERENCES agencies(id),
  from_member_id UUID REFERENCES members(id),
  to_member_id UUID REFERENCES members(id),
  match_score INT,
  status TEXT NOT NULL DEFAULT '검토중',
  workflow_step INT DEFAULT 0,
  visibility TEXT[] DEFAULT '{}',
  memo TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Messages (메시지)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  sender_name TEXT,
  sender_role TEXT DEFAULT 'me',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Verifications (인증)
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  type TEXT NOT NULL,
  status TEXT DEFAULT '대기',
  assignee_id UUID REFERENCES users(id),
  due_date DATE,
  file_urls TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Settlements (정산)
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id),
  partner_agency_id UUID REFERENCES agencies(id),
  pair_desc TEXT,
  stage TEXT,
  amount TEXT,
  split_ratio TEXT,
  due_date DATE,
  status TEXT DEFAULT '대기',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Disputes (분쟁)
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_agency_id UUID REFERENCES agencies(id),
  issue TEXT NOT NULL,
  level TEXT DEFAULT '주의',
  assignee_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Score Rules (점수 가중치)
CREATE TABLE score_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) UNIQUE,
  weights JSONB NOT NULL DEFAULT '[]',
  badge_thresholds JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Activity Log (활동 로그)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id),
  actor_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_members_agency ON members(agency_id);
CREATE INDEX idx_proposals_from ON proposals(from_agency_id);
CREATE INDEX idx_proposals_to ON proposals(to_agency_id);
CREATE INDEX idx_messages_proposal ON messages(proposal_id);
CREATE INDEX idx_verifications_member ON verifications(member_id);
CREATE INDEX idx_activity_log_agency ON activity_log(agency_id);

-- Row Level Security
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see data from their agency
CREATE POLICY "Users see own agency" ON users
  FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Members belong to agency" ON members
  FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Proposals visible to both sides" ON proposals
  FOR SELECT USING (
    from_agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
    OR to_agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Proposals insertable by sender" ON proposals
  FOR INSERT WITH CHECK (
    from_agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Messages visible via proposal" ON messages
  FOR ALL USING (
    proposal_id IN (
      SELECT id FROM proposals WHERE
        from_agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
        OR to_agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Verifications by agency" ON verifications
  FOR ALL USING (
    member_id IN (SELECT id FROM members WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Settlements visible to partner" ON settlements
  FOR ALL USING (
    partner_agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
    OR proposal_id IN (
      SELECT id FROM proposals WHERE from_agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Disputes by agency" ON disputes
  FOR ALL USING (
    partner_agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Score rules by agency" ON score_rules
  FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Activity log by agency" ON activity_log
  FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER verifications_updated_at BEFORE UPDATE ON verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER settlements_updated_at BEFORE UPDATE ON settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
