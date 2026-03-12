import { useCallback, useEffect, useRef, useState } from "react";

interface UseSocketOptions {
  enabled: boolean;
  url: string;
  onOpen?: (socket: WebSocket) => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (event: MessageEvent) => void;
}

export function useSocket({ enabled, url, onOpen, onClose, onMessage }: UseSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onMessageRef = useRef(onMessage);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(false);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (!enabled) {
      shouldReconnectRef.current = false;
      reconnectAttemptsRef.current = 0;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setReadyState(WebSocket.CLOSED);
      return;
    }

    shouldReconnectRef.current = true;
    let disposed = false;

    const connect = () => {
      if (disposed || !shouldReconnectRef.current) {
        return;
      }

      const socket = new WebSocket(url);
      socketRef.current = socket;
      setReadyState(WebSocket.CONNECTING);

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setReadyState(WebSocket.OPEN);
        onOpenRef.current?.(socket);
      };

      socket.onmessage = (event) => {
        onMessageRef.current?.(event);
      };

      socket.onclose = (event) => {
        setReadyState(WebSocket.CLOSED);
        onCloseRef.current?.(event);

        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (disposed || !shouldReconnectRef.current) {
          return;
        }

        const delayMs = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 5000);
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = window.setTimeout(() => {
          reconnectTimerRef.current = null;
          connect();
        }, delayMs);
      };

      socket.onerror = () => {
        setReadyState(socket.readyState);
      };
    };

    connect();

    return () => {
      disposed = true;
      shouldReconnectRef.current = false;
      reconnectAttemptsRef.current = 0;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setReadyState(WebSocket.CLOSED);
    };
  }, [enabled, url]);

  const sendJson = useCallback((payload: unknown) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  const close = useCallback(() => {
    shouldReconnectRef.current = false;
    reconnectAttemptsRef.current = 0;
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (!socketRef.current) return;
    socketRef.current.close();
    socketRef.current = null;
    setReadyState(WebSocket.CLOSED);
  }, []);

  return {
    sendJson,
    close,
    readyState,
    isOpen: readyState === WebSocket.OPEN,
  };
}
