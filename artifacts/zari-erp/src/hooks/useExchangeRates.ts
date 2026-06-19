import { useState, useEffect, useCallback, useMemo } from "react";
import { customFetch } from "@workspace/api-client-react";

export interface ExchangeRate {
  currency_code: string;
  rate: string;
  source_type: string;
  is_manual_override: boolean;
  created_at: string;
  currency_name: string;
  symbol: string;
}

interface UseExchangeRatesReturn {
  rates: Record<string, string>;           // raw rates from API (e.g., USD: "0.010569")
  inverseRates: Record<string, string>;    // 1 foreign currency = X INR (e.g., USD: "94.62")
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<Record<string, string>>({ INR: "1" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customFetch<{ data: ExchangeRate[] }>("/api/settings/exchange-rates");
      const map: Record<string, string> = {};
      res.data.forEach((r) => {
        map[r.currency_code] = r.rate;
      });
      if (!map.INR) map.INR = "1";
      setRates(map);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch exchange rates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Compute inverse: 1 foreign currency = how many INR
  const inverseRates = useMemo(() => {
    const inv: Record<string, string> = {};
    Object.entries(rates).forEach(([code, rate]) => {
      const r = parseFloat(rate);
      if (r > 0) {
        inv[code] = (1 / r).toFixed(4);
      } else {
        inv[code] = rate;
      }
    });
    return inv;
  }, [rates]);

  return { rates, inverseRates, loading, error, refetch: fetchRates };
}