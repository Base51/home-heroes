-- Home Heroes RLS Fix for Infinite Recursion
-- Date: 2026-02-13
-- Migration: Fix infinite recursion in family_members INSERT policy
-- Issue: The INSERT policy queries family_members to check if user is a parent,
--        which triggers the SELECT policy, causing infinite recursion
-- Fix: Add created_by column to families table to track ownership without recursion

--------------------------------------------------------------------------------
-- ADD CREATED_BY COLUMN TO FAMILIES
--------------------------------------------------------------------------------

-- Add created_by column to track which user created the family
ALTER TABLE families ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_families_created_by ON families(created_by);

--------------------------------------------------------------------------------
-- FIX FAMILY_MEMBERS POLICIES
--------------------------------------------------------------------------------

-- Drop all existing family_members policies to start fresh
DROP POLICY IF EXISTS "Parents can insert family members" ON family_members;
DROP POLICY IF EXISTS "Users can view their own family member record" ON family_members;
DROP POLICY IF EXISTS "Parents can update family members" ON family_members;
DROP POLICY IF EXISTS "Parents can delete family members" ON family_members;

-- SELECT policy: Users can view family members in families they belong to
-- This uses families table to avoid recursion
CREATE POLICY "Users can view family members"
  ON family_members FOR SELECT
  USING (
    -- Can view if user_id matches (for parents viewing their own record)
    user_id = (SELECT auth.uid())
    OR
    -- Can view kids (user_id IS NULL) in families the user owns
    (user_id IS NULL AND family_id IN (
      SELECT id FROM families WHERE created_by = (SELECT auth.uid())
    ))
    OR
    -- Can view other family members in families the user created
    family_id IN (
      SELECT id FROM families WHERE created_by = (SELECT auth.uid())
    )
  );

-- INSERT policy: Split into two separate cases to avoid recursion
-- Case 1: Parent inserting themselves - no need to check family_members
CREATE POLICY "Parents can insert themselves"
  ON family_members FOR INSERT
  WITH CHECK (
    role = 'parent' 
    AND user_id = (SELECT auth.uid())
    -- Verify this family was created by this user (using families table, not family_members)
    AND family_id IN (
      SELECT id FROM families WHERE created_by = (SELECT auth.uid())
    )
  );

-- Case 2: Parent inserting a kid - check family ownership via families table
CREATE POLICY "Parents can insert kids"
  ON family_members FOR INSERT
  WITH CHECK (
    role = 'kid'
    AND user_id IS NULL
    -- Verify the family was created by this user
    AND family_id IN (
      SELECT id FROM families WHERE created_by = (SELECT auth.uid())
    )
  );

-- UPDATE policy: Use families table to check ownership
CREATE POLICY "Parents can update family members"
  ON family_members FOR UPDATE
  USING (
    family_id IN (
      SELECT id FROM families WHERE created_by = (SELECT auth.uid())
    )
  );

-- DELETE policy: Use families table to check ownership, prevent self-delete
CREATE POLICY "Parents can delete family members"
  ON family_members FOR DELETE
  USING (
    user_id IS DISTINCT FROM (SELECT auth.uid())  -- Can't delete yourself
    AND family_id IN (
      SELECT id FROM families WHERE created_by = (SELECT auth.uid())
    )
  );

--------------------------------------------------------------------------------
-- FIX FAMILIES POLICIES (use created_by for simpler ownership check)
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Parents can view their own family" ON families;
DROP POLICY IF EXISTS "Parents can create family" ON families;
DROP POLICY IF EXISTS "Parents can update their own family" ON families;

-- SELECT: Users can view families they created
CREATE POLICY "Parents can view their own family"
  ON families FOR SELECT
  USING (
    created_by = (SELECT auth.uid())
    OR
    -- Allow viewing just-created families (created in last 10 seconds) for immediate access
    created_at > (now() - interval '10 seconds')
  );

-- INSERT: Authenticated users can create families (must set created_by = their user id)
CREATE POLICY "Parents can create family"
  ON families FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND created_by = (SELECT auth.uid())
  );

-- UPDATE: Users can update families they created
CREATE POLICY "Parents can update their own family"
  ON families FOR UPDATE
  USING (
    created_by = (SELECT auth.uid())
  );