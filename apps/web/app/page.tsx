'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('Supabase session:', data.session)
    })
  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>Home Heroes</h1>
      <p>Supabase is connected ✅</p>
    </main>
  )
}
