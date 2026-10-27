---
name: Partial workspace installation
description: Keep independently installable frontend usable when unrelated backend dependencies cannot be installed.
---

An interrupted full pnpm installation can leave application executables unlinked even when most packages have downloaded. Installing only the frontend and its transitive workspace packages can restore the frontend without installing a blocked backend package.

**Why:** A backend dependency rejected by the package firewall prevented the entire workspace install from linking executables, causing the independently runnable ERP frontend to fail too.

**How to apply:** Use pnpm's package filter with its dependency suffix and the frozen lockfile. Do not bypass the firewall or imply that a working login page means the backend works. Full installation and backend setup remain necessary.
