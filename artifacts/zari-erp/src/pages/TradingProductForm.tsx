import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Loader2, X, Upload, ZoomIn, FileText, Receipt, Image as ImageIcon,
  Palette, Ruler, Save, Plus as PlusIcon,
} from "lucide-react";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

import AppLayout from "@/components/layout/AppLayout";
import SearchableSelect from "@/components/ui/SearchableSelect";
import TagInput from "@/components/ui/TagInput";
import InputField from "@/components/ui/InputField";

import { useStyleCategoryList } from "@/hooks/useStyleCategories";
import { useHSNList } from "@/hooks/useHSN";
import {
  useCreateTradingProduct,
  useUpdateTradingProduct,
  useTradingProduct,
  type TradingProductImage,
} from "@/hooks/useTradingProducts";

// ─── Constants ────────────────────────────────────────────────────────────────
const NAME_REGEX = /^[A-Za-z]+( [A-Za-z]+)*$/;

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

const NAMED_COLORS = [
  { name: "Black", r: 0, g: 0, b: 0 }, { name: "White", r: 255, g: 255, b: 255 },
  { name: "Red", r: 220, g: 38, b: 38 }, { name: "Dark Red", r: 139, g: 0, b: 0 },
  { name: "Crimson", r: 185, g: 28, b: 28 }, { name: "Rose", r: 244, g: 63, b: 94 },
  { name: "Pink", r: 236, g: 72, b: 153 }, { name: "Hot Pink", r: 255, g: 105, b: 180 },
  { name: "Magenta", r: 217, g: 70, b: 239 }, { name: "Purple", r: 147, g: 51, b: 234 },
  { name: "Deep Purple", r: 88, g: 28, b: 135 }, { name: "Indigo", r: 67, g: 56, b: 202 },
  { name: "Navy Blue", r: 30, g: 27, b: 75 }, { name: "Blue", r: 37, g: 99, b: 235 },
  { name: "Royal Blue", r: 29, g: 78, b: 216 }, { name: "Sky Blue", r: 56, g: 189, b: 248 },
  { name: "Cyan", r: 6, g: 182, b: 212 }, { name: "Teal", r: 13, g: 148, b: 136 },
  { name: "Emerald", r: 16, g: 185, b: 129 }, { name: "Green", r: 22, g: 163, b: 74 },
  { name: "Dark Green", r: 20, g: 83, b: 45 }, { name: "Lime", r: 132, g: 204, b: 22 },
  { name: "Yellow Green", r: 101, g: 163, b: 13 }, { name: "Yellow", r: 234, g: 179, b: 8 },
  { name: "Amber", r: 245, g: 158, b: 11 }, { name: "Orange", r: 249, g: 115, b: 22 },
  { name: "Dark Orange", r: 194, g: 65, b: 12 }, { name: "Brown", r: 120, g: 53, b: 15 },
  { name: "Chocolate", r: 92, g: 45, b: 10 }, { name: "Tan", r: 210, g: 180, b: 140 },
  { name: "Beige", r: 245, g: 245, b: 220 }, { name: "Ivory", r: 255, g: 255, b: 240 },
  { name: "Cream", r: 255, g: 253, b: 208 }, { name: "Gold", r: 198, g: 175, b: 75 },
  { name: "Silver", r: 192, g: 192, b: 192 }, { name: "Gray", r: 107, g: 114, b: 128 },
  { name: "Light Gray", r: 209, g: 213, b: 219 }, { name: "Dark Gray", r: 55, g: 65, b: 81 },
  { name: "Charcoal", r: 30, g: 41, b: 59 }, { name: "Slate", r: 71, g: 85, b: 105 },
  { name: "Turquoise", r: 45, g: 212, b: 191 }, { name: "Lavender", r: 167, g: 139, b: 250 },
  { name: "Violet", r: 124, g: 58, b: 237 }, { name: "Maroon", r: 128, g: 0, b: 0 },
  { name: "Coral", r: 249, g: 115, b: 22 }, { name: "Salmon", r: 252, g: 165, b: 165 },
  { name: "Peach", r: 253, g: 186, b: 116 }, { name: "Mint", r: 167, g: 243, b: 208 },
  { name: "Olive", r: 107, g: 114, b: 0 }, { name: "Khaki", r: 189, g: 183, b: 107 },
];

