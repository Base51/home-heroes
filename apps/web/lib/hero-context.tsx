'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { supabase } from './supabase'
import { getUserFamily, getFamilyMembersWithHeroes, type HeroType } from './family'
import { getLevelFromXP } from './levels'

export interface Hero {
  id: string
  family_member_id: string
  hero_name: string
  hero_type: HeroType
  avatar_url?: string
  level: number
  total_xp: number
  current_streak: number
  role: 'parent' | 'kid'
  display_name: string
}

interface HeroContextType {
  activeHero: Hero | null
  setActiveHero: (hero: Hero) => void
  updateHeroXP: (heroId: string, xpGained: number) => void
  updateHeroAvatar: (heroId: string, avatar: string) => void
  heroes: Hero[]
  isParentView: boolean
  toggleParentView: () => void
  loading: boolean
  familyId: string | null
  familyName: string | null
  refreshHeroes: () => Promise<void>
}

const HeroContext = createContext<HeroContextType | undefined>(undefined)

const ACTIVE_HERO_KEY = 'home_heroes_active_hero_id'
const VIEW_MODE_KEY = 'home_heroes_view_mode'

export function HeroProvider({ children }: { children: ReactNode }) {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [activeHero, setActiveHeroState] = useState<Hero | null>(null)
  const [isParentView, setIsParentView] = useState(true)
  const [loading, setLoading] = useState(true)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [familyName, setFamilyName] = useState<string | null>(null)

  // Load heroes from family
  const loadHeroes = useCallback(async () => {
    try {
      console.log('🔵 HeroContext: Loading heroes...')
      const family = await getUserFamily()
      if (!family) {
        console.log('🔴 HeroContext: No family found')
        setLoading(false)
        return
      }

      console.log('✅ HeroContext: Family found:', family.name)
      setFamilyId(family.id)
      setFamilyName(family.name)

      const members = await getFamilyMembersWithHeroes(family.id)
      console.log('🔵 HeroContext: Family members loaded:', members.length)
      
      // Transform family members with heroes into Hero array
      // Note: heroes can be an object (1:1 relationship) or array
      const heroList: Hero[] = members
        .filter((member: { heroes: Hero | Hero[] | null }) => {
          // Handle both object and array cases
          if (!member.heroes) return false
          if (Array.isArray(member.heroes)) return member.heroes.length > 0
          return true // It's an object (single hero)
        })
        .map((member: { heroes: Hero | Hero[]; role: 'parent' | 'kid'; display_name: string }) => {
          // Get the hero - could be object or first element of array
          const hero = Array.isArray(member.heroes) ? member.heroes[0] : member.heroes
          return {
            ...hero,
            role: member.role,
            display_name: member.display_name,
          }
        })

      console.log('✅ HeroContext: Heroes extracted:', heroList.length, heroList.map(h => h.hero_name))
      setHeroes(heroList)

      // Restore active hero from localStorage
      const savedHeroId = localStorage.getItem(ACTIVE_HERO_KEY)
      console.log('🔵 HeroContext: Saved hero ID:', savedHeroId)
      
      if (savedHeroId) {
        const savedHero = heroList.find(h => h.id === savedHeroId)
        if (savedHero) {
          console.log('✅ HeroContext: Restoring saved hero:', savedHero.hero_name)
          setActiveHeroState(savedHero)
        } else if (heroList.length > 0) {
          // Fallback to first hero
          console.log('🔵 HeroContext: Saved hero not found, using first:', heroList[0].hero_name)
          setActiveHeroState(heroList[0])
        }
      } else if (heroList.length > 0) {
        // Default to first hero (usually the parent)
        console.log('🔵 HeroContext: No saved hero, using first:', heroList[0].hero_name)
        setActiveHeroState(heroList[0])
        localStorage.setItem(ACTIVE_HERO_KEY, heroList[0].id)
      }

      // Restore view mode
      const savedViewMode = localStorage.getItem(VIEW_MODE_KEY)
      if (savedViewMode) {
        setIsParentView(savedViewMode === 'parent')
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading heroes:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHeroes()
  }, [loadHeroes])

  // Subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadHeroes()
    })

    return () => subscription.unsubscribe()
  }, [loadHeroes])

  const setActiveHero = (hero: Hero) => {
    setActiveHeroState(hero)
    localStorage.setItem(ACTIVE_HERO_KEY, hero.id)
    
    // When selecting a kid hero, switch to play mode
    if (hero.role === 'kid') {
      setIsParentView(false)
      localStorage.setItem(VIEW_MODE_KEY, 'play')
    }
  }

  const toggleParentView = () => {
    setIsParentView(prev => {
      const newValue = !prev
      localStorage.setItem(VIEW_MODE_KEY, newValue ? 'parent' : 'play')
      return newValue
    })
  }

  // Update hero XP locally for immediate UI feedback (filling animation)
  const updateHeroXP = (heroId: string, xpGained: number) => {
    // Update the active hero if it matches
    setActiveHeroState(prev => {
      if (prev && prev.id === heroId) {
        const newXP = (prev.total_xp || 0) + xpGained
        return { ...prev, total_xp: newXP, level: getLevelFromXP(newXP) }
      }
      return prev
    })
    
    // Also update in the heroes list
    setHeroes(prev => prev.map(h => {
      if (h.id === heroId) {
        const newXP = (h.total_xp || 0) + xpGained
        return { ...h, total_xp: newXP, level: getLevelFromXP(newXP) }
      }
      return h
    }))
  }

  // Update hero avatar locally for immediate UI feedback
  const updateHeroAvatar = (heroId: string, avatar: string) => {
    // Update the active hero if it matches
    setActiveHeroState(prev => {
      if (prev && prev.id === heroId) {
        return { ...prev, avatar_url: avatar }
      }
      return prev
    })
    
    // Also update in the heroes list
    setHeroes(prev => prev.map(h => 
      h.id === heroId 
        ? { ...h, avatar_url: avatar }
        : h
    ))
  }

  const refreshHeroes = async () => {
    await loadHeroes()
  }

  return (
    <HeroContext.Provider value={{
      activeHero,
      setActiveHero,
      updateHeroXP,
      updateHeroAvatar,
      heroes,
      isParentView,
      toggleParentView,
      loading,
      familyId,
      familyName,
      refreshHeroes,
    }}>
      {children}
    </HeroContext.Provider>
  )
}

export function useHero() {
  const context = useContext(HeroContext)
  if (!context) {
    throw new Error('useHero must be used within HeroProvider')
  }
  return context
}

/**
 * Get emoji for hero type
 */
export function getHeroEmoji(heroType: HeroType): string {
  switch (heroType) {
    case 'super_mommy':
      return '🦸‍♀️'
    case 'super_daddy':
      return '🦸‍♂️'
    case 'kid_male':
      return '🧒'
    case 'kid_female':
      return '👧'
    default:
      return '👤'
  }
}
