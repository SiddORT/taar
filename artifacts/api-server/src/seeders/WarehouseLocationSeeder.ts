import { db, warehouseLocations, eq, and } from "@workspace/db";

export async function seedWarehouseLocations(): Promise<void> {
  const warehouseData = [
    {
      name: "Unalocated",
      code: "UNALO01",
      addressLine1: "Unalocated",
      addressLine2: "Unalocated",
      city: "",
      state: "",
      pincode: "",
      country: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      isActive: true,
      notes: "Unalocated : This is used for stocks whose location is not located yet. Do Not Delete this",
      createdBy: "system",
    },
    {
      name: "Warehouse A",
      code: "WH001",
      addressLine1: "123 Industrial Area",
      addressLine2: "Andheri East",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400069",
      country: "India",
      contactName: "Rajesh Kumar",
      contactPhone: "9876543201",
      contactEmail: "warehouse.a@example.com",
      isActive: true,
      notes: "Main raw material warehouse",
      createdBy: "system",
    },
    {
      name: "Warehouse B",
      code: "WH002",
      addressLine1: "45 Textile Market",
      addressLine2: "Peenya Industrial Area",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560058",
      country: "India",
      contactName: "Suresh Kumar",
      contactPhone: "9876543202",
      contactEmail: "warehouse.b@example.com",
      isActive: true,
      notes: "Fabric and finished goods warehouse",
      createdBy: "system",
    },
    {
      name: "Warehouse C",
      code: "WH003",
      addressLine1: "78 Industrial Estate",
      addressLine2: "Okhla Phase 2",
      city: "Delhi",
      state: "Delhi",
      pincode: "110020",
      country: "India",
      contactName: "Amit Sharma",
      contactPhone: "9876543203",
      contactEmail: "warehouse.c@example.com",
      isActive: true,
      notes: "Accessories warehouse",
      createdBy: "system",
    },
    {
      name: "Warehouse D",
      code: "WH004",
      addressLine1: "25 Textile Park",
      addressLine2: "Sitapura Industrial Area",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302022",
      country: "India",
      contactName: "Vikas Singh",
      contactPhone: "9876543204",
      contactEmail: "warehouse.d@example.com",
      isActive: true,
      notes: "Finished goods warehouse",
      createdBy: "system",
    },
  ];

  let inserted = 0;
  let updated = 0;

  await db.transaction(async (tx) => {
    for (const item of warehouseData) {
      const existing = await tx
        .select({ id: warehouseLocations.id })
        .from(warehouseLocations)
        .where(
          and(
            eq(warehouseLocations.code, item.code),
            eq(warehouseLocations.isDeleted, false),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await tx
          .update(warehouseLocations)
          .set({
            name: item.name,
            addressLine1: item.addressLine1,
            addressLine2: item.addressLine2,
            city: item.city,
            state: item.state,
            pincode: item.pincode,
            country: item.country,
            contactName: item.contactName,
            contactPhone: item.contactPhone,
            contactEmail: item.contactEmail,
            isActive: item.isActive,
            notes: item.notes,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(warehouseLocations.id, existing[0].id));
        updated++;
      } else {
        await tx.insert(warehouseLocations).values(item);
        inserted++;
      }
    }
  });

  console.log(
    `[master-seed] Warehouse locations: ${inserted} inserted, ${updated} updated`,
  );
}