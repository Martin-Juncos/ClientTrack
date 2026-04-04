import { apiClient } from "./client.js";

export const opportunitiesApi = {
  list(filters) {
    return apiClient.get("/opportunities", filters);
  },
  getById(id) {
    return apiClient.get(`/opportunities/${id}`);
  },
  create(payload) {
    return apiClient.post("/opportunities", payload);
  },
  update(id, payload) {
    return apiClient.patch(`/opportunities/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/opportunities/${id}`);
  },
  kanban(filters) {
    return apiClient.get("/opportunities/kanban", filters);
  }
};
