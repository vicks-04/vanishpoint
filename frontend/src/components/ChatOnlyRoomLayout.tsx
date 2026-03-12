import ChatPanel from "@/components/ChatPanel";
import type { ChatMessage } from "@/hooks/useRoomRtc";

interface ChatOnlyRoomLayoutProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendFile: (file: File) => Promise<void> | void;
  onRequestVideoCall: () => void;
  canRequestVideoCall: boolean;
  requestPending: boolean;
  messageReactions: Record<string, string[]>;
  onReactToMessage: (messageId: string, emoji: string) => void;
}

const ChatOnlyRoomLayout = ({
  messages,
  onSendMessage,
  onSendFile,
  onRequestVideoCall,
  canRequestVideoCall,
  requestPending,
  messageReactions,
  onReactToMessage,
}: ChatOnlyRoomLayoutProps) => {
  return (
    <div className="h-full min-h-0 px-0.5">
      <div className="h-full max-w-[980px] mx-auto min-h-0">
        <ChatPanel
          messages={messages}
          onSendMessage={onSendMessage}
          onSendFile={onSendFile}
          onRequestVideoCall={onRequestVideoCall}
          onCollapse={() => {}}
          showCollapse={false}
          canRequestVideoCall={canRequestVideoCall}
          requestPending={requestPending}
          visible={true}
          messageReactions={messageReactions}
          onReactToMessage={onReactToMessage}
        />
      </div>
    </div>
  );
};

export default ChatOnlyRoomLayout;
