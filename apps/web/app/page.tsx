'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

/* ─── DATA ─────────────────────────────────────────────── */

const FEATURES = [
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
  {
    emoji: '🎁',
    title: 'Unlock Rewards',
    description: 'Complete challenges to unlock special rewards and celebrate milestones as a family.',
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

const SHOWCASE_BADGES = [
  { emoji: '🎯', name: 'First Steps' },
  { emoji: '🤝', name: 'Team Player' },
  { emoji: '✨', name: 'Getting Started' },
  { emoji: '🌟', name: 'Task Master' },
  { emoji: '💯', name: 'Century Hero' },
  { emoji: '🗡️', name: 'Quest Companion' },
  { emoji: '🔥', name: 'Warming Up' },
  { emoji: '💪', name: 'Fortnight Force' },
  { emoji: '💫', name: 'XP Collector' },
  { emoji: '⚡', name: 'Unstoppable' },
]

const TRUST_ITEMS = [
  'Free forever plan',
  'No credit card required',
  'Kid-safe & GDPR compliant',
]

/* ─── COLORS ───────────────────────────────────────────── */

const SKY_BLUE = '#e8f4fd'
const DARK_NAVY = '#0f172a'
const YELLOW = '#facc15'
const YELLOW_HOVER = '#eab308'

/* ─── COMPONENT ────────────────────────────────────────── */

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
        <div className="inline-block w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/home-heroes-logo.png"
              alt="Home Heroes - Family Chores Game App for Kids and Parents"
              width={150}
              height={72}
              className="h-10 w-auto"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold rounded-full transition-all active:translate-y-0.5 text-white shadow-sm"
              style={{ backgroundColor: YELLOW }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── SECTION 1 — HERO (Gradient Blue) ──────────────── */}
      <section
        className="pt-16"
        style={{ background: 'linear-gradient(to right, #379ce5, #7acafc)' }}
      >
        <div className="max-w-[1200px] mx-auto px-4 py-20 md:py-28 lg:py-32 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 uppercase tracking-tight leading-tight" style={{ fontFamily: 'var(--font-baloo2)' }}>
            Turn Everyday Tasks
            <br />
            Into{' '}
            <span style={{ color: YELLOW }} className="inline-block drop-shadow-sm">
              Epic
            </span>{' '}
            Adventures
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-medium" style={{ fontFamily: 'var(--font-baloo2)' }}>
            Build healthy habits together as a family.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full transition-all hover:scale-105 active:scale-100 shadow-md text-white"
              style={{ backgroundColor: YELLOW }}
            >
              Start Your Adventure — Free
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-white text-gray-800 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              See How It Works
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-white font-bold">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — FEATURES GRID (White) ──────────── */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-baloo2)' }}>
              Everything Your Family Needs
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              A complete system for turning household tasks into a fun, rewarding game.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-gray-50 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Mid-CTA strip */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <span className="text-lg font-semibold text-gray-700">
              Ready to become a Home Hero?
            </span>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-100 shadow-sm"
              style={{ backgroundColor: YELLOW, color: '#1e293b' }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — 3 STEPS (Sky Blue) ─────────────── */}
      <section style={{ backgroundColor: SKY_BLUE }} className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-baloo2)' }}>
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-xl text-gray-500">
              From sign-up to superhero in minutes!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-5xl shadow-lg">
                    {step.emoji}
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-gray-900"
                    style={{ backgroundColor: YELLOW }}
                  >
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full transition-all hover:scale-105 active:scale-100 shadow-md"
              style={{ backgroundColor: YELLOW, color: '#1e293b' }}
            >
              Start Your Adventure — Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — BADGES SHOWCASE (Dark Navy) ────── */}
      <section style={{ backgroundColor: DARK_NAVY }} className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'var(--font-baloo2)' }}>
              Collect{' '}
              <span style={{ color: YELLOW }}>Epic</span>{' '}
              Badges
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Collect all badges and become Legendary!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
            {SHOWCASE_BADGES.map((badge) => (
              <div
                key={badge.name}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl md:text-4xl">
                  {badge.emoji}
                </div>
                <span className="text-sm font-medium text-gray-300 text-center">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 text-lg">
            … and many more!
          </p>
        </div>
      </section>

      {/* ── SECTION 5 — FINAL CTA (Sky Blue) ───────────── */}
      <section style={{ backgroundColor: SKY_BLUE }} className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-baloo2)' }}>
            Ready to Become Heroes Together?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join families who are turning everyday tasks into extraordinary adventures. Start free today!
          </p>

          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold rounded-full transition-all hover:scale-105 active:scale-100 shadow-lg"
            style={{ backgroundColor: YELLOW, color: '#1e293b' }}
          >
            Start Your Adventure — Free
          </Link>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mt-10">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER (Dark Navy) ─────────────────────────── */}
      <footer style={{ backgroundColor: DARK_NAVY }} className="text-gray-400">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center mb-4">
                <Image
                  src="/home-heroes-logo.png"
                  alt="Home Heroes - Gamified Household Tasks for Families"
                  width={150}
                  height={72}
                  className="h-10 w-auto"
                />
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
            <p className="text-sm">© 2026 Home Heroes. All rights reserved.</p>
            <p className="text-sm">Made with ❤️ for families everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
