# Supabase Migration Setup

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization and enter:
   - Name: "Financial Analysis Platform"
   - Database Password: (choose a strong password)
   - Region: (select closest to your location)
4. Wait for project creation (takes ~2 minutes)

## Step 2: Get Database Connection String

1. In your Supabase dashboard, go to **Settings > Database**
2. Scroll down to **Connection string**
3. Select **Transaction** mode (recommended for Drizzle)
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Enable Vector Extension

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Run this command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Click **Run** to enable vector support

## Step 4: Add Vector Columns (Future)

After migration, we'll add vector columns for AI embeddings:
```sql
-- Add embedding column for semantic search
ALTER TABLE financial_documents 
ADD COLUMN embedding vector(1536);

-- Create vector similarity index
CREATE INDEX financial_docs_embedding_idx 
ON financial_documents 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

## Ready for Migration
Once you have the Supabase connection string, provide it and I'll update the environment to complete the migration.