---
name: Media/upload storage strategy (dual)
description: Where uploaded images/files actually live in ZARI ERP — base64 blobs in DB vs disk-path text columns. Not uniform.
---

# Media storage is split TWO ways — there is NO single rule

Do NOT claim "all uploads are on disk" — that is wrong. The app uses two distinct strategies depending on the column.

## A. Blob in DB (base64 data URI stored inline)
All `jsonb` image/attachment columns store the bytes **inside the row** as a base64 data URI
(`data:image/...;base64,...`), NOT a path. No `bytea` is used — it's base64 text inside jsonb.
- Master `images` jsonb `{id,name,data,size}`: `fabrics`, `materials`, `items`, `inventory_items`.
- Order/artwork jsonb `ref_images`/`wip_images`/`final_images`/`toile_images`/`hidden_images`:
  `artworks`, `style_orders`, `style_order_products`, `style_order_artworks`, `swatch_orders`, `client_links`.
- Payment attachments jsonb (`PaymentAttachmentFile`): `pr_payments.attachment`, `vendors.payment_attachments`.

**Implication:** these bloat Postgres + DB backups; they do NOT appear in the `uploads/` folder.

## B. Disk file (path stored in a `text` column)
Bytes written to `<process.cwd()>/uploads/<entity>/...` by `uploadHelper`/`storage` (local driver,
S3 stub exists). DB column holds the `/uploads/...` string. Served via `/uploads` + `/api/uploads`
(express.static). Confirmed disk-path columns: `other_expenses.attachment`,
`invoice_payments.attachment`, `packing_list_items.item_image_url`,
`packing_package_items.item_image_url`. Procurement `item_image` and quotation
`cover_page_image`/`design_image` are also text (client-supplied; may be path or inline data URI).
`styles.attach_link` is a user-entered external URL, not an upload.

**Why it matters:** disk files need the `uploads/` dir backed up separately from the DB; the two
sets do not overlap. In dev the disk had orphan files while the text columns were empty — disk and
DB can drift.

**How to apply:** to count "uploads" you must check BOTH — `jsonb_array_length` on the blob columns
AND non-empty text path columns + `find uploads/ -type f`. Migrating storage (e.g. to S3) only
affects category B; category A lives in the DB and would need a separate migration.
