import { supabase } from './supabase'
import { updateHeroStreak, calculateXpWithStreakBonus } from './streaks'
import { checkLevelUp, type LevelUpResult } from './levels'
import { checkAndAwardBadges, type BadgeDefinition } from './badges'

export type Quest = {
  id: string
  family_id: string
  title: string
  description: string | null
  xp_reward_per_participant: number
  min_participants: number
  max_participants: number | null
  is_completed: boolean
  completed_at: string | null
  expires_at: string | null
  created_by_member_id: string
  created_at: string
  updated_at: string
}

export type QuestParticipant = {
  id: string
  quest_id: string
  hero_id: string
  has_completed: boolean
  completed_at: string | null
  created_at: string
  hero?: {
    id: string
    hero_name: string
    hero_type: string
    level: number
  }
}

export type QuestWithParticipants = Quest & {
  participants: QuestParticipant[]
  current_hero_participant?: QuestParticipant
}

/**
 * Get all active quests for a family with participants
 */
export async function getFamilyQuests(
  familyId: string,
  heroId?: string
): Promise<QuestWithParticipants[]> {
  const { data: quests, error: questsError } = await supabase
    .from('quests')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })

  if (questsError) {
    console.error('Error fetching quests:', questsError)
    return []
  }

  if (!quests || quests.length === 0) {
    return []
  }

  // Get participants for all quests
  const questIds = quests.map(q => q.id)
  const { data: participants, error: participantsError } = await supabase
    .from('quest_participants')
    .select(`
      *,
      hero:heroes(id, hero_name, hero_type, level)
    `)
    .in('quest_id', questIds)

  if (participantsError) {
    console.error('Error fetching participants:', participantsError)
  }

  const participantsMap = new Map<string, QuestParticipant[]>()
  participants?.forEach((p) => {
    const existing = participantsMap.get(p.quest_id) || []
    existing.push(p)
    participantsMap.set(p.quest_id, existing)
  })

  return quests.map((quest) => {
    const questParticipants = participantsMap.get(quest.id) || []
    return {
      ...quest,
      participants: questParticipants,
      current_hero_participant: heroId 
        ? questParticipants.find(p => p.hero_id === heroId)
        : undefined,
    }
  })
}

/**
 * Create a new quest
 */
