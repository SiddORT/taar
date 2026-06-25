ALTER TABLE "purchase_receipts" ADD COLUMN "vendor_invoice_number" text;--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "vendor_invoice_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "vendor_invoice_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "vendor_invoice_file" text;--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "vendor_invoice_uploaded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "vendor_invoice_currency_code" text;--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "vendor_invoice_exchange_rate" numeric(14, 6);