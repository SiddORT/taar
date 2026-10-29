ALTER TABLE "client_messages" ALTER COLUMN "artwork_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "client_messages" ADD COLUMN "target_type" text DEFAULT 'artwork' NOT NULL;--> statement-breakpoint
ALTER TABLE "client_messages" ADD COLUMN "product_id" integer;