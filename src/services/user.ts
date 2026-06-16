import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";

export type AppUser = {
  _id: string;
  email: string;
  name: string;
  photoURL: string | null;
};

type CurrentUserResponse = {
  user: AppUser;
};

export async function getCurrentUser() {
  const response = await apiClient.get<CurrentUserResponse>(API_ENDPOINTS.auth.me);

  return response.data.user;
}
