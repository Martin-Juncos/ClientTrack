import { apiClient } from "./client.js";

export const authApi = {
  login(credentials) {
    return apiClient.post("/auth/login", credentials);
  },
  logout() {
    return apiClient.post("/auth/logout", {});
  },
  me() {
    return apiClient.get("/auth/me");
  }
};
