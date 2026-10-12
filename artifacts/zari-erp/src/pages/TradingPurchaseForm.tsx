import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Upload, FileText, Receipt,
  Save, Plus as PlusIcon, Trash2, Calculator, Building2, CreditCard, Paperclip, Loader2,
  X, ZoomIn, File
} from "lucide-react";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

import AppLayout from "@/components/layout/AppLayout";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { SmallSearchSelect } from "@/components/ui/SearchableSelect";
import { useVendorList } from "@/hooks/useVendors";
import { usePaymentTerms } from "@/hooks/usePaymentTerms";
import { useTradingProductList } from "@/hooks/useTradingProducts";
import { useHSNList } from "@/hooks/useHSN";
import { useCurrency } from "@/contexts/CurrencyContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormErrors = Partial<Record<string, string>>;

interface PurchaseItem {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  rate: number;
  hsnCode: string;
  gstPercentage: number;
  gstAmount: number;
  amount: number;
}

interface FormState {
  purchaseNumber: string;
  purchaseDate: string;
  vendorId: string;
  vendorInvoiceNumber: string;
  supplierPoNumber: string;
  paymentTermId: string;
  dueDate: string;
  notes: string;
  items: PurchaseItem[];
  freight: number;
  otherCharges: number;
  transportation: number;
  insurance: number;
  discount: number;
  remarks: string;
  paidAmount: number;
  paymentStatus: string;
}

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string; // objectURL for images, empty for PDFs
  isImage: boolean;
}

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];

const EMPTY_ITEM: PurchaseItem = {
  id: Math.random().toString(36).slice(2),
  productId: "",
  size: "",
  quantity: 0,
  rate: 0,
  hsnCode: "",
  gstPercentage: 0,
  gstAmount: 0,
  amount: 0,
};

