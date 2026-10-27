import type { CSSProperties } from "react";
import { TAAR_LOGO_DATA_URL } from "@/assets/taarBrandData";
import initial from "@/assets/taar-initial.png";

export const TAAR_ALT = "TAAR — Your design business, connected";

/** Embedded image keeps document printing independent of network/image URLs. */
export function taarLockupUrl(): string {
  return TAAR_LOGO_DATA_URL;
}

interface TaarBrandProps {
  width?: number | string;
  className?: string;
  style?: CSSProperties;
}

export default function TaarBrand({ width = 160, className, style }: TaarBrandProps) {
  return (
    <img
      src={taarLockupUrl()}
      alt={TAAR_ALT}
      width={typeof width === "number" ? width : undefined}
      className={className}
      style={{ width, height: "auto", maxWidth: "100%", display: "block", objectFit: "contain", ...style }}
    />
  );
}

/** Compact initial cropped from the supplied wordmark, not a substituted font. */
export function TaarInitial({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <img
      src={initial}
      alt="TAAR"
      className={className}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: 8, background: "#fff", border: "1px solid #e5e7eb", objectFit: "contain" }}
    />
  );
}
