'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { createFamilyWithParent, addKidToFamily, type HeroType } from '@/lib/family'
import { createTask, completeTask, createDefaultTasks } from '@/lib/tasks'

type OnboardingStep = 'launch' | 'hero' | 'task' | 'complete' | 'reward' | 'family' | 'signup' | 'dashboard'

const HERO_OPTIONS: { type: HeroType; emoji: string; label: string }[] = [
  { type: 'super_mommy', emoji: '🦸‍♀️', label: 'Super Mommy' },
  { type: 'super_daddy', emoji: '🦸‍♂️', label: 'Super Daddy' },
  { type: 'kid_female', emoji: '👧', label: 'Hero Girl' },
  { type: 'kid_male', emoji: '🧒', label: 'Hero Boy' },
]

const KID_OPTIONS: { type: 'kid_male' | 'kid_female'; emoji: string; label: string }[] = [
  { type: 'kid_female', emoji: '👧', label: 'Hero Girl' },
  { type: 'kid_male', emoji: '🧒', label: 'Hero Boy' },
]

const SUGGESTED_TASKS = [
  { title: 'Make your bed', emoji: '🛏️', xp: 10 },
  { title: 'Brush your teeth', emoji: '🦷', xp: 5 },
  { title: 'Clean your room', emoji: '🧹', xp: 15 },
  { title: 'Do homework', emoji: '📚', xp: 20 },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>('launch')
  const [progress, setProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  
  // Hero state
  const [selectedHero, setSelectedHero] = useState<HeroType>('super_mommy')
  const [heroName, setHeroName] = useState('')
  const [familyName, setFamilyName] = useState('')
  
  // Task state
  const [selectedTask, setSelectedTask] = useState(SUGGESTED_TASKS[0])
  const [customTaskTitle, setCustomTaskTitle] = useState('')
  
  // Family/Hero creation state
  const [completing, setCompleting] = useState(false)
  const [earnedXp, setEarnedXp] = useState(0)
  
  // Pending data (saved before signup)
  const [pendingTaskTitle, setPendingTaskTitle] = useState('')
  const [pendingTaskXp, setPendingTaskXp] = useState(10)
  
  // Add family member state
  const [showAddKidModal, setShowAddKidModal] = useState(false)
  const [newKidName, setNewKidName] = useState('')
  const [newKidHeroName, setNewKidHeroName] = useState('')
  const [newKidHeroType, setNewKidHeroType] = useState<'kid_male' | 'kid_female'>('kid_male')
  const [addedKids, setAddedKids] = useState<{ name: string; heroName: string; emoji: string }[]>([])
  const [pendingKids, setPendingKids] = useState<{ name: string; heroName: string; heroType: 'kid_male' | 'kid_female' }[]>([])
  
  // Animation states
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [showStarsAnimation, setShowStarsAnimation] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  // Check if user is already authenticated on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true)
      }
    })
  }, [])

  function getProgressPercent(s: OnboardingStep): number {
    switch (s) {
      case 'launch': return 0
      case 'hero': return 12
      case 'task': return 25
      case 'complete': return 40
      case 'reward': return 55
      case 'family': return 70
      case 'signup': return 85
      case 'dashboard': return 100
      default: return 0
    }
  }

  async function goToStep(newStep: OnboardingStep) {
    setIsTransitioning(true)
    await new Promise(r => setTimeout(r, 200))
    setStep(newStep)
    setProgress(getProgressPercent(newStep))
    setIsTransitioning(false)
  }

  function handleGetStarted() {
    goToStep('hero')
  }

  function handleAlreadyHaveAccount() {
    router.push('/login?redirect=/onboarding')
  }

  function handleGuestSignIn() {
    // Future: implement guest sign-in for other parents/kids
    alert('Guest sign-in coming soon!')
  }

  async function handleHeroContinue() {
    const finalHeroName = heroName.trim() || HERO_OPTIONS.find(h => h.type === selectedHero)?.label || 'Hero'
    const finalFamilyName = familyName.trim() || 'The Heroes'
    setHeroName(finalHeroName)
    setFamilyName(finalFamilyName)
    await goToStep('task')
  }

  async function handleTaskSelect() {
    // Save the task info for later creation after signup
    const taskTitle = customTaskTitle.trim() || selectedTask.title
    const taskXp = customTaskTitle.trim() ? 10 : selectedTask.xp
    setPendingTaskTitle(taskTitle)
    setPendingTaskXp(taskXp)
    setEarnedXp(taskXp)
    await goToStep('complete')
  }

  async function handleCompleteTask() {
    // Simulate task completion (actual creation happens after signup)
    setCompleting(true)
    await new Promise(r => setTimeout(r, 800))
    setCompleting(false)
    
    // Go to reward screen
    await goToStep('reward')
    
    // Start animations
    setTimeout(() => setShowXpAnimation(true), 300)
    setTimeout(() => setShowStarsAnimation(true), 800)
  }

  async function handleRewardContinue() {
    await goToStep('family')
  }

  function handleAddKidPending() {
    if (!newKidName.trim() || !newKidHeroName.trim()) return
    
    const kidEmoji = KID_OPTIONS.find(k => k.type === newKidHeroType)?.emoji || '👤'
    
    // Save kid for later creation after signup
    setPendingKids(prev => [...prev, {
      name: newKidName.trim(),
      heroName: newKidHeroName.trim(),
      heroType: newKidHeroType,
    }])
    
    setAddedKids(prev => [...prev, { 
      name: newKidName.trim(), 
      heroName: newKidHeroName.trim(),
      emoji: kidEmoji 
    }])
    
    setNewKidName('')
    setNewKidHeroName('')
    setShowAddKidModal(false)
  }

  async function handleFamilyContinue() {
    // If already authenticated, create everything now
    if (isAuthenticated) {
      await createAllData()
      await goToStep('dashboard')
      startDashboardHighlights()
    } else {
      await goToStep('signup')
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters')
      return
    }
    
    setAuthLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        setAuthError(error.message)
        setAuthLoading(false)
        return
      }
      
      if (data.user) {
        setIsAuthenticated(true)
        
        // Now create all the data with the authenticated user
        await createAllData()
        
        await goToStep('dashboard')
        startDashboardHighlights()
      }
    } catch {
      setAuthError('An unexpected error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  async function createAllData() {
    try {
      const finalHeroName = heroName.trim() || HERO_OPTIONS.find(h => h.type === selectedHero)?.label || 'Hero'
      const finalFamilyName = familyName.trim() || 'The Heroes'
      
      // Create family, member, and hero
      const result = await createFamilyWithParent(
        finalFamilyName,
        finalHeroName,
        finalHeroName,
        selectedHero
      )
      
      if ('error' in result) {
        console.error('Error creating family:', result.error)
        return
      }
      
      // Create the first task
      const task = await createTask({
        familyId: result.family.id,
        title: pendingTaskTitle,
        description: 'Your first heroic task!',
        xpReward: pendingTaskXp,
        frequency: 'daily',
        createdByMemberId: result.member.id,
      })
      
      if (task) {
        // Complete the task
        await completeTask({
          taskId: task.id,
          heroId: result.hero.id,
          xpReward: pendingTaskXp,
        })
      }
      
      // Create default daily tasks for the family
      await createDefaultTasks(result.family.id, result.member.id)
      
      // Add any pending kids
      for (const kid of pendingKids) {
        await addKidToFamily(
          result.family.id,
          kid.name,
          kid.heroName,
          kid.heroType
        )
      }
    } catch (error) {
      console.error('Error creating data:', error)
    }
  }

  function startDashboardHighlights() {
    setHighlightIndex(0)
    const interval = setInterval(() => {
      setHighlightIndex(prev => {
        if (prev >= 2) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1500)
  }

  function handleFinish() {
    localStorage.removeItem('home-heroes-onboarding')
    localStorage.setItem('home-heroes-onboarded', 'true')
    router.push('/dashboard')
  }

  function getStepLabel(): string {
    switch (step) {
      case 'launch': return 'Welcome'
      case 'hero': return 'Step 1 of 7'
      case 'task': return 'Step 2 of 7'
      case 'complete': return 'Step 3 of 7'
      case 'reward': return 'Step 4 of 7'
      case 'family': return 'Step 5 of 7'
      case 'signup': return 'Step 6 of 7'
      case 'dashboard': return 'Step 7 of 7'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-purple-600 to-pink-500 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce-slow">⭐</div>
        <div className="absolute top-40 right-16 text-4xl opacity-20 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute bottom-40 left-20 text-5xl opacity-20 animate-bounce-slow" style={{ animationDelay: '1s' }}>🌟</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-bounce-slow" style={{ animationDelay: '1.5s' }}>💫</div>
      </div>

      {/* Progress bar - always visible */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Step 1: Launch Screen */}
        {step === 'launch' && (
          <div className="text-center animate-fade-in w-full max-w-sm">
            <div className="mb-8">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image 
                  src="/home-heroes-logo.png" 
                  alt="Home Heroes" 
                  width={280} 
                  height={84}
                  priority
                  className="h-20 w-auto"
                />
              </div>
              <p className="text-xl text-white/90 max-w-xs mx-auto font-medium">
                Turn everyday tasks into heroic wins.
              </p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={handleGetStarted}
                className="w-full px-8 py-4 bg-white text-purple-600 font-bold text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform active:scale-95"
              >
                Get Started
              </button>
              
              <button 
                onClick={handleAlreadyHaveAccount}
                className="w-full px-8 py-4 bg-white/20 text-white font-semibold text-lg rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all"
              >
                I Already Have an Account
              </button>
              
              <button 
                onClick={handleGuestSignIn}
                className="w-full px-8 py-3 text-white/60 font-medium text-base rounded-xl hover:text-white/80 transition-colors"
              >
                Guest Sign-In
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Your Hero */}
        {step === 'hero' && (
          <div className="w-full max-w-md animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Choose Your Hero
              </h2>
              <p className="text-white/70">
                Who will lead your family&apos;s adventures?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {HERO_OPTIONS.map((hero) => (
                <button
                  key={hero.type}
                  onClick={() => setSelectedHero(hero.type)}
                  className={`p-6 rounded-2xl transition-all duration-200 ${
                    selectedHero === hero.type
                      ? 'bg-white scale-105 shadow-2xl'
                      : 'bg-white/20 hover:bg-white/30 hover:scale-102'
                  }`}
                >
                  <div className="text-5xl mb-2">{hero.emoji}</div>
                  <div className={`font-semibold ${selectedHero === hero.type ? 'text-purple-600' : 'text-white'}`}>
                    {hero.label}
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Hero name (optional)"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                className="w-full px-5 py-4 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-lg"
              />
            </div>

            <div className="mb-8">
              <input
                type="text"
                placeholder="Family name (optional)"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-5 py-4 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => goToStep('launch')}
                className="flex-1 py-4 text-white/70 font-medium rounded-xl hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleHeroContinue}
                className="flex-[2] py-4 bg-white text-purple-600 font-bold text-lg rounded-xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Create First Task */}
        {step === 'task' && (
          <div className="w-full max-w-md animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Your First Quest
              </h2>
              <p className="text-white/70">
                Start with something simple!
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {SUGGESTED_TASKS.map((task, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedTask(task)
                    setCustomTaskTitle('')
                  }}
                  className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all duration-200 ${
                    selectedTask.title === task.title && !customTaskTitle
                      ? 'bg-white scale-[1.02] shadow-xl'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <span className="text-3xl">{task.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className={`font-semibold text-lg ${
                      selectedTask.title === task.title && !customTaskTitle ? 'text-purple-600' : 'text-white'
                    }`}>
                      {task.title}
                    </div>
                    <div className={`text-sm ${
                      selectedTask.title === task.title && !customTaskTitle ? 'text-purple-400' : 'text-white/60'
                    }`}>
                      +{task.xp} XP
                    </div>
                  </div>
                  {selectedTask.title === task.title && !customTaskTitle && (
                    <div className="text-2xl text-purple-600">✓</div>
                  )}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Or create your own..."
                  value={customTaskTitle}
                  onChange={(e) => setCustomTaskTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-lg"
                />
                {customTaskTitle && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 font-bold">
                    +10 XP
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => goToStep('hero')}
                className="flex-1 py-4 text-white/70 font-medium rounded-xl hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleTaskSelect}
                className="flex-[2] py-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold text-xl rounded-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <span>Select Task</span>
                <span className="text-2xl">🚀</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete the Task */}
        {step === 'complete' && (
          <div className="w-full max-w-md animate-scale-in text-center">
            <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
              <div className="text-6xl mb-4">
                {customTaskTitle ? '⭐' : selectedTask.emoji}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {pendingTaskTitle || customTaskTitle || selectedTask.title}
              </h3>
              <p className="text-gray-500 mb-6">
                Your first heroic quest awaits!
              </p>
              
              <button
                onClick={handleCompleteTask}
                disabled={completing}
                className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-2xl rounded-2xl shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {completing ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                    Completing...
                  </span>
                ) : (
                  <>
                    <span>Mark as Done</span>
                    <span className="text-3xl">✓</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-white/60 text-sm">
              Tap to complete your first task
            </p>
          </div>
        )}

        {/* Step 5: Reward Moment */}
        {step === 'reward' && (
          <div className="w-full max-w-md animate-scale-in text-center">
            {/* Floating stars animation */}
            {showStarsAnimation && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-4xl animate-confetti"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: '-10%',
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${1.5 + Math.random()}s`,
                    }}
                  >
                    {['⭐', '✨', '🌟', '💫', '🎉'][i % 5]}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden">
              {/* XP Animation */}
              <div className={`transition-all duration-500 ${showXpAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                <div className="text-7xl mb-4">🏆</div>
                <div className="text-5xl font-bold text-amber-500 mb-2 animate-bounce-slow">
                  +{earnedXp} XP
                </div>
                <div className="flex justify-center gap-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className="text-3xl"
                      style={{ 
                        animationDelay: `${i * 0.1}s`,
                        animation: showStarsAnimation ? 'scale-in 0.3s ease-out forwards' : 'none',
                        opacity: showStarsAnimation ? 1 : 0
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-6">
                Tasks give XP. XP makes your Hero stronger.
              </p>

              <button
                onClick={handleRewardContinue}
                className="w-full py-5 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold text-xl rounded-2xl shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
              >
                Got it 👍
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Add Family Member */}
        {step === 'family' && (
          <div className="w-full max-w-md animate-slide-up">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Want to add another Hero?
              </h2>
              <p className="text-white/70">
                Heroes are stronger together!
              </p>
            </div>

            {/* Added kids list */}
            {addedKids.length > 0 && (
              <div className="bg-white/20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                <p className="text-white/70 text-sm mb-3">Added heroes:</p>
                <div className="space-y-2">
                  {addedKids.map((kid, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/20 rounded-xl p-3">
                      <span className="text-2xl">{kid.emoji}</span>
                      <div>
                        <div className="font-semibold text-white">{kid.heroName}</div>
                        <div className="text-sm text-white/60">{kid.name}</div>
                      </div>
                      <span className="ml-auto text-green-400">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => setShowAddKidModal(true)}
                className="w-full py-5 bg-white text-purple-600 font-bold text-xl rounded-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <span className="text-2xl">➕</span>
                <span>Add Hero</span>
              </button>

              <button
                onClick={handleFamilyContinue}
                className="w-full py-4 text-white/70 font-medium rounded-xl hover:text-white transition-colors"
              >
                {addedKids.length > 0 ? 'Continue' : 'Do this later'}
              </button>
            </div>

            {/* Add Kid Modal */}
            {showAddKidModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
                <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-scale-in">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    Add a Hero
                  </h3>

                  {/* Kid type selection */}
                  <div className="flex gap-4 mb-4">
                    {KID_OPTIONS.map((kid) => (
                      <button
                        key={kid.type}
                        onClick={() => setNewKidHeroType(kid.type)}
                        className={`flex-1 p-4 rounded-xl transition-all ${
                          newKidHeroType === kid.type
                            ? 'bg-purple-100 border-2 border-purple-500'
                            : 'bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="text-4xl mb-1">{kid.emoji}</div>
                        <div className="text-sm font-medium text-gray-700">{kid.label}</div>
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Kid's name"
                    value={newKidName}
                    onChange={(e) => setNewKidName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <input
                    type="text"
                    placeholder="Hero name"
                    value={newKidHeroName}
                    onChange={(e) => setNewKidHeroName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddKidModal(false)}
                      className="flex-1 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddKidPending}
                      disabled={!newKidName.trim() || !newKidHeroName.trim()}
                      className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 7: Sign Up */}
        {step === 'signup' && (
          <div className="w-full max-w-md animate-slide-up">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔐</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Save Your Progress
              </h2>
              <p className="text-white/70">
                Create an account to keep your hero&apos;s journey!
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-lg"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-5 py-4 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-lg"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-5 py-4 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-lg"
                />
              </div>

              {authError && (
                <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-red-100 text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-5 bg-white text-purple-600 font-bold text-xl rounded-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {authLoading ? (
                  <>
                    <span className="inline-block w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => goToStep('family')}
                className="text-white/60 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 8: Dashboard Reveal */}
        {step === 'dashboard' && (
          <div className="w-full max-w-md animate-slide-up">
            {/* Success banner */}
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-4 mb-6 text-center shadow-xl">
              <div className="text-3xl mb-2">🎉</div>
              <h2 className="text-xl font-bold text-gray-900">
                You&apos;re officially a Home Hero!
              </h2>
            </div>

            {/* Mini dashboard preview */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6 space-y-4">
              {/* Hero card highlight */}
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                highlightIndex === 0 ? 'bg-blue-100 ring-2 ring-blue-500 scale-[1.02]' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-2xl">
                    {HERO_OPTIONS.find(h => h.type === selectedHero)?.emoji || '🦸'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {heroName || HERO_OPTIONS.find(h => h.type === selectedHero)?.label}
                    </div>
                    <div className="text-sm text-gray-500">Level 1 • {earnedXp} XP</div>
                  </div>
                </div>
                {highlightIndex === 0 && (
                  <div className="mt-2 text-sm text-blue-600 font-medium animate-fade-in">
                    👆 Your Hero card
                  </div>
                )}
              </div>

              {/* Progress bar highlight */}
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                highlightIndex === 1 ? 'bg-amber-100 ring-2 ring-amber-500 scale-[1.02]' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress to Level 2</span>
                  <span className="font-bold text-amber-600">{earnedXp}/100 XP</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all"
                    style={{ width: `${Math.min(earnedXp, 100)}%` }}
                  />
                </div>
                {highlightIndex === 1 && (
                  <div className="mt-2 text-sm text-amber-600 font-medium animate-fade-in">
                    👆 Your progress bar
                  </div>
                )}
              </div>

              {/* Tasks highlight */}
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                highlightIndex === 2 ? 'bg-green-100 ring-2 ring-green-500 scale-[1.02]' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Tasks</div>
                    <div className="text-sm text-gray-500">Complete tasks to earn XP</div>
                  </div>
                </div>
                {highlightIndex === 2 && (
                  <div className="mt-2 text-sm text-green-600 font-medium animate-fade-in">
                    👆 Your tasks list
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <span>Let&apos;s go!</span>
              <span className="text-2xl">🚀</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress indicator text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <span className="text-white/40 text-sm">{getStepLabel()}</span>
      </div>
    </div>
  )
}
