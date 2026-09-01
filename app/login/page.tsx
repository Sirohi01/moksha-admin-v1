"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { ShieldCheck, Eye, EyeOff, Lock, Copy, Check, AlertTriangle, KeyRound, CheckCircle2, Mail, MailCheck, HeartHandshake, UsersRound, Flower2, Globe2, ChevronDown, UserRound, ArrowRight, Headphones, Clock3, MonitorCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { ApiRequestError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

type Step = "credentials" | "totp" | "2fa-setup" | "backup-codes" | "forgot-password" | "forgot-password-sent";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin, hydrated } = useAppSelector((state) => state.auth);
  const { language, setLanguage, translations } = useLanguage();
  const text = translations.login;

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
  const [languageOpen, setLanguageOpen] = useState(false);

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
    <main className="login-page">
      <div className="login-bg" aria-hidden />
      <div className="absolute right-[2.5%] top-4 z-[6]">
        <button type="button" className="language-switch !static" onClick={() => setLanguageOpen((open) => !open)} aria-expanded={languageOpen} aria-haspopup="listbox"><Globe2 /> {language === "en" ? translations.language.english : translations.language.hindi} <ChevronDown className={languageOpen ? "rotate-180" : ""} /></button>
        {languageOpen && <div role="listbox" className="absolute right-0 top-12 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
          {(["en", "hi"] as const).map((code) => <button key={code} type="button" role="option" aria-selected={language === code} onClick={() => { setLanguage(code); setLanguageOpen(false); }} className="flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-teal-50">{code === "en" ? translations.language.english : translations.language.hindi}{language === code && <Check className="h-4 w-4 text-teal-700" />}</button>)}
        </div>}
      </div>

      <section className="login-brand md:translate-y-10 xl:translate-y-14" aria-label="Moksha Sewa values">
        <div className="brand-emblem !h-[170px] !w-[170px] xl:!h-[195px] xl:!w-[195px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/moksha-sewa-logo.png" alt="Moksha Sewa" />
        </div>
        <div className="gold-ornament"><i /><b>◆</b><i /></div>
        <p className="brand-initiative !text-[18px] xl:!text-[20px]">{text.initiative}</p>
        <div className="gold-ornament"><i /><b>◆</b><i /></div>
        <h1>Moksha Sewa<br /><span>{text.portalTitle}</span></h1>
        <div className="gold-ornament"><i /><b>◆</b><i /></div>
        <p className="brand-message">{text.compassionLine}<br />{text.honorLine}<br />{text.dignityLine}</p>
        <div className="value-grid !rounded-none !border-0">
          {[[HeartHandshake,text.values.compassion,text.values.compassionCopy],[ShieldCheck,text.values.dignity,text.values.dignityCopy],[UsersRound,text.values.service,text.values.serviceCopy],[Flower2,text.values.trust,text.values.trustCopy]].map(([Icon,title,copy]) => {
            const ValueIcon = Icon as typeof ShieldCheck;
            return <article key={String(title)}><ValueIcon /><strong>{String(title)}</strong><small>{String(copy)}</small></article>;
          })}
        </div>
        <div className="trust-card !ml-[7%] !w-fit !self-start !rounded-none !border-0"><span><Lock /></span><p><strong>{text.secureTitle}</strong><br />{text.secureCopy}</p></div>
      </section>

      <section className="login-auth">
        <div className="auth-card !rounded-none !border-0">
          <div className="auth-heading"><span><ShieldCheck /></span><h2>{text.welcome}</h2><p>{text.continue}<br /><strong>{text.portalName}</strong></p><div className="gold-ornament"><i /><b>◆</b><i /></div></div>

          {step === "credentials" && (
            <form onSubmit={handleSubmit} className="credentials-form relative space-y-4 [&_label]:!text-[13px]">
              <div className="space-y-5">
                <Input
                  label={text.identifier}
                  type="text"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={text.identifierPlaceholder}
                />
                <div className="relative">
                  <div className="mb-1 flex items-center justify-between">
                    <label className="font-semibold tracking-wide text-text-secondary">{text.password}<span className="ml-0.5 text-red-500">*</span></label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setError("");
                        setStep("forgot-password");
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {text.forgot}
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

              <label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> {text.remember}</label>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-3.5 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="h-12 w-full text-[15px] shadow-sm">
                {isSubmitting ? text.signingIn : text.loginSecurely}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-teal-800"><ShieldCheck className="h-4 w-4" /> {text.twoFactorProtected}</p>
              <div className="access-notice !rounded-none [&>svg]:!h-[18px] [&>svg]:!w-[18px] [&>p]:!text-[13px] [&>p]:!leading-[1.45]"><Lock /><p><strong>{text.authorizedTitle}</strong> {text.authorizedCopy}</p></div>
            </form>
          )}

          {step === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <Mail className="h-7 w-7" />
                </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-900">{text.resetTitle}</h3>
                <p className="mt-2 text-sm text-slate-500">
                      {text.resetCopy}
                </p>
              </div>

              <Input
                label={text.email}
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
                {text.sendReset}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
                className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                ← {text.back}
              </button>
            </form>
          )}

          {step === "forgot-password-sent" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <MailCheck className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{text.inboxTitle}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">{forgotEmail}</span> — {text.inboxCopy}
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
                ← {text.back}
              </button>
            </div>
          )}

          {step === "totp" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{text.twoStepTitle}</h3>
                <p className="mt-2 text-sm text-slate-500">{text.twoStepCopy}</p>
              </div>

              <div>
                <Input
                  label={text.authCode}
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
                {text.verify}
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
                ← {text.back}
              </button>
            </form>
          )}

          {step === "2fa-setup" && (
            <form onSubmit={handleConfirmSetup} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{text.setupTitle}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {text.setupCopy}
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
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{text.manualKey}</p>
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
                  label={text.confirmCode}
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
                {text.enable2fa}
              </Button>
            </form>
          )}

          {step === "backup-codes" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{text.enabledTitle}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {text.backupCopy}
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
                {text.savedCodes}
              </Button>
            </div>
          )}
          <div className="auth-help !text-[14px] [&>svg]:!h-[18px] [&>svg]:!w-[18px]"><Headphones /> {text.needHelp} {text.contact} <a href="mailto:support@mokshasewa.com">{text.itSupport}</a></div>
        </div>
      </section>

      <footer className="security-strip">
        {[[ShieldCheck,text.footer.access,text.footer.accessCopy],[Lock,text.footer.security,text.footer.securityCopy],[Clock3,text.footer.audit,text.footer.auditCopy],[MonitorCheck,text.footer.reliable,text.footer.reliableCopy]].map(([Icon,title,copy]) => {
          const StripIcon = Icon as typeof ShieldCheck;
          return <div key={String(title)}><StripIcon /><p><strong>{String(title)}</strong><small>{String(copy)}</small></p></div>;
        })}
      </footer>
    </main>
  );
}
