---
name: base64-to-disk image/attachment storage
description: which image/attachment columns are disk-url-backed vs still base64, and the gotchas when rendering or adding write paths
---

# Image / attachment storage split

Not all image/attachment JSONB columns are the same. There are TWO groups; know which one a column belongs to before touching its render or write code.

## Disk-URL-backed (store `/uploads/...` url, NOT base64)
- `fabrics.images`, `materials.images`, `items.images`
- `inventory_items.images` (mirrored from fabric/material)
- `vendors.payment_attachments`
- `pr_payments.attachment`

Backend converts on write via helpers in `uploadHelper.ts` (`persistDataUri`, `persistImageArray`, `persistAttachmentArray`, `persistAttachmentObject`). Frontend still SENDS base64 in JSON; backend decodes → writes file → stores url. Zod schemas accept BOTH `data?` and `url?` optional so base64 (create) and stored url (edit) both validate. Render with `fileSrc({url?,data?})` / `mediaUrl(url)` from `zari-erp/src/utils/mediaUrl.ts` (prefixes `/api` to `/uploads/...`).

## Still base64 (intentionally NOT converted)
- Quotation/order client-chat attachments (ClientPortal, ClientLinkTab, StyleClientLinkTab)
- Order artworks / products (ArtworkDetail, SwatchOrderDetail, StyleOrderArtworksTab, ProductsTab)
- `ImageLightbox.tsx` shared component is base64-only and is used ONLY by the above artwork/order pages — do NOT feed it disk-url images.
- packing-list item images use their own legacy `/api/packing-lists/item-images/...` path.

## Gotchas
- **`inventory_items.images` has TWO write paths**: the master create/update routes AND `POST /inventory/items/:id/add-image` (which mirrors the appended image back to the source fabric/material via `appendImageToInventoryAndMaster`). BOTH must persist a url, not base64. Easy to miss the add-image endpoint.
- `persistDataUri` enforces a MIME allowlist (keys of `MIME_EXT`) + 20MB cap; disallowed/oversized entries return null and are silently skipped by the array helpers.
- **Why:** keeps DB rows small and lets storage swap to S3 later without schema change.

## Out of scope / known gap
Production runs on a self-hosted VPS with pre-existing base64 blobs in these columns. Only the dev DB and the going-forward write path were changed — old prod blobs will NOT auto-convert. A one-time backfill migration script would be needed to convert them.
