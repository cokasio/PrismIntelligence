# Supabase Migrations - Property Intelligence Platform

## ✅ Migration-First Database Management

All database schema changes are managed through versioned SQL migrations located in the `supabase/migrations/` directory.

## Current Migrations

| Migration File | Description | Status |
|---------------|-------------|---------|
| `00000000000000_create_migration_table.sql` | Creates migration tracking table | 🔴 Pending |
| `20250128000000_initial_schema.sql` | Complete Property Intelligence schema with pgvector | 🔴 Pending |
| `20250128000001_seed_test_data.sql` | Optional test data for development | 🔴 Pending |
| `20250128150000_financial_pipeline_tables.sql` | AI-driven financial pipeline tables | 🔴 Pending |
| `20250128160000_multi_tenant_foundation.sql` | Multi-tenant structure (investors → properties) | 🔴 Pending |
| `20250128161000_update_financial_tables.sql` | Updates financial tables for multi-tenancy | 🔴 Pending |

## 🚀 Quick Start - Apply All Migrations

Apply migrations in this exact order:

```sql
-- 1. Migration tracking
00000000000000_create_migration_table.sql

-- 2. Base schema (skip if using multi-tenant)
-- 20250128000000_initial_schema.sql (SKIP - replaced by multi-tenant)

-- 3. Multi-tenant foundation (replaces base schema)
20250128160000_multi_tenant_foundation.sql

-- 4. Financial pipeline
20250128150000_financial_pipeline_tables.sql

-- 5. Update financial tables for multi-tenancy
20250128161000_update_financial_tables.sql

-- 6. Optional test data
20250128000001_seed_test_data.sql (modify investor_id first)
```

## 📋 Migration Descriptions

### Multi-Tenant Foundation (`20250128160000`)
- Creates `investors` table (property owners)
- Creates `properties` table with CloudMailin addresses
- Creates `users` and access control tables
- Sets up RLS policies

### Financial Pipeline (`20250128150000`)
- Creates ingestion tracking tables
- Creates attachment processing tables
- Creates financial data storage
- Adds vector search capabilities

### Update Financial Tables (`20250128161000`)
- Migrates from company_id to investor_id
- Adds email management tables
- Updates all foreign keys
- Maintains data integrity

## 🔧 Create New Migrations

```bash
# Windows
create-migration.bat add_new_feature

# Mac/Linux
./create-migration.sh add_new_feature
```

## 📊 Track Applied Migrations

```sql
SELECT * FROM schema_migrations ORDER BY applied_at DESC;
```

## ⚠️ Important Notes

1. **Multi-Tenant vs Single-Tenant**: 
   - Use `20250128160000_multi_tenant_foundation.sql` instead of `20250128000000_initial_schema.sql`
   - They are mutually exclusive

2. **Order Matters**: 
   - Multi-tenant foundation must come before financial updates
   - Financial pipeline can be applied independently

3. **Test Data**: 
   - Update the test data migration to use correct investor IDs
   - Or create new test data after applying multi-tenant structure

## 🔄 Rollback Support

For complex migrations, we provide rollback scripts:
- `20250128150000_financial_pipeline_tables_rollback.sql` - Removes pipeline tables

## Migration Workflow

1. **Development**: Create and test migrations locally
2. **Review**: Check SQL for correctness and performance
3. **Apply**: Run via SQL Editor in correct order
4. **Record**: Insert into schema_migrations table
5. **Verify**: Test that changes work as expected

## Best Practices

- ✅ Never modify existing migrations
- ✅ Always create new migrations for changes
- ✅ Test migrations on development first
- ✅ Keep migrations focused and atomic
- ✅ Include rollback instructions when needed

---

Remember: **All schema changes go through migrations!** 🚀