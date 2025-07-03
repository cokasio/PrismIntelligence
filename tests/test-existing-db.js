// test-existing-db.js
// Test your existing Supabase database with new schema

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

console.log('Testing existing Supabase database...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  try {
    // Check if new tables exist
    console.log('\n📊 Checking for Property Intelligence tables...')
    
    const tables = [
      'companies',
      'properties', 
      'tenants',
      'reports',
      'insights',
      'action_items',
      'entity_relationships',
      'knowledge_base'
    ]
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: Not found (run schema.sql)`)
      } else {
        console.log(`✅ ${table}: Found`)
      }
    }
    
    // Check pgvector
    console.log('\n🧠 Checking pgvector extension...')
    const { data: extensions, error: extError } = await supabase
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'vector')
    
    if (extensions && extensions.length > 0) {
      console.log('✅ pgvector is enabled!')
    } else {
      console.log('❌ pgvector not enabled - enable it in Dashboard → Extensions')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testDatabase()