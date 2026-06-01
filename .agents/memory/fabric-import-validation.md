---
name: Fabric import validation drift
description: The /fabrics/import route validates inline and can silently diverge from the shared create/update validator.
---

# Fabric import validation drift

The `POST /fabrics/import` route in `artifacts/api-server/src/routes/fabrics.ts` validates each Excel row with its own inline checks, separate from `validateFabricFields()` used by the create/update routes.

**Why:** These two validation paths drifted before — import validated a now-removed field while skipping `unitType` entirely (inserted `unitType ?? ""`), so imports could silently create fabrics with a blank required field while the UI create/update path rejected the same input.

**How to apply:** Any time a required fabric field changes (added, removed, renamed, or its length/format rules change), update BOTH `validateFabricFields()` and the inline import checks in lockstep. Also keep the FabricMaster Excel header→field mapping aligned, and add a legacy-header fallback (e.g. `r["Unit Type"] ?? r["Width Unit Type"]`) when a column is renamed so old sheets still import.
