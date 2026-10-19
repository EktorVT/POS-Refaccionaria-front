import type { LoginResponse } from "../../types/auth";
import api from "../api/axios";

export interface LoginRequest {
  username: string;
  password: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);

  return response.data;
};
