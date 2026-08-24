import {
  db,
  creditDebitNotes,
  invoicesTable,
  vendorInvoiceLedger,
  clientInvoiceLedger,
  usersTable,
  vendorsTable,
  sql,
} from "@workspace/db";
import { eq, and, gt, isNotNull } from "drizzle-orm";

// Reason lists (matching frontend)
const CN_REASONS = [
  "Discount Correction",
  "Overbilling Correction",
  "Returns Adjustment",
  "Sampling Adjustment",
  "Manual Reduction",
];
const DN_REASONS = [
  "Additional Billing",
  "Rate Correction",
  "Additional Service Charge",
  "Material Recovery Correction",
  "Manual Increase",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const NOTES_CONFIG = {
  MANUAL_CREDIT: 2,
  MANUAL_DEBIT: 2,
  INVOICE_CREDIT: 3,
  VENDOR_DEBIT: 3,
};

export async function seedCreditDebitNotes(): Promise<void> {
  // Idempotency
  const existing = await db
    .select({ id: creditDebitNotes.noteId })
    .from(creditDebitNotes)
    .where(
      and(
        eq(creditDebitNotes.isDeleted, false),
        sql`${creditDebitNotes.remarks} LIKE '%Seeder%'`
      )
    )
    .limit(1);
  if (existing.length > 0) {
    console.log("[seedCreditDebitNotes] Already seeded. Skipping.");
    return;
  }

  // Dependencies
  const users = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.isActive, true), eq(usersTable.isDeleted, false)))
    .limit(1);
  const actor = users.length ? users[0].username : "System";

  const vendors = await db
    .select()
    .from(vendorsTable)
    .where(and(eq(vendorsTable.isActive, true), eq(vendorsTable.isDeleted, false)));

  // Invoices with pending > 0 (also fetch client_id)
  const invoices = await db
    .select({
      id: invoicesTable.id,
      invoiceNo: invoicesTable.invoiceNo,
      clientId: invoicesTable.clientId,
      clientName: invoicesTable.clientName,
      currencyCode: invoicesTable.currencyCode,
      exchangeRateSnapshot: invoicesTable.exchangeRateSnapshot,
      pendingAmount: invoicesTable.pendingAmount,
      receivedAmount: invoicesTable.receivedAmount,
      totalAmount: invoicesTable.totalAmount,
    })
    .from(invoicesTable)
    .where(
      and(
        eq(invoicesTable.isDeleted, false),
        isNotNull(invoicesTable.pendingAmount),
        gt(invoicesTable.pendingAmount, "0")
      )
    );

  // Vendor bills with pending > 0
  const vendorBills = await db
    .select()
    .from(vendorInvoiceLedger)
    .where(
      and(
        eq(vendorInvoiceLedger.isDeleted, false),
        sql`${vendorInvoiceLedger.vendorInvoiceAmount} - ${vendorInvoiceLedger.paidAmount} > 0`
      )
    );

  // Note number generation
  const existingNotes = await db
    .select({ noteNumber: creditDebitNotes.noteNumber })
    .from(creditDebitNotes)
    .where(eq(creditDebitNotes.isDeleted, false));
  const usedNumbers = new Set(existingNotes.map(n => n.noteNumber));

  function generateNoteNumber(type: "Credit Note" | "Debit Note"): string {
    const prefix = type === "Credit Note" ? "CN" : "DN";
    const year = new Date().getFullYear();
    let seq = 1;
    while (true) {
      const candidate = `${prefix}-${year}-${String(seq).padStart(5, "0")}`;
      if (!usedNumbers.has(candidate)) {
        usedNumbers.add(candidate);
        return candidate;
      }
      seq++;
    }
  }

  const notesToInsert: any[] = [];
  // We'll collect updates to invoices and vendor bills after insertion
  // because we need the note_id for some references.
  const invoiceCreditUpdates: { invoiceId: number; amount: number; clientId: number | null; noteNumber: string }[] = [];
  const vendorDebitUpdates: { vendorBillId: number; noteNumber: string }[] = [];

  // --- Manual Credit Notes (no linked document) ---
  for (let i = 0; i < NOTES_CONFIG.MANUAL_CREDIT; i++) {
    const vendor = vendors.length ? vendors[i % vendors.length] : null;
    const reason = randomItem(CN_REASONS);
    notesToInsert.push({
      noteNumber: generateNoteNumber("Credit Note"),
      noteType: "Credit Note",
      referenceType: "Manual Entry",
      invoiceId: null,
      vendorBillId: null,
      partyId: vendor?.id ?? null,
      partyName: vendor?.brandName || "Manual Party",
      partyType: vendor ? "Vendor" : "Other",
      currencyCode: "INR",
      exchangeRateSnapshot: "1",
      noteAmount: String(Math.floor(Math.random() * 500) + 100),
      baseCurrencyAmount: "0",
      reason,
      remarks: `Seeder - manual credit (${reason})`,
      noteDate: new Date().toISOString().split("T")[0],
      status: "Applied",
      createdBy: actor,
    });
  }

  // --- Manual Debit Notes ---
  for (let i = 0; i < NOTES_CONFIG.MANUAL_DEBIT; i++) {
    const vendor = vendors.length ? vendors[(i + 2) % vendors.length] : null;
    const reason = randomItem(DN_REASONS);
    notesToInsert.push({
      noteNumber: generateNoteNumber("Debit Note"),
      noteType: "Debit Note",
      referenceType: "Manual Entry",
      invoiceId: null,
      vendorBillId: null,
      partyId: vendor?.id ?? null,
      partyName: vendor?.brandName || "Manual Party",
      partyType: vendor ? "Vendor" : "Other",
      currencyCode: "INR",
      exchangeRateSnapshot: "1",
      noteAmount: String(Math.floor(Math.random() * 500) + 100),
      baseCurrencyAmount: "0",
      reason,
      remarks: `Seeder - manual debit (${reason})`,
      noteDate: new Date().toISOString().split("T")[0],
      status: "Applied",
      createdBy: actor,
    });
  }

  // --- Credit Notes linked to invoices ---
  for (let i = 0; i < NOTES_CONFIG.INVOICE_CREDIT && invoices.length > 0; i++) {
    const randIdx = Math.floor(Math.random() * invoices.length);
    const invoice = invoices[randIdx];
    const pending = parseFloat(invoice.pendingAmount ?? "0");
    if (pending <= 0) continue;

    const maxAmount = Math.min(pending * 0.8, 1000);
    const amount = Math.max(100, Math.floor(Math.random() * maxAmount) + 1);
    const reason = randomItem(CN_REASONS);
    const noteNumber = generateNoteNumber("Credit Note");
    notesToInsert.push({
      noteNumber,
      noteType: "Credit Note",
      referenceType: "Client Invoice",
      invoiceId: invoice.id,
      vendorBillId: null,
      partyId: invoice.clientId, // client id
      partyName: invoice.clientName || "Client",
      partyType: "Client",
      currencyCode: invoice.currencyCode || "INR",
      exchangeRateSnapshot: invoice.exchangeRateSnapshot || "1",
      noteAmount: String(amount),
      baseCurrencyAmount: "0",
      reason,
      remarks: `Seeder - invoice ${invoice.invoiceNo} (${reason})`,
      noteDate: new Date().toISOString().split("T")[0],
      status: "Applied",
      createdBy: actor,
    });
    // Store for later processing (ledger & invoice update)
    invoiceCreditUpdates.push({
      invoiceId: invoice.id,
      amount,
      clientId: invoice.clientId,
      noteNumber,
    });
  }

  // --- Debit Notes linked to vendor bills ---
  for (let i = 0; i < NOTES_CONFIG.VENDOR_DEBIT && vendorBills.length > 0; i++) {
    const randIdx = Math.floor(Math.random() * vendorBills.length);
    const bill = vendorBills[randIdx];
    const total = parseFloat(bill.vendorInvoiceAmount);
    const paid = parseFloat(bill.paidAmount ?? "0");
    const pending = total - paid;
    if (pending <= 0) continue;

    const maxAmount = Math.min(pending * 0.8, 1000);
    const amount = Math.max(100, Math.floor(Math.random() * maxAmount) + 1);
    const vendor = vendors.find(v => v.id === bill.vendorId) || null;
    const reason = randomItem(DN_REASONS);
    const noteNumber = generateNoteNumber("Debit Note");
    notesToInsert.push({
      noteNumber,
      noteType: "Debit Note",
      referenceType: "Vendor Bill",
      invoiceId: null,
      vendorBillId: bill.id,
      partyId: bill.vendorId,
      partyName: vendor?.brandName || "Vendor",
      partyType: "Vendor",
      currencyCode: bill.currencyCode || "INR",
      exchangeRateSnapshot: bill.exchangeRateSnapshot || "1",
      noteAmount: String(amount),
      baseCurrencyAmount: "0",
      reason,
      remarks: `Seeder - vendor bill ${bill.vendorInvoiceNumber} (${reason})`,
      noteDate: new Date().toISOString().split("T")[0],
      status: "Applied",
      createdBy: actor,
    });
    vendorDebitUpdates.push({
      vendorBillId: bill.id,
      noteNumber,
    });
  }

  // Compute baseCurrencyAmount (rate = 1 for simplicity)
  for (const note of notesToInsert) {
    note.baseCurrencyAmount = (parseFloat(note.noteAmount) * parseFloat(note.exchangeRateSnapshot)).toFixed(2);
  }

  // Transaction
  await db.transaction(async (tx) => {
    // Insert notes
    if (notesToInsert.length) {
      await tx.insert(creditDebitNotes).values(notesToInsert);
    }

    // Process Credit Notes linked to invoices: insert ledger entry and update invoice
    for (const upd of invoiceCreditUpdates) {
      // Insert into client_invoice_ledger
      await tx.insert(clientInvoiceLedger).values({
        clientId: upd.clientId,
        invoiceId: upd.invoiceId,
        entryType: "Credit Note",
        paymentAmount: String(upd.amount),
        paymentDate: new Date().toISOString().split("T")[0],
        transactionReference: upd.noteNumber,
        status: "Completed",
        createdBy: actor,
      });

      // Recompute invoice balances (like recomputeInvoiceBalances)
      // We need to sum payments and credit notes in base currency.
      // Since we only have credit notes (no payments), we can compute new received/pending.
      // But we also need to consider existing payments. Let's fetch existing totals.
      const inv = await tx
        .select({
          totalAmount: invoicesTable.totalAmount,
          receivedAmount: invoicesTable.receivedAmount,
          pendingAmount: invoicesTable.pendingAmount,
        })
        .from(invoicesTable)
        .where(eq(invoicesTable.id, upd.invoiceId))
        .limit(1);
      if (!inv.length) continue;
      const total = parseFloat(inv[0].totalAmount ?? "0");
      const currentReceived = parseFloat(inv[0].receivedAmount ?? "0");
      const newReceived = currentReceived + upd.amount;
      const newPending = Math.max(0, total - newReceived);
      const status = computeAutoStatus(total, newPending, "", ""); // we don't have due date, default to Generated

      await tx
        .update(invoicesTable)
        .set({
          receivedAmount: String(newReceived),
          pendingAmount: String(newPending),
          invoiceStatus: status,
          status: status,
          updatedAt: sql`now()`,
        })
        .where(eq(invoicesTable.id, upd.invoiceId));
    }

    // Process Debit Notes linked to vendor bills: update vendor bill status and notes
    for (const upd of vendorDebitUpdates) {
      const bill = await tx
        .select({ notes: vendorInvoiceLedger.notes })
        .from(vendorInvoiceLedger)
        .where(eq(vendorInvoiceLedger.id, upd.vendorBillId))
        .limit(1);
      if (!bill.length) continue;
      const currentNotes = bill[0].notes || "";
      const newNotes = currentNotes
        ? `${currentNotes} | Debit Note: ${upd.noteNumber}`
        : `Debit Note: ${upd.noteNumber}`;

      await tx
        .update(vendorInvoiceLedger)
        .set({
          status: "Adjusted",
          notes: newNotes,
          updatedAt: sql`now()`,
        })
        .where(eq(vendorInvoiceLedger.id, upd.vendorBillId));
    }
  });

  console.log(`[seedCreditDebitNotes] Created ${notesToInsert.length} notes.`);
}

// Helper to compute invoice status (matching API)
function computeAutoStatus(
  totalAmt: number,
  pendingAmt: number,
  dueDate: string,
  currentStatus: string,
): string {
  if (currentStatus === "Draft" || currentStatus === "Sent" || currentStatus === "Cancelled") return currentStatus;
  const today = new Date().toISOString().slice(0, 10);
  if (pendingAmt <= 0) return "Paid";
  if (pendingAmt < totalAmt && pendingAmt > 0) return "Partially Paid";
  if (dueDate && dueDate < today) return "Overdue";
  return "Generated";
}