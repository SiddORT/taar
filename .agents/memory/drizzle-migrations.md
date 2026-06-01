---
name: Drizzle migration policy
description: ZARI ERP uses versioned generate+migrate (not push); how to baseline a pre-existing DB.
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
