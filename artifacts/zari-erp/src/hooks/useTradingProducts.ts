import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

// ───── Types ─────
export interface TradingProductImage {
  id?: number;
  imagePath: string;
  originalName?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductColor {
  colorName: string;
  hexCode: string;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
}

export interface TradingProductRecord {
  id: number;
  productCode: string;
  productName: string;
  category: number;
  categoryName?: string;
  description: string | null;
  hsnCode: string | null;
  gstPercentage: string | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedBy: number | null;
  deletedAt: string | null;
  createdBy: number;
  createdAt: string;
  updatedBy: number | null;
  updatedAt: string | null;
  hasColors: boolean;
  hasSizes: boolean;
  colors: ProductColor[];
  sizes: string[];
  tags: string[];
  images: TradingProductImage[];
  createdByUser: UserSummary | null;
  updatedByUser: UserSummary | null;
}

interface TradingProductListResponse {
  data: TradingProductRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface TradingProductFormData {
  productName: string;
  category: number;
  description: string;
  hsnCode: string;
  gstPercentage: string;
  tags: string[];
  isActive: boolean;
  hasColors: boolean;
  colors: ProductColor[];
  hasSizes: boolean;
  sizes: string[];
}

export interface TradingProductImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export type StatusFilter = "all" | "active" | "inactive";

// ───── List ─────
export function useTradingProductList(params: {
  search: string;
  status: StatusFilter;
  categoryId?: number;
  tag?: string;
  colorName?: string;
  sizeLabel?: string;
  page: number;
  limit: number;
}) {
  return useQuery<TradingProductListResponse>({
    queryKey: ["tradingProducts", params],
    queryFn: () => {
      const qs = new URLSearchParams({
        search: params.search,
        status: params.status,
        page: String(params.page),
        limit: String(params.limit),
      });
      if (params.categoryId != null) qs.set("categoryId", String(params.categoryId));
      if (params.tag) qs.set("tag", params.tag);
      if (params.colorName) qs.set("colorName", params.colorName);
      if (params.sizeLabel) qs.set("sizeLabel", params.sizeLabel);
      return customFetch<TradingProductListResponse>(`/api/trading-products?${qs.toString()}`);
    },
    placeholderData: (prev) => prev,
  });
}

// ───── Get By ID ─────
export function useTradingProduct(id: number | null) {
  return useQuery<TradingProductRecord>({
    queryKey: ["tradingProduct", id],
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: () => customFetch<TradingProductRecord>(`/api/trading-products/${id}`),
  });
}

// ───── Meta Options for Filters ─────
export function useProductColorOptions() {
  return useQuery<{ data: string[] }>({
    queryKey: ["tradingProducts", "meta", "colors"],
    queryFn: () => customFetch<{ data: string[] }>("/api/trading-products/meta/colors"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductSizeOptions() {
  return useQuery<{ data: string[] }>({
    queryKey: ["tradingProducts", "meta", "sizes"],
    queryFn: () => customFetch<{ data: string[] }>("/api/trading-products/meta/sizes"),
    staleTime: 5 * 60 * 1000,
  });
}

// ───── Create ─────
export function useCreateTradingProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      images = [],
    }: {
      data: TradingProductFormData;
      images?: File[];
    }) => {
      const fd = new FormData();
      fd.append("productName", data.productName);
      fd.append("category", String(data.category));
      fd.append("description", data.description ?? "");
      fd.append("hsnCode", data.hsnCode ?? "");
      fd.append("gstPercentage", data.gstPercentage ?? "");
      fd.append("isActive", String(data.isActive));
      fd.append("tags", JSON.stringify(data.tags ?? []));
      fd.append("hasColors", String(data.hasColors));
      fd.append("colors", JSON.stringify(data.colors ?? []));
      fd.append("hasSizes", String(data.hasSizes));
      fd.append("sizes", JSON.stringify(data.sizes ?? []));
      fd.append("existingImages", JSON.stringify([]));
      images.forEach(file => fd.append("images", file));

      return customFetch<TradingProductRecord>("/api/trading-products", {
        method: "POST",
        body: fd,
      });
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["tradingProducts"] });
      if (created?.id) {
        qc.invalidateQueries({ queryKey: ["tradingProduct", created.id] });
        qc.removeQueries({ queryKey: ["tradingProduct", created.id] });
      }
    },
  });
}

// ───── Update ─────
export function useUpdateTradingProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      existingImages = [],
      newImages = [],
    }: {
      id: number;
      data: Partial<TradingProductFormData>;
      existingImages?: TradingProductImage[];
      newImages?: File[];
    }) => {
      const fd = new FormData();
      if (data.productName !== undefined) fd.append("productName", data.productName);
      if (data.category !== undefined) fd.append("category", String(data.category));
      if (data.description !== undefined) fd.append("description", data.description ?? "");
      if (data.hsnCode !== undefined) fd.append("hsnCode", data.hsnCode ?? "");
      if (data.gstPercentage !== undefined) fd.append("gstPercentage", data.gstPercentage ?? "");
      if (data.isActive !== undefined) fd.append("isActive", String(data.isActive));
      if (data.tags !== undefined) fd.append("tags", JSON.stringify(data.tags));
      if (data.hasColors !== undefined) fd.append("hasColors", String(data.hasColors));
      if (data.colors !== undefined) fd.append("colors", JSON.stringify(data.colors));
      if (data.hasSizes !== undefined) fd.append("hasSizes", String(data.hasSizes));
      if (data.sizes !== undefined) fd.append("sizes", JSON.stringify(data.sizes));

      fd.append(
        "existingImages",
        JSON.stringify(
          existingImages.map(img => ({
            imagePath: img.imagePath,
            originalName: img.originalName ?? undefined,
          }))
        )
      );
      newImages.forEach(file => fd.append("images", file));

      return customFetch<TradingProductRecord>(`/api/trading-products/${id}`, {
        method: "PUT",
        body: fd,
      });
    },
    onSuccess: (_updated, variables) => {
      qc.invalidateQueries({ queryKey: ["tradingProducts"] });
      qc.invalidateQueries({ queryKey: ["tradingProduct", variables.id] });
      qc.refetchQueries({ queryKey: ["tradingProduct", variables.id] });
    },
  });
}

// ───── Toggle Status ─────
export function useToggleTradingProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customFetch<TradingProductRecord>(`/api/trading-products/${id}`, {
        method: "PATCH",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tradingProducts"] }),
  });
}

// ───── Delete ─────
export function useDeleteTradingProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customFetch<{ message: string }>(`/api/trading-products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tradingProducts"] }),
  });
}

// ───── Export ─────
export async function fetchAllTradingProductsForExport(
  search: string,
  status: StatusFilter,
  categoryId?: number,
  colorName?: string,
  sizeLabel?: string
): Promise<TradingProductRecord[]> {
  const qs = new URLSearchParams({ search, status });
  if (categoryId != null) qs.set("categoryId", String(categoryId));
  if (colorName) qs.set("colorName", colorName);
  if (sizeLabel) qs.set("sizeLabel", sizeLabel);
  const result = await customFetch<{ data: TradingProductRecord[] }>(
    `/api/trading-products/export?${qs.toString()}`
  );
  return result.data;
}

// ───── Import ─────
export function useImportTradingProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: Record<string, unknown>[]) =>    
      customFetch<TradingProductImportResult>("/api/trading-products/import", {
        method: "POST",
        body: JSON.stringify(rows),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tradingProducts"] }),
  });
}