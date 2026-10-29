import { pgTable, serial, integer, text, boolean, timestamp, uniqueIndex, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { clientsTable } from "./clients";

const audit = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: text("created_by").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  updatedBy: text("updated_by"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by"),
});

export const clientAccountsTable = pgTable("client_accounts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().unique().references(() => clientsTable.id),
  email: text("email").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  passwordHash: text("password_hash"),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  temporaryExpiresAt: timestamp("temporary_expires_at", { withTimezone: true }),
  deliveryStatus: text("delivery_status"),
  ...audit(),
}, (t) => [
  uniqueIndex("client_accounts_email_unique").on(t.email),
  check("client_accounts_normalized_email", sql`${t.email} = lower(btrim(${t.email}))`),
]);

export const clientCredentialsTable = pgTable("client_credentials", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => clientAccountsTable.id),
  tokenHash: text("token_hash").notNull().unique(),
  kind: text("kind").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  ...audit(),
});

export const clientSessionsTable = pgTable("client_sessions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => clientAccountsTable.id),
  tokenHash: text("token_hash").notNull().unique(),
  restricted: boolean("restricted").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ...audit(),
});

// Hashes only: do not retain login emails or addresses in throttling keys.
export const clientAuthLimitsTable = pgTable("client_auth_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(1),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  ...audit(),
});
