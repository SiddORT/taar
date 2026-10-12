import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  Pencil, Trash2, Plus, FileSpreadsheet, FileDown, FileUp, ChevronDown, Loader2,
  ChevronLeft, ChevronRight, X as XIcon,
} from "lucide-react";
import { useGetMe, useLogout, getGetMeQueryKey, customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

import AppLayout from "@/components/layout/AppLayout";
import SearchBar from "@/components/master/SearchBar";
import MasterTable, { type Column, type TableRow } from "@/components/master/MasterTable";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ImportResultModal, { normalizeImportResult, type NormalizedImportResult } from "@/components/ui/ImportResultModal";
import { SmallSearchSelect } from "@/components/ui/SearchableSelect";

import {
  useTradingProductList,
  useToggleTradingProductStatus,
  useDeleteTradingProduct,
  useImportTradingProducts,
  fetchAllTradingProductsForExport,
  type TradingProductRecord,
  type TradingProductImage,
  type StatusFilter,
} from "@/hooks/useTradingProducts";

import { useAllStyleCategories, type StyleCategoryRecord } from "@/hooks/useStyleCategories";

// ─── Media URL helper (mirrors MediaUploadSection) ────────────────────────────
function mediaUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `/api${url}`;
  return url;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function formatDate(val: string | null | undefined) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return String(val);
  }
}

interface Tags {
  id: number;
  entity_id: number;
  entity_type: string;
  tag: string;
}

