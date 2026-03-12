import { useState, useEffect, useRef, useCallback } from "react";

interface UseMediaStreamOptions {
  autoStart?: boolean;
}

interface DeviceSelection {
  audioDeviceId?: string;
  videoDeviceId?: string;
}

export function useMediaStream({ autoStart = false }: UseMediaStreamOptions = {}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const latestDeviceRef = useRef<DeviceSelection | undefined>(undefined);

  const startMedia = useCallback(async (video = true, audio = true, devices?: DeviceSelection) => {
    try {
      setError(null);
      latestDeviceRef.current = devices;

      const constraints: MediaStreamConstraints = {
        video: video
          ? devices?.videoDeviceId
            ? { deviceId: { exact: devices.videoDeviceId } }
            : true
          : false,
        audio: audio
          ? devices?.audioDeviceId
            ? { deviceId: { exact: devices.audioDeviceId } }
            : true
          : false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsCameraOn(Boolean(mediaStream.getVideoTracks()[0]?.enabled));
      setIsMicOn(Boolean(mediaStream.getAudioTracks()[0]?.enabled));
    } catch (err: unknown) {
      console.error("Media access error:", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Camera/mic access denied. Please allow permissions.");
      } else {
        setError("Could not access camera or microphone.");
      }
    }
  }, []);

  const stopMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    setIsCameraOn(false);
    setIsMicOn(false);
  }, []);

  const toggleCamera = useCallback(async () => {
    const stream = streamRef.current;
    const videoTrack = stream?.getVideoTracks()[0] || null;

    if (videoTrack) {
      // Do not stop the track; only toggle enabled to avoid blank preview on re-enable.
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
      return;
    }

    // If no stream or no video track exists, reacquire media.
    await startMedia(true, true, latestDeviceRef.current);
  }, [startMedia]);

  const toggleMic = useCallback(() => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }, []);

  useEffect(() => {
    if (autoStart) startMedia();
    return () => stopMedia();
  }, [autoStart, startMedia, stopMedia]);

  return { stream, isCameraOn, isMicOn, error, startMedia, stopMedia, toggleCamera, toggleMic };
}
