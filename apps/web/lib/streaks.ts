import { supabase } from './supabase'

/**
 * Streak configuration - can be extended for multipliers, bonuses, etc.
 */
export const STREAK_CONFIG = {
  // Streak milestones for badges/rewards
  milestones: [3, 7, 14, 30, 60, 100],
  // XP bonus multiplier per streak day (e.g., 0.01 = 1% per day)
  bonusMultiplierPerDay: 0.05,
  // Maximum streak bonus multiplier (e.g., 0.5 = 50% max bonus)
  maxBonusMultiplier: 0.5,
}

export type StreakInfo = {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  isActiveToday: boolean
  streakStatus: 'active' | 'at_risk' | 'broken' | 'new'
  nextMilestone: number | null
  daysToNextMilestone: number
  bonusMultiplier: number
}

/**
 * Get streak information for a hero
 */
export async function getHeroStreakInfo(heroId: string): Promise<StreakInfo | null> {
  const { data: hero, error } = await supabase
    .from('heroes')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('id', heroId)
    .single()

  if (error || !hero) {
    console.error('Error fetching hero streak:', error)
    return null
  }

  return calculateStreakInfo(
    hero.current_streak,
    hero.longest_streak,
    hero.last_activity_date
  )
}

/**
 * Calculate streak information from raw data
 */
export function calculateStreakInfo(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string | null
): StreakInfo {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let isActiveToday = false
  let streakStatus: StreakInfo['streakStatus'] = 'new'

  if (lastActivityDate) {
    const lastActivity = new Date(lastActivityDate)
    lastActivity.setHours(0, 0, 0, 0)

    const todayStr = today.toISOString().split('T')[0]
    const lastActivityStr = lastActivity.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    isActiveToday = lastActivityStr === todayStr

    if (isActiveToday) {
      streakStatus = 'active'
    } else if (lastActivityStr === yesterdayStr) {
      // Completed yesterday, streak is at risk today
      streakStatus = 'at_risk'
    } else {
      // More than 1 day ago, streak is broken
      streakStatus = 'broken'
    }
  }

  // Find next milestone
  const nextMilestone = STREAK_CONFIG.milestones.find(m => m > currentStreak) || null
  const daysToNextMilestone = nextMilestone ? nextMilestone - currentStreak : 0

  // Calculate bonus multiplier
  const bonusMultiplier = Math.min(
    currentStreak * STREAK_CONFIG.bonusMultiplierPerDay,
    STREAK_CONFIG.maxBonusMultiplier
  )

  return {
    currentStreak,
    longestStreak,
    lastActivityDate,
    isActiveToday,
    streakStatus,
    nextMilestone,
    daysToNextMilestone,
    bonusMultiplier,
  }
}

/**
 * Update streak when a task/quest is completed
 * Call this after any XP-earning activity
 */
export async function updateHeroStreak(heroId: string): Promise<{
  newStreak: number
  isNewRecord: boolean
  milestoneReached: number | null
} | null> {
  // Get current hero data
  const { data: hero, error: fetchError } = await supabase
    .from('heroes')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('id', heroId)
    .single()

  if (fetchError || !hero) {
    console.error('Error fetching hero for streak update:', fetchError)
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = hero.current_streak
  let isNewRecord = false
  let milestoneReached: number | null = null

  if (hero.last_activity_date) {
    const lastActivityStr = hero.last_activity_date

    if (lastActivityStr === todayStr) {
      // Already completed something today, streak unchanged
      return { newStreak, isNewRecord: false, milestoneReached: null }
    } else if (lastActivityStr === yesterdayStr) {
      // Completed yesterday, increment streak
      newStreak = hero.current_streak + 1
    } else {
      // Streak was broken, start fresh
      newStreak = 1
    }
  } else {
    // First activity ever
    newStreak = 1
  }

  // Check for new record
  const newLongestStreak = Math.max(newStreak, hero.longest_streak)
  isNewRecord = newLongestStreak > hero.longest_streak

  // Check for milestone
  if (STREAK_CONFIG.milestones.includes(newStreak)) {
    milestoneReached = newStreak
  }

  // Update hero
  const { error: updateError } = await supabase
    .from('heroes')
    .update({
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: todayStr,
    })
    .eq('id', heroId)

  if (updateError) {
    console.error('Error updating hero streak:', updateError)
    return null
  }

  return { newStreak, isNewRecord, milestoneReached }
}

/**
 * Calculate XP with streak bonus
 */
export function calculateXpWithStreakBonus(baseXp: number, currentStreak: number): number {
  const bonusMultiplier = Math.min(
    currentStreak * STREAK_CONFIG.bonusMultiplierPerDay,
    STREAK_CONFIG.maxBonusMultiplier
  )
  return Math.round(baseXp * (1 + bonusMultiplier))
}

/**
 * Get streak display text
 */
export function getStreakDisplayText(streak: number): string {
  if (streak === 0) return 'No streak'
  if (streak === 1) return '1 day'
  return `${streak} days`
}

/**
 * Get streak emoji based on length
 */
export function getStreakEmoji(streak: number): string {
  if (streak === 0) return '💤'
  if (streak < 3) return '🔥'
  if (streak < 7) return '🔥🔥'
  if (streak < 14) return '🔥🔥🔥'
  if (streak < 30) return '⚡'
  if (streak < 60) return '⚡⚡'
  return '🌟'
}

/**
 * Check if any heroes have broken streaks (for daily reset)
 * This would typically run as a scheduled job
 */
export async function checkBrokenStreaks(familyId: string): Promise<string[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // Get heroes with active streaks who haven't completed today or yesterday
  const { data: heroes, error } = await supabase
    .from('heroes')
    .select(`
      id,
      hero_name,
      current_streak,
      last_activity_date,
      family_members!inner(family_id)
    `)
    .eq('family_members.family_id', familyId)
    .gt('current_streak', 0)
    .lt('last_activity_date', yesterdayStr)

  if (error) {
    console.error('Error checking broken streaks:', error)
    return []
  }

  // Reset broken streaks
  const brokenHeroIds = heroes?.map(h => h.id) || []
  
  if (brokenHeroIds.length > 0) {
    await supabase
      .from('heroes')
      .update({ current_streak: 0 })
      .in('id', brokenHeroIds)
  }

  return brokenHeroIds
}
