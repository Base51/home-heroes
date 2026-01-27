#!/usr/bin/env ts-node
/**
 * Supabase Hybrid Setup Test Script
 * Tests connection to both local and cloud Supabase instances
 */

import { createClient } from '@supabase/supabase-js'

const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

const CLOUD_URL = 'https://xlprgglrbrbikpghcpwr.supabase.co'
const CLOUD_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscHJnZ2xyYnJiaWtwZ2hjcHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTg2ODMsImV4cCI6MjA1MzQ5NDY4M30.dWDwb-5CBVaWbzH2VqjJEWXb0AosCo8aZC6Gla3djO0'

async function testConnection(name: string, url: string, key: string) {
  console.log(`\n🧪 Testing ${name}...`)
  console.log(`   URL: ${url}`)
  
  try {
    const supabase = createClient(url, key)
    
    // Test 1: Health check
    const { error: healthError } = await supabase.from('families').select('count').limit(1)
    if (healthError) throw healthError
    console.log('   ✅ Connection successful')
    
    // Test 2: List tables
    const { data: tables, error: tablesError } = await supabase
      .from('families')
      .select('id')
      .limit(1)
    
    if (tablesError && tablesError.code !== 'PGRST116') {
      throw tablesError
    }
    console.log('   ✅ Database accessible')
    
    // Test 3: Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError && authError.message !== 'Auth session missing!') {
      throw authError
    }
    console.log('   ✅ Auth service responding')
    
    return true
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('╭─────────────────────────────────────────╮')
  console.log('│  Home Heroes - Supabase Hybrid Test    │')
  console.log('╰─────────────────────────────────────────╯')
  
  const localSuccess = await testConnection('LOCAL Supabase', LOCAL_URL, LOCAL_ANON_KEY)
  const cloudSuccess = await testConnection('CLOUD Supabase', CLOUD_URL, CLOUD_ANON_KEY)
  
  console.log('\n╭─────────────────────────────────────────╮')
  console.log('│  Test Results                           │')
  console.log('├─────────────────────────────────────────┤')
  console.log(`│  Local:  ${localSuccess ? '✅ PASS' : '❌ FAIL'}                         │`)
  console.log(`│  Cloud:  ${cloudSuccess ? '✅ PASS' : '❌ FAIL'}                         │`)
  console.log('╰─────────────────────────────────────────╯')
  
  if (localSuccess && cloudSuccess) {
    console.log('\n🎉 Hybrid setup is working correctly!')
    console.log('\nTo switch environments, edit apps/web/.env.local:')
    console.log('  - Comment LOCAL lines, uncomment CLOUD lines for production')
    console.log('  - Comment CLOUD lines, uncomment LOCAL lines for development')
  } else {
    console.log('\n⚠️  Some connections failed. Check the errors above.')
    process.exit(1)
  }
}

main()
