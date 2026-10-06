import { db, invoicesTable, invoiceLineItemsTable, clientsTable, deliveryAddresses, bankAccounts, usersTable, } from "@workspace/db";
import { eq, and, like, sql } from "drizzle-orm";

const round2 = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export async function seedInvoices(): Promise<void> {
  // 1. Creator
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.isActive, true));

  let creatorEmail = "system";
  if (users.length > 0) {
    const admin = users.find((u) => u.email === "admin@erp.com");
    creatorEmail = admin ? admin.email : users[0].email;
  }

  // 2. Bank accounts
  const bankAccountsList = await db
    .select()
    .from(bankAccounts)
    .where(
      and(eq(bankAccounts.isDeleted, false), eq(bankAccounts.isDefault, true))
    );

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

  const defaultBank = fallbackBank || {
    bankName: "ICICI Bank",
    accountNo: "123456789012",
    ifscCode: "ICIC0000123",
    branch: "Mumbai",
    accountName: "Zari ERP",
    bankUpi: "",
  };

  // 3. Active clients
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
    .where(
      and(eq(clientsTable.isActive, true), eq(clientsTable.isDeleted, false))
    );

  if (clients.length === 0) {
    console.warn("[seed-invoices] No active clients found – skipping");
    return;
  }

  let insertedCount = 0;
  let lineItemCount = 0;

  await db.transaction(async (tx) => {
    for (const client of clients) {
      const addresses = await tx
        .select()
        .from(deliveryAddresses)
        .where(
          and(
            eq(deliveryAddresses.clientId, client.id),
            eq(deliveryAddresses.isDeleted, false)
          )
        );

      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

      const clientAddressParts = [
        client.address1,
        client.address2,
        client.city,
        client.state,
        client.pincode,
        client.country,
      ].filter(Boolean);
      const clientAddress = clientAddressParts.join(", ") || "N/A";

      const shippingAddressParts = defaultAddr
        ? [
            defaultAddr.addressLine1,
            defaultAddr.addressLine2,
            defaultAddr.city,
            defaultAddr.state,
            defaultAddr.pincode,
            defaultAddr.country,
          ].filter(Boolean)
        : [];
      const shippingAddress =
        shippingAddressParts.join(", ") || clientAddress;

      const numInvoices = Math.floor(Math.random() * 2) + 1;

      for (let i = 0; i < numInvoices; i++) {
        // --- Unique invoice number ---
        const year = new Date().getFullYear();
        const prefix = `INV-${year}-`;
        const result = await tx
          .select({
            maxNum: sql<number>`COALESCE(MAX(CAST(SUBSTRING(${invoicesTable.invoiceNo}, LENGTH(${prefix})+1) AS INTEGER)), 0)`,
          })
          .from(invoicesTable)
          .where(like(invoicesTable.invoiceNo, `${prefix}%`));

        let nextNum = (result[0]?.maxNum ?? 0) + 1;
        let invoiceNo = `${prefix}${String(nextNum).padStart(4, "0")}`;
        for (let attempt = 0; attempt < 100; attempt++) {
          const exists = await tx
            .select({ id: invoicesTable.id })
            .from(invoicesTable)
            .where(eq(invoicesTable.invoiceNo, invoiceNo))
            .limit(1);
          if (exists.length === 0) break;
          nextNum++;
          invoiceNo = `${prefix}${String(nextNum).padStart(4, "0")}`;
        }

        const referenceType = "Manual";
        const referenceId = "";

        // GST % used on every product line — header will use the same
        const LINE_GST_PCT = "5";

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

        type SeedItem = {
          id: string;
          description: string;
          hsnCode: string;
          showHsn: boolean;
          category: string;
          quantity: number;
          unitPrice: number;
          total: number;
          hsnGstPct: string;
          unit: string;
        };

        const items: SeedItem[] = [];

        for (let j = 0; j < numItems && j < shuffled.length; j++) {
          const template = shuffled[j];
          const qty = Math.floor(Math.random() * 20) + 1;
          const unitPrice = round2(
            template.price * (0.8 + Math.random() * 0.4)
          );
          const total = round2(qty * unitPrice);
          items.push({
            id: `item-${Date.now()}-${j}`,
            description: template.description,
            hsnCode: template.hsnCode,
            showHsn: true,
            category: "Custom",
            quantity: qty,
            unitPrice,
            total,
            hsnGstPct: LINE_GST_PCT,
            unit: "",
          });
        }

        // Shipping as its own line so payment waterfall can allocate it
        const shippingAmount = round2(Math.random() * 500 + 100);
        items.push({
          id: `ship-${Date.now()}`,
          description: "Shipping / Freight",
          hsnCode: "",
          showHsn: false,
          category: "Shipping",
          quantity: 1,
          unitPrice: shippingAmount,
          total: shippingAmount,
          hsnGstPct: "0",
          unit: "",
        });

        // --- Amounts from lines only (matches payment API) ---
        let subtotal = 0;
        let itemGstTotal = 0;

        for (const item of items) {
          subtotal = round2(subtotal + item.total);
          const pct = parseFloat(item.hsnGstPct || "0") || 0;
          if (pct > 0) {
            itemGstTotal = round2(itemGstTotal + (item.total * pct) / 100);
          }
        }

        const discount = 0;
        const taxable = round2(subtotal - discount);
        const cgstVal = round2(itemGstTotal / 2);
        const sgstVal = round2(itemGstTotal / 2);

        // No separate shipping on header — already a line item
        const headerShipping = 0;
        const totalAmount = round2(taxable + itemGstTotal + headerShipping);

        // Display rates (half of blended line GST; for 5% → 2.5 each)
        const halfRate = itemGstTotal > 0 && taxable > 0
          ? round2((itemGstTotal / taxable) * 100 / 2)
          : 0;
        const cgstRate = halfRate.toFixed(2);
        const sgstRate = halfRate.toFixed(2);

        // --- Dates ---
        const invoiceDate = new Date();
        invoiceDate.setDate(
          invoiceDate.getDate() - Math.floor(Math.random() * 30)
        );
        const invoiceDateStr = invoiceDate.toISOString().split("T")[0];

        const dueDate = new Date(invoiceDate);
        dueDate.setDate(
          dueDate.getDate() + 15 + Math.floor(Math.random() * 30)
        );
        const dueDateStr = dueDate.toISOString().split("T")[0];

        const status = "Draft";
        const receivedAmount = 0;
        const pendingAmount = totalAmount;

        const bank = defaultBank;

        const [insertedInvoice] = await tx
          .insert(invoicesTable)
          .values({
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
            subtotalAmount: String(subtotal.toFixed(2)),
            shippingAmount: String(headerShipping.toFixed(2)),
            adjustmentAmount: "0.00",
            totalAmount: String(totalAmount.toFixed(2)),
            invoiceCurrencyAmount: String(totalAmount.toFixed(2)),
            baseCurrencyAmount: String(totalAmount.toFixed(2)),
            receivedAmount: String(receivedAmount.toFixed(2)),
            pendingAmount: String(pendingAmount.toFixed(2)),
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
          })
          .returning({ id: invoicesTable.id });

        if (!insertedInvoice) {
          console.error(
            `[seed-invoices] ❌ Failed to insert invoice ${invoiceNo}`
          );
          continue;
        }

        insertedCount++;

        const lineItemValues = items.map((item, idx) => ({
          invoiceId: insertedInvoice.id,
          lineNo: idx + 1,
          description: item.description,
          category: item.category,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice.toFixed(2)),
          total: String(item.total.toFixed(2)),
          hsnCode: item.hsnCode,
          hsnGstPct: item.hsnGstPct,
          showHsn: item.showHsn,
          unit: item.unit,
          isDeleted: false,
          isLocked: false,
        }));

        await tx.insert(invoiceLineItemsTable).values(lineItemValues);
        lineItemCount += lineItemValues.length;
      }
    }

    console.log(
      `[seed-invoices] ✅ ${insertedCount} Draft invoices and ${lineItemCount} line items inserted (GST aligned, shipping as line item).`
    );
  });
}