ALTER TABLE "costing_payments" ADD COLUMN "currency_code" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "costing_payments" ADD COLUMN "exchange_rate_snapshot" numeric(18, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "costing_payments" ADD COLUMN "base_currency_amount" numeric(18, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "pr_payments" ADD COLUMN "currency_code" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "pr_payments" ADD COLUMN "exchange_rate_snapshot" numeric(18, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "pr_payments" ADD COLUMN "base_currency_amount" numeric(18, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD COLUMN "currency_code" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD COLUMN "exchange_rate_snapshot" numeric(18, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD COLUMN "base_currency_amount" numeric(18, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_invoice_ledger" ADD COLUMN "currency_code" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_invoice_ledger" ADD COLUMN "exchange_rate_snapshot" numeric(18, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_invoice_ledger" ADD COLUMN "base_currency_amount" numeric(18, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
-- Backfill INR anchor for existing rows (legacy data is INR @ rate 1)
UPDATE "costing_payments" SET "base_currency_amount" = "payment_amount" WHERE "base_currency_amount" = '0';--> statement-breakpoint
UPDATE "pr_payments" SET "base_currency_amount" = "amount"::numeric WHERE "base_currency_amount" = '0';--> statement-breakpoint
UPDATE "vendor_payments" SET "base_currency_amount" = "amount"::numeric WHERE "base_currency_amount" = '0';--> statement-breakpoint
UPDATE "vendor_invoice_ledger" SET "base_currency_amount" = "vendor_invoice_amount" WHERE "base_currency_amount" = '0';