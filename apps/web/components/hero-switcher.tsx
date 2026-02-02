'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useHero, getHeroEmoji } from '@/lib/hero-context'

export function HeroSwitcher() {
  const { activeHero, heroes, setActiveHero, isParentView, toggleParentView, loading } = useHero()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse">
        <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="hidden sm:block w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
    )
  }

  // Show profile link if no heroes yet
  if (!activeHero) {
    return (
      <Link
        href="/dashboard/profile"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="text-xl">👤</span>
        <span className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300">
          Profile
        </span>
      </Link>
    )
  }

  const parentHeroes = heroes.filter(h => h.role === 'parent')
  const kidHeroes = heroes.filter(h => h.role === 'kid')

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="text-xl">{getHeroEmoji(activeHero.hero_type)}</span>
        <div className="hidden sm:block text-left">
          <span className="font-medium text-sm text-gray-900 dark:text-white block leading-tight">
            {activeHero.hero_name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Lv.{activeHero.level}
          </span>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-scale-in">
          {/* View Mode Toggle */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                toggleParentView()
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isParentView 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{isParentView ? '👁️' : '🎮'}</span>
              <div>
                <p className="font-medium text-sm">
                  {isParentView ? 'Parent View' : 'Play Mode'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isParentView ? 'See all heroes' : 'Playing as ' + activeHero.hero_name}
                </p>
              </div>
            </button>
          </div>

          {/* Hero List */}
          <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
            {/* Parents Section */}
            {parentHeroes.length > 0 && (
              <>
                <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  👑 Parents
                </p>
                {parentHeroes.map((hero) => (
                  <HeroOption
                    key={hero.id}
                    hero={hero}
                    isActive={activeHero.id === hero.id}
                    onSelect={() => {
                      setActiveHero(hero)
                      setIsOpen(false)
                    }}
                  />
                ))}
              </>
            )}

            {/* Kids Section */}
            {kidHeroes.length > 0 && (
              <>
                <p className="px-3 py-1 mt-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  🦸 Kids
                </p>
                {kidHeroes.map((hero) => (
                  <HeroOption
                    key={hero.id}
                    hero={hero}
                    isActive={activeHero.id === hero.id}
                    onSelect={() => {
                      setActiveHero(hero)
                      setIsOpen(false)
                    }}
                  />
                ))}
              </>
            )}

            {heroes.length === 0 && (
              <p className="px-3 py-4 text-sm text-gray-500 text-center">
                No heroes yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface HeroOptionProps {
  hero: {
    id: string
    hero_name: string
    hero_type: 'super_mommy' | 'super_daddy' | 'kid_male' | 'kid_female'
    level: number
    total_xp: number
    current_streak: number
    role: 'parent' | 'kid'
  }
  isActive: boolean
  onSelect: () => void
}

function HeroOption({ hero, isActive, onSelect }: HeroOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xl shadow-sm">
        {getHeroEmoji(hero.hero_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
          {hero.hero_name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Lv.{hero.level}</span>
          {hero.current_streak > 0 && (
            <span className="flex items-center gap-0.5">
              <span className="text-orange-500">🔥</span>
              {hero.current_streak}
            </span>
          )}
        </div>
      </div>
      {isActive && (
        <span className="text-blue-600 dark:text-blue-400 text-lg">✓</span>
      )}
    </button>
  )
}
