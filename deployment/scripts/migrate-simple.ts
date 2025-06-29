/**
 * Simple Supabase Database Migration
 * Creates tables using direct SQL execution
 */

import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

async function createTables() {
  console.log('🗄️  Creating Property Intelligence Database Tables...');
  console.log('===================================================');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials');
    return;
  }
  
  console.log('✅ Connecting to Supabase...');
  console.log(`📍 URL: ${supabaseUrl}`);
  
  // Create the full SQL schema
  const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE report_type AS ENUM ('financial', 'operational', 'rent_roll', 'maintenance', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email_domain VARCHAR(255),
  settings JSONB DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
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
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
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
);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
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
);

-- Actions table
CREATE TABLE IF NOT EXISTS actions (
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
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_email_domain ON organizations(email_domain);
CREATE INDEX IF NOT EXISTS idx_properties_organization ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_organization ON reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_report ON insights(report_id);
CREATE INDEX IF NOT EXISTS idx_insights_organization ON insights(organization_id);
CREATE INDEX IF NOT EXISTS idx_actions_organization ON actions(organization_id);

-- Insert demo organization
INSERT INTO organizations (name, email_domain) 
VALUES ('Prism Intelligence Demo', 'cloudmailin.net')
ON CONFLICT DO NOTHING;
  `;
  
  try {
    // Use Supabase REST API directly to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: schema })
    });
    
    if (response.ok) {
      console.log('✅ Tables created successfully via API!');
    } else {
      // If API method doesn't work, provide manual instructions
      throw new Error(`API method failed: ${response.status}`);
    }
    
  } catch (error) {
    console.log('⚠️  API method not available. Using manual approach...');
    console.log('\n📋 COPY THIS SQL TO SUPABASE SQL EDITOR:');
    console.log('==========================================');
    console.log(schema);
    console.log('==========================================');
    console.log('\n📍 Instructions:');
    console.log('1. Go to your Supabase project');
    console.log('2. Click "SQL Editor" in left sidebar');
    console.log('3. Click "New Query"');
    console.log('4. Copy the SQL above');
    console.log('5. Paste and click "Run"');
    
    // Also save to file for easy access
    fs.writeFileSync('supabase-migration.sql', schema);
    console.log('\n💾 SQL also saved to: supabase-migration.sql');
  }
  
  console.log('\n🎉 After running the SQL, your database will have:');
  console.log('   • organizations (multi-tenant support)');
  console.log('   • properties (buildings/assets)');  
  console.log('   • reports (uploaded property reports)');
  console.log('   • insights (AI-generated insights)');
  console.log('   • actions (recommended actions)');
  console.log('   • Demo organization ready for testing');
  
  console.log('\n🚀 Then test with:');
  console.log('   📧 Send email to: 38fab3b51608018af887@cloudmailin.net');
  console.log('   📊 View reports: http://localhost:3000/reports');
}

// Run the migration
createTables()
  .then(() => {
    console.log('\n✅ Migration setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