function hexToColorName(hex: string): string {
  if (!hex || hex.length < 7) return "";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  let closest = ""; let minDist = Infinity;
  for (const c of NAMED_COLORS) {
    const d = (r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2;
    if (d < minDist) { minDist = d; closest = c.name; }
  }
  return closest;
}

function mediaUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `/api${url}`;
  return url;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type FormErrors = Partial<Record<string, string>>;
type PendingMedia = { id: string; file: File; previewUrl: string };

interface ColorOption {
  id: string;
  hexCode: string;
  colorName: string;
}

interface FormState {
  productCode: string;
  productName: string;
  category: string;
  status: "Active" | "Inactive";
  tags: string[];
  description: string;
  hsnCode: string;
  gstPercentage: string;
  hasColors: boolean;
  colors: ColorOption[];
  hasSizes: boolean;
  sizes: string[];
}

const EMPTY_FORM: FormState = {
  productCode: "",
  productName: "",
  category: "",
  status: "Active",
  tags: [],
  description: "",
  hsnCode: "",
  gstPercentage: "",
  hasColors: false,
  colors: [],
  hasSizes: false,
  sizes: [],
};

// ─── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 rounded-full p-2">
        <X size={20} />
      </button>
      <img src={mediaUrl(src)} alt="preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-cyan-900" />
      <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">{title}</h3>
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function FieldWrap({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-500 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${checked ? "bg-cyan-900" : "bg-gray-300"}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function TradingProductForm() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const isNew = !params.id;
  const numId = isNew ? null : Number(params.id);

  // Auth
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

  // State
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [pendingImages, setPendingImages] = useState<PendingMedia[]>([]);
  const [existingImages, setExistingImages] = useState<TradingProductImage[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [populated, setPopulated] = useState(false);

  // API queries
  const { data: categoriesData, isLoading: loadingCategories } = useStyleCategoryList({
    search: "", status: "all", page: 1, limit: 100,
  });

  const { data: hsnData, isLoading: loadingHsn } = useHSNList({
    search: "", status: "all", page: 1, limit: 100,
  });

  const { data: existing, isLoading: loadingRecord } = useTradingProduct(numId);

  // Mutations
  const createMutation = useCreateTradingProduct();
  const updateMutation = useUpdateTradingProduct();

  // Derived options
  const categoryOptions = (categoriesData?.data ?? []).map(c => c.categoryName);
  const hsnOptions = (hsnData?.data ?? []).map(h => ({
    value: h.hsnCode,
    label: `${h.hsnCode} - ${h.govtDescription}`,
    gst: h.gstPercentage,
  }));

  // Hydrate on edit
  useEffect(() => {
    if (existing && !isNew && !populated) {
      const existingRecord = existing as unknown as {
        categoryName?: string; isActive: boolean; tags?: string[];
        hasColors?: boolean; colors?: ColorOption[];
        hasSizes?: boolean; sizes?: string[];
      };
      setForm({
        productCode: existing.productCode ?? "",
        productName: existing.productName ?? "",
        category: existing.categoryName ?? "",
        status: existing.isActive ? "Active" : "Inactive",
        tags: existing.tags ?? [],
        description: existing.description ?? "",
        hsnCode: existing.hsnCode ?? "",
        gstPercentage: existing.gstPercentage ?? "",
        hasColors: existingRecord.hasColors ?? false,
        colors: existingRecord.colors ?? [],
        hasSizes: existingRecord.hasSizes ?? false,
        sizes: existingRecord.sizes ?? [],
      });
      setCategoryId(existing.category ?? null);
      setExistingImages(existing.images ?? []);
      setPopulated(true);
    }
  }, [existing, isNew, populated]);

  // Handlers
  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const handleCategoryChange = (v: string) => {
    setField("category", v);
    const cat = categoriesData?.data.find(c => c.categoryName === v);
    setCategoryId(cat ? cat.id : null);
    if (errors.category) setErrors(e => { const n = { ...e }; delete n.category; return n; });
  };

  const handleHsnChange = (hsnCode: string) => {
    const selectedHsn = hsnData?.data.find(h => h.hsnCode === hsnCode);
    setForm(f => ({
      ...f,
      hsnCode,
      gstPercentage: selectedHsn ? selectedHsn.gstPercentage : "",
    }));
    if (errors.hsnCode) setErrors(e => { const n = { ...e }; delete n.hsnCode; return n; });
  };

  // ── Colors handlers ──
  const addColor = () => {
    setForm(f => ({
      ...f,
      colors: [...f.colors, { id: Math.random().toString(36).slice(2), hexCode: "#c9b45c", colorName: "" }],
    }));
  };

  const updateColor = (id: string, patch: Partial<ColorOption>) => {
    setForm(f => ({
      ...f,
      colors: f.colors.map(c => c.id === id ? { ...c, ...patch } : c),
    }));
  };

  const removeColor = (id: string) => {
    setForm(f => ({ ...f, colors: f.colors.filter(c => c.id !== id) }));
  };

  // ── Sizes handlers ──
  const toggleSize = (size: string) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter(s => s !== size)
        : [...f.sizes, size],
    }));
  };

  // ── Images handlers ──
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newItems: PendingMedia[] = files.map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));

    setPendingImages(prev => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removePendingImage = (id: string) => {
    setPendingImages(prev => {
      const item = prev.find(x => x.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(x => x.id !== id);
    });
  };

  const removeExistingImage = (imagePath: string) => {
    setExistingImages(prev => prev.filter(img => img.imagePath !== imagePath));
  };

  const validate = () => {
    const e: FormErrors = {};
    if (!form.productName.trim()) e.productName = "Product Name is required.";
    if (!categoryId) e.category = "Category is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.hsnCode) e.hsnCode = "HSN Code / GST is required.";

    if (form.hasColors) {
      if (form.colors.length === 0) e.colors = "Add at least one color or turn off the Colors toggle.";
      form.colors.forEach((c, i) => {
        if (!c.colorName.trim()) e[`color_${i}`] = "Color name is required.";
        else if (!NAME_REGEX.test(c.colorName.trim())) e[`color_${i}`] = "Only letters and spaces allowed.";
      });
    }
    if (form.hasSizes && form.sizes.length === 0) {
      e.sizes = "Select at least one size or turn off the Sizes toggle.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !categoryId) return;

    const payload = {
      productName: form.productName.trim(),
      category: categoryId,
      description: form.description.trim(),
      hsnCode: form.hsnCode,
      gstPercentage: form.gstPercentage,
      tags: form.tags,
      isActive: form.status === "Active",
      hasColors: form.hasColors,
      colors: form.hasColors ? form.colors.map(c => ({ hexCode: c.hexCode, colorName: c.colorName.trim() })) : [],
      hasSizes: form.hasSizes,
      sizes: form.hasSizes ? form.sizes : [],
    };

    try {
      if (isNew) {
        await createMutation.mutateAsync({
          data: payload as any,
          images: pendingImages.map(p => p.file),
        });
        toast({ title: "Product created successfully." });
      } else if (numId) {
        await updateMutation.mutateAsync({
          id: numId,
          data: payload as any,
          existingImages,
          newImages: pendingImages.map(p => p.file),
        });
        toast({ title: "Product updated successfully." });
      }
      setLocation("/trading/products");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save",
        variant: "destructive",
      });
    }
  };

  const submitting = createMutation.isPending || updateMutation.isPending;

  if (!user) return null;

  if (!isNew && loadingRecord) {
    return (
      <AppLayout username={user.username} role={user.role} onLogout={handleLogout} isLoggingOut={logoutMutation.isPending}>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-400" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout username={user.username} role={user.role} onLogout={handleLogout} isLoggingOut={logoutMutation.isPending}>
      <div className="max-w-screen-xl mx-auto space-y-5">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/trading/products")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Product Management
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-bold text-cyan-900">
              {isNew ? "Add Product" : `Edit Product — ${form.productCode}`}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {submitting ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/60 rounded-t-2xl">
            <p className="text-xs text-gray-500">
              Fields marked <span className="text-red-500">*</span> are required
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ── Left: Fields (2/3) ── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Basic Info */}
                <div>
                  <SectionHeader icon={FileText} title="Basic Information" />
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">

                    <FieldWrap label="Product Code" required>
                      <input
                        type="text"
                        value={form.productCode || (isNew ? "(auto-generated)" : "")}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 focus:outline-none"
                      />
                      {isNew && <p className="text-xs text-gray-400 mt-1">Auto-generated by system</p>}
                    </FieldWrap>

                    <FieldWrap label="Product Name" required error={errors.productName}>
                      <input
                        type="text"
                        value={form.productName}
                        onChange={e => setField("productName", e.target.value)}
                        placeholder="Enter product name"
                        maxLength={200}
                        className={`w-full border rounded-lg px-3 py-2 text-sm text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-900 ${errors.productName ? "border-red-400" : "border-gray-300"}`}
                      />
                    </FieldWrap>

                    <FieldWrap label="Category" required error={errors.category}>
                      <SearchableSelect
                        value={form.category}
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                        placeholder="Select category"
                        clearable
                        disabled={loadingCategories}
                      />
                    </FieldWrap>

                    <FieldWrap label="Status" required>
                      <div className="relative">
                        <select
                          value={form.status}
                          onChange={e => setField("status", e.target.value as "Active" | "Inactive")}
                          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm text-cyan-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-900"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </FieldWrap>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-500 mb-1">Tags</label>
                      <TagInput
                        value={form.tags}
                        onChange={tags => setField("tags", tags)}
                        placeholder="Add a tag..."
                      />
                    </div>

                    <div className="col-span-2">
                      <FieldWrap label="Description" required error={errors.description}>
                        <div className="relative">
                          <textarea
                            value={form.description}
                            onChange={e => setField("description", e.target.value.slice(0, 500))}
                            placeholder="Enter product description..."
                            rows={5}
                            className={`w-full border rounded-lg px-3 py-3 text-sm text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-900 resize-none ${errors.description ? "border-red-400" : "border-gray-300"}`}
                          />
                          <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                            {form.description.length}/500
                          </span>
                        </div>
                      </FieldWrap>
                    </div>

                  </div>
                </div>

                {/* Variants — Colors & Sizes */}
                <div>
                  <SectionHeader icon={Palette} title="Variants" />

                  {/* Colors block */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                    <ToggleSwitch
                      checked={form.hasColors}
                      onChange={v => setField("hasColors", v)}
                      label="Available in Colors"
                      hint="Enable to add color variants with hex codes"
                    />

                    {form.hasColors && (
                      <div className="mt-4 space-y-3">
                        {form.colors.length === 0 && (
                          <div className="border-2 border-dashed border-gray-200 rounded-xl py-6 text-center">
                            <p className="text-xs text-gray-400">No colors added yet. Click "Add Color" below.</p>
                          </div>
                        )}

                        {form.colors.map((c, idx) => (
                          <div key={c.id} className="flex items-end gap-2">
                            <div className="flex flex-col gap-1 shrink-0">
                              <label className="text-xs font-medium text-slate-500">Picker</label>
                              <input
                                type="color"
                                value={c.hexCode || "#c9b45c"}
                                onChange={e => {
                                  const name = hexToColorName(e.target.value);
                                  updateColor(c.id, { hexCode: e.target.value, colorName: name });
                                }}
                                className="h-[42px] w-14 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium text-slate-500">Hex Code</label>
                              <input
                                type="text"
                                value={c.hexCode}
                                readOnly
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium text-slate-500">Color Name<span className="text-red-500 ml-0.5">*</span></label>
                              <input
                                type="text"
                                value={c.colorName}
                                maxLength={50}
                                onChange={e => updateColor(c.id, { colorName: e.target.value.replace(/[^A-Za-z ]/g, "") })}
                                placeholder="e.g. Royal Blue"
                                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-cyan-900 outline-none focus:border-cyan-900 focus:ring-2 focus:ring-cyan-900/10 ${errors[`color_${idx}`] ? "border-red-400 bg-red-50/30" : "border-gray-300 bg-white"}`}
                              />
                              {errors[`color_${idx}`] && <p className="text-xs text-red-500 mt-1">{errors[`color_${idx}`]}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeColor(c.id)}
                              className="p-2.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                              title="Remove color"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addColor}
                          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-dashed border-[#C6AF4B] text-[#8a7a2e] hover:bg-[#C6AF4B]/10 transition-colors"
                        >
                          <PlusIcon size={13} /> Add Color
                        </button>
                        {errors.colors && <p className="text-xs text-red-500">{errors.colors}</p>}
                      </div>
                    )}
                  </div>

                  {/* Sizes block */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <ToggleSwitch
                      checked={form.hasSizes}
                      onChange={v => setField("hasSizes", v)}
                      label="Available in Sizes"
                      hint="Enable to select available sizes"
                    />

                    {form.hasSizes && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {STANDARD_SIZES.map(size => {
                            const checked = form.sizes.includes(size);
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => toggleSize(size)}
                                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                  checked
                                    ? "border-cyan-900 bg-cyan-900 text-white"
                                    : "border-gray-200 bg-white text-slate-500 hover:border-cyan-900/40 hover:bg-gray-50"
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                        {errors.sizes && <p className="text-xs text-red-500 mt-2">{errors.sizes}</p>}
                        {form.sizes.length > 0 && (
                          <p className="text-xs text-gray-400 mt-3">
                            Selected: <span className="font-medium text-cyan-900">{form.sizes.join(", ")}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tax Information */}
                <div>
                  <SectionHeader icon={Receipt} title="Tax Information" />
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">

                    <FieldWrap label="GST % (via HSN Code)" required error={errors.hsnCode}>
                      <SearchableSelect
                        value={form.hsnCode}
                        onChange={handleHsnChange}
                        options={hsnOptions.map(o => o.value)}
                        placeholder="Select HSN Code"
                        clearable
                        disabled={loadingHsn}
                      />
                    </FieldWrap>

                    {form.gstPercentage && (
                      <div className="flex items-end pb-1">
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 w-full">
                          Applicable GST: <strong className="text-cyan-900">{form.gstPercentage}%</strong>
                        </span>
                      </div>
                    )}

                  </div>
                </div>

              </div>

              {/* ── Right: Images (1/3) ── */}
              <div className="space-y-6">
                <div>
                  <SectionHeader icon={ImageIcon} title="Product Images" />

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <Upload size={32} className="text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-4">Drag & drop images here or</p>
                    <label className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors">
                      Choose Files
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-4">Supported: JPG, PNG, WEBP (Max 5MB each)</p>
                  </div>

                  {existingImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">Existing images</p>
                      <div className="grid grid-cols-4 gap-2">
                        {existingImages.map((img, index) => (
                          <div key={img.imagePath} className="relative group rounded-lg border border-gray-200 bg-white aspect-square overflow-hidden shadow-sm">
                            <img src={mediaUrl(img.imagePath)} alt={img.originalName ?? ""} className="w-full h-full object-cover" />
                            {index === 0 && (
                              <span className="absolute top-0.5 left-0.5 text-[8px] bg-cyan-900 text-white rounded px-1 leading-tight py-0.5 font-bold">
                                Primary
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-cyan-900/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => setPreviewSrc(img.imagePath)}
                                className="p-1 rounded-full bg-white/90 text-slate-500 hover:bg-white shadow"
                              >
                                <ZoomIn size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(img.imagePath)}
                                className="p-1 rounded-full bg-white/90 text-red-500 hover:bg-white shadow"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pendingImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">New uploads</p>
                      <div className="grid grid-cols-4 gap-2">
                        {pendingImages.map((img) => (
                          <div key={img.id} className="relative group rounded-lg border border-amber-200 bg-amber-50 aspect-square overflow-hidden shadow-sm">
                            <img src={mediaUrl(img.previewUrl)} alt={img.file.name ?? ""} className="w-full h-full object-cover" />
                            <span className="absolute top-0.5 right-0.5 text-[8px] bg-amber-500 text-white rounded px-1 leading-tight py-0.5">
                              new
                            </span>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-cyan-900/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => setPreviewSrc(img.previewUrl)}
                                className="p-1 rounded-full bg-white/90 text-slate-500 hover:bg-white shadow"
                              >
                                <ZoomIn size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removePendingImage(img.id)}
                                className="p-1 rounded-full bg-white/90 text-red-500 hover:bg-white shadow"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── Footer Actions ── */}
          <div className="px-6 py-4 border-t border-gray-200 rounded-b-2xl flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setLocation("/trading/products")}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-50 transition-all"
              style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {submitting ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {previewSrc && <Lightbox src={previewSrc} onClose={() => setPreviewSrc(null)} />}
    </AppLayout>
  );
}