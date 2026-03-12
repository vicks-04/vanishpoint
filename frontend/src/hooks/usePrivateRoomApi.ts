import { useCallback, useMemo } from "react";
import { apiRequest } from "@/lib/api";

export interface PrivateRoom {
  roomId: string;
  question: string;
  createdAt: string;
  hostId?: string | null;
}

export function usePrivateRoomApi() {
  const createRoom = useCallback(async (question: string, answer: string) => {
    return apiRequest<{ room: PrivateRoom }>("/api/room/create", {
      method: "POST",
      body: JSON.stringify({ question, answer }),
    });
  }, []);

  const getRoom = useCallback(async (roomId: string) => {
    return apiRequest<{ room: PrivateRoom }>(`/api/room/${encodeURIComponent(roomId)}`);
  }, []);

  const verifyRoom = useCallback(async (roomId: string, answer: string) => {
    return apiRequest<{ verified: boolean; room: PrivateRoom }>("/api/room/verify", {
      method: "POST",
      body: JSON.stringify({ roomId, answer }),
    });
  }, []);

  return useMemo(
    () => ({
      createRoom,
      getRoom,
      verifyRoom,
    }),
    [createRoom, getRoom, verifyRoom]
  );
}
