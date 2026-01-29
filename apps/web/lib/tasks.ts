import { supabase } from './supabase'
import { updateHeroStreak, calculateXpWithStreakBonus } from './streaks'
import { checkLevelUp, type LevelUpResult } from './levels'
import { checkAndAwardBadges, type BadgeDefinition } from './badges'

export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'custom'

export type Task = {
  id: string
  family_id: string
  title: string
  description: string | null
  xp_reward: number
  frequency: TaskFrequency
  custom_schedule: Record<string, unknown> | null
  is_active: boolean
  created_by_member_id: string
  created_at: string
  updated_at: string
}

export type Completion = {
  id: string
  task_id: string
  hero_id: string
  xp_earned: number
  completed_at: string
  notes: string | null
  created_at: string
}

export type TaskWithCompletions = Task & {
  completions: Completion[]
  completed_today: boolean
}

/**
 * Get all active tasks for a family
 */
export async function getFamilyTasks(familyId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
  
  return data || []
}

/**
 * Get tasks with today's completion status for a specific hero
 */
export async function getTasksWithCompletionStatus(
  familyId: string,
  heroId: string
): Promise<TaskWithCompletions[]> {
  // Get all active tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError)
    return []
  }

  if (!tasks || tasks.length === 0) {
    return []
  }

  // Get today's completions for this hero
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: completions, error: completionsError } = await supabase
    .from('completions')
    .select('*')
    .eq('hero_id', heroId)
    .gte('completed_at', today.toISOString())

  if (completionsError) {
    console.error('Error fetching completions:', completionsError)
  }

  const completionsMap = new Map<string, Completion[]>()
  completions?.forEach((completion) => {
    const existing = completionsMap.get(completion.task_id) || []
    existing.push(completion)
    completionsMap.set(completion.task_id, existing)
  })

  return tasks.map((task) => ({
    ...task,
    completions: completionsMap.get(task.id) || [],
    completed_today: completionsMap.has(task.id),
  }))
}

/**
 * Create a new task
 */
export async function createTask(params: {
  familyId: string
  title: string
  description?: string
  xpReward?: number
  frequency?: TaskFrequency
  createdByMemberId: string
}): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      family_id: params.familyId,
      title: params.title,
      description: params.description || null,
      xp_reward: params.xpReward || 10,
      frequency: params.frequency || 'daily',
      created_by_member_id: params.createdByMemberId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    return null
  }

  return data
}

/**
 * Complete a task and award XP
 * Trust-based: XP is granted immediately upon completion
 * Includes streak bonus calculation, level-up check, and badge awards
 */
export async function completeTask(params: {
  taskId: string
  heroId: string
  xpReward: number
  notes?: string
}): Promise<{ 
  completion: Completion
  newTotalXp: number
  xpEarned: number
  streakBonus: number
  newStreak: number
  isNewRecord: boolean
  milestoneReached: number | null
  levelUp: LevelUpResult | null
  newBadges: BadgeDefinition[]
} | null> {
  const { taskId, heroId, xpReward, notes } = params

  // 1. Get current hero streak for bonus calculation
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

  // 3. Create completion record with actual XP earned
  const { data: completion, error: completionError } = await supabase
    .from('completions')
    .insert({
      task_id: taskId,
      hero_id: heroId,
      xp_earned: xpWithBonus,
      notes: notes || null,
    })
    .select()
    .single()

  if (completionError) {
    console.error('Error creating completion:', completionError)
    return null
  }

  // 4. Update streak (this also updates last_activity_date)
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
      source_type: 'task',
      source_id: taskId,
      reason: streakBonus > 0 
        ? `Completed task (+${streakBonus} streak bonus)` 
        : 'Completed task',
    })

  // 7. Check for level up
  const levelUp = checkLevelUp(hero.total_xp || 0, newTotalXp)

  // 8. Check for new badges
  const newBadges = await checkAndAwardBadges(heroId)

  return { 
    completion, 
    newTotalXp,
    xpEarned: xpWithBonus,
    streakBonus,
    newStreak: streakResult?.newStreak || hero.current_streak,
    isNewRecord: streakResult?.isNewRecord || false,
    milestoneReached: streakResult?.milestoneReached || null,
    levelUp,
    newBadges,
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'xp_reward' | 'frequency' | 'is_active'>>
): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    console.error('Error updating task:', error)
    return null
  }

  return data
}

/**
 * Delete a task (soft delete by setting is_active to false)
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({ is_active: false })
    .eq('id', taskId)

  if (error) {
    console.error('Error deleting task:', error)
    return false
  }

  return true
}

/**
 * Get task completion history for a hero
 */
export async function getTaskCompletionHistory(
  heroId: string,
  limit = 50
): Promise<(Completion & { task: Task })[]> {
  const { data, error } = await supabase
    .from('completions')
    .select('*, task:tasks(*)')
    .eq('hero_id', heroId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching completion history:', error)
    return []
  }

  return data || []
}

