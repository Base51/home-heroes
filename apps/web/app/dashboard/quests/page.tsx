'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserFamily, getCurrentFamilyMember, getHeroByFamilyMemberId, getFamilyMembersWithHeroes, type Family, type FamilyMember, type Hero } from '@/lib/family'
import { getFamilyQuests, createQuest, joinQuest, leaveQuest, completeQuestParticipation, deleteQuest, type QuestWithParticipants } from '@/lib/quests'

export default function QuestsPage() {
  const router = useRouter()
  const [family, setFamily] = useState<Family | null>(null)
  const [member, setMember] = useState<FamilyMember | null>(null)
  const [hero, setHero] = useState<Hero | null>(null)
  const [quests, setQuests] = useState<QuestWithParticipants[]>([])
  const [familyHeroes, setFamilyHeroes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Create quest form state
  const [newQuestTitle, setNewQuestTitle] = useState('')
  const [newQuestDescription, setNewQuestDescription] = useState('')
  const [newQuestXp, setNewQuestXp] = useState(50)
  const [newQuestMinParticipants, setNewQuestMinParticipants] = useState(2)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/dashboard/quests')
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
        console.error('No family member found')
        setLoading(false)
        return
      }
      setMember(currentMember)

      const memberHero = await getHeroByFamilyMemberId(currentMember.id)
      if (memberHero) {
        setHero(memberHero)
        
        const questsData = await getFamilyQuests(userFamily.id, memberHero.id)
        setQuests(questsData)
      }

      // Load all family heroes for display
      const members = await getFamilyMembersWithHeroes(userFamily.id)
      const heroes = members.flatMap(m => m.heroes || [])
      setFamilyHeroes(heroes)

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  async function handleCreateQuest(e: React.FormEvent) {
    e.preventDefault()
    if (!family || !member || !newQuestTitle.trim()) return

    setCreating(true)
    try {
      const quest = await createQuest({
        familyId: family.id,
        title: newQuestTitle.trim(),
        description: newQuestDescription.trim() || undefined,
        xpRewardPerParticipant: newQuestXp,
        minParticipants: newQuestMinParticipants,
        createdByMemberId: member.id,
      })

      if (quest && hero) {
        const questsData = await getFamilyQuests(family.id, hero.id)
        setQuests(questsData)
        
        setNewQuestTitle('')
        setNewQuestDescription('')
        setNewQuestXp(50)
        setNewQuestMinParticipants(2)
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating quest:', error)
    } finally {
      setCreating(false)
    }
  }

  async function handleJoinQuest(questId: string) {
    if (!hero) return

    setActionLoading(questId)
    try {
      const participant = await joinQuest(questId, hero.id)
      if (participant && family) {
        const questsData = await getFamilyQuests(family.id, hero.id)
        setQuests(questsData)
      }
    } catch (error) {
      console.error('Error joining quest:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleLeaveQuest(questId: string) {
    if (!hero) return

    setActionLoading(questId)
    try {
      const success = await leaveQuest(questId, hero.id)
      if (success && family) {
        const questsData = await getFamilyQuests(family.id, hero.id)
        setQuests(questsData)
      }
    } catch (error) {
      console.error('Error leaving quest:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCompleteQuest(quest: QuestWithParticipants) {
    if (!hero || !quest.current_hero_participant || quest.current_hero_participant.has_completed) return

    setActionLoading(quest.id)
    try {
      const result = await completeQuestParticipation({
        questId: quest.id,
        heroId: hero.id,
        xpReward: quest.xp_reward_per_participant,
      })

      if (result && family) {
        setHero(prev => prev ? { ...prev, total_xp: result.newTotalXp } : prev)
        const questsData = await getFamilyQuests(family.id, hero.id)
        setQuests(questsData)
      }
    } catch (error) {
      console.error('Error completing quest:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteQuest(questId: string) {
    if (!confirm('Are you sure you want to delete this quest?')) return

    const success = await deleteQuest(questId)
    if (success) {
      setQuests(prev => prev.filter(q => q.id !== questId))
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

  function getQuestStatus(quest: QuestWithParticipants) {
    if (quest.is_completed) return 'completed'
    if (quest.current_hero_participant?.has_completed) return 'done'
    if (quest.current_hero_participant) return 'joined'
    return 'available'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-24">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pt-6">
          {/* Hero Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700 mb-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="text-right space-y-2">
                <div className="w-16 h-7 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
                <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
              </div>
            </div>
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
          {/* Quest Cards Skeleton */}
          <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
                <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeQuests = quests.filter(q => !q.is_completed)
  const completedQuests = quests.filter(q => q.is_completed)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ←
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              🗺️ Quests
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {member?.role === 'parent' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-sm btn-press shadow-md hover:shadow-lg"
              >
                + New Quest
              </button>
            )}
            <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-lg hover:ring-2 hover:ring-blue-500 transition-all">
              👤
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {/* Hero XP Display */}
        {hero && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700 mb-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-3xl animate-bounce-slow">
                {getHeroEmoji(hero.hero_type)}
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
          </div>
        )}

        {/* Quest Stats */}
        <div className="flex gap-4 mb-6">
          <div className="stagger-item flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 card-interactive" style={{ animationDelay: '0.05s' }}>
            <div className="text-3xl font-bold text-purple-500">{activeQuests.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
          </div>
          <div className="stagger-item flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 card-interactive" style={{ animationDelay: '0.1s' }}>
            <div className="text-3xl font-bold text-green-500">{completedQuests.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
          </div>
          <div className="stagger-item flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 card-interactive" style={{ animationDelay: '0.15s' }}>
            <div className="text-3xl font-bold text-blue-500">
              {quests.filter(q => q.current_hero_participant).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Joined</div>
          </div>
        </div>

        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white px-2 mb-4">
              ⚔️ Active Quests
            </h2>
            <div className="space-y-4">
              {activeQuests.map((quest) => {
                const status = getQuestStatus(quest)
                const completedCount = quest.participants.filter(p => p.has_completed).length
                const progress = quest.participants.length > 0 
                  ? (completedCount / quest.min_participants) * 100 
                  : 0

                return (
                  <div
                    key={quest.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700"
                  >
                    {/* Quest Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">🗺️</span>
                          <span className="font-bold text-lg text-gray-900 dark:text-white">
                            {quest.title}
                          </span>
                        </div>
                        {quest.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">
                            {quest.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg">
                          +{quest.xp_reward_per_participant} XP
                        </span>
                        {member?.role === 'parent' && (
                          <button
                            onClick={() => handleDeleteQuest(quest.id)}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Participants ({quest.participants.length}/{quest.min_participants} min)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quest.participants.map((p) => (
                          <div
                            key={p.id}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-sm ${
                              p.has_completed
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span>{getHeroEmoji(p.hero?.hero_type || '')}</span>
                            <span>{p.hero?.hero_name}</span>
                            {p.has_completed && <span>✓</span>}
                          </div>
                        ))}
                        {quest.participants.length === 0 && (
                          <span className="text-sm text-gray-400 italic">No heroes yet</span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-blue-500 transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{completedCount} completed</span>
                        <span>{quest.min_participants} needed</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {status === 'available' && (
                      <button
                        onClick={() => handleJoinQuest(quest.id)}
                        disabled={actionLoading === quest.id}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                      >
                        {actionLoading === quest.id ? 'Joining...' : 'Join Quest 🎯'}
                      </button>
                    )}

                    {status === 'joined' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleLeaveQuest(quest.id)}
                          disabled={actionLoading === quest.id}
                          className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-colors"
                        >
                          Leave
                        </button>
                        <button
                          onClick={() => handleCompleteQuest(quest)}
                          disabled={actionLoading === quest.id}
                          className="flex-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                        >
                          {actionLoading === quest.id ? 'Completing...' : 'Complete My Part ✓'}
                        </button>
                      </div>
                    )}

                    {status === 'done' && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl py-3 text-center">
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          ✅ You completed your part! (+{quest.xp_reward_per_participant} XP)
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white px-2 mb-4">
              🏆 Completed Quests
            </h2>
            <div className="space-y-3">
              {completedQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {quest.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex -space-x-1">
                            {quest.participants.slice(0, 4).map((p) => (
                              <span key={p.id} className="text-lg">
                                {getHeroEmoji(p.hero?.hero_type || '')}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            {quest.participants.length} heroes completed
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      +{quest.xp_reward_per_participant} XP each
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {quests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No quests yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {member?.role === 'parent'
                ? 'Create a family quest to earn XP together!'
                : 'Ask a parent to create a quest for the family.'}
            </p>
            {member?.role === 'parent' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
              >
                + Create First Quest
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create Quest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              🗺️ Create New Quest
            </h2>

            <form onSubmit={handleCreateQuest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quest Title *
                </label>
                <input
                  type="text"
                  value={newQuestTitle}
                  onChange={(e) => setNewQuestTitle(e.target.value)}
                  placeholder="e.g., Family Movie Night"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newQuestDescription}
                  onChange={(e) => setNewQuestDescription(e.target.value)}
                  placeholder="What's this quest about?"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    XP per Hero
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newQuestXp}
                      onChange={(e) => setNewQuestXp(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="500"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="text-purple-500 font-bold">XP</span>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Heroes
                  </label>
                  <input
                    type="number"
                    value={newQuestMinParticipants}
                    onChange={(e) => setNewQuestMinParticipants(Math.max(2, parseInt(e.target.value) || 2))}
                    min="2"
                    max={familyHeroes.length || 10}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-sm text-purple-700 dark:text-purple-300">
                💡 Quests are group activities! All heroes who complete the quest earn XP.
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
                  disabled={creating || !newQuestTitle.trim()}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Quest'}
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
          <Link href="/dashboard/tasks" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="text-xl">✓</span>
            <span className="text-xs">Tasks</span>
          </Link>
          <Link href="/dashboard/quests" className="flex-1 py-3 flex flex-col items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold border-t-2 border-purple-600">
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
