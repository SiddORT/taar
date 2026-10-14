import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type PurchasePaymentStatus = "Pending" | "Partial" | "Paid";

export interface PurchaseItemRecord {
  id: number;
  purchaseId: number;
  productId: number;
  warehouseId: number | null;              
  size: string | null;
  quantity: string;
  rate: string;
  hsnCode: string;
  gstPercentage: string;
  gstAmount: string;
  amount: string;
  createdAt: string;
  updatedAt: string | null;
  warehouse?: {                            
    id: number;
    name: string;
    code: string;
    city?: string;
    state?: string;
    [key: string]: unknown;
  } | null;
}

export interface PurchaseAttachmentRecord {
  id: number;
  tradingPurchaseProductId: number;
  imagePath: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  displayOrder: number;
  uploadedBy: number | null;
  createdAt: string;
}

export interface VendorSummary {
  id: number;
  vendorCode: string;
  brandName: string;
  contactName: string;
  email: string;
  contactNo: string;
  [key: string]: unknown;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
}

export interface TradingPurchaseRecord {
  id: number;
  purchaseNumber: string;
  purchaseDate: string;
  vendorId: number;
  vendorInvoiceNumber: string | null;
  supplierPoNumber: string | null;
  paymentTermId: number | null;
  dueDate: string | null;
  notes: string | null;
  freight: string;
  otherCharges: string;
  transportation: string;
  insurance: string;
  discount: string;
  remarks: string | null;
  subtotal: string;
  totalGstAmount: string;
  taxableAmount: string;
  grandTotal: string;
  paidAmount: string;
  balanceAmount: string;
  paymentStatus: PurchasePaymentStatus;
  isDeleted: boolean;
  createdBy: number;
  createdAt: string;
  updatedBy: number | null;
  updatedAt: string | null;
  deletedBy: number | null;
  deletedAt: string | null;

  // Hydrated relations
  vendor?: VendorSummary | null;
  items?: PurchaseItemRecord[];
  attachments?: PurchaseAttachmentRecord[];
  createdByUser?: UserSummary | null;
  updatedByUser?: UserSummary | null;
}

export interface PurchaseListResponse {
  data: TradingPurchaseRecord[];
  total: number;
  page: number;
  limit: number;
}

export type StatusFilter = "all" | "active" | "inactive";

// ─── Payload types for create/update ──────────────────────────────────────────
export interface PurchaseFormPayload {
  purchaseNumber?: string;
  purchaseDate: string;
  vendorId: string | number;
  vendorInvoiceNumber?: string | null;
  supplierPoNumber?: string | null;
  paymentTermId?: number | null;
  dueDate?: string | null;
  notes?: string | null;
  items: Array<{
    productId: string | number;
    warehouseId?: string | number | null;
    size?: string | null;
    quantity: number | string;
    rate: number | string;
    hsnCode: string;
    gstPercentage: number | string;
  }>;
  freight?: number | string;
  otherCharges?: number | string;
  transportation?: number | string;
  insurance?: number | string;
  discount?: number | string;
  remarks?: string | null;
  paidAmount?: number | string;
  paymentStatus?: PurchasePaymentStatus;
}

export interface ExistingAttachmentPayload {
  imagePath: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
}

// ─── List ─────────────────────────────────────────────────────────────────────
const BASE = "/api/trading-purchases";
const QK = "trading-purchases";

