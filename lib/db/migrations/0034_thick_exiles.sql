ALTER TABLE "trading_purchase_product" ADD COLUMN "discount_type" varchar(10) DEFAULT 'amount' NOT NULL;--> statement-breakpoint
ALTER TABLE "trading_purchase_product_items" ADD COLUMN "color_name" varchar(100);--> statement-breakpoint
ALTER TABLE "trading_purchase_product_items" ADD COLUMN "color_hex_code" varchar(10);--> statement-breakpoint
ALTER TABLE "trading_purchase_product_items" ADD COLUMN "discount_type" varchar(10);--> statement-breakpoint
ALTER TABLE "trading_purchase_product_items" ADD COLUMN "discount_value" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "trading_purchase_product_items" DROP COLUMN "warehouse_id";