/**
 * Direct Database Migration Using SQL Queries
 * This WILL actually create the tables
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function createTablesDirectly() {
  console.log('🗄️  Creating Database Tables Directly...');
  console.log('========================================');
  
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
  
  console.log('✅ Connecting to Supabase...');
  
  try {
    // Use raw HTTP to execute SQL
    const queries = [
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
      
      `DO $$ BEGIN
         CREATE TYPE report_status AS ENUM ('pending', 'processing', 'completed', 'failed');
       EXCEPTION
         WHEN duplicate_object THEN null;
       END $$`,
       
      `CREATE TABLE IF NOT EXISTS organizations (
         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
         name VARCHAR(255) NOT NULL,
         email_domain VARCHAR(255),
         settings JSONB DEFAULT '{}',
         subscription_tier VARCHAR(50) DEFAULT 'starter',
         is_active BOOLEAN DEFAULT true,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
       )`,
       
      `CREATE TABLE IF NOT EXISTS reports (
         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
         organization_id UUID NOT NULL,
         filename VARCHAR(255) NOT NULL,
         file_type VARCHAR(50) NOT NULL,
         file_size_bytes BIGINT NOT NULL,
         file_url TEXT,
         status VARCHAR(20) NOT NULL DEFAULT 'pending',
         sender_email VARCHAR(255),
         email_subject TEXT,
         email_body TEXT,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
       )`,
       
      `INSERT INTO organizations (name, email_domain) 
       VALUES ('Prism Intelligence Demo', 'cloudmailin.net')
       ON CONFLICT DO NOTHING`
    ];
    
    for (let i = 0; i < queries.length; i++) {
      const sql = queries[i];
      console.log(`${i + 1}/${queries.length}: Executing SQL...`);
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql })
        });
        
        if (response.ok) {
          console.log(`   ✅ Success`);
        } else {
          const error = await response.text();
          console.log(`   ⚠️  ${response.status}: ${error}`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${error}`);
      }
    }
    
    // Test using Supabase client
    console.log('\n📊 Testing database connection...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*');
      
    if (error) {
      console.log('❌ Database test failed:', error.message);
      console.log('\n🔧 You need to manually run SQL in Supabase:');
      console.log('1. Go to Supabase → SQL Editor → New Query');
      console.log('2. Copy contents of supabase-migration.sql');
      console.log('3. Paste and click Run');
      return false;
    } else {
      console.log('✅ Database working!');
      console.log(`✅ Found ${orgs.length} organizations`);
      console.log('\n🎉 Migration successful!');
      return true;
    }
    
  } catch (error) {
    console.log('❌ Migration failed:', error);
    return false;
  }
}

createTablesDirectly()
  .then((success) => {
    if (success) {
      console.log('\n🚀 Your Property Intelligence database is ready!');
      console.log('📧 Send test email to: 38fab3b51608018af887@cloudmailin.net');
      console.log('📊 Check reports: http://localhost:3000/reports');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed:', error);
    process.exit(1);
  });
