-- Reconcile vendor_challans columns on environments whose schema was baselined
-- from an older snapshot and is missing columns added by later migrations.
--
-- Symptom this fixes: POST /api/vendor-challans returns 500
-- ("Failed to create vendor challan") because the INSERT writes to a column
-- that does not exist on the target DB.
--
-- Safe & idempotent: re-running it does nothing if the columns already exist.
--   psql "$DATABASE_URL" -f scripts/sql/fix-vendor-challans-columns.sql

-- Added by migration 0001_safe_gamora.sql
ALTER TABLE "vendor_challans" ADD COLUMN IF NOT EXISTS "line_items" jsonb;

-- Added by migration 0002_romantic_hammerhead.sql
ALTER TABLE "vendor_challans" ADD COLUMN IF NOT EXISTS "attachments" jsonb DEFAULT '[]'::jsonb;

-- Show the resulting column list for verification.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vendor_challans'
ORDER BY ordinal_position;
