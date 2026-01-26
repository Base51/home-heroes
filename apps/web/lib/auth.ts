import { supabase } from './supabase'

export type AuthUser = {
  id: string
  email: string
}

export type SignUpData = {
  email: string
  password: string
  displayName: string
}

export type SignInData = {
  email: string
  password: string
}

/**
 * Sign up a new parent user
 * Only parents can sign up with email/password
 */
export async function signUp({ email, password, displayName }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role: 'parent'
      }
    }
  })

  if (error) throw error
  return data
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession()
  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email!
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session?.user
}