export async function createQuest(params: {
  familyId: string
  title: string
  description?: string
  xpRewardPerParticipant?: number
  minParticipants?: number
  maxParticipants?: number | null
  expiresAt?: string | null
  createdByMemberId: string
}): Promise<Quest | null> {
  const { data, error } = await supabase
    .from('quests')
    .insert({
      family_id: params.familyId,
      title: params.title,
      description: params.description || null,
      xp_reward_per_participant: params.xpRewardPerParticipant || 50,
      min_participants: params.minParticipants || 2,
      max_participants: params.maxParticipants || null,
      expires_at: params.expiresAt || null,
      created_by_member_id: params.createdByMemberId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating quest:', error)
    return null
  }

  return data
}

/**
 * Join a quest as a participant
 */
export async function joinQuest(
  questId: string,
  heroId: string
): Promise<QuestParticipant | null> {
  // Check if already joined
  const { data: existing } = await supabase
    .from('quest_participants')
    .select('*')
    .eq('quest_id', questId)
    .eq('hero_id', heroId)
    .single()

  if (existing) {
    console.log('Already joined this quest')
    return existing
  }

  const { data, error } = await supabase
    .from('quest_participants')
    .insert({
      quest_id: questId,
      hero_id: heroId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error joining quest:', error)
    return null
  }

  return data
}

/**
 * Leave a quest
 */
export async function leaveQuest(
  questId: string,
  heroId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('quest_participants')
    .delete()
    .eq('quest_id', questId)
    .eq('hero_id', heroId)

  if (error) {
    console.error('Error leaving quest:', error)
    return false
  }

  return true
}

/**
 * Complete participation in a quest
 * Awards XP immediately (trust-based)
 * Includes streak bonus calculation, level-up check, and badge awards
 */
export async function completeQuestParticipation(params: {
  questId: string
  heroId: string
  xpReward: number
}): Promise<{ 
  participant: QuestParticipant
  newTotalXp: number
  questCompleted: boolean
  xpEarned: number
  streakBonus: number
  newStreak: number
  levelUp: LevelUpResult | null
  newBadges: BadgeDefinition[]
} | null> {
  const { questId, heroId, xpReward } = params

  // 1. Get current hero for streak calculation
  const { data: hero, error: heroError } = await supabase
    .from('heroes')
    .select('total_xp, current_streak')
    .eq('id', heroId)
    .single()

  if (heroError) {
    console.error('Error fetching hero:', heroError)
    return null
  }

  // 2. Calculate XP with streak bonus
  const xpWithBonus = calculateXpWithStreakBonus(xpReward, hero.current_streak)
  const streakBonus = xpWithBonus - xpReward

  // 3. Update participant as completed
  const { data: participant, error: participantError } = await supabase
    .from('quest_participants')
    .update({
      has_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('quest_id', questId)
    .eq('hero_id', heroId)
    .select()
    .single()

  if (participantError) {
    console.error('Error completing participation:', participantError)
    return null
  }

  // 4. Update streak
  const streakResult = await updateHeroStreak(heroId)

  // 5. Update hero's total XP
  const newTotalXp = (hero.total_xp || 0) + xpWithBonus

  const { error: updateError } = await supabase
    .from('heroes')
    .update({
      total_xp: newTotalXp,
    })
    .eq('id', heroId)

  if (updateError) {
    console.error('Error updating hero XP:', updateError)
    return null
  }

  // 6. Log the XP gain
  await supabase
    .from('xp_logs')
    .insert({
      hero_id: heroId,
      xp_amount: xpWithBonus,
      source_type: 'quest',
      source_id: questId,
      reason: streakBonus > 0 
        ? `Completed quest (+${streakBonus} streak bonus)` 
        : 'Completed quest participation',
    })

  // 7. Check if quest should be marked as complete
  const { data: allParticipants } = await supabase
    .from('quest_participants')
    .select('has_completed')
    .eq('quest_id', questId)

  const { data: quest } = await supabase
    .from('quests')
    .select('min_participants')
    .eq('id', questId)
    .single()

  const completedCount = allParticipants?.filter(p => p.has_completed).length || 0
  const minRequired = quest?.min_participants || 2
  let questCompleted = false

  if (completedCount >= minRequired) {
    await supabase
      .from('quests')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', questId)
    questCompleted = true
  }

  // 8. Check for level up
  const levelUp = checkLevelUp(hero.total_xp || 0, hero.total_xp + xpWithBonus)

  // 9. Check for new badges
  const newBadges = await checkAndAwardBadges(heroId)

  return { 
    participant, 
    newTotalXp, 
    questCompleted,
    xpEarned: xpWithBonus,
    streakBonus,
    newStreak: streakResult?.newStreak || hero.current_streak,
    levelUp,
    newBadges,
  }
}

/**
 * Delete a quest (only by creator/parent)
 */
export async function deleteQuest(questId: string): Promise<boolean> {
  const { error } = await supabase
    .from('quests')
    .delete()
    .eq('id', questId)

  if (error) {
    console.error('Error deleting quest:', error)
    return false
  }

  return true
}

/**
 * Get quest completion stats for a hero
 */
export async function getHeroQuestStats(heroId: string): Promise<{
  totalJoined: number
  totalCompleted: number
  totalXpFromQuests: number
}> {
  const { data: participations } = await supabase
    .from('quest_participants')
    .select('has_completed')
    .eq('hero_id', heroId)

  const { data: xpLogs } = await supabase
    .from('xp_logs')
    .select('xp_amount')
    .eq('hero_id', heroId)
    .eq('source_type', 'quest')

  return {
    totalJoined: participations?.length || 0,
    totalCompleted: participations?.filter(p => p.has_completed).length || 0,
    totalXpFromQuests: xpLogs?.reduce((sum, log) => sum + log.xp_amount, 0) || 0,
  }
}
