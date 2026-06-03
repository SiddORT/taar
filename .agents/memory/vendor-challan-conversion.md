---
name: Vendor Challan → PO → PR data flow
description: Non-obvious constraints when converting vendor challans to purchase orders and receiving them
---

## purchase_order_items has NO unit_type column
Unit/UOM for a PO item is NOT stored on `purchase_order_items`. When creating PO items from a
challan's `line_items`, the unit string is stashed in the `remarks` column. Reads that need a
unit derive it via join to `inventory_items`. Don't add a `unit_type` insert to PO items — it
will fail.

**Why:** discovered while expanding challan `line_items` jsonb into individual PO rows.
**How to apply:** when writing PO items from any source, map unit → `remarks`, not a dedicated column.

## Challan-converted PO items have null inventory_item_id
A vendor challan line is free-text (`{description, quantity, unit, rate, amount}`) and is NOT
linked to an inventory item. So PO items created from a challan have `inventory_item_id = null`.
This breaks Purchase Receipt creation, which needs an inventory item per line.

**Why:** PR posts stock movements keyed by inventory item.
**How to apply:** the PR form must let the user map each unlinked line to an inventory item
(picker, block submit until all valid lines mapped) before receiving.

## Challan amount/quantity are server-authoritative
The CREATE/UPDATE routes recompute `amount = sum(qty*rate)` from validated `line_items`
server-side; the client must not be trusted to send totals. A valid line = description with a
letter/digit, qty>0, rate>0. Both routes reject challans with zero valid line items.

## Challan attachments: array column, managed ONLY by document endpoints
Challans support multiple files via a jsonb `attachments[]` column. A legacy single `attachment`
column still exists; `normalizeAttachments()` merges legacy→array on read, and the document
upload/delete endpoints write the array and null the legacy column.

**Why:** the PUT (edit) route used to write `attachment`, so editing an old challan would silently
clobber its file once the client stopped sending that field. Attachment state must be decoupled
from the entity's PUT route.
**How to apply:** never touch `attachment`/`attachments` in the PUT (edit) route — only the
dedicated `POST/DELETE /:id/document` endpoints (and the CREATE exception below) mutate them. Those
endpoints lock the row (`SELECT … FOR UPDATE` in a txn) so concurrent upload/remove can't clobber
the array, and enforce Draft-only status server-side (FE `canEdit` alone is not a security boundary).

## ALL challans start as Draft; verification is explicit
Challans are editable only while `Draft` (FE `canEdit = isNew || status==="Draft"`; BE PUT + the
`POST /:id/document` endpoint both reject non-Draft). CREATE (`POST /vendor-challans`) sets status
`Draft` for everyone — there is NO admin auto-verify. Verification is a separate `PATCH /:id/verify`
gated by the `procurement:vendor_challans:verify` permission (admin role holds it). Conversion to
PO/PR still requires `Verified`. The list shows an Edit (pencil) button on Draft rows.

**Why:** auto-verify-on-create previously made admin challans skip Draft → admins could never edit
them, and also broke the (separate) attachment upload which is Draft-only. Removing auto-verify
restores a real edit window and a uniform Draft→Verify workflow.
**How to apply:** don't reintroduce auto-verify on create; if you do, the admin path loses both edit
access and (without the atomic-create path below) attachments. Already-`Verified` legacy challans
stay immutable unless you add a reopen/migration.

## CREATE accepts attachments atomically (within creation)
The CREATE route accepts `multipart/form-data` (files under `files`) and, in ONE handler/txn,
INSERTs the row, uploads files using the new id, then writes `attachments` — so attachments are
saved as part of creation. Stays backwards-compatible with JSON bodies (multer no-ops on
non-multipart; `lineItems` parsed from string-or-array). FE create branch sends FormData, not JSON,
and does NOT do a follow-up `/document` call. On txn rollback the route deletes any already-written
files to avoid orphans.

**Why:** keeps attachment persistence tied to creation in a single atomic step (originally added to
survive the admin auto-verify timing bug; the guarantee is still desirable now that creation is
Draft).
