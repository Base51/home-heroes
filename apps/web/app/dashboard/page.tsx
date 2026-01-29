'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import { getUserFamily, getFamilyMembersWithHeroes, getCurrentFamilyMember, getHeroByFamilyMemberId, type Family } from '@/lib/family'
import { getStreakEmoji } from '@/lib/streaks'
import { getLevelInfo } from '@/lib/levels'
import { getTasksWithCompletionStatus, completeTask, getTaskIcon, type TaskWithCompletions } from '@/lib/tasks'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [currentHero, setCurrentHero] = useState<any | null>(null)
  const [tasks, setTasks] = useState<TaskWithCompletions[]>([])
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingFamily, setCheckingFamily] = useState(true)

  useEffect(() => {
    console.log('🔵 Dashboard: Starting auth check...')
    // Check authentication
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        console.log('🔴 Dashboard: No session, redirecting to login')
        router.push('/login?redirect=/dashboard')
        return
      }
      console.log('✅ Dashboard: User authenticated:', session.user.id)
      setUser(session.user)
      setLoading(false)

      // Check if user has a family (don't block page load)
      try {
        console.log('🔵 Dashboard: Checking for family...')
        const userFamily = await getUserFamily()
        console.log('🔵 Dashboard: Family check result:', userFamily)
        
        if (!userFamily) {
          console.log('🔴 Dashboard: No family found, redirecting to onboarding')
          setCheckingFamily(false)
          router.push('/onboarding')
          return
        }

        console.log('✅ Dashboard: Family found:', userFamily.id, userFamily.name)
        setFamily(userFamily)
        
        // Load family members with heroes
        console.log('🔵 Dashboard: Loading family members...')
        const members = await getFamilyMembersWithHeroes(userFamily.id)
        console.log('✅ Dashboard: Loaded', members.length, 'family members')
        setFamilyMembers(members)
        
        // Get current member and hero for task completion
        const currentMember = await getCurrentFamilyMember()
        if (currentMember) {
          const hero = await getHeroByFamilyMemberId(currentMember.id)
          if (hero) {
            setCurrentHero(hero)
            // Load tasks with completion status
            const tasksData = await getTasksWithCompletionStatus(userFamily.id, hero.id)
            setTasks(tasksData)
          }
        }
        
        setCheckingFamily(false)
      } catch (error) {
        console.error('🔴 Dashboard: Error loading family:', error)
        setCheckingFamily(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/login?redirect=/dashboard')
          return
        }
        setUser(session.user)
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      // The auth state change listener will handle the redirect
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleCompleteTask = async (task: TaskWithCompletions) => {
    if (!currentHero || task.completed_today || completingTaskId) return
    
    setCompletingTaskId(task.id)
    try {
      const result = await completeTask({
        taskId: task.id,
        heroId: currentHero.id,
        xpReward: task.xp_reward,
      })
      
      if (result) {
        // Update tasks list to mark as completed
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, completed_today: true } : t
        ))
        
        // Refresh family members to update XP display
        if (family) {
          const members = await getFamilyMembersWithHeroes(family.id)
          setFamilyMembers(members)
        }
      }
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setCompletingTaskId(null)
    }
  }

  if (loading || checkingFamily) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pb-20">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pt-6">
          {/* Emblem Skeleton */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          {/* Progress Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700 mb-6 animate-pulse">
            <div className="flex justify-between mb-2">
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          {/* Heroes Skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="w-28 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-2" />
                  <div className="w-14 h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
          {/* Action Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto mb-3" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Mock data for demo (replace with real data later)
  // Calculate family XP from all heroes
  const totalFamilyXP = familyMembers.reduce((sum: number, member: any) => {
    return sum + (member.heroes[0]?.total_xp || 0)
  }, 0)
  const familyLevelInfo = getLevelInfo(totalFamilyXP)
  const familyLevel = familyLevelInfo.level
  const currentXP = familyLevelInfo.xpProgress
  const nextLevelXP = familyLevelInfo.xpNeeded
  const xpProgress = familyLevelInfo.progressPercent

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* A) Family Identity Row */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {family?.name || 'Home Heroes'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-amber-400 rounded-full font-bold text-sm text-gray-900">
              Lv. {familyLevel}
            </div>
            <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-lg hover:ring-2 hover:ring-blue-500 transition-all">
              👤
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-4">
        {/* B) Family Emblem (Center Anchor) */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Shield/House base */}
              <path
                d="M50 10 L80 30 L80 70 L50 90 L20 70 L20 30 Z"
                fill="url(#shieldGradient)"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              {/* House icon inside */}
              <path
                d="M50 35 L35 48 L35 65 L65 65 L65 48 Z"
                fill="#fff"
                opacity="0.3"
              />
              <rect x="45" y="55" width="10" height="10" fill="#fff" opacity="0.5" />
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            {/* Level badge */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-gray-800">
              {familyLevel}
            </div>
          </div>
        </div>

        {/* C) XP Progress Bar */}
        <div className="mb-6 px-2">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500 ease-out flex items-center justify-end pr-3"
              style={{ width: `${xpProgress}%` }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white drop-shadow">
                {currentXP} / {nextLevelXP} XP
              </span>
            </div>
          </div>
        </div>

        {/* D) Family Avatars with Streaks */}
        <Link href="/dashboard/family" className="flex justify-center mb-6 group">
          <div className="flex -space-x-3">
            {familyMembers.slice(0, 6).map((member: any, index: number) => (
              <div
                key={member.id}
                className="relative group-hover:scale-105 transition-transform"
                style={{ zIndex: familyMembers.length - index }}
              >
                <div
                  className="w-12 h-12 rounded-full border-3 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-2xl shadow-md"
                >
                  {member.heroes[0]?.hero_type === 'super_mommy' && '🦸‍♀️'}
                  {member.heroes[0]?.hero_type === 'super_daddy' && '🦸‍♂️'}
                  {member.heroes[0]?.hero_type === 'kid_male' && '🧒'}
                  {member.heroes[0]?.hero_type === 'kid_female' && '👧'}
                  {!member.heroes[0] && '👤'}
                </div>
                {/* Streak indicator */}
                {member.heroes[0]?.current_streak > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white dark:border-gray-800">
                    {member.heroes[0].current_streak}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Link>

        {/* Family Streak Summary */}
        {familyMembers.length > 0 && (
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {getStreakEmoji(Math.max(...familyMembers.map((m: any) => m.heroes[0]?.current_streak || 0)))}
                </span>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Family Streaks</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {familyMembers.filter((m: any) => m.heroes[0]?.current_streak > 0).length} / {familyMembers.length} heroes on a streak
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.max(...familyMembers.map((m: any) => m.heroes[0]?.current_streak || 0))}
                </div>
                <div className="text-xs text-gray-500">Best streak</div>
              </div>
            </div>
          </div>
        )}

        {/* E) Today's Tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              ⭐ Today&apos;s Tasks
            </h2>
            <Link 
              href="/dashboard/tasks"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              See all →
            </Link>
          </div>
          
          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No tasks yet!</p>
              <Link
                href="/dashboard/tasks"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Create your first task
              </Link>
            </div>
          ) : (
            tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700 transition-all ${
                  task.completed_today ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTaskIcon(task.title)}</span>
                    <div>
                      <span className={`font-semibold text-gray-900 dark:text-white ${
                        task.completed_today ? 'line-through' : ''
                      }`}>
                        {task.title}
                      </span>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    +{task.xp_reward} XP
                  </span>
                </div>
                {task.completed_today ? (
                  <div className="w-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold py-3 rounded-xl text-center">
                    ✓ Completed!
                  </div>
                ) : (
                  <button 
                    onClick={() => handleCompleteTask(task)}
                    disabled={completingTaskId === task.id}
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {completingTaskId === task.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Completing...
                      </span>
                    ) : (
                      'Complete ✓'
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/family"
            className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            👨‍👩‍👧‍👦 Family
          </Link>
          <Link
            href="/settings"
            className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            ⚙️ Settings
          </Link>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full mt-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
        >
          Sign Out
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-2xl mx-auto flex">
          <Link href="/dashboard" className="flex-1 py-3 flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold border-t-2 border-blue-600">
            <span className="text-xl">⭐</span>
            <span className="text-xs">Today</span>
          </Link>
          <Link href="/dashboard/tasks" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="text-xl">✓</span>
            <span className="text-xs">Tasks</span>
          </Link>
          <Link href="/dashboard/quests" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="text-xl">🗺️</span>
            <span className="text-xs">Quests</span>
          </Link>
          <Link href="/dashboard/badges" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="text-xl">🏅</span>
            <span className="text-xs">Badges</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
