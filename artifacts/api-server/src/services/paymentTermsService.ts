import { ilike, or } from "drizzle-orm";
import { db, paymentTerms } from "@workspace/db";

export async function listPaymentTerms(params: { search: string; }) {
  const { search } = params;

  const term = search.trim();

  if (!term) {
    return await db
      .select()
      .from(paymentTerms);
  }

  return await db
    .select()
    .from(paymentTerms)
    .where(
      or(
        ilike(paymentTerms.termCode, `%${term}%`),
        ilike(paymentTerms.description, `%${term}%`),
      ),
    );
}