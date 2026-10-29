import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useSendTeamMessage, type ClientMessageRecord } from "@/hooks/useClientLink";
import { Composer, MessageList } from "./Conversation";

export default function StaffScopedThread({ linkId, targetType, targetId, title, subtitle, messages }: {
  linkId: number; targetType: "order" | "product"; targetId?: number;
  title: string; subtitle: string; messages: ClientMessageRecord[];
}) {
  const [open, setOpen] = useState(false);
  const send = useSendTeamMessage();
  const fromClient = messages.filter((m) => m.sender === "client").length;
  const key = `${targetType}-${targetId ?? "order"}`;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-6 py-4 bg-gray-50/50 hover:bg-gray-100/50 text-left" data-testid={`button-toggle-thread-${key}`}>
        <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-cyan-900"><MessageSquare className="h-4 w-4 text-[#C9B45C]" /></div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-cyan-900 truncate">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle} · {messages.length} msg{messages.length !== 1 ? "s" : ""}</p>
        </div>
        {fromClient > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold">{fromClient}</span>}
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 py-4 space-y-4 border-t border-gray-100">
          <MessageList messages={messages} selfSender="team" empty="No messages yet. The client will see your replies here." />
          <Composer testId={`composer-${key}`} placeholder="Reply to client"
            onSend={(message, attachment) => send.mutateAsync({ linkId, targetType, targetId, message, attachment }).then(() => undefined)} />
        </div>
      )}
    </div>
  );
}
