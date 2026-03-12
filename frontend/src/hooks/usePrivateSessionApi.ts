import { useCallback, useMemo } from "react";
import { apiRequest } from "@/lib/api";

export interface PrivateSession {
  sessionId: string;
  code: string;
  question: string;
  createdAt: string;
  hostId?: string | null;
}

export interface CreateSessionResponse {
  session: PrivateSession;
  joinLink: string;
}

export function usePrivateSessionApi() {
  const createSession = useCallback(async (question: string, answer: string) => {
    return apiRequest<CreateSessionResponse>("/session/create", {
      method: "POST",
      body: JSON.stringify({ question, answer }),
    });
  }, []);

  const getSession = useCallback(async (code: string) => {
    return apiRequest<{ session: PrivateSession }>(`/session/${encodeURIComponent(code)}`);
  }, []);

  const verifySession = useCallback(async (code: string, answer: string) => {
    return apiRequest<{ verified: boolean; session: PrivateSession }>("/session/verify", {
      method: "POST",
      body: JSON.stringify({ code, answer }),
    });
  }, []);

  return useMemo(
    () => ({
      createSession,
      getSession,
      verifySession,
    }),
    [createSession, getSession, verifySession]
  );
}
