-- Home Heroes - Clean Seed Data
-- This file seeds ONLY system data (badges), NOT test user data
-- User data is created through the onboarding flow

-- Clean existing data (for reset)
TRUNCATE hero_badges, xp_logs, completions, quest_participants, quests, tasks, heroes, family_members, families, badges CASCADE;

-- ============================================================================
-- BADGES (System Data - Required for the app to work)
-- ============================================================================
INSERT INTO badges (id, name, description, icon_url, unlock_criteria, is_active, display_order) VALUES
  -- Task Completion Badges
  ('b0000001-0001-0001-0001-000000000001', 'First Step', 'Complete your first task', '🎯', '{"type": "tasks_completed", "count": 1}'::jsonb, true, 1),
  ('b0000002-0002-0002-0002-000000000002', 'Task Enthusiast', 'Complete 10 tasks', '⭐', '{"type": "tasks_completed", "count": 10}'::jsonb, true, 2),
  ('b0000003-0003-0003-0003-000000000003', 'Task Master', 'Complete 50 tasks', '🏆', '{"type": "tasks_completed", "count": 50}'::jsonb, true, 3),
  ('b0000004-0004-0004-0004-000000000004', 'Task Legend', 'Complete 100 tasks', '👑', '{"type": "tasks_completed", "count": 100}'::jsonb, true, 4),
  
  -- Streak Badges
  ('b0000005-0005-0005-0005-000000000005', 'Streak Starter', 'Maintain a 3-day streak', '🔥', '{"type": "streak_days", "count": 3}'::jsonb, true, 5),
  ('b0000006-0006-0006-0006-000000000006', 'On Fire', 'Maintain a 7-day streak', '🔥', '{"type": "streak_days", "count": 7}'::jsonb, true, 6),
  ('b0000007-0007-0007-0007-000000000007', 'Unstoppable', 'Maintain a 14-day streak', '🔥', '{"type": "streak_days", "count": 14}'::jsonb, true, 7),
  ('b0000008-0008-0008-0008-000000000008', 'Legendary Streak', 'Maintain a 30-day streak', '🔥', '{"type": "streak_days", "count": 30}'::jsonb, true, 8),
  
  -- XP Badges
  ('b0000009-0009-0009-0009-000000000009', 'XP Starter', 'Earn 100 XP', '💎', '{"type": "xp_earned", "amount": 100}'::jsonb, true, 9),
  ('b0000010-0010-0010-0010-000000000010', 'XP Hunter', 'Earn 500 XP', '💠', '{"type": "xp_earned", "amount": 500}'::jsonb, true, 10),
  ('b0000011-0011-0011-0011-000000000011', 'XP Master', 'Earn 1000 XP', '🔷', '{"type": "xp_earned", "amount": 1000}'::jsonb, true, 11),
  ('b0000012-0012-0012-0012-000000000012', 'XP Legend', 'Earn 5000 XP', '🌀', '{"type": "xp_earned", "amount": 5000}'::jsonb, true, 12),
  
  -- Level Badges
  ('b0000013-0013-0013-0013-000000000013', 'Level 5', 'Reach level 5', '🚀', '{"type": "level_reached", "level": 5}'::jsonb, true, 13),
  ('b0000014-0014-0014-0014-000000000014', 'Level 10', 'Reach level 10', '🌟', '{"type": "level_reached", "level": 10}'::jsonb, true, 14),
  
  -- Quest Badges
  ('b0000015-0015-0015-0015-000000000015', 'Team Player', 'Complete your first quest', '🤝', '{"type": "quests_completed", "count": 1}'::jsonb, true, 15),
  ('b0000016-0016-0016-0016-000000000016', 'Quest Master', 'Complete 5 quests', '⚔️', '{"type": "quests_completed", "count": 5}'::jsonb, true, 16);

-- ============================================================================
-- CONFIRMATION
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database seeded with badges only (no test data)';
  RAISE NOTICE '   Go to http://localhost:3000/onboarding to create your family';
END $$;
