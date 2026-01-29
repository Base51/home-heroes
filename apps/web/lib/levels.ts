/**
 * Level System - Configurable XP curves and level calculations
 * Designed to be extensible and work with the hero progression system
 */

export interface LevelInfo {
  level: number
  title: string
  currentXP: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  xpProgress: number // XP earned within current level
  xpNeeded: number // XP needed to reach next level
  progressPercent: number
  isMaxLevel: boolean
}

export interface LevelUpResult {
  leveledUp: boolean
  previousLevel: number
  newLevel: number
  levelsGained: number
}

// Level titles that progress with the hero's journey
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Rookie Hero',
  2: 'Helper',
  3: 'Junior Hero',
  4: 'Hero in Training',
  5: 'Rising Star',
  6: 'Skilled Hero',
  7: 'Expert Hero',
  8: 'Elite Hero',
  9: 'Master Hero',
  10: 'Champion',
  11: 'Super Hero',
  12: 'Legendary Hero',
  13: 'Mythic Hero',
  14: 'Epic Hero',
  15: 'Ultimate Hero',
}

const MAX_LEVEL = 15

/**
 * XP required to reach each level (cumulative)
 * Uses a gentle curve: Level 1 = 0, Level 2 = 100, etc.
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0
  if (level > MAX_LEVEL) return getXPForLevel(MAX_LEVEL)
  
  // Formula: XP = 50 * level^1.8
  // This creates a gentle curve that gets steeper at higher levels
  return Math.floor(50 * Math.pow(level, 1.8))
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXP(totalXP: number): number {
  let level = 1
  while (level < MAX_LEVEL && totalXP >= getXPForLevel(level + 1)) {
    level++
  }
  return level
}

/**
 * Get full level info for a hero based on their total XP
 */
export function getLevelInfo(totalXP: number): LevelInfo {
  const level = getLevelFromXP(totalXP)
  const xpForCurrentLevel = getXPForLevel(level)
  const xpForNextLevel = getXPForLevel(level + 1)
  const isMaxLevel = level >= MAX_LEVEL
  
  const xpProgress = totalXP - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.floor((xpProgress / xpNeeded) * 100))
  
  return {
    level,
    title: LEVEL_TITLES[level] || 'Hero',
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress,
    xpNeeded,
    progressPercent,
    isMaxLevel,
  }
}

/**
 * Check if XP gain triggers a level up
 */
export function checkLevelUp(previousXP: number, newXP: number): LevelUpResult {
  const previousLevel = getLevelFromXP(previousXP)
  const newLevel = getLevelFromXP(newXP)
  
  return {
    leveledUp: newLevel > previousLevel,
    previousLevel,
    newLevel,
    levelsGained: newLevel - previousLevel,
  }
}

/**
 * Get level color gradient for UI
 */
export function getLevelColor(level: number): string {
  if (level >= 13) return 'from-purple-500 to-pink-500' // Mythic+
  if (level >= 10) return 'from-yellow-400 to-orange-500' // Champion+
  if (level >= 7) return 'from-blue-500 to-cyan-500' // Expert+
  if (level >= 4) return 'from-green-500 to-emerald-500' // Rising Star+
  return 'from-gray-400 to-gray-500' // Starter
}

/**
 * Get level badge emoji
 */
export function getLevelEmoji(level: number): string {
  if (level >= 15) return '👑'
  if (level >= 13) return '⚡'
  if (level >= 10) return '🏆'
  if (level >= 7) return '💎'
  if (level >= 4) return '⭐'
  return '🌱'
}

/**
 * Get XP thresholds for display
 */
export function getXPThresholds(): { level: number; xp: number; title: string }[] {
  const thresholds = []
  for (let level = 1; level <= MAX_LEVEL; level++) {
    thresholds.push({
      level,
      xp: getXPForLevel(level),
      title: LEVEL_TITLES[level] || 'Hero',
    })
  }
  return thresholds
}
