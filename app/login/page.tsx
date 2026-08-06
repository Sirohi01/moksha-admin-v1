"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { ShieldCheck, Eye, EyeOff, FolderKanban, HeartHandshake, HandHeart, Lock, Copy, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { ApiRequestError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const FEATURES = [
  { icon: FolderKanban, label: "Track every case from intake to closure" },
  { icon: HandHeart, label: "Coordinate volunteers in real time" },
  { icon: HeartHandshake, label: "Manage donations and 80G receipts" },
];

type Step = "credentials" | "totp" | "2fa-setup" | "backup-codes";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin, hydrated } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 2FA enrollment state — set once login reports twoFactorSetupRequired.
  const [secret, setSecret] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Rendered entirely client-side (the "qrcode" package) — the TOTP secret never leaves the
  // browser to reach a third-party QR image service, unlike e.g. api.qrserver.com.
  useEffect(() => {
    if (!provisioningUri) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(provisioningUri, { width: 220, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [provisioningUri]);

  useEffect(() => {
    if (!hydrated || !admin || step !== "credentials") return;
    // A stored session might still have 2FA enrollment pending (e.g. the account was created
    // before this flow existed) — check before bouncing to "/", which would otherwise just
    // redirect straight back here via RequireAdminAuth's own same check.
    authApi
      .getMe()
      .then(async (me) => {
        if (!me.twoFactorPending) {
          router.replace("/");
          return;
        }
        const setup = await authApi.setupTwoFactor();
        setSecret(setup.secret);
        setProvisioningUri(setup.provisioningUri);
        setStep("2fa-setup");
      })
      .catch(() => {
        /* stale/invalid session — stay on the credentials form */
      });
  }, [hydrated, admin, router, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await authApi.login(email, password, totpCode || undefined);
      if (result.user.userType !== "INTERNAL") {
        setError("This portal is for Moksha Sewa staff accounts only.");
        return;
      }
      // Session established even if 2FA enrollment is still pending — the 2FA setup/confirm
      // endpoints are requireAuth-only (not authorize-gated), reachable exactly for this reason.
      dispatch(setCredentials({ admin: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken }));

      if (result.twoFactorSetupRequired) {
        setIsSubmitting(true);
        const setup = await authApi.setupTwoFactor();
        setSecret(setup.secret);
        setProvisioningUri(setup.provisioningUri);
        setStep("2fa-setup");
        return;
      }

      router.push("/");
    } catch (err) {
      if (err instanceof ApiRequestError && err.message === "Two-factor code required") {
        setStep("totp");
        setError("");
        return;
      }
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await authApi.confirmTwoFactor(setupCode);
      setBackupCodes(result.backupCodes);
      setStep("backup-codes");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not verify that code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* -------- Left: branded panel (hidden on small screens) -------- */}
      <div className="relative hidden w-[44%] shrink-0 overflow-hidden bg-sidebar-bg lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-sidebar-accent/[0.08] blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-sidebar-accent/[0.06] blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(201,165,116,0.12)_1px,transparent_0)] bg-[length:28px_28px]" />
        </div>

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-bg">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-white">Moksha Sewa</span>
        </div>

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sidebar-accent">Admin Console</p>
          <h1 className="mt-3 max-w-sm font-serif text-[32px] leading-[1.15] text-white">
            Every family you help, <span className="italic text-sidebar-accent">organised in one place.</span>
          </h1>

          <div className="mt-8 space-y-3.5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sidebar-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm text-sidebar-text">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-sidebar-text/70">
          &copy; {new Date().getFullYear()} Moksha Sewa. Restricted access — authorized staff only.
        </p>
      </div>

      {/* -------- Right: login form -------- */}
      <div className="flex flex-1 items-center justify-center bg-surface-bg px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h1 className="mt-3 text-base font-semibold text-text-primary">Moksha Sewa Admin</h1>
          </div>

          {step === "credentials" && (
            <div className="mb-6 hidden lg:block">
              <h2 className="text-xl font-semibold text-text-primary">Welcome back</h2>
              <p className="mt-1 text-sm text-text-muted">Sign in to your admin account to continue.</p>
            </div>
          )}

          {step === "credentials" && (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-[0_8px_30px_rgba(33,22,17,0.06)]">
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mokshasewa.com"
                />
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-[30px] text-text-muted transition-colors hover:text-text-secondary"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">{error}</div>
              )}

              <Button type="submit" loading={isSubmitting} className="mt-5 w-full">
                Sign In
              </Button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
                <Lock className="h-3 w-3" />
                Every session is permission-checked on the server, not just the login screen.
              </div>
            </form>
          )}

          {step === "totp" && (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-[0_8px_30px_rgba(33,22,17,0.06)]">
              <h2 className="text-lg font-semibold text-text-primary">Two-Factor Code</h2>
              <p className="mt-1 text-sm text-text-muted">Enter the 6-digit code from your authenticator app.</p>

              <div className="mt-4">
                <Input
                  label="Authentication Code"
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">{error}</div>
              )}

              <Button type="submit" loading={isSubmitting} className="mt-5 w-full">
                Verify & Sign In
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setTotpCode("");
                  setError("");
                }}
                className="mt-3 w-full text-center text-[11px] text-text-muted hover:text-text-secondary"
              >
                ← Back
              </button>
            </form>
          )}

          {step === "2fa-setup" && (
            <form
              onSubmit={handleConfirmSetup}
              className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-[0_8px_30px_rgba(33,22,17,0.06)]"
            >
              <h2 className="text-lg font-semibold text-text-primary">Set Up Two-Factor Authentication</h2>
              <p className="mt-1 text-sm text-text-muted">
                This account requires two-factor authentication. Scan the QR code below with an authenticator app (Google
                Authenticator, Authy, etc.) — or enter the setup key manually if you can&apos;t scan.
              </p>

              {qrDataUrl && (
                <div className="mt-4 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL generated
                      entirely client-side, not an image next/image would optimize anyway */}
                  <img src={qrDataUrl} alt="Scan this QR code with your authenticator app" className="h-[180px] w-[180px] rounded-lg border border-surface-border" />
                </div>
              )}

              <div className="mt-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Account</p>
                <p className="text-sm text-text-primary">{email}</p>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Can&apos;t scan? Enter this key manually</p>
                <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-sunken px-3 py-2 font-mono text-sm">
                  <span className="flex-1 select-all break-all">{secret}</span>
                  <button type="button" onClick={copySecret} className="shrink-0 text-text-muted hover:text-text-primary">
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Enter the 6-digit code from your app to confirm"
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">{error}</div>
              )}

              <Button type="submit" loading={isSubmitting} className="mt-5 w-full">
                Verify & Enable
              </Button>
            </form>
          )}

          {step === "backup-codes" && (
            <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-[0_8px_30px_rgba(33,22,17,0.06)]">
              <h2 className="text-lg font-semibold text-text-primary">Two-Factor Authentication Enabled</h2>
              <p className="mt-1 text-sm text-text-muted">
                Save these backup codes somewhere safe — each one can be used once to sign in if you lose access to your
                authenticator app. They will not be shown again.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-surface-border bg-surface-sunken p-3 font-mono text-xs">
                {backupCodes.map((code) => (
                  <span key={code} className="select-all">
                    {code}
                  </span>
                ))}
              </div>

              <Button onClick={() => router.push("/")} className="mt-5 w-full">
                I&apos;ve Saved These — Continue
              </Button>
            </div>
          )}

          <p className="mt-5 text-center text-[11px] text-text-muted">Restricted access — for authorized Moksha Sewa staff only.</p>
        </div>
      </div>
    </div>
  );
}
