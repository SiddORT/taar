import { useState } from "react";
import {
  Link2, Copy, Check, ExternalLink, Eye, EyeOff, RefreshCw,
  Globe, GlobeLock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useClientLink, useClientMessages, useClientFeedback, useUpdateClientLink,
  useRegenerateLink, useToggleThread,
} from "@/hooks/useClientLink";
import StaffOrderConversation from "@/components/client-account/StaffScopedThread";
import StaffArtworkCard from "@/components/client-account/StaffArtworkCard";
import { GENERAL_KEY, topicKey, type Topic } from "@/components/client-account/UnifiedConversation";
import { useArtworkList } from "@/hooks/useArtworks";

interface FileAttachment { name: string; type: string; data: string; size: number }

function Lightbox({ images, startIndex, onClose }: { images: FileAttachment[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const img = images[idx];
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 z-10">
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
        )}
        <img src={img.data} alt={img.name} className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl" />
        {idx < images.length - 1 && (
          <button onClick={() => setIdx(i => i + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 z-10">
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        )}
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-light">✕</button>
        <div className="absolute bottom-4 text-white/60 text-sm">{img.name} · {idx + 1} / {images.length}</div>
      </div>
    </div>
  );
}


export default function ClientLinkTab({ swatchOrderId }: { swatchOrderId: number }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState<{ artworkId: number; type: "wip" | "final"; idx: number } | null>(null);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [showImageControls, setShowImageControls] = useState(false);

  const { data: link, isLoading: linkLoading } = useClientLink(swatchOrderId);
  const { data: artworks, isLoading: artworksLoading } = useArtworkList(swatchOrderId);
  const { data: messages } = useClientMessages(link?.id ?? null);
  const { data: feedbackList } = useClientFeedback(link?.id ?? null);

  const updateLink = useUpdateClientLink();
  const regenLink = useRegenerateLink();
  const toggleThread = useToggleThread();
  const [topicSel, setTopicSel] = useState(GENERAL_KEY);
  const [focusSig, setFocusSig] = useState(0);
  function discuss(k: string) { setTopicSel(k); setFocusSig(n => n + 1); }

  const portalUrl = link
    ? `${window.location.origin}${import.meta.env.BASE_URL}client/${link.token}`
    : "";

  function copyLink() {
    void navigator.clipboard.writeText(portalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function togglePublish() {
    if (!link) return;
    updateLink.mutate({ id: link.id, data: { isPublished: !link.isPublished } }, {
      onSuccess: () => toast({ title: link.isPublished ? "Link unpublished" : "Link published!" }),
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });
  }

  function toggleImage(artworkId: number, imageType: "wip" | "final", imageIndex: number) {
    if (!link) return;
    const hidden = link.hiddenImages ?? [];
    const exists = hidden.some(h => h.artworkId === artworkId && h.imageType === imageType && h.imageIndex === imageIndex);
    const updated = exists
      ? hidden.filter(h => !(h.artworkId === artworkId && h.imageType === imageType && h.imageIndex === imageIndex))
      : [...hidden, { artworkId, imageType, imageIndex }];
    updateLink.mutate({ id: link.id, data: { hiddenImages: updated } });
  }

  function isHidden(artworkId: number, imageType: "wip" | "final", imageIndex: number) {
    return (link?.hiddenImages ?? []).some(h => h.artworkId === artworkId && h.imageType === imageType && h.imageIndex === imageIndex);
  }

  function handleRegenerate() {
    if (!link) return;
    regenLink.mutate({ id: link.id, swatchOrderId: link.swatchOrderId! }, {
      onSuccess: () => { setConfirmRegen(false); toast({ title: "Link regenerated" }); },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });
  }

  if (linkLoading || artworksLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  type ArtworkRow = {
    id: number; artworkCode: string; artworkName: string; feedbackStatus: string;
    wipImages: FileAttachment[]; finalImages: FileAttachment[];
  };

  const artworkList = (artworks?.data ?? []) as ArtworkRow[];
  const closedThreads = link?.closedThreads ?? [];

  const openArtworks = artworkList.filter(a => !closedThreads.includes(a.id));
  const closedArtworks = artworkList.filter(a => closedThreads.includes(a.id));
  const sortedArtworks = [...openArtworks, ...closedArtworks];

  const topics: Topic[] = [
    { key: GENERAL_KEY, kind: "order", label: "General" },
    ...artworkList.map(a => ({ key: topicKey("artwork", a.id), kind: "artwork" as const, id: a.id, label: a.artworkName, closed: closedThreads.includes(a.id) })),
  ];

  return (
    <div className="space-y-5">

      {/* ── Link Management ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-cyan-900">
            <Link2 className="h-4 w-4 text-[#C9B45C]" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-cyan-900">Shareable Client Link</h2>
            <p className="text-xs text-gray-400">Publish controls this public link only. Signed-in clients see their non-draft orders, products and artworks automatically.</p>
          </div>
          {link && (
            <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${link.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {link.isPublished ? <><Globe className="h-3 w-3" /> Published</> : <><GlobeLock className="h-3 w-3" /> Draft</>}
            </span>
          )}
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <div className="col-span-2 min-w-0 sm:flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <span className="text-xs text-gray-500 font-mono break-all">{portalUrl}</span>
            </div>
            <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-500 hover:bg-gray-50 transition-colors shrink-0">
              {copied ? <><Check className="h-4 w-4 text-green-600" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy</>}
            </button>
            <a href={portalUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-500 hover:bg-gray-50 transition-colors shrink-0">
              <ExternalLink className="h-4 w-4" /> Preview
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={togglePublish} disabled={updateLink.isPending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 shadow-sm ${link?.isPublished ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-cyan-900 text-[#C9B45C] hover:bg-cyan-900"}`}>
              {updateLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : link?.isPublished ? <GlobeLock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              {link?.isPublished ? "Unpublish" : "Publish Link"}
            </button>
            {!confirmRegen ? (
              <button onClick={() => setConfirmRegen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Old link will stop working!</span>
                <button onClick={handleRegenerate} disabled={regenLink.isPending} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-60">
                  {regenLink.isPending ? "…" : "Confirm"}
                </button>
                <button onClick={() => setConfirmRegen(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-slate-500">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Image Visibility Controls (collapsible) ── */}
      {artworkList.some(a => a.wipImages.length > 0 || a.finalImages.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button onClick={() => setShowImageControls(o => !o)}
            className="w-full flex items-center gap-3 px-6 py-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
            <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-cyan-900">
              <Eye className="h-4 w-4 text-[#C9B45C]" />
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-sm font-semibold text-cyan-900">Image Visibility</h2>
              <p className="text-xs text-gray-400">Toggle which images are visible to the client</p>
            </div>
            {showImageControls ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {showImageControls && (
            <div className="px-6 py-5 divide-y divide-gray-50 space-y-0">
              {artworkList.map(aw => {
                const wipImgs = aw.wipImages ?? [];
                const finalImgs = aw.finalImages ?? [];
                if (!wipImgs.length && !finalImgs.length) return null;
                return (
                  <div key={aw.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <p className="text-xs font-semibold text-slate-500">{aw.artworkCode} · {aw.artworkName}</p>
                    {wipImgs.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">WIP</p>
                        <div className="flex flex-wrap gap-2">
                          {wipImgs.map((img, i) => {
                            const hidden = isHidden(aw.id, "wip", i);
                            return (
                              <div key={i} className="relative">
                                <button onClick={() => setLightbox({ artworkId: aw.id, type: "wip", idx: i })}
                                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${hidden ? "border-red-200 opacity-40" : "border-gray-200 hover:border-[#C9B45C]"}`}>
                                  <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => toggleImage(aw.id, "wip", i)} title={hidden ? "Show" : "Hide"}
                                  className={`absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm text-[10px] transition-colors ${hidden ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-red-100"}`}>
                                  {hidden ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {finalImgs.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">Final</p>
                        <div className="flex flex-wrap gap-2">
                          {finalImgs.map((img, i) => {
                            const hidden = isHidden(aw.id, "final", i);
                            return (
                              <div key={i} className="relative">
                                <button onClick={() => setLightbox({ artworkId: aw.id, type: "final", idx: i })}
                                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${hidden ? "border-red-200 opacity-40" : "border-gray-200 hover:border-[#C9B45C]"}`}>
                                  <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => toggleImage(aw.id, "final", i)} title={hidden ? "Show" : "Hide"}
                                  className={`absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm text-[10px] transition-colors ${hidden ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-red-100"}`}>
                                  {hidden ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {link && (
        <StaffOrderConversation linkId={link.id} messages={messages ?? []} topics={topics}
          topicKeyValue={topicSel} onTopicChange={setTopicSel} focusSignal={focusSig} subtitle="General and artwork discussion with the client" />
      )}

      {/* ── Artworks ── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Artworks</p>
        </div>
        {artworkList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 px-6 py-12 text-center">
            <p className="text-sm text-gray-400 italic">No artworks linked to this order yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedArtworks.map(aw => {
              const awFeedback = (feedbackList ?? []).filter(f => f.artworkId === aw.id);
              const latestDecision = awFeedback[awFeedback.length - 1]?.decision ?? null;
              const awMsgs = (messages ?? []).filter(m => (m.targetType ?? "artwork") === "artwork" && m.artworkId === aw.id);
              const isClosed = closedThreads.includes(aw.id);
              return (
                <StaffArtworkCard key={aw.id} aw={aw}
                  messageCount={awMsgs.length} clientCount={awMsgs.filter(m => m.sender === "client").length}
                  isClosed={isClosed} decision={latestDecision as "Approve" | "Rework" | null}
                  toggling={toggleThread.isPending && toggleThread.variables?.artworkId === aw.id}
                  onToggleClose={() => toggleThread.mutate({ linkId: link!.id, swatchOrderId, artworkId: aw.id, closed: !isClosed }, {
                    onSuccess: () => toast({ title: isClosed ? "Thread reopened" : "Thread marked Done" }),
                    onError: () => toast({ title: "Failed", variant: "destructive" }),
                  })}
                  onDiscuss={() => discuss(topicKey("artwork", aw.id))}
                  onLightbox={(artworkId, type, idx) => setLightbox({ artworkId, type, idx })}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (() => {
        const aw = artworkList.find(a => a.id === lightbox.artworkId);
        if (!aw) return null;
        const imgs = lightbox.type === "wip" ? aw.wipImages : aw.finalImages;
        return <Lightbox images={imgs} startIndex={lightbox.idx} onClose={() => setLightbox(null)} />;
      })()}
    </div>
  );
}
