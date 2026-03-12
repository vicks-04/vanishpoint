import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Download, FileText, Paperclip, Send, Smile, Video } from "lucide-react";
import type { ChatMessage } from "@/hooks/useRoomRtc";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendFile: (file: File) => Promise<void> | void;
  onRequestVideoCall: () => void;
  onCollapse: () => void;
  canRequestVideoCall: boolean;
  requestPending: boolean;
  visible: boolean;
  showRequestVideoCall?: boolean;
  showCollapse?: boolean;
  messageReactions?: Record<string, string[]>;
  onReactToMessage?: (messageId: string, emoji: string) => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function isImageFile(message: ChatMessage) {
  return message.messageType === "file" && Boolean(message.mimeType?.startsWith("image/"));
}

const EMOJIS = ["😀", "🙂", "😉", "😂", "😍", "👏", "👍", "🔥", "🎉", "🚀"];
const QUICK_REACTIONS = ["👍", "👏", "😂", "🔥"];

const ChatPanel = ({
  messages,
  onSendMessage,
  onSendFile,
  onRequestVideoCall,
  onCollapse,
  canRequestVideoCall,
  requestPending,
  visible,
  showRequestVideoCall = true,
  showCollapse = true,
  messageReactions = {},
  onReactToMessage,
}: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage(text);
    setInput("");
    setShowEmojiPicker(false);
  };

  const handleInsertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setInput((current) => `${current}${emoji}`);
      return;
    }

    const start = textarea.selectionStart ?? input.length;
    const end = textarea.selectionEnd ?? input.length;
    const nextValue = `${input.slice(0, start)}${emoji}${input.slice(end)}`;
    setInput(nextValue);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + emoji.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSelectAttachment = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      await onSendFile(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <aside
      className={`glass-panel border border-primary/20 rounded-xl h-full min-h-[320px] flex flex-col transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="px-2.5 py-2 border-b border-border/80 flex items-center justify-between gap-1.5">
        <h3 className="font-semibold text-xs">Session Chat</h3>

        <div className="flex items-center gap-2">
          {showRequestVideoCall && (
            <button
              type="button"
              onClick={onRequestVideoCall}
              disabled={!canRequestVideoCall || requestPending}
              className="h-6 px-2 rounded-md text-[10px] font-medium border border-primary/40 bg-primary/12 text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/25 transition-colors inline-flex items-center gap-1"
            >
              <Video className="w-2.5 h-2.5" />
              {requestPending ? "Requesting..." : "Request Video Call"}
            </button>
          )}

          {showCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="h-6 w-6 rounded-md border border-border bg-secondary/70 hover:bg-secondary transition-colors flex items-center justify-center"
              title="Collapse chat"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {!hasMessages && (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center">
            No messages yet. Start the conversation.
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const mine = message.sender === "me";
            const senderLabel =
              message.sender === "system"
                ? "System"
                : mine
                  ? message.senderName || "You"
                  : message.senderName || "Peer";
            const isFileMessage = message.messageType === "file";
            const fileSize = formatBytes(message.fileSize);

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[94%] rounded-lg px-2 py-1.5 text-[12px] leading-relaxed ${
                    mine
                      ? "bg-primary/25 border border-primary/35"
                      : message.sender === "system"
                        ? "bg-muted/35 border border-border text-muted-foreground"
                        : "bg-secondary border border-border"
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1">{senderLabel}</p>

                  {!isFileMessage && <p className="whitespace-pre-wrap break-words">{message.text}</p>}

                  {isFileMessage && (
                    <div className="space-y-2">
                      {isImageFile(message) && message.fileUrl && (
                        <a href={message.fileUrl} target="_blank" rel="noreferrer" className="block">
                          <img
                            src={message.fileUrl}
                            alt={message.fileName || "Attachment"}
                            className="max-h-28 w-auto rounded-md border border-border object-cover"
                            loading="lazy"
                          />
                        </a>
                      )}
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-border bg-background/70 px-2 py-1.5 flex items-center justify-between gap-2 hover:bg-background transition-colors"
                      >
                        <span className="min-w-0 inline-flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            <span className="block text-[12px]">{message.fileName || message.text}</span>
                            <span className="block text-[9px] text-muted-foreground">
                              {message.mimeType || "file"}
                              {fileSize ? ` - ${fileSize}` : ""}
                            </span>
                          </span>
                        </span>
                        <Download className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </a>
                    </div>
                  )}

                  {message.sender !== "system" && !isFileMessage && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {(messageReactions[message.id] || []).map((emoji, idx) => (
                        <span
                          key={`${message.id}-${emoji}-${idx}`}
                          className="text-[10px] px-1 py-0.5 rounded-md bg-background/70 border border-border"
                        >
                          {emoji}
                        </span>
                      ))}
                      {onReactToMessage && (
                        <div className="flex items-center gap-1 ml-1">
                          {QUICK_REACTIONS.map((emoji) => (
                            <button
                              key={`${message.id}-${emoji}`}
                              type="button"
                              onClick={() => onReactToMessage(message.id, emoji)}
                              className="text-[10px] opacity-70 hover:opacity-100 rounded px-1 py-0.5 bg-background/40 border border-border/60"
                              title={`React ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="p-2 border-t border-border/80">
        <div
          className={`relative rounded-lg border bg-secondary/55 transition-colors ${
            isFocused ? "border-primary/60 shadow-[0_0_10px_rgba(34,211,238,0.16)]" : "border-border"
          }`}
        >
          {showEmojiPicker && (
            <div className="absolute bottom-[calc(100%+8px)] left-2 z-20 p-1.5 rounded-lg border border-border bg-background/95 backdrop-blur-md shadow-lg grid grid-cols-5 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={`picker-${emoji}`}
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  className="h-7 w-7 rounded-md border border-border bg-background/70 hover:bg-background text-sm"
                  title={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          />

          <div className="px-1.5 py-1 flex items-end gap-1">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className={`h-6 w-6 rounded-md border border-border bg-background/70 text-muted-foreground flex items-center justify-center ${
                  showEmojiPicker ? "text-primary border-primary/50" : "hover:bg-background"
                }`}
                title="Open emoji picker"
              >
                <Smile className="w-3 h-3" />
              </button>

              <button
                type="button"
                className={`h-6 w-6 rounded-md border border-border bg-background/70 text-muted-foreground flex items-center justify-center ${
                  isUploading ? "opacity-60 cursor-not-allowed" : "hover:bg-background"
                }`}
                title={isUploading ? "Uploading..." : "Attach file"}
                onClick={handleSelectAttachment}
                disabled={isUploading}
              >
                <Paperclip className="w-3 h-3" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={1}
              placeholder="Type a secure message..."
              className="flex-1 min-h-[30px] max-h-[84px] resize-none bg-transparent px-1.5 py-1 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            <button
              type="button"
              onClick={handleSend}
              className="h-7 px-2 rounded-md bg-primary text-primary-foreground text-[11px] inline-flex items-center gap-1 hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
              disabled={!input.trim()}
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChatPanel;
