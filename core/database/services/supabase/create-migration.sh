#!/bin/bash
# create-migration.sh - Helper to create new migration files

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# Get description from command line
DESCRIPTION=$1

if [ -z "$DESCRIPTION" ]; then
    echo "Usage: ./create-migration.sh <description>"
    echo "Example: ./create-migration.sh add_property_tags"
    exit 1
fi

# Create migration filename
FILENAME="${TIMESTAMP}_${DESCRIPTION}.sql"
FILEPATH="supabase/migrations/${FILENAME}"

# Create migration file with template
cat > "$FILEPATH" << EOF
-- Migration: ${DESCRIPTION}
-- Generated: $(date +%Y-%m-%d)
-- Description: TODO: Add description here

-- Add your migration SQL here
-- Example:
-- ALTER TABLE properties ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Remember to test this migration before applying to production!
EOF

echo "✅ Created migration: $FILEPATH"
echo ""
echo "Next steps:"
echo "1. Edit the migration file with your SQL"
echo "2. Test on a development database"
echo "3. Apply via Supabase Dashboard SQL Editor"
echo "4. Record migration: INSERT INTO schema_migrations (version) VALUES ('$FILENAME');"