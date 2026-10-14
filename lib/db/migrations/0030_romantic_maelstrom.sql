CREATE TABLE "trading_purchase_product" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_number" varchar(50) NOT NULL,
	"purchase_date" timestamp NOT NULL,
	"vendor_id" integer NOT NULL,
	"vendor_invoice_number" varchar(100),
	"supplier_po_number" varchar(100),
	"payment_terms" varchar(50),
	"due_date" timestamp,
	"notes" text,
	"freight" numeric(14, 2) DEFAULT '0' NOT NULL,
	"other_charges" numeric(14, 2) DEFAULT '0' NOT NULL,
	"transportation" numeric(14, 2) DEFAULT '0' NOT NULL,
	"insurance" numeric(14, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"remarks" text,
	"subtotal" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_gst_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"taxable_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"grand_total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"balance_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"payment_status" varchar(20) DEFAULT 'Pending' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" integer,
	"deleted_at" timestamp with time zone,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "trading_purchase_product_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"size" varchar(20),
	"quantity" numeric(14, 3) DEFAULT '0' NOT NULL,
	"rate" numeric(14, 2) DEFAULT '0' NOT NULL,
	"hsn_code" varchar(20) NOT NULL,
	"gst_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"gst_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "trading_purchase_product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"trading_purchase_product_id" integer NOT NULL,
	"image_path" text NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" bigint NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "tpp_purchase_number_uq" ON "trading_purchase_product" USING btree ("purchase_number");--> statement-breakpoint
CREATE INDEX "tpp_vendor_idx" ON "trading_purchase_product" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "tpp_purchase_date_idx" ON "trading_purchase_product" USING btree ("purchase_date");--> statement-breakpoint
CREATE INDEX "tpp_payment_status_idx" ON "trading_purchase_product" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "ppi_purchase_idx" ON "trading_purchase_product_items" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "ppi_product_idx" ON "trading_purchase_product_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "ppi_hsn_idx" ON "trading_purchase_product_items" USING btree ("hsn_code");--> statement-breakpoint
CREATE INDEX "tppi_purchase_idx" ON "trading_purchase_product_images" USING btree ("trading_purchase_product_id");