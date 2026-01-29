import { supabase } from './supabase'
import { getLevelFromXP } from './levels'

/**
 * Badge System - Database-driven achievement system
 * Badges are stored in the database and awarded automatically when requirements are met
 */

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  emoji: string
  category: 'tasks' | 'quests' | 'streaks' | 'xp' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  requirement: BadgeRequirement
}

export interface BadgeRequirement {
  type: 'task_count' | 'quest_count' | 'streak_days' | 'total_xp' | 'level' | 'first_action'
  value: number
}

export interface EarnedBadge extends BadgeDefinition {
  earned_at: string
}

// Database badge type
interface DBBadge {
  id: string
  name: string
  description: string
  icon_url: string
  unlock_criteria: {
    type: string
    count?: number
    amount?: number
    level?: number
  }
  is_active: boolean
  display_order: number
}

// All available badges - extensible list
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // First Actions
  {
    id: 'first_task',
    name: 'First Steps',
    description: 'Complete your first task',
    emoji: '🎯',
    category: 'tasks',
    rarity: 'common',
    requirement: { type: 'task_count', value: 1 },
  },
  {
    id: 'first_quest',
    name: 'Team Player',
    description: 'Complete your first quest',
    emoji: '🤝',
    category: 'quests',
    rarity: 'common',
    requirement: { type: 'quest_count', value: 1 },
  },
  
  // Task Milestones
  {
    id: 'task_10',
    name: 'Getting Started',
    description: 'Complete 10 tasks',
    emoji: '✨',
    category: 'tasks',
    rarity: 'common',
    requirement: { type: 'task_count', value: 10 },
  },
  {
    id: 'task_50',
    name: 'Task Master',
    description: 'Complete 50 tasks',
    emoji: '🌟',
    category: 'tasks',
    rarity: 'rare',
    requirement: { type: 'task_count', value: 50 },
  },
  {
    id: 'task_100',
    name: 'Century Hero',
    description: 'Complete 100 tasks',
    emoji: '💯',
    category: 'tasks',
    rarity: 'epic',
    requirement: { type: 'task_count', value: 100 },
  },
  {
    id: 'task_500',
    name: 'Task Legend',
    description: 'Complete 500 tasks',
    emoji: '🏅',
    category: 'tasks',
    rarity: 'legendary',
    requirement: { type: 'task_count', value: 500 },
  },
  
  // Quest Milestones
  {
    id: 'quest_5',
    name: 'Quest Companion',
    description: 'Complete 5 quests',
    emoji: '🗡️',
    category: 'quests',
    rarity: 'common',
    requirement: { type: 'quest_count', value: 5 },
  },
  {
    id: 'quest_25',
    name: 'Quest Champion',
    description: 'Complete 25 quests',
    emoji: '⚔️',
    category: 'quests',
    rarity: 'rare',
    requirement: { type: 'quest_count', value: 25 },
  },
  {
    id: 'quest_100',
    name: 'Quest Legend',
    description: 'Complete 100 quests',
    emoji: '🛡️',
    category: 'quests',
    rarity: 'legendary',
    requirement: { type: 'quest_count', value: 100 },
  },
  
  // Streak Milestones
  {
    id: 'streak_3',
    name: 'Warming Up',
    description: 'Reach a 3-day streak',
    emoji: '🔥',
    category: 'streaks',
    rarity: 'common',
    requirement: { type: 'streak_days', value: 3 },
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Reach a 7-day streak',
    emoji: '🔥',
    category: 'streaks',
    rarity: 'rare',
    requirement: { type: 'streak_days', value: 7 },
  },
  {
    id: 'streak_14',
    name: 'Fortnight Force',
    description: 'Reach a 14-day streak',
    emoji: '💪',
    category: 'streaks',
    rarity: 'rare',
    requirement: { type: 'streak_days', value: 14 },
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Reach a 30-day streak',
    emoji: '🌙',
    category: 'streaks',
    rarity: 'epic',
    requirement: { type: 'streak_days', value: 30 },
  },
  {
    id: 'streak_100',
    name: 'Unstoppable',
    description: 'Reach a 100-day streak',
    emoji: '⚡',
    category: 'streaks',
    rarity: 'legendary',
    requirement: { type: 'streak_days', value: 100 },
  },
  
  // XP Milestones
  {
    id: 'xp_500',
    name: 'XP Collector',
    description: 'Earn 500 XP',
    emoji: '💫',
    category: 'xp',
    rarity: 'common',
    requirement: { type: 'total_xp', value: 500 },
  },
  {
    id: 'xp_2500',
    name: 'XP Hunter',
    description: 'Earn 2,500 XP',
    emoji: '🌠',
    category: 'xp',
    rarity: 'rare',
    requirement: { type: 'total_xp', value: 2500 },
  },
  {
    id: 'xp_10000',
    name: 'XP Master',
    description: 'Earn 10,000 XP',
    emoji: '✴️',
    category: 'xp',
    rarity: 'epic',
    requirement: { type: 'total_xp', value: 10000 },
  },
  {
    id: 'xp_50000',
    name: 'XP Legend',
    description: 'Earn 50,000 XP',
    emoji: '🌟',
    category: 'xp',
    rarity: 'legendary',
    requirement: { type: 'total_xp', value: 50000 },
  },
  
  // Level Milestones
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    emoji: '⭐',
    category: 'xp',
    rarity: 'common',
    requirement: { type: 'level', value: 5 },
  },
  {
    id: 'level_10',
    name: 'Champion',
    description: 'Reach Level 10',
    emoji: '🏆',
    category: 'xp',
    rarity: 'epic',
    requirement: { type: 'level', value: 10 },
  },
  {
    id: 'level_15',
    name: 'Ultimate Hero',
    description: 'Reach Level 15',
    emoji: '👑',
    category: 'xp',
    rarity: 'legendary',
    requirement: { type: 'level', value: 15 },
  },
]

