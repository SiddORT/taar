import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

export type DepartmentRecord = {
  id: number; name: string; isActive: boolean; isDeleted: boolean;
  createdBy: string; createdAt: string; updatedBy: string | null; updatedAt: string | null;
};

export type DepartmentFormData = { name: string; isActive: boolean };
export type StatusFilter = "all" | "active" | "inactive";

export interface DepartmentImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; name: string; error: string }[];
}

const BASE = "/api/departments";
const QK = "departments-master";

export function useDepartmentMasterList(p: { search: string; status: StatusFilter; page: number; limit: number }) {
  return useQuery({
    queryKey: [QK, p],
    queryFn: () => customFetch<{ data: DepartmentRecord[]; total: number; page: number; limit: number }>(
      `${BASE}?search=${encodeURIComponent(p.search)}&status=${p.status}&page=${p.page}&limit=${p.limit}`),
    placeholderData: (prev) => prev,
  });
}

export async function fetchAllDepartmentsForExport(search: string, status: StatusFilter): Promise<DepartmentRecord[]> {
  const qs = new URLSearchParams({ search, status }).toString();
  const result = await customFetch<{ data: DepartmentRecord[] }>(`${BASE}/export-all?${qs}`);
  return result.data;
}

export function useCreateDepartmentMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentFormData) => customFetch<DepartmentRecord>(BASE, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "departments"] }); },
  });
}

export function useUpdateDepartmentMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DepartmentFormData> }) =>
      customFetch<DepartmentRecord>(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "departments"] }); },
  });
}

export function useToggleDepartmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customFetch<DepartmentRecord>(`${BASE}/${id}/status`, { method: "PATCH" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "departments"] }); },
  });
}

export function useDeleteDepartmentMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customFetch<{ message: string }>(`${BASE}/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "departments"] }); },
  });
}

export function useImportDepartments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: { name: string }[]) =>
      customFetch<DepartmentImportResult>(`${BASE}/import`, { method: "POST", body: JSON.stringify(rows) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK] }); qc.invalidateQueries({ queryKey: ["lookups", "departments"] }); },
  });
}