export function useTradingPurchaseList(p: {
  search: string;
  status: StatusFilter;
  vendorId?: number;
  paymentStatus?: string;
  page: number;
  limit: number;
}) {
  return useQuery({
    queryKey: [QK, p],
    queryFn: () => {
      const qs = new URLSearchParams({
        search: p.search,
        status: p.status,
        page: String(p.page),
        limit: String(p.limit),
      });
      if (p.vendorId != null) qs.set("vendorId", String(p.vendorId));
      if (p.paymentStatus) qs.set("paymentStatus", p.paymentStatus);
      return customFetch<PurchaseListResponse>(`${BASE}?${qs.toString()}`);
    },
    placeholderData: (prev) => prev,
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────
export function useTradingPurchase(id: number | null | undefined) {
  return useQuery({
    queryKey: [QK, id],
    queryFn: () => customFetch<TradingPurchaseRecord>(`${BASE}/${id}`),
    enabled: id != null && !Number.isNaN(id),
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreateTradingPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      attachments,
    }: {
      data: PurchaseFormPayload;
      attachments: File[];
    }) => {
      const fd = new FormData();

      // scalars
      if (data.purchaseNumber) fd.append("purchaseNumber", data.purchaseNumber);
      fd.append("purchaseDate", data.purchaseDate);
      fd.append("vendorId", String(data.vendorId));
      if (data.vendorInvoiceNumber) fd.append("vendorInvoiceNumber", data.vendorInvoiceNumber);
      if (data.supplierPoNumber) fd.append("supplierPoNumber", data.supplierPoNumber);
      if (data.paymentTermId) fd.append("paymentTermId", String(data.paymentTermId));
      if (data.dueDate) fd.append("dueDate", data.dueDate);
      if (data.notes) fd.append("notes", data.notes);

      // items — flat notation matching the backend
      data.items.forEach((it, idx) => {
        fd.append(`items[${idx}][productId]`, String(it.productId));
        if (it.warehouseId != null && it.warehouseId !== "") {
          fd.append(`items[${idx}][warehouseId]`, String(it.warehouseId));
        }
        if (it.size) fd.append(`items[${idx}][size]`, it.size);
        fd.append(`items[${idx}][quantity]`, String(it.quantity));
        fd.append(`items[${idx}][rate]`, String(it.rate));
        fd.append(`items[${idx}][hsnCode]`, it.hsnCode);
        fd.append(`items[${idx}][gstPercentage]`, String(it.gstPercentage));
      });
      // charges
      fd.append("freight", String(data.freight ?? 0));
      fd.append("otherCharges", String(data.otherCharges ?? 0));
      fd.append("transportation", String(data.transportation ?? 0));
      fd.append("insurance", String(data.insurance ?? 0));
      fd.append("discount", String(data.discount ?? 0));
      if (data.remarks) fd.append("remarks", data.remarks);
      fd.append("paidAmount", String(data.paidAmount ?? 0));
      fd.append("paymentStatus", data.paymentStatus ?? "Pending");

      // files
      attachments.forEach((f) => fd.append("attachments", f));

      return customFetch<TradingPurchaseRecord>(BASE, {
        method: "POST",
        body: fd,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdateTradingPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      existingAttachments,
      newAttachments,
    }: {
      id: number;
      data: PurchaseFormPayload;
      existingAttachments: ExistingAttachmentPayload[];
      newAttachments: File[];
    }) => {
      const fd = new FormData();

      fd.append("purchaseDate", data.purchaseDate);
      fd.append("vendorId", String(data.vendorId));
      if (data.vendorInvoiceNumber != null) fd.append("vendorInvoiceNumber", data.vendorInvoiceNumber);
      if (data.supplierPoNumber != null) fd.append("supplierPoNumber", data.supplierPoNumber);
      if (data.paymentTermId != null) fd.append("paymentTermId", String(data.paymentTermId));
      if (data.dueDate != null) fd.append("dueDate", data.dueDate);
      if (data.notes != null) fd.append("notes", data.notes);

      data.items.forEach((it, idx) => {
        fd.append(`items[${idx}][productId]`, String(it.productId));
        if (it.warehouseId != null && it.warehouseId !== "") {
          fd.append(`items[${idx}][warehouseId]`, String(it.warehouseId));
        }
        if (it.size) fd.append(`items[${idx}][size]`, it.size);
        fd.append(`items[${idx}][quantity]`, String(it.quantity));
        fd.append(`items[${idx}][rate]`, String(it.rate));
        fd.append(`items[${idx}][hsnCode]`, it.hsnCode);
        fd.append(`items[${idx}][gstPercentage]`, String(it.gstPercentage));
      });

      fd.append("freight", String(data.freight ?? 0));
      fd.append("otherCharges", String(data.otherCharges ?? 0));
      fd.append("transportation", String(data.transportation ?? 0));
      fd.append("insurance", String(data.insurance ?? 0));
      fd.append("discount", String(data.discount ?? 0));
      if (data.remarks != null) fd.append("remarks", data.remarks);
      fd.append("paidAmount", String(data.paidAmount ?? 0));
      fd.append("paymentStatus", data.paymentStatus ?? "Pending");

      // existing attachments to KEEP
      fd.append("existingAttachments", JSON.stringify(existingAttachments));

      // new files
      newAttachments.forEach((f) => fd.append("attachments", f));

      return customFetch<TradingPurchaseRecord>(`${BASE}/${id}`, {
        method: "PUT",
        body: fd,
      });
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, vars.id] });
    },
  });
}

// ─── Delete (soft) ────────────────────────────────────────────────────────────
export function useDeleteTradingPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customFetch<{ message: string }>(`${BASE}/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}