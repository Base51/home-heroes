'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserFamily, type Family } from '@/lib/family'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()

  /* ── state ─────────────────────────────────────── */
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [family, setFamily] = useState<Family | null>(null)
  const [familyName, setFamilyName] = useState('')
  const [familyNameSaving, setFamilyNameSaving] = useState(false)
  const [familyNameSaved, setFamilyNameSaved] = useState(false)

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Sign out
  const [signingOut, setSigningOut] = useState(false)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ── load data ─────────────────────────────────── */
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/settings')
        return
      }

      setEmail(session.user.email ?? '')

      try {
        const userFamily = await getUserFamily()
        if (userFamily) {
          setFamily(userFamily)
          setFamilyName(userFamily.name)
        }
      } catch (err) {
        console.error('Error loading family:', err)
      }

      setLoading(false)
    }
    load()
  }, [router])

  /* ── handlers ──────────────────────────────────── */

  async function handleSaveFamilyName() {
    if (!family || !familyName.trim()) return
    setFamilyNameSaving(true)
    setFamilyNameSaved(false)

    const { error } = await supabase
      .from('families')
      .update({ name: familyName.trim() })
      .eq('id', family.id)

    setFamilyNameSaving(false)
    if (!error) {
      setFamilyNameSaved(true)
      setTimeout(() => setFamilyNameSaved(false), 2000)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message })
    } else {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmNewPassword('')
      setTimeout(() => {
        setShowPasswordForm(false)
        setPasswordMessage(null)
      }, 2000)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setDeleteLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.rpc('delete_user_account')
      if (error) throw error
      if (data?.error) throw new Error(data.error)

      localStorage.clear()
      sessionStorage.clear()
      await supabase.auth.signOut({ scope: 'local' })
      await new Promise(resolve => setTimeout(resolve, 200))
      window.location.replace('/')
    } catch (err) {
      console.error('Error deleting account:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleteLoading(false)
    }
  }

  /* ── loading skeleton ──────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
              <div className="w-40 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── render ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* ── NAV ──────────────────────────────────── */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Dashboard
          </Link>
          <h1
            className="text-lg font-extrabold text-gray-900 dark:text-white"
            style={{ fontFamily: 'var(--font-baloo2)' }}
          >
            ⚙️ Settings
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* ── ACCOUNT ────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              👤 Account
            </h2>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Email
              </label>
              <p className="text-gray-900 dark:text-white font-medium">{email}</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Password
              </label>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  🔒 Change Password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    minLength={6}
                    required
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                  />

                  {passwordMessage && (
                    <p className={`text-sm font-medium ${passwordMessage.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {passwordMessage.type === 'success' ? '✓ ' : ''}{passwordMessage.text}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-4 py-2 text-sm font-semibold rounded-xl bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-colors disabled:opacity-50"
                    >
                      {passwordLoading ? 'Updating…' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setNewPassword('')
                        setConfirmNewPassword('')
                        setPasswordMessage(null)
                      }}
                      className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Sign Out */}
            <div className="pt-2">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                {signingOut ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    Signing out…
                  </>
                ) : (
                  '🚪 Sign Out'
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ── FAMILY ─────────────────────────────── */}
        {family && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                👨‍👩‍👧‍👦 Family
              </h2>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Family Name */}
              <div>
                <label htmlFor="familyName" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Family Name
                </label>
                <div className="flex gap-2">
                  <input
                    id="familyName"
                    type="text"
                    value={familyName}
                    onChange={(e) => {
                      setFamilyName(e.target.value)
                      setFamilyNameSaved(false)
                    }}
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleSaveFamilyName}
                    disabled={familyNameSaving || familyName.trim() === family.name}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {familyNameSaving ? 'Saving…' : familyNameSaved ? '✓ Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Link to Family page */}
              <Link
                href="/dashboard/family"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Manage Family Members →
              </Link>
            </div>
          </section>
        )}

        {/* ── PRIVACY & SAFETY ───────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              🛡️ Privacy & Safety
            </h2>
          </div>

          <div className="px-6 py-5 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Home Heroes is designed to be kid-safe. We follow GDPR and COPPA guidelines to protect your family&apos;s data.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                GDPR Information
              </Link>
            </div>
          </div>
        </section>

        {/* ── DANGER ZONE ────────────────────────── */}
        <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-800">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-300">
              ⚠️ Danger Zone
            </h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-red-900 dark:text-red-300 mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                Permanently delete your account and all associated data:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 mb-3 space-y-0.5 ml-1">
                <li>Your family profile and all members</li>
                <li>All heroes and their progress (XP, levels, badges)</li>
                <li>All tasks and quests</li>
                <li>All completion history</li>
                <li>Your authentication credentials</li>
              </ul>
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                <strong>Note:</strong> If you&apos;re the only parent in your family, the entire family will be deleted.
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                You can create a new account later with the same email.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete My Account
              </button>
            ) : (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-red-300 dark:border-red-700 space-y-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Are you absolutely sure?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone. Type{' '}
                  <code className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded text-xs font-mono">DELETE</code>{' '}
                  to confirm.
                </p>

                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none"
                />

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? 'Deleting…' : 'Yes, Delete Everything'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                      setError(null)
                    }}
                    disabled={deleteLoading}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── APP INFO ───────────────────────────── */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
          Home Heroes v1.0.0 (MVP) · Made with ❤️ for families everywhere
        </p>
      </main>
    </div>
  )
}
