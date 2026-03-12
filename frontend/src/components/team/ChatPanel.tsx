import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Pin, PinOff, Send } from "lucide-react";
import type { ChatMessage } from "@/hooks/useRoomRtc";

interface ChatPanelProps {
  open: boolean;
  messages: ChatMessage[];
  isHost: boolean;
  pinnedMessageId: string | null;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  onPinMessage: (messageId: string) => void;
  onUnpinMessage: () => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ChatPanel = ({
  open,
  messages,
  isHost,
  pinnedMessageId,
  onClose,
  onSendMessage,
  onPinMessage,
  onUnpinMessage,
}: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const pinnedMessage = useMemo(
    () => messages.find((message) => message.id === pinnedMessageId) || null,
    [messages, pinnedMessageId]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (!open) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage(text);
    setInput("");
  };

  return (
    <aside className="h-full glass-panel border border-primary/18 rounded-2xl flex flex-col min-h-[500px] shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
      <div className="px-3 py-2.5 border-b border-border/80 flex items-center justify-between gap-2 bg-gradient-to-r from-background/70 to-secondary/30">
        <h3 className="font-semibold tracking-tight">Session Chat</h3>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-lg border border-border bg-secondary/60 hover:bg-secondary inline-flex items-center justify-center"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {pinnedMessage && (
        <div className="px-3 py-2 border-b border-border/70 bg-primary/10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary mb-0.5">Pinned Message</p>
              <p className="text-xs text-muted-foreground">{pinnedMessage.senderName || "User"}</p>
              <p className="text-sm">{pinnedMessage.text}</p>
            </div>
            {isHost && (
              <button
                type="button"
                onClick={onUnpinMessage}
                className="h-7 px-2 rounded-md border border-border bg-background/70 text-xs inline-flex items-center gap-1"
              >
                <PinOff className="w-3.5 h-3.5" />
                Unpin
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center">
            No messages yet. Start the conversation.
          </div>
        )}

        {messages.map((message) => {
          const mine = message.sender === "me";
          const isSystem = message.sender === "system";
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-xl px-2.5 py-2 text-[13px] ${
                  mine
                    ? "bg-primary/25 border border-primary/35"
                    : isSystem
                      ? "bg-muted/35 border border-border text-muted-foreground"
                      : "bg-secondary border border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {isSystem ? "System" : message.senderName || (mine ? "You" : "Participant")}
                  </p>
                  {isHost && !isSystem && (
                    <button
                      type="button"
                      onClick={() => onPinMessage(message.id)}
                      className="h-5 px-1.5 rounded border border-border bg-background/70 text-[10px] inline-flex items-center gap-1"
                      title="Pin message"
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{formatTime(message.timestamp)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="p-2.5 border-t border-border/80">
        <div className="rounded-lg border border-border bg-secondary/55 flex items-center gap-2 px-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a secure message..."
            className="flex-1 h-9 bg-transparent text-[13px] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            className="h-8 px-2.5 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatPanel;
