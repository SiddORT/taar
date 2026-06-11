// hooks/useCurrencies.ts
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_active: boolean;
  is_base: boolean;
  updated_at: string;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_at: string | null;
}

interface CurrenciesResponse {
  data: Currency[];
}

export function useCurrencies() {
  return useQuery<CurrenciesResponse>({
    queryKey: ["currencies"],
    queryFn: () => customFetch<CurrenciesResponse>("/api/settings/currencies"),
    staleTime: 60_000, // cache for 1 min
  });
}

export function useBaseCurrency() {
  const { data, ...rest } = useCurrencies();
  const baseCurrency = data?.data.find((c) => c.is_base);
  return {
    baseCurrency,
    baseCurrencyCode: baseCurrency?.code ?? "INR",
    baseCurrencySymbol: baseCurrency?.symbol ?? "₹",
    ...rest,
  };
}