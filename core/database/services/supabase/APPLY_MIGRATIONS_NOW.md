# 🚀 QUICK MIGRATION GUIDE - Apply Database Schema NOW

## Your Migration Files Are Ready!

You have 3 migration files in `supabase/migrations/`:

1. **`00000000000000_create_migration_table.sql`** - Sets up migration tracking
2. **`20250128000000_initial_schema.sql`** - Complete Property Intelligence schema
3. **`20250128000001_seed_test_data.sql`** - Test data (optional)

## Apply Migrations NOW (10 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Open your project (wxesdralkicmqedqegpb)
3. Click **SQL Editor** → **New query**

### Step 2: Create Migration Tracking Table
```sql
-- Copy & paste from: supabase/migrations/00000000000000_create_migration_table.sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
Click **RUN**

### Step 3: Apply Initial Schema
1. Open `supabase/migrations/20250128000000_initial_schema.sql`
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste in SQL Editor
4. Click **RUN**

You should see multiple "CREATE TABLE" success messages.

### Step 4: Record Migration
```sql
-- Mark the schema as applied
INSERT INTO schema_migrations (version) VALUES ('20250128000000_initial_schema.sql');
```
Click **RUN**

### Step 5: (Optional) Add Test Data
1. Open `supabase/migrations/20250128000001_seed_test_data.sql`
2. Copy ALL contents
3. Paste in SQL Editor
4. Click **RUN**
5. Record it:
```sql
INSERT INTO schema_migrations (version) VALUES ('20250128000001_seed_test_data.sql');
```

## Verify Everything Worked

Run this verification query:
```sql
-- Check your tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check migrations
SELECT * FROM schema_migrations ORDER BY applied_at;

-- Check test data (if you applied it)
SELECT 
  (SELECT COUNT(*) FROM companies) as companies,
  (SELECT COUNT(*) FROM properties) as properties,
  (SELECT COUNT(*) FROM reports) as reports;
```

## What You Now Have

✅ **8 Core Tables** with vector support:
- companies (multi-tenant)
- properties 
- tenants
- reports
- insights
- action_items
- entity_relationships
- knowledge_base

✅ **AI Functions**:
- find_similar_entities()
- create_similarity_relationships()

✅ **Indexes** for fast queries and vector search

✅ **Row Level Security** enabled

## Next: Start Building!

Your database is ready for:
1. Storing property reports
2. AI-generated insights
3. Vector similarity search
4. Multi-tenant isolation

---

**Total Time: ~10 minutes** ⏱️