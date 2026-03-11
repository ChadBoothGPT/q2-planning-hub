-- Add department_name column to ai_commitments for custom department persistence
-- Apply to BOTH staging and production Supabase projects
ALTER TABLE ai_commitments ADD COLUMN IF NOT EXISTS department_name TEXT DEFAULT '';
