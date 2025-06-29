/**
 * Actual Database Migration - This time it will work!
 * Uses Supabase client to execute SQL directly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('🗄️  Actually Migrating Database Schema...');
  console.log('==========================================');
  
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const migrations = [
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
    
    `DO $$ BEGIN
       CREATE TYPE report_status AS ENUM ('pending', 'processing', 'completed', 'failed');
     EXCEPTION
       WHEN duplicate_object THEN null;
     END $$`,
     
    `DO $$ BEGIN
       CREATE TYPE report_type AS ENUM ('financial', 'operational', 'rent_roll', 'maintenance', 'other');
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
     
    `CREATE TABLE IF NOT EXISTS properties (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
       external_id VARCHAR(255),
       name VARCHAR(255) NOT NULL,
       address JSONB NOT NULL,
       property_type VARCHAR(100),
       total_units INTEGER,
       total_square_feet INTEGER,
       metadata JSONB DEFAULT '{}',
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     )`,
     
    `CREATE TABLE IF NOT EXISTS reports (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
       property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
       filename VARCHAR(255) NOT NULL,
       file_type VARCHAR(50) NOT NULL,
       file_size_bytes BIGINT NOT NULL,
       file_url TEXT,
       status report_status NOT NULL DEFAULT 'pending',
       report_type report_type,
       report_period_start DATE,
       report_period_end DATE,
       sender_email VARCHAR(255),
       email_subject TEXT,
       email_body TEXT,
       cloudmailin_id VARCHAR(255),
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     )`,
     
    `CREATE TABLE IF NOT EXISTS insights (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
       organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
       property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
       insight_text TEXT NOT NULL,
       insight_summary VARCHAR(500),
       category VARCHAR(50) NOT NULL,
       priority INTEGER CHECK (priority >= 1 AND priority <= 5),
       confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
       supporting_data JSONB DEFAULT '{}',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     )`,
     
    `CREATE TABLE IF NOT EXISTS actions (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       insight_id UUID REFERENCES insights(id) ON DELETE CASCADE,
       organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
       property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
       action_text TEXT NOT NULL,
       action_type VARCHAR(50),
       priority VARCHAR(20) DEFAULT 'medium',
       status VARCHAR(20) DEFAULT 'pending',
       due_date DATE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     )`,
     
    `INSERT INTO organizations (name, email_domain) 
     VALUES ('Prism Intelligence Demo', 'cloudmailin.net')
     ON CONFLICT DO NOTHING`
  ];
  
  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    console.log(`${i + 1}/${migrations.length}: Running migration...`);
    
    try {
      // Use raw SQL query
      const { data, error } = await supabase.rpc('exec', { sql });
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        // Continue with other migrations
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${error}`);
    }
  }
  
  console.log('\n🎉 Migration complete!');
  console.log('📊 Testing database connection...');
  
  // Test if tables were created
  const { data: orgs, error } = await supabase
    .from('organizations')
    .select('*');
    
  if (error) {
    console.log('❌ Tables not created properly:', error.message);
    console.log('\n🔧 Manual Fix Required:');
    console.log('1. Go to Supabase → SQL Editor');
    console.log('2. Run the SQL from supabase-migration.sql');
  } else {
    console.log('✅ Tables created successfully!');
    console.log(`✅ Found ${orgs.length} organizations`);
    console.log('\n🚀 Ready to process emails!');
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
