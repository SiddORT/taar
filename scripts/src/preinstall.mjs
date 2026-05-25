#!/usr/bin/env node
/**
 * Cross-platform preinstall guard.
 *
 * Enforces that this monorepo is installed with pnpm (not npm or yarn),
 * and removes any stray lockfiles from other package managers that would
 * otherwise compete with pnpm-lock.yaml.
 *
 * Runs on Windows, Linux, macOS, Replit, Docker, and CI — replaces the
 * previous `sh -c '…'` script which only worked on POSIX shells.
 */
import { existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");

for (const name of ["package-lock.json", "yarn.lock"]) {
  const p = resolve(root, name);
  if (existsSync(p)) {
    try {
      rmSync(p, { force: true });
      console.warn(`[preinstall] removed stray ${name}`);
    } catch {
      /* ignore */
    }
  }
}

const ua = process.env.npm_config_user_agent ?? "";
if (!ua.startsWith("pnpm/")) {
  console.error(
    "\n[preinstall] This workspace must be installed with pnpm.\n" +
      "             Detected user agent: " + (ua || "(none)") + "\n" +
      "             Run `corepack enable && pnpm install` instead.\n",
  );
  process.exit(1);
}