/**
 * Get badge definition by ID
 */
export function getBadgeById(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(b => b.id === badgeId)
}

/**
 * Get rarity color classes for styling
 */
export function getRarityColor(rarity: BadgeDefinition['rarity']): string {
  switch (rarity) {
    case 'common': return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'
    case 'rare': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200'
    case 'epic': return 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 dark:border-purple-600 text-purple-800 dark:text-purple-200'
    case 'legendary': return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200'
  }
}

/**
 * Get rarity gradient for badge display
 */
export function getRarityGradient(rarity: BadgeDefinition['rarity']): string {
  switch (rarity) {
    case 'common': return 'from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700'
    case 'rare': return 'from-blue-200 to-blue-400 dark:from-blue-700 dark:to-blue-800'
    case 'epic': return 'from-purple-300 to-purple-500 dark:from-purple-700 dark:to-purple-900'
    case 'legendary': return 'from-yellow-300 via-orange-400 to-red-400 dark:from-yellow-600 dark:via-orange-600 dark:to-red-600'
  }
}

/**
 * Hero stats for badge checking
 */
interface HeroStats {
  totalTasks: number
  totalQuests: number
  currentStreak: number
  longestStreak: number
  totalXP: number
  level: number
}

/**
 * Fetch hero stats for badge checking
 */
async function getHeroStats(heroId: string): Promise<HeroStats> {
  // Get hero XP and streak
  const { data: hero } = await supabase
    .from('heroes')
    .select('total_xp, current_streak, longest_streak')
    .eq('id', heroId)
    .single()
  
  // Count completed tasks
  const { count: taskCount } = await supabase
    .from('completions')
    .select('*', { count: 'exact', head: true })
    .eq('hero_id', heroId)
  
  // Count completed quests
  const { count: questCount } = await supabase
    .from('quest_participants')
    .select('*', { count: 'exact', head: true })
    .eq('hero_id', heroId)
    .eq('has_completed', true)
  
  const totalXP = hero?.total_xp || 0
  
  return {
    totalTasks: taskCount || 0,
    totalQuests: questCount || 0,
    currentStreak: hero?.current_streak || 0,
    longestStreak: hero?.longest_streak || 0,
    totalXP,
    level: getLevelFromXP(totalXP),
  }
}

