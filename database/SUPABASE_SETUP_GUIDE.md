# Supabase Authentication & Schema Setup Guide

## Quick Setup Options

### Option 1: Supabase Dashboard SQL Editor (Recommended for Initial Setup)

1. **Login to Supabase Dashboard**
   - Go to https://app.supabase.com
   - Navigate to your project
   
2. **Access SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"
   
3. **Run Schema Creation**
   - Copy the contents from `schema.sql`
   - Paste into SQL editor
   - Click "Run" button

### Option 2: Direct Database Connection

1. **Get Connection String**
   - Dashboard → Settings → Database
   - Copy "Connection string" (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

2. **Using psql**
   ```bash
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f schema.sql
   ```

3. **Using any PostgreSQL client**
   - DBeaver, pgAdmin, TablePlus, etc.
   - Use the connection string to connect
   - Run the schema.sql file

### Option 3: Supabase CLI (Best for Development)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   cd C:\Dev\PrismIntelligence
   supabase link --project-ref [YOUR-PROJECT-REF]
   ```

4. **Create migration**
   ```bash
   supabase migration new init_schema
   ```
   This creates: `supabase/migrations/[timestamp]_init_schema.sql`

5. **Copy schema to migration file and push**
   ```bash
   supabase db push
   ```

### Option 4: Using Migrations (Production Best Practice)

1. **Initialize Supabase in your project**
   ```bash
   cd C:\Dev\PrismIntelligence
   supabase init
   ```

2. **Create migration directory structure**
   ```
   supabase/
   ├── migrations/
   │   └── 20240101000000_init_schema.sql
   └── config.toml
   ```

3. **Set up environment variables**
   Create `.env.local`:
   ```env
   SUPABASE_URL=https://[PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_DB_PASSWORD=your-database-password
   ```

## Authentication Keys Explained

### 1. **Anon Key (Public)**
   - Safe for client-side use
   - Respects Row Level Security (RLS)
   - Found in: Dashboard → Settings → API

### 2. **Service Role Key (Secret)**
   - Bypasses RLS
   - Server-side only!
   - Found in: Dashboard → Settings → API

### 3. **Database Password**
   - Direct database access
   - Found in: Dashboard → Settings → Database

## Security Best Practices

1. **Never commit secrets**
   ```gitignore
   .env
   .env.local
   *.env
   ```

2. **Use environment variables**
   ```javascript
   // supabase.js
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

3. **Enable RLS**
   - Already included in schema
   - Customize policies based on your auth setup

## Next Steps

1. Choose your preferred method above
2. Run the schema from `schema.sql`
3. Verify tables created: Dashboard → Table Editor
4. Set up your environment variables
5. Test connection from your app

## Troubleshooting

### "Permission denied for schema public"
- You might be using the wrong role
- Try using the postgres (admin) connection

### "Extension pgvector does not exist"
- Enable in Dashboard → Database → Extensions
- Search for "vector" and enable it

### "RLS policies blocking access"
- Temporarily disable RLS for testing
- Or use service role key for admin operations

## Quick Test Query

After setup, test with:
```sql
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see all your tables listed!