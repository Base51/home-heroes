-- Home Heroes RLS Policies - FIXED
-- Date: 2026-01-26
-- Migration: Row Level Security policies with infinite recursion fix
-- IMPORTANT: Uses EXISTS pattern but avoids self-referencing in base policies

--------------------------------------------------------------------------------
-- DROP ALL OLD POLICIES FIRST
--------------------------------------------------------------------------------

-- families
DROP POLICY IF EXISTS "Parents can view their own family" ON families;
DROP POLICY IF EXISTS "Parents can create family" ON families;
DROP POLICY IF EXISTS "Parents can update their own family" ON families;

-- family_members
DROP POLICY IF EXISTS "Family members can view their family" ON family_members;
DROP POLICY IF EXISTS "Parents can insert family members" ON family_members;
DROP POLICY IF EXISTS "Parents can insert themselves" ON family_members;
DROP POLICY IF EXISTS "Parents can update family members" ON family_members;
DROP POLICY IF EXISTS "Parents can delete family members" ON family_members;
DROP POLICY IF EXISTS "Users can view their own family member record" ON family_members;

-- heroes
DROP POLICY IF EXISTS "Family members can view heroes in their family" ON heroes;
DROP POLICY IF EXISTS "Parents can create heroes" ON heroes;
DROP POLICY IF EXISTS "Parents can update heroes" ON heroes;
DROP POLICY IF EXISTS "Parents can delete heroes" ON heroes;

-- tasks
DROP POLICY IF EXISTS "Family members can view their family tasks" ON tasks;
DROP POLICY IF EXISTS "Parents can create tasks" ON tasks;
DROP POLICY IF EXISTS "Parents can update tasks" ON tasks;
DROP POLICY IF EXISTS "Parents can delete tasks" ON tasks;

-- quests
DROP POLICY IF EXISTS "Family members can view their family quests" ON quests;
DROP POLICY IF EXISTS "Parents can create quests" ON quests;
DROP POLICY IF EXISTS "Parents can update quests" ON quests;
DROP POLICY IF EXISTS "Parents can delete quests" ON quests;

-- quest_participants
DROP POLICY IF EXISTS "Family members can view quest participants" ON quest_participants;
DROP POLICY IF EXISTS "Parents can add quest participants" ON quest_participants;
DROP POLICY IF EXISTS "Parents can update quest participants" ON quest_participants;
DROP POLICY IF EXISTS "Parents can remove quest participants" ON quest_participants;

-- completions
DROP POLICY IF EXISTS "Family members can view completions" ON completions;
DROP POLICY IF EXISTS "Parents can insert completions" ON completions;
DROP POLICY IF EXISTS "Parents can update completions" ON completions;
DROP POLICY IF EXISTS "Parents can delete completions" ON completions;

-- xp_logs
DROP POLICY IF EXISTS "Family members can view xp logs" ON xp_logs;

-- badges
DROP POLICY IF EXISTS "Authenticated users can view active badges" ON badges;

-- hero_badges
DROP POLICY IF EXISTS "Family members can view hero badges" ON hero_badges;
DROP POLICY IF EXISTS "Parents can award badges" ON hero_badges;
DROP POLICY IF EXISTS "Parents can remove badges" ON hero_badges;

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

-- Parents can view their own family (allow viewing during creation)
CREATE POLICY "Parents can view their own family"
  ON families FOR SELECT
  USING (
    -- Allow viewing if you're a parent in this family
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'parent'
    )
    OR
    -- Allow viewing just-created families (created in last 10 seconds)
    created_at > (now() - interval '10 seconds')
  );

-- Parents can insert their family (during signup)
CREATE POLICY "Parents can create family"
  ON families FOR INSERT
  WITH CHECK (true);

-- Parents can update their own family
CREATE POLICY "Parents can update their own family"
  ON families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

--------------------------------------------------------------------------------
-- FAMILY_MEMBERS POLICIES (FIXED - No recursion)
--------------------------------------------------------------------------------

