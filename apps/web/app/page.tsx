'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authenticated = !!session
      setIsAuthenticated(authenticated)
      setLoading(false)
      
      // Redirect to dashboard if authenticated
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-8">
            <Image 
              src="/home-heroes-logo.png" 
              alt="Home Heroes" 
              width={400} 
              height={120}
              priority
              className="h-24 md:h-28 w-auto"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 whitespace-nowrap">
              Home Heroes
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Transform household tasks into epic quests! 🦸‍♀️🦸‍♂️
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">
            A cooperative family productivity game where everyone wins together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors border-2 border-gray-200 dark:border-gray-700"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Trust-Based
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tasks grant XP immediately. No approval needed. Build family trust through positive reinforcement.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Level Up Together
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Earn XP, unlock badges, maintain streaks, and complete quests as a family team.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Kid-Safe
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Parents control everything. Kids access via shared device. GDPR & COPPA compliant.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium text-green-800 dark:text-green-300">
              Supabase Connected ✅
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
