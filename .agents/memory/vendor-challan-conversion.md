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
from the entity's CREATE/PUT routes.
**How to apply:** never touch `attachment`/`attachments` in CREATE/PUT — only the dedicated
`POST/DELETE /:id/document` endpoints mutate them. Those endpoints lock the row (`SELECT … FOR
UPDATE` in a txn) so concurrent upload/remove can't clobber the array, and enforce Draft-only
status server-side (FE `canEdit` alone is not a security boundary).
