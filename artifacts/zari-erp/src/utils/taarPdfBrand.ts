import type jsPDF from "jspdf";
import { TAAR_LOGO_DATA_URL, TAAR_LOGO_RATIO } from "../assets/taarBrandData";

/** Self-contained PNG: the approved logo, gold tagline, and white backing. */
export function addTaarPdfBrand(doc: jsPDF, x: number, y: number, width: number) {
  doc.addImage(TAAR_LOGO_DATA_URL, "PNG", x, y, width, width / TAAR_LOGO_RATIO, "taar-brand");
}
