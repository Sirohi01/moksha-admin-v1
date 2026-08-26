"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Mail,
  MailCheck,
  ArrowLeft,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { ApiRequestError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Step = "credentials" | "totp" | "2fa-setup" | "backup-codes" | "forgot-password" | "forgot-password-sent";

/* ---------------------------------------------------------------- */
/* Presentational helpers (no auth logic lives here)                  */
/* ---------------------------------------------------------------- */

function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "inline-flex items-center gap-4 rounded-2xl border border-white/80 bg-white/90 px-5 py-3 shadow-[0_8px_28px_rgba(23,63,70,0.10)] backdrop-blur"
          : "inline-flex items-center gap-6 rounded-[24px] border border-white/80 bg-white px-7 py-4 shadow-[0_12px_34px_rgba(23,63,70,0.14)]"
      }
    >
      <img
        src="/moksha-sewa-logo.png"
        alt="Moksha Sewa"
        className={compact ? "h-11 w-auto object-contain" : "h-16 w-auto object-contain"}
      />
      <span className={compact ? "h-9 w-px bg-slate-200" : "h-12 w-px bg-slate-200"} />
      <img
        src="/arogya-logo.png"
        alt="Arogya"
        className={compact ? "h-11 w-auto object-contain" : "h-16 w-auto object-contain"}
      />
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-3 rounded-2xl border border-[#E8B4A6] bg-[#FBEDE8] px-4 py-3.5 text-sm text-[#8A2F16]"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="font-medium leading-relaxed">{message}</span>
    </div>
  );
}

function StepBadge({ icon, tone = "river" }: { icon: React.ReactNode; tone?: "river" | "success" }) {
  return (
    <div
      className={
        "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ring-1 " +
        (tone === "success"
          ? "bg-[#E7F4EE] text-[#1B6B4A] ring-[#C3E4D3]"
          : "bg-[#E4EFF1] text-[var(--ng-river)] ring-[#C4DDE1]")
      }
    >
      {icon}
    </div>
  );
}

