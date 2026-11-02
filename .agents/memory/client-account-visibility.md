---
name: Client account order visibility
description: Client login shows owned non-draft orders, products, artworks and conversations automatically; only public bearer links require publishing.
---

Clients should automatically see their own non-deleted, non-draft swatch and style orders, products, artworks and conversations, including completed and cancelled orders with their actual statuses. Client-account detail must return contentPublished: true by default, including for existing orders.

**Why:** The user explicitly repeated that orders, products and artworks should be visible by default in client login, and rejected requiring a Publish step for creative content.

**How to apply:** Do not restore published-only filtering for account lists, dashboard totals, order details, products, artworks or conversation topics. Public bearer-link publishing is separate: unpublishing must not hide content from authenticated owners. Preserve ownership, draft/deletion restrictions, explicit hidden-image settings, closed artwork topics and private internal notes.

Keep existing link-based identifiers and conversation histories compatible. Any internal link records needed to represent account orders must stay unpublished until staff explicitly publishes them.

**Why:** The existing public links and conversations already use those identifiers. Automatically making orders visible must not inadvertently enable bearer-link access or advance their workflow status.

**How to apply:** Treat automatic account representation as bookkeeping, not publication. Do not email clients, change order statuses, or enable public links merely because an account views its order list.
