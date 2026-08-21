// seed-packing-lists.ts
import { db, clientsTable, deliveryAddresses, packingLists, packingPackages, packingPackageItems, swatchOrdersTable, styleOrdersTable, orderShippingDetails, usersTable } from "@workspace/db";
import { eq, and, like, sql } from "drizzle-orm";

export async function seedPackingLists(): Promise<void> {
  // 1. Get creator
  const users = await db.select().from(usersTable).where(eq(usersTable.isActive, true));
  let creatorEmail = "system";
  if (users.length > 0) {
    const admin = users.find((u) => u.email === "admin@erp.com");
    creatorEmail = admin ? admin.email : users[0].email;
  }

  // 2. Fetch active clients
  const clients = await db
    .select({
      id: clientsTable.id,
      brandName: clientsTable.brandName,
      country: clientsTable.country,
    })
    .from(clientsTable)
    .where(and(eq(clientsTable.isActive, true), eq(clientsTable.isDeleted, false)));

  if (clients.length === 0) {
    console.warn("[seed-packing-lists] No active clients found – skipping");
    return;
  }

  let insertedPL = 0;
  let insertedPackages = 0;
  let insertedItems = 0;

  await db.transaction(async (tx) => {
    for (const client of clients) {
      // 3a. Get delivery addresses
      const addresses = await tx
        .select()
        .from(deliveryAddresses)
        .where(and(eq(deliveryAddresses.clientId, client.id), eq(deliveryAddresses.isDeleted, false)));

      if (addresses.length === 0) continue;

      // 3b. Completed swatch orders
      const swatchOrders = await tx
        .select({ id: swatchOrdersTable.id, orderCode: swatchOrdersTable.orderCode })
        .from(swatchOrdersTable)
        .where(and(
          eq(swatchOrdersTable.clientId, String(client.id)),
          eq(swatchOrdersTable.orderStatus, "Completed"),
          eq(swatchOrdersTable.isDeleted, false)
        ));

      // 3c. Completed style orders
      const styleOrders = await tx
        .select({ id: styleOrdersTable.id, orderCode: styleOrdersTable.orderCode })
        .from(styleOrdersTable)
        .where(and(
          eq(styleOrdersTable.clientId, String(client.id)),
          eq(styleOrdersTable.orderStatus, "Completed"),
          eq(styleOrdersTable.isDeleted, false)
        ));

      const completedOrders = [
        ...swatchOrders.map((o) => ({ ...o, orderType: "Swatch" })),
        ...styleOrders.map((o) => ({ ...o, orderType: "Style" })),
      ];

      if (completedOrders.length === 0) continue;

      // 3d. Pick delivery address
      const defaultAddr = addresses.find((a) => a.isDefault);
      const deliveryAddress = defaultAddr || addresses[0];

      // 3e. Find shipment for any of these orders
      let shipmentId: number | null = null;
      for (const order of completedOrders) {
        const shipment = await tx
          .select({ id: orderShippingDetails.id })
          .from(orderShippingDetails)
          .where(and(
            eq(orderShippingDetails.referenceType, order.orderType),
            eq(orderShippingDetails.referenceId, order.id),
            eq(orderShippingDetails.isDeleted, false)
          ))
          .limit(1);
        if (shipment.length > 0) {
          shipmentId = shipment[0].id;
          break;
        }
      }

      // 3f. Generate unique PL number (inline, using tx)
      const year = new Date().getFullYear();
      const prefix = `PL-${year}-`;
      const result = await tx
        .select({
          maxNum: sql<number>`COALESCE(MAX(CAST(SUBSTRING(${packingLists.plNumber}, LENGTH(${prefix})+1) AS INTEGER)), 0)`,
        })
        .from(packingLists)
        .where(like(packingLists.plNumber, `${prefix}%`));

      let nextNum = (result[0]?.maxNum ?? 0) + 1;
      let plNumber = `${prefix}${String(nextNum).padStart(4, '0')}`;
      // Safety loop (unlikely needed)
      for (let attempt = 0; attempt < 100; attempt++) {
        const exists = await tx
          .select({ id: packingLists.id })
          .from(packingLists)
          .where(eq(packingLists.plNumber, plNumber))
          .limit(1);
        if (exists.length === 0) break;
        nextNum++;
        plNumber = `${prefix}${String(nextNum).padStart(4, '0')}`;
      }

      // 3g. Insert packing list
      const [packingList] = await tx
        .insert(packingLists)
        .values({
          plNumber,
          clientId: client.id,
          deliveryAddressId: deliveryAddress.id,
          shipmentId,
          destinationCountry: client.country || deliveryAddress.country || "India",
          status: "Draft",
          remarks: "Auto-generated packing list from seed",
          createdBy: creatorEmail,
          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
          packageCount: 1,
          netWeight: "0",
          grossWeight: "0",
        })
        .returning({ id: packingLists.id });

      const plId = packingList.id;

      // 3h. Create one package
      const packageNumber = 1;
      const length = Math.round((Math.random() * 30 + 20) * 100) / 100;
      const width = Math.round((Math.random() * 30 + 20) * 100) / 100;
      const height = Math.round((Math.random() * 20 + 10) * 100) / 100;
      const netWeight = Math.round((Math.random() * 3 + 1) * 1000) / 1000;
      const grossWeight = Math.round((netWeight + Math.random() * 0.5 + 0.2) * 1000) / 1000;

      const [pkg] = await tx
        .insert(packingPackages)
        .values({
          packingListId: plId,
          packageNumber,
          length: String(length),
          width: String(width),
          height: String(height),
          netWeight: String(netWeight),
          grossWeight: String(grossWeight),
          shipmentId,
          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
        })
        .returning({ id: packingPackages.id });

      const packageId = pkg.id;

      // 3i. Insert package items
      for (const order of completedOrders) {
        await tx.insert(packingPackageItems).values({
          packageId,
          orderType: order.orderType,
          orderId: order.id,
          orderCode: order.orderCode,
          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
        });
        insertedItems++;
      }

      // 3j. Update packing list with actual weights
      await tx
        .update(packingLists)
        .set({
          packageCount: 1,
          netWeight: String(netWeight),
          grossWeight: String(grossWeight),
        })
        .where(eq(packingLists.id, plId));

      insertedPL++;
      insertedPackages++;
    }

    console.log(`[seed-packing-lists] ✅ ${insertedPL} packing lists, ${insertedPackages} packages, ${insertedItems} package items inserted.`);
  });
}