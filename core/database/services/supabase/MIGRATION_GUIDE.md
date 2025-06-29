# Database Migration Setup - Property Intelligence Platform

## Migration-First Approach

I understand! From now on, all database schema changes will be handled through proper migrations.

## Migration Structure

```
supabase/
├── migrations/
│   ├── 20250128000000_initial_schema.sql         # Initial schema setup
│   ├── 20250128000001_seed_test_data.sql        # Test data (optional)
│   └── [timestamp]_[description].sql             # Future migrations
└── config.toml                                    # Supabase config
```

## How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
cd C:\Dev\PrismIntelligence
supabase link --project-ref wxesdralkicmqedqegpb

# Run migrations
supabase db push
```

### Option 2: Manual Migration via Dashboard
```bash
# For each migration file in order:
1. Go to SQL Editor in Supabase Dashboard
2. Open migration file
3. Copy entire contents
4. Paste and run
5. Track which migrations have been applied
```

### Option 3: Using migrate.ts Script
```bash
# We can create a TypeScript migration runner
npm run migrate
```

## Migration Best Practices

1. **Naming Convention**: `YYYYMMDDHHMMSS_description.sql`
   - Example: `20250128143000_add_property_tags.sql`

2. **Always Forward**: Never modify existing migrations
   - Create new migrations for changes
   - Use ALTER TABLE for modifications

3. **Atomic Changes**: Each migration should be one logical change

4. **Rollback Strategy**: Include DOWN migrations when needed
   ```sql
   -- Up Migration
   CREATE TABLE new_table (...);
   
   -- Down Migration (in separate file or commented)
   -- DROP TABLE new_table;
   ```

5. **Test First**: Always test migrations on a dev database

## Creating New Migrations

When you need a schema change, I'll create:
```
supabase/migrations/[timestamp]_[change_description].sql
```

## Current Migration Status

✅ `20250128000000_initial_schema.sql` - Ready to apply
- Creates all core tables
- Sets up pgvector indexes
- Enables RLS
- Creates helper functions

## Next Steps

1. Choose your migration method (CLI recommended)
2. Apply the initial migration
3. Verify with test queries
4. All future schema changes will be new migration files

## Example Future Migrations

```sql
-- 20250129000000_add_property_tags.sql
ALTER TABLE properties 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- 20250130000000_add_report_status.sql
ALTER TABLE reports 
ADD COLUMN status TEXT DEFAULT 'pending';
```

I'll always create proper migration files for any database changes!