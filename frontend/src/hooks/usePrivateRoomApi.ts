import { useCallback, useMemo } from "react";
import { apiRequest } from "@/lib/api";
<<<<<<< HEAD
=======
import { setRoomAccessToken, setRoomHostKey } from "@/lib/roomAccess";
>>>>>>> origin/main

export interface PrivateRoom {
  roomId: string;
  question: string;
  createdAt: string;
  hostId?: string | null;
}

export function usePrivateRoomApi() {
  const createRoom = useCallback(async (question: string, answer: string) => {
<<<<<<< HEAD
    return apiRequest<{ room: PrivateRoom }>("/room/create", {
      method: "POST",
      body: JSON.stringify({ question, answer }),
    });
=======
    const response = await apiRequest<{ room: PrivateRoom; roomAccessToken?: string; roomHostKey?: string }>(
      "/room/create",
      {
      method: "POST",
      body: JSON.stringify({ question, answer }),
      }
    );
    if (response.roomAccessToken) {
      setRoomAccessToken(response.room.roomId, response.roomAccessToken);
    }
    if (response.roomHostKey) {
      setRoomHostKey(response.room.roomId, response.roomHostKey);
    }
    return response;
>>>>>>> origin/main
  }, []);

  const getRoom = useCallback(async (roomId: string) => {
    return apiRequest<{ room: PrivateRoom }>(`/room/${encodeURIComponent(roomId)}`);
  }, []);

  const verifyRoom = useCallback(async (roomId: string, answer: string) => {
<<<<<<< HEAD
    return apiRequest<{ verified: boolean; room: PrivateRoom }>("/room/verify", {
      method: "POST",
      body: JSON.stringify({ roomId, answer }),
    });
=======
    const response = await apiRequest<{ verified: boolean; room: PrivateRoom; roomAccessToken?: string }>("/room/verify", {
      method: "POST",
      body: JSON.stringify({ roomId, answer }),
    });
    if (response.roomAccessToken) {
      setRoomAccessToken(roomId, response.roomAccessToken);
    }
    return response;
>>>>>>> origin/main
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
<<<<<<< HEAD

=======
>>>>>>> origin/main
