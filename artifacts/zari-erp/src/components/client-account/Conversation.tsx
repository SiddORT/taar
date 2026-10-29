import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Loader2, Paperclip, Send, X, Lock } from "lucide-react";
import type { ClientAccountAttachment } from "@workspace/api-client-react";
import { ACCEPT, MAX_TEXT, fmtDate, readAttachment } from "./api";

export type ThreadMessage = {
  id: number; sender: string; message: string | null;
  attachment: ClientAccountAttachment | null; createdAt: string;
};

export function Lightbox({ items, start, onClose }: { items: ClientAccountAttachment[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => Math.min(items.length - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [items.length, onClose]);
  const it = items[i];
  if (!it) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-[#0b2a33]/92 flex items-center justify-center" onClick={onClose} data-testid="lightbox">
      <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {i > 0 && <button aria-label="Previous" onClick={() => setI(i - 1)} className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" data-testid="button-lightbox-prev"><ChevronLeft /></button>}
        <img src={it.data} alt={it.name} referrerPolicy="no-referrer" className="max-h-[85vh] max-w-[88vw] object-contain rounded-lg shadow-2xl" />
        {i < items.length - 1 && <button aria-label="Next" onClick={() => setI(i + 1)} className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" data-testid="button-lightbox-next"><ChevronRight /></button>}
        <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" data-testid="button-lightbox-close"><X size={20} /></button>
        <div className="absolute bottom-5 text-sm text-white/70">{it.name} · {i + 1} / {items.length}</div>
      </div>
    </div>
  );
}

function AttachmentView({ a, mine }: { a: ClientAccountAttachment; mine: boolean }) {
  const [open, setOpen] = useState(false);
  if (a.type?.startsWith("image/")) return (
    <>
      <button onClick={() => setOpen(true)} className="block mt-1.5" data-testid="button-attachment-image">
        <img src={a.data} alt={a.name} referrerPolicy="no-referrer" className="max-h-40 w-full max-w-[220px] rounded-lg border border-black/5 object-cover" />
      </button>
      {open && <Lightbox items={[a]} start={0} onClose={() => setOpen(false)} />}
    </>
  );
  return (
    <a href={a.data} download={a.name} rel="noopener noreferrer" className={`mt-1.5 inline-flex max-w-full items-center gap-1.5 text-xs underline-offset-2 hover:underline ${mine ? "text-[#E8D88E]" : "text-cyan-900"}`} data-testid="link-attachment">
      <FileText size={14} className="shrink-0" /><span className="min-w-0 break-all">{a.name}</span>
    </a>
  );
}

/** `selfSender` is the sender value rendered on the right ("client" in the portal, "team" for staff). */
export function MessageList({ messages, selfSender, empty }: { messages: ThreadMessage[]; selfSender: string; empty: string }) {
  if (messages.length === 0) return <p className="text-sm italic text-slate-400 py-2" data-testid="text-thread-empty">{empty}</p>;
  return (
    <ul className="space-y-3">
      {messages.map((m) => {
        const mine = m.sender === selfSender;
        return (
          <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`} data-testid={`message-${m.id}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${mine ? "bg-cyan-900 text-white rounded-br-sm" : "bg-[#f3eedd] text-slate-800 rounded-bl-sm"}`}>
              {m.message && <p className="text-sm whitespace-pre-wrap break-words leading-snug">{m.message}</p>}
              {m.attachment && <AttachmentView a={m.attachment} mine={mine} />}
              <p className={`mt-1 text-[10px] ${mine ? "text-white/50 text-right" : "text-slate-400"}`}>
                {m.sender === "team" ? "TAAR team" : "Client"} · {fmtDate(m.createdAt, true)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Composer({ onSend, disabled, placeholder = "Write a message", testId = "composer" }: {
  onSend: (message: string | undefined, attachment: ClientAccountAttachment | undefined) => Promise<void>;
  disabled?: boolean; placeholder?: string; testId?: string;
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<ClientAccountAttachment | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const over = text.length > MAX_TEXT;

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    setErr(null);
    try { setFile(await readAttachment(f)); } catch (x) { setErr(x instanceof Error ? x.message : "Could not attach file."); }
  }
  async function send() {
    if (busy || over || (!text.trim() && !file)) return;
    setBusy(true); setErr(null);
    try { await onSend(text.trim() || undefined, file ?? undefined); setText(""); setFile(null); }
    catch (x) { setErr(x instanceof Error ? x.message : "Could not send."); }
    finally { setBusy(false); }
  }
  if (disabled) return (
    <div className="flex items-center gap-2 rounded-xl border border-[#C9B45C]/30 bg-[#faf6e8] px-3 py-2.5 text-xs text-slate-500" data-testid={`${testId}-closed`}>
      <Lock size={13} /> This thread is closed and read-only.
    </div>
  );
  return (
    <div className="space-y-2" data-testid={testId}>
      {file && (
        <div className="flex items-center gap-2 rounded-lg border border-cyan-900/15 bg-cyan-50/60 px-3 py-1.5 text-xs text-cyan-900">
          <Paperclip size={13} /><span className="truncate flex-1">{file.name}</span>
          <button aria-label="Remove attachment" onClick={() => setFile(null)} data-testid={`${testId}-remove-file`}><X size={13} /></button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-900 focus:ring-2 focus:ring-cyan-900/10"
          data-testid={`${testId}-input`} />
        <button type="button" aria-label="Attach file" onClick={() => ref.current?.click()} className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50" data-testid={`${testId}-attach`}><Paperclip size={16} /></button>
        <button type="button" aria-label="Send" onClick={() => void send()} disabled={busy || over || (!text.trim() && !file)} className="h-9 w-9 shrink-0 rounded-xl bg-cyan-900 text-[#C9B45C] flex items-center justify-center disabled:opacity-50" data-testid={`${testId}-send`}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
        <input ref={ref} type="file" accept={ACCEPT} className="hidden" onChange={(e) => void pick(e)} />
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-red-600" role={err ? "alert" : undefined}>{err ?? (over ? "Message is too long." : "")}</span>
        <span className={over ? "text-red-600" : "text-slate-400"}>{text.length} / {MAX_TEXT} · JPEG, PNG, WebP, GIF, PDF, TXT up to 5 MB</span>
      </div>
    </div>
  );
}
