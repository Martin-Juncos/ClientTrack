import { apiClient } from "./client.js";

export const activityApi = {
  getRecent() {
    return apiClient.get("/activity/recent");
  }
};
