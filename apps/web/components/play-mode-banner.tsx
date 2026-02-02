'use client'

import { useHero, getHeroEmoji } from '@/lib/hero-context'

/**
 * Banner displayed when in Kid/Play Mode
 * Shows the active hero and provides a way to switch back to parent view
 */
export function PlayModeBanner() {
  const { activeHero, isParentView, toggleParentView } = useHero()

  // Only show when in Play Mode (not Parent View)
  if (isParentView || !activeHero) return null

  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-4 py-2">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎮</span>
          <span className="font-medium text-sm">
            Playing as <span className="font-bold">{activeHero.hero_name}</span>
          </span>
          <span className="text-lg">{getHeroEmoji(activeHero.hero_type)}</span>
        </div>
        <button
          onClick={toggleParentView}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors font-medium"
        >
          👁️ Parent View
        </button>
      </div>
    </div>
  )
}

/**
 * Small badge indicator for Play Mode in the header
 */
export function PlayModeBadge() {
  const { isParentView } = useHero()

  if (isParentView) return null

  return (
    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
      🎮 PLAY
    </span>
  )
}
