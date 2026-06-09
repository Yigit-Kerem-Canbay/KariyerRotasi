"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  companyLogoSrc,
  resolveLogoFileKey,
  warmupCompanyLogoFor,
} from '@/lib/companyLogo';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const jobCount = (c: { _count?: { jobs?: number }; jobs?: unknown[] }) =>
    c._count?.jobs ?? (Array.isArray(c.jobs) ? c.jobs.length : 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('Tümü');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetch('http://localhost:4000/api/companies')
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching companies:', err);
        setLoading(false);
      });
  }, []);

  const sectors = useMemo(() => {
    const s = new Set(companies.map((c) => c.sector || 'Genel').filter(Boolean));
    return ['Tümü', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'tr'))];
  }, [companies]);



  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const q = searchTerm.toLocaleLowerCase('tr-TR');
      const matchesSearch =
        company.name.toLocaleLowerCase('tr-TR').includes(q) ||
        (company.description &&
          company.description.toLocaleLowerCase('tr-TR').includes(q));
      const matchesSector =
        selectedSector === 'Tümü' || (company.sector || 'Genel') === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [companies, searchTerm, selectedSector]);

  /** Sunum için: logosu olan (dosyayı eşleştirebildiğimiz) şirketler üstte, sonra alfabetik */
  const sortedForDisplay = useMemo(() => {
    const list = [...filteredCompanies];
    list.sort((a, b) => {
      const ka = resolveLogoFileKey({ name: a.name, website: a.website });
      const kb = resolveLogoFileKey({ name: b.name, website: b.website });
      const ha = ka ? 1 : 0;
      const hb = kb ? 1 : 0;
      if (ha !== hb) return hb - ha;
      return (a.name || '').localeCompare(b.name || '', 'tr');
    });
    return list;
  }, [filteredCompanies]);

  const totalPages = Math.ceil(sortedForDisplay.length / itemsPerPage);
  const currentCompanies = sortedForDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSector]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="relative w-full overflow-hidden bg-indigo-600 pb-24 pt-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white">
              Platformdaki şirketler
            </h1>
            <p className="text-lg text-indigo-100">
              Türkiye&apos;nin önde gelen şirketlerini keşfedin. Logolu markalar listelerde öne
              alınır; geri kalanlar ada göre sıralanır.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-12 max-w-[1200px] px-4">
        <div className="mb-8 flex flex-col items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-indigo-900/5 md:flex-row">
          <div className="relative w-full flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Şirket adı veya kelime ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-[15px] font-medium outline-none transition-all focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex w-full gap-4 md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-8 text-[14px] font-medium outline-none transition-all focus:border-indigo-500 focus:bg-white"
              >
                {sectors.map((sector: string) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>


          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {sortedForDisplay.length}{' '}
            <span className="text-lg font-medium text-gray-500">şirket bulundu</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse flex-col items-center rounded-3xl border border-gray-200/80 bg-white p-6"
              >
                <div className="mb-4 h-20 w-20 shrink-0 rounded-2xl bg-gray-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mb-4 h-3 w-1/3 rounded bg-gray-100" />
                <div className="mt-auto h-3 w-full rounded bg-gray-50" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentCompanies.map((comp) => {
                const logoKey = resolveLogoFileKey({ name: comp.name, website: comp.website });
                const simHash = Math.abs(
                  comp.name
                    .split('')
                    .reduce(
                      (acc: number, char: string) => char.charCodeAt(0) + ((acc << 5) - acc),
                      0,
                    ),
                );
                const bg = `hsl(${simHash % 360}, 80%, 55%)`;

                return (
                  <Link
                    key={comp.id}
                    href={`/company/${comp.id}`}
                    prefetch
                    onMouseEnter={() =>
                      warmupCompanyLogoFor({ name: comp.name, website: comp.website })
                    }
                    className="group flex flex-col items-center rounded-3xl border border-gray-200/80 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/10"
                  >
                    <div className="relative mb-4 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <div
                        aria-hidden
                        className="absolute inset-0 z-0 flex items-center justify-center text-4xl font-black text-white"
                        style={{ backgroundColor: bg }}
                      >
                        {comp.name.charAt(0)}
                      </div>
                      {logoKey ? (
                        <img
                          src={companyLogoSrc(logoKey)}
                          alt=""
                          width={80}
                          height={80}
                          decoding="async"
                          loading="lazy"
                          className="relative z-[1] h-full w-full bg-white object-contain p-3"
                          onError={(e) => {
                            e.currentTarget.style.visibility = 'hidden';
                          }}
                        />
                      ) : null}
                    </div>

                    <h3 className="mb-1 line-clamp-1 text-[16px] font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                      {comp.name}
                    </h3>
                    <p className="mb-4 line-clamp-1 text-[12px] font-bold uppercase tracking-wider text-gray-400">
                      {comp.sector || 'Genel'}
                    </p>

                    <div className="mt-auto flex w-full items-center justify-between text-[13px] font-medium">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="h-3.5 w-3.5" /> {comp.location}
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-indigo-600">
                        <Briefcase className="h-3.5 w-3.5" /> {jobCount(comp)} İlan
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {sortedForDisplay.length === 0 && !loading ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center font-medium text-gray-500">
                Arama kriterlerinize uygun şirket bulunamadı. Lütfen filtreleri temizleyip tekrar
                deneyin.
              </div>
            ) : null}

            {totalPages > 1 ? (
              <div className="flex flex-col items-center gap-6">
                <div className="text-sm font-bold text-gray-500">
                  Sayfa <span className="text-indigo-600">{currentPage}</span> / {totalPages}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                    title="İlk sayfa"
                  >
                    <ChevronsLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                    title="Önceki"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-10 w-10 rounded-xl font-bold shadow-sm transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                    title="Sonraki"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                    title="Son sayfa"
                  >
                    <ChevronsRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
