---
name: API generator dependency compatibility
description: Why code generation must explicitly target workspace library versions and preserve the resolver's Zod peer declaration.
---

Do not let the API generator infer output versions from its own dependency tree. Keep its Zod output and React Query output aligned with the application's actual major versions.

**Why:** Installing a newer generator introduced its own Zod major version into pnpm's fallback resolution. Generation inferred that version instead of the application's version, and the old form resolver's undeclared Zod peer resolved to the generator's copy. The result was broken generated types and employee form typechecks even though employee code had not changed.

**How to apply:** When updating generator packages, verify generated source imports and run the whole workspace typecheck, not just the backend. Preserve the resolver package extension that declares its missing Zod peer. Do not work around dependency-resolution failures by casting form schemas or editing generated output.

For TypeScript inference over generated validators, use the same Zod entry point as the generator, even when handwritten DB schemas use a different major-version entry point.

**Why:** Mixing inference helpers from the newer entry point with validators generated against the older entry point produces `unknown` response types rather than useful contract types.
