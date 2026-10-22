import api from "../api/axios";
import type { User } from "../../types/users";

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/users");
  return response.data;
};
