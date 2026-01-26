'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First, call the GDPR deletion function
      const { data, error } = await supabase.rpc('delete_user_account')

      if (error) throw error
      
      if (data?.error) {
        throw new Error(data.error)
      }

      // Account deleted successfully - now clean up local session
      // Clear all local storage and session
      localStorage.clear()
      sessionStorage.clear()
      
      // Sign out to clear Supabase session
      await supabase.auth.signOut({ scope: 'local' })

      // Wait a bit to ensure everything is cleared
      await new Promise(resolve => setTimeout(resolve, 200))

      // Hard redirect to root
      window.location.replace('/')
    } catch (err) {
      console.error('Error deleting account:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ⚙️ Settings
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Account Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Account Settings
          </h2>
          
          <div className="space-y-4">
            {/* Future settings can go here */}
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account preferences and data.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-4">
            ⚠️ Danger Zone
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
                Delete Account
              </h3>
              <p className="text-red-700 dark:text-red-400 mb-4">
                This will permanently delete your account and all associated data:
              </p>
              <ul className="list-disc list-inside text-red-700 dark:text-red-400 mb-4 space-y-1">
                <li>Your family profile and all members</li>
                <li>All heroes and their progress (XP, levels, badges)</li>
                <li>All tasks and quests</li>
                <li>All completion history</li>
                <li>Your authentication credentials</li>
              </ul>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                <strong>Note:</strong> If you're the only parent in your family, the entire family will be deleted. 
                If there are other parents, only your data will be removed.
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                <strong>You can create a new account later with the same email if you wish to return.</strong>
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Delete My Account
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-red-300 dark:border-red-700">
                  <p className="text-gray-900 dark:text-white font-semibold mb-3">
                    Are you absolutely sure?
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    This action cannot be undone. Type <code className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-300 rounded font-mono">DELETE</code> to confirm.
                  </p>
                  
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE here"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white mb-4"
                  />

                  {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || deleteConfirmText !== 'DELETE'}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                    >
                      {loading ? 'Deleting...' : 'Yes, Delete Everything'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                        setError(null)
                      }}
                      disabled={loading}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
