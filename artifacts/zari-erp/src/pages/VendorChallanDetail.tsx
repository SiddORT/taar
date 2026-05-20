import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, CheckCircle, XCircle, FileText } from "lucide-react";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import TopNavbar from "@/components/layout/TopNavbar";
import { SmallSearchSelect } from "@/components/ui/SearchableSelect";
import { useToast } from "@/hooks/use-toast";

const G = "#C6AF4B";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

const CHALLAN_TYPES = [
  "Material", "Artwork", "Outsource",
  "Toile Artisan", "Pattern Artisan", "Custom Artisan",
  "Packing", "Shipping", "Other Expense",
];

const STATUS_BADGE: Record<string, string> = {
  "Draft":           "bg-gray-100 text-gray-600",
  "Verified":        "bg-blue-100 text-blue-700",
  "Converted to PO": "bg-violet-100 text-violet-700",
  "Converted to PR": "bg-indigo-100 text-indigo-700",
  "Billed":          "bg-amber-100 text-amber-700",
  "Paid":            "bg-green-100 text-green-700",
  "Cancelled":       "bg-red-100 text-red-600",
};

type Vendor = { id: number; brandName: string };

const card        = "bg-white rounded-2xl border border-gray-100 shadow-sm";
const sectionLbl  = "text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3";
const inputCls    = "w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6AF4B]/30 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";
const labelCls    = "text-sm font-medium text-gray-700 block mb-1";

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
  challanType: "",
  referenceOrderId: "",
  description: "",
  quantity: "",
  unit: "",
  rate: "",
  amount: "",
  remarks: "",
});