/**
 * Pre-built daily tasks for new families
 * These provide a good starting point for household productivity
 */
export const DEFAULT_DAILY_TASKS = [
  { title: 'Make your bed', description: 'Start the day by making your bed nice and tidy', xp_reward: 5, icon: '🛏️' },
  { title: 'Brush your teeth', description: 'Morning and evening dental hygiene', xp_reward: 5, icon: '🦷' },
  { title: 'Clean your room', description: 'Keep your personal space organized', xp_reward: 10, icon: '🧹' },
  { title: 'Do homework', description: 'Complete today\'s school assignments', xp_reward: 15, icon: '📚' },
  { title: 'Set the table', description: 'Help prepare for family meals', xp_reward: 5, icon: '🍽️' },
  { title: 'Clear your dishes', description: 'Take your dishes to the kitchen after eating', xp_reward: 5, icon: '🍲' },
  { title: 'Read for 15 minutes', description: 'Reading time builds great habits', xp_reward: 10, icon: '📖' },
  { title: 'Practice an instrument', description: 'Keep improving your musical skills', xp_reward: 15, icon: '🎵' },
  { title: 'Exercise or play outside', description: 'Stay active and healthy', xp_reward: 10, icon: '⚽' },
  { title: 'Help with laundry', description: 'Sort, fold, or put away clothes', xp_reward: 10, icon: '👕' },
  { title: 'Water the plants', description: 'Take care of our green friends', xp_reward: 5, icon: '🌱' },
  { title: 'Walk the dog', description: 'Give our pet some exercise', xp_reward: 10, icon: '🐕' },
  { title: 'Feed the pets', description: 'Make sure our pets are happy and fed', xp_reward: 5, icon: '🐾' },
  { title: 'Take out the trash', description: 'Keep the house clean', xp_reward: 5, icon: '🗑️' },
  { title: 'Tidy up toys', description: 'Put toys back where they belong', xp_reward: 5, icon: '🧸' },
]

/**
 * Create default daily tasks for a new family
 * Called during onboarding to give families a starting set of tasks
 */
export async function createDefaultTasks(
  familyId: string,
  createdByMemberId: string,
  taskIndices?: number[] // Optional: only create specific tasks by index
): Promise<Task[]> {
  const tasksToCreate = taskIndices 
    ? taskIndices.map(i => DEFAULT_DAILY_TASKS[i]).filter(Boolean)
    : DEFAULT_DAILY_TASKS.slice(0, 6) // By default, create first 6 tasks
  
  const tasks: Task[] = []
  
  for (const taskTemplate of tasksToCreate) {
    const task = await createTask({
      familyId,
      title: taskTemplate.title,
      description: taskTemplate.description,
      xpReward: taskTemplate.xp_reward,
      frequency: 'daily',
      createdByMemberId,
    })
    if (task) tasks.push(task)
  }
  
  return tasks
}

/**
 * Get task icon based on title (for display purposes)
 */
export function getTaskIcon(title: string): string {
  const lowerTitle = title.toLowerCase()
  
  // Check against known tasks
  for (const task of DEFAULT_DAILY_TASKS) {
    if (task.title.toLowerCase() === lowerTitle) {
      return task.icon
    }
  }
  
  // Fallback icon matching based on keywords
  if (lowerTitle.includes('bed')) return '🛏️'
  if (lowerTitle.includes('teeth') || lowerTitle.includes('brush')) return '🦷'
  if (lowerTitle.includes('clean') || lowerTitle.includes('tidy')) return '🧹'
  if (lowerTitle.includes('homework') || lowerTitle.includes('study')) return '📚'
  if (lowerTitle.includes('table') || lowerTitle.includes('dishes')) return '🍽️'
  if (lowerTitle.includes('read')) return '📖'
  if (lowerTitle.includes('music') || lowerTitle.includes('instrument') || lowerTitle.includes('practice')) return '🎵'
  if (lowerTitle.includes('exercise') || lowerTitle.includes('sport') || lowerTitle.includes('play')) return '⚽'
  if (lowerTitle.includes('laundry') || lowerTitle.includes('clothes')) return '👕'
  if (lowerTitle.includes('plant') || lowerTitle.includes('water')) return '🌱'
  if (lowerTitle.includes('dog') || lowerTitle.includes('walk')) return '🐕'
  if (lowerTitle.includes('pet') || lowerTitle.includes('feed')) return '🐾'
  if (lowerTitle.includes('trash') || lowerTitle.includes('garbage')) return '🗑️'
  if (lowerTitle.includes('toy')) return '🧸'
  if (lowerTitle.includes('cook') || lowerTitle.includes('meal')) return '👨‍🍳'
  if (lowerTitle.includes('shower') || lowerTitle.includes('bath')) return '🚿'
  
  return '✨' // Default icon
}
