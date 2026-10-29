import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Loader2, LogOut, Search, Package, Truck, ExternalLink, CheckCircle2, RotateCcw,
  Circle, CircleDot, ImageIcon, MessageSquare, Receipt, Layers, RefreshCw,
} from "lucide-react";
import type {
  ClientAccountIdentity, ClientAccountDashboard, ClientAccountOrder, ClientAccountOrderContent,
  ClientAccountAttachment, ClientAccountOrderContentArtworksItem, ClientConversationInput,
} from "@workspace/api-client-react";
import TaarBrand from "@/components/branding/TaarBrand";
import {
  getDashboard, listOrders, getOrder, postMessage, postFeedback, isAuthError,
  fmtDate, fmtMoney, safeHttpUrl, images, MAX_TEXT,
  ClientApiError,
} from "./api";
import { Composer, Lightbox, MessageList } from "./Conversation";

const POLL_MS = 45_000;

/** Refetch on focus/visibility and on a finite interval while visible. */
function useFreshness(fn: () => void, ms = POLL_MS) {
  const ref = useRef(fn); ref.current = fn;
  useEffect(() => {
    const tick = () => { if (document.visibilityState === "visible") ref.current(); };
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    const t = window.setInterval(tick, ms);
    return () => { window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); window.clearInterval(t); };
  }, [ms]);
}

function Panel({ children, className = "", dark = false }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  return <section className={`rounded-2xl border shadow-[0_10px_30px_-22px_rgba(22,78,99,0.5)] ${dark ? "bg-cyan-950 border-cyan-950 text-white" : "border-[#C9B45C]/25 bg-white/90"} ${className}`}>{children}</section>;
}

