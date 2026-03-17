"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function CvUpload() {
  const { user, setUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload the file
      const uploadRes = await api.post("/uploads/cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const cvUrl = uploadRes.data.url;

      // 2. Update user profile with the new CV URL
      const userRes = await api.patch("/users/me", { cvUrl });
      setUser(userRes.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Yükleme sırasında bir hata oluştu."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        CV / Özgeçmiş Yükle
      </label>

      {user?.cvUrl && (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Mevcut bir CV yüklü. Değiştirmek için yeni bir dosya seçin.
        </div>
      )}

      <div className="relative">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2.5 file:px-4
            file:rounded-xl file:border-0
            file:text-sm file:font-semibold
            file:bg-slate-900 file:text-white
            hover:file:bg-slate-800
            cursor-pointer disabled:opacity-50"
        />
        {uploading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <p className="text-xs text-slate-400">
        Desteklenen formatlar: PDF, DOC, DOCX. Maksimum boyut: 5MB.
      </p>
    </div>
  );
}
