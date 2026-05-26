// NOTE: The `inv_receipts` and `inv_receipt_items` tables previously
// declared here never existed in the live database — the
// `artifacts/api-server/src/routes/purchaseReceipts.ts` route uses raw
// SQL against non-existent tables and is itself stale. The Drizzle
// definitions were removed to prevent Replit's publish-time schema
// diff from creating phantom tables in production. The canonical
// purchase-receipt schema lives in `costing.ts`
// (`purchaseReceiptsTable`) and `extended.ts`
// (`purchaseReceiptItems`).
export {};
