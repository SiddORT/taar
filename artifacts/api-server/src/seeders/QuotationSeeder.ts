// seed-quotations.ts
import { db, quotations, quotationDesigns, quotationCustomCharges, quotationFeedbackLogs, clientsTable, hsnTable, unitTypesTable, usersTable } from "@workspace/db";
import { eq, and, isNotNull } from "drizzle-orm";

async function generateQuotationNumber(clientCode: string, sequence: number): Promise<string> {
  const padded = String(sequence).padStart(4, "0");
  return `${clientCode}-ZQUO-${padded}`;
}

function calcGst(clientState: string | null, subtotal: number, shipping: number): { type: string; rate: number } {
  const businessState = "Maharashtra";
  const isInterState = clientState && clientState !== businessState;
  return isInterState
    ? { type: "IGST", rate: 18 }
    : { type: "CGST+SGST", rate: 9 };
}

export async function seedQuotations(): Promise<void> {
  // 1. Creator
  const users = await db.select().from(usersTable).where(eq(usersTable.isActive, true));
  let creatorEmail = "system";
  if (users.length > 0) {
    const admin = users.find((u) => u.email === "admin@erp.com");
    creatorEmail = admin ? admin.email : users[0].email;
  }

  // 2. Clients with customClientCode
  const clients = await db
    .select({
      id: clientsTable.id,
      brandName: clientsTable.brandName,
      customClientCode: clientsTable.customClientCode,
      state: clientsTable.state,
    })
    .from(clientsTable)
    .where(
      and(
        eq(clientsTable.isActive, true),
        eq(clientsTable.isDeleted, false),
        isNotNull(clientsTable.customClientCode)
      )
    );

  if (clients.length === 0) {
    console.warn("[seed-quotations] No active clients with customClientCode found – skipping");
    return;
  }

  // 3. HSN & Units from DB
  const hsnList = await db.select().from(hsnTable);
  const unitList = await db.select().from(unitTypesTable);

  if (hsnList.length === 0 || unitList.length === 0) {
    console.warn("[seed-quotations] Missing HSN or unit data – skipping");
    return;
  }

  // 4. Pools
  const designNamePool = [
    "Bridal Lehenga", "Embroidered Saree", "Men's Sherwani", "Kurti Set",
    "Dupatta", "Silk Scarf", "Designer Blouse", "Anarkali Suit",
    "Indo-Western Gown", "Sequined Jacket", "Draped Pallazzo Set",
    "Crop Top & Skirt", "Bandhgala Jacket", "Dhoti Kurta", "Sharara Set",
  ];

  const chargeNamePool = [
    "Embroidery", "Zari Work", "Dyeing", "Printing", "Tailoring",
    "Fabric Sourcing", "Stone Work", "Thread Work", "Beading",
    "Sequins", "Lace", "Pleating",
  ];

  const statusPool = ["Draft", "Sent", "Client Reviewing"];

  // Realistic feedback texts (used when generating feedback logs)
  const feedbackPool = [
    "Client requested changes to embroidery design – more intricate work needed.",
    "Pricing is too high; please revise quotation with competitive rates.",
    "Approved with minor revisions to the fabric type.",
    "Client wants to add more color variants; update designs accordingly.",
    "Need to reduce quantity or adjust timeline.",
    "Client is comparing with competitor; provide better discount.",
    "Design approved, but require sample before final order.",
    "Client feedback: Good, proceed with order.",
    "Request for additional customizations on the blouse design.",
    "Delay in response; client will revert next week.",
    "Feedback: Change the border design to simpler pattern.",
    "Client wants to see mockup before confirming.",
    "Approved – move to production.",
    "Minor changes requested in the neckline.",
  ];

  const revisionRefs = ["v1.1", "v2", "Rev A", "Revision 1", "v1.2", "R1"];

  // 5. Generate quotations
  let globalSequence = 1;

  await db.transaction(async (tx) => {
    let insertedQuotations = 0;
    let insertedFeedback = 0;

    for (const client of clients) {
      const numQuotes = Math.floor(Math.random() * 2) + 1; // 1–2
      for (let q = 0; q < numQuotes; q++) {
        // --- Select designs and charges (same as before) ---
        const numDesigns = Math.floor(Math.random() * 2) + 1;
        const selectedDesigns: { designName: string; hsnCode: string; remarks: string }[] = [];
        const shuffledDesigns = [...designNamePool].sort(() => Math.random() - 0.5);
        for (let d = 0; d < numDesigns && d < shuffledDesigns.length; d++) {
          const randomHsn = hsnList[Math.floor(Math.random() * hsnList.length)];
          selectedDesigns.push({
            designName: shuffledDesigns[d],
            hsnCode: randomHsn.hsnCode,
            remarks: "Sample fashion design",
          });
        }

        const numCharges = Math.floor(Math.random() * 3) + 2;
        const selectedCharges: {
          chargeName: string;
          hsnCode: string;
          unit: string;
          quantity: number;
          price: number;
          amount: number;
        }[] = [];
        const shuffledCharges = [...chargeNamePool].sort(() => Math.random() - 0.5);
        for (let c = 0; c < numCharges && c < shuffledCharges.length; c++) {
          const randomHsn = hsnList[Math.floor(Math.random() * hsnList.length)];
          const randomUnit = unitList[Math.floor(Math.random() * unitList.length)];
          const qty = Math.floor(Math.random() * 10) + 1;
          const price = Math.round((Math.random() * 1950 + 50) * 100) / 100;
          const amount = Math.round(qty * price * 100) / 100;
          selectedCharges.push({
            chargeName: shuffledCharges[c],
            hsnCode: randomHsn.hsnCode,
            unit: randomUnit.name,
            quantity: qty,
            price: price,
            amount: amount,
          });
        }

        // Totals
        let subtotal = 0;
        selectedCharges.forEach((c) => (subtotal += c.amount));
        subtotal = Math.round(subtotal * 100) / 100;

        const estimatedWeight = Math.round((Math.random() * 50 + 5) * 100) / 100;
        const shippingRatePerKg = Math.round((Math.random() * 200 + 50) * 100) / 100;
        const estimatedShippingCharges = Math.round(estimatedWeight * shippingRatePerKg * 100) / 100;

        const gstInfo = calcGst(client.state, subtotal, estimatedShippingCharges);
        const gstRate = gstInfo.rate;
        const gstAmount = Math.round((subtotal * gstRate / 100) * 100) / 100;
        const total = Math.round((subtotal + gstAmount + estimatedShippingCharges) * 100) / 100;

        const quotationNumber = await generateQuotationNumber(client.customClientCode!, globalSequence++);
        const status = statusPool[Math.floor(Math.random() * statusPool.length)];

        // --- Insert quotation ---
        const [quotation] = await tx
          .insert(quotations)
          .values({
            quotationNumber,
            clientId: client.id,
            clientName: client.brandName,
            clientState: client.state,
            requirementSummary: selectedDesigns.map((d) => d.designName).join(", "),
            estimatedWeight: String(estimatedWeight),
            estimatedShippingCharges: String(estimatedShippingCharges),
            subtotalAmount: String(subtotal),
            gstType: gstInfo.type,
            gstRate: String(gstRate),
            gstAmount: String(gstAmount),
            totalAmount: String(total),
            status,
            revisionNumber: 1,
            parentQuotationId: null,
            internalNotes: "This is Sample Client Quotation Once Confirmed cab be converted to Order",
            clientNotes: "Sample quotation",
            convertedTo: null,
            convertedReferenceId: null,
            convertedAt: null,
            createdBy: creatorEmail,
            coverPage: "classic",
            coverPageImage: null,
            shippingRatePerKg: String(shippingRatePerKg),
            isDeleted: false,
            deletedBy: null,
            deletedAt: null,
          })
          .returning({ id: quotations.id });

        const quotationId = quotation.id;

        // --- Insert designs ---
        for (const design of selectedDesigns) {
          await tx.insert(quotationDesigns).values({
            quotationId,
            designName: design.designName,
            hsnCode: design.hsnCode,
            designImage: null,
            remarks: design.remarks,
            isDeleted: false,
            deletedBy: null,
            deletedAt: null,
          });
        }

        // --- Insert custom charges ---
        for (const charge of selectedCharges) {
          await tx.insert(quotationCustomCharges).values({
            quotationId,
            chargeName: charge.chargeName,
            hsnCode: charge.hsnCode,
            unit: charge.unit,
            quantity: String(charge.quantity),
            price: String(charge.price),
            amount: String(charge.amount),
            isDeleted: false,
            deletedBy: null,
            deletedAt: null,
          });
        }

        // --- Insert feedback logs (with ~60% probability) ---
        if (Math.random() < 0.6) {
          const feedbackText = feedbackPool[Math.floor(Math.random() * feedbackPool.length)];
          // 50% chance of having a revision reference
          let revisionReference: string | null = null;
          if (Math.random() < 0.5) {
            revisionReference = revisionRefs[Math.floor(Math.random() * revisionRefs.length)];
          }
          // Use current date as feedbackDate (could be varied by adding days, but keep simple)
          const feedbackDate = new Date().toISOString().split("T")[0];

          await tx.insert(quotationFeedbackLogs).values({
            quotationId,
            feedbackText,
            feedbackBy: creatorEmail,
            feedbackDate,
            revisionReference,
            isDeleted: false,
            deletedBy: null,
            deletedAt: null,
          });
          insertedFeedback++;
        }

        insertedQuotations++;
      }
    }

    console.log(`[seed-quotations] ${insertedQuotations} quotations inserted with designs and charges.`);
    console.log(`[seed-quotations] ${insertedFeedback} feedback logs inserted.`);
  });
}