"use client";

import { useAuthStore } from "@/store/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useEffect } from "react";
import CvUpload from "@/components/profile/CvUpload";

const schema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı."),
});

type FormValues = z.infer<typeof schema>;

export default function ProfileEditPage() {
  const { user, token, setUser } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const res = await api.patch("/users/me", values);
      setUser(res.data);
      router.push("/profile");
    } catch (err) {
      console.error("Profil güncellenemedi", err);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900">Profili Düzenle</h1>
        <p className="mt-1 text-sm text-slate-600">
          Kişisel bilgilerini ve özgeçmişini buradan güncelleyebilirsin.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
          {/* Personal Info Section */}
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Ad Soyad
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-slate-700">
                E-posta adresi
              </label>
              <div className="relative mt-1">
                <input
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 cursor-not-allowed pr-10"
                  value={user.email}
                  title="Güvenlik nedeniyle e-posta adresinizi değiştiremezsiniz."
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span title="Bu alan değiştirilemez">🔒</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <CvUpload />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-slate-900/10"
            >
              {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
