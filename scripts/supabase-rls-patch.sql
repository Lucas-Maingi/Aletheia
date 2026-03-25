-- Phase 110: Aletheia Supabase RLS Lockdown
-- This script secures tables against anonymous PostgREST Data API access.
-- Since the Next.js backend uses Prisma (superuser), it bypasses RLS and will continue to function normally.

-- 1. Enable Row Level Security (RLS) on the vulnerable tables
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_alerts ENABLE ROW LEVEL SECURITY;

-- 2. Create explicit Deny-All policies
-- This prevents any reads or writes via the auto-generated API endpoints
CREATE POLICY "Deny all access to PostgREST API for feedback" 
ON public.feedback 
FOR ALL 
USING (false);

CREATE POLICY "Deny all access to PostgREST API for watchlists" 
ON public.watchlists 
FOR ALL 
USING (false);

CREATE POLICY "Deny all access to PostgREST API for watchlist_alerts" 
ON public.watchlist_alerts 
FOR ALL 
USING (false);
