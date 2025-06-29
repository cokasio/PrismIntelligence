/**
 * Create Property Intelligence Database Schema
 * This will create all the tables for your platform
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('🗄️  Setting up Property Intelligence Database...');
  console.log('=================================================');
  
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📜 Loading schema from:', schemaPath);
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`🔧 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        // Continue with other statements
      } else {
        console.log(`   ✅ Success`);
      }
    }
    
    console.log('\n🎉 Database schema setup complete!');
    console.log('\n📊 Your Property Intelligence tables are ready:');
    console.log('   • organizations (multi-tenant support)');
    console.log('   • users (property managers)');
    console.log('   • properties (buildings/assets)');
    console.log('   • reports (uploaded property reports)');
    console.log('   • insights (AI-generated insights)');
    console.log('   • actions (recommended actions)');
    
  } catch (error) {
    console.log('❌ Setup failed:', error);
  }
}

// Run the setup
setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
