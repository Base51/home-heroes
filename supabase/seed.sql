-- Home Heroes - Local Development Seed Data
-- This file is automatically loaded when you run: supabase db reset

-- Clean existing data (for reset)
TRUNCATE hero_badges, xp_logs, completions, quest_participants, quests, tasks, heroes, family_members, families, badges CASCADE;

-- ============================================================================
-- TEST FAMILY 1: Complete family with parent and 2 kids
-- ============================================================================

-- Family
INSERT INTO families (id, name, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'The Test Family', NOW() - INTERVAL '30 days');

-- Family Members (Note: These are NOT auth users, just family member records)
INSERT INTO family_members (id, family_id, user_id, role, display_name, created_at) VALUES
  -- Parent (user_id would be from auth.users in production)
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NULL, 'parent', 'Mom', NOW() - INTERVAL '30 days'),
  -- Kids (never have user_id)
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NULL, 'kid', 'Alex', NOW() - INTERVAL '25 days'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NULL, 'kid', 'Jamie', NOW() - INTERVAL '25 days');

-- Heroes (gamified profiles)
INSERT INTO heroes (id, family_member_id, hero_name, hero_type, level, total_xp, current_streak, created_at) VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Super Mom', 'super_mommy', 5, 1250, 7, NOW() - INTERVAL '30 days'),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Thunder Kid', 'kid_male', 3, 450, 5, NOW() - INTERVAL '25 days'),
  ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Star Ranger', 'kid_female', 4, 720, 3, NOW() - INTERVAL '25 days');

-- Tasks
INSERT INTO tasks (id, family_id, title, description, xp_reward, frequency, is_active, created_by_member_id, created_at) VALUES
  -- Daily tasks
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Make Your Bed', 'Make your bed in the morning', 10, 'daily', true, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Brush Teeth', 'Brush teeth morning and night', 5, 'daily', true, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Do Homework', 'Complete daily homework assignments', 20, 'daily', true, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 days'),
  -- Weekly tasks
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Clean Room', 'Fully clean and organize your room', 50, 'weekly', true, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Help with Laundry', 'Sort and fold laundry', 30, 'weekly', true, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 days'),
  -- One-time tasks
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'Read a Book', 'Read any book for 30 minutes', 15, 'once', true, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '10 days');

-- Quests (collaborative missions)
INSERT INTO quests (id, family_id, title, description, xp_reward_per_participant, min_participants, is_completed, created_by_member_id, created_at) VALUES
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 
   'Family Clean-Up Day', 
   'Everyone helps clean the house together', 
   100, 2, false, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '5 days'),
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111',
   'Movie Night Prep',
   'Prepare snacks and set up for family movie night',
   50, 2, false, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '2 days');

-- Quest Participants
INSERT INTO quest_participants (quest_id, hero_id, has_completed, completed_at) VALUES
  ('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', true, NOW() - INTERVAL '4 days'),
  ('99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', true, NOW() - INTERVAL '4 days'),
  ('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', false, NULL);

-- Task Completions (recent history)
INSERT INTO completions (id, hero_id, task_id, completed_at, xp_earned) VALUES
  -- Alex's completions
  ('c1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 day', 10),
  ('c2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '1 day', 5),
  ('c3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '1 day', 20),
  -- Jamie's completions
  ('c4444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 day', 10),
  ('c5555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() - INTERVAL '3 days', 50),
  -- Mom's completions
  ('c6666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NOW() - INTERVAL '2 days', 30);

-- XP Logs (matches completions)
INSERT INTO xp_logs (hero_id, xp_amount, source_type, source_id, created_at) VALUES
  -- Alex
  ('66666666-6666-6666-6666-666666666666', 10, 'task', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 day'),
  ('66666666-6666-6666-6666-666666666666', 5, 'task', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '1 day'),
  ('66666666-6666-6666-6666-666666666666', 20, 'task', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '1 day'),
  -- Jamie
  ('77777777-7777-7777-7777-777777777777', 10, 'task', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 day'),
  ('77777777-7777-7777-7777-777777777777', 50, 'task', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() - INTERVAL '3 days'),
  -- Mom
  ('55555555-5555-5555-5555-555555555555', 30, 'task', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NOW() - INTERVAL '2 days');

-- Badges
INSERT INTO badges (id, name, description, icon_url, unlock_criteria, is_active) VALUES
  ('b0000001-0001-0001-0001-000000000001', 'First Step', 'Complete your first task', '🎯', '{"type": "tasks_completed", "count": 1}'::jsonb, true),
  ('b0000002-0002-0002-0002-000000000002', 'Streak Starter', 'Maintain a 3-day streak', '🔥', '{"type": "streak_days", "count": 3}'::jsonb, true),
  ('b0000003-0003-0003-0003-000000000003', 'Task Master', 'Complete 10 tasks', '⭐', '{"type": "tasks_completed", "count": 10}'::jsonb, true),
  ('b0000004-0004-0004-0004-000000000004', 'Team Player', 'Complete a quest', '🤝', '{"type": "quests_completed", "count": 1}'::jsonb, true),
  ('b0000005-0005-0005-0005-000000000005', 'Level Up!', 'Reach level 5', '🚀', '{"type": "level_reached", "level": 5}'::jsonb, true);

-- Hero Badges (awarded badges)
INSERT INTO hero_badges (hero_id, badge_id, unlocked_at) VALUES
  -- Alex's badges
  ('66666666-6666-6666-6666-666666666666', 'b0000001-0001-0001-0001-000000000001', NOW() - INTERVAL '20 days'),
  ('66666666-6666-6666-6666-666666666666', 'b0000002-0002-0002-0002-000000000002', NOW() - INTERVAL '15 days'),
  ('66666666-6666-6666-6666-666666666666', 'b0000004-0004-0004-0004-000000000004', NOW() - INTERVAL '4 days'),
  -- Jamie's badges  
  ('77777777-7777-7777-7777-777777777777', 'b0000001-0001-0001-0001-000000000001', NOW() - INTERVAL '20 days'),
  ('77777777-7777-7777-7777-777777777777', 'b0000002-0002-0002-0002-000000000002', NOW() - INTERVAL '12 days'),
  -- Mom's badges
  ('55555555-5555-5555-5555-555555555555', 'b0000001-0001-0001-0001-000000000001', NOW() - INTERVAL '30 days'),
  ('55555555-5555-5555-5555-555555555555', 'b0000002-0002-0002-0002-000000000002', NOW() - INTERVAL '23 days'),
  ('55555555-5555-5555-5555-555555555555', 'b0000003-0003-0003-0003-000000000003', NOW() - INTERVAL '18 days'),
  ('55555555-5555-5555-5555-555555555555', 'b0000004-0004-0004-0004-000000000004', NOW() - INTERVAL '4 days'),
  ('55555555-5555-5555-5555-555555555555', 'b0000005-0005-0005-0005-000000000005', NOW() - INTERVAL '10 days');

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✓ Seed data loaded successfully!';
  RAISE NOTICE '  - 1 test family with 3 members';
  RAISE NOTICE '  - 6 tasks (daily, weekly, once)';
  RAISE NOTICE '  - 2 quests (1 in progress, 1 pending)';
  RAISE NOTICE '  - Recent completions and XP logs';
  RAISE NOTICE '  - 5 badges with awards';
  RAISE NOTICE '';
  RAISE NOTICE 'Test in Studio: http://127.0.0.1:54323';
END $$;
