import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

export type UnitTypeRecord = {
  id: number; name: string; isActive: boolean; createdAt: string;
};

export type UnitTypeFormData = { name: string; isActive: boolean };
export type StatusFilter = "all" | "active" | "inactive";

export interface UnitTypeImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; name: string; error: string }[];
}

const BASE = "/api/unit-types-master";
const QK = "unit-types-master";

export function useUnitTypeMasterList(p: { search: string; status: StatusFilter; page: number; limit: number }) {
  return useQuery({
    queryKey: [QK, p],
    queryFn: () => customFetch<{ data: UnitTypeRecord[]; total: number; page: number; limit: number }>(
      `${BASE}?search=${encodeURIComponent(p.search)}&status=${p.status}&page=${p.page}&limit=${p.limit}`),
    placeholderData: (prev) => prev,
  });
}

export async function fetchAllUnitTypesForExport(search: string, status: StatusFilter): Promise<UnitTypeRecord[]> {
  const qs = new URLSearchParams({ search, status }).toString();
  const result = await customFetch<{ data: UnitTypeRecord[] }>(`${BASE}/export-all?${qs}`);
  return result.data;
}

export function useCreateUnitTypeMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UnitTypeFormData) => customFetch<UnitTypeRecord>(BASE, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "unit-types"] }); },
  });
}

export function useUpdateUnitTypeMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UnitTypeFormData> }) =>
      customFetch<UnitTypeRecord>(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "unit-types"] }); },
  });
}

export function useToggleUnitTypeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customFetch<UnitTypeRecord>(`${BASE}/${id}/status`, { method: "PATCH" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "unit-types"] }); },
  });
}

export function useDeleteUnitTypeMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customFetch<{ message: string }>(`${BASE}/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "unit-types"] }); },
  });
}

export function useImportUnitTypes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: { name: string }[]) =>
      customFetch<UnitTypeImportResult>(`${BASE}/import`, { method: "POST", body: JSON.stringify(rows) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "unit-types"] }); },
  });
}
