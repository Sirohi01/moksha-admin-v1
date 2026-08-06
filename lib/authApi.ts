import { api } from "./api";
import { AdminUser, AuthTokens } from "@/store/slices/authSlice";

type LoginResult = { user: AdminUser; twoFactorSetupRequired: boolean } & AuthTokens;

export const authApi = {
  login: (email: string, password: string, totpCode?: string) =>
    api.post<LoginResult>("/auth/login", { email, password, totpCode }),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }).catch(() => undefined),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch("/auth/change-password", { currentPassword, newPassword }),
  setupTwoFactor: () => api.post<{ secret: string; provisioningUri: string }>("/auth/2fa/setup"),
  confirmTwoFactor: (code: string) => api.post<{ backupCodes: string[] }>("/auth/2fa/confirm", { code }),
  getMe: () => api.get<{ userId: string; userType: string; roleSlug?: string; permissions: string[]; twoFactorPending: boolean }>("/auth/me"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) => api.post("/auth/reset-password", { token, newPassword }),
};
