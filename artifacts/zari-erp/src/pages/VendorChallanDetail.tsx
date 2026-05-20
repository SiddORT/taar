import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save, Loader2, CheckCircle, XCircle, FileText, Paperclip } from "lucide-react";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

const CHALLAN_TYPES = [
  "Material", "Artwork", "Outsource",
  "Toile Artisan", "Pattern Artisan", "Custom Artisan",
  "Packing", "Shipping", "Other Expense",
];

const STATUS_COLORS: Record<string, string> = {
  "Draft":           "bg-gray-100 text-gray-600 border-gray-200",
  "Verified":        "bg-blue-50 text-blue-700 border-blue-200",
  "Converted to PO": "bg-violet-50 text-violet-700 border-violet-200",
  "Converted to PR": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Billed":          "bg-amber-50 text-amber-700 border-amber-200",
  "Paid":            "bg-green-50 text-green-700 border-green-200",
  "Cancelled":       "bg-red-50 text-red-600 border-red-200",
};

type Vendor = { id: number; brand_name: string };

function authHeaders() {
  const token = localStorage.getItem("zarierp_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function apiFetch(path: string, opts?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...opts, headers: { ...authHeaders(), ...(opts?.headers ?? {}) } });
}

const emptyForm = () => ({
  challanDate: new Date().toISOString().slice(0, 10),
  vendorId: "",
  challanType: "" as string,
  referenceOrderId: "",
  description: "",
  quantity: "",
  unit: "",
  rate: "",
  amount: "",
  remarks: "",
});

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white placeholder-gray-400";

export default function VendorChallanDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isNew = !params.id || params.id === "new";
  const numId = isNew ? null : parseInt(params.id, 10);

  const [form, setForm] = useState(emptyForm());
  const [status, setStatus] = useState("Draft");
  const [challanNumber, setChallanNumber] = useState<string | null>(null);
  const [linkedPoNumber, setLinkedPoNumber] = useState<string | null>(null);
  const [linkedPrNumber, setLinkedPrNumber] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<"verify" | "cancel" | null>(null);

  function set(k: keyof ReturnType<typeof emptyForm>, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  // Auto-calc amount from qty * rate
  useEffect(() => {
    const qty = parseFloat(form.quantity);
    const rate = parseFloat(form.rate);
    if (!isNaN(qty) && !isNaN(rate)) {
      setForm(f => ({ ...f, amount: (qty * rate).toFixed(2) }));
    }
  }, [form.quantity, form.rate]);

  const fetchVendors = useCallback(async () => {
    const r = await apiFetch("/api/vendors/all");
    if (r.ok) { const d = await r.json(); setVendors(d); }
  }, []);

  const fetchChallan = useCallback(async () => {
    if (!numId) return;
    setLoading(true);
    const r = await apiFetch(`/api/vendor-challans/${numId}`);
    if (r.ok) {
      const d = await r.json();
      const c = d.data;
      setForm({
        challanDate: c.challan_date ?? "",
        vendorId: c.vendor_id ? String(c.vendor_id) : "",
        challanType: c.challan_type ?? "",
        referenceOrderId: c.reference_order_id ?? "",
        description: c.description ?? "",
        quantity: c.quantity ?? "",
        unit: c.unit ?? "",
        rate: c.rate ?? "",
        amount: c.amount ?? "",
        remarks: c.remarks ?? "",
      });
      setStatus(c.status ?? "Draft");
      setChallanNumber(c.challan_number ?? null);
      setLinkedPoNumber(c.linked_po_number ?? null);
      setLinkedPrNumber(c.linked_pr_number ?? null);
    }
    setLoading(false);
  }, [numId]);

  useEffect(() => { void fetchVendors(); }, [fetchVendors]);
  useEffect(() => { void fetchChallan(); }, [fetchChallan]);

  const canEdit = isNew || status === "Draft";

  async function handleSave() {
    setError("");
    if (!form.vendorId) { setError("Vendor is required"); return; }
    if (!form.challanDate) { setError("Challan date is required"); return; }
    if (!form.challanType) { setError("Challan type is required"); return; }

    setSaving(true);
    const vendorObj = vendors.find(v => String(v.id) === form.vendorId);
    const body = {
      challanDate: form.challanDate,
      vendorId: parseInt(form.vendorId, 10),
      vendorName: vendorObj?.brand_name ?? "",
      challanType: form.challanType,
      referenceOrderId: form.referenceOrderId || undefined,
      description: form.description || undefined,
      quantity: form.quantity || undefined,
      unit: form.unit || undefined,
      rate: form.rate || undefined,
      amount: form.amount || undefined,
      remarks: form.remarks || undefined,
    };

    const r = isNew
      ? await apiFetch("/api/vendor-challans", { method: "POST", body: JSON.stringify(body) })
      : await apiFetch(`/api/vendor-challans/${numId}`, { method: "PUT", body: JSON.stringify(body) });

    const d = await r.json();
    if (r.ok) {
      if (isNew) setLocation(`/procurement/vendor-challans/${d.data.id}`);
      else void fetchChallan();
    } else {
      setError(d.error ?? "Failed to save");
    }
    setSaving(false);
  }

  async function handleVerify() {
    setActionLoading("verify");
    const r = await apiFetch(`/api/vendor-challans/${numId}/verify`, { method: "PATCH" });
    const d = await r.json();
    if (r.ok) void fetchChallan();
    else setError(d.error ?? "Failed to verify");
    setActionLoading(null);
  }

  async function handleCancel() {
    if (!confirm("Cancel this challan?")) return;
    setActionLoading("cancel");
    const r = await apiFetch(`/api/vendor-challans/${numId}/cancel`, { method: "PATCH" });
    const d = await r.json();
    if (r.ok) void fetchChallan();
    else setError(d.error ?? "Failed to cancel");
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setLocation("/procurement/vendor-challans")}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400">Vendor Challans</span>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-bold font-mono text-gray-900 truncate">
                  {isNew ? "New Challan" : (challanNumber ?? `#${numId}`)}
                </span>
              </div>
              {!isNew && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isNew && status === "Draft" && (
                <button onClick={handleVerify} disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors">
                  {actionLoading === "verify" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Verify
                </button>
              )}
              {!isNew && !["Converted to PO", "Converted to PR", "Billed", "Paid", "Cancelled"].includes(status) && (
                <button onClick={handleCancel} disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors">
                  {actionLoading === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Cancel Challan
                </button>
              )}
              {canEdit && (
                <button onClick={handleSave} disabled={saving}
                  style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving…" : (isNew ? "Create Challan" : "Save Changes")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Linked PO / PR Info */}
        {(linkedPoNumber || linkedPrNumber) && (
          <div className="bg-violet-50 border border-violet-100 rounded-2xl px-5 py-3 flex items-center gap-6 text-sm">
            {linkedPoNumber && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-violet-500 uppercase tracking-wide">Linked PO</span>
                <span className="font-mono font-bold text-violet-700">{linkedPoNumber}</span>
              </div>
            )}
            {linkedPrNumber && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Linked PR</span>
                <span className="font-mono font-bold text-indigo-700">{linkedPrNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Section: Challan Details */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <div className="h-6 w-1 rounded-full bg-gray-900" />
            <div>
              <p className="text-sm font-bold text-gray-900">Challan Details</p>
              <p className="text-xs text-gray-500">Core information about this challan entry</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <Field label="Challan Date *">
              <input type="date" className={inputCls} value={form.challanDate}
                onChange={e => set("challanDate", e.target.value)} disabled={!canEdit} />
            </Field>
            <Field label="Vendor *">
              <select value={form.vendorId} onChange={e => set("vendorId", e.target.value)}
                disabled={!canEdit}
                className={`${inputCls} ${!canEdit ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}>
                <option value="">— Select vendor —</option>
                {vendors.map(v => <option key={v.id} value={String(v.id)}>{v.brand_name}</option>)}
              </select>
            </Field>
            <Field label="Challan Type *">
              <select value={form.challanType} onChange={e => set("challanType", e.target.value)}
                disabled={!canEdit}
                className={`${inputCls} ${!canEdit ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}>
                <option value="">— Select type —</option>
                {CHALLAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Reference Order" hint="Optional — link to a Swatch / Style order">
              <input className={`${inputCls} ${!canEdit ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
                placeholder="e.g. SO-2026-001" value={form.referenceOrderId}
                onChange={e => set("referenceOrderId", e.target.value)} disabled={!canEdit} />
            </Field>
            <div className="col-span-2">
              <Field label="Description">
                <textarea rows={3} className={`${inputCls} resize-none ${!canEdit ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
                  placeholder="Describe the goods or services…" value={form.description}
                  onChange={e => set("description", e.target.value)} disabled={!canEdit} />
              </Field>
            </div>
          </div>
        </div>

        {/* Section: Quantity & Amount */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <div className="h-6 w-1 rounded-full bg-gray-900" />
            <div>
              <p className="text-sm font-bold text-gray-900">Quantity & Pricing</p>
              <p className="text-xs text-gray-500">Amount is auto-calculated from Quantity × Rate</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-4 gap-4">
            <Field label="Quantity">
              <input type="number" min="0" step="0.001" className={`${inputCls} ${!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}`}
                placeholder="0.000" value={form.quantity}
                onChange={e => set("quantity", e.target.value)} disabled={!canEdit} />
            </Field>
            <Field label="Unit">
              <input className={`${inputCls} ${!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}`}
                placeholder="pcs / m / kg…" value={form.unit}
                onChange={e => set("unit", e.target.value)} disabled={!canEdit} />
            </Field>
            <Field label="Rate (₹)">
              <input type="number" min="0" step="0.01" className={`${inputCls} ${!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}`}
                placeholder="0.00" value={form.rate}
                onChange={e => set("rate", e.target.value)} disabled={!canEdit} />
            </Field>
            <Field label="Amount (₹)" hint="Auto-calculated">
              <input type="number" min="0" step="0.01" className={`${inputCls} ${!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}`}
                placeholder="0.00" value={form.amount}
                onChange={e => set("amount", e.target.value)} disabled={!canEdit} />
            </Field>
          </div>
        </div>

        {/* Section: Remarks */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <div className="h-6 w-1 rounded-full bg-gray-900" />
            <div>
              <p className="text-sm font-bold text-gray-900">Remarks</p>
            </div>
          </div>
          <div className="p-5">
            <Field label="Internal Remarks">
              <textarea rows={3} className={`${inputCls} resize-none ${!canEdit ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
                placeholder="Any internal notes or remarks…" value={form.remarks}
                onChange={e => set("remarks", e.target.value)} disabled={!canEdit} />
            </Field>
          </div>
        </div>

        {/* Bottom Save */}
        {canEdit && (
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setLocation("/procurement/vendor-challans")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all shadow-sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : (isNew ? "Create Challan" : "Save Changes")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
