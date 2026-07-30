-- Seed the unit_types lookup table with the standard values used in ERP.
-- Safe to run multiple times: existing names are skipped (idempotent).
--
-- Run on the VPS from the project root, e.g.:
--   psql "$DATABASE_URL" -f scripts/sql/seed-unit-types.sql

INSERT INTO unit_types (name, is_active) VALUES
  ('Meter', true),
  ('Yard', true),
  ('Piece', true),
  ('Kilogram', true),
  ('Set', true),
  ('cm', true),
  ('10 pieces packet', true)
ON CONFLICT (name) DO NOTHING;
