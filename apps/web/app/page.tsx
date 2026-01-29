'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const FEATURES = [
  {
    emoji: '✨',
    title: 'Trust-Based',
    description: 'Tasks grant XP immediately. No approval needed. Build family trust through positive reinforcement.',
  },
  {
    emoji: '🎮',
    title: 'Level Up Together',
    description: 'Earn XP, unlock badges, maintain streaks, and complete quests as a family team.',
  },
  {
    emoji: '🔥',
    title: 'Streak System',
    description: 'Keep the momentum going! Maintain daily streaks for bonus XP and special rewards.',
  },
  {
    emoji: '🏅',
    title: 'Badges & Achievements',
    description: 'Unlock awesome badges for completing challenges. Collect them all!',
  },
  {
    emoji: '⚔️',
    title: 'Family Quests',
    description: 'Team up for group activities. Everyone earns XP when you complete quests together.',
  },
  {
    emoji: '🛡️',
    title: 'Kid-Safe',
    description: 'Parents control everything. Kids access via shared device. GDPR & COPPA compliant.',
  },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    emoji: '👨‍👩‍👧‍👦',
    title: 'Create Your Family',
    description: 'Sign up and add your family members. Each person becomes a Hero with their own profile.',
  },
  {
    step: 2,
    emoji: '📋',
    title: 'Set Up Tasks & Quests',
    description: 'Create daily tasks like "Make your bed" or group quests like "Family Game Night".',
  },
  {
    step: 3,
    emoji: '🎉',
    title: 'Complete & Celebrate',
    description: 'Complete tasks to earn XP, level up, unlock badges, and celebrate as a family!',
  },
]

const HERO_TYPES = [
  { emoji: '🦸‍♀️', label: 'Super Mommy' },
  { emoji: '🦸‍♂️', label: 'Super Daddy' },
  { emoji: '👧', label: 'Hero Girl' },
  { emoji: '🧒', label: 'Hero Boy' },
]

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
]

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authenticated = !!session
      setIsAuthenticated(authenticated)
      setLoading(false)
      
      if (authenticated) {
        router.push('/dashboard')
      }
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Home Heroes
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce-slow">🏠</div>
          <div className="absolute top-40 right-20 text-5xl opacity-20 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute bottom-40 left-1/4 text-4xl opacity-20 animate-bounce-slow" style={{ animationDelay: '1s' }}>🏅</div>
          <div className="absolute bottom-20 right-1/4 text-5xl opacity-20 animate-bounce-slow" style={{ animationDelay: '1.5s' }}>🔥</div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32 text-center relative">
          <div className="flex justify-center gap-4 mb-8">
            {HERO_TYPES.map((hero, i) => (
              <div
                key={hero.label}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-2xl md:text-3xl shadow-lg animate-bounce-slow"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {hero.emoji}
              </div>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Turn Chores Into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Epic Adventures
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
            Home Heroes is a family game where everyone earns XP, levels up, and unlocks badges by completing household tasks together.
          </p>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10">
            No punishment. No guilt. Just fun, progress, and family teamwork. 🦸‍♀️🦸‍♂️
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Your Adventure — Free
            </Link>
            <Link
              href="/features"
              className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold rounded-xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300"
            >
              See How It Works
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Kid-safe & GDPR compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything Your Family Needs
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A complete system for turning household tasks into a fun, rewarding game.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              From signup to superhero in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-5xl shadow-lg">
                    {step.emoji}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Become Heroes Together?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join families who are turning everyday tasks into extraordinary adventures. Start free today!
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-10 py-5 bg-white hover:bg-gray-100 text-gray-900 text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Your Free Adventure 🚀
          </Link>
          <p className="mt-6 text-white/60 text-sm">
            No credit card required • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏠</span>
                <span className="text-xl font-bold text-white">Home Heroes</span>
              </Link>
              <p className="text-sm">
                Transform household tasks into epic family adventures.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2026 Home Heroes. All rights reserved.
            </p>
            <p className="text-sm">
              Made with ❤️ for families everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
