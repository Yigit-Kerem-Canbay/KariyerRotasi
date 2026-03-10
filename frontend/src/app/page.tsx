import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Kariyer Rotası
          </h1>
          <p className="mt-4 text-slate-700 leading-7">
            İş arayanları ve işverenleri yapay zeka destekli eşleştirme ve güçlü
            filtreleme ile buluşturan platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-white hover:opacity-90 transition-opacity"
            >
              Hesap oluştur
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 transition-colors"
            >
              İlanlara göz at
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
