'use client'

import { useState } from 'react'
import { BRAND_COLORS } from '@/components/ui'

/**
 * Curated avatar options organized by category
 * Includes diverse options suitable for family members
 */
export const AVATAR_OPTIONS = {
  heroes: ['🦸‍♀️', '🦸‍♂️', '🦹‍♀️', '🦹‍♂️', '🧙‍♀️', '🧙‍♂️', '🧚‍♀️', '🧚‍♂️', '🧝‍♀️', '🧝‍♂️'],
  people: ['👩', '👨', '👧', '🧒', '👶', '🧑', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱'],
  animals: ['🦁', '🐯', '🐻', '🐼', '🦊', '🐰', '🐸', '🐵', '🦄', '🐲'],
  fun: ['🤖', '👽', '👻', '🎃', '⭐', '🌟', '💫', '🔥', '💪', '🏆'],
  nature: ['🌸', '🌺', '🌻', '🌈', '🦋', '🐝', '🍀', '🌙', '☀️', '⚡'],
  sports: ['⚽', '🏀', '🎾', '🏈', '🎮', '🎯', '🎸', '🎨', '📚', '✏️'],
}

export interface AvatarPickerProps {
  currentAvatar: string
  onSelect: (avatar: string) => void
  onClose: () => void
}

export function AvatarPicker({ currentAvatar, onSelect, onClose }: AvatarPickerProps) {
  const [selected, setSelected] = useState(currentAvatar)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSelect(selected)
    setSaving(false)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Choose Your Avatar
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Preview */}
        <div className="p-6 flex flex-col items-center bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-5xl shadow-lg ring-4 ring-white dark:ring-gray-700">
            {selected}
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Tap an emoji below to change
          </p>
        </div>

        {/* Avatar Grid */}
        <div className="px-4 pb-4 max-h-64 overflow-y-auto custom-scrollbar">
          {Object.entries(AVATAR_OPTIONS).map(([category, avatars]) => (
            <div key={category} className="mb-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
                {category}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {avatars.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelected(avatar)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-150 ${
                      selected === avatar
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 scale-110 shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selected === currentAvatar}
            className="flex-1 px-4 py-3 text-white font-semibold rounded-xl transition-all duration-100 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:translate-y-0"
            style={{ 
              backgroundColor: saving || selected === currentAvatar ? '#9ca3af' : BRAND_COLORS.primary,
              boxShadow: saving || selected === currentAvatar ? 'none' : `0 4px 0 ${BRAND_COLORS.primaryDark}`
            }}
          >
            {saving ? 'Saving...' : 'Save Avatar'}
          </button>
        </div>
      </div>
    </div>
  )
}
