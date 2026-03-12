import { useMemo, useState } from "react";
import { BarChart3, Check, X } from "lucide-react";

interface PollData {
  pollId: string;
  question: string;
  options: string[];
  votes: Record<string, string>;
}

interface PollSystemProps {
  open: boolean;
  isHost: boolean;
  activePoll: PollData | null;
  selfPeerId: string;
  onClose: () => void;
  onCreatePoll: (question: string, options: string[]) => void;
  onVote: (pollId: string, option: string) => void;
}

const PollSystem = ({
  open,
  isHost,
  activePoll,
  selfPeerId,
  onClose,
  onCreatePoll,
  onVote,
}: PollSystemProps) => {
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");

  const voteStats = useMemo(() => {
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

  if (!open) return null;

  return (
    <aside className="h-full glass-panel border border-primary/18 rounded-2xl flex flex-col min-h-[500px] shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
      <div className="px-3 py-2.5 border-b border-border/80 flex items-center justify-between gap-2 bg-gradient-to-r from-background/70 to-secondary/30">
        <h3 className="font-semibold inline-flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          Polls
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-lg border border-border bg-secondary/60 hover:bg-secondary inline-flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {isHost && (
          <div className="rounded-xl border border-border bg-secondary/30 p-2.5 space-y-2">
            <p className="text-xs uppercase tracking-wider text-primary">Create Poll</p>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Question"
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
              className="h-9 w-full rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
            >
              Publish Poll
            </button>
          </div>
        )}

        {!activePoll && (
          <div className="text-sm text-muted-foreground text-center py-10">No active poll right now.</div>
        )}

        {activePoll && (
          <div className="rounded-xl border border-border bg-secondary/30 p-2.5 space-y-2.5">
            <p className="text-sm font-semibold">{activePoll.question}</p>
            {activePoll.options.map((option) => {
              const votes = voteStats.get(option) || 0;
              const selected = activePoll.votes?.[selfPeerId] === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onVote(activePoll.pollId, option)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-[13px] flex items-center justify-between ${
                    selected
                      ? "border-primary/50 bg-primary/15"
                      : "border-border bg-background/70 hover:bg-background"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {selected ? <Check className="w-3.5 h-3.5 text-primary" /> : null}
                    {option}
                  </span>
                  <span className="text-xs text-muted-foreground">{votes}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default PollSystem;
