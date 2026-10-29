import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch, type ClientAccessDelivery } from "@workspace/api-client-react";

export type PortalAccessMethod = "invitation" | "temporary";
export type PortalAccessResult = ClientAccessDelivery;

const QK = "clients";

export function errorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: unknown })?.data;
  if (data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
  return fallback;
}

export function useSendPortalAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, method, temporaryPassword }: { id: number; method: PortalAccessMethod; temporaryPassword?: string }) =>
      customFetch<PortalAccessResult>(`/api/clients/${id}/portal-access`, {
        method: "POST",
        body: JSON.stringify(method === "temporary" ? { method, temporaryPassword } : { method }),
      }),
    // Refresh even on failure (e.g. 502 SMTP) so delivery state is honest.
    onSettled: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useGenerateTemporaryPassword() {
  return useMutation({
    mutationFn: (id: number) =>
      customFetch<{ password: string }>(`/api/clients/${id}/portal-access/temporary-password`, { method: "POST", body: "{}" }),
  });
}

export function useDisablePortalAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customFetch<PortalAccessResult>(`/api/clients/${id}/portal-access/disable`, { method: "POST", body: "{}" }),
    onSettled: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}
