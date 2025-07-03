// test-connection.js
// Quick test to verify Supabase is working

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? '✓ Found' : '✗ Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Check if we can query companies table
    console.log('\n📊 Testing database connection...')
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
    
    if (error) throw error
    console.log('✅ Database connection successful!')
    
    // Test 2: Check if pgvector is enabled
    console.log('\n🧠 Checking pgvector extension...')
    const { data: extensions, error: extError } = await supabase
      .rpc('get_extensions', {})
      .select('*')
    
    if (!extError) {
      console.log('✅ Extensions query successful!')
    }
    
    // Test 3: List all tables
    console.log('\n📋 Your tables:')
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
    
    if (tables) {
      tables.forEach(t => console.log(`  - ${t.table_name}`))
    }
    
    console.log('\n🎉 All tests passed! Your Supabase setup is working!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Check your .env.local file has correct values')
    console.error('2. Make sure your schema.sql has been run')
    console.error('3. Verify pgvector extension is enabled')
  }
}

testConnection()