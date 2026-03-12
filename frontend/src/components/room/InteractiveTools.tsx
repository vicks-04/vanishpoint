import { useMemo, useState } from "react";
import { BarChart3, Hand, Smile, StickyNote, Upload } from "lucide-react";

interface PollData {
  pollId: string;
  question: string;
  options: string[];
  votes: Record<string, string>;
}

interface InteractiveToolsProps {
  activePoll: PollData | null;
  selfPeerId: string;
  isHost: boolean;
  onCreatePoll: (question: string, options: string[]) => void;
  onVote: (pollId: string, option: string) => void;
  onRaiseHand: () => void;
  onSendReaction: (emoji: string) => void;
}

const REACTIONS = ["👍", "👏", "😂", "🔥"];

const InteractiveTools = ({
  activePoll,
  selfPeerId,
  isHost,
  onCreatePoll,
  onVote,
  onRaiseHand,
  onSendReaction,
}: InteractiveToolsProps) => {
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [notes, setNotes] = useState("");

  const pollStats = useMemo(() => {
    if (!activePoll) return new Map<string, number>();
    const stats = new Map<string, number>();
    for (const option of activePoll.options) {
      stats.set(option, 0);
    }
    for (const selected of Object.values(activePoll.votes || {})) {
      stats.set(selected, (stats.get(selected) || 0) + 1);
    }
    return stats;
  }, [activePoll]);

  return (
    <aside className="glass-panel border border-primary/20 rounded-2xl h-full min-h-[420px] flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold">Interactive Tools</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-xl border border-border bg-secondary/35 p-3 space-y-2">
          <p className="text-xs uppercase tracking-wider text-primary">Quick Actions</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRaiseHand}
              className="h-9 px-3 rounded-lg border border-border bg-background/70 hover:bg-background text-xs inline-flex items-center gap-1.5"
            >
              <Hand className="w-3.5 h-3.5" />
              Raise Hand
            </button>
            <button
              type="button"
              className="h-9 px-3 rounded-lg border border-border bg-background/70 text-xs inline-flex items-center gap-1.5 opacity-70 cursor-not-allowed"
              disabled
            >
              <Upload className="w-3.5 h-3.5" />
              Share Document
            </button>
          </div>
          <div className="flex items-center gap-2">
            {REACTIONS.map((emoji) => (
              <button
                key={`reaction-${emoji}`}
                type="button"
                onClick={() => onSendReaction(emoji)}
                className="h-8 w-8 rounded-md border border-border bg-background/70 hover:bg-background"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-secondary/35 p-3 space-y-2">
          <p className="text-xs uppercase tracking-wider text-primary inline-flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Polls
          </p>

          {isHost && (
            <div className="space-y-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Poll question"
                className="w-full h-9 px-3 rounded-lg bg-background/70 border border-border text-sm"
              />
              <input
                value={optionA}
                onChange={(event) => setOptionA(event.target.value)}
                placeholder="Option A"
                className="w-full h-9 px-3 rounded-lg bg-background/70 border border-border text-sm"
              />
              <input
                value={optionB}
                onChange={(event) => setOptionB(event.target.value)}
                placeholder="Option B"
                className="w-full h-9 px-3 rounded-lg bg-background/70 border border-border text-sm"
              />
              <input
                value={optionC}
                onChange={(event) => setOptionC(event.target.value)}
                placeholder="Option C (optional)"
                className="w-full h-9 px-3 rounded-lg bg-background/70 border border-border text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  onCreatePoll(question, [optionA, optionB, optionC]);
                  setQuestion("");
                  setOptionA("");
                  setOptionB("");
                  setOptionC("");
                }}
                className="h-9 w-full rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
              >
                Create Poll
              </button>
            </div>
          )}

          {activePoll ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{activePoll.question}</p>
              {activePoll.options.map((option) => {
                const selected = activePoll.votes?.[selfPeerId] === option;
                return (
                  <button
                    key={`${activePoll.pollId}-${option}`}
                    type="button"
                    onClick={() => onVote(activePoll.pollId, option)}
                    className={`w-full h-9 px-3 rounded-lg border text-sm flex items-center justify-between ${
                      selected
                        ? "border-primary/45 bg-primary/15"
                        : "border-border bg-background/70 hover:bg-background"
                    }`}
                  >
                    <span>{option}</span>
                    <span className="text-xs text-muted-foreground">{pollStats.get(option) || 0}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No active poll right now.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-secondary/35 p-3 space-y-2">
          <p className="text-xs uppercase tracking-wider text-primary inline-flex items-center gap-1">
            <StickyNote className="w-3.5 h-3.5" />
            Shared Notes
          </p>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            placeholder="Capture key points here..."
            className="w-full resize-none rounded-lg border border-border bg-background/70 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </aside>
  );
};

export default InteractiveTools;
