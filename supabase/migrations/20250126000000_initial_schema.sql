-- Home Heroes Database Schema
-- Core Principle: Separate real people (family_members) from gamified profiles (heroes)
-- Date: 2026-01-26
-- Migration: Initial schema creation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- FAMILIES
--------------------------------------------------------------------------------
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE families IS 'Represents a household unit';

--------------------------------------------------------------------------------
-- FAMILY_MEMBERS (Real People)
--------------------------------------------------------------------------------
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for kids
  role TEXT NOT NULL CHECK (role IN ('parent', 'kid')),
  display_name TEXT NOT NULL,
  pin_code TEXT, -- For kid access on shared devices (hashed)
  date_of_birth DATE, -- Optional, for age-appropriate features
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, user_id) -- Parent can only be in family once
);

COMMENT ON TABLE family_members IS 'Represents real people (parents and kids). Kids have NULL user_id.';
COMMENT ON COLUMN family_members.user_id IS 'NULL for kids - only parents authenticate';
COMMENT ON COLUMN family_members.role IS 'parent or kid - determines access level';

-- Indexes
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_family_members_role ON family_members(role);

--------------------------------------------------------------------------------
-- HEROES (Gamified Profiles)
--------------------------------------------------------------------------------
CREATE TABLE heroes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  hero_name TEXT NOT NULL,
  hero_type TEXT NOT NULL CHECK (hero_type IN ('super_mommy', 'super_daddy', 'kid_male', 'kid_female')),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  avatar_url TEXT, -- Optional custom avatar
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_member_id) -- One hero per family member in MVP
);

COMMENT ON TABLE heroes IS 'Gamified profiles for family members. Separate from real people.';
COMMENT ON COLUMN heroes.hero_type IS 'Visual representation type for the hero';
COMMENT ON COLUMN heroes.total_xp IS 'Cumulative XP earned across all activities';
COMMENT ON COLUMN heroes.current_streak IS 'Current consecutive days of activity';

-- Indexes
CREATE INDEX idx_heroes_family_member_id ON heroes(family_member_id);
CREATE INDEX idx_heroes_level ON heroes(level);
CREATE INDEX idx_heroes_is_active ON heroes(is_active);

--------------------------------------------------------------------------------
-- TASKS
--------------------------------------------------------------------------------
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 10 CHECK (xp_reward >= 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly', 'custom')),
  custom_schedule JSONB, -- For custom frequencies
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_member_id UUID NOT NULL REFERENCES family_members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tasks IS 'Individual tasks created by parents';
COMMENT ON COLUMN tasks.xp_reward IS 'Base XP awarded upon completion (before multipliers)';
COMMENT ON COLUMN tasks.frequency IS 'How often the task can/should be completed';

-- Indexes
CREATE INDEX idx_tasks_family_id ON tasks(family_id);
CREATE INDEX idx_tasks_is_active ON tasks(is_active);
CREATE INDEX idx_tasks_frequency ON tasks(frequency);

--------------------------------------------------------------------------------
-- QUESTS (Group Activities)
--------------------------------------------------------------------------------
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward_per_participant INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward_per_participant >= 0),
  min_participants INTEGER NOT NULL DEFAULT 2 CHECK (min_participants >= 1),
  max_participants INTEGER CHECK (max_participants IS NULL OR max_participants >= min_participants),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by_member_id UUID NOT NULL REFERENCES family_members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quests IS 'Group activities where multiple heroes earn XP';
COMMENT ON COLUMN quests.xp_reward_per_participant IS 'XP each participating hero receives';
COMMENT ON COLUMN quests.min_participants IS 'Minimum heroes required to complete quest';

-- Indexes
CREATE INDEX idx_quests_family_id ON quests(family_id);
CREATE INDEX idx_quests_is_completed ON quests(is_completed);
CREATE INDEX idx_quests_expires_at ON quests(expires_at) WHERE expires_at IS NOT NULL;

--------------------------------------------------------------------------------
-- QUEST_PARTICIPANTS
--------------------------------------------------------------------------------
CREATE TABLE quest_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  has_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(quest_id, hero_id)
);

COMMENT ON TABLE quest_participants IS 'Tracks which heroes are participating in quests';

-- Indexes
CREATE INDEX idx_quest_participants_quest_id ON quest_participants(quest_id);
CREATE INDEX idx_quest_participants_hero_id ON quest_participants(hero_id);
CREATE INDEX idx_quest_participants_completed ON quest_participants(has_completed);

