"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function onSubmit(values: FormValues) {
    try {
      const res = await api.post("/auth/login", values);
      const { user, accessToken } = res.data;
      setAuth({ user, token: accessToken });
      router.push("/jobs");
    } catch (error: any) {
      setError("root", {
        message: error.response?.data?.message || "E-posta veya şifre hatalı.",
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
          Giriş Yap
        </h1>
        <p className="text-lg text-slate-500">
          Hesabınıza güvenle erişin ve kariyer yolculuğunuza devam edin.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-base">E-posta Adresi</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <Input
              id="email"
              placeholder="isim@sirket.com"
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-base">Şifre</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Şifremi Unuttum
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
            <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-14 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200"
          isLoading={isSubmitting}
        >
          Giriş Yap
        </Button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-sm uppercase">
          <span className="bg-white px-4 text-slate-400 font-medium tracking-widest">VEYA</span>
        </div>
      </div>

      <p className="text-center text-base text-slate-600">
        Henüz hesabınız yok mu?{" "}
        <Link 
          href="/register" 
          className="font-extrabold text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-4 decoration-2"
        >
          Hemen Kayıt Olun
        </Link>
      </p>
    </motion.div>
  );
}
