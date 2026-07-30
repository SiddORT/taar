---
name: Drizzle migration policy
description: ERP uses versioned generate+migrate (not push); how to baseline a pre-existing DB.
---

# Migration policy: versioned, not `push`

Schema changes must flow through committed versioned migrations (`generate` → commit → `migrate`),
NOT `drizzle-kit push`. Automation (post-merge) runs `migrate`. `push`/`push-force` remain only
as escape hatches for throwaway local dev.
**Why:** `push` mutates schema with no history/log and silently drifts from committed migrations,
causing conflicts across environments.

## Baselining a DB that already has tables (non-obvious)
A DB previously managed by `push` already contains the tables, so running the 0000 baseline
migration fails with "relation already exists". drizzle-kit has no built-in "mark applied".
Procedure: create the `drizzle.__drizzle_migrations` tracking table, then insert ONE row for the
baseline entry — `hash` = SHA-256 of the entire migration `.sql` file contents, `created_at` =
the `when` value from `meta/_journal.json`. After that, `migrate` is a clean no-op.
A truly empty DB just runs `migrate` normally. Every legacy env (teammates' local DBs, prod if it
was push-managed) needs this same one-time baseline before its first `migrate`.

## Duplicate-column drift & idempotent "column already exists" migrations
History here left orphan DB columns that the Drizzle schema no longer maps (e.g. `materials.item_type`
beside `materials.type`, `fabrics.width_unit_type` beside `fabrics.unit_type`) because earlier
`generate`d DROP statements were manually deleted from the migration SQL. drizzle-kit diffs the schema
against the `meta/` snapshot (NOT the live DB), so re-adding such a column to the schema makes `generate`
emit a plain `ADD COLUMN`, which then FAILS on every env where the column already physically exists.
**Fix:** hand-edit the generated SQL to be idempotent — `ADD COLUMN IF NOT EXISTS <col> <type> NOT NULL DEFAULT ''`
then `ALTER COLUMN <col> DROP DEFAULT` (the DEFAULT lets a hypothetical fresh-but-populated table satisfy
NOT NULL; DROP DEFAULT reconverges to a no-default schema mapping). Safe no-op where the column exists.
**Why:** keeps the snapshot/history consistent (so future `generate`s don't re-emit the ADD) while being
runnable on dev + the self-hosted prod that already has the column.
**How to apply:** before re-mapping any column that may already exist in some envs, check the live DB
(`information_schema.columns`) and make the migration `IF NOT EXISTS`. To decide between aligning code to
the schema vs. re-adding a dropped column: follow what the frontend contract already consumes — if the UI
already sends/reads the field (and the lookup/feature exists), re-add the column; if the schema+frontend
already agree on a name and only stale backend code differs, fix the backend.
