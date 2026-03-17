"use client";

import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-slate-400 mt-2">{user.email}</p>
            </div>
            <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold border-4 border-slate-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Rol
              </h3>
              <p className="mt-1 text-lg font-medium text-slate-900">
                {user.role === "job_seeker" ? "İş Arayan" : "İşveren"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Kayıt Tarihi
              </h3>
              <p className="mt-1 text-lg font-medium text-slate-900">
                {new Date(user.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              CV / Özgeçmiş
            </h3>
            {user.cvUrl ? (
              <div className="mt-2 flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    Yüklü Özgeçmiş
                  </p>
                  <p className="text-xs text-slate-500">PDF / Word</p>
                </div>
                <a
                  href={`http://localhost:4000${user.cvUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-slate-900 hover:underline"
                >
                  Görüntüle
                </a>
              </div>
            ) : (
              <p className="mt-1 text-slate-500 italic">Henüz bir CV yüklenmemiş.</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-4">
            <Link
              href="/profile/edit"
              className="flex-1 bg-slate-900 text-white text-center py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Profili Düzenle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