const asProduct = (r: TableRow) => r as unknown as TradingProductRecord;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TradingProducts() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  // ── Auth ──
  const token = localStorage.getItem("zarierp_token");
  const { data: user, isLoading: loadingUser } = useGetMe({ query: { enabled: !!token } as any });
  useEffect(() => {
    if (!token || (!loadingUser && !user)) setLocation("/login");
  }, [token, user, loadingUser, setLocation]);

  const logoutMutation = useLogout();
  const handleLogout = async () => {
    try { await logoutMutation.mutateAsync(); } finally {
      localStorage.removeItem("zarierp_token");
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setLocation("/login");
    }
  };

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [tags, setTags] = useState<Tags[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ── Modals ──
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ id: number; isActive: boolean } | null>(null);

  // ── Image Carousel ──
  const [carouselImages, setCarouselImages] = useState<TradingProductImage[]>([]);
  const [carouselIdx, setCarouselIdx] = useState<number | null>(null);
  const openCarousel = (images: TradingProductImage[], idx: number) => {
    setCarouselImages(images);
    setCarouselIdx(idx);
  };
  const closeCarousel = () => setCarouselIdx(null);

  // ── Import/Export ──
  const importRef = useRef<HTMLInputElement>(null);
  const [importDropOpen, setImportDropOpen] = useState(false);
  const [exportDropOpen, setExportDropOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<NormalizedImportResult | null>(null);
  const [importResultOpen, setImportResultOpen] = useState(false);

  // ── Data ──
  const { data, isLoading } = useTradingProductList({
    search,
    status,
    categoryId: filterCategory ? Number(filterCategory) : undefined,
    tag: tagFilter,
    page,
    limit,
  });

  const { data: categoriesData } = useAllStyleCategories();

  const toggleStatus = useToggleTradingProductStatus();
  const deleteMutation = useDeleteTradingProduct();
  const importMutation = useImportTradingProducts();

  const categoryOptions = ((categoriesData ?? []) as StyleCategoryRecord[]).map(c => ({
    value: String(c.id),
    label: c.categoryName,
  }));

  const hasFilters = !!(search || status !== "all" || filterCategory || tagFilter);

  // ── Tags fetch ──
  const fetchTags = (searchString = "") => {
    customFetch(`/api/entity-tags?entityType=trading_product&search=${encodeURIComponent(searchString)}&_t=${Date.now()}`)
      .then((r: unknown) => {
        const fetched = (r as { data: Tags[] }).data ?? [];
        setTags(fetched);
      })
      .catch(() => setTags([]));
  };

  const uniqueTags = Array.from(new Set(tags.map(t => t.tag)));
  const tagOptions = uniqueTags.map(tag => ({ value: tag, label: tag }));

  if (tagFilter && !tags.some(t => t.tag === tagFilter)) {
    tagOptions.unshift({ value: tagFilter, label: tagFilter });
  }

  useEffect(() => { fetchTags(); }, []);

  // ── Handlers ──
  async function handleDelete() {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
    toast({ title: "Product deleted" });
  }

  async function confirmStatusChange() {
    if (!statusConfirm) return;
    await toggleStatus.mutateAsync(statusConfirm.id);
    setStatusConfirm(null);
    toast({ title: "Product status updated successfully." });
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setFilterCategory("");
    setTagFilter("");
    setPage(1);
  }

  // ── Import ──
  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

      if (!raw.length) {
        toast({ title: "No data found in file", variant: "destructive" });
        return;
      }

      // ── Normalize each row: parse colors/sizes/tags strings into arrays ──
      const rows = raw.map((r) => {
        const hasColorsRaw = String(r["Has Colors"] ?? "").trim().toLowerCase();
        const hasSizesRaw = String(r["Has Sizes"] ?? "").trim().toLowerCase();
        const hasColors = hasColorsRaw === "yes" || hasColorsRaw === "true";
        const hasSizes = hasSizesRaw === "yes" || hasSizesRaw === "true";

        // Parse "Red:#C62828, Royal Blue:#1D4ED8" → [{ colorName, hexCode }]
        const colors = hasColors
          ? String(r["Colors"] ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((entry) => {
                const [namePart, hexPart] = entry.split(":").map((x) => x?.trim());
                return {
                  colorName: namePart ?? "",
                  hexCode: hexPart ?? "#000000",
                };
              })
              .filter((c) => c.colorName)
          : [];

        // Parse "S, M, L, XL" → ["S", "M", "L", "XL"]
        const sizes = hasSizes
          ? String(r["Sizes"] ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        // Parse "Silk, Bridal, HandEmbroidered" → ["Silk", "Bridal", "HandEmbroidered"]
        const tags = String(r["Tags"] ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        return {
          "Product Name": String(r["Product Name"] ?? "").trim(),
          "Category": String(r["Category"] ?? "").trim(),
          "Description": String(r["Description"] ?? "").trim(),
          "HSN Code": String(r["HSN Code"] ?? "").trim(),
          "GST %": String(r["GST %"] ?? "").trim(),
          "Tags": tags,
          "Has Colors": hasColors,
          "Colors": colors,
          "Has Sizes": hasSizes,
          "Sizes": sizes,
          "Is Active": String(r["Is Active"] ?? "Active").trim(),
        };
      });

      const importRaw = await importMutation.mutateAsync(rows);
      setImportResult(normalizeImportResult(importRaw));
      setImportResultOpen(true);
    } catch (err) {
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
    setImportDropOpen(false);
  }

  function downloadSample() {
    const sample = [
      {
        "Product Name": "Silk Embroidered Gown",
        "Category": "Gown",
        "Description": "Hand-embroidered silk gown with zari work.",
        "HSN Code": "540710",
        "GST %": "18",
        "Tags": "Silk, Bridal, HandEmbroidered",
        "Has Colors": "Yes",
        "Colors": "Red:#C62828, Royal Blue:#1D4ED8, Ivory:#FFFFF0",
        "Has Sizes": "Yes",
        "Sizes": "S, M, L, XL",
        "Is Active": "Active",
      },
      {
        "Product Name": "Cotton Casual Shirt",
        "Category": "Shirt",
        "Description": "Regular-fit cotton shirt.",
        "HSN Code": "620342",
        "GST %": "12",
        "Tags": "Cotton, Casual",
        "Has Colors": "Yes",
        "Colors": "White:#FFFFFF, Navy Blue:#1E1B4B",
        "Has Sizes": "Yes",
        "Sizes": "M, L, XXL",
        "Is Active": "Active",
      },
      {
        "Product Name": "Silk Scarf",
        "Category": "Ethnic Wear",
        "Description": "Printed silk scarf.",
        "HSN Code": "540710",
        "GST %": "18",
        "Tags": "Silk, Accessory",
        "Has Colors": "No",
        "Colors": "",
        "Has Sizes": "No",
        "Sizes": "",
        "Is Active": "Active",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sample);

    // Widen columns for readability
    ws["!cols"] = [
      { wch: 28 }, // Product Name
      { wch: 15 }, // Category
      { wch: 40 }, // Description
      { wch: 12 }, // HSN Code
      { wch: 8 },  // GST %
      { wch: 25 }, // Tags
      { wch: 12 }, // Has Colors
      { wch: 45 }, // Colors
      { wch: 12 }, // Has Sizes
      { wch: 20 }, // Sizes
      { wch: 10 }, // Is Active
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "product_import_sample.xlsx");
    setImportDropOpen(false);
  }

  async function handleExportAll() {
    setExporting(true);
    setExportDropOpen(false);
    try {
      const rows = await fetchAllTradingProductsForExport(
        search,
        status,
        filterCategory ? Number(filterCategory) : undefined
      );
      const sheet = rows.map(r => ({
        "Product Code": r.productCode,
        "Product Name": r.productName,
        "Category": r.categoryName ?? "",
        "Description": r.description ?? "",
        "HSN Code": r.hsnCode ?? "",
        "GST %": r.gstPercentage ?? "",
        "Tags": (r.tags ?? []).join(", "),
        "Status": r.isActive ? "Active" : "Inactive",
        "Created By": r.createdBy,
        "Created At": formatDate(r.createdAt),
      }));
      const ws = XLSX.utils.json_to_sheet(sheet);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, `trading_products_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }

  // ── Table ──
  const rows: TableRow[] = ((data?.data ?? []) as TradingProductRecord[]).map((r, i) => ({
    ...(r as unknown as TableRow),
    _srNo: (page - 1) * limit + i + 1,
  }));

  const columns: Column[] = [
    { key: "_srNo", label: "Sr No", className: "w-14 text-center" },
    {
      key: "productImage",
      label: "Image",
      className: "w-14",
      render: r => {
        const imgs = asProduct(r).images ?? [];
        if (!imgs.length) {
          return (
            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18a.75.75 0 00.75-.75V5.25A.75.75 0 0021 4.5H3A.75.75 0 002.25 5.25v14.25c0 .414.336.75.75.75zM12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
          );
        }
        return (
          <button
            type="button"
            onClick={() => openCarousel(imgs, 0)}
            className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 hover:border-[#C6AF4B] transition-colors relative group"
          >
            <img src={mediaUrl(imgs[0].imagePath)} alt="" className="w-full h-full object-cover" />
            {imgs.length > 1 && (
              <span className="absolute bottom-0 right-0 text-[9px] font-bold bg-black/60 text-white px-0.5 rounded-tl-md">
                +{imgs.length - 1}
              </span>
            )}
          </button>
        );
      },
    },
    {
      key: "productCode",
      label: "Product Code",
      render: r => <span className="font-mono text-xs font-semibold text-slate-500">{asProduct(r).productCode}</span>,
    },
    { key: "productName", label: "Product Name", render: r => <span className="text-cyan-900 font-medium">{asProduct(r).productName}</span> },
    { key: "categoryName", label: "Category", render: r => <span className="text-slate-500">{asProduct(r).categoryName || "—"}</span> },
    {
      key: "description",
      label: "Description",
      render: r => (
        <span className="truncate max-w-[200px] block text-slate-500" title={asProduct(r).description ?? ""}>
          {asProduct(r).description || "—"}
        </span>
      ),
    },
    { key: "hsnCode", label: "HSN Code", render: r => <span className="font-mono text-slate-500">{asProduct(r).hsnCode || "—"}</span> },
    {
      key: "gstPercentage",
      label: "GST %",
      render: r => <span>{asProduct(r).gstPercentage ? `${asProduct(r).gstPercentage}%` : "—"}</span>,
    },
    {
      key: "isActive",
      label: "Status",
      render: r => {
        const rec = asProduct(r);
        return (
          <button
            type="button"
            onClick={() => setStatusConfirm({ id: rec.id, isActive: rec.isActive })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${rec.isActive ? "bg-cyan-900" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${rec.isActive ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        );
      },
    },
    { key: "createdBy", label: "Created By", render: r => <span className="text-gray-500">{asProduct(r).createdBy ?? "—"}</span> },
    {
      key: "createdAt",
      label: "Created At",
      render: r => <span className="text-gray-500 text-xs whitespace-nowrap">{formatDate(asProduct(r).createdAt)}</span>,
    },
    {
      key: "updatedBy",
      label: "Updated By",
      render: r => <span className="text-gray-500">{asProduct(r).updatedBy ?? "—"}</span>,
    },
    {
      key: "updatedAt",
      label: "Updated At",
      render: r => <span className="text-gray-500 text-xs whitespace-nowrap">{asProduct(r).updatedAt ? formatDate(asProduct(r).updatedAt) : "—"}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: r => {
        const rec = asProduct(r);
        return (
          <div className="flex gap-2">
            <button
              onClick={() => setLocation(`/trading/products/${rec.id}/edit`)}
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
            <h1 className="text-xl font-semibold text-cyan-900">Product Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{data?.total ?? 0} products</p>
          </div>
          <div className="flex items-center gap-2">

            {/* Import Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setImportDropOpen(o => !o); setExportDropOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[#C9B45C]/50 bg-white text-slate-500 hover:border-[#C9B45C] hover:bg-amber-50/40 transition"
              >
                <FileSpreadsheet size={15} className="text-[#C9B45C]" /> Import
                <ChevronDown size={13} className="text-gray-400" />
              </button>
              {importDropOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-30 overflow-hidden">
                  <button
                    onClick={downloadSample}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-500 hover:bg-gray-50"
                  >
                    <FileDown size={14} className="text-gray-400" /> Download Sample
                  </button>
                  <label className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-500 hover:bg-gray-50 cursor-pointer">
                    <FileUp size={14} className="text-gray-400" /> Upload Excel
                    <input
                      ref={importRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleImportFile}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setExportDropOpen(o => !o); setImportDropOpen(false); }}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[#C9B45C]/50 bg-white text-slate-500 hover:border-[#C9B45C] hover:bg-amber-50/40 transition disabled:opacity-50"
              >
                {exporting
                  ? <Loader2 size={15} className="animate-spin text-[#C9B45C]" />
                  : <FileDown size={15} className="text-[#C9B45C]" />}
                Export <ChevronDown size={13} className="text-gray-400" />
              </button>
              {exportDropOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-30 overflow-hidden">
                  <button
                    onClick={handleExportAll}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-500 hover:bg-gray-50"
                  >
                    <FileDown size={14} className="text-gray-400" /> Export as Excel
                  </button>
                </div>
              )}
            </div>

            {/* Add Product */}
            <button
              onClick={() => setLocation("/trading/products/new")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
            >
              <Plus size={14} /> Add Product
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <SearchBar
              value={search}
              onChange={v => { setSearch(v); setPage(1); }}
              placeholder="Search products…"
            />
          </div>

          <div className="w-44">
            <SmallSearchSelect
              value={filterCategory}
              onChange={v => { setFilterCategory(v); setPage(1); }}
              options={[{ value: "", label: "All Categories" }, ...categoryOptions]}
              placeholder="All Categories"
              clearable={false}
            />
          </div>

          <div className="w-44">
            <SmallSearchSelect
              options={tagOptions}
              value={tagFilter}
              onSearch={fetchTags}
              onChange={(value) => {
                setTagFilter(value);
                setPage(1);
                fetchTags("");
              }}
              placeholder="All Tags"
            />
          </div>

          <div className="w-36">
            <SmallSearchSelect
              value={status}
              onChange={v => { setStatus(v as StatusFilter); setPage(1); }}
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
        <MasterTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          rowKey={row => (row as unknown as { id: number }).id}
          pagination={{
            page,
            limit,
            total: data?.total ?? 0,
            onPageChange: setPage,
            onLimitChange: l => { setLimit(l); setPage(1); },
          }}
        />

        {/* ── Modals ── */}
        <ConfirmModal
          open={deleteId !== null}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => { void handleDelete(); }}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
        />

        <ConfirmModal
          open={statusConfirm !== null}
          onCancel={() => setStatusConfirm(null)}
          onConfirm={() => { void confirmStatusChange(); }}
          title={statusConfirm?.isActive ? "Deactivate Product" : "Activate Product"}
          message={statusConfirm?.isActive
            ? "Are you sure you want to deactivate this product?"
            : "Are you sure you want to activate this product?"}
        />

        <ImportResultModal
          open={importResultOpen}
          result={importResult}
          entityName="Products"
          onClose={() => setImportResultOpen(false)}
        />

        {/* Close dropdowns on outside click */}
        {(importDropOpen || exportDropOpen) && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => { setImportDropOpen(false); setExportDropOpen(false); }}
          />
        )}

        {/* ══ Image Carousel Lightbox ══ */}
        {carouselIdx !== null && carouselImages.length > 0 && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
            onClick={closeCarousel}
          >
            <div
              className="relative flex items-center gap-3 max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev */}
              <button
                onClick={() => setCarouselIdx((i) => ((i ?? 0) - 1 + carouselImages.length) % carouselImages.length)}
                className="shrink-0 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors text-white disabled:opacity-30"
                disabled={carouselImages.length <= 1}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Image + dots + counter */}
              <div className="flex-1 flex flex-col items-center gap-3">
                <img
                  src={mediaUrl(carouselImages[carouselIdx]?.imagePath)}
                  alt={carouselImages[carouselIdx]?.originalName ?? ""}
                  className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain"
                />
                {carouselImages.length > 1 && (
                  <div className="flex gap-1.5">
                    {carouselImages.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setCarouselIdx(dotIdx)}
                        className={`w-2 h-2 rounded-full transition-colors ${dotIdx === carouselIdx ? "bg-white" : "bg-white/40 hover:bg-white/70"}`}
                      />
                    ))}
                  </div>
                )}
                <p className="text-white/60 text-xs">
                  {carouselIdx + 1} / {carouselImages.length}
                </p>
              </div>

              {/* Next */}
              <button
                onClick={() => setCarouselIdx((i) => ((i ?? 0) + 1) % carouselImages.length)}
                className="shrink-0 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors text-white disabled:opacity-30"
                disabled={carouselImages.length <= 1}
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Close */}
              <button
                onClick={closeCarousel}
                className="absolute -top-10 right-0 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}