function StatusPill({ value, testId }: { value: string; testId?: string }) {
  const v = value.toLowerCase();
  const tone = /cancel|overdue|fail|rework/.test(v) ? "bg-rose-50 text-rose-700 border-rose-200"
    : /partial|unpaid|pending|not yet|not invoiced/.test(v) ? "bg-amber-50 text-[#8a7628] border-[#C9B45C]/40"
    : /^(delivered|paid|completed.*|approved|done)$/.test(v) ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : /progress|production|ship|transit|sampling/.test(v) ? "bg-amber-50 text-[#8a7628] border-[#C9B45C]/40"
    : "bg-slate-50 text-slate-600 border-slate-200";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tone}`} data-testid={testId}>{value}</span>;
}

function Retry({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <Panel className="p-6 text-center">
      <p role="alert" className="text-sm text-rose-700" data-testid="text-error">{msg}</p>
      <button onClick={onRetry} className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyan-900 hover:underline" data-testid="button-retry"><RefreshCw size={14} /> Try again</button>
    </Panel>
  );
}

/* ================= Portal shell ================= */
export default function Portal({ me, onLogout, onUnauthorized }: {
  me: ClientAccountIdentity; onLogout: () => Promise<string | null>; onUnauthorized: () => void;
}) {
  const [dash, setDash] = useState<ClientAccountDashboard | null>(null);
  const [dashErr, setDashErr] = useState<string | null>(null);
  const [orders, setOrders] = useState<ClientAccountOrder[] | null>(null);
  const [ordersErr, setOrdersErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "swatch" | "style">("all");
  const [status, setStatus] = useState("all");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutErr, setLogoutErr] = useState<string | null>(null);
  const unauth = useRef(onUnauthorized); unauth.current = onUnauthorized;
  const scrollY = useRef(0);

  const loadSummary = useCallback(async (silent = false) => {
    if (!silent) { setDashErr(null); setOrdersErr(null); }
    const [d, o] = await Promise.allSettled([getDashboard(), listOrders()]);
    for (const r of [d, o]) if (r.status === "rejected" && isAuthError(r.reason)) { unauth.current(); return; }
    if (d.status === "fulfilled") { setDash(d.value); setDashErr(null); }
    else if (!silent) setDashErr(d.reason instanceof Error ? d.reason.message : "Could not load summary.");
    if (o.status === "fulfilled") { setOrders(o.value); setOrdersErr(null); }
    else if (!silent) setOrdersErr(o.reason instanceof Error ? o.reason.message : "Could not load orders.");
  }, []);
  useEffect(() => { void loadSummary(); }, [loadSummary]);
  useFreshness(() => void loadSummary(true));

  const statuses = useMemo(() => Array.from(new Set((orders ?? []).map((o) => o.orderStatus).filter(Boolean))).sort(), [orders]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (orders ?? []).filter((o) =>
      (type === "all" || o.orderType === type) && (status === "all" || o.orderStatus === status) &&
      (!s || [o.orderCode, o.orderName, o.portalTitle ?? ""].some((x) => x.toLowerCase().includes(s))));
  }, [orders, q, type, status]);

  function open(id: number) { scrollY.current = window.scrollY; setSelected(id); window.scrollTo(0, 0); }
  function back() { setSelected(null); requestAnimationFrame(() => window.scrollTo(0, scrollY.current)); }

  async function logout() {
    setLoggingOut(true); setLogoutErr(null);
    const e = await onLogout();
    setLoggingOut(false); if (e) setLogoutErr(e);
  }

  const initials = me.client.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-[#f7f4ec] text-slate-800" style={{ fontFamily: "system-ui, sans-serif" }}>
      <header className="sticky top-0 z-30 border-b border-[#C9B45C]/25 bg-[#fbf9f3]/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-4">
          <button onClick={back} aria-label="All orders" data-testid="link-home"><TaarBrand width={96} /></button>
          <span className="hidden sm:block text-[11px] tracking-[0.25em] uppercase text-[#a8923a]">Client Portal</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="h-8 w-8 rounded-full bg-cyan-900 text-[#C9B45C] text-xs font-semibold flex items-center justify-center">{initials}</span>
            <span className="hidden sm:block text-sm font-medium" data-testid="text-client-name">{me.client.name}</span>
            <button onClick={() => void logout()} disabled={loggingOut} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60" data-testid="button-logout">
              {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />} Sign out
            </button>
          </div>
        </div>
        {logoutErr && <p role="alert" className="mx-auto max-w-6xl px-4 pb-2 text-sm text-rose-700" data-testid="text-logout-error">{logoutErr}</p>}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {selected !== null ? (
          <OrderDetail id={selected} onBack={back} onUnauthorized={() => unauth.current()} onChanged={() => void loadSummary(true)} />
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl text-cyan-950" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Your studio work</h1>
              <p className="text-sm text-slate-500 mt-1">Welcome, {me.client.name}. Swatch and style orders shared with you by TAAR.</p>
            </div>
            <DashboardStrip dash={dash} err={dashErr} onRetry={() => void loadSummary()} />
            <Panel className="p-4 sm:p-5">
              <div className="flex flex-col md:flex-row gap-3">
                <label className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by code or name" className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-cyan-900" data-testid="input-search" />
                </label>
                <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
                  {(["all", "swatch", "style"] as const).map((t) => (
                    <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-md capitalize ${type === t ? "bg-cyan-900 text-[#E8D88E]" : "text-slate-600 hover:bg-slate-50"}`} data-testid={`button-type-${t}`}>{t === "all" ? "All types" : t}</button>
                  ))}
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" data-testid="select-status">
                  <option value="all">All statuses</option>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </Panel>
            {ordersErr ? <Retry msg={ordersErr} onRetry={() => void loadSummary()} />
              : orders === null ? <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/70 animate-pulse" />)}</div>
              : orders.length === 0 ? (
                <Panel className="py-14 text-center"><Package className="mx-auto mb-3 text-[#C6AF4B]" size={30} /><p className="text-sm text-slate-500" data-testid="text-empty-orders">No orders have been shared with you yet.</p></Panel>
              ) : filtered.length === 0 ? (
                <Panel className="py-10 text-center text-sm text-slate-500" >
                  No orders match these filters.
                  <button onClick={() => { setQ(""); setType("all"); setStatus("all"); }} className="ml-2 text-cyan-900 hover:underline" data-testid="button-clear-filters">Clear filters</button>
                </Panel>
              ) : (
                <ul className="space-y-3">
                  {filtered.map((o) => <OrderRow key={o.id} o={o} onOpen={() => open(o.id)} />)}
                </ul>
              )}
          </div>
        )}
      </main>
    </div>
  );
}

