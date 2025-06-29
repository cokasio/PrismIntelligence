/**
 * Test Supabase Database Connection
 * Run this to verify your credentials work
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase Connection...');
  console.log('=====================================');
  
  // Get credentials from .env
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials in .env file');
    console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('   SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    return;
  }
  
  console.log('✅ Credentials found');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`);
  
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test connection by checking if we can access the database
    const { data, error } = await supabase
      .rpc('version');
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('🎉 SUCCESS! Connected to Supabase');
    console.log('✅ Database is accessible');
    console.log('✅ Service key is valid');
    console.log(`✅ PostgreSQL version: ${data}`);
    
    console.log('\n📊 Ready to create Property Intelligence tables!');
    
  } catch (error) {
    console.log('❌ Connection error:', error);
  }
}

// Run the test
testSupabaseConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
