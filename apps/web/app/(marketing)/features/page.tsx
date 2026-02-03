import Link from 'next/link'
import { PrimaryButton } from '@/components/ui'

const FEATURES = [
  {
    category: 'Tasks & Quests',
    emoji: '📋',
    items: [
      {
        title: 'Daily Tasks',
        description: 'Create recurring tasks like "Make your bed" or "Brush your teeth". Tasks can be daily, weekly, or one-time.',
        emoji: '✅',
      },
      {
        title: 'Family Quests',
        description: 'Group activities where everyone participates. Complete a quest together and everyone earns XP!',
        emoji: '⚔️',
      },
      {
        title: 'Pre-built Templates',
        description: 'Start with our suggested tasks or create your own. We provide age-appropriate task ideas.',
        emoji: '📝',
      },
    ],
  },
  {
    category: 'XP & Progression',
    emoji: '⭐',
    items: [
      {
        title: 'Instant XP Rewards',
        description: 'Complete a task and earn XP immediately. No waiting for approval — we trust your family!',
        emoji: '💎',
      },
      {
        title: 'Level System',
        description: 'Earn XP to level up from Rookie Hero to Ultimate Hero. 15 levels to unlock!',
        emoji: '📈',
      },
      {
        title: 'Streak Bonuses',
        description: 'Keep completing tasks daily to maintain your streak. Longer streaks = more bonus XP!',
        emoji: '🔥',
      },
    ],
  },
  {
    category: 'Badges & Achievements',
    emoji: '🏅',
    items: [
      {
        title: 'Collectible Badges',
        description: 'Unlock badges for completing challenges like "First Task", "7-Day Streak", or "Level 10".',
        emoji: '🎖️',
      },
      {
        title: 'Rarity Tiers',
        description: 'Badges come in Common, Rare, Epic, and Legendary rarities. Can you collect them all?',
        emoji: '✨',
      },
      {
        title: 'Progress Tracking',
        description: 'See how close you are to unlocking each badge with visual progress indicators.',
        emoji: '📊',
      },
    ],
  },
  {
    category: 'Family Management',
    emoji: '👨‍👩‍👧‍👦',
    items: [
      {
        title: 'Multiple Heroes',
        description: 'Add parents and kids. Each family member has their own hero profile with stats.',
        emoji: '🦸',
      },
      {
        title: 'Kid-Safe Access',
        description: 'Kids access via shared device — no email or password needed. Parents control everything.',
        emoji: '🛡️',
      },
      {
        title: 'Family Dashboard',
        description: 'See everyone\'s progress at a glance. Celebrate wins together as a team!',
        emoji: '🏠',
      },
    ],
  },
]

const COMING_SOON = [
  { title: 'Push Notifications', emoji: '🔔', description: 'Gentle reminders for tasks and celebrations for achievements' },
  { title: 'Avatar Customization', emoji: '🎨', description: 'Customize your hero with outfits, accessories, and more' },
  { title: 'Seasonal Events', emoji: '🎃', description: 'Special quests and badges for holidays and seasons' },
  { title: 'Smart Suggestions', emoji: '🤖', description: 'AI-powered task suggestions based on your family\'s habits' },
]

export default function FeaturesPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Gamify Your Home
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            A complete system designed to make household tasks fun, rewarding, and collaborative for the whole family.
          </p>
          <Link href="/onboarding">
            <PrimaryButton className="px-8 py-4 text-lg whitespace-nowrap">
              Get Started Free
            </PrimaryButton>
          </Link>
        </div>
      </section>

      {/* Features by Category */}
      {FEATURES.map((category, categoryIndex) => (
        <section
          key={category.category}
          className={`py-20 ${
            categoryIndex % 2 === 0
              ? 'bg-white dark:bg-gray-900'
              : 'bg-gray-50 dark:bg-gray-800'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="text-5xl mb-4">{category.emoji}</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {category.category}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {category.items.map((item) => (
                <div
                  key={item.title}
                  className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className="text-4xl mb-4">{item.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Coming Soon */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon 🚀
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              We're always adding new features to make Home Heroes even better.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMING_SOON.map((item) => (
              <div
                key={item.title}
                className="p-5 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center"
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Home?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Start your family's adventure today. It's free!
          </p>
          <Link href="/onboarding">
            <PrimaryButton className="px-10 py-5 text-xl whitespace-nowrap">
              Get Started Free 🦸
            </PrimaryButton>
          </Link>
        </div>
      </section>
    </div>
  )
}
