import { api } from "./api";
import { AdminUser, AuthTokens } from "@/store/slices/authSlice";

type LoginResult = { user: AdminUser; twoFactorSetupRequired: boolean } & AuthTokens;

export const authApi = {
  login: (email: string, password: string, totpCode?: string) =>
    api.post<LoginResult>("/auth/login", { email, password, totpCode }),
  // Best-effort — revokes the server-side session record. Logout must never fail to clear the
  // local session just because the network call did, so callers should not block on this.
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }).catch(() => undefined),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch("/auth/change-password", { currentPassword, newPassword }),
  // Mandatory-2FA enrollment (PRD SEC-02) — requireAuth-only routes, reachable even while the
  // account is otherwise locked out of every permission-gated action.
  setupTwoFactor: () => api.post<{ secret: string; provisioningUri: string }>("/auth/2fa/setup"),
  confirmTwoFactor: (code: string) => api.post<{ backupCodes: string[] }>("/auth/2fa/confirm", { code }),
  getMe: () => api.get<{ userId: string; userType: string; roleSlug?: string; permissions: string[]; twoFactorPending: boolean }>("/auth/me"),
};
