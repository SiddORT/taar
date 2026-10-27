import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { jsPDF } from "jspdf";
import {
  downloadPoPdf, downloadPrPdf, downloadBomPdf, downloadCostingPoPdf,
} from "../src/utils/pdfExport";
import { generateQuotationPdf, type QuotationPdfData } from "../src/utils/generateQuotationPdf";

// Render local fixtures only: no real documents are altered or downloads logged.
const outputDir = "/tmp/taar-branding-check";
const output: Array<{ name: string; pdf: ArrayBuffer }> = [];
function capture(doc: jsPDF, name: string) {
  const images = Object.values((doc as any).internal.collections.addImage_images ?? {}) as Array<{ width: number; height: number }>;
  assert(images.some(image => image.width === 1200 && image.height === 380), `${name}: TAAR lockup missing`);
  output.push({ name: name.replace(/[^a-z0-9.-]/gi, "_"), pdf: doc.output("arraybuffer") });
}
jsPDF.API.save = function (name: string) { capture(this, name); return this; };

async function main() {
  await mkdir(outputDir, { recursive: true });
  const font = await readFile(new URL("../public/fonts/Roboto-Regular.ttf", import.meta.url));
  globalThis.fetch = async (input) => {
    if (input === "/fonts/Roboto-Regular.ttf") return new Response(new Uint8Array(font));
    throw new Error("Network access is disabled in the local PDF fixture check");
  };
  await downloadPoPdf({
    po_number: "TAAR-PO-CHECK", status: "Draft", vendor_name: "Sample vendor",
    po_date: "2026-10-27", reference_type: "swatch",
    items: [{ item_name: "Sample material", item_code: "M1", unit_type: "Meter",
      ordered_quantity: 2, received_quantity: 0, pending_quantity: 2, unit_price: 10 }],
  });
  await downloadPrPdf({
    pr_number: "TAAR-PR-CHECK", po_number: "TAAR-PO-CHECK", status: "Draft",
    vendor_name: "Sample vendor", received_date: "2026-10-27", reference_type: "swatch",
    items: [{ item_name: "Sample material", item_code: "M1", quantity: 2, unit_price: 10, vendor_name: "Sample vendor" }],
  });
  downloadBomPdf({
    referenceType: "swatch", referenceId: "CHECK", orderCode: "TAAR-BOM-CHECK",
    entityName: "Sample design", clientName: "Sample client",
    rows: [{ materialName: "Sample material", materialCode: "M1", materialType: "Fabric", requiredQty: "2", unitType: "Meter" }],
  });
  for (const referenceType of ["swatch", "style"] as const) {
    downloadCostingPoPdf({
      referenceType, orderCode: `TAAR-${referenceType}-COSTING-CHECK`, entityName: "Sample design",
      orders: [{ poNumber: "PO-CHECK", vendorName: "Sample vendor", poDate: "2026-10-27", status: "Draft",
        items: [{ materialCode: "M1", materialName: "Sample material", unitType: "Meter", quantity: "2", targetPrice: "10" }] }],
    });
  }
  downloadCostingPoPdf({ referenceType: "swatch", orderCode: "TAAR-EMPTY-CHECK", orders: [] });
  const quotation: QuotationPdfData = {
    quotation_number: "TAAR-QUOTE-CHECK", created_at: "2026-10-27", status: "Draft",
    client_name: "Sample client", client_state: "Sample state", requirement_summary: "Branding verification",
    internal_notes: null, client_notes: null, estimated_weight: "0", gst_type: "none", gst_rate: "0",
    subtotal_amount: "20", gst_amount: "0", estimated_shipping_charges: "0", total_amount: "20",
    cover_page: "classic", cover_page_image: null, designs: [], charges: [],
  };
  for (const cover of ["classic", "modern", "corporate", "minimal"]) {
    capture(await generateQuotationPdf({ ...quotation, cover_page: cover }), `quotation-${cover}.pdf`);
  }
  assert.equal(output.length, 10);
  for (const item of output) await writeFile(`${outputDir}/${item.name}`, new Uint8Array(item.pdf));
  console.info(`Verified TAAR lockup in ${output.length} PDFs. Local samples: ${outputDir}`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
