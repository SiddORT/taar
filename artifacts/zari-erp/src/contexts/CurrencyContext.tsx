import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { customFetch } from "@workspace/api-client-react";

interface CurrencyInfo {
  code: string;
  symbol: string;
  decimal_places: number;
  rate: number;
}

interface CurrencyCtx {
  currency: CurrencyInfo;
  fmt: (inrAmount: number | string | null | undefined) => string;
  fmtAbbr: (inrAmount: number | string | null | undefined) => string;
  reload: () => void;
}

const DEFAULT: CurrencyInfo = { code: "INR", symbol: "₹", decimal_places: 2, rate: 1 };

function toNum(v: number | string | null | undefined): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
  return Number.isFinite(n) ? n : 0;
}

const CurrencyContext = createContext<CurrencyCtx>({
  currency: DEFAULT,
  fmt: (v) => `₹${toNum(v).toFixed(2)}`,
  fmtAbbr: (v) => `₹${toNum(v).toFixed(2)}`,
  reload: () => {},
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT);

  const load = useCallback(() => {
    const token = localStorage.getItem("zarierp_token");
    if (!token) return;
    customFetch<any>("/api/settings/currencies")
      .then((res) => {
        const all: any[] = res.data ?? [];
        const base = all.find((c: any) => c.is_base) ?? all.find((c: any) => c.code === "INR");
        if (!base) return;
        const baseCode = base.code as string;
        if (baseCode === "INR") {
          setCurrency({ code: "INR", symbol: "₹", decimal_places: base.decimal_places ?? 2, rate: 1 });
          return;
        }
        customFetch<any>("/api/settings/exchange-rates")
          .then((ratesRes) => {
            const rates: any[] = ratesRes.data ?? [];
            const row = rates.find((r: any) => r.currency_code === baseCode);
            const ratePerInr = row ? parseFloat(row.rate) : 1;
            setCurrency({
              code: baseCode,
              symbol: base.symbol ?? baseCode,
              decimal_places: base.decimal_places ?? 2,
              rate: Number.isFinite(ratePerInr) && ratePerInr > 0 ? ratePerInr : 1,
            });
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = useCallback(
    (inrAmount: number | string | null | undefined): string => {
      const inr = toNum(inrAmount);
      const display = inr * currency.rate;
      const dp = currency.decimal_places;
      const formatted = display.toLocaleString("en-US", {
        minimumFractionDigits: dp,
        maximumFractionDigits: dp,
      });
      return `${currency.symbol}${formatted}`;
    },
    [currency],
  );

  const fmtAbbr = useCallback(
    (inrAmount: number | string | null | undefined): string => {
      const inr = toNum(inrAmount);
      const display = inr * currency.rate;
      const sym = currency.symbol;
      const code = currency.code;
      
      // Special handling for INR
      if (code === "INR") {
        if (display >= 10_000_000) {
          return `${sym}${(display / 10_000_000).toFixed(2)} Cr`;
        }
        if (display >= 100_000) {
          return `${sym}${(display / 100_000).toFixed(2)} L`;
        }
        if (display >= 1_000) {
          return `${sym}${(display / 1_000).toFixed(1)}K`;
        }
        return `${sym}${display.toFixed(currency.decimal_places)}`;
      }
      
      // For all other currencies, use standard western abbreviations
      const absValue = Math.abs(display);
      if (absValue >= 1_000_000_000) {
        return `${sym}${(display / 1_000_000_000).toFixed(2)}B`;
      }
      if (absValue >= 1_000_000) {
        return `${sym}${(display / 1_000_000).toFixed(2)}M`;
      }
      if (absValue >= 1_000) {
        return `${sym}${(display / 1_000).toFixed(1)}K`;
      }
      return `${sym}${display.toFixed(currency.decimal_places)}`;
    },
    [currency],
  );

  return (
    <CurrencyContext.Provider value={{ currency, fmt, fmtAbbr, reload: load }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyCtx {
  return useContext(CurrencyContext);
}