function DashboardStrip({ dash, err, onRetry }: { dash: ClientAccountDashboard | null; err: string | null; onRetry: () => void }) {
  if (err) return <Retry msg={err} onRetry={onRetry} />;
  if (!dash) return <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/70 animate-pulse" />)}</div>;
  const counts = [
    { k: "Orders placed", v: dash.ordersPlaced, id: "orders-placed" },
    { k: "In progress", v: dash.inProgress, id: "in-progress" },
    { k: "Delivered", v: dash.delivered, id: "delivered" },
    { k: "Invoices paid", v: dash.invoicesPaid, id: "invoices-paid" },
    { k: "Invoices pending payment", v: dash.invoicesPending, id: "invoices-pending" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-3">
      <Panel className="p-5 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-3 gap-y-4">
        {counts.map((c) => (
          <div key={c.id} className="px-3 first:pl-0">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{c.k}</p>
            <p className="text-3xl text-cyan-950 mt-1" style={{ fontFamily: "Georgia, serif" }} data-testid={`stat-${c.id}`}>{c.v}</p>
          </div>
        ))}
      </Panel>
      <Panel dark className="p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-wider text-[#E8D88E]/80">Payments ({dash.currency})</p>
          <p className="text-[11px] text-white/60" data-testid="text-invoice-counts">{dash.invoicesPaid} paid · {dash.invoicesPending} pending · {dash.uninvoicedOrders} not yet invoiced</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-white/60">Received</p><p className="text-xl font-semibold" data-testid="stat-received">{fmtMoney(dash.receivedInr, dash.currency)}</p></div>
          <div><p className="text-xs text-white/60">Outstanding</p><p className="text-xl font-semibold text-[#E8D88E]" data-testid="stat-outstanding">{fmtMoney(dash.outstandingInr, dash.currency)}</p></div>
        </div>
        <p className="mt-2 text-[10px] text-white/45">Received includes applied credits.</p>
      </Panel>
    </div>
  );
}

function OrderRow({ o, onOpen }: { o: ClientAccountOrder; onOpen: () => void }) {
  return (
    <li>
      <button onClick={onOpen} className="group w-full text-left rounded-2xl border border-[#C9B45C]/25 bg-white px-5 py-4 transition-colors hover:border-cyan-900/50" data-testid={`card-order-${o.id}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate-500">{o.orderCode}</span>
          <span className="text-[10px] uppercase tracking-wider rounded-full bg-[#f3eedd] px-2 py-0.5 text-[#8a7628]">{o.orderType}</span>
          <StatusPill value={o.orderStatus} testId={`status-order-${o.id}`} />
        </div>
        <p className="mt-1 text-base font-medium text-cyan-950 group-hover:underline underline-offset-4">{o.portalTitle || o.orderName}</p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-2 text-xs">
          <Meta k="Ordered" v={fmtDate(o.orderDate)} />
          <Meta k="Target delivery" v={fmtDate(o.deliveryDate)} />
          <Meta k="Shipping" v={o.shippingStatus} />
          <Meta k="Payment" v={`${o.paymentStatus} · ${o.invoiceCount} invoice${o.invoiceCount === 1 ? "" : "s"}`} />
          <Meta k="Received / Due (INR)" v={`${fmtMoney(o.receivedInr, "INR")} / ${fmtMoney(o.outstandingInr, "INR")}`} />
        </div>
      </button>
    </li>
  );
}

function Meta({ k, v }: { k: string; v: React.ReactNode }) {
  return <div><p className="text-slate-400">{k}</p><p className="text-slate-700">{v}</p></div>;
}

/* ================= Detail ================= */
type Tab = "conversation" | "products" | "artworks" | "shipment" | "invoices";

function OrderDetail({ id, onBack, onUnauthorized, onChanged }: { id: number; onBack: () => void; onUnauthorized: () => void; onChanged: () => void }) {
  const [d, setD] = useState<ClientAccountOrderContent | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab | null>(null);
  const [lb, setLb] = useState<{ items: ClientAccountAttachment[]; i: number } | null>(null);
  const unauth = useRef(onUnauthorized); unauth.current = onUnauthorized;

  const load = useCallback(async (silent = false) => {
    if (!silent) setErr(null);
    try { setD(await getOrder(id)); setErr(null); }
    catch (x) {
      if (isAuthError(x)) { unauth.current(); return; }
      if (x instanceof ClientApiError && x.status === 404) {
        setD(null); setErr(x.message); return;
      }
      if (!silent) setErr(x instanceof Error ? x.message : "Could not load order.");
    }
  }, [id]);
  useEffect(() => { setD(null); void load(); }, [load]);
  useFreshness(() => void load(true), 30_000);

  const after = useCallback(async () => { await load(true); onChanged(); }, [load, onChanged]);
  const send = useCallback(async (body: ClientConversationInput) => {
    try { await postMessage(id, body); } catch (x) { if (isAuthError(x)) unauth.current(); throw x; }
    await after();
  }, [id, after]);
  const decide = useCallback(async (artworkId: number, decision: "Approve" | "Rework", comment?: string) => {
    try { await postFeedback(id, { artworkId, decision, comment }); } catch (x) { if (isAuthError(x)) unauth.current(); throw x; }
    await after();
  }, [id, after]);
  const zoom = (items: ClientAccountAttachment[], i: number) => setLb({ items, i });

  const backBtn = <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-cyan-900 hover:underline" data-testid="button-back"><ArrowLeft size={16} /> All orders</button>;
  if (err) return <div className="space-y-4">{backBtn}<Retry msg={err} onRetry={() => void load()} /></div>;
  if (!d) return (
    <div className="space-y-4">{backBtn}
      <div className="h-44 rounded-2xl bg-white/70 animate-pulse" /><div className="h-28 rounded-2xl bg-white/70 animate-pulse" /><div className="h-64 rounded-2xl bg-white/70 animate-pulse" />
    </div>
  );

  const isStyle = d.link.orderType === "style";
  const tabs: { k: Tab; label: string; icon: React.ReactNode; n?: number }[] = [
    { k: "conversation", label: "Conversation", icon: <MessageSquare size={14} />, n: d.messages.filter((m) => m.targetType === "order").length },
    ...(isStyle ? [{ k: "products" as Tab, label: "Products", icon: <Layers size={14} />, n: d.products.length }] : []),
    { k: "artworks", label: "Artworks", icon: <ImageIcon size={14} />, n: d.artworks.length },
    { k: "shipment", label: "Shipment", icon: <Truck size={14} />, n: d.shipments.length },
    { k: "invoices", label: "Invoices", icon: <Receipt size={14} />, n: d.invoices.length },
  ];
  const active = tab ?? "conversation";
  const refs = images(d.order.referenceImages).length ? images(d.order.referenceImages) :
    images(d.products.flatMap(p => p.referenceImages)).length ? images(d.products.flatMap(p => p.referenceImages)) :
    images(d.artworks.flatMap(a => [...a.finalImages, ...a.wipImages, ...a.referenceImages]));
  const artworkMsgs = (aid: number) => d.messages.filter((m) => m.targetType === "artwork" && m.artworkId === aid);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {backBtn}
        <span className="text-slate-300">/</span>
        <h1 className="font-mono text-lg font-semibold text-cyan-950" data-testid="text-order-code">{d.order.orderCode}</h1>
        <StatusPill value={d.order.orderStatus} testId="status-order" />
      </div>

      <Panel className="p-5 grid gap-5 md:grid-cols-[auto_1fr_auto]">
        <div className="flex gap-2">
          {refs.length > 0 ? refs.slice(0, 3).map((r, i) => (
            <button key={i} onClick={() => zoom(refs, i)} className="h-24 w-20 sm:h-28 sm:w-24 overflow-hidden rounded-xl border border-[#C9B45C]/30" data-testid={`img-reference-${i}`}>
              <img src={r.data} alt={r.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            </button>
          )) : <div className="h-28 w-24 rounded-xl bg-[#f3eedd] flex items-center justify-center text-[#C6AF4B]"><Package /></div>}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl text-cyan-950" style={{ fontFamily: "Georgia, serif" }} data-testid="text-order-title">{d.link.portalTitle || d.order.orderName}</h2>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-slate-400">Order type</dt><dd className="capitalize">{d.link.orderType}</dd>
            {d.order.styleNo && <><dt className="text-slate-400">Style no.</dt><dd>{d.order.styleNo}</dd></>}
            {d.order.quantity && <><dt className="text-slate-400">Quantity</dt><dd>{d.order.quantity}</dd></>}
            {d.order.fabricName && <><dt className="text-slate-400">Fabric</dt><dd>{d.order.fabricName}</dd></>}
          </dl>
          {d.order.description && <p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">{d.order.description}</p>}
        </div>
        <dl className="md:border-l md:border-[#C9B45C]/20 md:pl-6 grid grid-cols-[auto_1fr] md:grid-cols-1 gap-x-4 gap-y-1 text-sm content-start">
          <dt className="text-slate-400">Order date</dt><dd data-testid="text-order-date">{fmtDate(d.order.orderDate)}</dd>
          <dt className="text-slate-400">Target delivery</dt><dd data-testid="text-delivery-date">{fmtDate(d.order.deliveryDate)}</dd>
        </dl>
      </Panel>

      <Panel className="p-5">
        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-4">Order progress</h3>
        {d.progress.length === 0 ? <p className="text-sm text-slate-400">Progress has not been shared yet.</p> : (
          <ol className="flex flex-col sm:flex-row gap-4 sm:gap-0">
            {d.progress.map((s, i) => {
              const st = s.status.toLowerCase();
              const done = /^(placed|done|completed.*|approved|delivered)$/.test(st);
              const cur = !done && /progress|pending|active|current|started|partial|transit|rework/.test(st);
              return (
                <li key={i} className="relative flex sm:flex-1 sm:flex-col items-center gap-3 sm:gap-2 sm:text-center" data-testid={`stage-${i}`}>
                  {i < d.progress.length - 1 && <span className={`hidden sm:block absolute top-5 left-1/2 w-full h-px ${done ? "bg-cyan-900" : "bg-slate-200"}`} />}
                  <span className={`relative z-10 h-10 w-10 shrink-0 rounded-full border flex items-center justify-center ${done ? "bg-cyan-900 border-cyan-900 text-[#E8D88E]" : cur ? "bg-[#faf3d8] border-[#C9B45C] text-[#8a7628]" : "bg-white border-slate-200 text-slate-300"}`}>
                    {done ? <CheckCircle2 size={18} /> : cur ? <CircleDot size={18} /> : <Circle size={16} />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-cyan-950">{s.label}</p>
                    <p className="text-xs text-slate-500">{s.status}{s.date ? ` · ${fmtDate(s.date)}` : ""}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>

      <div>
        <div role="tablist" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[#C9B45C]/25">
          {tabs.map((t) => (
            <button key={t.k} role="tab" aria-selected={active === t.k} onClick={() => setTab(t.k)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm border-b-2 -mb-px ${active === t.k ? "border-cyan-900 text-cyan-950 font-medium" : "border-transparent text-slate-500 hover:text-cyan-900"}`} data-testid={`tab-${t.k}`}>
              {t.icon}{t.label}{t.n !== undefined && <span className="text-[10px] rounded-full bg-[#f3eedd] px-1.5 text-[#8a7628]">{t.n}</span>}
            </button>
          ))}
        </div>
        <div className="pt-5">
          {active === "conversation" && (
            <Panel className="p-5 space-y-4">
              <div><h3 className="font-medium text-cyan-950">Order conversation</h3><p className="text-xs text-slate-500">General questions about this order go directly to the TAAR team.</p></div>
              <MessageList messages={d.messages.filter((m) => m.targetType === "order")} selfSender="client" empty="No messages yet. Start the conversation below." />
              <Composer testId="composer-order" onSend={(message, attachment) => send({ targetType: "order", message, attachment })} />
            </Panel>
          )}
          {active === "products" && (
            d.products.length === 0 ? <Panel className="p-8 text-center text-sm text-slate-500">No products shared yet.</Panel> : (
              <div className="space-y-4">
                {d.products.map((p) => {
                  const pr = images(p.referenceImages);
                  const aws = d.artworks.filter((a) => a.productId === p.id);
                  return (
                    <Panel key={p.id} className="p-5 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-cyan-950" data-testid={`text-product-${p.id}`}>{p.productName}</h3>
                        <StatusPill value={p.productStatus} />
                        {p.fabricName && <span className="text-xs text-slate-500">Fabric: {p.fabricName}</span>}
                      </div>
                      {pr.length > 0 && <Thumbs items={pr} onZoom={zoom} testPrefix={`product-${p.id}`} />}
                      {aws.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[11px] uppercase tracking-wider text-slate-400">Artworks for this product</p>
                          {aws.map((a) => <ArtworkCard key={a.id} a={a} msgs={artworkMsgs(a.id)} onZoom={zoom} onSend={send} onDecide={decide} />)}
                        </div>
                      )}
                      {aws.length === 0 && <p className="text-xs text-slate-400">No artworks shared for this product yet.</p>}
                      <div className="rounded-xl bg-[#fbf9f3] border border-[#C9B45C]/20 p-4 space-y-3">
                        <p className="text-xs font-medium text-slate-600">Product conversation</p>
                        <MessageList messages={d.messages.filter((m) => m.targetType === "product" && m.productId === p.id)} selfSender="client" empty="No messages about this product yet." />
                        <Composer testId={`composer-product-${p.id}`} onSend={(message, attachment) => send({ targetType: "product", targetId: p.id, message, attachment })} />
                      </div>
                    </Panel>
                  );
                })}
              </div>
            )
          )}
          {active === "artworks" && (
            d.artworks.length === 0 ? <Panel className="p-8 text-center text-sm text-slate-500">No artworks published yet.</Panel> : (
              <div className="space-y-4">
                {d.artworks.map((a) => <ArtworkCard key={a.id} a={a} productName={d.products.find((p) => p.id === a.productId)?.productName}
                  msgs={artworkMsgs(a.id)} onZoom={zoom} onSend={send} onDecide={decide} />)}
              </div>
            )
          )}
          {active === "shipment" && <Shipments d={d} />}
          {active === "invoices" && <Invoices d={d} />}
        </div>
      </div>
      {lb && <Lightbox items={lb.items} start={lb.i} onClose={() => setLb(null)} />}
    </div>
  );
}

