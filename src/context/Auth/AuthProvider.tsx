import { useState, type ReactNode } from "react";
import { login as loginRequest } from "../../services/auth/auth.service";
import { AuthContext } from "./AuthContext";
import {
  clearToken,
  getStoredSession,
  saveToken,
  type Session
} from "./authStorage";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(getStoredSession);

  const login = async (username: string, password: string) => {
    const response = await loginRequest({ username, password });
    const newSession = saveToken(response.access_token);
    setSession(newSession);
    return newSession.user;
  };

  const logout = () => {
    clearToken();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        isAuthenticated: session !== null,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
