-- Quick Test Queries for Property Intelligence Platform
-- Run these in Supabase SQL Editor after schema setup to verify everything works

-- 1. Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 2. List all tables created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. Check all custom types created
SELECT 
    n.nspname as schema,
    t.typname as type_name,
    t.typtype as type_type
FROM pg_type t
LEFT JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
AND t.typtype = 'e'  -- 'e' for enum types
ORDER BY t.typname;

-- 4. Verify indexes (especially vector indexes)
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE '%embedding%'
ORDER BY tablename, indexname;
-- 5. Check if RLS is enabled on tables
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 6. List all functions created
SELECT 
    proname as function_name,
    pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND proname IN ('find_similar_entities', 'create_similarity_relationships', 'update_updated_at_column');

-- 7. Test creating a company (replace with your values)
INSERT INTO companies (name, domain) 
VALUES ('Test Company', 'test.com')
RETURNING *;

-- 8. Test the vector similarity function (after you have data with embeddings)
-- This will only work after you've inserted data with embeddings
-- SELECT * FROM find_similar_entities(
--     '[0.1, 0.2, ...]'::vector(1536),  -- Your embedding here
--     'reports',
--     'your-company-uuid',
--     0.8,
--     10
-- );

-- 9. Check all triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 10. Verify all constraints and foreign keys
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type;

-- If all queries run successfully, your schema is properly set up! 🎉