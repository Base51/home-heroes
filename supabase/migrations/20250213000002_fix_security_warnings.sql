-- Home Heroes Security Fixes
-- Date: 2026-02-13
-- Migration: Fix function search_path and overly permissive RLS policy
-- Issues addressed:
--   1. Functions with mutable search_path (security risk)
--   2. "Parents can create family" policy allows unrestricted access

--------------------------------------------------------------------------------
-- FIX FUNCTIONS WITH IMMUTABLE SEARCH_PATH
--------------------------------------------------------------------------------

-- Drop and recreate update_updated_at_column with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION public.update_updated_at_column IS 'Auto-updates updated_at column on row modification';

-- Drop and recreate award_xp_to_hero with secure search_path
CREATE OR REPLACE FUNCTION public.award_xp_to_hero(
  p_hero_id UUID,
  p_xp_amount INTEGER,
  p_source_type TEXT,
  p_source_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_new_total_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Calculate new total XP
  SELECT total_xp + p_xp_amount INTO v_new_total_xp
  FROM public.heroes WHERE id = p_hero_id;

  -- Simple level formula: level = floor(sqrt(total_xp) / 10) + 1
  v_new_level := FLOOR(SQRT(v_new_total_xp) / 10) + 1;

  -- Update hero's total XP and level
  UPDATE public.heroes
  SET 
    total_xp = v_new_total_xp,
    level = v_new_level,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_hero_id;

  -- Log the XP gain
  INSERT INTO public.xp_logs (hero_id, xp_amount, source_type, source_id, reason)
  VALUES (p_hero_id, p_xp_amount, p_source_type, p_source_id, p_reason);
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = '';

COMMENT ON FUNCTION public.award_xp_to_hero IS 'Awards XP to hero, updates level, and logs transaction';

-- Drop and recreate update_hero_streak with secure search_path
CREATE OR REPLACE FUNCTION public.update_hero_streak(p_hero_id UUID)
RETURNS void AS $$
DECLARE
  v_last_activity_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity_date, v_current_streak, v_longest_streak
  FROM public.heroes
  WHERE id = p_hero_id;

  -- If last activity was yesterday, increment streak
  IF v_last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  -- If last activity was today, keep streak
  ELSIF v_last_activity_date = CURRENT_DATE THEN
    -- Do nothing, streak already counted for today
    RETURN;
  -- Otherwise, reset streak to 1
  ELSE
    v_current_streak := 1;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Update hero
  UPDATE public.heroes
  SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_hero_id;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = '';

COMMENT ON FUNCTION public.update_hero_streak IS 'Updates hero streak based on last activity date';

--------------------------------------------------------------------------------
-- FIX OVERLY PERMISSIVE RLS POLICY FOR FAMILIES INSERT
--------------------------------------------------------------------------------

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Parents can create family" ON public.families;

-- Create a more restrictive policy that requires authentication
-- Users can only create families if they are authenticated
CREATE POLICY "Parents can create family"
  ON public.families FOR INSERT
  WITH CHECK (
    -- Must be authenticated to create a family
    (SELECT auth.uid()) IS NOT NULL
  );
