'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createFamilyWithParent, getUserFamily, type HeroType } from '@/lib/family'

const HERO_TYPES = [
  { value: 'super_mommy' as HeroType, label: 'Super Mommy', icon: '🦸‍♀️', desc: 'Mother hero' },
  { value: 'super_daddy' as HeroType, label: 'Super Daddy', icon: '🦸‍♂️', desc: 'Father hero' },
]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [checkingExisting, setCheckingExisting] = useState(true)
  
  // Step 1: Family name
  const [familyName, setFamilyName] = useState('')
  
  // Step 2: Parent info
  const [parentName, setParentName] = useState('')
  const [heroName, setHeroName] = useState('')
  const [heroType, setHeroType] = useState<HeroType>('super_mommy')
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Check if user already has a family
  useEffect(() => {
    const checkExistingFamily = async () => {
      console.log('🔵 Setup: Checking for existing family...')
      const existing = await getUserFamily()
      console.log('🔵 Setup: Existing family check:', existing)
      
      if (existing) {
        console.log('✅ Setup: Family exists, redirecting to dashboard')
        window.location.href = '/dashboard'
        return
      }
      
      console.log('🔵 Setup: No family found, showing setup form')
      setCheckingExisting(false)
    }

    checkExistingFamily()
  }, [])

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyName.trim()) {
      setError('Please enter a family name')
      return
    }
    setError(null)
    setStep(2)
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!parentName.trim() || !heroName.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔵 Setup: Creating family...')
      const result = await createFamilyWithParent(
        familyName.trim(),
        parentName.trim(),
        heroName.trim(),
        heroType
      )

      console.log('🔵 Setup: Family creation result:', result)

      if ('error' in result) {
        console.error('🔴 Setup: Family creation failed:', result.error)
        setError(result.error)
        setLoading(false)
        return
      }

      // Success! Hard redirect to dashboard (forces full page reload)
      console.log('✅ Setup: Family created successfully! Family ID:', result.family.id)
      console.log('✅ Setup: Redirecting to dashboard...')
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('🔴 Setup: Unexpected error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🦸 Welcome to Home Heroes!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's set up your Hero HQ
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Step 1: Family Name */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What's your family name?
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="The Smith Family"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This will be the name of your Hero HQ
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>
        )}

        {/* Step 2: Parent Hero Setup */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Hero Name
              </label>
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                placeholder="Captain Clean"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your hero identity in the family
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Your Hero Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                {HERO_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setHeroType(type.value)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      heroType === type.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-4xl mb-2">{type.icon}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {type.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {type.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Hero HQ'}
              </button>
            </div>
          </form>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-purple-800 dark:text-purple-300 text-center">
            💡 You can add family members and kids after setup
          </p>
        </div>
      </div>
    </div>
  )
}
