-- Fix missing heroes for existing family members
-- Run this in Supabase Studio SQL Editor: http://127.0.0.1:54323

-- First, check which family members are missing heroes
SELECT 
  fm.id as member_id,
  fm.display_name,
  fm.role,
  f.name as family_name,
  h.id as hero_id
FROM family_members fm
JOIN families f ON f.id = fm.family_id
LEFT JOIN heroes h ON h.family_member_id = fm.id
ORDER BY f.name, fm.created_at;

-- Create heroes for family members that don't have one
INSERT INTO heroes (family_member_id, hero_name, hero_type)
SELECT 
  fm.id,
  fm.display_name,  -- Use display_name as hero_name
  CASE 
    WHEN fm.role = 'parent' THEN 'super_mommy'  -- Default parent to super_mommy
    ELSE 'kid_male'  -- Default kid to kid_male
  END as hero_type
FROM family_members fm
LEFT JOIN heroes h ON h.family_member_id = fm.id
WHERE h.id IS NULL;

-- Verify heroes were created
SELECT 
  fm.id as member_id,
  fm.display_name,
  fm.role,
  h.id as hero_id,
  h.hero_name,
  h.hero_type,
  h.level,
  h.total_xp
FROM family_members fm
JOIN families f ON f.id = fm.family_id
LEFT JOIN heroes h ON h.family_member_id = fm.id
ORDER BY f.name, fm.created_at;
