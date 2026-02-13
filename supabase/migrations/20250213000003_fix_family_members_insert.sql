-- Home Heroes RLS Fix for Family Members Insert
-- Date: 2026-02-13
-- Migration: Fix the INSERT policy for family_members that had ambiguous column reference
-- Issue: In the EXISTS subquery, both family_id references resolved to the subquery table
--        instead of comparing the subquery's family_id to the NEW row's family_id
-- Fix: Use IN subquery instead of EXISTS to avoid self-referencing column ambiguity

--------------------------------------------------------------------------------
-- FIX FAMILY_MEMBERS INSERT POLICY
--------------------------------------------------------------------------------

-- Drop the broken policy
DROP POLICY IF EXISTS "Parents can insert family members" ON family_members;

-- Recreate using IN subquery pattern which avoids the column ambiguity issue
-- The IN clause evaluates family_id from the row being inserted against the subquery results
CREATE POLICY "Parents can insert family members"
  ON family_members FOR INSERT
  WITH CHECK (
    -- Case 1: Parent inserting themselves during initial signup
    (role = 'parent' AND user_id = (SELECT auth.uid()))
    OR
    -- Case 2: Parent inserting a kid into their own family
    -- Using IN instead of EXISTS to avoid column name collision
    (
      role = 'kid' 
      AND user_id IS NULL
      AND family_id IN (
        SELECT fm.family_id FROM family_members AS fm
        WHERE fm.user_id = (SELECT auth.uid())
          AND fm.role = 'parent'
      )
    )
  );