--------------------------------------------------------------------------------
-- COMPLETIONS (Task Completions)
--------------------------------------------------------------------------------
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE completions IS 'Records of task completions with XP earned';
COMMENT ON COLUMN completions.xp_earned IS 'Actual XP earned (may include multipliers)';

-- Indexes
CREATE INDEX idx_completions_task_id ON completions(task_id);
CREATE INDEX idx_completions_hero_id ON completions(hero_id);
CREATE INDEX idx_completions_completed_at ON completions(completed_at DESC);

--------------------------------------------------------------------------------
-- XP_LOGS (Audit Trail)
--------------------------------------------------------------------------------
CREATE TABLE xp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('task', 'quest', 'bonus', 'adjustment')),
  source_id UUID, -- References task_id, quest_id, etc.
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE xp_logs IS 'Immutable audit log of all XP changes';

-- Indexes
CREATE INDEX idx_xp_logs_hero_id ON xp_logs(hero_id);
CREATE INDEX idx_xp_logs_created_at ON xp_logs(created_at DESC);
CREATE INDEX idx_xp_logs_source ON xp_logs(source_type, source_id);

--------------------------------------------------------------------------------
-- BADGES
--------------------------------------------------------------------------------
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  unlock_criteria JSONB NOT NULL, -- Flexible criteria definition
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE badges IS 'Badge definitions with extensible unlock criteria';
COMMENT ON COLUMN badges.unlock_criteria IS 'JSONB defining how to unlock (type, count, etc.)';

-- Indexes
CREATE INDEX idx_badges_is_active ON badges(is_active);
CREATE INDEX idx_badges_display_order ON badges(display_order);

--------------------------------------------------------------------------------
-- HERO_BADGES (Unlocked Badges)
--------------------------------------------------------------------------------
CREATE TABLE hero_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hero_id, badge_id)
);

COMMENT ON TABLE hero_badges IS 'Tracks which badges each hero has unlocked';

-- Indexes
CREATE INDEX idx_hero_badges_hero_id ON hero_badges(hero_id);
CREATE INDEX idx_hero_badges_badge_id ON hero_badges(badge_id);
CREATE INDEX idx_hero_badges_unlocked_at ON hero_badges(unlocked_at DESC);

--------------------------------------------------------------------------------
-- FUNCTIONS & TRIGGERS
--------------------------------------------------------------------------------

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Auto-updates updated_at column on row modification';

-- Apply to all tables with updated_at
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_heroes_updated_at BEFORE UPDATE ON heroes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to award XP and update hero
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
BEGIN
  -- Calculate new total XP
  SELECT total_xp + p_xp_amount INTO v_new_total_xp
  FROM heroes WHERE id = p_hero_id;

  -- Simple level formula: level = floor(sqrt(total_xp) / 10) + 1
  -- Customize this formula as needed
  v_new_level := FLOOR(SQRT(v_new_total_xp) / 10) + 1;

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

COMMENT ON FUNCTION award_xp_to_hero IS 'Awards XP to hero, updates level, and logs transaction';

-- Function to update streak
CREATE OR REPLACE FUNCTION update_hero_streak(p_hero_id UUID)
RETURNS void AS $$
DECLARE
  v_last_activity_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity_date, v_current_streak, v_longest_streak
  FROM heroes
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
  UPDATE heroes
  SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_hero_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_hero_streak IS 'Updates hero streak based on last activity date';

--------------------------------------------------------------------------------
-- SEED DATA - Basic Badges
--------------------------------------------------------------------------------

INSERT INTO badges (name, description, icon_url, unlock_criteria, display_order) VALUES
  ('First Task', 'Complete your first task!', null, '{"type": "task_count", "count": 1}', 1),
  ('Task Master', 'Complete 10 tasks', null, '{"type": "task_count", "count": 10}', 2),
  ('Task Legend', 'Complete 100 tasks', null, '{"type": "task_count", "count": 100}', 3),
  ('Team Player', 'Complete your first quest', null, '{"type": "quest_count", "count": 1}', 4),
  ('Quest Hero', 'Complete 10 quests', null, '{"type": "quest_count", "count": 10}', 5),
  ('Week Warrior', 'Maintain a 7-day streak', null, '{"type": "streak", "days": 7}', 6),
  ('Month Champion', 'Maintain a 30-day streak', null, '{"type": "streak", "days": 30}', 7),
  ('Level 5', 'Reach level 5', null, '{"type": "level", "level": 5}', 8),
  ('Level 10', 'Reach level 10', null, '{"type": "level", "level": 10}', 9),
  ('XP Collector', 'Earn 1000 total XP', null, '{"type": "total_xp", "xp": 1000}', 10);
