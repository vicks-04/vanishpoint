import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModeSwitchModalProps {
  open: boolean;
  currentMode: "chat" | "video";
  onClose: () => void;
  onSelectMode: (mode: "chat" | "video") => void;
}

const ModeSwitchModal = ({ open, currentMode, onClose, onSelectMode }: ModeSwitchModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md glass-panel-strong border border-primary/30 rounded-2xl p-6"
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">Switch Session Mode</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Choose how participants communicate in this session.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectMode("chat")}
                className={`rounded-xl border px-4 py-4 text-left transition-all ${
                  currentMode === "chat"
                    ? "border-primary/55 bg-primary/15 shadow-[0_0_16px_rgba(34,211,238,0.2)]"
                    : "border-border bg-secondary/40 hover:border-primary/35"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Chat Mode</span>
                </div>
                <p className="text-xs text-muted-foreground">Text-only communication for focused discussion.</p>
              </button>

              <button
                type="button"
                onClick={() => onSelectMode("video")}
                className={`rounded-xl border px-4 py-4 text-left transition-all ${
                  currentMode === "video"
                    ? "border-primary/55 bg-primary/15 shadow-[0_0_16px_rgba(34,211,238,0.2)]"
                    : "border-border bg-secondary/40 hover:border-primary/35"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Video Call Mode</span>
                </div>
                <p className="text-xs text-muted-foreground">Enable camera and microphone for live video meeting.</p>
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="glass" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModeSwitchModal;