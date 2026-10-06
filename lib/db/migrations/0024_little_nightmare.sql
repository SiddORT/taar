CREATE TYPE "public"."base_document_type_enum" AS ENUM('pr', 'outsource_job', 'custom_charge', 'vendor_challan', 'other_expense', 'ledger_charge', 'artwork_swatch', 'artwork_style', 'toile', 'shipping', 'style_order_product');--> statement-breakpoint
CREATE TYPE "public"."payment_source_type_enum" AS ENUM('pr_payments', 'costing_payments', 'vendor_payments');--> statement-breakpoint
CREATE TYPE "public"."payment_tds_status_enum" AS ENUM('DEDUCTED', 'DEPOSITED', 'FILED', 'REVERSED', 'NOT_APPLICABLE');--> statement-breakpoint
CREATE TYPE "public"."base_document_item_type_enum" AS ENUM('purchase_receipt_item', 'vendor_challan_items');--> statement-breakpoint
CREATE TYPE "public"."payment_items_base_document_item_type_enum" AS ENUM('purchase_receipt_item', 'vendor_challan_items');--> statement-breakpoint
CREATE TYPE "public"."payment_items_base_document_type_enum" AS ENUM('purchase_receipts', 'vendor_challans');--> statement-breakpoint
CREATE TYPE "public"."payment_items_source_type_enum" AS ENUM('pr_payments', 'vendor_payments');--> statement-breakpoint
CREATE TABLE "tds_master" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_name" text NOT NULL,
	"payment_nature" text NOT NULL,
	"section_code" text NOT NULL,
	"rate_percent" numeric(5, 2) NOT NULL,
	"threshold_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"remarks" text,
	"status" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" integer,
	"deleted_at" timestamp with time zone,
	"created_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_tds" (
	"id" serial PRIMARY KEY NOT NULL,
	"tds_master_id" integer NOT NULL,
	"payment_source_type" "payment_source_type_enum" NOT NULL,
	"payment_source_id" integer NOT NULL,
	"payment_date" timestamp with time zone NOT NULL,
	"vendor_id" integer,
	"base_document_type" "base_document_type_enum",
	"base_document_id" integer,
	"gross_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"gst_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"gst_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"payment_currency_code" varchar(10),
	"payment_exchange_rate" numeric(15, 6),
	"base_amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) NOT NULL,
	"tds_rate" numeric(5, 2) NOT NULL,
	"tds_amount" numeric(15, 2) NOT NULL,
	"status" "payment_tds_status_enum" DEFAULT 'DEDUCTED' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_tds_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_tds_id" integer NOT NULL,
	"base_document_item_type" "base_document_item_type_enum" NOT NULL,
	"base_document_item_id" integer NOT NULL,
	"base_amount" numeric(15, 2) NOT NULL,
	"gst_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"gst_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"tds_rate" numeric(15, 2) DEFAULT '0' NOT NULL,
	"tds_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(15, 2) NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vendor_challan_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_challan_id" integer NOT NULL,
	"description" varchar(500),
	"quantity" numeric(14, 3) NOT NULL,
	"unit" varchar(50),
	"rate" numeric(14, 2) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"hsn_id" integer,
	"hsn_code" varchar(20),
	"gst_percentage" numeric(5, 2) NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_source_type" "payment_items_source_type_enum" NOT NULL,
	"payment_source_id" integer NOT NULL,
	"base_document_type" "payment_items_base_document_type_enum" NOT NULL,
	"base_document_id" integer NOT NULL,
	"base_document_item_type" "payment_items_base_document_item_type_enum" NOT NULL,
	"base_document_item_id" integer NOT NULL,
	"base_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"gst_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"gross_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"tds_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"line_no" integer DEFAULT 1 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" varchar(50) DEFAULT 'Item' NOT NULL,
	"quantity" numeric(18, 4) DEFAULT '1' NOT NULL,
	"unit_price" numeric(18, 4) DEFAULT '0' NOT NULL,
	"total" numeric(18, 4) DEFAULT '0' NOT NULL,
	"hsn_code" varchar(20) DEFAULT '',
	"hsn_gst_pct" varchar(10) DEFAULT '',
	"show_hsn" boolean DEFAULT true NOT NULL,
	"unit" varchar(30) DEFAULT '',
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(100),
	"is_locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_payment_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"invoice_line_item_id" integer NOT NULL,
	"allocated_gross_amount" numeric(18, 4) NOT NULL,
	"allocated_taxable_amount" numeric(18, 4) DEFAULT '0' NOT NULL,
	"net_received_amount" numeric(18, 4) NOT NULL,
	"allocation_sequence" integer DEFAULT 1 NOT NULL,
	"remarks" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "invoice_payment_tds" (
	"id" serial PRIMARY KEY NOT NULL,
	"tds_master_id" integer NOT NULL,
	"payment_id" integer NOT NULL,
	"payment_date" timestamp with time zone NOT NULL,
	"client_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"gross_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"gst_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"gst_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"payment_currency_code" varchar(10),
	"payment_exchange_rate" numeric(15, 6),
	"base_amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) NOT NULL,
	"tds_rate" numeric(5, 2) NOT NULL,
	"tds_amount" numeric(15, 2) NOT NULL,
	"status" text DEFAULT 'DEDUCTED' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "invoice_payment_tds_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_payment_tds_id" integer NOT NULL,
	"invoice_line_item_id" integer NOT NULL,
	"payment_item_id" integer,
	"base_amount" numeric(15, 2) NOT NULL,
	"gst_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"gst_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"tds_rate" numeric(15, 2) DEFAULT '0' NOT NULL,
	"tds_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(15, 2) NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "vendor_id" integer;--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "total_amount_with_gst" text;--> statement-breakpoint
ALTER TABLE "style_order_products" ADD COLUMN "gst_percentage" numeric(5, 2) DEFAULT '18' NOT NULL;--> statement-breakpoint
ALTER TABLE "style_order_artworks" ADD COLUMN "gst_percentage" numeric(5, 2) DEFAULT '18' NOT NULL;--> statement-breakpoint
ALTER TABLE "style_order_artworks" ADD COLUMN "toil_gst_percentage" numeric(5, 2) DEFAULT '18' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_ledger_charges" ADD COLUMN "hsn_id" integer;--> statement-breakpoint
ALTER TABLE "vendor_ledger_charges" ADD COLUMN "hsn_code" text;--> statement-breakpoint
ALTER TABLE "vendor_ledger_charges" ADD COLUMN "gst_percentage" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "vendor_ledger_charges" ADD COLUMN "order_id" integer;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD COLUMN "reference_type" text;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD COLUMN "reference_id" integer;--> statement-breakpoint
ALTER TABLE "other_expenses" ADD COLUMN "hsn_id" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "other_expenses" ADD COLUMN "hsn_code" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "other_expenses" ADD COLUMN "gst_percentage" text DEFAULT '5' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "hsn_id" integer;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "hsn_code" text;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "gst_percentage" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_receipt_items" ADD COLUMN "hsn_id" integer;--> statement-breakpoint
ALTER TABLE "purchase_receipt_items" ADD COLUMN "hsn_code" text;--> statement-breakpoint
ALTER TABLE "purchase_receipt_items" ADD COLUMN "gst_percentage" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "tds_master" ADD CONSTRAINT "tds_master_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tds_master" ADD CONSTRAINT "tds_master_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tds_master" ADD CONSTRAINT "tds_master_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_tds" ADD CONSTRAINT "payment_tds_tds_master_id_tds_master_id_fk" FOREIGN KEY ("tds_master_id") REFERENCES "public"."tds_master"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_tds" ADD CONSTRAINT "payment_tds_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_tds_items" ADD CONSTRAINT "payment_tds_items_payment_tds_id_payment_tds_id_fk" FOREIGN KEY ("payment_tds_id") REFERENCES "public"."payment_tds"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_challan_items" ADD CONSTRAINT "vendor_challan_items_vendor_challan_id_vendor_challans_id_fk" FOREIGN KEY ("vendor_challan_id") REFERENCES "public"."vendor_challans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_challan_items" ADD CONSTRAINT "vendor_challan_items_hsn_id_hsn_master_id_fk" FOREIGN KEY ("hsn_id") REFERENCES "public"."hsn_master"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_items" ADD CONSTRAINT "invoice_payment_items_payment_id_invoice_payments_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."invoice_payments"("payment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_items" ADD CONSTRAINT "invoice_payment_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_items" ADD CONSTRAINT "invoice_payment_items_invoice_line_item_id_invoice_line_items_id_fk" FOREIGN KEY ("invoice_line_item_id") REFERENCES "public"."invoice_line_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_tds" ADD CONSTRAINT "invoice_payment_tds_tds_master_id_tds_master_id_fk" FOREIGN KEY ("tds_master_id") REFERENCES "public"."tds_master"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_tds" ADD CONSTRAINT "invoice_payment_tds_payment_id_invoice_payments_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."invoice_payments"("payment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_tds" ADD CONSTRAINT "invoice_payment_tds_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_tds" ADD CONSTRAINT "invoice_payment_tds_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_tds_items" ADD CONSTRAINT "invoice_payment_tds_items_invoice_payment_tds_id_invoice_payment_tds_id_fk" FOREIGN KEY ("invoice_payment_tds_id") REFERENCES "public"."invoice_payment_tds"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_tds_items" ADD CONSTRAINT "invoice_payment_tds_items_invoice_line_item_id_invoice_line_items_id_fk" FOREIGN KEY ("invoice_line_item_id") REFERENCES "public"."invoice_line_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_tds_items" ADD CONSTRAINT "invoice_payment_tds_items_payment_item_id_invoice_payment_items_id_fk" FOREIGN KEY ("payment_item_id") REFERENCES "public"."invoice_payment_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_invoice_line_items_invoice_id" ON "invoice_line_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_line_items_invoice_line_no" ON "invoice_line_items" USING btree ("invoice_id","line_no");