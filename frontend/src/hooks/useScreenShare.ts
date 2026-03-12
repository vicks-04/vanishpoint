import { useState, useRef, useCallback } from "react";

export function useScreenShare() {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      streamRef.current = stream;
      setScreenStream(stream);
      setIsSharing(true);

      // Listen for browser "Stop sharing" button
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setScreenStream(null);
        setIsSharing(false);
        streamRef.current = null;
      });
    } catch (err) {
      console.error("Screen share error:", err);
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScreenStream(null);
    setIsSharing(false);
  }, []);

  const toggleScreenShare = useCallback(() => {
    if (isSharing) stopScreenShare();
    else startScreenShare();
  }, [isSharing, startScreenShare, stopScreenShare]);

  return { screenStream, isSharing, toggleScreenShare, stopScreenShare };
}
