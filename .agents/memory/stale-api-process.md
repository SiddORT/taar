---
name: Stale API process after merges
description: A failed managed workflow can coexist with an older API process still serving outdated responses.
---

When current source includes response fields that the running API omits, check for an older API listener before changing eligibility or permission rules.

**Why:** After a merge, an old API process retained the port while the managed workflow failed with EADDRINUSE. The frontend received outdated client records without eligibility metadata and disabled otherwise valid controls.

**How to apply:** Compare the real response to current source, identify the stale listener, stop only the confirmed outdated process, and restart the existing managed workflow. Verify the corrected response without changing account settings or order data.
