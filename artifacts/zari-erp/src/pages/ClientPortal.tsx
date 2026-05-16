import { useState, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, ChevronRight, ZoomIn, Send, Paperclip, X,
  CheckCheck, Loader2, ChevronDown, ChevronUp, CheckCircle,
  RotateCcw, Clock, Sparkles,
} from "lucide-react";

interface FileAttachment { name: string; type: string; data: string; size: number }

interface PortalMessage {
  id: number;
  artworkId: number;
  sender: "client" | "team";
  message: string | null;
  attachment: FileAttachment | null;
  createdAt: string;
}

interface PortalArtwork {
  id: number;
  artworkCode: string;
  artworkName: string;
  feedbackStatus: string;
  wipImages: FileAttachment[];
  finalImages: FileAttachment[];
  isClosed: boolean;
  decision: "Approve" | "Rework" | null;
}

interface PortalOrder {
  id: number;
  orderCode: string;
  swatchName: string;
  clientName: string | null;
  description: string | null;
  quantity: string | null;
  fabricName: string | null;
  deliveryDate: string | null;
  orderStatus: string;
  priority: string;
  isChargeable: boolean;
  department: string | null;
}

interface PortalData {
  link: { id: number; token: string; portalTitle: string | null };
  order: PortalOrder;
  artworks: PortalArtwork[];
  messages: PortalMessage[];
}

