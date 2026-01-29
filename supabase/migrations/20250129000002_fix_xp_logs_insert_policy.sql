-- Migration: Add INSERT policy for xp_logs
-- This fixes the 403 Forbidden error when completing tasks

-- Parents can insert XP logs for heroes in their family
CREATE POLICY "Parents can insert xp logs"
  ON xp_logs FOR INSERT
  WITH CHECK (
    hero_id IN (
      SELECT h.id FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );
