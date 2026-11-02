import { useEffect, useMemo, useRef, useState } from "react";
import { Lock, Info, CornerUpLeft, MessageSquare } from "lucide-react";
import type { ClientAccountAttachment } from "@workspace/api-client-react";
import { Composer, MessageList } from "./Conversation";

export type TopicKind = "order" | "product" | "artwork";
export type Topic = {
  key: string; kind: TopicKind; id?: number; label: string;
  /** Closed topics remain selectable for reading but cannot be written to. */
  closed?: boolean;
  /** Not writable for another reason (e.g. no longer shared). */
  unavailable?: boolean;
};
export type UnifiedMessage = {
  id: number; targetType?: TopicKind | null; artworkId: number | null; productId?: number | null;
  artworkName?: string | null; sender: string; message: string | null;
  attachment: ClientAccountAttachment | null; createdAt: string;
};

export const GENERAL_KEY = "order";
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
  topicKeyValue: string;
  onTopicChange: (key: string) => void;
  /** Increment to scroll to and focus the composer (Discuss / Reply). */
  focusSignal: number;
  onSend: (topic: Topic, message: string | undefined, attachment: ClientAccountAttachment | undefined) => Promise<void>;
  /** Optional warning shown when a non-General topic is selected (e.g. staff before publishing). */
  scopedNotice?: string | null;
  testId?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const composerRef = useRef<HTMLDivElement>(null);

  // Topics known from config, plus any referenced by history (legacy / no longer shared) as read-only.
  const allTopics = useMemo(() => {
    const map = new Map<string, Topic>(topics.map((t) => [t.key, t]));
    for (const m of messages) {
      const k = messageTopicKey(m);
      if (map.has(k)) continue;
      const kind = (m.targetType ?? "artwork") as TopicKind;
      const id = kind === "product" ? m.productId ?? undefined : m.artworkId ?? undefined;
      const label = m.artworkName || `${KIND_LABEL[kind]} #${id ?? "?"}`;
      map.set(k, { key: k, kind, id, label, unavailable: true });
    }
    // A refresh can withdraw the selected topic. Preserve that selection as
    // read-only instead of silently sending an existing draft to General.
    if (!map.has(topicKeyValue) && topicKeyValue !== GENERAL_KEY) {
      const [kind, rawId] = topicKeyValue.split(":");
      if (kind === "product" || kind === "artwork") {
        map.set(topicKeyValue, { key: topicKeyValue, kind, id: Number(rawId),
          label: `${KIND_LABEL[kind]} #${rawId}`, unavailable: true });
      }
    }
    return map;
  }, [topics, messages, topicKeyValue]);

  const current = allTopics.get(topicKeyValue) ?? allTopics.get(GENERAL_KEY) ?? { key: GENERAL_KEY, kind: "order" as const, label: "General" };
  const sorted = useMemo(() => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id - b.id), [messages]);
  const visible = filter === "all" ? sorted : sorted.filter((m) => ((m.targetType ?? "artwork") as TopicKind) === filter);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: messages.length, order: 0, product: 0, artwork: 0 };
    for (const m of messages) c[(m.targetType ?? "artwork") as TopicKind]++;
    return c;
  }, [messages]);

  useEffect(() => {
    if (!focusSignal) return;
    const el = composerRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const ta = el?.querySelector("textarea");
    window.setTimeout(() => ta?.focus(), 250);
  }, [focusSignal]);

  function reply(m: UnifiedMessage) {
    onTopicChange(messageTopicKey(m));
    const el = composerRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => el?.querySelector("textarea")?.focus(), 250);
  }

  const readOnly = !!(current.closed || current.unavailable);
  const options = [...allTopics.values()];
  const groups: TopicKind[] = ["order", "product", "artwork"];
  const filters: Filter[] = ["all", "order", ...(options.some((t) => t.kind === "product") ? ["product" as const] : []), ...(options.some((t) => t.kind === "artwork") ? ["artwork" as const] : [])];

  const listMsgs = visible.map((m) => {
    const t = allTopics.get(messageTopicKey(m));
    return { ...m, topic: t };
  });

  return (
    <div className="space-y-4" data-testid={testId}>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter conversation">
        {filters.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
            className={`rounded-full px-3 py-1 text-xs border transition-colors ${filter === f ? "bg-cyan-900 border-cyan-900 text-[#E8D88E]" : "bg-white border-slate-200 text-slate-600 hover:border-cyan-900/40"}`}
            data-testid={`filter-conversation-${f}`}>
            {f === "all" ? "All" : KIND_LABEL[f]} <span className="opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="max-h-[520px] overflow-y-auto pr-1" data-testid={`${testId}-history`}>
        {listMsgs.length === 0 ? (
          <div className="flex items-center gap-2 py-6 text-sm italic text-slate-400" data-testid="text-conversation-empty">
            <MessageSquare size={15} /> {filter === "all" ? "No messages yet. Start the conversation below." : `No ${KIND_LABEL[filter].toLowerCase()} messages yet.`}
          </div>
        ) : (
          <ul className="space-y-3">
            {listMsgs.map((m) => {
              const mine = m.sender === selfSender;
              const kind = (m.targetType ?? "artwork") as TopicKind;
              return (
                <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  <div className={`mb-1 flex items-center gap-2 text-[10px] ${mine ? "flex-row-reverse" : ""}`}>
                    <span className={`rounded-full border px-2 py-0.5 font-medium ${kind === "order" ? "border-slate-200 bg-slate-50 text-slate-600" : kind === "product" ? "border-cyan-900/20 bg-cyan-50 text-cyan-900" : "border-[#C9B45C]/40 bg-[#faf3d8] text-[#8a7628]"}`} data-testid={`label-topic-${m.id}`}>
                      {kind === "order" ? "General" : `${KIND_LABEL[kind]}: ${m.topic?.label ?? ""}`}
                    </span>
                    <button type="button" onClick={() => reply(m)} className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-900" data-testid={`button-reply-${m.id}`}>
                      <CornerUpLeft size={11} /> Reply
                    </button>
                  </div>
                  <div className="w-full">
                    <MessageList messages={[m]} selfSender={selfSender} empty="" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div ref={composerRef} className="rounded-xl border border-[#C9B45C]/25 bg-[#fbf9f3] p-3 space-y-2.5">
        <label className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Topic</span>
          <select value={current.key} onChange={(e) => onTopicChange(e.target.value)}
            className="min-w-0 flex-1 sm:flex-none sm:min-w-[220px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-cyan-950 outline-none focus:border-cyan-900"
            data-testid="select-conversation-topic">
            {groups.map((g) => {
              const opts = options.filter((t) => t.kind === g);
              if (!opts.length) return null;
              if (g === "order") return opts.map((t) => <option key={t.key} value={t.key}>General</option>);
              return (
                <optgroup key={g} label={KIND_LABEL[g]}>
                  {opts.map((t) => <option key={t.key} value={t.key}>{t.label}{t.closed ? " (closed)" : t.unavailable ? " (read-only)" : ""}</option>)}
                </optgroup>
              );
            })}
          </select>
        </label>
        {readOnly && (
          <p className="flex items-start gap-1.5 text-xs text-slate-600" data-testid="text-topic-readonly">
            <Lock size={13} className="mt-0.5 shrink-0" />
            {current.closed ? `The discussion for ${current.label} is closed. You can read its history; choose another topic to send a message.`
              : `${current.label} is no longer available for new messages. Choose another topic to send a message.`}
          </p>
        )}
        {!readOnly && current.kind !== "order" && scopedNotice && (
          <p className="flex items-start gap-1.5 text-xs text-[#8a7628]" data-testid="text-topic-unpublished"><Info size={13} className="mt-0.5 shrink-0" />{scopedNotice}</p>
        )}
        <Composer testId="composer-conversation" disabled={readOnly}
          placeholder={current.kind === "order" ? "Write a general message" : `Write about ${current.label}`}
          onSend={async (message, attachment) => {
            await onSend(current, message, attachment);
            setFilter("all");
          }} />
      </div>
    </div>
  );
}
