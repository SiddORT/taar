import { MessageSquare } from "lucide-react";
import { useSendTeamMessage, type ClientMessageRecord } from "@/hooks/useClientLink";
import UnifiedConversation, { type Topic } from "./UnifiedConversation";

/** Staff view of the single chronological order conversation. */
export default function StaffOrderConversation({ linkId, messages, topics, topicKeyValue, onTopicChange, focusSignal, subtitle }: {
  linkId: number; messages: ClientMessageRecord[]; topics: Topic[];
  topicKeyValue: string; onTopicChange: (k: string) => void; focusSignal: number; subtitle: string;
}) {
  const send = useSendTeamMessage();
  const fromClient = messages.filter((m) => m.sender === "client").length;
  return (
    <div id="order-conversation" className="bg-white rounded-2xl border border-gray-200 overflow-hidden" data-testid="panel-order-conversation">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-cyan-900"><MessageSquare className="h-4 w-4 text-[#C9B45C]" /></div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-cyan-900">Order Conversation</h2>
          <p className="text-xs text-gray-400">{subtitle} · {messages.length} msg{messages.length !== 1 ? "s" : ""}</p>
        </div>
        {fromClient > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold" data-testid="text-client-message-count">{fromClient} from client</span>}
      </div>
      <div className="px-5 py-4">
        <UnifiedConversation messages={messages} topics={topics} selfSender="team"
          topicKeyValue={topicKeyValue} onTopicChange={onTopicChange} focusSignal={focusSignal}
          onSend={(topic, message, attachment) => send.mutateAsync({
            linkId, targetType: topic.kind, targetId: topic.kind === "order" ? undefined : topic.id,
            artworkName: topic.kind === "artwork" ? topic.label : undefined, message, attachment,
          }).then(() => undefined)} />
      </div>
    </div>
  );
}
