import { pgTable, varchar, text, integer, numeric, check, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const paymentTerms = pgTable( "payment_terms", {
    id: serial("id").primaryKey(),
    termCode: varchar("term_code", { length: 30 }),
    description: text("description").notNull(),
    netDays: integer("net_days").notNull(),
    discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2, })
      .notNull()
      .default("0.00"),
    discountDays: integer("discount_days").notNull().default(0),
  },
  (table) => [
    check(
      "payment_terms_net_days_positive",
      sql`${table.netDays} >= 0`,
    ),
    check(
      "payment_terms_discount_percentage_valid",
      sql`${table.discountPercentage} >= 0 AND ${table.discountPercentage} <= 100`,
    ),
    check(
      "payment_terms_discount_days_valid",
      sql`${table.discountDays} >= 0 AND ${table.discountDays} <= ${table.netDays}`,
    ),
  ],
);

export type PaymentTerm = typeof paymentTerms.$inferSelect;
export type NewPaymentTerm = typeof paymentTerms.$inferInsert;