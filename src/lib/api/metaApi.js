import { apiClient } from "./client.js";

export const metaApi = {
  getOptions() {
    return apiClient.get("/meta/options");
  }
};
