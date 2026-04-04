import { apiClient } from "./client.js";

export const institutionsApi = {
  list(filters) {
    return apiClient.get("/institutions", filters);
  },
  getById(id) {
    return apiClient.get(`/institutions/${id}`);
  },
  create(payload) {
    return apiClient.post("/institutions", payload);
  },
  update(id, payload) {
    return apiClient.patch(`/institutions/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/institutions/${id}`);
  }
};
