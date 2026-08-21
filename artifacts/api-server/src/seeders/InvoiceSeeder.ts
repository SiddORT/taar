// seed-invoices.ts
import { db, invoicesTable, clientsTable, deliveryAddresses, bankAccounts, usersTable } from "@workspace/db";
import { eq, and, like, sql } from "drizzle-orm";

export async function seedInvoices(): Promise<void> {
  // 1. Get creator
  const users = await db.select().from(usersTable).where(eq(usersTable.isActive, true));
  let creatorEmail = "system";
  if (users.length > 0) {
    const admin = users.find((u) => u.email === "admin@erp.com");
    creatorEmail = admin ? admin.email : users[0].email;
  }

  // 2. Fetch active bank accounts (system‑wide)
  const bankAccountsList = await db
    .select()
    .from(bankAccounts)
    .where(and(eq(bankAccounts.isDeleted, false), eq(bankAccounts.isDefault, true))); // prefer default

  // If no default, get any active account
  let fallbackBank = null;
  if (bankAccountsList.length === 0) {
    const anyBank = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.isDeleted, false))
      .limit(1);
    if (anyBank.length > 0) fallbackBank = anyBank[0];
  } else {
    fallbackBank = bankAccountsList[0];
  }

  // Hardcoded fallback if no bank accounts exist
  const defaultBank = fallbackBank || {
    bankName: "ICICI Bank",
    accountNo: "123456789012",
    ifscCode: "ICIC0000123",
    branch: "Mumbai",
    accountName: "Zari ERP",
    bankUpi: "",
  };

  // 3. Get active clients
  const clients = await db
    .select({
      id: clientsTable.id,
      brandName: clientsTable.brandName,
      country: clientsTable.country,
      state: clientsTable.state,
      gstNo: clientsTable.gstNo,
      email: clientsTable.email,
      contactNo: clientsTable.contactNo,
      address1: clientsTable.address1,
      address2: clientsTable.address2,
      city: clientsTable.city,
      pincode: clientsTable.pincode,
    })
    .from(clientsTable)
    .where(and(eq(clientsTable.isActive, true), eq(clientsTable.isDeleted, false)));

  if (clients.length === 0) {
    console.warn("[seed-invoices] No active clients found – skipping");
    return;
  }

  let insertedCount = 0;

  await db.transaction(async (tx) => {
    for (const client of clients) {
      // Delivery addresses for shipping
      const addresses = await tx
        .select()
        .from(deliveryAddresses)
        .where(and(eq(deliveryAddresses.clientId, client.id), eq(deliveryAddresses.isDeleted, false)));

      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

      // Build client address string
      const clientAddressParts = [client.address1, client.address2, client.city, client.state, client.pincode, client.country]
        .filter(Boolean);
      const clientAddress = clientAddressParts.join(", ") || "N/A";

      const shippingAddressParts = defaultAddr
        ? [defaultAddr.addressLine1, defaultAddr.addressLine2, defaultAddr.city, defaultAddr.state, defaultAddr.pincode, defaultAddr.country]
            .filter(Boolean)
        : [];
      const shippingAddress = shippingAddressParts.join(", ") || clientAddress;

      // Generate 1–2 invoices per client
      const numInvoices = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numInvoices; i++) {
        // --- Generate unique invoice number ---
        const year = new Date().getFullYear();
        const prefix = `INV-${year}-`;
        const result = await tx
          .select({
            maxNum: sql<number>`COALESCE(MAX(CAST(SUBSTRING(${invoicesTable.invoiceNo}, LENGTH(${prefix})+1) AS INTEGER)), 0)`,
          })
          .from(invoicesTable)
          .where(like(invoicesTable.invoiceNo, `${prefix}%`));

        let nextNum = (result[0]?.maxNum ?? 0) + 1;
        let invoiceNo = `${prefix}${String(nextNum).padStart(4, '0')}`;
        for (let attempt = 0; attempt < 100; attempt++) {
          const exists = await tx
            .select({ id: invoicesTable.id })
            .from(invoicesTable)
            .where(eq(invoicesTable.invoiceNo, invoiceNo))
            .limit(1);
          if (exists.length === 0) break;
          nextNum++;
          invoiceNo = `${prefix}${String(nextNum).padStart(4, '0')}`;
        }

        // --- Reference type: Manual ---
        const referenceType = "Manual";
        const referenceId = "";

        // --- Generate invoice items (2–4) ---
        const itemPool = [
          { description: "Embroidered Silk Saree", hsnCode: "520811", price: 4500 },
          { description: "Bridal Lehenga Set", hsnCode: "620342", price: 15000 },
          { description: "Men's Bandhgala Jacket", hsnCode: "620342", price: 8000 },
          { description: "Kurti with Dupatta", hsnCode: "551311", price: 2500 },
          { description: "Zari Work Dupatta", hsnCode: "540710", price: 1800 },
          { description: "Cotton Saree", hsnCode: "520811", price: 1200 },
          { description: "Designer Blouse", hsnCode: "620342", price: 3000 },
          { description: "Sequined Jacket", hsnCode: "551311", price: 6000 },
          { description: "Dhoti Kurta Set", hsnCode: "620342", price: 5000 },
          { description: "Silk Scarf", hsnCode: "540710", price: 800 },
        ];
        const numItems = 2 + Math.floor(Math.random() * 3);
        const shuffled = [...itemPool].sort(() => Math.random() - 0.5);
        const items = [];
        for (let j = 0; j < numItems && j < shuffled.length; j++) {
          const template = shuffled[j];
          const qty = Math.floor(Math.random() * 20) + 1;
          const unitPrice = Math.round(template.price * (0.8 + Math.random() * 0.4) * 100) / 100;
          const total = Math.round(qty * unitPrice * 100) / 100;
          items.push({
            id: `item-${Date.now()}-${j}`,
            description: template.description,
            hsnCode: template.hsnCode,
            showHsn: true,
            category: "Custom",
            quantity: qty,
            unitPrice,
            total,
            hsnGstPct: "5",
          });
        }

        // --- Compute amounts ---
        let subtotal = 0;
        items.forEach((item) => (subtotal += item.total));
        subtotal = Math.round(subtotal * 100) / 100;

        const shippingAmount = Math.round((Math.random() * 500 + 100) * 100) / 100;

        const cgstRate = "9.00";
        const sgstRate = "9.00";
        const cgstVal = Math.round((subtotal * 9 / 100) * 100) / 100;
        const sgstVal = Math.round((subtotal * 9 / 100) * 100) / 100;
        const totalAmount = Math.round((subtotal + shippingAmount + cgstVal + sgstVal) * 100) / 100;

        // --- Dates ---
        const invoiceDate = new Date();
        invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 30));
        const invoiceDateStr = invoiceDate.toISOString().split("T")[0];
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 15 + Math.floor(Math.random() * 30));
        const dueDateStr = dueDate.toISOString().split("T")[0];

        // --- Status: Draft, received = 0 ---
        const status = "Draft";
        const receivedAmount = 0;
        const pendingAmount = totalAmount;

        // --- Pick a bank account (random or default) ---
        // For variety, you can randomly pick any active bank account
        // Here we use the pre‑fetched default, but you can randomize if multiple exist
        const bank = defaultBank;

        // --- Insert invoice ---
        await tx.insert(invoicesTable).values({
          invoiceNo,
          invoiceDirection: "Client",
          invoiceType: "Final Invoice",
          invoiceStatus: status,
          status: status,
          clientId: client.id,
          vendorId: null,
          referenceType,
          referenceId,
          currencyCode: "INR",
          exchangeRateSnapshot: "1.000000",
          subtotalAmount: String(subtotal),
          shippingAmount: String(shippingAmount),
          adjustmentAmount: "0.00",
          totalAmount: String(totalAmount),
          invoiceCurrencyAmount: String(totalAmount),
          baseCurrencyAmount: String(totalAmount),
          receivedAmount: String(receivedAmount),
          pendingAmount: String(pendingAmount),
          invoiceDate: invoiceDateStr,
          dueDate: dueDateStr,
          clientName: client.brandName || "",
          clientAddress,
          clientGstin: client.gstNo || "",
          clientEmail: client.email || "",
          clientPhone: client.contactNo || "",
          clientState: client.state || "",
          items: items,
          discountType: "flat",
          discountValue: "0.00",
          cgstRate,
          sgstRate,
          bankName: bank.bankName,
          bankAccount: bank.accountNo,
          bankIfsc: bank.ifscCode,
          bankBranch: bank.branch,
          bankUpi: bank.bankUpi || "",
          shippingAddress,
          carrier: "",
          trackingNumber: "",
          dispatchDate: "",
          expectedDelivery: "",
          remarks: "Auto-generated invoice (Draft)",
          notes: "",
          paymentTerms: "Net 30",
          swatchOrderId: null,
          styleOrderId: null,
          createdBy: creatorEmail,
          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
        });

        insertedCount++;
      }
    }

    console.log(`[seed-invoices] ✅ ${insertedCount} Draft invoices inserted with bank details from DB.`);
  });
}