export type UserRole = "ADMIN" | "CASHIER";

export interface JwtPayload {
  sub: number;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface LoginResponse {
  access_token: string;
}
