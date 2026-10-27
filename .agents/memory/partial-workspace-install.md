---
name: Partial workspace installation
description: Keep independently installable frontend usable when unrelated backend dependencies cannot be installed.
---

An interrupted full pnpm installation can leave application executables unlinked even when most packages have downloaded. Installing only the frontend and its transitive workspace packages can restore the frontend without installing a blocked backend package.

**Why:** A backend dependency rejected by the package firewall prevented the entire workspace install from linking executables, causing the independently runnable ERP frontend to fail too.

**How to apply:** Use pnpm's package filter with its dependency suffix and the frozen lockfile. Do not bypass the firewall or imply that a working login page means the backend works. Full installation and backend setup remain necessary.

When a locked package version is firewall-blocked, check the configured registry for a newer compatible published release before treating installation as permanently blocked. Keep the registry, firewall, and minimum-release-age protections intact. Upgrade narrowly, inspect the resulting lockfile diff for unrelated changes, and verify the application through the shared proxy.

**Why:** A compatible patch release allowed the backend to install normally after the older locked release was rejected. Separate code-generation dependencies could still block an unfiltered workspace install, even though the runtime application packages installed successfully.