function Thumbs({ items, onZoom, testPrefix }: { items: ClientAccountAttachment[]; onZoom: (i: ClientAccountAttachment[], n: number) => void; testPrefix: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((m, i) => (
        <button key={i} onClick={() => onZoom(items, i)} className="h-20 w-20 overflow-hidden rounded-lg border border-[#C9B45C]/25 hover:border-cyan-900" data-testid={`img-${testPrefix}-${i}`}>
          <img src={m.data} alt={m.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}

function ArtworkCard({ a, msgs, productName, onZoom, onSend, onDecide }: {
  a: ClientAccountOrderContentArtworksItem; msgs: ClientAccountOrderContent["messages"]; productName?: string;
  onZoom: (i: ClientAccountAttachment[], n: number) => void;
  onSend: (b: ClientConversationInput) => Promise<void>;
  onDecide: (id: number, d: "Approve" | "Rework", c?: string) => Promise<void>;
}) {
  const fin = images(a.finalImages), wip = images(a.wipImages), refImages = images(a.referenceImages);
  const [mode, setMode] = useState<"Approve" | "Rework" | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showThread, setShowThread] = useState(msgs.length > 0);

  async function submit() {
    if (!mode || comment.length > MAX_TEXT) return;
    setBusy(true); setErr(null);
    try { await onDecide(a.id, mode, comment.trim() || undefined); setMode(null); setComment(""); }
    catch (x) { setErr(x instanceof Error ? x.message : "Could not submit."); }
    finally { setBusy(false); }
  }

  return (
    <Panel className="p-5 space-y-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-slate-400">{a.artworkCode}</p>
          <p className="font-medium text-cyan-950" data-testid={`text-artwork-${a.id}`}>{a.artworkName}</p>
          {productName && <p className="text-xs text-[#8a7628]">{productName}</p>}
        </div>
        {a.decision ? <StatusPill value={a.decision === "Rework" ? "Rework requested" : a.decision === "Approve" ? "Approved" : a.decision} testId={`status-artwork-${a.id}`} />
          : <StatusPill value={a.isClosed ? "Closed" : "Awaiting your review"} testId={`status-artwork-${a.id}`} />}
      </div>
      {fin.length > 0 && <div><p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">Final</p><Thumbs items={fin} onZoom={onZoom} testPrefix={`final-${a.id}`} /></div>}
      {wip.length > 0 && <div><p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">Work in progress</p><Thumbs items={wip} onZoom={onZoom} testPrefix={`wip-${a.id}`} /></div>}
      {refImages.length > 0 && <div><p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">Reference</p><Thumbs items={refImages} onZoom={onZoom} testPrefix={`reference-${a.id}`} /></div>}
      {fin.length === 0 && wip.length === 0 && refImages.length === 0 && <p className="text-xs text-slate-400">No images shared yet.</p>}

      {!a.isClosed && (
        mode ? (
          <div className="rounded-xl border border-[#C9B45C]/30 bg-[#fbf9f3] p-4 space-y-2">
            <p className="text-sm font-medium">{mode === "Approve" ? "Approve this artwork" : "Request rework"}</p>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder={mode === "Approve" ? "Optional note" : "What should change?"}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-900" data-testid={`input-feedback-${a.id}`} />
            <div className="flex items-center gap-2">
              <button onClick={() => void submit()} disabled={busy || comment.length > MAX_TEXT} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-900 px-4 py-2 text-sm text-[#E8D88E] disabled:opacity-60" data-testid={`button-submit-feedback-${a.id}`}>
                {busy && <Loader2 size={14} className="animate-spin" />} Submit
              </button>
              <button onClick={() => { setMode(null); setErr(null); }} className="text-sm text-slate-500 hover:underline" data-testid={`button-cancel-feedback-${a.id}`}>Cancel</button>
              <span className="ml-auto text-[11px] text-slate-400">{comment.length} / {MAX_TEXT}</span>
            </div>
            {err && <p role="alert" className="text-xs text-rose-700">{err}</p>}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setMode("Approve")} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-900 px-4 py-2 text-sm text-[#E8D88E]" data-testid={`button-approve-${a.id}`}><CheckCircle2 size={15} /> Approve</button>
            <button onClick={() => setMode("Rework")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm" data-testid={`button-rework-${a.id}`}><RotateCcw size={15} /> Request rework</button>
          </div>
        )
      )}

      {(a.feedback ?? []).length > 0 && <div className="border-t border-slate-100 pt-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Your artwork decisions</h4>
        <ul className="space-y-2">{a.feedback.map(f => <li key={f.id} className="rounded-xl bg-[#F7F5EB] p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2"><StatusPill value={f.decision === "Approve" ? "Approved" : "Rework requested"} /><span className="text-xs text-slate-500">{fmtDate(f.createdAt)}</span></div>
          {f.comment && <p className="mt-2 whitespace-pre-wrap break-words text-slate-700">{f.comment}</p>}
        </li>)}</ul>
      </div>}
      <div className="border-t border-slate-100 pt-3">
        <button onClick={() => setShowThread((v) => !v)} className="inline-flex items-center gap-1.5 text-sm text-cyan-900" data-testid={`button-thread-${a.id}`}>
          <MessageSquare size={14} /> {showThread ? "Hide" : "Show"} discussion ({msgs.length})
        </button>
        {showThread && (
          <div className="mt-3 space-y-3">
            <MessageList messages={msgs} selfSender="client" empty="No messages about this artwork yet." />
            <Composer disabled={a.isClosed} testId={`composer-artwork-${a.id}`} onSend={(message, attachment) => onSend({ targetType: "artwork", targetId: a.id, message, attachment })} />
          </div>
        )}
      </div>
    </Panel>
  );
}

function Shipments({ d }: { d: ClientAccountOrderContent }) {
  if (d.shipments.length === 0) return <Panel className="p-8 text-center text-sm text-slate-500" ><Truck className="mx-auto mb-2 text-[#C6AF4B]" />No shipments recorded yet.</Panel>;
  return (
    <div className="space-y-3">
      {d.shipments.map((s) => {
        const url = safeHttpUrl(s.trackingUrl);
        return (
          <Panel key={s.id} className="p-5">
            <div className="flex flex-wrap items-center gap-2"><Truck size={16} className="text-cyan-900" /><StatusPill value={s.status} testId={`status-shipment-${s.id}`} />
              {s.trackingNumber && <span className="font-mono text-xs text-slate-600">{s.trackingNumber}</span>}
              {url && <a href={url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm text-cyan-900 hover:underline" data-testid={`link-tracking-${s.id}`}>Track <ExternalLink size={13} /></a>}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <Meta k="Shipped" v={fmtDate(s.shipmentDate)} />
              <Meta k="Expected delivery" v={fmtDate(s.expectedDeliveryDate)} />
              <Meta k="Delivered" v={s.actualDeliveryDate ? fmtDate(s.actualDeliveryDate) : s.status.startsWith("Delivered") ? "Date not recorded" : "Not yet delivered"} />
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function Invoices({ d }: { d: ClientAccountOrderContent }) {
  if (d.invoices.length === 0) return <Panel className="p-8 text-center text-sm text-slate-500"><Receipt className="mx-auto mb-2 text-[#C6AF4B]" />No invoices issued for this order yet.</Panel>;
  return (
    <Panel className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-[#C9B45C]/20">
          {["Invoice", "Date", "Due", "Currency", "Total", "Received", "Outstanding", "Status"].map((h) => <th key={h} className={`px-4 py-3 font-medium ${["Total", "Received", "Outstanding"].includes(h) ? "text-right" : ""}`}>{h}</th>)}
        </tr></thead>
        <tbody>
          {d.invoices.map((i) => (
            <tr key={i.id} className="border-b border-slate-100 last:border-0" data-testid={`row-invoice-${i.id}`}>
              <td className="px-4 py-3 font-mono text-xs">{i.invoiceNo}</td>
              <td className="px-4 py-3">{fmtDate(i.invoiceDate)}</td>
              <td className="px-4 py-3">{fmtDate(i.dueDate)}</td>
              <td className="px-4 py-3">{i.currency}</td>
              <td className="px-4 py-3 text-right">{fmtMoney(i.total, i.currency)}</td>
              <td className="px-4 py-3 text-right">{fmtMoney(i.received, i.currency)}</td>
              <td className="px-4 py-3 text-right font-medium">{fmtMoney(i.outstanding, i.currency)}</td>
              <td className="px-4 py-3"><StatusPill value={i.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-[11px] text-slate-400">Amounts shown in each invoice's currency. Received includes applied credits.</p>
    </Panel>
  );
}
