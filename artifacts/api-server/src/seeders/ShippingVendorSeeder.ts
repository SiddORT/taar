import { db, shippingVendors, eq, and } from "@workspace/db";

export async function seedShippingVendors(): Promise<void> {
  const shippingVendorData = [
    {
      vendorName: "DHL Express",
      contactPerson: "Amit Sharma",
      phoneNumber: "+91 9876543210",
      emailAddress: "amit.sharma@dhl.example.com",
      weightRatePerKg: "180.00",
      minimumCharge: "350.00",
      remarks: "International express courier services with priority delivery.",
      isActive: true,
      isDeleted: false,
    },
    {
      vendorName: "FedEx",
      contactPerson: "Priya Mehta",
      phoneNumber: "+91 9823456712",
      emailAddress: "priya.mehta@fedex.example.com",
      weightRatePerKg: "165.00",
      minimumCharge: "300.00",
      remarks: "Domestic and international parcel shipping with tracking.",
      isActive: true,
      isDeleted: false,
    },
    {
      vendorName: "Blue Dart",
      contactPerson: "Rahul Verma",
      phoneNumber: "+91 9911223344",
      emailAddress: "rahul.verma@bluedart.example.com",
      weightRatePerKg: "95.00",
      minimumCharge: "180.00",
      remarks: "Reliable domestic courier service for garment samples and documents.",
      isActive: true,
      isDeleted: false,
    },
    {
      vendorName: "DTDC",
      contactPerson: "Sneha Patel",
      phoneNumber: "+91 9845671234",
      emailAddress: "sneha.patel@dtdc.example.com",
      weightRatePerKg: "85.00",
      minimumCharge: "150.00",
      remarks: "Domestic and international courier services with standard delivery.",
      isActive: true,
      isDeleted: false,
    },
    {
      vendorName: "Delhivery",
      contactPerson: "Rohit Kumar",
      phoneNumber: "+91 9765432187",
      emailAddress: "rohit.kumar@delhivery.example.com",
      weightRatePerKg: "75.00",
      minimumCharge: "120.00",
      remarks: "E-commerce and domestic logistics with door-to-door delivery.",
      isActive: true,
      isDeleted: false,
    },
    {
      vendorName: "Ecom Express",
      contactPerson: "Neha Singh",
      phoneNumber: "+91 9898765432",
      emailAddress: "neha.singh@ecomexpress.example.com",
      weightRatePerKg: "70.00",
      minimumCharge: "110.00",
      remarks: "Domestic parcel delivery and e-commerce logistics.",
      isActive: true,
      isDeleted: false,
    },
    {
      vendorName: "Aramex",
      contactPerson: "Vikram Rao",
      phoneNumber: "+91 9812345678",
      emailAddress: "vikram.rao@aramex.example.com",
      weightRatePerKg: "145.00",
      minimumCharge: "280.00",
      remarks: "International shipping and express delivery services.",
      isActive: true,
      isDeleted: false,
    },
    {
      vendorName: "India Post",
      contactPerson: "Sanjay Joshi",
      phoneNumber: "+91 9753124680",
      emailAddress: "sanjay.joshi@indiapost.example.com",
      weightRatePerKg: "55.00",
      minimumCharge: "80.00",
      remarks: "Cost-effective domestic parcel and registered shipping services.",
      isActive: true,
      isDeleted: false,
    },
  ];

  let inserted = 0;
  let updated = 0;

  await db.transaction(async (tx) => {
    for (const vendor of shippingVendorData) {
      const existing = await tx
        .select({ id: shippingVendors.id })
        .from(shippingVendors)
        .where(
          and(
            eq(shippingVendors.vendorName, vendor.vendorName),
            eq(shippingVendors.isDeleted, false),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await tx
          .update(shippingVendors)
          .set({
            contactPerson: vendor.contactPerson,
            phoneNumber: vendor.phoneNumber,
            emailAddress: vendor.emailAddress,
            weightRatePerKg: vendor.weightRatePerKg,
            minimumCharge: vendor.minimumCharge,
            remarks: vendor.remarks,
            isActive: vendor.isActive,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(shippingVendors.id, existing[0].id));
        updated++;
      } else {
        await tx.insert(shippingVendors).values(vendor);
        inserted++;
      }
    }
  });

  console.log(
    `[master-seed] Shipping vendors: ${inserted} inserted, ${updated} updated`,
  );
}