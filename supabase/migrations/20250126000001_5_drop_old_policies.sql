-- Drop all existing policies to avoid conflicts

-- families
DROP POLICY IF EXISTS "Parents can view their own family" ON families;
DROP POLICY IF EXISTS "Parents can create family" ON families;
DROP POLICY IF EXISTS "Parents can update their own family" ON families;

-- family_members
DROP POLICY IF EXISTS "Family members can view their family" ON family_members;
DROP POLICY IF EXISTS "Parents can insert family members" ON family_members;
DROP POLICY IF EXISTS "Parents can update family members" ON family_members;
DROP POLICY IF EXISTS "Parents can delete family members" ON family_members;

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
