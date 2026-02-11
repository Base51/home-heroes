-- Fix level formula in award_xp_to_hero to match TypeScript levels.ts
-- Old formula: FLOOR(SQRT(total_xp) / 10) + 1
-- New formula: Same curve as app — XP threshold per level = FLOOR(50 * level^1.8)
-- Level is the highest level where FLOOR(50 * level^1.8) <= total_xp
-- Max level: 15

CREATE OR REPLACE FUNCTION award_xp_to_hero(
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
  v_max_level CONSTANT INTEGER := 15;
BEGIN
  -- Calculate new total XP
  SELECT total_xp + p_xp_amount INTO v_new_total_xp
  FROM heroes WHERE id = p_hero_id;

  -- Calculate level using same curve as TypeScript levels.ts:
  -- getXPForLevel(level) = FLOOR(50 * level^1.8)
  -- Find highest level where threshold <= total_xp
  v_new_level := 1;
  WHILE v_new_level < v_max_level AND v_new_total_xp >= FLOOR(50 * POWER(v_new_level + 1, 1.8)) LOOP
    v_new_level := v_new_level + 1;
  END LOOP;

  -- Update hero's total XP and level
  UPDATE heroes
  SET 
    total_xp = v_new_total_xp,
    level = v_new_level,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_hero_id;

  -- Log the XP gain
  INSERT INTO xp_logs (hero_id, xp_amount, source_type, source_id, reason)
  VALUES (p_hero_id, p_xp_amount, p_source_type, p_source_id, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_xp_to_hero IS 'Awards XP to hero, updates level using 50*level^1.8 curve, and logs transaction';
