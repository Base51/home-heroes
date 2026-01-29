import { supabase } from './supabase'

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
 */
export async function completeTask(params: {
  taskId: string
  heroId: string
  xpReward: number
  notes?: string
}): Promise<{ completion: Completion; newTotalXp: number } | null> {
  const { taskId, heroId, xpReward, notes } = params

  // 1. Create completion record
  const { data: completion, error: completionError } = await supabase
    .from('completions')
    .insert({
      task_id: taskId,
      hero_id: heroId,
      xp_earned: xpReward,
      notes: notes || null,
    })
    .select()
    .single()

  if (completionError) {
    console.error('Error creating completion:', completionError)
    return null
  }

  // 2. Update hero's total XP
  const { data: hero, error: heroError } = await supabase
    .from('heroes')
    .select('total_xp')
    .eq('id', heroId)
    .single()

  if (heroError) {
    console.error('Error fetching hero:', heroError)
    return null
  }

  const newTotalXp = (hero.total_xp || 0) + xpReward

  const { error: updateError } = await supabase
    .from('heroes')
    .update({ 
      total_xp: newTotalXp,
      last_activity_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', heroId)

  if (updateError) {
    console.error('Error updating hero XP:', updateError)
    return null
  }

  // 3. Log the XP gain
  await supabase
    .from('xp_logs')
    .insert({
      hero_id: heroId,
      xp_amount: xpReward,
      source_type: 'task',
      source_id: taskId,
      reason: `Completed task`,
    })

  return { completion, newTotalXp }
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