-- IMPORTANT: Use auth.uid() directly, not subqueries on family_members
CREATE POLICY "Users can view their own family member record"
  ON family_members FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Parents can insert themselves as parent during signup (no family check needed)
CREATE POLICY "Parents can insert themselves"
  ON family_members FOR INSERT
  WITH CHECK (
    role = 'parent' AND user_id = auth.uid()
  );

-- Parents can update family members in their family
CREATE POLICY "Parents can update family members"
  ON family_members FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

-- Parents can delete family members (except themselves)
CREATE POLICY "Parents can delete family members"
  ON family_members FOR DELETE
  USING (
    user_id != auth.uid()
    AND family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

--------------------------------------------------------------------------------
-- HEROES POLICIES
--------------------------------------------------------------------------------

-- Anyone in the family can view heroes
CREATE POLICY "Family members can view heroes in their family"
  ON heroes FOR SELECT
  USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Parents can create heroes
CREATE POLICY "Parents can create heroes"
  ON heroes FOR INSERT
  WITH CHECK (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

-- Parents can update heroes
CREATE POLICY "Parents can update heroes"
  ON heroes FOR UPDATE
  USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

-- Parents can delete heroes
CREATE POLICY "Parents can delete heroes"
  ON heroes FOR DELETE
  USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

--------------------------------------------------------------------------------
-- TASKS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Family members can view their family tasks"
  ON tasks FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

CREATE POLICY "Parents can update tasks"
  ON tasks FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

CREATE POLICY "Parents can delete tasks"
  ON tasks FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

--------------------------------------------------------------------------------
-- QUESTS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Family members can view their family quests"
  ON quests FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create quests"
  ON quests FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

CREATE POLICY "Parents can update quests"
  ON quests FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

CREATE POLICY "Parents can delete quests"
  ON quests FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

--------------------------------------------------------------------------------
-- QUEST_PARTICIPANTS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Family members can view quest participants"
  ON quest_participants FOR SELECT
  USING (
    quest_id IN (
      SELECT id FROM quests WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents can add quest participants"
  ON quest_participants FOR INSERT
  WITH CHECK (
    quest_id IN (
      SELECT id FROM quests WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

CREATE POLICY "Parents can update quest participants"
  ON quest_participants FOR UPDATE
  USING (
    quest_id IN (
      SELECT id FROM quests WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

CREATE POLICY "Parents can remove quest participants"
  ON quest_participants FOR DELETE
  USING (
    quest_id IN (
      SELECT id FROM quests WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

--------------------------------------------------------------------------------
-- COMPLETIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Family members can view completions"
  ON completions FOR SELECT
  USING (
    hero_id IN (
      SELECT h.id FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents can insert completions"
  ON completions FOR INSERT
  WITH CHECK (
    hero_id IN (
      SELECT h.id FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

CREATE POLICY "Parents can update completions"
  ON completions FOR UPDATE
  USING (
    hero_id IN (
      SELECT h.id FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

CREATE POLICY "Parents can delete completions"
  ON completions FOR DELETE
  USING (
    hero_id IN (
      SELECT h.id FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

--------------------------------------------------------------------------------
-- XP_LOGS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Family members can view xp logs"
  ON xp_logs FOR SELECT
  USING (
    hero_id IN (
      SELECT h.id FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

--------------------------------------------------------------------------------
-- BADGES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Authenticated users can view active badges"
  ON badges FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

--------------------------------------------------------------------------------
-- HERO_BADGES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Family members can view hero badges"
  ON hero_badges FOR SELECT
  USING (
    hero_id IN (
      SELECT h.id FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents can award badges"
  ON hero_badges FOR INSERT
  WITH CHECK (
    hero_id IN (
      SELECT h.id FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );

CREATE POLICY "Parents can remove badges"
  ON hero_badges FOR DELETE
  USING (
    hero_id IN (
      SELECT h.id FROM heroes h
      INNER JOIN family_members fm ON fm.id = h.family_member_id
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'
      )
    )
  );