const EMPTY_FORM: FormState = {
  purchaseNumber: "PUR-07012026-001",
  purchaseDate: "2026-01-07",
  vendorId: "",
  vendorInvoiceNumber: "",
  supplierPoNumber: "",
  paymentTermId: "",
  dueDate: "2026-01-21",
  notes: "",
  items: [{ ...EMPTY_ITEM }, { ...EMPTY_ITEM, id: Math.random().toString(36).slice(2) }],
  freight: 0,
  otherCharges: 0,
  transportation: 0,
  insurance: 0,
  discount: 0,
  remarks: "",
  paidAmount: 0,
  paymentStatus: "",
};

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  optional,
}: {
  icon: React.ElementType;
  title: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-cyan-900" />
      <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
        {title}
        {optional && (
          <span className="text-gray-400 font-normal normal-case tracking-normal ml-1.5 text-xs">(Optional)</span>
        )}
      </h3>
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function FieldWrap({
  label,
  required,
  error,
  children,
  className = "",
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-500 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-cyan-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-900 transition-colors";
const inputReadonlyCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50 focus:outline-none";
const inputRightCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-cyan-900 text-right placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-900 transition-colors";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function TradingPurchaseForm() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { currency, fmt } = useCurrency();

  const isNew = !params.id;

  // Auth
  const token = localStorage.getItem("zarierp_token");
  const { data: user, isLoading: loadingUser } = useGetMe({
    query: { enabled: !!token } as any,
  });

  // State
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Attachments State ──
  const [attachments, setAttachments] = useState<PendingFile[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── API Queries ──
  const { data: vendorsData, isLoading: loadingVendors } = useVendorList({
    search: "", status: "all", page: 1, limit: 100,
  });

  const { data: paymentTermsData, isLoading: loadingPaymentTerms } = usePaymentTerms("");

  const { data: productsData, isLoading: loadingProducts } = useTradingProductList({
    search: "", status: "all", page: 1, limit: 100,
  });

  const { data: hsnData, isLoading: loadingHsn } = useHSNList({
    search: "", status: "all", page: 1, limit: 100,
  });

  // Cleanup objectURLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth Redirect
  if (!token || (!loadingUser && !user)) {
    setLocation("/login");
    return null;
  }

  const logoutMutation = useLogout();
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      localStorage.removeItem("zarierp_token");
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setLocation("/login");
    }
  };

  // ── Options ──
  const vendorOptions = (vendorsData?.data ?? []).map((v) => ({
    value: String(v.id),
    label: v.brandName,
  }));

  const paymentTermOptions = (paymentTermsData?.data ?? []).map((pt) => pt.description);
  const productOptions = (productsData?.data ?? []).map((p) => p.productName);

  const hsnOptions = (hsnData?.data ?? []).map((h) => ({
    value: h.hsnCode,
    label: `${h.hsnCode} - ${h.gstPercentage}%`,
    gstPercentage: parseFloat(h.gstPercentage) || 0,
  }));

  const selectedVendor = vendorsData?.data.find(
    (v) => String(v.id) === form.vendorId
  );

  // Dynamic Calculations
  const itemTotals = form.items.map((item) => {
    const gross = item.quantity * item.rate;
    const gstAmt = gross * ((item.gstPercentage || 0) / 100);
    const netAmount = gross + gstAmt;
    return { gross, gstAmount: gstAmt, amount: netAmount };
  });

  const subtotal = itemTotals.reduce((sum, item) => sum + item.gross, 0);
  const totalGst = itemTotals.reduce((sum, item) => sum + item.gstAmount, 0);
  const totalOtherCharges =
    form.freight + form.otherCharges + form.transportation + form.insurance;

  const taxableAmount = Math.max(0, subtotal - form.discount);
  const grandTotal = taxableAmount + totalGst + totalOtherCharges;
  const balanceAmount = grandTotal - form.paidAmount;

  // Handlers
  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key])
      setErrors((e) => {
        const n = { ...e };
        delete n[key];
        return n;
      });
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseItem,
    value: any
  ) => {
    const newItems = [...form.items];
    const item = { ...newItems[index], [field]: value };

    if (field === "hsnCode") {
      const hsn = hsnOptions.find((o) => o.value === value);
      item.gstPercentage = hsn ? hsn.gstPercentage : 0;
    }

    const gross = item.quantity * item.rate;
    item.gstAmount = gross * ((item.gstPercentage || 0) / 100);
    item.amount = gross + item.gstAmount;

    newItems[index] = item;
    setField("items", newItems);
  };

  const addItem = () => {
    setField("items", [
      ...form.items,
      { ...EMPTY_ITEM, id: Math.random().toString(36).slice(2) },
    ]);
  };

  const removeItem = (index: number) => {
    if (form.items.length === 1) return;
    setField(
      "items",
      form.items.filter((_, i) => i !== index)
    );
  };

  // ── Attachment Handlers ──
  const processFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    const valid: PendingFile[] = [];
    const rejected: string[] = [];

    for (const f of incoming) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        rejected.push(`${f.name} (unsupported type)`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        rejected.push(`${f.name} (exceeds 5MB)`);
        continue;
      }
      const isImage = f.type.startsWith("image/");
      valid.push({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        previewUrl: isImage ? URL.createObjectURL(f) : "",
        isImage,
      });
    }

    if (rejected.length) {
      toast({
        title: "Some files were skipped",
        description: rejected.join(", "),
        variant: "destructive",
      });
    }

    if (valid.length) {
      setAttachments((prev) => [...prev, ...valid]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const newErrors: FormErrors = {};
    if (!form.vendorId) newErrors.vendorId = "Vendor is required";
    if (!form.purchaseDate) newErrors.purchaseDate = "Purchase Date is required";
    if (!form.paymentTermId) newErrors.paymentTermId = "Payment Terms is required";
    if (form.items.some((i) => !i.productId || i.quantity <= 0 || !i.hsnCode)) {
      newErrors.items = "All items must have a product, HSN code, and quantity > 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        purchase_number: form.purchaseNumber,
        purchase_date: form.purchaseDate,
        vendor_id: parseInt(form.vendorId),
        vendor_invoice_number: form.vendorInvoiceNumber,
        supplier_po_number: form.supplierPoNumber,
        payment_terms: form.paymentTermId,
        due_date: form.dueDate,
        notes: form.notes,
        items: form.items.map((i, idx) => ({
          product_id: i.productId,
          size: i.size,
          quantity: i.quantity,
          rate: i.rate,
          hsn_code: i.hsnCode,
          gst_percentage: i.gstPercentage,
          gst_amount: itemTotals[idx].gstAmount,
          amount: itemTotals[idx].amount,
        })),
        freight: form.freight,
        other_charges: form.otherCharges,
        transportation: form.transportation,
        insurance: form.insurance,
        discount: form.discount,
        remarks: form.remarks,
        paid_amount: form.paidAmount,
        balance_amount: balanceAmount,
        payment_status: form.paymentStatus,
      };

      // attachments: send via FormData when wiring up the real API
      // const fd = new FormData();
      // fd.append("data", JSON.stringify(payload));
      // attachments.forEach(a => fd.append("attachments", a.file));

      console.log("Submitting Payload:", payload);
      console.log("Attachments:", attachments.map(a => a.file.name));
      toast({ title: "Purchase saved successfully" });
      setLocation("/trading/purchase");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save purchase",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout
      username={user.username}
      role={user.role}
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    >
      <div className="max-w-screen-xl mx-auto space-y-5 pb-8">
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/trading/purchase")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Purchase
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-bold text-cyan-900">
              {isNew ? "Add Purchase" : "Edit Purchase"}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all shadow-sm"
            style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {submitting ? "Saving…" : "Save Purchase"}
          </button>
        </div>

        {/* ── Top Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <SectionHeader icon={FileText} title="Purchase Details" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <FieldWrap label="Purchase Number" required hint="Auto-generated">
                <input type="text" value={form.purchaseNumber} readOnly className={inputReadonlyCls} />
              </FieldWrap>

              <FieldWrap label="Purchase Date" required error={errors.purchaseDate}>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setField("purchaseDate", e.target.value)}
                  className={inputCls}
                />
              </FieldWrap>

              <FieldWrap label="Vendor" required error={errors.vendorId}>
                <SearchableSelect
                  value={selectedVendor ? selectedVendor.brandName : form.vendorId}
                  onChange={(val) => {
                    const match = vendorsData?.data.find((v) => v.brandName === val);
                    setField("vendorId", match ? String(match.id) : val);
                  }}
                  options={vendorOptions.map((v) => v.label)}
                  placeholder={loadingVendors ? "Loading..." : "Select Vendor"}
                  disabled={loadingVendors}
                />
              </FieldWrap>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <FieldWrap label="Vendor Invoice Number">
                <input
                  type="text"
                  value={form.vendorInvoiceNumber}
                  onChange={(e) => setField("vendorInvoiceNumber", e.target.value)}
                  placeholder="Enter invoice number"
                  className={inputCls}
                />
              </FieldWrap>

              <FieldWrap label="Supplier PO Number">
                <input
                  type="text"
                  value={form.supplierPoNumber}
                  onChange={(e) => setField("supplierPoNumber", e.target.value)}
                  placeholder="Enter PO number"
                  className={inputCls}
                />
              </FieldWrap>

              <FieldWrap label="Payment Terms" required error={errors.paymentTermId}>
                <SearchableSelect
                  value={form.paymentTermId}
                  onChange={(v) => setField("paymentTermId", v)}
                  options={paymentTermOptions}
                  placeholder={loadingPaymentTerms ? "Loading..." : "Select Payment Terms"}
                  disabled={loadingPaymentTerms}
                />
              </FieldWrap>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FieldWrap label="Due Date">
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setField("dueDate", e.target.value)}
                  className={inputCls}
                />
              </FieldWrap>

              <div className="sm:col-span-2">
                <FieldWrap label="Notes">
                  <textarea
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    placeholder="Enter notes (optional)"
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </FieldWrap>
              </div>
            </div>
          </div>

          {/* ── Right Column: Attachments + Vendor Summary ── */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <SectionHeader icon={Paperclip} title="Attachments" optional />

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-colors ${
                  isDragging
                    ? "border-[#C6AF4B] bg-[#C6AF4B]/10"
                    : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"
                }`}
              >
                <Upload size={24} className={isDragging ? "text-[#a8922e]" : "text-gray-400"} />
                <p className="text-xs text-gray-600 mt-2 mb-3">
                  Drag & drop files here or
                </p>
                <label className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors">
                  Choose Files
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-400 mt-2">
                  PDF, JPG, PNG, WEBP (Max 5MB each)
                </p>
              </div>

              {/* Attachment list */}
              {attachments.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      {attachments.length} file{attachments.length !== 1 ? "s" : ""} attached
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {formatBytes(attachments.reduce((s, a) => s + a.file.size, 0))}
                    </p>
                  </div>

                  {/* ── Scrollable grid — 3 rows visible, then scroll ── */}
                  <div className="max-h-[210px] overflow-y-auto pr-1 rounded-lg">
                    <div className="grid grid-cols-4 gap-1.5">
                      {attachments.map((a) => (
                        <div
                          key={a.id}
                          className="relative group rounded-lg border border-gray-200 bg-white aspect-square overflow-hidden shadow-sm"
                        >
                          {a.isImage ? (
                            <img
                              src={a.previewUrl}
                              alt={a.file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-red-50/60 px-1">
                              <FileText size={16} className="text-red-500 mb-0.5" />
                              <span className="text-[7px] text-red-700 font-bold uppercase tracking-wider">
                                PDF
                              </span>
                            </div>
                          )}

                          {/* Filename strip for PDFs */}
                          {!a.isImage && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                              <p className="text-[7px] text-white truncate">{a.file.name}</p>
                            </div>
                          )}

                          {/* Hover actions */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-cyan-900/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => a.isImage ? setPreviewSrc(a.previewUrl) : window.open(a.previewUrl, "_blank") }
                              className="p-1 rounded-full bg-white/90 text-slate-600 hover:bg-white shadow"
                              title={a.isImage ? "Preview" : "Open PDF"}
                            >
                              <ZoomIn size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeAttachment(a.id)}
                              className="p-1 rounded-full bg-white/90 text-red-500 hover:bg-white shadow"
                              title="Remove"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <SectionHeader icon={Building2} title="Vendor Summary" />
              <div className="space-y-2 text-xs">
                {selectedVendor ? (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Vendor Name</span>
                      <span className="font-medium text-cyan-900 text-right">{selectedVendor.brandName}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Contact Person</span>
                      <span className="font-medium text-cyan-900 text-right">{selectedVendor.contactName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium text-cyan-900 text-right break-all">{selectedVendor.email || "N/A"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Phone</span>
                      <span className="font-medium text-cyan-900 text-right">{selectedVendor.contactNo || "N/A"}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-center py-4">Select a vendor to see details</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Purchase Items Table ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <SectionHeader icon={FileText} title="Purchase Items" />
          {errors.items && <p className="text-xs text-red-500 mb-3">{errors.items}</p>}

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-xs text-left min-w-[900px]">
              <thead className="bg-gray-50 text-cyan-900 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">#</th>
                  <th className="px-3 py-3 min-w-[180px]">Product <span className="text-red-500">*</span></th>
                  <th className="px-3 py-3 w-28">Size <span className="text-red-500">*</span></th>
                  <th className="px-3 py-3 w-24">Quantity <span className="text-red-500">*</span></th>
                  <th className="px-3 py-3 w-32">Purchase Rate ({currency.symbol}) <span className="text-red-500">*</span></th>
                  <th className="px-3 py-3 w-44">HSN / GST <span className="text-red-500">*</span></th>
                  <th className="px-3 py-3 w-28 text-right">GST Amount ({currency.symbol})</th>
                  <th className="px-3 py-3 w-28 text-right">Amount ({currency.symbol})</th>
                  <th className="px-3 py-3 w-12 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {form.items.map((item, index) => {
                  const calculated = itemTotals[index];
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 text-center text-gray-400">{index + 1}</td>
                      <td className="px-3 py-2.5">
                        <SearchableSelect
                          value={item.productId}
                          onChange={(v) => handleItemChange(index, "productId", v)}
                          options={productOptions}
                          placeholder={loadingProducts ? "Loading..." : "Select Product"}
                          disabled={loadingProducts}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <SearchableSelect
                          value={item.size}
                          onChange={(v) => handleItemChange(index, "size", v)}
                          options={STANDARD_SIZES}
                          placeholder="Size"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          value={item.quantity || ""}
                          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0) }
                          className={inputRightCls}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          value={item.rate || ""}
                          onChange={(e) =>
                            handleItemChange(index, "rate", parseFloat(e.target.value) || 0)
                          }
                          className={inputRightCls}
                        />
                      </td>

                      <td className="px-3 py-2.5">
                        <SmallSearchSelect
                          value={item.hsnCode}
                          onChange={(v) => handleItemChange(index, "hsnCode", v)}
                          options={hsnOptions}
                          placeholder={loadingHsn ? "Loading..." : "Select HSN"}
                          disabled={loadingHsn}
                        />
                      </td>

                      <td className="px-3 py-2.5 text-right text-gray-500 tabular-nums">
                        {fmt(calculated.gstAmount)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-cyan-900 tabular-nums">
                        {fmt(calculated.amount)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          disabled={form.items.length === 1}
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-dashed border-[#C6AF4B] text-[#8a7a2e] hover:bg-[#C6AF4B]/10 transition-colors font-medium"
          >
            <PlusIcon size={14} /> Add Item
          </button>
        </div>

        {/* ── Bottom Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <SectionHeader icon={Calculator} title="Additional Charges" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <FieldWrap label={`Freight (${currency.symbol})`}>
                <input type="number" value={form.freight || ""} onChange={(e) => setField("freight", parseFloat(e.target.value) || 0)} className={inputRightCls} />
              </FieldWrap>
              <FieldWrap label={`Other Charges (${currency.symbol})`}>
                <input type="number" value={form.otherCharges || ""} onChange={(e) => setField("otherCharges", parseFloat(e.target.value) || 0)} className={inputRightCls} />
              </FieldWrap>
              <FieldWrap label={`Discount (${currency.symbol})`}>
                <input type="number" value={form.discount || ""} onChange={(e) => setField("discount", parseFloat(e.target.value) || 0)} className={inputRightCls} />
              </FieldWrap>
              <FieldWrap label={`Transportation (${currency.symbol})`}>
                <input type="number" value={form.transportation || ""} onChange={(e) => setField("transportation", parseFloat(e.target.value) || 0)} className={inputRightCls} />
              </FieldWrap>
              <FieldWrap label={`Insurance (${currency.symbol})`}>
                <input type="number" value={form.insurance || ""} onChange={(e) => setField("insurance", parseFloat(e.target.value) || 0)} className={inputRightCls} />
              </FieldWrap>
              <FieldWrap label="Remarks">
                <input type="text" value={form.remarks} onChange={(e) => setField("remarks", e.target.value)} placeholder="Enter remarks (optional)" className={inputCls} />
              </FieldWrap>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <SectionHeader icon={Receipt} title="Purchase Summary" />
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-medium text-cyan-900 tabular-nums">{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Discount</span><span className="font-medium text-red-500 tabular-nums">{fmt(form.discount)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Other Charges</span><span className="font-medium text-cyan-900 tabular-nums">{fmt(totalOtherCharges)}</span></div>
              <div className="flex justify-between text-gray-500 border-t border-gray-100 pt-2"><span>Taxable Amount</span><span className="font-medium text-cyan-900 tabular-nums">{fmt(taxableAmount)}</span></div>
              <div className="flex justify-between text-gray-500"><span>GST Amount</span><span className="font-medium text-cyan-900 tabular-nums">{fmt(totalGst)}</span></div>
              <div className="flex justify-between text-gray-500"><span>TDS Amount</span><span className="font-medium text-cyan-900 tabular-nums">{fmt(0)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-3 mt-1 text-sm">
                <span className="font-bold text-cyan-900">Grand Total</span>
                <span className="font-bold text-cyan-900 tabular-nums">{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <SectionHeader icon={CreditCard} title="Payment Details" />
            <div className="space-y-3">
              <FieldWrap label={`Paid Amount (${currency.symbol})`}>
                <input
                  type="number"
                  value={form.paidAmount || ""}
                  onChange={(e) => setField("paidAmount", parseFloat(e.target.value) || 0)}
                  readOnly className={`${inputReadonlyCls} text-right tabular-nums`}
                />
              </FieldWrap>
              <FieldWrap label={`Balance Amount (${currency.symbol})`}>
                <input type="text" value={fmt(balanceAmount)} readOnly className={`${inputReadonlyCls} text-right tabular-nums`} />
              </FieldWrap>
              <FieldWrap label="Payment Status">
                <select
                  value={form.paymentStatus}
                  onChange={(e) => setField("paymentStatus", e.target.value)}
                  className={`${inputCls} appearance-none bg-white`}
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </FieldWrap>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setLocation("/trading/purchase")}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-50 transition-all shadow-sm"
            style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {submitting ? "Saving…" : "Save Purchase"}
          </button>
        </div>
      </div>

      {/* ── Lightbox Preview ── */}
      {previewSrc && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85"
          onClick={() => setPreviewSrc(null)}
        >
          <button
            onClick={() => setPreviewSrc(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 rounded-full p-2"
          >
            <X size={20} />
          </button>
          <img
            src={previewSrc}
            alt="preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </AppLayout>
  );
}