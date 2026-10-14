import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, Loader2,
} from "lucide-react";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

import AppLayout from "@/components/layout/AppLayout";
import SearchBar from "@/components/master/SearchBar";
import MasterTable, { type Column, type TableRow } from "@/components/master/MasterTable";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { SmallSearchSelect } from "@/components/ui/SearchableSelect";

import {
  useTradingPurchaseList,
  useDeleteTradingPurchase,
  type TradingPurchaseRecord,
} from "@/hooks/useTradingPurchases";
import { useVendorList } from "@/hooks/useVendors";
import { useCurrency } from "@/contexts/CurrencyContext";

// ─── Constants ────────────────────────────────────────────────────────────────
type StatusFilter = "all" | "active" | "inactive";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All Payment Status" },
  { value: "Pending", label: "Pending" },
  { value: "Partial", label: "Partial" },
  { value: "Paid", label: "Paid" },
];

function formatDate(val: string | null | undefined) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return String(val);
  }
}

const asPurchase = (r: TableRow) => r as unknown as TradingPurchaseRecord;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TradingPurchase() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { fmt } = useCurrency();

  // ── Auth ──
  const token = localStorage.getItem("zarierp_token");
  const { data: user, isLoading: loadingUser } = useGetMe({ query: { enabled: !!token } as any });
  useEffect(() => {
    if (!token || (!loadingUser && !user)) setLocation("/login");
  }, [token, user, loadingUser, setLocation]);

  const logoutMutation = useLogout();
  const handleLogout = async () => {
    try { await logoutMutation.mutateAsync(); }
    finally {
      localStorage.removeItem("zarierp_token");
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setLocation("/login");
    }
  };

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [vendorId, setVendorId] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ── Modal ──
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ── Data ──
  const { data, isLoading } = useTradingPurchaseList({
    search,
    status,
    vendorId: vendorId ? Number(vendorId) : undefined,
    paymentStatus: paymentStatus || undefined,
    page,
    limit,
  });

  const { data: vendorsData } = useVendorList({
    search: "", status: "all", page: 1, limit: 100,
  });

  const deleteMutation = useDeleteTradingPurchase();

  const vendorOptions = [
    { value: "", label: "All Vendors" },
    ...((vendorsData?.data ?? []).map((v) => ({
      value: String(v.id),
      label: v.brandName,
    }))),
  ];

  const hasFilters =
    !!search ||
    status !== "all" ||
    !!vendorId ||
    !!paymentStatus;

  // ── Handlers ──
  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
      toast({ title: "Purchase deleted" });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setVendorId("");
    setPaymentStatus("");
    setPage(1);
  }

  // ── Table ──
  const rows: TableRow[] = ((data?.data ?? []) as TradingPurchaseRecord[]).map((r, i) => ({
    ...(r as unknown as TableRow),
    _srNo: (page - 1) * limit + i + 1,
  }));

  const columns: Column[] = [
    { key: "_srNo", label: "Sr No", className: "w-14 text-center" },
    {
      key: "purchaseNumber",
      label: "Purchase No.",
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-cyan-900">
          {asPurchase(r).purchaseNumber}
        </span>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (r) => (
        <span className="text-slate-600">
          {asPurchase(r).vendor?.brandName ?? "—"}
        </span>
      ),
    },
    {
      key: "purchaseDate",
      label: "Date",
      render: (r) => (
        <span className="text-gray-500 text-xs whitespace-nowrap">
          {formatDate(asPurchase(r).purchaseDate)}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (r) => (
        <span className="text-gray-500 text-xs whitespace-nowrap">
          {formatDate(asPurchase(r).dueDate)}
        </span>
      ),
    },
    {
      key: "vendorInvoiceNumber",
      label: "Invoice No.",
      render: (r) => (
        <span className="font-mono text-xs text-slate-500">
          {asPurchase(r).vendorInvoiceNumber ?? "—"}
        </span>
      ),
    },
    {
      key: "grandTotal",
      label: "Amount",
      className: "text-right",
      render: (r) => (
        <span className="font-medium text-cyan-900 tabular-nums">
          {fmt(parseFloat(asPurchase(r).grandTotal || "0"))}
        </span>
      ),
    },
    {
      key: "balanceAmount",
      label: "Balance",
      className: "text-right",
      render: (r) => {
        const bal = parseFloat(asPurchase(r).balanceAmount || "0");
        return (
          <span
            className={`font-medium tabular-nums ${
              bal > 0 ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {fmt(bal)}
          </span>
        );
      },
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (r) => {
        const s = asPurchase(r).paymentStatus;
        const cls =
          s === "Paid"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : s === "Partial"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-gray-50 text-gray-600 border-gray-200";
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
            {s}
          </span>
        );
      },
    },
    {
      key: "createdByUser",
      label: "Created By",
      render: (r) => (
        <span className="text-gray-500">
          {asPurchase(r).createdByUser?.username ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (r) => (
        <span className="text-gray-500 text-xs whitespace-nowrap">
          {formatDate(asPurchase(r).createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => {
        const rec = asPurchase(r);
        return (
          <div className="flex gap-2">
            <button
              onClick={() => setLocation(`/trading/purchase/${rec.id}/edit`)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-slate-500 hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setDeleteId(rec.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  if (!user) return null;

  return (
    <AppLayout
      username={user.username}
      role={user.role}
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    >
      <div className="max-w-screen-xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-cyan-900">Trading Purchase</h1>
          </div>
          <button
            onClick={() => setLocation("/trading/purchase/new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
          >
            <Plus size={14} /> New Purchase
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <SearchBar
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search by purchase no, invoice no, PO number…"
            />
          </div>

          <div className="w-52">
            <SmallSearchSelect
              value={vendorId}
              onChange={(v) => { setVendorId(v); setPage(1); }}
              options={vendorOptions}
              placeholder="All Vendors"
              clearable
            />
          </div>

          <div className="w-44">
            <SmallSearchSelect
              value={paymentStatus}
              onChange={(v) => { setPaymentStatus(v); setPage(1); }}
              options={PAYMENT_STATUS_OPTIONS}
              placeholder="All Payment Status"
              clearable={false}
            />
          </div>

          <div className="w-36">
            <SmallSearchSelect
              value={status}
              onChange={(v) => { setStatus(v as StatusFilter); setPage(1); }}
              options={STATUS_OPTIONS}
              placeholder="All Status"
              clearable={false}
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <MasterTable
            columns={columns}
            rows={rows}
            loading={isLoading}
            rowKey={(row) => (row as unknown as { id: number }).id}
            emptyText="No purchase records found. Click 'New Purchase' to create one."
            pagination={{
              page,
              limit,
              total: data?.total ?? 0,
              onPageChange: setPage,
              onLimitChange: (l) => { setLimit(l); setPage(1); },
            }}
          />
        )}

        {/* ── Delete Confirm ── */}
        <ConfirmModal
          open={deleteId !== null}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => { void handleDelete(); }}
          title="Delete Purchase"
          message="Are you sure you want to delete this purchase? This action cannot be undone."
        />
      </div>
    </AppLayout>
  );
}