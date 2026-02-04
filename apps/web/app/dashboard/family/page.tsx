'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  getUserFamily, 
  getCurrentFamilyMember, 
  getFamilyMembersWithHeroes,
  addKidToFamily,
  updateFamilyMember,
  updateHero,
  removeFamilyMember,
  updateFamilyName,
  type Family, 
  type FamilyMember, 
  type Hero,
  type HeroType 
} from '@/lib/family'
import { getLevelInfo, getLevelColor } from '@/lib/levels'
import { getStreakEmoji } from '@/lib/streaks'

type FamilyMemberWithHero = FamilyMember & {
  heroes: Hero[]
}

export default function FamilyPage() {
  const router = useRouter()
  const [family, setFamily] = useState<Family | null>(null)
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null)
  const [members, setMembers] = useState<FamilyMemberWithHero[]>([])
  const [loading, setLoading] = useState(true)
  
  // Add kid modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newKidName, setNewKidName] = useState('')
  const [newHeroName, setNewHeroName] = useState('')
  const [newHeroType, setNewHeroType] = useState<'kid_male' | 'kid_female'>('kid_male')
  const [adding, setAdding] = useState(false)
  
  // Edit member modal
  const [editingMember, setEditingMember] = useState<FamilyMemberWithHero | null>(null)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editHeroName, setEditHeroName] = useState('')
  const [editHeroType, setEditHeroType] = useState<HeroType>('kid_male')
  const [saving, setSaving] = useState(false)
  
  // Edit family name
  const [isEditingFamilyName, setIsEditingFamilyName] = useState(false)
  const [editFamilyName, setEditFamilyName] = useState('')
  
  // Delete confirmation
  const [deletingMember, setDeletingMember] = useState<FamilyMemberWithHero | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/dashboard/family')
        return
      }

      const userFamily = await getUserFamily()
      if (!userFamily) {
        router.push('/onboarding')
        return
      }
      setFamily(userFamily)
      setEditFamilyName(userFamily.name)

      const member = await getCurrentFamilyMember()
      setCurrentMember(member)

      const familyMembers = await getFamilyMembersWithHeroes(userFamily.id)
      setMembers(familyMembers as FamilyMemberWithHero[])

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAddKid(e: React.FormEvent) {
    e.preventDefault()
    if (!family || !newKidName.trim() || !newHeroName.trim()) return

    setAdding(true)
    const result = await addKidToFamily(
      family.id,
      newKidName.trim(),
      newHeroName.trim(),
      newHeroType
    )

    if ('error' in result) {
      showToast(result.error, 'error')
    } else {
      showToast(`${newHeroName} joined the family! 🎉`, 'success')
      setShowAddModal(false)
      setNewKidName('')
      setNewHeroName('')
      setNewHeroType('kid_male')
      // Reload members
      const familyMembers = await getFamilyMembersWithHeroes(family.id)
      setMembers(familyMembers as FamilyMemberWithHero[])
    }
    setAdding(false)
  }

  async function handleSaveEdit() {
    if (!editingMember || !editDisplayName.trim() || !editHeroName.trim()) return

    setSaving(true)
    try {
      // Update family member
      await updateFamilyMember(editingMember.id, { display_name: editDisplayName.trim() })
      
      // Update hero
      if (editingMember.heroes[0]) {
        await updateHero(editingMember.heroes[0].id, { 
          hero_name: editHeroName.trim(),
          hero_type: editHeroType
        })
      }

      showToast('Changes saved! ✅', 'success')
      setEditingMember(null)
      
      // Reload members
      if (family) {
        const familyMembers = await getFamilyMembersWithHeroes(family.id)
        setMembers(familyMembers as FamilyMemberWithHero[])
      }
    } catch (error) {
      showToast('Failed to save changes', 'error')
    }
    setSaving(false)
  }

  async function handleDeleteMember() {
    if (!deletingMember) return

    setDeleting(true)
    const success = await removeFamilyMember(deletingMember.id)
    
    if (success) {
      showToast(`${deletingMember.display_name} removed from family`, 'success')
      setDeletingMember(null)
      // Reload members
      if (family) {
        const familyMembers = await getFamilyMembersWithHeroes(family.id)
        setMembers(familyMembers as FamilyMemberWithHero[])
      }
    } else {
      showToast('Failed to remove member', 'error')
    }
    setDeleting(false)
  }

  async function handleSaveFamilyName() {
    if (!family || !editFamilyName.trim()) return

    const updated = await updateFamilyName(family.id, editFamilyName.trim())
    if (updated) {
      setFamily(updated)
      setIsEditingFamilyName(false)
      showToast('Family name updated! 🏠', 'success')
    } else {
      showToast('Failed to update family name', 'error')
    }
  }

  function openEditModal(member: FamilyMemberWithHero) {
    setEditingMember(member)
    setEditDisplayName(member.display_name)
    setEditHeroName(member.heroes[0]?.hero_name || '')
    setEditHeroType(member.heroes[0]?.hero_type || 'kid_male')
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

  function getHeroTypeLabel(heroType: string) {
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-24">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
          {/* Family Name Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
          {/* Parents Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Kids Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isParent = currentMember?.role === 'parent'
  const parents = members.filter(m => m.role === 'parent')
  const kids = members.filter(m => m.role === 'kid')

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-6 py-3 rounded-xl shadow-lg font-medium ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ←
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              👨‍👩‍👧‍👦 Family
            </h1>
          </div>
          <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-lg hover:ring-2 hover:ring-blue-500 transition-all">
            👤
          </Link>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Family Name Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-2xl">
                🏠
              </div>
              {isEditingFamilyName ? (
                <input
                  type="text"
                  value={editFamilyName}
                  onChange={(e) => setEditFamilyName(e.target.value)}
                  className="text-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded-lg border-2 border-blue-500 focus:outline-none"
                  autoFocus
                />
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {family?.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
            {isParent && (
              isEditingFamilyName ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingFamilyName(false)
                      setEditFamilyName(family?.name || '')
                    }}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFamilyName}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingFamilyName(true)}
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                >
                  ✏️ Edit
                </button>
              )
            )}
          </div>
        </div>

        {/* Parents Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-1">
            Parents ({parents.length})
          </h3>
          <div className="space-y-3">
            {parents.map((member) => {
              const hero = member.heroes[0]
              const levelInfo = hero ? getLevelInfo(hero.total_xp) : null
              
              return (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl shadow-md">
                        {hero?.avatar_url || getHeroEmoji(hero?.hero_type || '')}
                      </div>
                      {member.id === currentMember?.id && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
                          YOU
                        </div>
                      )}
                    </div>
                    
                    {/* Hero Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {hero?.hero_name || member.display_name}
                        </h4>
                        {levelInfo && (
                          <span className="px-2 py-0.5 bg-amber-400 text-gray-900 text-xs font-bold rounded-full">
                            Lv. {levelInfo.level}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">👑</span>
                      </div>
                      
                      {/* XP Progress Bar */}
                      {levelInfo && (
                        <div className="mb-2">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden relative">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500"
                              style={{ width: `${levelInfo.progressPercent}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-gray-900 dark:text-white drop-shadow">
                                {levelInfo.xpProgress} / {levelInfo.xpNeeded} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Stats Row */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <span>⭐</span>
                          <span>{hero?.total_xp || 0} XP</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>{getStreakEmoji(hero?.current_streak || 0)}</span>
                          <span>{hero?.current_streak || 0} day streak</span>
                        </span>
                        <span className="text-gray-400">{getHeroTypeLabel(hero?.hero_type || '')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Kids Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Kids ({kids.length})
            </h3>
            {isParent && (
              <button
                onClick={() => setShowAddModal(true)}
                className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700"
              >
                + Add Kid
              </button>
            )}
          </div>
          
          {kids.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-4xl mb-3">👶</div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No kids in the family yet
              </p>
              {isParent && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
                >
                  Add Your First Kid
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {kids.map((member) => {
                const hero = member.heroes[0]
                const levelInfo = hero ? getLevelInfo(hero.total_xp) : null
                
                return (
                  <div
                    key={member.id}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 shadow-lg border border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-3xl shadow-md">
                          {hero?.avatar_url || getHeroEmoji(hero?.hero_type || '')}
                        </div>
                        {hero?.current_streak > 0 && (
                          <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                            {hero.current_streak}
                          </div>
                        )}
                      </div>
                      
                      {/* Hero Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            {hero?.hero_name || member.display_name}
                          </h4>
                          {levelInfo && (
                            <span className="px-2 py-0.5 bg-amber-400 text-gray-900 text-xs font-bold rounded-full">
                              Lv. {levelInfo.level}
                            </span>
                          )}
                        </div>
                        
                        {/* XP Progress Bar */}
                        {levelInfo && (
                          <div className="mb-2">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden relative">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                                style={{ width: `${levelInfo.progressPercent}%` }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-gray-900 dark:text-white drop-shadow">
                                  {levelInfo.xpProgress} / {levelInfo.xpNeeded} XP
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span>⭐</span>
                            <span>{hero?.total_xp || 0} XP</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>{getStreakEmoji(hero?.current_streak || 0)}</span>
                            <span>{hero?.current_streak || 0} day streak</span>
                          </span>
                          <span className="text-gray-400">{getHeroTypeLabel(hero?.hero_type || '')}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      {isParent && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeletingMember(member)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Family Stats */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📊 Family Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {members.reduce((sum, m) => sum + (m.heroes[0]?.total_xp || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total XP</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.max(...members.map(m => m.heroes[0]?.current_streak || 0))}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Best Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.max(...members.map(m => m.heroes[0] ? getLevelInfo(m.heroes[0].total_xp).level : 1))}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Highest Level</div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Kid Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ➕ Add a New Hero
            </h2>
            <form onSubmit={handleAddKid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kid&apos;s Real Name
                </label>
                <input
                  type="text"
                  value={newKidName}
                  onChange={(e) => setNewKidName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="e.g., Emma"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hero Name
                </label>
                <input
                  type="text"
                  value={newHeroName}
                  onChange={(e) => setNewHeroName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="e.g., Super Emma"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hero Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewHeroType('kid_male')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      newHeroType === 'kid_male'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-3xl">🧒</span>
                    <div className="text-sm mt-1 font-medium">Hero Boy</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewHeroType('kid_female')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      newHeroType === 'kid_female'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-3xl">👧</span>
                    <div className="text-sm mt-1 font-medium">Hero Girl</div>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewKidName('')
                    setNewHeroName('')
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !newKidName.trim() || !newHeroName.trim()}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-medium transition-colors"
                >
                  {adding ? 'Adding...' : 'Add Hero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ✏️ Edit Hero
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Real Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hero Name
                </label>
                <input
                  type="text"
                  value={editHeroName}
                  onChange={(e) => setEditHeroName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hero Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {editingMember.role === 'parent' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditHeroType('super_mommy')}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          editHeroType === 'super_mommy'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <span className="text-2xl">🦸‍♀️</span>
                        <div className="text-xs mt-1">Super Mommy</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditHeroType('super_daddy')}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
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
                        type="button"
                        onClick={() => setEditHeroType('kid_male')}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          editHeroType === 'kid_male'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <span className="text-2xl">🧒</span>
                        <div className="text-xs mt-1">Hero Boy</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditHeroType('kid_female')}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
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
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editDisplayName.trim() || !editHeroName.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Remove {deletingMember.heroes[0]?.hero_name || deletingMember.display_name}?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This will remove all their XP, badges, and progress. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingMember(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMember}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-medium transition-colors"
                >
                  {deleting ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
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
          <Link href="/dashboard/quests" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="text-xl">🗺️</span>
            <span className="text-xs">Quests</span>
          </Link>
          <Link href="/dashboard/family" className="flex-1 py-3 flex flex-col items-center gap-1 text-green-600 dark:text-green-400 font-semibold border-t-2 border-green-600">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <span className="text-xs">Family</span>
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
