import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    badge: null,
    features: [
      { text: 'Up to 5 family members', included: true },
      { text: 'Unlimited tasks', included: true },
      { text: 'XP, Levels & Streaks', included: true },
      { text: 'All badges & achievements', included: true },
      { text: 'Family quests', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Custom avatars', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/onboarding',
    highlight: false,
  },
  {
    name: 'Family',
    price: '$4.99',
    period: '/month',
    description: 'For growing families',
    badge: 'Most Popular',
    features: [
      { text: 'Unlimited family members', included: true },
      { text: 'Unlimited tasks', included: true },
      { text: 'XP, Levels & Streaks', included: true },
      { text: 'All badges & achievements', included: true },
      { text: 'Family quests', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Custom avatars', included: true },
      { text: 'Seasonal events', included: true },
    ],
    cta: 'Coming Soon',
    ctaLink: '#',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For power users',
    badge: null,
    features: [
      { text: 'Everything in Family', included: true },
      { text: 'Multiple families', included: true },
      { text: 'Smart task suggestions', included: true },
      { text: 'Export reports', included: true },
      { text: 'API access', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early feature access', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
    cta: 'Coming Soon',
    ctaLink: '#',
    highlight: false,
  },
]

const FAQ = [
  {
    question: 'Is the free plan really free forever?',
    answer: 'Yes! The free plan includes everything you need to get started with your family. No credit card required, no trial period, no hidden fees.',
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Absolutely. You can change your plan at any time. If you downgrade, you\'ll keep access until the end of your billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor Stripe.',
  },
  {
    question: 'Is there a family discount?',
    answer: 'Our pricing is already family-friendly! Unlike per-user pricing, our plans cover your entire family at one low price.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
  },
  {
    question: 'Is my family\'s data safe?',
    answer: 'Absolutely. We follow GDPR and COPPA guidelines. We minimize data collection and never sell your information. Kids\' data is especially protected.',
  },
]

export default function PricingPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Simple, Family-Friendly
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No per-user fees — one price for your whole family.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.highlight
                    ? 'border-purple-500 shadow-2xl scale-105 bg-white dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className={feature.included ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}>
                        {feature.included ? '✓' : '✗'}
                      </span>
                      <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={`block w-full py-4 text-center font-semibold rounded-xl transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                      : plan.cta === 'Coming Soon'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {FAQ.map((item, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.answer}
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
            Start Free Today
          </h2>
          <p className="text-xl text-white/80 mb-8">
            No credit card required. Get your family started in minutes.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-10 py-5 bg-white hover:bg-gray-100 text-gray-900 text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Free 🚀
          </Link>
        </div>
      </section>
    </div>
  )
}
