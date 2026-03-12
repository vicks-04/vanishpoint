import { motion } from "framer-motion";
import { Repeat2 } from "lucide-react";
import StreamVideo from "./StreamVideo";

interface PiPVideoProps {
  stream: MediaStream | null;
  label: string;
  onClick: () => void;
  activeSpeaker?: boolean;
}

const PiPVideo = ({ stream, label, onClick, activeSpeaker = false }: PiPVideoProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`absolute bottom-4 right-4 z-30 w-44 h-28 rounded-2xl overflow-hidden border bg-card/70 backdrop-blur-md shadow-xl transition-colors group ${
        activeSpeaker
          ? "border-primary/80 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
          : "border-primary/45 hover:border-primary/80"
      }`}
      title="Swap view"
    >
<<<<<<< HEAD
      <StreamVideo stream={stream} muted mirror fallbackText="No camera" />
=======
      <StreamVideo stream={stream} muted mirror={false} fallbackText="No camera" />
>>>>>>> origin/main

      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-90" />

      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 border border-border flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
        <Repeat2 className="w-3.5 h-3.5" />
      </div>

      <div className="absolute left-2 bottom-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-background/75 text-foreground border border-border/70">
        {label}
      </div>
    </motion.button>
  );
};

<<<<<<< HEAD
export default PiPVideo;
=======
export default PiPVideo;
>>>>>>> origin/main