/**
 * Check if a badge requirement is met
 */
function isRequirementMet(requirement: BadgeRequirement, stats: HeroStats): boolean {
  switch (requirement.type) {
    case 'task_count':
      return stats.totalTasks >= requirement.value
    case 'quest_count':
      return stats.totalQuests >= requirement.value
    case 'streak_days':
      return stats.longestStreak >= requirement.value
    case 'total_xp':
      return stats.totalXP >= requirement.value
    case 'level':
      return stats.level >= requirement.value
    case 'first_action':
      return true
    default:
      return false
  }
}

/**
 * Get all earned badges for a hero from the database
 */
export async function getHeroBadges(heroId: string): Promise<EarnedBadge[]> {
  const { data: heroBadges, error } = await supabase
    .from('hero_badges')
    .select(`
      unlocked_at,
      badge:badges(*)
    `)
    .eq('hero_id', heroId)
  
  if (error || !heroBadges) {
    console.error('Error fetching hero badges:', error)
    return []
  }
  
  return heroBadges
    .filter((hb: any) => hb.badge)
    .map((hb: any) => {
      const badgeDef = convertDBBadge(hb.badge as DBBadge)
      return { ...badgeDef, earned_at: hb.unlocked_at }
    })
}

/**
 * Check and award any newly earned badges using database badges
 * Returns array of newly awarded badges
 */
