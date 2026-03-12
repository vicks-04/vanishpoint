import type { ChatMessage, RoomParticipant } from "@/hooks/useRoomRtc";
import ChatPanel from "./ChatPanel";
import ParticipantsPanel from "./ParticipantsPanel";
import InteractiveTools from "./InteractiveTools";

interface PollData {
  pollId: string;
  question: string;
  options: string[];
  votes: Record<string, string>;
}

interface ChatWorkspaceProps {
  participants: RoomParticipant[];
  raisedHands: string[];
  isHost: boolean;
  messages: ChatMessage[];
  selfPeerId: string;
  activePoll: PollData | null;
  requestPending: boolean;
  canRequestVideoCall: boolean;
  mobilePanel: "participants" | "chat" | "tools";
  messageReactions: Record<string, string[]>;
  onSendMessage: (text: string) => void;
  onRequestVideoCall: () => void;
  onMuteParticipant: (peerId: string) => void;
  onCreatePoll: (question: string, options: string[]) => void;
  onVotePoll: (pollId: string, option: string) => void;
  onRaiseHand: () => void;
  onSendReaction: (emoji: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
}

const ChatWorkspace = ({
  participants,
  raisedHands,
  isHost,
  messages,
  selfPeerId,
  activePoll,
  requestPending,
  canRequestVideoCall,
  mobilePanel,
  messageReactions,
  onSendMessage,
  onRequestVideoCall,
  onMuteParticipant,
  onCreatePoll,
  onVotePoll,
  onRaiseHand,
  onSendReaction,
  onReactToMessage,
}: ChatWorkspaceProps) => {
  return (
    <div className="h-full">
      <div className="hidden lg:grid h-full grid-cols-[280px_1fr_320px] gap-4">
        <ParticipantsPanel
          visible
          participants={participants}
          isHost={isHost}
          raisedHands={raisedHands}
          onClose={() => undefined}
          onMuteParticipant={onMuteParticipant}
          title="Participants"
          showCloseButton={false}
        />

        <ChatPanel
          messages={messages}
          onSendMessage={onSendMessage}
          onRequestVideoCall={onRequestVideoCall}
          onCollapse={() => undefined}
          canRequestVideoCall={canRequestVideoCall}
          requestPending={requestPending}
          visible
          showCollapse={false}
          showRequestVideoCall={false}
          messageReactions={messageReactions}
          onReactToMessage={onReactToMessage}
        />

        <InteractiveTools
          activePoll={activePoll}
          selfPeerId={selfPeerId}
          isHost={isHost}
          onCreatePoll={onCreatePoll}
          onVote={onVotePoll}
          onRaiseHand={onRaiseHand}
          onSendReaction={onSendReaction}
        />
      </div>

      <div className="lg:hidden h-full">
        {mobilePanel === "participants" && (
          <ParticipantsPanel
            visible
            participants={participants}
            isHost={isHost}
            raisedHands={raisedHands}
            onClose={() => undefined}
            onMuteParticipant={onMuteParticipant}
            title="Participants"
            showCloseButton={false}
          />
        )}

        {mobilePanel === "chat" && (
          <ChatPanel
            messages={messages}
            onSendMessage={onSendMessage}
            onRequestVideoCall={onRequestVideoCall}
            onCollapse={() => undefined}
            canRequestVideoCall={canRequestVideoCall}
            requestPending={requestPending}
            visible
            showCollapse={false}
            showRequestVideoCall={false}
            messageReactions={messageReactions}
            onReactToMessage={onReactToMessage}
          />
        )}

        {mobilePanel === "tools" && (
          <InteractiveTools
            activePoll={activePoll}
            selfPeerId={selfPeerId}
            isHost={isHost}
            onCreatePoll={onCreatePoll}
            onVote={onVotePoll}
            onRaiseHand={onRaiseHand}
            onSendReaction={onSendReaction}
          />
        )}
      </div>
    </div>
  );
};

export default ChatWorkspace;