function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ng-focus flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-slate-500 transition-colors hover:text-[var(--ng-ghat)]"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </button>
  );
}

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

  /* ---- derived, display-only ---- */
  const isResetFlow = step === "forgot-password" || step === "forgot-password-sent";
  const signInStage = step === "credentials" ? 1 : step === "totp" || step === "2fa-setup" ? 2 : 3;
  const stageLabels = ["Sign in", "Verify", "Ready"];

  return (
    <div className="ng-root min-h-screen bg-[var(--ng-mist)] font-[var(--ng-body)] text-[var(--ng-ink)] lg:grid lg:grid-cols-[1.05fr_minmax(0,1fr)]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

        .ng-root {
          --ng-ghat: #173F46;
          --ng-river: #2E6871;
          --ng-current: #3D8D97;
          --ng-marigold: #E4922B;
          --ng-mist: #F4F7F6;
          --ng-ink: #0B1B20;
          --ng-body: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
          --ng-display: 'Instrument Serif', Georgia, serif;
          --ng-mono: 'IBM Plex Mono', ui-monospace, monospace;
        }
        .ng-display { font-family: var(--ng-display); font-weight: 400; letter-spacing: -0.01em; }
        .ng-mono { font-family: var(--ng-mono); }
        .ng-focus:focus-visible {
          outline: 2px solid var(--ng-current);
          outline-offset: 2px;
        }
        .ng-wave { animation: ng-drift 26s linear infinite; }
        .ng-wave--slow { animation-duration: 40s; }
        .ng-wave--slower { animation-duration: 58s; }
        @keyframes ng-drift {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ng-rise { animation: ng-rise 420ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes ng-rise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ng-wave, .ng-rise { animation: none !important; }
        }
      `}</style>

      {/* ---------------- Brand panel (desktop) ---------------- */}
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#F8F3E9_0%,#EAF4F2_46%,#D7ECE9_100%)] px-12 py-12 text-[var(--ng-ghat)] lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/70 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-8 top-[18%] h-52 w-52 rounded-full bg-[#F3C98C]/20 blur-3xl" aria-hidden="true" />
        {/* River: layered current lines, the one bold gesture on the page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]" aria-hidden="true">
          <svg className="ng-wave ng-wave--slower absolute bottom-0 h-full w-[200%]" viewBox="0 0 2400 600" preserveAspectRatio="none">
            <path d="M0 380 C 300 320 600 440 900 380 C 1200 320 1500 440 1800 380 C 2000 340 2200 400 2400 380 L2400 600 L0 600 Z" fill="#CFE5E2" />
          </svg>
          <svg className="ng-wave ng-wave--slow absolute bottom-0 h-full w-[200%]" viewBox="0 0 2400 600" preserveAspectRatio="none">
            <path d="M0 450 C 320 400 560 510 900 455 C 1240 400 1480 510 1800 455 C 2020 418 2200 470 2400 450 L2400 600 L0 600 Z" fill="#B8DAD5" />
          </svg>
          <svg className="ng-wave absolute bottom-0 h-full w-[200%]" viewBox="0 0 2400 600" preserveAspectRatio="none">
            <path d="M0 520 C 300 490 600 560 900 522 C 1200 484 1500 556 1800 522 C 2000 500 2200 540 2400 520 L2400 600 L0 600 Z" fill="#93C7C1" />
            <path d="M0 520 C 300 490 600 560 900 522 C 1200 484 1500 556 1800 522 C 2000 500 2200 540 2400 520" fill="none" stroke="#D7993F" strokeWidth="2" strokeOpacity="0.55" />
          </svg>
        </div>

        <div className="relative z-10">
          <LogoLockup />
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="ng-mono text-[11px] uppercase tracking-[0.22em] text-[#B77722]">Staff portal</p>
          <h1 className="ng-display mt-5 text-[3.65rem] leading-[1.02] text-[var(--ng-ghat)]">
            Namo Gange
            <span className="block italic text-[var(--ng-current)]">Platform</span>
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-7 text-[#42666C]">
            One console for the seva that runs on the ghats — Namo Gange operations, Moksha Sewa arrangements,
            and Arogya care records.
          </p>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-5 border-t border-[#9DC7C2]/70 pt-7">
            {[
              ["Namo Gange", "Ghat operations"],
              ["Moksha Sewa", "Last-rites seva"],
              ["Arogya", "Health services"],
            ].map(([title, sub]) => (
              <div key={title}>
                <dt className="text-[15px] font-semibold text-[var(--ng-ghat)]">{title}</dt>
                <dd className="mt-1 text-[14px] leading-snug text-black">{sub}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 text-[14px] font-medium text-black">
          <Lock className="h-4 w-4" />
          <span>Encrypted session · Two-step verification required for every staff account</span>
        </div>
      </aside>

      {/* ---------------- Form column ---------------- */}
      <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8">
        {/* Mobile brand strip — both logos stay together here too */}
        <div className="mb-8 flex flex-col items-center gap-4 lg:hidden">
          <LogoLockup compact />
          <h1 className="ng-display text-center text-[2rem] leading-tight text-[var(--ng-ghat)]">
            Namo Gange <span className="italic text-[var(--ng-current)]">Platform</span>
          </h1>
        </div>

        <div className="w-full max-w-[26rem]">
          {/* Where you are in the flow */}
          <div className="mb-4 flex items-center gap-3">
            {isResetFlow ? (
              <>
                <span className="h-1 w-full rounded-full bg-[var(--ng-marigold)]" />
                <span className="ng-mono shrink-0 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Password reset
                </span>
              </>
            ) : (
              <>
                {stageLabels.map((label, i) => (
                  <div key={label} className="flex-1">
                    <span
                      className={
                        "block h-1 rounded-full transition-colors duration-500 " +
                        (i + 1 <= signInStage ? "bg-[var(--ng-current)]" : "bg-slate-200")
                      }
                    />
                    <span
                      className={
                        "ng-mono mt-2 block text-[10px] uppercase tracking-[0.14em] " +
                        (i + 1 === signInStage ? "text-[var(--ng-river)]" : "text-slate-400")
                      }
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white px-6 py-8 shadow-[0_1px_2px_rgba(8,34,42,0.04),0_18px_40px_-24px_rgba(8,34,42,0.28)] sm:px-9 sm:py-10">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--ng-marigold)] via-[#1E6FA8] to-[var(--ng-current)]" />

            {step === "credentials" && (
              <form onSubmit={handleSubmit} className="ng-rise space-y-6">
                <div>
                  <h2 className="ng-display text-[1.75rem] leading-tight text-[var(--ng-ghat)]">Sign in to continue</h2>
                  <p className="mt-1.5 text-sm text-slate-500">Use your Moksha Sewa staff account.</p>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mokshasewa.com"
                    className="h-12 rounded-xl"
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
                        className="ng-focus rounded text-[11px] font-semibold text-[var(--ng-current)] transition-colors hover:text-[var(--ng-river)]"
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
                      className="h-12 rounded-xl pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="ng-focus absolute right-2.5 top-[26px] flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && <ErrorNote message={error} />}

                <Button type="submit" loading={isSubmitting} className="h-12 w-full rounded-xl text-[15px]">
                  Sign in
                </Button>
              </form>
            )}

            {step === "forgot-password" && (
              <form onSubmit={handleForgotPassword} className="ng-rise space-y-6">
                <div className="text-center">
                  <StepBadge icon={<Mail className="h-7 w-7" />} />
                  <h2 className="ng-display mt-5 text-[1.6rem] text-[var(--ng-ghat)]">Reset your password</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Enter your admin account email and we&apos;ll send a link to choose a new password.
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
                  className="h-12 rounded-xl"
                />

                {error && <ErrorNote message={error} />}

                <Button type="submit" loading={isSubmitting} className="h-12 w-full rounded-xl text-[15px]">
                  Send reset link
                </Button>

                <BackLink
                  onClick={() => {
                    setStep("credentials");
                    setError("");
                  }}
                >
                  Back to sign in
                </BackLink>
              </form>
            )}

            {step === "forgot-password-sent" && (
              <div className="ng-rise space-y-6">
                <div className="text-center">
                  <StepBadge tone="success" icon={<MailCheck className="h-7 w-7" />} />
                  <h2 className="ng-display mt-5 text-[1.6rem] text-[var(--ng-ghat)]">Check your inbox</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    If an account exists for{" "}
                    <span className="ng-mono text-[13px] text-[var(--ng-ghat)]">{forgotEmail}</span>, a password reset
                    link is on its way. The link expires in 30 minutes.
                  </p>
                </div>

                <BackLink
                  onClick={() => {
                    setStep("credentials");
                    setError("");
                  }}
                >
                  Back to sign in
                </BackLink>
              </div>
            )}

            {step === "totp" && (
              <form onSubmit={handleSubmit} className="ng-rise space-y-6">
                <div className="text-center">
                  <StepBadge icon={<ShieldCheck className="h-7 w-7" />} />
                  <h2 className="ng-display mt-5 text-[1.6rem] text-[var(--ng-ghat)]">Two-step verification</h2>
                  <p className="mt-2 text-sm text-slate-500">Enter the 6-digit code from your authenticator app.</p>
                </div>

                <Input
                  label="Authentication Code"
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="ng-mono h-14 rounded-xl text-center text-2xl tracking-[0.4em]"
                />

                {error && <ErrorNote message={error} />}

                <Button type="submit" loading={isSubmitting} className="h-12 w-full rounded-xl text-[15px]">
                  Verify code
                </Button>

                <BackLink
                  onClick={() => {
                    setStep("credentials");
                    setTotpCode("");
                    setError("");
                  }}
                >
                  Back to sign in
                </BackLink>
              </form>
            )}

            {step === "2fa-setup" && (
              <form onSubmit={handleConfirmSetup} className="ng-rise space-y-6">
                <div className="text-center">
                  <StepBadge icon={<KeyRound className="h-7 w-7" />} />
                  <h2 className="ng-display mt-5 text-[1.6rem] text-[var(--ng-ghat)]">Secure your account</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Scan this QR code with an authenticator app such as Google Authenticator.
                  </p>
                </div>

                {qrDataUrl && (
                  <div className="flex justify-center">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                      { }
                      <img src={qrDataUrl} alt="QR Code" className="h-40 w-40" />
                    </div>
                  </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
                  <div className="border-b border-slate-200 px-4 py-2.5">
                    <p className="ng-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Can&apos;t scan? Enter this key
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-3 pl-4 pr-3">
                    <code className="ng-mono select-all break-all text-[13px] text-[var(--ng-ghat)]">{secret}</code>
                    <button
                      type="button"
                      onClick={copySecret}
                      aria-label="Copy setup key"
                      className="ng-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50"
                    >
                      {copied ? <Check className="h-4 w-4 text-[#1B6B4A]" /> : <Copy className="h-4 w-4 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <Input
                  label="Confirm with 6-digit code"
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="ng-mono h-14 rounded-xl text-center text-2xl tracking-[0.4em]"
                />

                {error && <ErrorNote message={error} />}

                <Button type="submit" loading={isSubmitting} className="h-12 w-full rounded-xl text-[15px]">
                  Enable two-step verification
                </Button>
              </form>
            )}

            {step === "backup-codes" && (
              <div className="ng-rise space-y-6">
                <div className="text-center">
                  <StepBadge tone="success" icon={<CheckCircle2 className="h-7 w-7" />} />
                  <h2 className="ng-display mt-5 text-[1.6rem] text-[var(--ng-ghat)]">Two-step verification is on</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Save these backup codes somewhere safe. Each one works once, and this screen won&apos;t appear again.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  {backupCodes.map((code) => (
                    <span
                      key={code}
                      className="ng-mono select-all rounded-lg border border-slate-200 bg-white py-2 text-center text-[13px] tracking-wider text-[var(--ng-ghat)]"
                    >
                      {code}
                    </span>
                  ))}
                </div>

                <Button onClick={() => router.push("/")} className="h-12 w-full rounded-xl text-[15px]">
                  I&apos;ve saved these
                </Button>
              </div>
            )}
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[14px] text-slate-500 lg:hidden">
            <Lock className="h-4 w-4" />
            Encrypted session · staff access only
          </p>
        </div>
      </main>
    </div>
  );
}