// seed-bank-accounts.ts
import { db, bankAccounts, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function seedBankAccounts(): Promise<void> {
  // Get creator
  const users = await db.select().from(usersTable).where(eq(usersTable.isActive, true));
  let creatorEmail = "system";
  if (users.length > 0) {
    const admin = users.find((u) => u.email === "admin@erp.com");
    creatorEmail = admin ? admin.email : users[0].email;
  }

  const bankData = [
    {
      bankName: "ICICI Bank",
      accountNo: "123456789012",
      ifscCode: "ICIC0000123",
      branch: "Mumbai Main Branch",
      accountName: "ERP Pvt Ltd",
      bankUpi: "taar@icici",
      isDefault: true,
    },
    {
      bankName: "HDFC Bank",
      accountNo: "987654321098",
      ifscCode: "HDFC0000456",
      branch: "Delhi Branch",
      accountName: "ERP Pvt Ltd",
      bankUpi: "taar@hdfc",
      isDefault: false,
    },
    {
      bankName: "State Bank of India",
      accountNo: "456789012345",
      ifscCode: "SBIN0001234",
      branch: "Ahmedabad Branch",
      accountName: "ERP Pvt Ltd",
      bankUpi: "taar@sbi",
      isDefault: false,
    },
  ];

  await db.transaction(async (tx) => {
    let inserted = 0;
    for (const bank of bankData) {
      const [result] = await tx
        .insert(bankAccounts)
        .values({
          bankName: bank.bankName,
          accountNo: bank.accountNo,
          ifscCode: bank.ifscCode,
          branch: bank.branch,
          accountName: bank.accountName,
          bankUpi: bank.bankUpi,
          isDefault: bank.isDefault,
          createdBy: creatorEmail,
          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
          // createdAt and updatedAt will be defaulted
        })
        .onConflictDoNothing() // optionally, if we have unique constraints
        .returning({ id: bankAccounts.id });
      if (result) inserted++;
    }
    console.log(`[seed-bank-accounts] ${inserted} bank accounts inserted.`);
  });
}