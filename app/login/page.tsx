"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { ShieldCheck, Eye, EyeOff, Lock, Copy, Check, AlertTriangle, KeyRound, CheckCircle2, Mail, MailCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { ApiRequestError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Step = "credentials" | "totp" | "2fa-setup" | "backup-codes" | "forgot-password" | "forgot-password-sent";

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

  const [secret, setSecret] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");

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
        /* stale/invalid session */
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      // The backend responds identically whether or not this email matches an account (avoids
      // leaking which admin emails exist), so there's nothing to branch on here either way.
      await authApi.forgotPassword(forgotEmail);
      setStep("forgot-password-sent");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-50 py-12 sm:px-6 lg:px-8">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-orange-400/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[50%] w-[50%] rounded-full bg-teal-400/10 blur-[100px]" />
        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Top Header Logos (Left & Right) */}
      <div className="absolute top-0 left-0 w-full p-4 sm:p-8 lg:p-12 flex items-start justify-between z-20 pointer-events-none">
        {/* Left Logo: Namo Gange */}
        <div className="pointer-events-auto flex flex-col items-start gap-1 sm:gap-2">
          <span className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500">An Initiative By</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="Namo Gange Trust" className="h-14 sm:h-20 md:h-28 lg:h-32 w-auto object-contain drop-shadow-md" />
        </div>

        {/* Right Logo: Moksha Sewa */}
        <div className="pointer-events-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://mokshasewa.org/logo.png" alt="Moksha Sewa" className="h-12 sm:h-16 md:h-24 lg:h-28 w-auto object-contain drop-shadow-md mt-2 sm:mt-4" />
        </div>
      </div>

      <div className="relative mx-auto w-full px-4 sm:px-0 sm:max-w-md z-10 pt-24 sm:pt-5">

        <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Admin Panel
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500">
          Sign in to manage Moksha Sewa operations
        </p>
      </div>

      <div className="relative mt-6 sm:mt-8 mx-auto w-full px-4 sm:px-0 sm:max-w-md z-10">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/50 bg-white/20 px-5 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl sm:px-10">

          {/* Subtle gradient line at the top of the card */}
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-orange-400 via-blue-500 to-teal-400 opacity-80"></div>

          {step === "credentials" && (
            <form onSubmit={handleSubmit} className="relative space-y-6">
              <div className="space-y-5">
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
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setError("");
                        setStep("forgot-password");
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
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
                    className="absolute right-3 top-[30px] flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-3.5 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="h-12 w-full text-[15px] shadow-sm">
                Sign in securely
              </Button>
            </form>
          )}

          {step === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <Mail className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Reset your password</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Enter your admin account email and we&apos;ll send you a link to choose a new password.
                </p>
              </div>

              <Input
                label="Email Address"
                type="email"
                required
                autoFocus
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@mokshasewa.com"
              />

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-3.5 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="h-12 w-full text-[15px] shadow-sm">
                Send Reset Link
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
                className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {step === "forgot-password-sent" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <MailCheck className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Check your inbox</h3>
                <p className="mt-2 text-sm text-slate-500">
                  If an account exists for <span className="font-semibold text-slate-700">{forgotEmail}</span>, a
                  password reset link is on its way. The link expires in 30 minutes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
                className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {step === "totp" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Two-Step Verification</h3>
                <p className="mt-2 text-sm text-slate-500">Enter the 6-digit code from your authenticator app.</p>
              </div>

              <div>
                <Input
                  label="Authentication Code"
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="h-14 text-center font-mono text-2xl tracking-[0.25em] shadow-sm"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-3.5 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="h-12 w-full text-[15px] shadow-sm">
                Verify Code
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setTotpCode("");
                  setError("");
                }}
                className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {step === "2fa-setup" && (
            <form onSubmit={handleConfirmSetup} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Secure Your Account</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Scan the QR code below with an authenticator app (e.g. Google Authenticator).
                </p>
              </div>

              {qrDataUrl && (
                <div className="flex justify-center">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrDataUrl} alt="QR Code" className="h-40 w-40" />
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
                <div className="border-b border-slate-200 bg-slate-100/50 p-2.5 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Can&apos;t scan? Manual Key</p>
                </div>
                <div className="flex items-center justify-between p-3 pl-4">
                  <code className="text-sm font-semibold tracking-wide text-slate-800">{secret}</code>
                  <button type="button" onClick={copySecret} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-colors hover:bg-slate-50">
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div>
                <Input
                  label="Confirm with 6-digit code"
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="h-14 text-center font-mono text-2xl tracking-[0.25em] shadow-sm"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-3.5 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="h-12 w-full text-[15px] shadow-sm">
                Enable 2FA
              </Button>
            </form>
          )}

          {step === "backup-codes" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">2FA Enabled</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Save these emergency backup codes. They will not be shown again.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                {backupCodes.map((code) => (
                  <span key={code} className="select-all rounded-lg bg-white py-2 text-center font-mono text-sm font-medium tracking-wider text-slate-800 shadow-sm border border-slate-100">
                    {code}
                  </span>
                ))}
              </div>

              <Button onClick={() => router.push("/")} className="h-12 w-full text-[15px] shadow-sm">
                I&apos;ve Saved These
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2.5 text-[13px] font-medium text-slate-500">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200/60">
            <Lock className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <span>Secured with enterprise-grade encryption</span>
        </div>
      </div>
    </div>
  );
}
