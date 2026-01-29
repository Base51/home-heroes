'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserFamily, getCurrentFamilyMember, getHeroByFamilyMemberId, type Family, type FamilyMember, type Hero } from '@/lib/family'
import { getTasksWithCompletionStatus, createTask, completeTask, deleteTask, type TaskWithCompletions, type TaskFrequency } from '@/lib/tasks'
import { getHeroStreakInfo, getStreakEmoji, getStreakDisplayText, calculateXpWithStreakBonus, type StreakInfo } from '@/lib/streaks'

export default function TasksPage() {
  const router = useRouter()
  const [family, setFamily] = useState<Family | null>(null)
  const [member, setMember] = useState<FamilyMember | null>(null)
  const [hero, setHero] = useState<Hero | null>(null)
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
  const [tasks, setTasks] = useState<TaskWithCompletions[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [lastCompletion, setLastCompletion] = useState<{ xpEarned: number; streakBonus: number; newStreak: number } | null>(null)

  // Create task form state
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskXp, setNewTaskXp] = useState(10)
  const [newTaskFrequency, setNewTaskFrequency] = useState<TaskFrequency>('daily')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/dashboard/tasks')
        return
      }

      // Get family
      const userFamily = await getUserFamily()
      if (!userFamily) {
        router.push('/setup')
        return
      }
      setFamily(userFamily)

      // Get current member and their hero
      const currentMember = await getCurrentFamilyMember()
      if (!currentMember) {
        console.error('No family member found')
        setLoading(false)
        return
      }
      setMember(currentMember)

      const memberHero = await getHeroByFamilyMemberId(currentMember.id)
      if (memberHero) {
        setHero(memberHero)
        
        // Load streak info
        const streak = await getHeroStreakInfo(memberHero.id)
        setStreakInfo(streak)
        
        // Load tasks with completion status
        const tasksData = await getTasksWithCompletionStatus(userFamily.id, memberHero.id)
        setTasks(tasksData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    if (!family || !member || !newTaskTitle.trim()) return

    setCreating(true)
    try {
      const task = await createTask({
        familyId: family.id,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        xpReward: newTaskXp,
        frequency: newTaskFrequency,
        createdByMemberId: member.id,
      })

      if (task) {
        // Reload tasks
        if (hero) {
          const tasksData = await getTasksWithCompletionStatus(family.id, hero.id)
          setTasks(tasksData)
        }
        
        // Reset form
        setNewTaskTitle('')
        setNewTaskDescription('')
        setNewTaskXp(10)
        setNewTaskFrequency('daily')
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setCreating(false)
    }
  }

  async function handleCompleteTask(task: TaskWithCompletions) {
    if (!hero || task.completed_today) return

    setCompletingTaskId(task.id)
    try {
      const result = await completeTask({
        taskId: task.id,
        heroId: hero.id,
        xpReward: task.xp_reward,
      })

      if (result) {
        // Update local state
        setTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { ...t, completed_today: true, completions: [...t.completions, result.completion] }
            : t
        ))
        
        // Update hero XP and streak locally
        setHero(prev => prev ? { 
          ...prev, 
          total_xp: result.newTotalXp,
          current_streak: result.newStreak,
        } : prev)
        
        // Update streak info
        setStreakInfo(prev => prev ? {
          ...prev,
          currentStreak: result.newStreak,
          isActiveToday: true,
          streakStatus: 'active',
        } : prev)
        
        // Show completion feedback
        setLastCompletion({
          xpEarned: result.xpEarned,
          streakBonus: result.streakBonus,
          newStreak: result.newStreak,
        })
        
        // Auto-hide after 3 seconds
        setTimeout(() => setLastCompletion(null), 3000)
      }
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setCompletingTaskId(null)
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return

    const success = await deleteTask(taskId)
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== taskId))
    }
  }

  function getFrequencyIcon(frequency: TaskFrequency) {
    switch (frequency) {
      case 'once': return '1️⃣'
      case 'daily': return '📅'
      case 'weekly': return '📆'
      case 'custom': return '⚙️'
      default: return '📋'
    }
  }

  function getFrequencyLabel(frequency: TaskFrequency) {
    switch (frequency) {
      case 'once': return 'One-time'
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'custom': return 'Custom'
      default: return frequency
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter(t => t.completed_today)
  const pendingTasks = tasks.filter(t => !t.completed_today)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ←
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ✓ Tasks
            </h1>
          </div>
          {member?.role === 'parent' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              + New Task
            </button>
          )}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {/* XP Earned Toast */}
        {lastCompletion && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-center">
              <div className="text-lg">+{lastCompletion.xpEarned} XP!</div>
              {lastCompletion.streakBonus > 0 && (
                <div className="text-sm opacity-90">
                  (includes +{lastCompletion.streakBonus} streak bonus)
                </div>
              )}
              <div className="text-sm mt-1">
                🔥 {lastCompletion.newStreak} day streak!
              </div>
            </div>
          </div>
        )}

        {/* Hero XP Display with Streak */}
        {hero && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-3xl">
                {hero.hero_type === 'super_mommy' && '🦸‍♀️'}
                {hero.hero_type === 'super_daddy' && '🦸‍♂️'}
                {hero.hero_type === 'kid_male' && '🧒'}
                {hero.hero_type === 'kid_female' && '👧'}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 dark:text-white">{hero.hero_name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Level {hero.level}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-500">{hero.total_xp}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total XP</div>
              </div>
            </div>
            
            {/* Streak Display */}
            {streakInfo && (
              <div className={`mt-4 p-3 rounded-xl ${
                streakInfo.streakStatus === 'active' 
                  ? 'bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30' 
                  : streakInfo.streakStatus === 'at_risk'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getStreakEmoji(streakInfo.currentStreak)}</span>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {getStreakDisplayText(streakInfo.currentStreak)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {streakInfo.streakStatus === 'active' && '✅ Active today!'}
                        {streakInfo.streakStatus === 'at_risk' && '⚠️ Complete a task to keep it!'}
                        {streakInfo.streakStatus === 'broken' && 'Start a new streak!'}
                        {streakInfo.streakStatus === 'new' && 'Complete a task to start!'}
                      </div>
                    </div>
                  </div>
                  {streakInfo.bonusMultiplier > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        +{Math.round(streakInfo.bonusMultiplier * 100)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">XP Bonus</div>
                    </div>
                  )}
                </div>
                {streakInfo.nextMilestone && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    🎯 {streakInfo.daysToNextMilestone} days to {streakInfo.nextMilestone}-day milestone!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tasks Summary */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-green-500">{completedTasks.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Done Today</div>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-500">{pendingTasks.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">To Do</div>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-orange-500">
              {streakInfo?.currentStreak || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Day Streak</div>
          </div>
        </div>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white px-2 mb-4">
              📋 Available Tasks
              {streakInfo && streakInfo.bonusMultiplier > 0 && (
                <span className="ml-2 text-sm font-normal text-orange-500">
                  (+{Math.round(streakInfo.bonusMultiplier * 100)}% streak bonus)
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getFrequencyIcon(task.frequency)}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 ml-7">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {getFrequencyLabel(task.frequency)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                          +{streakInfo ? calculateXpWithStreakBonus(task.xp_reward, streakInfo.currentStreak) : task.xp_reward} XP
                        </span>
                        {streakInfo && streakInfo.bonusMultiplier > 0 && (
                          <div className="text-xs text-orange-500 mt-1">
                            🔥 +{Math.round(task.xp_reward * streakInfo.bonusMultiplier)} bonus
                          </div>
                        )}
                      </div>
                      {member?.role === 'parent' && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompleteTask(task)}
                    disabled={completingTaskId === task.id}
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:cursor-not-allowed"
                  >
                    {completingTaskId === task.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Completing...
                      </span>
                    ) : (
                      'Complete ✓'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white px-2 mb-4">
              ✅ Completed Today
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white line-through opacity-70">
                          {task.title}
                        </span>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Completed • +{task.xp_reward} XP earned
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {member?.role === 'parent' 
                ? 'Create your first task to get started!' 
                : 'Ask a parent to create some tasks for you.'}
            </p>
            {member?.role === 'parent' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                + Create First Task
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              ✨ Create New Task
            </h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Clean your room"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Add more details..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    XP Reward
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newTaskXp}
                      onChange={(e) => setNewTaskXp(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-amber-500 font-bold">XP</span>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={newTaskFrequency}
                    onChange={(e) => setNewTaskFrequency(e.target.value as TaskFrequency)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="once">One-time</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTaskTitle.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-2xl mx-auto flex">
          <Link href="/dashboard" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="text-xl">⭐</span>
            <span className="text-xs">Today</span>
          </Link>
          <Link href="/dashboard/tasks" className="flex-1 py-3 flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold border-t-2 border-blue-600">
            <span className="text-xl">✓</span>
            <span className="text-xs">Tasks</span>
          </Link>
          <Link href="/dashboard/quests" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="text-xl">🗺️</span>
            <span className="text-xs">Quests</span>
          </Link>
          <button className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <span className="text-xs">Family</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
