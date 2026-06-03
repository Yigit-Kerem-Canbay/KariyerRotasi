"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, Briefcase, Building2,
  UserCircle, Phone, FileText, Globe, CheckCircle2, XCircle,
} from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

// ── Password regex ──
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const PASSWORD_MSG = "En az 8 karakter, 1 büyük harf ve 1 rakam içermelidir.";

// ── Schemas per tab ──
const jobSeekerSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı."),
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MSG),
});

const individualEmployerSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı."),
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MSG),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin."),
});

const corporateEmployerSchema = z.object({
  name: z.string().min(2, "Yetkili kişi adı en az 2 karakter olmalı."),
  email: z.string().email("Geçerli bir kurumsal e-posta girin."),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MSG),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin."),
  companyName: z.string().min(2, "Şirket adı en az 2 karakter olmalı."),
  taxNumber: z.string().min(10, "Vergi numarası 10 veya 11 haneli olmalı."),
  companyWebsite: z.string().optional(),
});

type Tab = "job_seeker" | "individual_employer" | "corporate_employer";

const TABS: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "job_seeker",
    label: "İş Arayan",
    icon: <UserCircle className="h-6 w-6" />,
    description: "İş arıyorum",
  },
  {
    id: "individual_employer",
    label: "Bireysel İşveren",
    icon: <Briefcase className="h-6 w-6" />,
    description: "Eleman arıyorum",
  },
  {
    id: "corporate_employer",
    label: "Kurumsal Şirket",
    icon: <Building2 className="h-6 w-6" />,
    description: "Şirketim adına",
  },
];

// ── Password strength meter ──
function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  return score; // 0-5
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = getPasswordStrength(password);
  const labels = ["Çok Zayıf", "Zayıf", "Orta", "Güçlü", "Çok Güçlü", "Mükemmel"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500", "bg-emerald-500"];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < score ? colors[score] : "bg-slate-100"
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {score >= 3 ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-slate-300" />
        )}
        <span className={cn("text-xs font-semibold", score >= 3 ? "text-green-600" : "text-slate-400")}>
          {labels[score]}
        </span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>("job_seeker");
  const [showPassword, setShowPassword] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const schema =
    activeTab === "job_seeker"
      ? jobSeekerSchema
      : activeTab === "individual_employer"
        ? individualEmployerSchema
        : corporateEmployerSchema;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema as any),
  });

  const watchedPassword = watch("password", "");

  // Reset form when tab changes
  React.useEffect(() => {
    reset();
    setGlobalError(null);
  }, [activeTab, reset]);

  async function onSubmit(values: any) {
    setIsSubmitting(true);
    setGlobalError(null);

    const endpoints: Record<Tab, string> = {
      job_seeker: "/auth/register/job-seeker",
      individual_employer: "/auth/register/individual-employer",
      corporate_employer: "/auth/register/corporate-employer",
    };

    try {
      await api.post(endpoints[activeTab], values);
      // Redirect to verification page with email
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setGlobalError(Array.isArray(msg) ? msg[0] : msg || "Kayıt olurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-7"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Hesap Oluşturun
        </h1>
        <p className="text-base text-slate-500">
          Kariyer yolculuğunuza bugün başlayın.
        </p>
      </div>

      {/* Tab Selection */}
      <div className="grid grid-cols-3 gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-2xl border-2 p-3 sm:p-4 transition-all outline-none cursor-pointer",
              activeTab === tab.id
                ? "border-blue-600 bg-blue-50/40 shadow-md shadow-blue-100"
                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50"
            )}
          >
            <div
              className={cn(
                "mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              )}
            >
              {tab.icon}
            </div>
            <span
              className={cn(
                "text-xs sm:text-sm font-bold text-center leading-tight",
                activeTab === tab.id ? "text-blue-900" : "text-slate-500"
              )}
            >
              {tab.label}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
              {tab.description}
            </span>
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* ─── Corporate: Company Fields (shown first for context) ─── */}
            {activeTab === "corporate_employer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-bold">Şirket Adı</Label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input
                      id="companyName"
                      placeholder="Trendyol A.Ş."
                      className="h-12 pl-12 text-sm rounded-xl"
                      error={!!errors.companyName}
                      helperText={(errors.companyName as any)?.message}
                      {...register("companyName")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber" className="text-sm font-bold">Vergi No</Label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <Input
                        id="taxNumber"
                        placeholder="1234567890"
                        className="h-12 pl-12 text-sm rounded-xl"
                        error={!!errors.taxNumber}
                        helperText={(errors.taxNumber as any)?.message}
                        {...register("taxNumber")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite" className="text-sm font-bold">Web Sitesi</Label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <Input
                        id="companyWebsite"
                        placeholder="trendyol.com"
                        className="h-12 pl-12 text-sm rounded-xl"
                        error={!!errors.companyWebsite}
                        helperText={(errors.companyWebsite as any)?.message}
                        {...register("companyWebsite")}
                      />
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-3 flex items-start gap-2.5">
                  <Building2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Kurumsal kayıt için <strong>şirketinize ait e-posta</strong> kullanmalısınız
                    (Gmail, Hotmail kabul edilmez). Hesabınız admin onayından sonra aktif olacaktır.
                  </p>
                </div>
              </>
            )}

            {/* ─── Name ─── */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold">
                {activeTab === "corporate_employer" ? "Yetkili Kişi Ad Soyad" : "Ad Soyad"}
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="name"
                  placeholder={activeTab === "corporate_employer" ? "Ahmet Yılmaz (İK Yetkilisi)" : "Ahmet Yılmaz"}
                  className="h-12 pl-12 text-sm rounded-xl"
                  error={!!errors.name}
                  helperText={(errors.name as any)?.message}
                  {...register("name")}
                />
              </div>
            </div>

            {/* ─── Email ─── */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold">
                {activeTab === "corporate_employer" ? "Kurumsal E-posta" : "E-posta Adresi"}
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  placeholder={
                    activeTab === "corporate_employer"
                      ? "ahmet@trendyol.com"
                      : "ahmet@e-posta.com"
                  }
                  type="email"
                  autoComplete="email"
                  className="h-12 pl-12 text-sm rounded-xl"
                  error={!!errors.email}
                  helperText={(errors.email as any)?.message}
                  {...register("email")}
                />
              </div>
            </div>

            {/* ─── Phone (Individual & Corporate) ─── */}
            {(activeTab === "individual_employer" || activeTab === "corporate_employer") && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold">Telefon Numarası</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="phone"
                    placeholder="05XX XXX XX XX"
                    type="tel"
                    className="h-12 pl-12 text-sm rounded-xl"
                    error={!!errors.phone}
                    helperText={(errors.phone as any)?.message}
                    {...register("phone")}
                  />
                </div>
              </div>
            )}

            {/* ─── Password ─── */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="h-12 pl-12 pr-12 text-sm rounded-xl"
                  error={!!errors.password}
                  helperText={(errors.password as any)?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <PasswordStrength password={watchedPassword} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-red-50 p-3.5 text-sm text-red-600 font-semibold border border-red-100 flex items-center gap-2.5"
          >
            <XCircle className="h-4 w-4 flex-shrink-0" />
            {globalError}
          </motion.div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 mt-2"
          isLoading={isSubmitting}
        >
          {activeTab === "corporate_employer" ? "Kurumsal Başvuru Yap" : "Kayıt Ol ve Başla"}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-slate-500">
        Zaten bir hesabınız var mı?{" "}
        <Link
          href="/login"
          className="font-bold text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-4 decoration-2"
        >
          Giriş Yapın
        </Link>
      </p>
    </motion.div>
  );
}
