'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserFamily, getCurrentFamilyMember, getHeroByFamilyMemberId, type Family, type FamilyMember, type Hero } from '@/lib/family'
import { getLevelInfo, getLevelColor, getLevelEmoji, type LevelInfo } from '@/lib/levels'
import { 
  getHeroBadges, 
  getNextBadges,
  getAllBadgesFromDB,
  getRarityGradient,
  getRarityColor,
  type BadgeDefinition,
  type EarnedBadge,
} from '@/lib/badges'

export default function BadgesPage() {
  const router = useRouter()
  const [family, setFamily] = useState<Family | null>(null)
  const [member, setMember] = useState<FamilyMember | null>(null)
  const [hero, setHero] = useState<Hero | null>(null)
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [allBadges, setAllBadges] = useState<BadgeDefinition[]>([])
  const [nextBadges, setNextBadges] = useState<BadgeDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/dashboard/badges')
        return
      }

      const userFamily = await getUserFamily()
      if (!userFamily) {
        router.push('/onboarding')
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
        setLevelInfo(getLevelInfo(memberHero.total_xp))
        
        // Load all badges from database
        const badges = await getAllBadgesFromDB()
        setAllBadges(badges)
        
        // Load earned badges
        const earned = await getHeroBadges(memberHero.id)
        setEarnedBadges(earned)
        
        const next = await getNextBadges(memberHero.id)
        setNextBadges(next)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  function getHeroEmoji(heroType: string) {
    switch (heroType) {
      case 'super_mommy': return '🦸‍♀️'
      case 'super_daddy': return '🦸‍♂️'
      case 'kid_male': return '🧒'
      case 'kid_female': return '👧'
      default: return '👤'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 pb-24">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pt-6">
          {/* Hero Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 mb-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          {/* Stats Skeleton */}
          <div className="flex gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="w-10 h-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
              </div>
            ))}
          </div>
          {/* Category Tabs Skeleton */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
          {/* Badge Grid Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
                <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const earnedIds = new Set(earnedBadges.map(b => b.id))

  const categories = [
    { id: 'all', name: 'All', emoji: '🏅' },
    { id: 'tasks', name: 'Tasks', emoji: '✅' },
    { id: 'quests', name: 'Quests', emoji: '⚔️' },
    { id: 'streaks', name: 'Streaks', emoji: '🔥' },
    { id: 'xp', name: 'XP & Levels', emoji: '⭐' },
  ]

  const filteredBadges = selectedCategory === 'all' 
    ? allBadges 
    : allBadges.filter(b => b.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ←
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              🏅 Badges & Level
            </h1>
          </div>
          <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-lg hover:ring-2 hover:ring-blue-500 transition-all">
            👤
          </Link>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero Level Card */}
        {hero && levelInfo && (
          <div className={`bg-gradient-to-r ${getLevelColor(levelInfo.level)} p-1 rounded-2xl shadow-lg`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-4xl">
                  {getHeroEmoji(hero.hero_type)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {hero.hero_name}
                  </h2>
                  <p className={`text-lg font-semibold bg-gradient-to-r ${getLevelColor(levelInfo.level)} bg-clip-text text-transparent`}>
                    Level {levelInfo.level} • {levelInfo.title}
                  </p>
                </div>
                <div className="text-4xl">
                  {getLevelEmoji(levelInfo.level)}
                </div>
              </div>

              {/* XP Progress Bar */}
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
                    {levelInfo.xpNeeded - levelInfo.xpProgress} XP to Level {levelInfo.level + 1}
                  </p>
                ) : (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center font-semibold">
                    🎉 Max Level Reached!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recently Earned - Moved up for visibility */}
        {earnedBadges.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              🎉 Recently Earned
            </h3>
            <div className="space-y-2">
              {earnedBadges
                .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
                .slice(0, 5)
                .map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="text-2xl">{badge.emoji}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {badge.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(badge.earned_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Badge Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {earnedBadges.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Earned</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-400">
              {allBadges.length - earnedBadges.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Locked</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {allBadges.length > 0 ? Math.round((earnedBadges.length / allBadges.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
          </div>
        </div>

        {/* Next Badges to Earn */}
        {nextBadges.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              🎯 Next to Unlock
            </h3>
            <div className="space-y-3">
              {nextBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getRarityColor(badge.rarity)}`}
                >
                  <div className="text-2xl">{badge.emoji}</div>
                  <div className="flex-1">
                    <div className="font-medium">{badge.name}</div>
                    <div className="text-xs opacity-75">{badge.description}</div>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-white/50 dark:bg-black/20">
                    {badge.rarity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* All Badges Grid */}
        <div className="grid grid-cols-3 gap-3">
          {filteredBadges.map((badge) => {
            const isEarned = earnedIds.has(badge.id)
            const earnedBadge = earnedBadges.find(b => b.id === badge.id)
            
            return (
              <div
                key={badge.id}
                className={`relative p-4 rounded-xl text-center transition-all ${
                  isEarned
                    ? `bg-gradient-to-br ${getRarityGradient(badge.rarity)} shadow-md border-2 border-white dark:border-gray-600`
                    : 'bg-gray-100 dark:bg-gray-800 opacity-50 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`text-3xl mb-2 ${!isEarned && 'grayscale'}`}>
                  {badge.emoji}
                </div>
                <div className={`text-xs font-medium ${
                  isEarned 
                    ? 'text-gray-800 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {badge.name}
                </div>
                {isEarned && earnedBadge && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    ✓
                  </div>
                )}
                {!isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/10 dark:bg-black/30">
                    <div className="text-2xl">🔒</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
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
          <Link href="/dashboard/family" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <span className="text-xs">Family</span>
          </Link>
          <Link href="/dashboard/badges" className="flex-1 py-3 flex flex-col items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold border-t-2 border-yellow-500">
            <span className="text-xl">🏅</span>
            <span className="text-xs">Badges</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
