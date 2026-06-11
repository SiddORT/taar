---
name: Cross-currency payment INR anchor
description: How all payment/balance math normalizes to INR and recomputes from source across client + vendor sides.
---

Canonical rule for ALL payment/balance routes (client invoices AND vendor bills/ledger):
- A doc (invoice/bill) keeps balances in its OWN currency; doc.exchange_rate_snapshot maps doc ccy -> INR.
- Every payment row stores base_currency_amount = amount * its own exchange_rate_snapshot (INR anchor).
- Apply a payment to a doc in the doc's ccy = base_currency_amount / doc.exchange_rate_snapshot.
- received/paid/pending are RECOMPUTED from SUM of non-deleted Completed payments (+ applied credit notes for invoices), NEVER incremental add/subtract.
- INR->INR (rate=1) reduces to plain arithmetic — unchanged behaviour.
- Every KPI/aggregate sum is INR-normalized (sum base_currency_amount), so mixed-currency vendors/clients total correctly.

**Why:** mixing doc-ccy and pay-ccy amounts in sums silently corrupted totals; incremental subtract drifted on edit/delete.

**How to apply / gotchas:**
- Recompute helpers are the ONLY write path for balances+status: invoiceBalances.ts (client), vendorBillBalances.ts (vendor bills). Reject incremental updates in review.
- Status MUST be pure from recomputed values (Paid / Partially Paid / Unpaid) — never fall back to prior status, or deleting all payments leaves a bill stuck "Paid".
- vendor_invoice_ledger.pending_amount is GENERATED (vendor_invoice_amount - paid_amount): never UPDATE it; only persist paid_amount + status.
- vendor bills are CREATED in procurement.ts with the currency/rate supplied in the multipart form (defaults to INR/1 for backward compat). base_currency_amount = amount * rate is stored at creation. The GET PR detail endpoint JOINs vendor_invoice_ledger to return vendor_invoice_currency_code + vendor_invoice_exchange_rate for display.
- legacy_paid_base (vendor_invoice_ledger) = opening INR balance for payments predating the payment->bill link; recompute paid = (legacy_paid_base + SUM(linked non-deleted base)) / bill.rate. Backfill must subtract already-linked base (GREATEST(0,...)) to avoid double counting.
- vendor_payments.vendor_invoice_ledger_id links a payment to a bill; any soft-delete of a linked payment MUST recompute that bill in the same transaction.
- routes/vendorLedger.ts is INR-domestic: its summary/entries/outstanding sum base_currency_amount; domestic costing tables (outsource_jobs, custom_charges, vendor_ledger_charges, artworks, style_order_artworks) have NO currency cols and stay raw INR. /pay inserts anchor at INR (rate 1, base = amount).
- Amount column names differ: vendor_payments.amount, costing_payments.payment_amount, vendor_invoice_ledger.vendor_invoice_amount.
