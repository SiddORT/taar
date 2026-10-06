// seed-vendor-challans.ts

import {
  db,
  vendorsTable,
  vendorChallansTable,
  vendorChallanItems,
  usersTable,
  hsnTable,
} from "@workspace/db";

import { eq, and } from "drizzle-orm";

// ============================================================
// Types
// ============================================================

type Hsn = {
  id: number;
  hsnCode: string;
  gstPercentage: string;
};

type SeedLineItem = {
  description: string;
  quantity: string;
  unit: string;
  rate: string;
  amount: string;
};

type ChallanData = {
  vendorCode: string;
  challanDate: string;
  challanType: string;
  description: string;
  remarks: string;
  lineItems: SeedLineItem[];
  status: string;
};

// ============================================================
// Helpers
// ============================================================

function generateChallanNumber(index: number): string {
  const finYear = "2026-27";
  const padded = String(index).padStart(4, "0");

  return `VC/${finYear}/${padded}`;
}

function formatNumber(value: string | number, decimals: number): string {
  return Number(value).toFixed(decimals);
}

// ============================================================
// Seeder
// ============================================================

export async function seedVendorChallans(): Promise<void> {
  console.log("\n🚚 Starting Vendor Challan Seeder...");

  // ==========================================================
  // 1. Get creator
  // ==========================================================

  const users = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.isActive, true),
        eq(usersTable.isDeleted, false)
      )
    );

  let creatorEmail = "system";

  if (users.length > 0) {
    const admin = users.find(
      (user) => user.email === "admin@taar.com"
    );

    creatorEmail = admin?.email || users[0].email || "system";
  }

  console.log(`   👤 Creator: ${creatorEmail}`);

  // ==========================================================
  // 2. Get vendors
  // ==========================================================

  const vendors = await db
    .select()
    .from(vendorsTable)
    .where(
      and(
        eq(vendorsTable.isActive, true),
        eq(vendorsTable.isDeleted, false)
      )
    );

  console.log(`   🏭 Found ${vendors.length} active vendors`);

  if (vendors.length === 0) {
    console.warn(
      "⚠️ No active vendors found. Vendor challan seeder skipped."
    );
    return;
  }

  const vendorMap = new Map(
    vendors.map((vendor) => [
      vendor.vendorCode,
      {
        id: vendor.id,
        name: vendor.brandName || vendor.contactName || "",
      },
    ])
  );

  // ==========================================================
  // 3. Get HSN codes
  // ==========================================================

  const hsnCodes: Hsn[] = await db
    .select({
      id: hsnTable.id,
      hsnCode: hsnTable.hsnCode,
      gstPercentage: hsnTable.gstPercentage,
    })
    .from(hsnTable)
    .where(
      and(
        eq(hsnTable.isActive, true),
        eq(hsnTable.isDeleted, false)
      )
    );

  console.log(`   🧾 Found ${hsnCodes.length} active HSN codes`);

  if (hsnCodes.length === 0) {
    console.warn(
      "⚠️ No active HSN codes found. Vendor challan seeder skipped."
    );
    return;
  }

  // ==========================================================
  // 4. Realistic challan data
  // ==========================================================

  const challanData: ChallanData[] = [
    // --------------------------------------------------------
    // 1. Arvind Mills
    // --------------------------------------------------------

    {
      vendorCode: "VEN001",
      challanDate: "2026-08-20",
      challanType: "Material",
      description: "Fabric samples received for quality check",
      remarks: "Sample approval pending",

      lineItems: [
        {
          description: "Cotton Fabric",
          quantity: "100",
          unit: "Meter",
          rate: "120",
          amount: "12000.00",
        },
        {
          description: "Silk Fabric",
          quantity: "50",
          unit: "Meter",
          rate: "250",
          amount: "12500.00",
        },
      ],

      status: "Verified",
    },

    // --------------------------------------------------------
    // 2. Raymond
    // --------------------------------------------------------

    {
      vendorCode: "VEN002",
      challanDate: "2026-08-21",
      challanType: "Material",
      description: "Sewing thread, needles, and buttons",
      remarks: "Restock for tailoring unit",

      lineItems: [
        {
          description: "Sewing Thread (White)",
          quantity: "200",
          unit: "Spools",
          rate: "15",
          amount: "3000.00",
        },
        {
          description: "Sewing Thread (Black)",
          quantity: "150",
          unit: "Spools",
          rate: "15",
          amount: "2250.00",
        },
        {
          description: "Needles (Assorted)",
          quantity: "50",
          unit: "Box",
          rate: "80",
          amount: "4000.00",
        },
        {
          description: "Buttons (Plastic)",
          quantity: "1000",
          unit: "pcs",
          rate: "2",
          amount: "2000.00",
        },
      ],

      status: "Draft",
    },

    // --------------------------------------------------------
    // 3. Bombay Dyeing
    // --------------------------------------------------------

    {
      vendorCode: "VEN004",
      challanDate: "2026-08-22",
      challanType: "Material",
      description: "Textile dyes and bleaching agents",
      remarks: "For upcoming production batch",

      lineItems: [
        {
          description: "Reactive Dye (Red)",
          quantity: "25",
          unit: "Kilogram",
          rate: "450",
          amount: "11250.00",
        },
        {
          description: "Reactive Dye (Blue)",
          quantity: "20",
          unit: "Kilogram",
          rate: "480",
          amount: "9600.00",
        },
        {
          description: "Bleaching Powder",
          quantity: "50",
          unit: "Kilogram",
          rate: "120",
          amount: "6000.00",
        },
      ],

      status: "Draft",
    },

    // --------------------------------------------------------
    // 4. Sutlej Textiles
    // --------------------------------------------------------

    {
      vendorCode: "VEN003",
      challanDate: "2026-08-23",
      challanType: "Material",
      description: "Embroidery thread, beads, and sequins",
      remarks: "For festive collection samples",

      lineItems: [
        {
          description: "Embroidery Thread (Gold)",
          quantity: "30",
          unit: "Spools",
          rate: "85",
          amount: "2550.00",
        },
        {
          description: "Glass Beads (Assorted)",
          quantity: "10",
          unit: "Kg",
          rate: "320",
          amount: "3200.00",
        },
        {
          description: "Sequin Sets",
          quantity: "50",
          unit: "Packs",
          rate: "45",
          amount: "2250.00",
        },
      ],

      status: "Draft",
    },

    // --------------------------------------------------------
    // 5. Welspun India
    // --------------------------------------------------------

    {
      vendorCode: "VEN005",
      challanDate: "2026-08-24",
      challanType: "Outsource",
      description: "Dyeing services for 5000 mtr fabric",
      remarks: "Outsourced to external dyeing unit",

      lineItems: [
        {
          description: "Fabric Dyeing (Cotton)",
          quantity: "3000",
          unit: "Mtr",
          rate: "15",
          amount: "45000.00",
        },
        {
          description: "Fabric Dyeing (Polyester)",
          quantity: "2000",
          unit: "Mtr",
          rate: "12",
          amount: "24000.00",
        },
      ],

      status: "Verified",
    },

    // --------------------------------------------------------
    // 6. Vardhman Textiles
    // --------------------------------------------------------

    {
      vendorCode: "VEN006",
      challanDate: "2026-08-25",
      challanType: "Material",
      description: "Zippers, hooks, and eyelets for garment production",
      remarks: "Required for the new winter line",

      lineItems: [
        {
          description: "Metal Zippers (No. 5)",
          quantity: "500",
          unit: "Pcs",
          rate: "25",
          amount: "12500.00",
        },
        {
          description: "Plastic Hooks",
          quantity: "1000",
          unit: "Pcs",
          rate: "3",
          amount: "3000.00",
        },
        {
          description: "Metal Eyelets",
          quantity: "2000",
          unit: "Pcs",
          rate: "1.5",
          amount: "3000.00",
        },
      ],

      status: "Draft",
    },

    // --------------------------------------------------------
    // 7. Trident Group
    // --------------------------------------------------------

    {
      vendorCode: "VEN007",
      challanDate: "2026-08-26",
      challanType: "Artwork",
      description: "Digital print designs for bed linen",
      remarks: "Artwork files delivered via USB",

      lineItems: [
        {
          description: "Floral Pattern Design",
          quantity: "1",
          unit: "Set",
          rate: "7500",
          amount: "7500.00",
        },
        {
          description: "Geometric Pattern Design",
          quantity: "1",
          unit: "Set",
          rate: "6800",
          amount: "6800.00",
        },
      ],

      status: "Verified",
    },

    // --------------------------------------------------------
    // 8. Nahar Spinning
    // --------------------------------------------------------

    {
      vendorCode: "VEN008",
      challanDate: "2026-08-27",
      challanType: "Material",
      description: "Yarn cones for weaving unit",
      remarks: "Order placed for next month's production",

      lineItems: [
        {
          description: "Cotton Yarn (40s)",
          quantity: "100",
          unit: "Kg",
          rate: "180",
          amount: "18000.00",
        },
        {
          description: "Polyester Yarn (150D)",
          quantity: "80",
          unit: "Kg",
          rate: "210",
          amount: "16800.00",
        },
      ],

      status: "Draft",
    },

    // --------------------------------------------------------
    // 9. Garden Silk Mills
    // --------------------------------------------------------

    {
      vendorCode: "VEN009",
      challanDate: "2026-08-28",
      challanType: "Toile Artisan",
      description: "Toile samples for new silk collection",
      remarks: "To be reviewed by design team",

      lineItems: [
        {
          description: "Silk Toile Sample",
          quantity: "10",
          unit: "Mtr",
          rate: "300",
          amount: "3000.00",
        },
        {
          description: "Satin Toile Sample",
          quantity: "10",
          unit: "Mtr",
          rate: "280",
          amount: "2800.00",
        },
      ],

      status: "Draft",
    },

    // --------------------------------------------------------
    // 10. Indo Count
    // --------------------------------------------------------

    {
      vendorCode: "VEN010",
      challanDate: "2026-08-29",
      challanType: "Packing",
      description: "Polybags, cartons, and stretch film",
      remarks: "Packaging for export orders",

      lineItems: [
        {
          description: "Polybags (Medium)",
          quantity: "500",
          unit: "Pcs",
          rate: "3",
          amount: "1500.00",
        },
        {
          description: "Corrugated Cartons",
          quantity: "200",
          unit: "Pcs",
          rate: "25",
          amount: "5000.00",
        },
        {
          description: "Stretch Film (Roll)",
          quantity: "10",
          unit: "Rolls",
          rate: "120",
          amount: "1200.00",
        },
      ],

      status: "Verified",
    },

    // --------------------------------------------------------
    // 11. Arvind Mills - Shipping
    // --------------------------------------------------------

    {
      vendorCode: "VEN001",
      challanDate: "2026-08-30",
      challanType: "Shipping",
      description: "Freight charges for fabric dispatch",
      remarks: "Lorry transport to warehouse",

      lineItems: [
        {
          description: "Truck Freight (Mumbai-Ahmedabad)",
          quantity: "1",
          unit: "Trip",
          rate: "8500",
          amount: "8500.00",
        },
      ],

      status: "Draft",
    },

    // --------------------------------------------------------
    // 12. Raymond - Custom Artisan
    // --------------------------------------------------------

    {
      vendorCode: "VEN002",
      challanDate: "2026-08-31",
      challanType: "Custom Artisan",
      description: "Custom tailoring supplies for premium suits",
      remarks: "Special order for bespoke clients",

      lineItems: [
        {
          description: "Horsehair Canvas",
          quantity: "20",
          unit: "Mtr",
          rate: "450",
          amount: "9000.00",
        },
        {
          description: "Fusible Interlining",
          quantity: "50",
          unit: "Mtr",
          rate: "120",
          amount: "6000.00",
        },
        {
          description: "Horn Buttons (Assorted)",
          quantity: "200",
          unit: "Pcs",
          rate: "35",
          amount: "7000.00",
        },
      ],

      status: "Verified",
    },

    // --------------------------------------------------------
    // 13. Sutlej - Other Expense
    // --------------------------------------------------------

    {
      vendorCode: "VEN003",
      challanDate: "2026-09-01",
      challanType: "Other Expense",
      description: "Design consultation fee for new collection",
      remarks: "Paid to external design consultant",

      lineItems: [
        {
          description: "Consultation Fee",
          quantity: "1",
          unit: "Session",
          rate: "15000",
          amount: "15000.00",
        },
      ],

      status: "Draft",
    },
  ];

  // ==========================================================
  // 5. Insert challans + line items
  // ==========================================================

  await db.transaction(async (tx) => {
    let insertedChallans = 0;
    let insertedItems = 0;

    for (let i = 0; i < challanData.length; i++) {
      const data = challanData[i];

      // ------------------------------------------------------
      // Vendor
      // ------------------------------------------------------

      const vendorInfo = vendorMap.get(data.vendorCode);

      if (!vendorInfo) {
        console.warn(
          `[vendor-challans] Vendor ${data.vendorCode} not found - skipping`
        );

        continue;
      }

      // ------------------------------------------------------
      // Assign HSN
      //
      // Every line item gets an HSN from hsn_master.
      // We rotate through available HSNs so that the seed
      // contains realistic HSN variation.
      // ------------------------------------------------------

      const items = data.lineItems.map((item, itemIndex) => {
        const hsn = hsnCodes[(i + itemIndex) % hsnCodes.length];

        const quantity = Number(item.quantity) || 0;
        const rate = Number(item.rate) || 0;

        // Calculate amount instead of trusting the seed value.
        const amount = quantity * rate;

        return {
          description: item.description,
          quantity: formatNumber(quantity, 3),
          unit: item.unit,
          rate: formatNumber(rate, 2),
          amount: formatNumber(amount, 2),

          // Snake_case fields for JSON line_items
          hsn_id: hsn.id,
          hsn_code: hsn.hsnCode,
          gst_percentage: formatNumber(
            Number(hsn.gstPercentage) || 0,
            2
          ),
        };
      });

      // ------------------------------------------------------
      // Calculate challan totals
      // ------------------------------------------------------

      let totalQty = 0;
      let totalAmount = 0;

      for (const item of items) {
        totalQty += Number(item.quantity);
        totalAmount += Number(item.amount);
      }

      // ------------------------------------------------------
      // Challan number
      // ------------------------------------------------------

      const challanNumber = generateChallanNumber(i + 1);

      // ------------------------------------------------------
      // Insert parent challan
      // ------------------------------------------------------

      const insertValues = {
        challanNumber,
        challanDate: data.challanDate,

        vendorId: vendorInfo.id,
        vendorName: vendorInfo.name,

        challanType: data.challanType,

        referenceOrderId: null,

        description: data.description,

        quantity: formatNumber(totalQty, 3),

        unit: null,
        rate: null,

        amount: formatNumber(totalAmount, 2),

        attachment: null,
        attachments: [],

        // IMPORTANT:
        // Keep the JSON keys in snake_case because the frontend
        // expects hsn_id / hsn_code / gst_percentage.
        lineItems: items,

        status: data.status,

        linkedPoId: null,
        linkedPoNumber: null,

        linkedPrId: null,
        linkedPrNumber: null,

        remarks: data.remarks,

        createdBy: creatorEmail,
        createdAt: new Date(),
        updatedAt: new Date(),

        isDeleted: false,
        deletedBy: null,
        deletedAt: null,
      };

      const [result] = await tx
        .insert(vendorChallansTable)
        .values(insertValues)
        .onConflictDoNothing()
        .returning({
          id: vendorChallansTable.id,
        });

      // If challan already exists, don't create duplicate items.
      if (!result) {
        console.log(
          `[vendor-challans] ${challanNumber} already exists - skipping`
        );

        continue;
      }

      insertedChallans++;

      // ------------------------------------------------------
      // Insert each line item into vendor_challan_items
      // ------------------------------------------------------

      for (const item of items) {
        await tx.insert(vendorChallanItems).values({
          vendorChallanId: result.id,

          description: item.description,

          quantity: item.quantity,
          unit: item.unit,

          rate: item.rate,
          amount: item.amount,

          hsnId: item.hsn_id,
          hsnCode: item.hsn_code,

          gstPercentage: item.gst_percentage,

          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
        });

        insertedItems++;
      }

      console.log(
        `[vendor-challans] Created ${challanNumber} - ` +
        `${items.length} line item(s) - ` +
        `Total: ₹${formatNumber(totalAmount, 2)}`
      );
    }

    console.log(
      `\n[master-seed] Vendor Challans: ${insertedChallans} inserted`
    );

    console.log(
      `[master-seed] Vendor Challan Items: ${insertedItems} inserted`
    );
  });

  console.log("\n✅ Vendor Challan Seeder completed!");
}
