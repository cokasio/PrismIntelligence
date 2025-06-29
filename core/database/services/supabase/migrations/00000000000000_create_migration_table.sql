-- Migration Tracking Table
-- Run this first to enable migration tracking

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- After running each migration file, record it:
-- INSERT INTO schema_migrations (version) VALUES ('20250128000000_initial_schema.sql');
-- INSERT INTO schema_migrations (version) VALUES ('20250128000001_seed_test_data.sql');