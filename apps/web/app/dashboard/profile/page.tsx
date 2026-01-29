'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserFamily, getCurrentFamilyMember, getHeroByFamilyMemberId, type Family, type FamilyMember, type Hero, type HeroType } from '@/lib/family'
import { getLevelInfo, getLevelColor, getLevelEmoji, LEVEL_TITLES, type LevelInfo } from '@/lib/levels'
import { getHeroBadges, type EarnedBadge } from '@/lib/badges'
import { getHeroStreakInfo, getStreakEmoji, type StreakInfo } from '@/lib/streaks'

export default function ProfilePage() {
  const router = useRouter()
  const [family, setFamily] = useState<Family | null>(null)
  const [member, setMember] = useState<FamilyMember | null>(null)
  const [hero, setHero] = useState<Hero | null>(null)
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null)
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [loading, setLoading] = useState(true)
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editHeroType, setEditHeroType] = useState<HeroType>('super_mommy')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Stats
  const [stats, setStats] = useState<{
    tasksCompleted: number
    questsCompleted: number
    totalXpEarned: number
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/dashboard/profile')
        return
      }

      const userFamily = await getUserFamily()
      if (!userFamily) {
        router.push('/setup')
        return
      }
      setFamily(userFamily)

      const currentMember = await getCurrentFamilyMember()
      if (!currentMember) {
        setLoading(false)
        return
      }
      setMember(currentMember)

      const memberHero = await getHeroByFamilyMemberId(currentMember.id)
      if (memberHero) {
        setHero(memberHero)
        setEditName(memberHero.hero_name)
        setEditHeroType(memberHero.hero_type)
        setLevelInfo(getLevelInfo(memberHero.total_xp))
        
        // Load badges
        const badges = await getHeroBadges(memberHero.id)
        setEarnedBadges(badges)
        
        // Load streak info
        const streak = await getHeroStreakInfo(memberHero.id)
        setStreakInfo(streak)
        
        // Load stats
        await loadStats(memberHero.id)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  async function loadStats(heroId: string) {
    // Get task completions count
    const { count: taskCount } = await supabase
      .from('completions')
      .select('*', { count: 'exact', head: true })
      .eq('hero_id', heroId)

    // Get quest completions count
    const { count: questCount } = await supabase
      .from('quest_participants')
      .select('*', { count: 'exact', head: true })
      .eq('hero_id', heroId)
      .eq('has_completed', true)

    // Get total XP from logs
    const { data: xpLogs } = await supabase
      .from('xp_logs')
      .select('xp_amount')
      .eq('hero_id', heroId)

    const totalXp = xpLogs?.reduce((sum, log) => sum + log.xp_amount, 0) || 0

    setStats({
      tasksCompleted: taskCount || 0,
      questsCompleted: questCount || 0,
      totalXpEarned: totalXp,
    })
  }

  async function handleSave() {
    if (!hero || !editName.trim()) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('heroes')
        .update({
          hero_name: editName.trim(),
          hero_type: editHeroType,
        })
        .eq('id', hero.id)

      if (error) throw error

      // Update local state
      setHero(prev => prev ? { ...prev, hero_name: editName.trim(), hero_type: editHeroType } : prev)
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Error saving hero:', error)
    } finally {
      setSaving(false)
    }
  }

  function getHeroEmoji(heroType: HeroType) {
    switch (heroType) {
      case 'super_mommy': return '🦸‍♀️'
      case 'super_daddy': return '🦸‍♂️'
      case 'kid_male': return '🧒'
      case 'kid_female': return '👧'
      default: return '👤'
    }
  }

  function getHeroTypeLabel(heroType: HeroType) {
    switch (heroType) {
      case 'super_mommy': return 'Super Mommy'
      case 'super_daddy': return 'Super Daddy'
      case 'kid_male': return 'Hero Boy'
      case 'kid_female': return 'Hero Girl'
      default: return 'Hero'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!hero) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No hero found</p>
          <Link href="/setup" className="text-blue-600 hover:underline mt-2 inline-block">
            Create your hero →
          </Link>
        </div>
      </div>
    )
  }

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
              👤 Hero Profile
            </h1>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium">
            ✅ Profile saved!
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero Avatar Card */}
        <div className={`bg-gradient-to-r ${levelInfo ? getLevelColor(levelInfo.level) : 'from-blue-500 to-purple-500'} p-1 rounded-2xl shadow-lg`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-5xl shadow-lg border-4 border-white dark:border-gray-700">
                  {getHeroEmoji(hero.hero_type)}
                </div>
                {levelInfo && (
                  <div className="absolute -bottom-2 -right-2 text-3xl">
                    {getLevelEmoji(levelInfo.level)}
                  </div>
                )}
                {/* Streak badge */}
                {hero.current_streak > 0 && (
                  <div className="absolute -top-1 -left-1 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded-full border-2 border-white dark:border-gray-700">
                    🔥 {hero.current_streak}
                  </div>
                )}
              </div>

              {/* Name & Level */}
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold text-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                  placeholder="Hero name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {hero.hero_name}
                </h2>
              )}

              {/* Hero Type */}
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
                  {member?.role === 'parent' ? (
                    <>
                      <button
                        onClick={() => setEditHeroType('super_mommy')}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          editHeroType === 'super_mommy'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <span className="text-2xl">🦸‍♀️</span>
                        <div className="text-xs mt-1">Super Mommy</div>
                      </button>
                      <button
                        onClick={() => setEditHeroType('super_daddy')}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          editHeroType === 'super_daddy'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <span className="text-2xl">🦸‍♂️</span>
                        <div className="text-xs mt-1">Super Daddy</div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditHeroType('kid_male')}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          editHeroType === 'kid_male'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <span className="text-2xl">🧒</span>
                        <div className="text-xs mt-1">Hero Boy</div>
                      </button>
                      <button
                        onClick={() => setEditHeroType('kid_female')}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          editHeroType === 'kid_female'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <span className="text-2xl">👧</span>
                        <div className="text-xs mt-1">Hero Girl</div>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {getHeroTypeLabel(hero.hero_type)}
                </p>
              )}

              {/* Level Title */}
              {levelInfo && !isEditing && (
                <p className={`text-lg font-semibold bg-gradient-to-r ${getLevelColor(levelInfo.level)} bg-clip-text text-transparent`}>
                  Level {levelInfo.level} • {levelInfo.title}
                </p>
              )}

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditName(hero.hero_name)
                      setEditHeroType(hero.hero_type)
                    }}
                    className="px-6 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !editName.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* XP Progress */}
        {levelInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📊 XP Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {levelInfo.currentXP.toLocaleString()} XP
                </span>
                {!levelInfo.isMaxLevel && (
                  <span className="text-gray-500 dark:text-gray-500">
                    {levelInfo.xpForNextLevel.toLocaleString()} XP
                  </span>
                )}
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getLevelColor(levelInfo.level)} transition-all duration-500`}
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              {!levelInfo.isMaxLevel ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {levelInfo.xpNeeded - levelInfo.xpProgress} XP to Level {levelInfo.level + 1} ({LEVEL_TITLES[levelInfo.level + 1]})
                </p>
              ) : (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center font-semibold">
                  🎉 Max Level Reached!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.tasksCompleted || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Tasks Done</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats?.questsCompleted || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Quests Done</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {earnedBadges.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Badges</div>
          </div>
        </div>

        {/* Streak Card */}
        {streakInfo && (
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getStreakEmoji(streakInfo.currentStreak)}</span>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {streakInfo.currentStreak} Day Streak
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Best: {streakInfo.longestStreak} days
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                streakInfo.streakStatus === 'active'
                  ? 'bg-green-500 text-white'
                  : streakInfo.streakStatus === 'at_risk'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {streakInfo.streakStatus === 'active' && '✓ Active'}
                {streakInfo.streakStatus === 'at_risk' && '⚠️ At Risk'}
                {streakInfo.streakStatus === 'broken' && 'Start New!'}
              </div>
            </div>
          </div>
        )}

        {/* Recent Badges */}
        {earnedBadges.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">🏅 Recent Badges</h3>
              <Link href="/dashboard/badges" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View all →
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {earnedBadges
                .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
                .slice(0, 6)
                .map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    title={badge.description}
                  >
                    <span className="text-xl">{badge.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {badge.name}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📋 Account Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Family</span>
              <span className="text-gray-900 dark:text-white font-medium">{family?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Role</span>
              <span className="text-gray-900 dark:text-white font-medium capitalize">{member?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Member Since</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {hero.created_at ? new Date(hero.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total XP Earned</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {stats?.totalXpEarned.toLocaleString() || 0} XP
              </span>
            </div>
          </div>
        </div>

        {/* Settings Link */}
        <Link
          href="/settings"
          className="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-center py-3 rounded-xl font-medium transition-colors"
        >
          ⚙️ Account Settings
        </Link>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-2xl mx-auto flex">
          <Link href="/dashboard" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
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
