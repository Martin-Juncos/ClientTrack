import { apiClient } from "./client.js";

export const dashboardApi = {
  getSummary() {
    return apiClient.get("/dashboard/summary");
  }
};
