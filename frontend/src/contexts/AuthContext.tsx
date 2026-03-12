import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { ApiUser, apiRequest, setAuthToken } from "@/lib/api";

interface AuthContextType {
  token: string | null;
  user: ApiUser | null;
  loading: boolean;
  setSession: (token: string, user: ApiUser) => void;
  setSessionFromToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  setSession: () => {},
  setSessionFromToken: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("vp_auth_token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    apiRequest<{ user: ApiUser }>("/api/auth/me", { token: storedToken })
      .then((response) => {
        setToken(storedToken);
        setUser(response.user);
      })
      .catch(() => {
        setAuthToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const setSession = useCallback((nextToken: string, nextUser: ApiUser) => {
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const setSessionFromToken = useCallback(async (nextToken: string) => {
    const response = await apiRequest<{ user: ApiUser }>("/api/auth/me", { token: nextToken });
    setSession(nextToken, response.user);
  }, [setSession]);

  const signOut = useCallback(async () => {
    if (token) {
      await apiRequest<{ message: string }>("/api/auth/logout", {
        method: "POST",
        token,
      }).catch(() => null);
    }
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, loading, setSession, setSessionFromToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
