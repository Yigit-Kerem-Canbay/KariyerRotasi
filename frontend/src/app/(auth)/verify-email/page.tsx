"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [code, setCode] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Countdown for resend
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only last character
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (value && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);

    // Focus the next empty or the last filled input
    const nextEmpty = newCode.findIndex((c) => !c);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();

    // Auto-submit if complete
    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  }

  async function handleVerify(fullCode?: string) {
    const codeStr = fullCode ?? code.join("");
    if (codeStr.length !== 6) {
      setError("Lütfen 6 haneli doğrulama kodunu girin.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await api.post("/auth/verify-email", { email, code: codeStr });
      const { user, accessToken } = res.data;

      if (accessToken) {
        setAuth({ user, token: accessToken });
        setSuccess(true);
        setTimeout(() => {
          if (user.role === "individual_employer" || user.role === "corporate_employer") {
            router.push("/employer/jobs");
          } else {
            router.push("/jobs");
          }
        }, 1500);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || "Doğrulama başarısız oldu.");
      // Clear code on error
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      await api.post("/auth/resend-verification", { email });
      setResendCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || "Kod gönderilemedi.");
    } finally {
      setIsResending(false);
    }
  }

  if (!email) {
    router.push("/register");
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Icon */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full",
            success ? "bg-green-100" : "bg-blue-100"
          )}
        >
          {success ? (
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          ) : (
            <Mail className="h-10 w-10 text-blue-600" />
          )}
        </motion.div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {success ? "Doğrulandı! ✅" : "E-posta Doğrulama"}
        </h1>
        <p className="text-base text-slate-500">
          {success ? (
            "Yönlendiriliyorsunuz..."
          ) : (
            <>
              <strong className="text-slate-700">{email}</strong> adresine gönderilen
              6 haneli kodu girin.
            </>
          )}
        </p>
      </div>

      {!success && (
        <>
          {/* Code Input */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={cn(
                  "h-14 w-11 sm:h-16 sm:w-14 rounded-xl border-2 text-center text-2xl font-bold outline-none transition-all",
                  error
                    ? "border-red-300 bg-red-50 text-red-600"
                    : digit
                      ? "border-blue-500 bg-blue-50/30 text-slate-900"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:bg-blue-50/20"
                )}
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm font-semibold text-red-500"
            >
              {error}
            </motion.p>
          )}

          {/* Verify Button */}
          <Button
            type="button"
            onClick={() => handleVerify()}
            className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            isLoading={isVerifying}
          >
            <span className="flex items-center gap-2">
              Doğrula
              <ArrowRight className="h-5 w-5" />
            </span>
          </Button>

          {/* Resend */}
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-2">Kod gelmedi mi?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-bold transition-colors",
                resendCooldown > 0
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-700 cursor-pointer"
              )}
            >
              <RotateCcw className={cn("h-4 w-4", isResending && "animate-spin")} />
              {resendCooldown > 0
                ? `Tekrar gönder (${resendCooldown}s)`
                : "Tekrar Gönder"}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<div>Yükleniyor...</div>}>
      <VerifyEmailForm />
    </React.Suspense>
  );
}
