"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function onSubmit(values: FormValues) {
    const res = await api.post("/auth/login", values);
    const { user, accessToken } = res.data;
    setAuth({ user, token: accessToken });
    router.push("/jobs");
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Giriş Yap</h1>
      <p className="mt-1 text-sm text-slate-600">
        Kariyer Rotası hesabınla devam et.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            E-posta
          </label>
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/20"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Şifre
          </label>
          <input
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/20"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {isSubmitting ? "Gönderiliyor..." : "Giriş"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Hesabın yok mu?{" "}
        <Link className="text-slate-900 underline" href="/register">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}

