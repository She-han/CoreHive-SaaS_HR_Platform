import { apiClient } from "@/src/services/api/client";
import type { ApiEnvelope, LoginRequest, LoginResponse } from "@/src/types/models";

const unwrap = <T>(payload: ApiEnvelope<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
};

export const authApi = {
  async login(payload: LoginRequest) {
    const res = await apiClient.post<ApiEnvelope<LoginResponse> | LoginResponse>(
      "/auth/login",
      payload
    );
    return unwrap<LoginResponse>(res.data);
  },
  async me() {
    const res = await apiClient.get<ApiEnvelope<LoginResponse> | LoginResponse>("/auth/me");
    return unwrap<LoginResponse>(res.data);
  }
};
