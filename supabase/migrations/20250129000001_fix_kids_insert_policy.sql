-- Migration: Allow parents to insert kids into their family
-- This fixes the RLS policy that was blocking kid creation during onboarding

-- Drop the existing insert policy (it only allows parents to insert themselves)
DROP POLICY IF EXISTS "Parents can insert themselves" ON family_members;

-- Create a new policy that allows parents to:
-- 1. Insert themselves during signup (role = 'parent' AND user_id = auth.uid())
-- 2. Insert kids into their family (role = 'kid' AND user_id IS NULL)
CREATE POLICY "Parents can insert family members"
  ON family_members FOR INSERT
  WITH CHECK (
    -- Case 1: Parent inserting themselves during initial signup
    (role = 'parent' AND user_id = auth.uid())
    OR
    -- Case 2: Parent inserting a kid into their own family
    (
      role = 'kid' 
      AND user_id IS NULL
      AND EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.family_id = family_id
          AND family_members.user_id = auth.uid()
          AND family_members.role = 'parent'
      )
    )
  );
