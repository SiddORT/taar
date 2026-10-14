import { db, paymentTerms } from "@workspace/db";

const paymentTermsData = [
  {
    termCode: "NET00",
    description: "Due on Receipt",
    netDays: 0,
    discountPercentage: "0.00",
    discountDays: 0,
  },
  {
    termCode: "NET15",
    description: "Net 15 Days",
    netDays: 15,
    discountPercentage: "0.00",
    discountDays: 0,
  },
  {
    termCode: "NET30",
    description: "Net 30 Days (Standard B2B)",
    netDays: 30,
    discountPercentage: "0.00",
    discountDays: 0,
  },
  {
    termCode: "NET45",
    description: "Net 45 Days",
    netDays: 45,
    discountPercentage: "0.00",
    discountDays: 0,
  },
  {
    termCode: "NET60",
    description: "Net 60 Days",
    netDays: 60,
    discountPercentage: "0.00",
    discountDays: 0,
  },
  {
    termCode: "2D10N30",
    description:
      "2% discount if paid within 10 days, full amount due in 30 days",
    netDays: 30,
    discountPercentage: "2.00",
    discountDays: 10,
  },
  {
    termCode: "3D14N30",
    description:
      "3% discount if paid within 14 days, full amount due in 30 days",
    netDays: 30,
    discountPercentage: "3.00",
    discountDays: 14,
  },
  {
    termCode: "CIA",
    description: "Cash in Advance (Prepayment required)",
    netDays: 0,
    discountPercentage: "0.00",
    discountDays: 0,
  },
];

export async function seedPaymentTerms(): Promise<void> {
  for (const term of paymentTermsData) {
    await db
      .insert(paymentTerms)
      .values(term);
  }

  console.log(
    `✅ Successfully seeded ${paymentTermsData.length} payment terms.`,
  );
}