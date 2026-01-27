-- Create Test User Account for Local Development
-- This links a test user to the existing test family data

-- Create test user in auth.users
-- Email: test@example.com
-- Password: password123
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'test@example.com',
  -- Password: password123 (bcrypt hash)
  '$2a$10$qKyhLw.wP6n7rR4sQJZFD.MZOLqQkHqXWqLqCJJJJJJJJJJJJJJJJ',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  'authenticated',
  'authenticated'
);

-- Create identity for the user
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-000000000001'::uuid,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001'::uuid,
  'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  jsonb_build_object('sub', 'aaaaaaaa-bbbb-cccc-dddd-000000000001', 'email', 'test@example.com'),
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- Link the test user to the parent family member in our test family
UPDATE family_members 
SET user_id = 'aaaaaaaa-bbbb-cccc-dddd-000000000001'::uuid
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✓ Test account created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Test Account Credentials:';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '  Email:    test@example.com';
  RAISE NOTICE '  Password: password123';
  RAISE NOTICE '';
  RAISE NOTICE 'This account is linked to:';
  RAISE NOTICE '  Family: The Test Family';
  RAISE NOTICE '  Hero: Super Mom (Level 5)';
  RAISE NOTICE '  Role: Parent';
  RAISE NOTICE '';
  RAISE NOTICE 'Login at: http://localhost:3000/login';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
