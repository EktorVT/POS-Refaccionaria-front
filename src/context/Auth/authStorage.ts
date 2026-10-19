import { jwtDecode, type JwtPayload } from "jwt-decode";
import type { UserRole } from "../../types/auth";

const TOKEN_KEY = "access_token";

export interface AuthUser extends JwtPayload {
  username: string;
  role: UserRole;
}

export interface Session {
  token: string;
  user: AuthUser;
}

export function getStoredSession(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const user = jwtDecode<AuthUser>(token);

    if (!user.exp || user.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return { token, user };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function saveToken(token: string): Session {
  localStorage.setItem(TOKEN_KEY, token);
  return { token, user: jwtDecode<AuthUser>(token) };
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