function Lightbox({ images, startIndex, onClose }: { images: FileAttachment[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const img = images[idx];
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 rounded-full p-3 z-10 transition-colors">
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
        )}
        <img src={img.data} alt={img.name} className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl" />
        {idx < images.length - 1 && (
          <button onClick={() => setIdx(i => i + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 rounded-full p-3 z-10 transition-colors">
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        )}
        <button onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors">
          <X className="h-5 w-5 text-white" />
        </button>
        <div className="absolute bottom-6 text-white/50 text-xs">{img.name} &middot; {idx + 1} / {images.length}</div>
      </div>
    </div>
  );
}

function ImageStrip({ images, label }: { images: FileAttachment[]; label: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (!images.length) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#a8922e] uppercase tracking-widest mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {images.map((img, i) => (
          <button key={i} onClick={() => setLightbox(i)}
            className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#e8dfc0] hover:border-[#C6AF4B] transition-all group shadow-md hover:shadow-lg">
            <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="h-6 w-6 text-white drop-shadow" />
            </div>
          </button>
        ))}
      </div>
      {lightbox !== null && <Lightbox images={images} startIndex={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function ChatBubble({ msg }: { msg: PortalMessage }) {
  const isTeam = msg.sender === "team";
  return (
    <div className={`flex gap-2.5 ${isTeam ? "justify-start" : "justify-end"}`}>
      {isTeam && (
        <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-[#C6AF4B]"
          style={{ background: "linear-gradient(135deg, #1a1a1a, #333)" }}>Z</div>
      )}
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 space-y-1.5 shadow-sm ${
        isTeam ? "bg-white text-gray-900 rounded-tl-sm border border-gray-100" : "rounded-tr-sm text-white"
      }`} style={!isTeam ? { background: "linear-gradient(135deg, #C6AF4B, #a8922e)" } : {}}>
        {msg.message && <p className="text-sm leading-snug">{msg.message}</p>}
        {msg.attachment && (
          <div className={`rounded-xl overflow-hidden border ${isTeam ? "border-gray-100" : "border-white/20"}`}>
            {msg.attachment.type.startsWith("image/") ? (
              <img src={msg.attachment.data} alt={msg.attachment.name} className="max-w-[180px] object-cover" />
            ) : (
              <a href={msg.attachment.data} download={msg.attachment.name}
                className={`flex items-center gap-2 px-3 py-2 text-xs hover:underline ${isTeam ? "text-[#a8922e]" : "text-white/90"}`}>
                <Paperclip className="h-3.5 w-3.5" />{msg.attachment.name}
              </a>
            )}
          </div>
        )}
        <p className={`text-[10px] ${isTeam ? "text-gray-400" : "text-white/60 text-right"}`}>
          {isTeam ? "ZARI Team" : "You"} &middot; {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {!isTeam && (
        <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-gray-600">YOU</div>
      )}
    </div>
  );
}

function ArtworkThread({ artwork, messages, token, onRefetch }: {
  artwork: PortalArtwork;
  messages: PortalMessage[];
  token: string;
  onRefetch: () => void;
}) {
  const [open, setOpen] = useState(!artwork.isClosed);
  const [text, setText] = useState("");
  const [attachFile, setAttachFile] = useState<FileAttachment | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasImages = artwork.wipImages.length > 0 || artwork.finalImages.length > 0;

  const sendMsg = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/client-portal/${token}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId: artwork.id, artworkName: artwork.artworkName, message: text.trim() || undefined, attachment: attachFile ?? undefined }),
      });
      if (!r.ok) { const j = await r.json() as { error?: string }; throw new Error(j.error ?? "Failed"); }
    },
    onSuccess: () => { setText(""); setAttachFile(null); onRefetch(); },
  });

  const submitDecision = useMutation({
    mutationFn: async (decision: "Approve" | "Rework") => {
      const r = await fetch(`/api/client-portal/${token}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId: artwork.id, artworkName: artwork.artworkName, decision }),
      });
      if (!r.ok) { const j = await r.json() as { error?: string }; throw new Error(j.error ?? "Failed"); }
    },
    onSuccess: () => { onRefetch(); },
  });

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAttachFile({ name: file.name, type: file.type, data: ev.target?.result as string, size: file.size });
    reader.readAsDataURL(file);
  }

  return (
    <div className={`rounded-3xl overflow-hidden shadow-md transition-all ${
      artwork.isClosed
        ? "border border-green-100 bg-white/60"
        : "border border-[#e8dfc0] bg-white"
    }`}>
      {/* Artwork header */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#fdfaf4] transition-colors">
        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold ${
          artwork.isClosed ? "bg-green-100 text-green-600" : "bg-[#f5edcc] text-[#a8922e]"
        }`}>
          {artwork.isClosed ? <CheckCheck className="h-5 w-5" /> : <Sparkles className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm font-bold truncate ${artwork.isClosed ? "text-gray-400" : "text-gray-900"}`}>
              {artwork.artworkName}
            </h3>
            <span className="text-[10px] font-mono text-gray-400">{artwork.artworkCode}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {artwork.isClosed ? (
              <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Approved
              </span>
            ) : artwork.decision === "Rework" ? (
              <span className="text-[11px] font-semibold text-orange-500 flex items-center gap-1">
                <RotateCcw className="h-3 w-3" /> Rework Requested
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[#a8922e] flex items-center gap-1">
                <Clock className="h-3 w-3" /> Awaiting Your Review
              </span>
            )}
            {messages.length > 0 && (
              <span className="text-[10px] text-gray-400">&middot; {messages.length} message{messages.length !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-gray-300">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#f0e8d0]">

          {/* Images */}
          {hasImages && (
            <div className="px-5 py-5 space-y-4 bg-[#fdfaf4]">
              <ImageStrip images={artwork.wipImages} label="Work in Progress" />
              <ImageStrip images={artwork.finalImages} label="Final Artwork" />
            </div>
          )}

          {/* Chat */}
          <div className="px-5 py-4 space-y-3 min-h-[60px]">
            {messages.length === 0 && !artwork.isClosed && (
              <p className="text-sm text-gray-400 italic text-center py-3">
                No messages yet — use the chat below or submit your decision.
              </p>
            )}
            {messages.map(m => <ChatBubble key={m.id} msg={m} />)}
          </div>

          {artwork.isClosed ? (
            <div className="mx-5 mb-5 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-green-50 border border-green-100">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-700">Artwork Approved</p>
                <p className="text-xs text-green-600 mt-0.5">Your approval has been recorded. Thank you!</p>
              </div>
            </div>
          ) : (
            <div className="px-5 pb-5 space-y-4">
              {/* Chat input */}
              <div className="space-y-2">
                {attachFile && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#fdf6e0] border border-[#e8dfc0] text-xs text-[#a8922e]">
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate flex-1">{attachFile.name}</span>
                    <button onClick={() => setAttachFile(null)} className="shrink-0 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg.mutate(); } }}
                    placeholder="Leave a comment or question…"
                    rows={2}
                    className="flex-1 text-sm text-gray-900 border border-[#e0d5b0] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C6AF4B]/30 resize-none placeholder:text-gray-400 bg-[#fdfaf4]"
                  />
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => fileRef.current?.click()}
                      className="flex items-center justify-center h-10 w-10 rounded-xl border border-[#e0d5b0] text-gray-400 hover:bg-[#fdfaf4] transition-colors">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => sendMsg.mutate()}
                      disabled={sendMsg.isPending || (!text.trim() && !attachFile)}
                      style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
                      className="flex items-center justify-center h-10 w-10 rounded-xl text-white disabled:opacity-40 transition-all">
                      {sendMsg.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                  <input ref={fileRef} type="file" className="hidden" onChange={pickFile} />
                </div>
              </div>

              {/* Decision buttons */}
              <div className="border-t border-[#f0e8d0] pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">Submit Your Decision</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => submitDecision.mutate("Approve")}
                    disabled={submitDecision.isPending}
                    style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 hover:brightness-105">
                    {submitDecision.isPending && submitDecision.variables === "Approve"
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <CheckCircle className="h-4 w-4" />}
                    Approve Artwork
                  </button>
                  <button
                    onClick={() => submitDecision.mutate("Rework")}
                    disabled={submitDecision.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-600 text-sm font-bold hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-60">
                    {submitDecision.isPending && submitDecision.variables === "Rework"
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <RotateCcw className="h-4 w-4" />}
                    Request Rework
                  </button>
                </div>
                {artwork.decision === "Rework" && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    <span>Rework requested — continue chatting or approve when ready.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientPortal() {
  const [, params] = useRoute("/client/:token");
  const token = params?.token ?? "";
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<PortalData>({
    queryKey: ["client-portal", token],
    enabled: !!token,
    queryFn: async () => {
      const r = await fetch(`/api/client-portal/${token}`);
      if (!r.ok) { const j = await r.json() as { error?: string }; throw new Error(j.error ?? "Failed"); }
      const j = await r.json() as { data: PortalData };
      return j.data;
    },
  });

  function refetch() { void qc.invalidateQueries({ queryKey: ["client-portal", token] }); }

  if (!token) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F6F0" }}>
        <div className="flex flex-col items-center gap-5 text-gray-500">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#C6AF4B]"
            style={{ background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)" }}>Z</div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-[#C6AF4B]/30 border-t-[#C6AF4B] animate-spin" />
            <p className="text-sm text-gray-400">Loading your review portal…</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    const notPublished = msg === "This link is not yet published";
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F8F6F0" }}>
        <div className="text-center max-w-sm">
          <div className="h-20 w-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: notPublished ? "#fef3c7" : "#fee2e2" }}>
            {notPublished ? "⏳" : "🔒"}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{notPublished ? "Not Yet Active" : "Link Not Found"}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            {notPublished
              ? "This review link hasn't been published yet. Please contact the ZARI team."
              : "This link may be invalid or has expired. Please request a new link."}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { order, artworks, messages = [] } = data;
  const openArtworks = artworks.filter(a => !a.isClosed);
  const closedArtworks = artworks.filter(a => a.isClosed);
  const sortedArtworks = [...openArtworks, ...closedArtworks];
  const pendingCount = openArtworks.filter(a => !a.decision).length;
  const allApproved = artworks.length > 0 && closedArtworks.length === artworks.length;

  return (
    <div className="min-h-screen" style={{ background: "#F8F6F0" }}>

      {/* Header */}
      <div className="sticky top-0 z-20 shadow-lg" style={{ background: "linear-gradient(135deg, #111 60%, #222)" }}>
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-gray-900"
              style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}>Z</div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Client Review Portal</p>
              <p className="text-sm font-bold text-white leading-tight mt-0.5">{data.link.portalTitle ?? "ZARI Embroideries"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Order</p>
            <p className="text-sm font-mono font-bold text-[#C6AF4B]">{order.orderCode}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Hero card */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-[#e8dfc0]" style={{ background: "linear-gradient(135deg, #fff 60%, #fdfaf4)" }}>
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[11px] font-semibold text-[#a8922e] uppercase tracking-widest mb-1.5">Swatch Order</p>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{order.swatchName}</h1>
              </div>
              <span className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold mt-1 ${
                order.orderStatus === "Completed" ? "bg-green-100 text-green-700" :
                order.orderStatus === "In Artwork" ? "bg-blue-100 text-blue-700" :
                order.orderStatus === "Pending Approval" ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-600"
              }`}>{order.orderStatus}</span>
            </div>

            {/* Quick details row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 border-t border-[#f0e8d0] pt-4">
              {order.clientName && (
                <span><span className="text-gray-400">Client</span> · <span className="font-semibold text-gray-700">{order.clientName}</span></span>
              )}
              {order.fabricName && (
                <span><span className="text-gray-400">Fabric</span> · <span className="font-semibold text-gray-700">{order.fabricName}</span></span>
              )}
              {order.quantity && (
                <span><span className="text-gray-400">Qty</span> · <span className="font-semibold text-gray-700">{order.quantity}</span></span>
              )}
              {order.deliveryDate && (
                <span><span className="text-gray-400">Delivery</span> · <span className="font-semibold text-gray-700">{new Date(order.deliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></span>
              )}
              {order.priority && order.priority !== "Normal" && (
                <span className="font-semibold text-red-500">⚡ {order.priority}</span>
              )}
            </div>
          </div>

          {/* All-approved banner */}
          {allApproved && (
            <div className="mx-4 mb-4 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-green-50 border border-green-100">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-700">All Artworks Approved!</p>
                <p className="text-xs text-green-600 mt-0.5">Thank you — the ZARI team has been notified.</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {order.description && (
          <div className="bg-white rounded-3xl border border-[#e8dfc0] px-6 py-5 shadow-sm">
            <p className="text-[11px] font-semibold text-[#a8922e] uppercase tracking-widest mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{order.description}</p>
          </div>
        )}

        {/* Artworks section header */}
        <div className="flex items-center justify-between px-1 pt-2">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Artworks for Review
          </p>
          {pendingCount > 0
            ? <span className="text-xs font-bold text-[#a8922e] bg-[#fdf6e0] px-3 py-1 rounded-full border border-[#e8dfc0]">
                {pendingCount} awaiting decision
              </span>
            : artworks.length > 0
            ? <span className="text-xs text-green-600 font-semibold">
                {closedArtworks.length}/{artworks.length} approved
              </span>
            : null
          }
        </div>

        {artworks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e8dfc0] px-6 py-14 text-center shadow-sm">
            <div className="text-4xl mb-3">🎨</div>
            <p className="text-sm font-semibold text-gray-500">No artworks shared yet</p>
            <p className="text-xs text-gray-400 mt-1">The team will add artworks here for your review.</p>
          </div>
        ) : (
          sortedArtworks.map(aw => (
            <ArtworkThread
              key={aw.id}
              artwork={aw}
              messages={messages.filter(m => m.artworkId === aw.id)}
              token={token}
              onRefetch={refetch}
            />
          ))
        )}

        {/* Footer */}
        <div className="text-center py-6 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-900"
              style={{ background: "linear-gradient(135deg, #C6AF4B, #a8922e)" }}>Z</div>
            <span className="text-xs font-semibold text-gray-500">ZARI Embroideries</span>
          </div>
          <p className="text-[11px] text-gray-400">Powered by ZARI ERP &middot; Secure Client Review Portal</p>
        </div>

      </div>
    </div>
  );
}
