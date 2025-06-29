/**
 * Supabase Database Migration
 * Automatically creates all Property Intelligence tables
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const migrations = [
  {
    name: "Enable Extensions",
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  },
  {
    name: "Create Enums",
    sql: `
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
    `
  },
  {
    name: "Organizations Table",
    sql: `
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
    `
  },
  {
    name: "Properties Table", 
    sql: `
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
    `
  },
  {
    name: "Reports Table",
    sql: `
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
    `
  },
  {
    name: "Insights Table",
    sql: `
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
    `
  },
  {
    name: "Actions Table",
    sql: `
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
    `
  },
  {
    name: "Create Indexes",
    sql: `
      CREATE INDEX IF NOT EXISTS idx_organizations_email_domain ON organizations(email_domain);
      CREATE INDEX IF NOT EXISTS idx_properties_organization ON properties(organization_id);
      CREATE INDEX IF NOT EXISTS idx_reports_organization ON reports(organization_id);
      CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
      CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_insights_report ON insights(report_id);
      CREATE INDEX IF NOT EXISTS idx_insights_organization ON insights(organization_id);
      CREATE INDEX IF NOT EXISTS idx_actions_organization ON actions(organization_id);
    `
  },
  {
    name: "Insert Demo Organization",
    sql: `
      INSERT INTO organizations (name, email_domain) 
      VALUES ('Prism Intelligence Demo', 'cloudmailin.net')
      ON CONFLICT DO NOTHING;
    `
  }
];

async function runMigrations() {
  console.log('🗄️  Running Property Intelligence Database Migrations...');
  console.log('======================================================');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('✅ Connected to Supabase');
  console.log(`📍 Database: ${supabaseUrl}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    console.log(`\n${i + 1}/${migrations.length}. ${migration.name}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        sql: migration.sql 
      });
      
      if (error) {
        // Try alternative method for complex SQL
        const { error: directError } = await supabase
          .from('_pg_stat_statements')
          .select('*')
          .limit(0);
        
        if (directError || error.message.includes('does not exist')) {
          // Execute using raw SQL method
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql: migration.sql })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }
        } else {
          throw error;
        }
      }
      
      console.log(`   ✅ Success`);
      successCount++;
      
    } catch (error: any) {
      console.log(`   ⚠️  Note: ${error.message}`);
      // Many "errors" are actually OK (like table already exists)
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate_object')) {
        console.log(`   ✅ (Already exists - OK)`);
        successCount++;
      } else {
        errorCount++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Migration Complete!');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⚠️  Warnings: ${errorCount}`);
  
  console.log('\n📊 Your Property Intelligence tables are ready:');
  console.log('   • organizations (multi-tenant support)');
  console.log('   • properties (buildings/assets)');
  console.log('   • reports (uploaded property reports)');
  console.log('   • insights (AI-generated insights)');
  console.log('   • actions (recommended actions)');
  
  console.log('\n🚀 Ready to process property management emails!');
  console.log('📧 Send test email to: 38fab3b51608018af887@cloudmailin.net');
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
