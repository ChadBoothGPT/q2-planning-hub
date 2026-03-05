-- Q2 Planning Hub — Supabase Schema Setup
-- Run this once in your Supabase dashboard: SQL Editor → New Query → Paste → Run

-- Rock Reviews
CREATE TABLE IF NOT EXISTS rock_reviews (
  id TEXT PRIMARY KEY,
  rock_id TEXT NOT NULL,
  reviewer TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('hit', 'partially', 'missed')),
  key_takeaway TEXT NOT NULL DEFAULT '',
  carry_forward BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rock_id, reviewer)
);

-- Rock Proposals
CREATE TABLE IF NOT EXISTS rock_proposals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pillar TEXT NOT NULL,
  owner TEXT NOT NULL,
  proposed_by TEXT NOT NULL,
  definition_of_done TEXT NOT NULL DEFAULT '',
  milestones JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'needs-discussion', 'parked')),
  source TEXT NOT NULL CHECK (source IN ('new', 'carry-forward')),
  source_rock_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Commitments
CREATE TABLE IF NOT EXISTS ai_commitments (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL UNIQUE CHECK (department IN ('finance', 'people-ta', 'people-hr')),
  department_lead TEXT NOT NULL DEFAULT '',
  champion_names TEXT NOT NULL DEFAULT '',
  workflows JSONB NOT NULL DEFAULT '[]',
  capacity_hours_per_week INTEGER NOT NULL DEFAULT 0,
  support_needed TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Planning Notes
CREATE TABLE IF NOT EXISTS planning_notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('action-item', 'decision', 'parking-lot')),
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: Pre-completed Q1 rock reviews
INSERT INTO rock_reviews (id, rock_id, reviewer, outcome, key_takeaway, carry_forward, created_at, updated_at)
VALUES
  ('review-seed-1', 'rock-9', 'Chad', 'hit', 'AI governance policies established and rolled out across the organization.', false, NOW(), NOW()),
  ('review-seed-2', 'rock-10', 'Jen', 'hit', 'MS IT pilot successfully completed.', false, NOW(), NOW())
ON CONFLICT (rock_id, reviewer) DO NOTHING;
