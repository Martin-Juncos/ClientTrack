import { apiClient } from "./client.js";

export const interactionsApi = {
  list(filters) {
    return apiClient.get("/interactions", filters);
  },
  create(payload) {
    return apiClient.post("/interactions", payload);
  },
  update(id, payload) {
    return apiClient.patch(`/interactions/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/interactions/${id}`);
  }
};
