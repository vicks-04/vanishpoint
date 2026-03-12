import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WaitingForHostProps {
  message?: string;
  sessionEnded?: boolean;
  onReturnHome?: () => void;
}

const WaitingForHost = ({ message, sessionEnded = false, onReturnHome }: WaitingForHostProps) => {
  return (
    <div className="min-h-screen px-4 flex items-center justify-center bg-background">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-primary/25 p-8 text-center shadow-[0_0_28px_rgba(34,211,238,0.14)]">
        <h1 className="text-3xl font-bold mb-2">Waiting for Host</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {message || "Host is choosing chat or video mode for this session."}
        </p>

        {!sessionEnded ? (
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-primary/30 bg-primary/10 text-primary text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Stand by
          </div>
        ) : (
          <Button variant="hero" onClick={onReturnHome}>
            Return to Home
          </Button>
        )}
      </div>
    </div>
  );
};

export default WaitingForHost;