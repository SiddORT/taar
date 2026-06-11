ALTER TABLE "vendor_invoice_ledger" ADD COLUMN "legacy_paid_base" numeric(18, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
-- Backfill opening balance: existing bills' already-paid amount (bill ccy) -> INR anchor.
-- Going forward, new payments are linked via vendor_payments.vendor_invoice_ledger_id and
-- recomputeVendorBillBalances() computes paid = (legacy_paid_base + SUM(linked base)) / bill rate.
-- This preserves historical paid amounts that predate the payment->bill link without double counting.
-- Deterministic: subtract any base from payments ALREADY linked to the bill (e.g. if the link
-- column shipped before this backfill), floored at 0, so linked rows are never counted twice.
UPDATE "vendor_invoice_ledger" v
   SET "legacy_paid_base" = GREATEST(
         0,
         COALESCE(v."paid_amount", 0) * COALESCE(v."exchange_rate_snapshot", 1)
           - COALESCE((
               SELECT SUM(p."base_currency_amount")
                 FROM "vendor_payments" p
                WHERE p."vendor_invoice_ledger_id" = v."id"
                  AND p."is_deleted" = false
             ), 0)
       )
 WHERE COALESCE(v."paid_amount", 0) <> 0;
