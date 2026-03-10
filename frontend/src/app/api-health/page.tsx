import { api } from "@/lib/api";

export default async function ApiHealthPage() {
  const res = await api.get("/");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Backend Bağlantı Testi</h1>
      <pre className="mt-4 rounded bg-slate-900 text-slate-100 p-4 text-sm overflow-x-auto">
        {JSON.stringify(res.data, null, 2)}
      </pre>
    </div>
  );
}

