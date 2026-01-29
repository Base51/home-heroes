'use client'

import { ReactNode } from 'react'

/**
 * Skeleton loading component
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  )
}

/**
 * Card skeleton for list items
 */
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Page loading skeleton
 */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mt-4 rounded-full" />
      </div>
      
      {/* Cards skeleton */}
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Animated XP burst for celebrations
 */
export function XPBurst({ xp, onComplete }: { xp: number; onComplete?: () => void }) {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      onAnimationEnd={onComplete}
    >
      <div className="animate-xp-burst text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 drop-shadow-lg">
        +{xp} XP!
      </div>
    </div>
  )
}

/**
 * Confetti particles for celebrations
 */
export function Confetti() {
  const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#ec4899']
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${1 + Math.random() * 1}s`,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            backgroundColor: p.color,
            left: p.left,
            top: '-10px',
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Toast notification component
 */
export function Toast({ 
  message, 
  type = 'success',
  onClose 
}: { 
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  onClose?: () => void 
}) {
  const styles = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    error: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
    info: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className={`${styles[type]} px-6 py-3 rounded-2xl shadow-2xl font-medium flex items-center gap-2`}>
        <span>{icons[type]}</span>
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
            ×
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Animated counter for XP and stats
 */
export function AnimatedNumber({ value, duration = 500 }: { value: number; duration?: number }) {
  return (
    <span className="tabular-nums transition-all duration-300">
      {value.toLocaleString()}
    </span>
  )
}

/**
 * Progress bar with animation
 */
export function ProgressBar({ 
  progress, 
  color = 'from-blue-500 to-purple-500',
  height = 'h-3',
  showGlow = false 
}: { 
  progress: number
  color?: string
  height?: string
  showGlow?: boolean
}) {
  return (
    <div className={`${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative`}>
      <div
        className={`h-full bg-gradient-to-r ${color} transition-all duration-700 ease-out rounded-full ${
          showGlow ? 'shadow-lg shadow-blue-500/30' : ''
        }`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      >
        {showGlow && progress > 5 && (
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-sm animate-pulse" />
        )}
      </div>
    </div>
  )
}

/**
 * Button with loading state
 */
export function Button({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-semibold rounded-xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * Empty state component
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border border-gray-200 dark:border-gray-700 text-center">
      <div className="text-6xl mb-4 animate-bounce-slow">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{description}</p>
      {action}
    </div>
  )
}

/**
 * Badge/pill component
 */
export function Badge({
  children,
  variant = 'default',
  size = 'sm',
}: {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'xs' | 'sm' | 'md'
}) {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  }

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={`${variants[variant]} ${sizes[size]} font-medium rounded-full inline-flex items-center`}>
      {children}
    </span>
  )
}

/**
 * Card with hover effect
 */
export function Card({
  children,
  className = '',
  hover = true,
  onClick,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md 
        border border-gray-200 dark:border-gray-700
        ${hover ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

/**
 * Avatar component
 */
export function Avatar({
  emoji,
  size = 'md',
  gradient = 'from-blue-400 to-purple-400',
  badge,
}: {
  emoji: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  gradient?: string
  badge?: ReactNode
}) {
  const sizes = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-24 h-24 text-5xl',
  }

  return (
    <div className="relative">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        {emoji}
      </div>
      {badge && (
        <div className="absolute -bottom-1 -right-1">
          {badge}
        </div>
      )}
    </div>
  )
}

/**
 * Streak badge component
 */
export function StreakBadge({ streak }: { streak: number }) {
  if (streak <= 0) return null
  
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
      🔥 {streak}
    </div>
  )
}

/**
 * XP badge component
 */
export function XPBadge({ xp }: { xp: number }) {
  return (
    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 text-sm font-bold px-3 py-1 rounded-full shadow-md">
      +{xp} XP
    </div>
  )
}

/**
 * Level badge component
 */
export function LevelBadge({ level, title }: { level: number; title?: string }) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
      Lv.{level}{title && ` ${title}`}
    </div>
  )
}
