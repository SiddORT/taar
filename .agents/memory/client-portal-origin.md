---
name: Client portal origin after task merges
description: Validate the client-email origin against the main app rather than retaining an isolated task preview address.
---

Check the configured client portal origin after isolated task merges before sending account emails.

**Why:** A task-specific preview address survived into the main environment and returned “project unavailable,” while the main app worked. Successful SMTP authentication would not have caught the broken invitation destination.

**How to apply:** Verify that the configured origin serves the client password-setup route. Keep development and production origins separate, and obtain a published URL through the deployment tools before configuring production links. Do not use isolated task preview addresses for main-app invitations.

Keep preview aliases explicitly allowlisted and development-only; do not weaken origin checks using arbitrary request hosts or broad domain suffixes.

**Why:** The same client preview was opened through `.repl.co` while its canonical email origin used `.replit.dev`, causing legitimate login requests to fail before checking credentials. Production should still accept only its canonical configured origin.

**How to apply:** Configure the exact additional preview origin without changing the canonical email destination. Ensure the running server actually receives the development environment: a shell variable applied to a build command does not carry into a separate start command after `&&`.
