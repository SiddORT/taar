---
name: Soft-delete convention (app-wide)
description: How soft delete works across the ERP API — every table, deletes, reads, and the gotchas that bite.
---

# Soft delete is app-wide

Every physical table carries `is_deleted boolean NOT NULL DEFAULT false` (drizzle `isDeleted`).
There are NO hard deletes anywhere in `artifacts/api-server/src/routes` — a stray `db.delete(` or
raw `DELETE FROM` is a regression.

**Why:** user explicitly chose to soft-delete everything, including ledger and line-item rows,
accepting that balances/totals may be affected, so records are auditable/restorable.

## How to apply

- **Delete handler** = `UPDATE ... SET is_deleted=true WHERE id=$1 AND is_deleted=false RETURNING id`
  (drizzle: `.set({isDeleted:true}).where(and(eq(id),eq(isDeleted,false)))`). 0 rows ⇒ 404. This makes
  re-delete idempotent (second call 404s). Add `updated_at`/`updated_by` ONLY if the table has them.
- **WHO/WHEN metadata**: EVERY table also has `deleted_by text` (nullable) + `deleted_at timestamptz`
  (nullable) (drizzle `deletedBy`/`deletedAt`). Every soft-delete write MUST also set them: raw →
  `SET is_deleted=true, deleted_by=$N, deleted_at=now()` (deleted_at needs no param; deleted_by takes
  ONE new positional `$N` appended to the params array — numbering is positional, not text-order);
  drizzle → `.set({isDeleted:true, deletedBy:<identity>, deletedAt:new Date()})`. Identity = the
  handler's existing actor var (`req.user?.email`/`(req.user as any)?.email`/`userName`), fallback
  `"system"`. Never invent a new identity source. Reads/inserts/numbering/guards stay untouched.
- **Cascade**: soft-delete child rows in the SAME transaction as the parent, with the SAME
  `deleted_by`/`deleted_at` as the parent.
- **Reads** (list, get-by-id, lookup/dropdown, export, count, SUM/aggregations) must filter
  `is_deleted=false`. get-by-id on a deleted row returns 404.
- **LEFT JOIN gotcha**: put the child `is_deleted=false` filter in the **ON clause**, never WHERE —
  WHERE turns the outer join into an inner join and silently drops parent rows. INNER JOIN: either is fine.
- **Mutations other than delete** (PUT/PATCH/status) must ALSO guard `is_deleted=false` in their WHERE,
  or a deleted record stays mutable by id. This was missed initially on invoices.
- **Auth is not exempt**: user lookups in login/forgot-password/accept-invite/me must filter
  `users.is_deleted=false` or a deleted user can still authenticate. Permission reads
  (`/auth/my-permissions`, `/settings/my-permissions`, vendor-challan verify check) must filter
  `role_permissions.is_deleted` AND `roles.is_deleted` or revoked perms are still honored.

## Numbering interaction

Sequence numbers come from `artifacts/api-server/src/utils/sequence.ts` (`nextSequenceNumber`,
MAX-based via regex). It deliberately does NOT filter `is_deleted`, so numbers of deleted records
stay reserved and are never reused. Do not "fix" this to skip deleted rows.
