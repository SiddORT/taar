import { useEffect, useMemo, useRef, useState } from "react";
import { Lock, Info, CornerUpLeft, MessageSquare, X } from "lucide-react";
import type { ClientAccountAttachment } from "@workspace/api-client-react";
import { Composer, MessageList } from "./Conversation";
import { NO_PRODUCT, artworkGroup as groupOf, topicInScope, resolveSendTopic } from "./topicSelection";

export type TopicKind = "order" | "product" | "artwork";
export type Topic = {
  key: string; kind: TopicKind; id?: number; label: string;
  /** Closed topics remain selectable for reading but cannot be written to. */
  closed?: boolean;
  /** Not writable for another reason (e.g. no longer shared). */
  unavailable?: boolean;
  /** Artwork topics: parent product ID (null/undefined = order-level artwork). */
  productId?: number | null;
  /** Artwork topics: parent product display name. */
  productLabel?: string | null;
  /** Artwork code, used to disambiguate repeated names. */
  artworkCode?: string | null;
};
export type UnifiedMessage = {
  id: number; targetType?: TopicKind | null; artworkId: number | null; productId?: number | null;
  artworkName?: string | null; sender: string; message: string | null;
  attachment: ClientAccountAttachment | null; createdAt: string;
};

export const GENERAL_KEY = "order";
/** Empty key = an incomplete guided selection (nothing can be sent). */
export const INCOMPLETE_KEY = "";
export const topicKey = (kind: TopicKind, id?: number | null) => kind === "order" ? GENERAL_KEY : `${kind}:${id ?? 0}`;

/** Legacy rows without targetType are artwork-scoped. */
export function messageTopicKey(m: UnifiedMessage): string {
  const kind = (m.targetType ?? "artwork") as TopicKind;
  return topicKey(kind, kind === "product" ? m.productId : kind === "artwork" ? m.artworkId : undefined);
}

const KIND_LABEL: Record<TopicKind, string> = { order: "General", product: "Product", artwork: "Artwork" };
type Filter = "all" | TopicKind;

