import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

// ───── Types ─────
export interface PaymentTerm {
  id: number;
  termCode: string;
  description: string;
  netDays: number;
  discountPercentage: string;
  discountDays: number;
}

interface PaymentTermListResponse {
  data: PaymentTerm[];
  total: number;
}

// ───── List ─────
export function usePaymentTerms(search: string = "") {
  return useQuery<PaymentTermListResponse>({
    queryKey: ["paymentTerms", search],
    queryFn: () => {
      const qs = new URLSearchParams();

      if (search.trim()) {
        qs.set("search", search.trim());
      }

      return customFetch<PaymentTermListResponse>(
        `/api/payment-terms?${qs.toString()}`,
      );
    },
  });
}