export default function VendorChallanDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const isNew = !params.id || params.id === "new";
  const numId = isNew ? null : parseInt(params.id, 10);

  const token = localStorage.getItem("zarierp_token");
  const { data: user, isLoading: loadingUser } = useGetMe({ query: { enabled: !!token } as any });
  useEffect(() => { if (!token || (!loadingUser && !user)) setLocation("/login"); }, [token, user, loadingUser, setLocation]);
  const logoutMutation = useLogout();
  const handleLogout = async () => {
    try { await logoutMutation.mutateAsync(); } finally {
      localStorage.removeItem("zarierp_token");
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setLocation("/login");
    }
  };

  const [form, setForm]               = useState(emptyForm());
  const [status, setStatus]           = useState("Draft");
  const [challanNumber, setChallanNumber] = useState<string | null>(null);
  const [linkedPoNumber, setLinkedPoNumber] = useState<string | null>(null);
  const [linkedPrNumber, setLinkedPrNumber] = useState<string | null>(null);
  const [vendors, setVendors]         = useState<Vendor[]>([]);
  const [loading, setLoading]         = useState(!isNew);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [actionLoading, setActionLoading] = useState<"verify" | "cancel" | null>(null);

  function set(k: keyof ReturnType<typeof emptyForm>, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  // Auto-calc amount from qty × rate
  useEffect(() => {
    const qty  = parseFloat(form.quantity);
    const rate = parseFloat(form.rate);
    if (!isNaN(qty) && !isNaN(rate) && form.quantity !== "" && form.rate !== "") {
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
        challanDate:      c.challan_date        ?? "",
        vendorId:         c.vendor_id ? String(c.vendor_id) : "",
        challanType:      c.challan_type        ?? "",
        referenceOrderId: c.reference_order_id  ?? "",
        description:      c.description         ?? "",
        quantity:         c.quantity            ?? "",
        unit:             c.unit                ?? "",
        rate:             c.rate                ?? "",
        amount:           c.amount              ?? "",
        remarks:          c.remarks             ?? "",
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
    if (!form.vendorId)    { setError("Vendor is required");       return; }
    if (!form.challanDate) { setError("Challan date is required"); return; }
    if (!form.challanType) { setError("Challan type is required"); return; }

    setSaving(true);
    const vendorObj = vendors.find(v => String(v.id) === form.vendorId);
    const body = {
      challanDate:      form.challanDate,
      vendorId:         parseInt(form.vendorId, 10),
      vendorName:       vendorObj?.brandName ?? "",
      challanType:      form.challanType,
      referenceOrderId: form.referenceOrderId  || undefined,
      description:      form.description       || undefined,
      quantity:         form.quantity          || undefined,
      unit:             form.unit              || undefined,
      rate:             form.rate              || undefined,
      amount:           form.amount            || undefined,
      remarks:          form.remarks           || undefined,
    };

    const r = isNew
      ? await apiFetch("/api/vendor-challans",           { method: "POST", body: JSON.stringify(body) })
      : await apiFetch(`/api/vendor-challans/${numId}`,  { method: "PUT",  body: JSON.stringify(body) });

    const d = await r.json();
    if (r.ok) {
      toast({ title: isNew ? "Vendor challan created successfully" : "Vendor challan saved successfully" });
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
    if (r.ok) { toast({ title: "Challan verified" }); void fetchChallan(); }
    else setError(d.error ?? "Failed to verify");
    setActionLoading(null);
  }

  async function handleCancel() {
    if (!confirm("Cancel this challan?")) return;
    setActionLoading("cancel");
    const r = await apiFetch(`/api/vendor-challans/${numId}/cancel`, { method: "PATCH" });
    const d = await r.json();
    if (r.ok) { toast({ title: "Challan cancelled" }); void fetchChallan(); }
    else setError(d.error ?? "Failed to cancel");
    setActionLoading(null);
  }

  if (!user) return null;

  if (!isNew && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F6F0" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: G }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8F6F0" }}>
      <TopNavbar
        username={(user as any)?.name ?? (user as any)?.username ?? ""}
        role={(user as any)?.role ?? ""}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
      />

      <div className="py-6 px-6 max-w-screen-xl mx-auto space-y-5">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setLocation("/procurement/vendor-challans")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0">
              <ArrowLeft className="h-4 w-4" />
              Vendor Challans
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {isNew ? "New Challan" : (challanNumber ?? `Challan #${numId}`)}
            </h1>
            {!isNew && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[status] ?? "bg-gray-100 text-gray-600"}`}>
                {status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isNew && status === "Draft" && (
              <button onClick={handleVerify} disabled={!!actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40"
                style={{ borderColor: "#C6AF4B", color: "#a8922e", background: "#fdf8ee" }}>
                {actionLoading === "verify" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Verify
              </button>
            )}
            {!isNew && !["Converted to PO","Converted to PR","Billed","Paid","Cancelled"].includes(status) && (
              <button onClick={handleCancel} disabled={!!actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors disabled:opacity-40">
                {actionLoading === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Cancel Challan
              </button>
            )}
            {canEdit && (
              <button onClick={() => void handleSave()} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                style={{ background: `linear-gradient(135deg, ${G}, #a8922e)` }}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : isNew ? "Create Challan" : "Save Changes"}
              </button>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Linked PO / PR banner */}
        {(linkedPoNumber || linkedPrNumber) && (
          <div className={`${card} px-5 py-3 flex items-center gap-6 text-sm`}>
            <FileText className="h-4 w-4 text-gray-400 shrink-0" />
            {linkedPoNumber && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Linked PO</span>
                <span className="font-mono font-bold text-violet-700">{linkedPoNumber}</span>
              </div>
            )}
            {linkedPrNumber && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Linked PR</span>
                <span className="font-mono font-bold text-indigo-700">{linkedPrNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Section: Challan Details ─────────────────────────────────────── */}
        <div className={`${card} p-5`}>
          <p className={sectionLbl}>Challan Details</p>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className={labelCls}>Challan Date <span className="text-red-500">*</span></label>
              <input type="date" className={inputCls} value={form.challanDate}
                onChange={e => set("challanDate", e.target.value)} disabled={!canEdit} />
            </div>

            <div>
              <label className={labelCls}>Vendor <span className="text-red-500">*</span></label>
              <SmallSearchSelect
                value={form.vendorId}
                onChange={v => set("vendorId", v)}
                options={vendors.map(v => ({ value: String(v.id), label: v.brandName }))}
                placeholder="— Search vendor —"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className={labelCls}>Challan Type <span className="text-red-500">*</span></label>
              <select value={form.challanType} onChange={e => set("challanType", e.target.value)}
                disabled={!canEdit} className={inputCls}>
                <option value="">— Select type —</option>
                {CHALLAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Reference Order <span className="text-xs text-gray-400 font-normal">(optional)</span></label>
              <input className={inputCls} placeholder="e.g. SO-2026-001 or PO number"
                value={form.referenceOrderId} onChange={e => set("referenceOrderId", e.target.value)}
                disabled={!canEdit} />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Description</label>
              <textarea rows={3} className={`${inputCls} resize-none`}
                placeholder="Describe the goods or services…"
                value={form.description} onChange={e => set("description", e.target.value)}
                disabled={!canEdit} />
            </div>

          </div>
        </div>

        {/* ── Section: Quantity & Pricing ──────────────────────────────────── */}
        <div className={`${card} p-5`}>
          <p className={sectionLbl}>Quantity & Pricing</p>
          <p className="text-xs text-gray-400 mb-3 -mt-1">Amount is auto-calculated from Quantity × Rate</p>
          <div className="grid grid-cols-4 gap-4">

            <div>
              <label className={labelCls}>Quantity</label>
              <input type="number" min="0" step="0.001" className={inputCls} placeholder="0.000"
                value={form.quantity} onChange={e => set("quantity", e.target.value)} disabled={!canEdit} />
            </div>

            <div>
              <label className={labelCls}>Unit</label>
              <input className={inputCls} placeholder="pcs / m / kg…"
                value={form.unit} onChange={e => set("unit", e.target.value)} disabled={!canEdit} />
            </div>

            <div>
              <label className={labelCls}>Rate (₹)</label>
              <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                value={form.rate} onChange={e => set("rate", e.target.value)} disabled={!canEdit} />
            </div>

            <div>
              <label className={labelCls}>
                Amount (₹) <span className="text-xs text-gray-400 font-normal">auto-calc</span>
              </label>
              <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                value={form.amount} onChange={e => set("amount", e.target.value)} disabled={!canEdit} />
            </div>

          </div>
        </div>

        {/* ── Section: Remarks ─────────────────────────────────────────────── */}
        <div className={`${card} p-5`}>
          <p className={sectionLbl}>Remarks</p>
          <textarea rows={3} className={`${inputCls} resize-none`}
            placeholder="Any internal notes or remarks…"
            value={form.remarks} onChange={e => set("remarks", e.target.value)} disabled={!canEdit} />
        </div>

        {/* ── Bottom action bar ─────────────────────────────────────────────── */}
        {canEdit && (
          <div className="flex justify-end gap-3 pb-8">
            <button onClick={() => setLocation("/procurement/vendor-challans")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={() => void handleSave()} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all shadow-sm"
              style={{ background: `linear-gradient(135deg, ${G}, #a8922e)` }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : isNew ? "Create Challan" : "Save Changes"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