export default function UnifiedConversation({
  messages, topics, selfSender, topicKeyValue, onTopicChange, focusSignal, onSend, scopedNotice, testId = "conversation",
}: {
  messages: UnifiedMessage[];
  topics: Topic[];
  selfSender: "client" | "team";
  /** GENERAL_KEY, a topic key, or INCOMPLETE_KEY while the user is mid-selection. */
  topicKeyValue: string;
  onTopicChange: (key: string) => void;
  focusSignal: number;
  onSend: (topic: Topic, message: string | undefined, attachment: ClientAccountAttachment | undefined) => Promise<void>;
  scopedNotice?: string | null;
  testId?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [scope, setScope] = useState<string>("");
  const [pending, setPending] = useState<{ kind: "product" | "artwork"; group: string }>({ kind: "product", group: "" });
  const [replyTo, setReplyTo] = useState<{ id: number; key: string } | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  // Product names by ID (from product topics and artwork parents).
  const productNames = useMemo(() => {
    const m = new Map<number, string>();
    for (const t of topics) if (t.kind === "product" && t.id != null) m.set(t.id, t.label);
    for (const t of topics) if (t.kind === "artwork" && t.productId != null && !m.has(t.productId) && t.productLabel) m.set(t.productId, t.productLabel);
    return m;
  }, [topics]);

  const allTopics = useMemo(() => {
    const map = new Map<string, Topic>(topics.map((t) => [t.key, t]));
    for (const m of messages) {
      const k = messageTopicKey(m);
      if (map.has(k)) continue;
      const kind = (m.targetType ?? "artwork") as TopicKind;
      const id = kind === "product" ? m.productId ?? undefined : m.artworkId ?? undefined;
      const pid = kind === "artwork" ? m.productId ?? null : null;
      const label = kind === "product" ? (id != null && productNames.get(id)) || `Product #${id ?? "?"}` : m.artworkName || `Artwork #${id ?? "?"}`;
      map.set(k, { key: k, kind, id, label, unavailable: true, productId: pid, productLabel: pid != null ? productNames.get(pid) ?? `Product #${pid}` : null });
    }
    if (topicKeyValue && !map.has(topicKeyValue) && topicKeyValue !== GENERAL_KEY) {
      const [kind, rawId] = topicKeyValue.split(":");
      if (kind === "product" || kind === "artwork") {
        map.set(topicKeyValue, { key: topicKeyValue, kind, id: Number(rawId), label: `${KIND_LABEL[kind]} #${rawId}`, unavailable: true });
      }
    }
    if (!map.has(GENERAL_KEY)) map.set(GENERAL_KEY, { key: GENERAL_KEY, kind: "order", label: "General" });
    return map;
  }, [topics, messages, topicKeyValue, productNames]);

  const options = [...allTopics.values()];
  const productTopics = options.filter((t) => t.kind === "product");
  const artworkTopics = options.filter((t) => t.kind === "artwork");
  const hasProducts = productTopics.length > 0 || artworkTopics.some((t) => t.productId != null);

  // Disambiguation for repeated names.
  const dupProductNames = useMemo(() => {
    const c = new Map<string, number>();
    for (const [, n] of productNames) c.set(n, (c.get(n) ?? 0) + 1);
    return c;
  }, [productNames]);
  const productName = (pid: number | null | undefined) => {
    if (pid == null) return "Order-level";
    const n = productNames.get(pid) ?? `Product #${pid}`;
    return (dupProductNames.get(n) ?? 0) > 1 ? `${n} (#${pid})` : n;
  };
  const artworkName = (t: Topic) => {
    const same = artworkTopics.filter((o) => o.label === t.label).length > 1;
    return same ? `${t.label} (${t.artworkCode || `#${t.id}`})` : t.label;
  };
  const fullLabel = (t: Topic) => t.kind === "order" ? "General"
    : t.kind === "product" ? `${productName(t.id)} → Product discussion`
    : hasProducts ? `${productName(t.productId)} → ${artworkName(t)}` : artworkName(t);

  const current: Topic | null = topicKeyValue ? allTopics.get(topicKeyValue) ?? null : null;
  const selKind: TopicKind = current ? current.kind : pending.kind;
  const selGroup = current ? (current.kind === "artwork" ? groupOf(current) : "") : pending.group;

  const artGroups = useMemo(() => {
    const g: string[] = [];
    for (const t of artworkTopics) { const k = groupOf(t); if (!g.includes(k)) g.push(k); }
    return g;
  }, [artworkTopics]);
  const needProductStep = artGroups.length > 1 || artGroups.some((g) => g !== NO_PRODUCT);

  // Reply context is local and cleared whenever the topic changes.
  useEffect(() => { setReplyTo((r) => (r && r.key !== topicKeyValue ? null : r)); }, [topicKeyValue]);

  useEffect(() => {
    if (!focusSignal) return;
    // Discuss shortcuts must show the chosen thread, not a previous history filter.
    setFilter("all"); setScope(topicKeyValue || ""); setReplyTo(null);
    const el = composerRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const ta = el?.querySelector("textarea");
    window.setTimeout(() => ta?.focus(), 250);
  }, [focusSignal]);

  function chooseKind(k: TopicKind) {
    if (k === "order") { onTopicChange(GENERAL_KEY); return; }
    if (k === selKind) return;
    const group = k === "artwork" && !needProductStep && artGroups.length === 1 ? artGroups[0] : "";
    setPending({ kind: k, group });
    onTopicChange(INCOMPLETE_KEY);
  }
  function chooseGroup(g: string) {
    setPending({ kind: "artwork", group: g });
    onTopicChange(INCOMPLETE_KEY);
  }

  function reply(m: UnifiedMessage) {
    const k = messageTopicKey(m);
    onTopicChange(k);
    setReplyTo({ id: m.id, key: k });
    setFilter("all"); setScope(k);
    const el = composerRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => el?.querySelector("textarea")?.focus(), 250);
  }

  const sorted = useMemo(() => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id - b.id), [messages]);
  const inScope = (m: UnifiedMessage) => { const k = messageTopicKey(m); return topicInScope(scope, allTopics.get(k), k); };
  const visible = sorted.filter((m) => (filter === "all" || ((m.targetType ?? "artwork") as TopicKind) === filter) && inScope(m));
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: messages.length, order: 0, product: 0, artwork: 0 };
    for (const m of messages) c[(m.targetType ?? "artwork") as TopicKind]++;
    return c;
  }, [messages]);
  const msgCountByKey = useMemo(() => {
    const c = new Map<string, number>();
    for (const m of messages) { const k = messageTopicKey(m); c.set(k, (c.get(k) ?? 0) + 1); }
    return c;
  }, [messages]);

  const filters: Filter[] = ["all", "order", ...(productTopics.length ? ["product" as const] : []), ...(artworkTopics.length ? ["artwork" as const] : [])];
  const scopeProducts = [...new Set([...productTopics.map((t) => t.id!), ...artworkTopics.filter((t) => t.productId != null).map((t) => t.productId!)])];

  const readOnly = !!(current && (current.closed || current.unavailable));
  const blocked = !current
    ? (selKind === "product" ? "Choose a product to send this message." : selGroup ? "Choose an artwork to send this message." : "Choose a product, then an artwork, to send this message.")
    : readOnly
      ? (current.closed ? `The discussion for ${fullLabel(current)} is closed. Its history stays readable; choose another topic to send.`
        : `${fullLabel(current)} is no longer available for new messages. Choose another topic to send.`)
      : null;

  const selectCls = "min-w-0 w-full sm:w-auto sm:min-w-[220px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-cyan-950 outline-none focus:border-cyan-900 disabled:bg-slate-50 disabled:text-slate-400";
  const suffix = (t: Topic) => t.closed ? " (closed)" : t.unavailable ? " (read-only)" : "";

  return (
    <div className="space-y-4" data-testid={testId}>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter conversation">
        {filters.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
            className={`rounded-full px-3 py-1 text-xs border transition-colors ${filter === f ? "bg-cyan-900 border-cyan-900 text-[#E8D88E]" : "bg-white border-slate-200 text-slate-600 hover:border-cyan-900/40"}`}
            data-testid={`filter-conversation-${f}`}>
            {f === "all" ? "All" : KIND_LABEL[f]} <span className="opacity-60">{counts[f]}</span>
          </button>
        ))}
        {(productTopics.length > 0 || artworkTopics.length > 0) && (
          <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
            <span>Show</span>
            <select value={scope} onChange={(e) => setScope(e.target.value)} aria-label="Show messages about"
              className="max-w-[260px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-cyan-950 outline-none focus:border-cyan-900" data-testid="select-conversation-scope">
              <option value="">Everything</option>
              {scopeProducts.length > 0 && (
                <optgroup label="Product (with its artworks)">
                  {scopeProducts.map((pid) => <option key={pid} value={`pp:${pid}`}>{productName(pid)}</option>)}
                </optgroup>
              )}
              {productTopics.length > 0 && (
                <optgroup label="Product discussion only">
                  {productTopics.map((t) => <option key={t.key} value={t.key}>{fullLabel(t)} ({msgCountByKey.get(t.key) ?? 0})</option>)}
                </optgroup>
              )}
              {artworkTopics.length > 0 && (
                <optgroup label="Artwork">
                  {artworkTopics.map((t) => <option key={t.key} value={t.key}>{fullLabel(t)} ({msgCountByKey.get(t.key) ?? 0})</option>)}
                </optgroup>
              )}
            </select>
          </label>
        )}
        {(scope || filter !== "all") && (
          <button type="button" onClick={() => { setScope(""); setFilter("all"); }} className="text-xs text-cyan-900 underline-offset-2 hover:underline" data-testid="button-conversation-show-all">Show all</button>
        )}
      </div>

      <div className="max-h-[520px] overflow-y-auto pr-1" data-testid={`${testId}-history`}>
        {visible.length === 0 ? (
          <div className="flex items-center gap-2 py-6 text-sm italic text-slate-400" data-testid="text-conversation-empty">
            <MessageSquare size={15} /> {filter === "all" && !scope ? "No messages yet. Start the conversation below." : "No messages match this view."}
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((m) => {
              const mine = m.sender === selfSender;
              const t = allTopics.get(messageTopicKey(m));
              const kind = t?.kind ?? "artwork";
              return (
                <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  <div className={`mb-1 flex max-w-full items-center gap-2 text-[10px] ${mine ? "flex-row-reverse" : ""}`}>
                    <span className={`truncate rounded-full border px-2 py-0.5 font-medium ${kind === "order" ? "border-slate-200 bg-slate-50 text-slate-600" : kind === "product" ? "border-cyan-900/20 bg-cyan-50 text-cyan-900" : "border-[#C9B45C]/40 bg-[#faf3d8] text-[#8a7628]"}`} data-testid={`label-topic-${m.id}`}>
                      {t ? fullLabel(t) : "General"}
                    </span>
                    <button type="button" onClick={() => reply(m)} aria-label={`Reply about ${t ? fullLabel(t) : "General"}`} className="inline-flex shrink-0 items-center gap-1 text-slate-400 hover:text-cyan-900" data-testid={`button-reply-${m.id}`}>
                      <CornerUpLeft size={11} /> Reply
                    </button>
                  </div>
                  <div className="w-full"><MessageList messages={[m]} selfSender={selfSender} empty="" /></div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div ref={composerRef} className="rounded-xl border border-[#C9B45C]/25 bg-[#fbf9f3] p-3 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span id={`${testId}-about`}>About</span>
          <div role="radiogroup" aria-labelledby={`${testId}-about`} className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {(["order", ...(productTopics.length ? ["product"] : []), ...(artworkTopics.length ? ["artwork"] : [])] as TopicKind[]).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={selKind === k} onClick={() => chooseKind(k)}
                className={`rounded-md px-3 py-1 text-xs ${selKind === k ? "bg-cyan-900 text-[#E8D88E]" : "text-slate-600 hover:bg-slate-50"}`}
                data-testid={`button-about-${k}`}>{KIND_LABEL[k]}</button>
            ))}
          </div>
        </div>

        {selKind === "product" && (
          <label className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="w-16">Product</span>
            <select value={current?.kind === "product" ? current.key : ""} onChange={(e) => onTopicChange(e.target.value)} className={selectCls} data-testid="select-conversation-product">
              <option value="" disabled>Choose product</option>
              {productTopics.map((t) => <option key={t.key} value={t.key}>{productName(t.id)}{suffix(t)}</option>)}
            </select>
          </label>
        )}

        {selKind === "artwork" && (
          <div className="flex flex-col gap-2">
            {needProductStep && (
              <label className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="w-16">Product</span>
                <select value={selGroup} onChange={(e) => chooseGroup(e.target.value)} className={selectCls} data-testid="select-conversation-artwork-product">
                  <option value="" disabled>Choose product</option>
                  {artGroups.map((g) => <option key={g} value={g}>{g === NO_PRODUCT ? "Order-level (no product)" : productName(Number(g.slice(2)))}</option>)}
                </select>
              </label>
            )}
            <label className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="w-16">Artwork</span>
              <select value={current?.kind === "artwork" ? current.key : ""} disabled={!selGroup} onChange={(e) => onTopicChange(e.target.value)} className={selectCls} data-testid="select-conversation-artwork">
                <option value="" disabled>{selGroup ? "Choose artwork" : "Choose a product first"}</option>
                {artworkTopics.filter((t) => groupOf(t) === selGroup).map((t) => (
                  <option key={t.key} value={t.key}>{artworkName(t)}{t.artworkCode && !artworkName(t).includes(t.artworkCode) ? ` · ${t.artworkCode}` : ""}{suffix(t)}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        <p className="text-xs text-cyan-950" aria-live="polite" data-testid="text-conversation-context">
          {current ? <>{replyTo ? "Replying about " : "Sending about "}<strong className="font-semibold">{fullLabel(current)}</strong></> : <span className="text-slate-500">No topic selected yet.</span>}
          {replyTo && (
            <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply" className="ml-2 inline-flex items-center align-middle text-slate-400 hover:text-cyan-900" data-testid="button-cancel-reply"><X size={12} /></button>
          )}
        </p>
        {readOnly && (
          <p className="flex items-start gap-1.5 text-xs text-slate-600" data-testid="text-topic-readonly"><Lock size={13} className="mt-0.5 shrink-0" />{blocked}</p>
        )}
        {!readOnly && current && current.kind !== "order" && scopedNotice && (
          <p className="flex items-start gap-1.5 text-xs text-[#8a7628]" data-testid="text-topic-unpublished"><Info size={13} className="mt-0.5 shrink-0" />{scopedNotice}</p>
        )}
        <Composer testId="composer-conversation" blocked={blocked}
          placeholder={current ? (current.kind === "order" ? "Write a general message" : `Write about ${fullLabel(current)}`) : "Write your message, then choose what it is about"}
          onSend={async (message, attachment) => {
            const t = resolveSendTopic(topicKeyValue, allTopics);
            if (!t) throw new Error("Choose an open topic before sending.");
            await onSend(t, message, attachment);
            setReplyTo(null);
            setFilter("all"); setScope("");
          }} />
      </div>
    </div>
  );
}
