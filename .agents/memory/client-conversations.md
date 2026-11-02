---
name: Unified client and admin conversations
description: User-approved single order conversation with General, Product, and Artwork topics rather than separate chat channels.
---

Keep one chronological conversation per order on both client and admin screens. General, Product, and Artwork are topics within that conversation, not separate chat boxes.

**Why:** The user found the separate “order conversation” and product/artwork chats confusing and approved this unified flow.

**How to apply:** Preserve existing messages and attachments. Label messages with their topic, sender, and timestamp; replies retain their topic. Product/artwork areas may offer Discuss shortcuts into the same conversation. Filters must not create separate histories.

Use the same guided context selection on client and admin: General, Product → choose product, or Artwork → choose product → choose artwork. Show the full product → artwork context in message labels and composer; Reply and Discuss select that context automatically. A product history filter includes its own discussion and its artwork discussions; an artwork filter targets only that artwork.

**Why:** The user found the flat topic list confusing when an order contains multiple products with multiple artworks, and approved the guided flow for both client and admin.

**How to apply:** Identify targets by ID, never display name. Disambiguate duplicate artwork names using parent product and code/ID. Incomplete selections must block sending without clearing text/attachments or defaulting to General. Keep order-level artworks usable when they have no parent product, and preserve drafts when using Discuss shortcuts.

General, Product and Artwork topics work as soon as an owned non-draft order is visible in client login. They must not depend on public-link publication. Closed artwork topics remain readable but cannot accept messages; General stays available.

**Why:** The user explicitly clarified that products and artworks should be visible by default, so their conversation topics must be usable without manual publication too.

**How to apply:** Enforce ownership, topic validity and closure on the server, not only in selectors. Publication remains a separate requirement for public bearer-link access only. Never infer artwork approval from chat: Approve / Request Rework remain separate actions. Internal notes must never enter client conversations.
