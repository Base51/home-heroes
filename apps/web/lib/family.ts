import { supabase } from './supabase'

export type HeroType = 'super_mommy' | 'super_daddy' | 'kid_male' | 'kid_female'

export type Family = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type FamilyMember = {
  id: string
  family_id: string
  user_id: string | null
  role: 'parent' | 'kid'
  display_name: string
  created_at: string
}

export type Hero = {
  id: string
  family_member_id: string
  hero_name: string
  hero_type: HeroType
  level: number
  total_xp: number
  current_streak: number
  longest_streak: number
  is_active: boolean
  created_at: string
}

/**
 * Check if current user has a family
 */
export async function getUserFamily(): Promise<Family | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('🔴 getUserFamily: No authenticated user')
    return null
  }

  console.log('🔵 getUserFamily: Querying for user:', user.id)
  
  // Get the first (oldest) family for this user
  const { data, error } = await supabase
    .from('family_members')
    .select('family_id, families(*)')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) {
    console.log('🔴 getUserFamily: Query error:', error)
    return null
  }
  
  if (!data || data.length === 0) {
    console.log('🔴 getUserFamily: No data returned')
    return null
  }
  
  console.log('✅ getUserFamily: Found family:', data[0])
  return data[0].families as unknown as Family
}

/**
 * Get family member for current user
 */
export async function getCurrentFamilyMember(): Promise<FamilyMember | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) return null
  return data
}

/**
 * Get hero for a family member
 */
export async function getHeroByFamilyMemberId(familyMemberId: string): Promise<Hero | null> {
  const { data, error } = await supabase
    .from('heroes')
    .select('*')
    .eq('family_member_id', familyMemberId)
    .single()

  if (error) return null
  return data
}

/**
 * Create a new family with the parent as first member and their hero
 */
export async function createFamilyWithParent(
  familyName: string,
  parentName: string,
  heroName: string,
  heroType: HeroType
): Promise<{ family: Family; member: FamilyMember; hero: Hero } | { error: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    // 1. Create family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({ name: familyName })
      .select()
      .single()

    if (familyError) {
      console.error('Family insert error:', familyError)
      throw new Error(`Failed to create family: ${familyError.message}`)
    }

    // 2. Create family member (parent)
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: user.id,
        role: 'parent',
        display_name: parentName
      })
      .select()
      .single()

    if (memberError) {
      console.error('Family member insert error:', memberError)
      throw new Error(`Failed to create family member: ${memberError.message}`)
    }

    // 3. Create hero for parent
    const { data: hero, error: heroError } = await supabase
      .from('heroes')
      .insert({
        family_member_id: member.id,
        hero_name: heroName,
        hero_type: heroType
      })
      .select()
      .single()

    if (heroError) {
      console.error('Hero insert error:', heroError)
      throw new Error(`Failed to create hero: ${heroError.message}`)
    }

    return { family, member, hero }
  } catch (error) {
    console.error('Error creating family:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create family' }
  }
}

/**
 * Add a kid to the family
 */
export async function addKidToFamily(
  familyId: string,
  kidName: string,
  heroName: string,
  heroType: 'kid_male' | 'kid_female'
): Promise<{ member: FamilyMember; hero: Hero } | { error: string }> {
  try {
    // 1. Create family member (kid - no user_id)
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: familyId,
        user_id: null, // Kids don't have user_id
        role: 'kid',
        display_name: kidName
      })
      .select()
      .single()

    if (memberError) throw memberError

    // 2. Create hero for kid
    const { data: hero, error: heroError } = await supabase
      .from('heroes')
      .insert({
        family_member_id: member.id,
        hero_name: heroName,
        hero_type: heroType
      })
      .select()
      .single()

    if (heroError) throw heroError

    return { member, hero }
  } catch (error) {
    console.error('Error adding kid:', error)
    return { error: error instanceof Error ? error.message : 'Failed to add kid' }
  }
}

/**
 * Get all family members with their heroes
 */
export async function getFamilyMembersWithHeroes(familyId: string) {
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      *,
      heroes (*)
    `)
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching family members:', error)
    return []
  }

  return data
}

/**
 * Update a family member's details
 */
export async function updateFamilyMember(
  memberId: string,
  updates: { display_name?: string }
): Promise<FamilyMember | null> {
  const { data, error } = await supabase
    .from('family_members')
    .update(updates)
    .eq('id', memberId)
    .select()
    .single()

  if (error) {
    console.error('Error updating family member:', error)
    return null
  }

  return data
}

/**
 * Update a hero's details
 */
export async function updateHero(
  heroId: string,
  updates: { hero_name?: string; hero_type?: HeroType }
): Promise<Hero | null> {
  const { data, error } = await supabase
    .from('heroes')
    .update(updates)
    .eq('id', heroId)
    .select()
    .single()

  if (error) {
    console.error('Error updating hero:', error)
    return null
  }

  return data
}

/**
 * Remove a family member and their hero (kids only)
 * Parents cannot be removed
 */
export async function removeFamilyMember(memberId: string): Promise<boolean> {
  // First check if this is a kid (parents cannot be removed)
  const { data: member } = await supabase
    .from('family_members')
    .select('role')
    .eq('id', memberId)
    .single()

  if (!member || member.role === 'parent') {
    console.error('Cannot remove parent or member not found')
    return false
  }

  // Delete the hero first (foreign key constraint)
  const { error: heroError } = await supabase
    .from('heroes')
    .delete()
    .eq('family_member_id', memberId)

  if (heroError) {
    console.error('Error deleting hero:', heroError)
    return false
  }

  // Then delete the family member
  const { error: memberError } = await supabase
    .from('family_members')
    .delete()
    .eq('id', memberId)

  if (memberError) {
    console.error('Error deleting family member:', memberError)
    return false
  }

  return true
}

/**
 * Update family name
 */
export async function updateFamilyName(
  familyId: string,
  newName: string
): Promise<Family | null> {
  const { data, error } = await supabase
    .from('families')
    .update({ name: newName })
    .eq('id', familyId)
    .select()
    .single()

  if (error) {
    console.error('Error updating family name:', error)
    return null
  }

  return data
}
