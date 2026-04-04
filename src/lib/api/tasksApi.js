import { apiClient } from "./client.js";

export const tasksApi = {
  list(filters) {
    return apiClient.get("/tasks", filters);
  },
  create(payload) {
    return apiClient.post("/tasks", payload);
  },
  update(id, payload) {
    return apiClient.patch(`/tasks/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/tasks/${id}`);
  }
};
