---
name: Stale API process after merges
description: A failed managed workflow can coexist with an older API process still serving outdated responses.
---

When current source includes response fields that the running API omits, check for an older API listener before changing eligibility or permission rules.

**Why:** After a merge, an old API process retained the port while the managed workflow failed with EADDRINUSE. The frontend received outdated client records without eligibility metadata and disabled otherwise valid controls.

**How to apply:** Compare the real response to current source, identify the stale listener, stop only the confirmed outdated process, and restart the existing managed workflow. Verify the corrected response without changing account settings or order data.

The same post-merge conflict can affect the ERP frontend: a duplicate Vite process can retain the configured port while the managed workflow silently moves to another port.

**Why:** A merged portal update left two frontend processes running; the managed workflow's open port differed from its configured preview port.

**How to apply:** Compare the workflow's actual open port with its configured port, identify the duplicate listener before stopping it, and keep strict-port behavior so conflicts fail explicitly rather than serving an unintended process.
