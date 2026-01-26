-- GDPR Account Deletion Function
-- Date: 2026-01-26
-- Purpose: Allow users to delete all their data and account

--------------------------------------------------------------------------------
-- FUNCTION: Delete all user data (GDPR compliant)
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_family_id UUID;
  v_parent_count INTEGER;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Get user's family
  SELECT family_id INTO v_family_id
  FROM family_members
  WHERE user_id = v_user_id AND role = 'parent'
  LIMIT 1;

  IF v_family_id IS NOT NULL THEN
    -- Check how many parents are in this family
    SELECT COUNT(*) INTO v_parent_count
    FROM family_members
    WHERE family_id = v_family_id AND role = 'parent';

    IF v_parent_count = 1 THEN
      -- This user is the only parent - delete entire family and all related data
      
      -- Delete hero_badges for all heroes in this family
      DELETE FROM hero_badges
      WHERE hero_id IN (
        SELECT h.id FROM heroes h
        INNER JOIN family_members fm ON fm.id = h.family_member_id
        WHERE fm.family_id = v_family_id
      );

      -- Delete xp_logs for all heroes in this family
      DELETE FROM xp_logs
      WHERE hero_id IN (
        SELECT h.id FROM heroes h
        INNER JOIN family_members fm ON fm.id = h.family_member_id
        WHERE fm.family_id = v_family_id
      );

      -- Delete completions for all heroes in this family
      DELETE FROM completions
      WHERE hero_id IN (
        SELECT h.id FROM heroes h
        INNER JOIN family_members fm ON fm.id = h.family_member_id
        WHERE fm.family_id = v_family_id
      );

      -- Delete quest_participants for this family's quests
      DELETE FROM quest_participants
      WHERE quest_id IN (
        SELECT id FROM quests WHERE family_id = v_family_id
      );

      -- Delete quests
      DELETE FROM quests WHERE family_id = v_family_id;

      -- Delete tasks
      DELETE FROM tasks WHERE family_id = v_family_id;

      -- Delete heroes
      DELETE FROM heroes
      WHERE family_member_id IN (
        SELECT id FROM family_members WHERE family_id = v_family_id
      );

      -- Delete family members
      DELETE FROM family_members WHERE family_id = v_family_id;

      -- Delete family
      DELETE FROM families WHERE id = v_family_id;

    ELSE
      -- Multiple parents exist - just remove this parent and their hero
      
      -- Delete hero for this parent
      DELETE FROM heroes
      WHERE family_member_id IN (
        SELECT id FROM family_members 
        WHERE user_id = v_user_id AND family_id = v_family_id
      );

      -- Delete family member record
      DELETE FROM family_members 
      WHERE user_id = v_user_id AND family_id = v_family_id;
    END IF;
  END IF;

  -- Delete auth user (this triggers Supabase to clean up auth-related data)
  DELETE FROM auth.users WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true, 
    'message', 'Account and all related data deleted successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'error', SQLERRM,
    'detail', 'Failed to delete account'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

COMMENT ON FUNCTION delete_user_account IS 'GDPR-compliant function to delete user account and all related data';
