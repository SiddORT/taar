import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCheck, RotateCcw, LockKeyhole, UnlockKeyhole, Loader2, MessageSquare } from "lucide-react";

interface Img { name: string; type: string; data: string; size: number }

/** Admin artwork row: images, decision status, close/reopen, and a Discuss shortcut into the unified order conversation. */
export default function StaffArtworkCard({ aw, productName, messageCount, clientCount, isClosed, decision, toggling, onToggleClose, onDiscuss, onLightbox }: {
  aw: { id: number; artworkCode: string; artworkName: string; wipImages: Img[]; finalImages: Img[] };
  productName?: string | null;
  messageCount: number; clientCount: number;
  isClosed: boolean; decision: "Approve" | "Rework" | null; toggling: boolean;
  onToggleClose: () => void; onDiscuss: () => void;
  onLightbox: (artworkId: number, type: "wip" | "final", idx: number) => void;
}) {
  const [open, setOpen] = useState(!isClosed);
  const hasImages = aw.wipImages.length > 0 || aw.finalImages.length > 0;
  return (
    <div className={`border rounded-xl overflow-hidden ${isClosed ? "border-gray-100 bg-gray-50/50" : "border-gray-200 bg-white"}`} data-testid={`card-artwork-${aw.id}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50" data-testid={`button-toggle-artwork-${aw.id}`}>
        <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-gray-400 shrink-0">{aw.artworkCode}</span>
          <span className={`text-sm font-semibold truncate ${isClosed ? "text-gray-400" : "text-cyan-900"}`}>{aw.artworkName}</span>
          {productName && <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[#C9B45C]/15 text-[#8a7a30] font-medium border border-[#C9B45C]/25">{productName}</span>}
          {isClosed ? (
            <span className="shrink-0 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium"><CheckCheck className="h-3 w-3" /> Closed</span>
          ) : decision === "Rework" ? (
            <span className="shrink-0 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium"><RotateCcw className="h-3 w-3" /> Rework Requested</span>
          ) : decision === "Approve" ? (
            <span className="shrink-0 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium"><CheckCheck className="h-3 w-3" /> Approved</span>
          ) : null}
          {!isClosed && clientCount > 0 && (
            <span className="shrink-0 flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">{clientCount}</span>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0">{messageCount} msg{messageCount !== 1 ? "s" : ""}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          {hasImages && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Images</p>
              {(["wip", "final"] as const).map(type => {
                const imgs = type === "wip" ? aw.wipImages : aw.finalImages;
                if (!imgs.length) return null;
                return (
                  <div key={type}>
                    <p className="text-xs text-gray-400 mb-2">{type === "wip" ? "WIP" : "Final"}</p>
                    <div className="flex flex-wrap gap-2">
                      {imgs.map((img, i) => (
                        <button key={i} onClick={() => onLightbox(aw.id, type, i)} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-[#C9B45C]" data-testid={`img-artwork-${aw.id}-${type}-${i}`}>
                          <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isClosed && <p className="mr-auto text-xs text-green-700">Discussion closed. Client cannot send artwork messages.</p>}
            <button onClick={onDiscuss} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-cyan-900 hover:bg-gray-50" data-testid={`button-discuss-artwork-${aw.id}`}>
              <MessageSquare className="h-3 w-3" /> {isClosed ? "View discussion" : "Discuss"}
            </button>
            <button onClick={onToggleClose} disabled={toggling} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-60 ${isClosed ? "border border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-cyan-900 text-[#C9B45C]"}`} data-testid={`button-toggle-close-${aw.id}`}>
              {toggling ? <Loader2 className="h-3 w-3 animate-spin" /> : isClosed ? <UnlockKeyhole className="h-3 w-3" /> : <LockKeyhole className="h-3 w-3" />}
              {isClosed ? "Reopen" : "Mark Thread Done"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
