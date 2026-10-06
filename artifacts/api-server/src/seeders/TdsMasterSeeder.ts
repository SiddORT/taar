import { db, tdsMasterTable, usersTable, eq, and } from "@workspace/db";


async function getSystemUserId(): Promise<number> {
  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .limit(1);

  if (existing.length === 0) {
    throw new Error(
      "[master-seed] Cannot seed TDS: no user found in usersTable. " +
        "Please create at least one user (or change the fallback ID) before seeding.",
    );
  }

  return existing[0].id;
}

/**
 * TDS Master seeder
 */
export async function seedTdsMaster(): Promise<void> {
  const systemUserId = await getSystemUserId();

  const tdsData = [
    // ---------------- Section 194C – Payment to Contractors / Sub-contractors ----------------
  {
    serviceName: "Contract Manufacturing (Outsource Jobs)",
    paymentNature: "Contract Payment – Individual / HUF",
    sectionCode: "194C",
    ratePercent: "1.00",
    thresholdAmount: "100000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Applies to outsource job work / contract manufacturing to individuals/HUF.",
    status: true,
  },
  {
    serviceName: "Contract Manufacturing (Outsource Jobs)",
    paymentNature: "Contract Payment – Company / Firm",
    sectionCode: "194C",
    ratePercent: "2.00",
    thresholdAmount: "100000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Applies to outsource job work / contract manufacturing to companies/firms.",
    status: true,
  },
  {
    serviceName: "Artisan Job Work / Handwork",
    paymentNature: "Contract Payment – Artisan / Karigar",
    sectionCode: "194C",
    ratePercent: "1.00",
    thresholdAmount: "100000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Artisan handwork, embroidery, embellishment job work.",
    status: true,
  },

  // ---------------- Section 194J – Professional / Technical Services ----------------
  {
    serviceName: "Design & Sampling Services (Styles / Swatches)",
    paymentNature: "Professional Fees – Design / Sampling",
    sectionCode: "194J",
    ratePercent: "10.00",
    thresholdAmount: "30000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Designer / stylist / sampling consultant fees for styles and swatches.",
    status: true,
  },
  {
    serviceName: "Technical Consultancy (Fabric / Garment)",
    paymentNature: "Technical Services",
    sectionCode: "194J",
    ratePercent: "2.00",
    thresholdAmount: "30000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Technical consultancy, quality inspection, testing services (reduced rate for technical services).",
    status: true,
  },
  {
    serviceName: "Professional Fees – Legal / CA / CS",
    paymentNature: "Professional Fees",
    sectionCode: "194J",
    ratePercent: "10.00",
    thresholdAmount: "30000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Legal, accounting, auditing, company secretary fees.",
    status: true,
  },

  // ---------------- Section 194H – Commission / Brokerage ----------------
  {
    serviceName: "Resell Commission / Brokerage",
    paymentNature: "Commission / Brokerage",
    sectionCode: "194H",
    ratePercent: "5.00",
    thresholdAmount: "20000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Commission paid to resellers, agents, brokers on resale orders.",
    status: true,
  },
  {
    serviceName: "Artisan Agent Commission",
    paymentNature: "Commission / Brokerage",
    sectionCode: "194H",
    ratePercent: "5.00",
    thresholdAmount: "20000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Commission paid to artisan agents / sourcing agents.",
    status: true,
  },

  // ---------------- Section 194Q – Purchase of Goods (Resell) ----------------
  {
    serviceName: "Purchase of Goods (Resell)",
    paymentNature: "Purchase of Goods",
    sectionCode: "194Q",
    ratePercent: "0.10",
    thresholdAmount: "5000000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "TDS on purchase of goods for resale where buyer turnover > 10 Cr and seller turnover > 50 Cr.",
    status: true,
  },

  // ---------------- Section 194M – Commission / Contract / Professional (Individual/HUF) ----------------
  {
    serviceName: "Contract / Commission / Professional – Individual / HUF",
    paymentNature: "Contract / Commission / Professional",
    sectionCode: "194M",
    ratePercent: "2.00",
    thresholdAmount: "5000000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "For payments to individuals/HUF not covered under 194C/194H/194J when aggregate exceeds ₹50 L.",
    status: true,
  },

  // ---------------- Section 194I – Rent ----------------
  {
    serviceName: "Rent – Plant & Machinery",
    paymentNature: "Rent – P&M",
    sectionCode: "194I",
    ratePercent: "2.00",
    thresholdAmount: "240000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Rent for plant, machinery, equipment (e.g., sewing machines on rent).",
    status: true,
  },
  {
    serviceName: "Rent – Land / Building / Factory",
    paymentNature: "Rent – Land / Building",
    sectionCode: "194I",
    ratePercent: "10.00",
    thresholdAmount: "240000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Rent for factory, office, warehouse, land.",
    status: true,
  },

  // ---------------- Section 194A – Interest ----------------
  {
    serviceName: "Interest on Loans / Advances",
    paymentNature: "Interest – Other than Securities",
    sectionCode: "194A",
    ratePercent: "10.00",
    thresholdAmount: "50000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "Interest paid on unsecured loans, advances, vendor financing.",
    status: true,
  },

  // ---------------- Section 194N – Cash Withdrawal ----------------
  {
    serviceName: "Cash Withdrawal above Threshold",
    paymentNature: "Cash Withdrawal",
    sectionCode: "194N",
    ratePercent: "2.00",
    thresholdAmount: "10000000.00",
    effectiveFrom: "2024-04-01",
    effectiveTo: null,
    remarks: "TDS on cash withdrawal beyond ₹1 Cr (2% up to 3 Cr, 5% above).",
    status: true,
  },
  ];

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  await db.transaction(async (tx) => {
    for (const item of tdsData) {
      // Match on (sectionCode, serviceName, effectiveFrom) among non-deleted rows.
      const existing = await tx
        .select({ id: tdsMasterTable.id })
        .from(tdsMasterTable)
        .where(
          and(
            eq(tdsMasterTable.sectionCode, item.sectionCode),
            eq(tdsMasterTable.serviceName, item.serviceName),
            eq(tdsMasterTable.effectiveFrom, item.effectiveFrom),
            eq(tdsMasterTable.isDeleted, false),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await tx
          .update(tdsMasterTable)
          .set({
            paymentNature: item.paymentNature,
            ratePercent: item.ratePercent,
            thresholdAmount: item.thresholdAmount,
            effectiveTo: item.effectiveTo,
            remarks: item.remarks,
            status: item.status,
            updatedBy: systemUserId,
            updatedAt: new Date(),
          })
          .where(eq(tdsMasterTable.id, existing[0].id));

        updated++;
      } else {
        await tx.insert(tdsMasterTable).values({
          serviceName: item.serviceName,
          paymentNature: item.paymentNature,
          sectionCode: item.sectionCode,
          ratePercent: item.ratePercent,
          thresholdAmount: item.thresholdAmount,
          effectiveFrom: item.effectiveFrom,
          effectiveTo: item.effectiveTo,
          remarks: item.remarks,
          status: item.status,
          createdBy: systemUserId,
        });

        inserted++;
      }
    }
  });

  console.log(
    `[master-seed] TDS Master: ${inserted} inserted, ${updated} updated, ${skipped} skipped`,
  );
}