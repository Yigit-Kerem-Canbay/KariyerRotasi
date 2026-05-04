"use client";

import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SavedRow = {
  userId?: string;
  jobId: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    company: { id: string; name: string };
  };
};

export default function SavedJobsPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [items, setItems] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (user?.role !== "job_seeker") {
      router.push("/profile");
      return;
    }
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{ items: SavedRow[] }>(
          "/saved-jobs/me?limit=100"
        );
        if (!cancel) setItems(data.items ?? []);
      } catch {
        if (!cancel) setItems([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [token, user?.role, router]);

  if (!user || loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center text-slate-500">
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-slate-900">
          Kayıtlı ilanlar
        </h1>
        <Link href="/profile" className="text-sm font-semibold text-indigo-600">
          Profiline dön
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-slate-600">Kayıtlı ilan yok.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((row) => (
            <li key={row.jobId}>
              <Link
                href={`/job/${row.job.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="font-bold text-slate-900">{row.job.title}</div>
                <div className="text-sm text-indigo-600 font-semibold mt-1">
                  {row.job.company.name}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {row.job.location}
                  {row.job.salaryMin != null && row.job.salaryMax != null
                    ? ` · ${row.job.salaryMin.toLocaleString("tr-TR")}–${row.job.salaryMax.toLocaleString("tr-TR")} ₺`
                    : ""}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
