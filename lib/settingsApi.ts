import { api } from "./api";
import { Settings } from "./types";

export const settingsApi = {
  get: () => api.get<Settings>("/settings"),
  update: (payload: Partial<Settings>) => api.put<Settings>("/settings/admin", payload),
};
