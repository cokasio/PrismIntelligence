// migrate.ts - Database migration runner for Property Intelligence Platform
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Migration tracking table SQL
const createMigrationTableSQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

async function ensureMigrationTable() {
  console.log('📋 Ensuring migration tracking table exists...');
  const { error } = await supabase.rpc('query', { 
    query: createMigrationTableSQL 
  }).single();
  
  if (error && !error.message.includes('already exists')) {
    // Try direct execution as fallback
    const { error: directError } = await supabase
      .from('schema_migrations')
      .select('version')
      .limit(1);
    
    if (directError && directError.code === '42P01') { // table doesn't exist
      console.error('❌ Could not create migration table. Please create it manually:');
      console.log(createMigrationTableSQL);
      throw directError;
    }
  }
  console.log('✅ Migration tracking ready');
}
async function getAppliedMigrations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('version')
    .order('version');
  
  if (error) {
    console.error('❌ Error fetching applied migrations:', error);
    return [];
  }
  
  return data.map(row => row.version);
}

async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found:', migrationsDir);
    return [];
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  return files;
}

async function runMigration(filename: string) {
  const filepath = path.join(__dirname, 'migrations', filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  
  console.log(`\n🚀 Running migration: ${filename}`);
  
  try {
    // Note: Supabase doesn't have a direct SQL execution method via JS client
    // You'll need to run these via the Dashboard or use a direct PostgreSQL connection
    
    console.log('⚠️  Please run this migration manually via:');
    console.log('   1. Supabase Dashboard → SQL Editor');
    console.log('   2. Or using psql with your database URL');
    console.log(`   3. Migration file: ${filepath}`);
    
    // For now, we'll mark it as a todo
    return { success: false, manual: true };
    
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error);
    return { success: false, error };
  }
}

async function recordMigration(version: string) {
  const { error } = await supabase
    .from('schema_migrations')
    .insert({ version });
  
  if (error) {
    console.error(`❌ Error recording migration ${version}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🔄 Property Intelligence Platform - Database Migration Runner\n');
  
  try {
    // Ensure migration table exists
    await ensureMigrationTable();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`\n📊 Applied migrations: ${appliedMigrations.length}`);
    
    // Get available migration files
    const migrationFiles = await getMigrationFiles();
    console.log(`📁 Available migrations: ${migrationFiles.length}`);
    
    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('\n✅ Database is up to date!');
      return;
    }
    
    console.log(`\n📋 Pending migrations: ${pendingMigrations.length}`);
    pendingMigrations.forEach(m => console.log(`   - ${m}`));
    
    // Run pending migrations
    for (const migration of pendingMigrations) {
      const result = await runMigration(migration);
      
      if (result.manual) {
        console.log('\n⚠️  Manual migration required!');
        console.log('After running the migration manually, record it with:');
        console.log(`npm run migrate:record ${migration}`);
      } else if (result.success) {
        await recordMigration(migration);
        console.log(`✅ ${migration} applied successfully`);
      } else {
        console.error(`❌ Migration failed at ${migration}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Migration runner error:', error);
    process.exit(1);
  }
}

// Support for recording manually run migrations
if (process.argv[2] === 'record' && process.argv[3]) {
  recordMigration(process.argv[3])
    .then(() => {
      console.log(`✅ Recorded migration: ${process.argv[3]}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error recording migration:', error);
      process.exit(1);
    });
} else {
  main().catch(console.error);
}