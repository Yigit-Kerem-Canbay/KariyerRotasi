"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, UserCircle } from "lucide-react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(2, "Ad en az 2 karakter olmalı."),
    email: z.string().email("Geçerli bir e-posta girin."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
    role: z.enum(["job_seeker", "employer"], "Lütfen bir rol seçin."),
  })
  .strict();

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "job_seeker" },
  });

  const selectedRole = watch("role");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function onSubmit(values: FormValues) {
    try {
      const res = await api.post("/auth/register", values);
      const { user, accessToken } = res.data;
      setAuth({ user, token: accessToken });
      router.push("/jobs");
    } catch (error: any) {
      setError("root", {
        message: error.response?.data?.message || "Kayıt olurken bir hata oluştu.",
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Kayıt Ol
        </h1>
        <p className="text-lg text-slate-500">
          Geleceğinizi şekillendirmek için ilk adımı atın.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-4">
          <Label className="text-base text-center block">Hesap Türünü Seçin</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue("role", "job_seeker", { shouldValidate: true })}
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all outline-none",
                selectedRole === "job_seeker"
                  ? "border-blue-600 bg-blue-50/30 shadow-md"
                  : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              <div className={cn(
                "mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                selectedRole === "job_seeker" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              )}>
                <UserCircle className="h-7 w-7" />
              </div>
              <span className={cn(
                "text-base font-bold",
                selectedRole === "job_seeker" ? "text-blue-900" : "text-slate-600"
              )}>İş Arayan</span>
            </button>

            <button
              type="button"
              onClick={() => setValue("role", "employer", { shouldValidate: true })}
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all outline-none",
                selectedRole === "employer"
                  ? "border-blue-600 bg-blue-50/30 shadow-md"
                  : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              <div className={cn(
                "mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                selectedRole === "employer" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              )}>
                <Briefcase className="h-7 w-7" />
              </div>
              <span className={cn(
                "text-base font-bold",
                selectedRole === "employer" ? "text-blue-900" : "text-slate-600"
              )}>İşveren</span>
            </button>
          </div>
          {errors.role && (
            <p className="text-center text-xs font-bold text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="name" className="text-base">Ad Soyad</Label>
          <div className="relative">
            <User className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <Input
              id="name"
              placeholder="Ahmet Yılmaz"
              className="h-14 pl-12 text-base rounded-2xl"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name")}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-base">E-posta Adresi</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <Input
              id="email"
              placeholder="ahmet@e-posta.com"
              type="email"
              autoComplete="email"
              className="h-14 pl-12 text-base rounded-2xl"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email")}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="password" title="Şifre" className="text-base">Güçlü Bir Şifre Oluşturun</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="h-14 pl-12 pr-12 text-base rounded-2xl"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {errors.root && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 font-bold border border-red-100 flex items-center gap-3">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-14 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 mt-4"
          isLoading={isSubmitting}
        >
          Kayıt Ol ve Başla
        </Button>
      </form>

      <p className="text-center text-base text-slate-600">
        Zaten bir hesabınız var mı?{" "}
        <Link 
          href="/login" 
          className="font-extrabold text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-4 decoration-2"
        >
          Giriş Yapın
        </Link>
      </p>
    </motion.div>
  );
}
