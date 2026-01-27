-- Link test user to existing test family
-- Run this in Supabase Studio SQL Editor: http://127.0.0.1:54323

UPDATE family_members 
SET user_id = '22ab57c1-3b6d-4ddf-8a9b-058e1bde15ae'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Verify the link
SELECT 
  fm.id,
  fm.display_name,
  fm.role,
  fm.user_id,
  f.name as family_name
FROM family_members fm
JOIN families f ON f.id = fm.family_id
WHERE fm.user_id = '22ab57c1-3b6d-4ddf-8a9b-058e1bde15ae';
