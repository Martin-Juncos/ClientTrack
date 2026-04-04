import { apiClient } from "./client.js";

export const communicationsApi = {
  list(filters) {
    return apiClient.get("/communications", filters);
  },
  sendEmail(payload) {
    return apiClient.post("/communications/email", payload);
  },
  createWhatsappLink(payload) {
    return apiClient.post("/communications/whatsapp-link", payload);
  }
};
