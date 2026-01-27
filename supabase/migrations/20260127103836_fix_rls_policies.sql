-- Home Heroes RLS Policies
-- Date: 2026-01-26
-- Migration: Row Level Security policies for all tables
-- IMPORTANT: Uses EXISTS pattern (not IN) for better performance and security

--------------------------------------------------------------------------------
-- ENABLE RLS ON ALL TABLES
--------------------------------------------------------------------------------

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_badges ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- FAMILIES POLICIES
--------------------------------------------------------------------------------

-- Parents can view their own family
CREATE POLICY "Parents can view their own family"
  ON families FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = families.id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- Parents can insert their family (during signup)
CREATE POLICY "Parents can create family"
  ON families FOR INSERT
  WITH CHECK (true); -- Will be restricted by family_members insert

-- Parents can update their own family
CREATE POLICY "Parents can update their own family"
  ON families FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = families.id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

--------------------------------------------------------------------------------
-- FAMILY_MEMBERS POLICIES
--------------------------------------------------------------------------------

-- Family members can view their family
CREATE POLICY "Family members can view their family"
  ON family_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
    )
  );

-- Parents can insert family members
CREATE POLICY "Parents can insert family members"
  ON family_members FOR INSERT
  WITH CHECK (
    -- Either creating themselves as parent, or they're already a parent in the family
    (role = 'parent' AND user_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- Parents can update family members
CREATE POLICY "Parents can update family members"
  ON family_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- Parents can delete family members (except themselves)
CREATE POLICY "Parents can delete family members"
  ON family_members FOR DELETE
  USING (
    user_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

--------------------------------------------------------------------------------
-- HEROES POLICIES
--------------------------------------------------------------------------------

-- Family members can view heroes in their family
CREATE POLICY "Family members can view heroes in their family"
  ON heroes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = heroes.family_member_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
      )
    )
  );

-- Parents can create heroes
CREATE POLICY "Parents can create heroes"
  ON heroes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = heroes.family_member_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
        AND fm2.role = 'parent'
      )
    )
  );

-- Parents can update heroes
CREATE POLICY "Parents can update heroes"
  ON heroes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = heroes.family_member_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
        AND fm2.role = 'parent'
      )
    )
  );

-- Parents can delete heroes
CREATE POLICY "Parents can delete heroes"
  ON heroes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = heroes.family_member_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
        AND fm2.role = 'parent'
      )
    )
  );

--------------------------------------------------------------------------------
-- TASKS POLICIES
--------------------------------------------------------------------------------

-- Family members can view their family tasks
CREATE POLICY "Family members can view their family tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = tasks.family_id
      AND fm.user_id = auth.uid()
    )
  );

-- Parents can create tasks
CREATE POLICY "Parents can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = tasks.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- Parents can update tasks
CREATE POLICY "Parents can update tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = tasks.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- Parents can delete tasks
CREATE POLICY "Parents can delete tasks"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = tasks.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

--------------------------------------------------------------------------------
-- QUESTS POLICIES
--------------------------------------------------------------------------------

-- Family members can view their family quests
CREATE POLICY "Family members can view their family quests"
  ON quests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = quests.family_id
      AND fm.user_id = auth.uid()
    )
  );

-- Parents can create quests
CREATE POLICY "Parents can create quests"
  ON quests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = quests.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- Parents can update quests
CREATE POLICY "Parents can update quests"
  ON quests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = quests.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- Parents can delete quests
CREATE POLICY "Parents can delete quests"
  ON quests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = quests.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

--------------------------------------------------------------------------------
-- QUEST_PARTICIPANTS POLICIES
--------------------------------------------------------------------------------

-- Family members can view quest participants for their family quests
CREATE POLICY "Family members can view quest participants"
  ON quest_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quests q
      INNER JOIN family_members fm ON fm.family_id = q.family_id
      WHERE q.id = quest_participants.quest_id
      AND fm.user_id = auth.uid()
    )
  );

-- Parents can add participants to quests
CREATE POLICY "Parents can add quest participants"
  ON quest_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quests q
      INNER JOIN family_members fm ON fm.family_id = q.family_id
      WHERE q.id = quest_participants.quest_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- Parents can update quest participants
CREATE POLICY "Parents can update quest participants"
  ON quest_participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM quests q
      INNER JOIN family_members fm ON fm.family_id = q.family_id
      WHERE q.id = quest_participants.quest_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- Parents can remove quest participants
CREATE POLICY "Parents can remove quest participants"
  ON quest_participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM quests q
      INNER JOIN family_members fm ON fm.family_id = q.family_id
      WHERE q.id = quest_participants.quest_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

--------------------------------------------------------------------------------
-- COMPLETIONS POLICIES
--------------------------------------------------------------------------------

-- Family members can view completions for their family
CREATE POLICY "Family members can view completions"
  ON completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE h.id = completions.hero_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
      )
    )
  );

-- Parents can insert completions
CREATE POLICY "Parents can insert completions"
  ON completions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE h.id = completions.hero_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
        AND fm2.role = 'parent'
      )
    )
  );

-- Parents can update completions (for corrections)
CREATE POLICY "Parents can update completions"
  ON completions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE h.id = completions.hero_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
        AND fm2.role = 'parent'
      )
    )
  );

-- Parents can delete completions (for corrections)
CREATE POLICY "Parents can delete completions"
  ON completions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE h.id = completions.hero_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
        AND fm2.role = 'parent'
      )
    )
  );

--------------------------------------------------------------------------------
-- XP_LOGS POLICIES
--------------------------------------------------------------------------------

-- Family members can view xp logs for their family heroes
CREATE POLICY "Family members can view xp logs"
  ON xp_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE h.id = xp_logs.hero_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
      )
    )
  );

-- XP logs are inserted via functions only (SECURITY DEFINER)
-- No direct insert policy needed

--------------------------------------------------------------------------------
-- BADGES POLICIES
--------------------------------------------------------------------------------

-- Anyone authenticated can view active badges
CREATE POLICY "Authenticated users can view active badges"
  ON badges FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

--------------------------------------------------------------------------------
-- HERO_BADGES POLICIES
--------------------------------------------------------------------------------

-- Family members can view hero badges for their family
CREATE POLICY "Family members can view hero badges"
  ON hero_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE h.id = hero_badges.hero_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
      )
    )
  );

-- Parents can award badges
CREATE POLICY "Parents can award badges"
  ON hero_badges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE h.id = hero_badges.hero_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
        AND fm2.role = 'parent'
      )
    )
  );

-- Parents can remove badges (for corrections)
CREATE POLICY "Parents can remove badges"
  ON hero_badges FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE h.id = hero_badges.hero_id
      AND EXISTS (
        SELECT 1 FROM family_members fm2
        WHERE fm2.family_id = fm.family_id
        AND fm2.user_id = auth.uid()
        AND fm2.role = 'parent'
      )
    )
  );
