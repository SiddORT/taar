ALTER TABLE "fabrics" ADD COLUMN IF NOT EXISTS "width_unit_type" text NOT NULL DEFAULT '';
ALTER TABLE "fabrics" ALTER COLUMN "width_unit_type" DROP DEFAULT;
