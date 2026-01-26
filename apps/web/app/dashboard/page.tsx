'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import { getUserFamily, getFamilyMembersWithHeroes, type Family } from '@/lib/family'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingFamily, setCheckingFamily] = useState(true)

  useEffect(() => {
    console.log('🔵 Dashboard: Starting auth check...')
    // Check authentication
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        console.log('🔴 Dashboard: No session, redirecting to login')
        router.push('/login?redirect=/dashboard')
        return
      }
      console.log('✅ Dashboard: User authenticated:', session.user.id)
      setUser(session.user)
      setLoading(false)

      // Check if user has a family (don't block page load)
      try {
        console.log('🔵 Dashboard: Checking for family...')
        const userFamily = await getUserFamily()
        console.log('🔵 Dashboard: Family check result:', userFamily)
        
        if (!userFamily) {
          console.log('🔴 Dashboard: No family found, redirecting to setup')
          setCheckingFamily(false)
          router.push('/setup')
          return
        }

        console.log('✅ Dashboard: Family found:', userFamily.id, userFamily.name)
        setFamily(userFamily)
        
        // Load family members with heroes
        console.log('🔵 Dashboard: Loading family members...')
        const members = await getFamilyMembersWithHeroes(userFamily.id)
        console.log('✅ Dashboard: Loaded', members.length, 'family members')
        setFamilyMembers(members)
        setCheckingFamily(false)
      } catch (error) {
        console.error('🔴 Dashboard: Error loading family:', error)
        setCheckingFamily(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/login?redirect=/dashboard')
          return
        }
        setUser(session.user)
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      // The auth state change listener will handle the redirect
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading || checkingFamily) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {checkingFamily ? 'Checking your Hero HQ...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🦸 {family?.name || 'Hero HQ'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                ⚙️ Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Your Hero HQ! 🎉
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your family is all set up
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Family Info */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Family Information
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Family Name:
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-semibold">
                    {family?.name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Family Members:
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-semibold">
                    {familyMembers.length}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Family Members */}
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                👥 Family Heroes
              </h3>
              <div className="space-y-4">
                {familyMembers.map((member: any) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">
                        {member.heroes[0]?.hero_type === 'super_mommy' && '🦸‍♀️'}
                        {member.heroes[0]?.hero_type === 'super_daddy' && '🦸‍♂️'}
                        {member.heroes[0]?.hero_type === 'kid_male' && '🧒'}
                        {member.heroes[0]?.hero_type === 'kid_female' && '👧'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {member.heroes[0]?.hero_name || member.display_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.display_name} • Level {member.heroes[0]?.level || 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.heroes[0]?.total_xp || 0} XP
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {member.role === 'parent' ? '👑 Parent' : '🎮 Kid'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-3">
                🚀 Next Steps
              </h3>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-400">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Add more family members (kids)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Create your first task</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Set up a family quest</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Start earning XP and leveling up!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