export async function checkAndAwardBadges(heroId: string): Promise<BadgeDefinition[]> {
  try {
    const stats = await getHeroStats(heroId)
    
    // Get all active badges from database
    const { data: dbBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
    
    if (badgesError || !dbBadges) {
      console.error('Error fetching badges:', badgesError)
      return []
    }
    
    // Get already earned badges
    const { data: earnedBadges } = await supabase
      .from('hero_badges')
      .select('badge_id')
      .eq('hero_id', heroId)
    
    const earnedIds = new Set((earnedBadges || []).map(b => b.badge_id))
    
    // Find newly earned badges
    const newBadges: BadgeDefinition[] = []
    
    for (const dbBadge of dbBadges as DBBadge[]) {
      if (earnedIds.has(dbBadge.id)) continue
      
      const criteria = dbBadge.unlock_criteria
      let meetsRequirement = false
      
      // Check if requirement is met based on criteria type
      switch (criteria.type) {
        case 'tasks_completed':
          meetsRequirement = stats.totalTasks >= (criteria.count || 0)
          break
        case 'quests_completed':
          meetsRequirement = stats.totalQuests >= (criteria.count || 0)
          break
        case 'streak_days':
          meetsRequirement = stats.longestStreak >= (criteria.count || 0)
          break
        case 'xp_earned':
          meetsRequirement = stats.totalXP >= (criteria.amount || 0)
          break
        case 'level_reached':
          meetsRequirement = stats.level >= (criteria.level || 0)
          break
      }
      
      if (meetsRequirement) {
        // Award the badge
        const { error } = await supabase.from('hero_badges').insert({
          hero_id: heroId,
          badge_id: dbBadge.id,
        })
        
        if (!error) {
          newBadges.push(convertDBBadge(dbBadge))
        } else {
          console.error('Error awarding badge:', error)
        }
      }
    }
    
    return newBadges
  } catch (error) {
    console.error('Error checking badges:', error)
    return []
  }
}

/**
 * Convert database badge to BadgeDefinition format
 */
function convertDBBadge(dbBadge: DBBadge): BadgeDefinition {
  const criteria = dbBadge.unlock_criteria
  let category: BadgeDefinition['category'] = 'special'
  let requirementType: BadgeRequirement['type'] = 'first_action'
  let requirementValue = 1
  
  switch (criteria.type) {
    case 'tasks_completed':
      category = 'tasks'
      requirementType = 'task_count'
      requirementValue = criteria.count || 1
      break
    case 'quests_completed':
      category = 'quests'
      requirementType = 'quest_count'
      requirementValue = criteria.count || 1
      break
    case 'streak_days':
      category = 'streaks'
      requirementType = 'streak_days'
      requirementValue = criteria.count || 1
      break
    case 'xp_earned':
      category = 'xp'
      requirementType = 'total_xp'
      requirementValue = criteria.amount || 1
      break
    case 'level_reached':
      category = 'xp'
      requirementType = 'level'
      requirementValue = criteria.level || 1
      break
  }
  
  // Determine rarity based on requirement value
  let rarity: BadgeDefinition['rarity'] = 'common'
  if (requirementValue >= 100 || (requirementType === 'level' && requirementValue >= 10)) {
    rarity = 'legendary'
  } else if (requirementValue >= 50 || (requirementType === 'level' && requirementValue >= 5)) {
    rarity = 'epic'
  } else if (requirementValue >= 10) {
    rarity = 'rare'
  }
  
  return {
    id: dbBadge.id,
    name: dbBadge.name,
    description: dbBadge.description,
    emoji: dbBadge.icon_url,
    category,
    rarity,
    requirement: { type: requirementType, value: requirementValue },
  }
}

/**
 * Get badges grouped by category
 */
export function getBadgesByCategory(): Record<BadgeDefinition['category'], BadgeDefinition[]> {
  const grouped: Record<BadgeDefinition['category'], BadgeDefinition[]> = {
    tasks: [],
    quests: [],
    streaks: [],
    xp: [],
    special: [],
  }
  
  for (const badge of BADGE_DEFINITIONS) {
    grouped[badge.category].push(badge)
  }
  
  return grouped
}

/**
 * Get next badges to earn in each category
 */
export async function getNextBadges(heroId: string): Promise<BadgeDefinition[]> {
  const stats = await getHeroStats(heroId)
  const { data: earnedBadges } = await supabase
    .from('hero_badges')
    .select('badge_id')
    .eq('hero_id', heroId)
  
  const earnedIds = new Set((earnedBadges || []).map(b => b.badge_id))
  
  const categories: BadgeDefinition['category'][] = ['tasks', 'quests', 'streaks', 'xp']
  const nextBadges: BadgeDefinition[] = []
  
  for (const category of categories) {
    const categoryBadges = BADGE_DEFINITIONS
      .filter(b => b.category === category && !earnedIds.has(b.id))
      .sort((a, b) => a.requirement.value - b.requirement.value)
    
    if (categoryBadges.length > 0) {
      nextBadges.push(categoryBadges[0])
    }
  }
  
  return nextBadges
}

/**
 * Get badge progress for a specific badge
 */
export async function getBadgeProgress(heroId: string, badgeId: string): Promise<{
  badge: BadgeDefinition
  current: number
  target: number
  percent: number
  earned: boolean
} | null> {
  const badge = getBadgeById(badgeId)
  if (!badge) return null
  
  const stats = await getHeroStats(heroId)
  const { data: earned } = await supabase
    .from('hero_badges')
    .select('badge_id')
    .eq('hero_id', heroId)
    .eq('badge_id', badgeId)
    .single()
  
  let current = 0
  const target = badge.requirement.value
  
  switch (badge.requirement.type) {
    case 'task_count':
      current = stats.totalTasks
      break
    case 'quest_count':
      current = stats.totalQuests
      break
    case 'streak_days':
      current = stats.longestStreak
      break
    case 'total_xp':
      current = stats.totalXP
      break
    case 'level':
      current = stats.level
      break
  }
  
  return {
    badge,
    current: Math.min(current, target),
    target,
    percent: Math.min(100, Math.round((current / target) * 100)),
    earned: !!earned,
  }
}
