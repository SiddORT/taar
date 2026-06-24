ALTER TABLE "purchase_orders" ADD COLUMN "vendor_mode" text DEFAULT 'header' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "vendor_id" integer;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "vendor_name" text;