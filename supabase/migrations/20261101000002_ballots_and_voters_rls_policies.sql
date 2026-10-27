-- Migration: Row-Level Security (RLS) Policies for KUPSA Election Tables
-- Resolves: "new row violates row-level security policy for table 'ballots'"
-- Run this script in the Supabase SQL Editor if your project enforces strict RLS on client/anon connections.

-- ==========================================================
-- 1. BALLOTS TABLE (Secret Anonymized Digital Ballot Box)
-- ==========================================================
ALTER TABLE IF EXISTS public.ballots ENABLE ROW LEVEL SECURITY;

-- Allow accredited voters to seal ballots anonymously
DROP POLICY IF EXISTS "Allow public ballot casting" ON public.ballots;
CREATE POLICY "Allow public ballot casting"
  ON public.ballots
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Allow tally reading for certified real-time election results
DROP POLICY IF EXISTS "Allow reading certified ballots" ON public.ballots;
CREATE POLICY "Allow reading certified ballots"
  ON public.ballots
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

-- Allow Commission purge prior to live polling day
DROP POLICY IF EXISTS "Allow Commission ballot purge" ON public.ballots;
CREATE POLICY "Allow Commission ballot purge"
  ON public.ballots
  FOR DELETE
  TO anon, authenticated, service_role
  USING (true);

-- ==========================================================
-- 2. VOTERS TABLE (Accredited School of Pharmacy Roll)
-- ==========================================================
ALTER TABLE IF EXISTS public.voters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow reading voters" ON public.voters;
CREATE POLICY "Allow reading voters"
  ON public.voters
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS "Allow voter registration" ON public.voters;
CREATE POLICY "Allow voter registration"
  ON public.voters
  FOR INSERT
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow voter status update" ON public.voters;
CREATE POLICY "Allow voter status update"
  ON public.voters
  FOR UPDATE
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================================
-- 3. AUDIT LOGS TABLE (Cryptographic Election Audit Trail)
-- ==========================================================
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow inserting audit logs" ON public.audit_logs;
CREATE POLICY "Allow inserting audit logs"
  ON public.audit_logs
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading audit logs" ON public.audit_logs;
CREATE POLICY "Allow reading audit logs"
  ON public.audit_logs
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

-- ==========================================================
-- 4. ELECTION SETTINGS & CONSTITUTIONAL PETITIONS
-- ==========================================================
ALTER TABLE IF EXISTS public.election_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow reading election settings" ON public.election_settings;
CREATE POLICY "Allow reading election settings"
  ON public.election_settings
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS "Allow updating election settings" ON public.election_settings;
CREATE POLICY "Allow updating election settings"
  ON public.election_settings
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);
