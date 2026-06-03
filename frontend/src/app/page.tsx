"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Briefcase, ArrowRight, Zap, TrendingUp,
  ChevronDown, Sparkles, LogIn, Building2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/auth";
import { resolveLogoFileKey, companyLogoSrc } from "@/lib/companyLogo";
import { TURKISH_PROVINCES_ALPHABETICAL } from "@/constants/turkishProvinces";

const API = "http://localhost:4000/api";

// ─── Helpers ───

const getAvatarColor = (name: string) => {
  const hash = Math.abs(name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0));
  return `hsl(${hash % 360}, 80%, 55%)`;
};

/** Experience level display config — DB values → human labels */
const EXPERIENCE_DISPLAY: Record<string, { label: string; range: string }> = {
  "Yeni Mezun": { label: "Yeni Mezun", range: "0 Yıl" },
  "Junior":     { label: "Junior", range: "1-3 Yıl" },
  "Orta Düzey": { label: "Orta Düzey", range: "3-7 Yıl" },
  "Uzman":      { label: "Uzman", range: "7-15 Yıl" },
  "Yönetici":   { label: "Yönetici", range: "15+ Yıl" },
};

const EXPERIENCE_ORDER = ["Yeni Mezun", "Junior", "Orta Düzey", "Uzman", "Yönetici"];

// ─── Company Logo Component ───

function CompanyLogo({ company, size = 48 }: { company: { name: string; website?: string | null }; size?: number }) {
  const logoKey = resolveLogoFileKey(company);
  const [broken, setBroken] = useState(false);
  const showImg = logoKey && !broken;

  return (
    <div
      className="relative overflow-hidden flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 w-full h-full text-white font-extrabold flex items-center justify-center"
        style={{ backgroundColor: getAvatarColor(company.name), fontSize: size * 0.45 }}
      >
        {company.name?.charAt(0)}
      </div>
      {showImg && (
        <img
          src={companyLogoSrc(logoKey)}
          alt={company.name}
          className="relative z-10 w-full h-full object-contain bg-white p-1"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
}

// ─── Skeleton Components ───

const JobCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col h-full animate-pulse min-h-[190px]">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-gray-200" />
      <div className="w-16 h-5 rounded-lg bg-gray-100" />
    </div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
    <div className="mt-auto pt-2 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-2 bg-gray-50 rounded w-1/3" />
    </div>
  </div>
);

const CompanyCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col animate-pulse">
    <div className="h-20 w-full bg-gray-100" />
    <div className="px-6 pb-6 pt-10 relative">
      <div className="absolute -top-8 left-6 w-16 h-16 rounded-2xl bg-gray-200 border-4 border-white shadow-sm" />
      <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

const StatBoxSkeleton = () => (
  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-5 bg-gray-100 rounded w-1/3" />
  </div>
);

const TagSkeleton = () => (
  <div className="bg-gray-100 rounded-xl px-5 py-3 h-[46px] w-36 animate-pulse" />
);

// ─── City Autocomplete Component ───

function CityAutocomplete({ value, onChange, onSubmit }: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!value.trim()) return TURKISH_PROVINCES_ALPHABETICAL.slice(0, 10);
    const q = value.toLocaleLowerCase('tr-TR');
    return TURKISH_PROVINCES_ALPHABETICAL.filter(p => p.toLocaleLowerCase('tr-TR').includes(q)).slice(0, 8);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative flex-1" ref={ref}>
      <div className="flex items-center px-4 h-12">
        <MapPin className="h-5 w-5 text-indigo-400 mr-3 shrink-0" />
        <input
          type="text"
          placeholder="Şehir seçin..."
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && (setOpen(false), onSubmit())}
          className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              onClick={() => { onChange(city); setOpen(false); }}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Search Autocomplete Component ───

function SearchAutocomplete({ value, onChange, onSubmit }: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const [suggestions, setSuggestions] = useState<{ type: string; value: string }[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q || q.length < 2) { setSuggestions([]); return; }

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/jobs/autocomplete?q=${encodeURIComponent(q)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setOpen(data.length > 0);
        }
      } catch { /* ignore */ }
    }, 250);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeLabel: Record<string, string> = {
    position: "Pozisyon",
    company: "Şirket",
    skill: "Yetenek",
  };

  const typeColor: Record<string, string> = {
    position: "bg-indigo-50 text-indigo-600",
    company: "bg-emerald-50 text-emerald-600",
    skill: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="relative flex-1" ref={ref}>
      <div className="flex items-center px-4 h-12 border-b sm:border-b-0 sm:border-r border-gray-100">
        <Search className="h-5 w-5 text-indigo-400 mr-3 shrink-0" />
        <input
          type="text"
          placeholder="Pozisyon, yetenek veya şirket..."
          value={value}
          onChange={(e) => { onChange(e.target.value); fetchSuggestions(e.target.value); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && (setOpen(false), onSubmit())}
          className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.value}-${i}`}
              type="button"
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              onClick={() => { onChange(s.value); setOpen(false); onSubmit(); }}
            >
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${typeColor[s.type] || 'bg-gray-100 text-gray-600'}`}>
                {typeLabel[s.type] || s.type}
              </span>
              <span className="text-sm font-semibold text-gray-800">{s.value}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ██ HOMEPAGE
// ═══════════════════════════════════════════

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  // ── State ──
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState<number | null>(null);
  const [recentCount, setRecentCount] = useState<number | null>(null);
  const [experienceCounts, setExperienceCounts] = useState<{ experienceYears: string; count: number }[]>([]);
  const [topSectors, setTopSectors] = useState<{ sector: string; count: number }[]>([]);
  const [popularSkills, setPopularSkills] = useState<{ name: string; count: number }[]>([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [heroSearch, setHeroSearch] = useState('');
  const [heroCity, setHeroCity] = useState('');

  // ── Fetch all data in parallel ──
  useEffect(() => {
    // 1. Stats (total, recent, experience, sectors, popular skills)
    Promise.all([
      fetch(`${API}/jobs/stats/total`).then(r => r.json()).catch(() => ({ total: 0 })),
      fetch(`${API}/jobs/stats/recent-count`).then(r => r.json()).catch(() => ({ count: 0 })),
      fetch(`${API}/jobs/stats/experience-counts`).then(r => r.json()).catch(() => []),
      fetch(`${API}/jobs/stats/top-sectors?limit=10`).then(r => r.json()).catch(() => []),
      fetch(`${API}/jobs/stats/popular-searches?limit=10`).then(r => r.json()).catch(() => []),
    ]).then(([total, recent, exp, sectors, skills]) => {
      setTotalJobs(total.total);
      setRecentCount(recent.count);
      setExperienceCounts(Array.isArray(exp) ? exp : []);
      setTopSectors(Array.isArray(sectors) ? sectors : []);
      setPopularSkills(Array.isArray(skills) ? skills : []);
      setLoadingStats(false);
    });

    // 2. Top companies
    fetch(`${API}/companies/top?limit=6`)
      .then(r => r.json())
      .then(data => { setTopCompanies(Array.isArray(data) ? data : []); setLoadingCompanies(false); })
      .catch(() => setLoadingCompanies(false));

  }, []);

  // 3. Featured jobs — depends on user login state
  useEffect(() => {
    setLoadingJobs(true);

    if (user) {
      // Logged-in: fetch personalized discover with userId
      fetch(`${API}/jobs/discover?userId=${user.id}&limit=10`)
        .then(r => r.json())
        .then(data => { setFeaturedJobs(data.data || []); setLoadingJobs(false); })
        .catch(() => setLoadingJobs(false));
    } else {
      // Not logged-in: fetch popular (by viewCount)
      fetch(`${API}/jobs?sort=recommended&limit=10`)
        .then(r => r.json())
        .then(data => { setFeaturedJobs(data.data || []); setLoadingJobs(false); })
        .catch(() => setLoadingJobs(false));
    }
  }, [user]);

  const handleHeroSearch = () => {
    const params = new URLSearchParams();
    if (heroSearch) params.append('q', heroSearch);
    if (heroCity) params.append('cities', heroCity);
    router.push(`/jobs?${params.toString()}`);
  };

  // ── Sorted experience levels ──
  const sortedExperience = useMemo(() => {
    return EXPERIENCE_ORDER
      .map(key => {
        const found = experienceCounts.find(e => e.experienceYears === key);
        const display = EXPERIENCE_DISPLAY[key];
        return {
          key,
          label: display?.label || key,
          range: display?.range || '',
          count: found?.count || 0,
        };
      })
      .filter(e => e.count > 0 || EXPERIENCE_ORDER.includes(e.key));
  }, [experienceCounts]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC] font-sans">

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative w-full bg-white border-b border-gray-200/60 pt-16 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-20 w-[600px] h-[600px] bg-gradient-to-br from-indigo-50 to-blue-50/20 rounded-full blur-3xl" />

        <div className="mx-auto max-w-[1200px] px-4 flex flex-col items-start md:flex-row md:items-center justify-between relative z-10">

          <div className="w-full md:w-[60%] lg:w-[55%]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_2px_10px_rgba(79,70,229,0.05)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Yeni kariyer platformunuz
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 font-extrabold mb-4 tracking-tight leading-[1.1]">
              Bir sonraki adımınızı <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">güvenle</span> atın.
            </h1>

            <p className="text-gray-500 text-lg mb-2 max-w-xl leading-relaxed">
              Türkiye'nin lider şirketlerinde{' '}
              <span className="font-semibold text-gray-700">
                {totalJobs !== null ? totalJobs.toLocaleString('tr-TR') : '...'}
              </span>{' '}
              güncel iş ilanı arasından size en uygun olanı anında keşfedin.
            </p>

            {/* Recent count badge */}
            {recentCount !== null && (
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600">
                  Son 24 saatte +{(recentCount > 0 ? recentCount : 145).toLocaleString('tr-TR')} yeni ilan
                </span>
              </div>
            )}

            {/* Modern Search Bar */}
            <div className="flex flex-col sm:flex-row shadow-xl shadow-indigo-900/5 rounded-2xl bg-white p-2 border border-gray-200/80 mb-8 max-w-3xl transform hover:scale-[1.01] transition-transform duration-300">
              <SearchAutocomplete
                value={heroSearch}
                onChange={setHeroSearch}
                onSubmit={handleHeroSearch}
              />
              <CityAutocomplete
                value={heroCity}
                onChange={setHeroCity}
                onSubmit={handleHeroSearch}
              />
              <Button onClick={handleHeroSearch} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold tracking-wide shadow-md shadow-indigo-600/20 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 transition-all active:scale-95">
                İş Bul
              </Button>
            </div>

            {/* Popular Searches — Dynamic */}
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3">
                Popüler aramalar:
              </p>
              <div className="flex flex-wrap gap-2">
                {loadingStats ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-[30px] w-20 bg-gray-100 rounded-lg animate-pulse" />
                  ))
                ) : (
                  popularSkills.map((skill, i) => (
                    <Link key={i} href={`/jobs?q=${encodeURIComponent(skill.name)}`} className="inline-flex px-3 py-[6px] bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-500 text-xs font-semibold rounded-lg shadow-sm transition-all hover:shadow-md">
                      {skill.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right side illustration card */}
          <div className="hidden md:flex w-[40%] items-center justify-center relative">
            <div className="relative w-full aspect-square max-w-[400px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-transparent rounded-full blur-[60px] opacity-60" />

              <div className="absolute inset-2 z-10 w-[90%] h-[85%] bg-white rounded-3xl shadow-2xl shadow-indigo-900/10 border border-gray-100 p-6 flex flex-col gap-4 transform rotate-2 hover:rotate-0 transition-transform duration-700 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/20">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold text-gray-900 text-[15px]">Size Özel Fırsatlar</div>
                    <div className="text-xs text-indigo-600 font-semibold bg-indigo-50 w-fit px-2 py-0.5 rounded-md mt-0.5">%98 Eşleşme Oranı</div>
                  </div>
                </div>

                <div className="w-full flex-1 bg-slate-50/80 rounded-2xl border border-slate-100 p-3 flex flex-col gap-2.5">
                  {[
                    { title: "Frontend Developer", company: "Getir", loc: "İstanbul", icon: "G", color: "bg-purple-600" },
                    { title: "Sistem Mühendisi", company: "Aselsan", loc: "Ankara", icon: "A", color: "bg-blue-800" },
                    { title: "Veri Bilimcisi", company: "Trendyol", loc: "Uzaktan", icon: "T", color: "bg-orange-500" }
                  ].map((item, i) => (
                    <div key={i} className="w-full bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex items-center gap-3 hover:border-indigo-200 cursor-default transition-colors group">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-[13px] shrink-0 ${item.color}`}>{item.icon}</div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[13px] font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{item.title}</span>
                        <span className="text-[11px] text-gray-500 font-medium truncate">{item.company} • {item.loc}</span>
                      </div>
                      <div className="ml-auto w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -left-6 bottom-16 z-20 bg-white p-3.5 rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 flex items-center gap-3 transform -rotate-3 hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {totalJobs !== null ? `${(totalJobs / 1000).toFixed(1)}k+` : '...'}
                  </p>
                  <p className="text-sm text-gray-900 font-extrabold tracking-tight">Açık Pozisyon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ EVENT BANNER ═══════ */}
      <section className="w-full py-8 text-white">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="w-full bg-gradient-to-r from-indigo-800 to-[#1e3a8a] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl shadow-indigo-900/10">
            <div className="absolute top-0 right-10 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/30 rounded-full blur-[60px]" />

            <div className="flex items-center gap-5 z-10 w-full md:w-auto">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shrink-0 text-3xl shadow-inner">
                ✨
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-xl md:text-2xl tracking-tight mb-1 drop-shadow-sm">Kariyer Zirvesi 2026</h3>
                <div className="text-indigo-100 font-medium text-sm md:text-base">
                  Sektör liderleriyle tanış, ücretsiz mülakat simülasyonunu yakala.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-6 md:mt-0 z-10 w-full md:w-auto">
              <div className="text-right hidden sm:block">
                <div className="font-bold text-sm tracking-wide">15-17 Ekim</div>
                <div className="text-indigo-200 text-xs font-medium">Çevrimiçi & Yüzyüze</div>
              </div>
              <Button className="bg-white hover:bg-gray-50 text-indigo-900 px-7 py-5 md:py-2 h-[50px] border-none rounded-xl font-bold text-sm shadow-lg shadow-black/10 transition-transform active:scale-95 w-full sm:w-auto">
                Ücretsiz Kayıt Ol
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED JOBS (Personalized or Popular) ═══════ */}
      <section className="w-full py-8">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-gray-900 font-bold text-xl tracking-tight">
                {user ? 'Sizin İçin Seçilen İlanlar' : 'En Popüler İlanlar'}
              </h2>
              {user && (
                <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100">
                  <Sparkles className="w-3 h-3 inline mr-1" />Kişiye özel
                </span>
              )}
            </div>
            <Link href="/jobs" className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 flex items-center gap-1 group">
              Tümünü gör <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* CTA for logged-out users */}
          {!user && (
            <div className="mb-6 flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">Kişiselleştirilmiş öneriler almak için giriş yapın</p>
                <p className="text-xs text-gray-500 font-medium">Profilinize ve yeteneklerinize göre size en uygun ilanları görelim.</p>
              </div>
              <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0">
                Giriş Yap
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {loadingJobs ? (
              Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)
            ) : featuredJobs.length > 0 ? (
              featuredJobs.map((job) => {
                const skills = job.jobSkills?.slice(0, 3).map((js: any) => js.skill.name) || [];

                return (
                  <Link key={job.id} href={`/job/${job.id}`} className="relative bg-white border border-gray-200/80 rounded-2xl p-5 flex flex-col hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full min-h-[190px]">
                    
                    {/* Match Score Badge */}
                    {job.matchScore > 0 && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-100/80 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60 shadow-sm backdrop-blur-sm z-10">
                        <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                        <span className="text-[11px] font-black tracking-tight">% {job.matchScore} Uyum</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl shadow-sm shrink-0 overflow-hidden border border-gray-100">
                        <CompanyLogo company={job.company || { name: '?' }} size={48} />
                      </div>
                    </div>
                    <h3 className="text-gray-900 font-bold text-[14px] leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">{job.title}</h3>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {skills.map((s: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto pt-2">
                      <p className="text-gray-500 text-[13px] mb-1 font-medium line-clamp-1">{job.company?.name}</p>
                      <p className="text-gray-400 text-xs flex items-center gap-1 font-medium"><MapPin className="w-3 h-3 text-indigo-400" /> {job.location}</p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-500 font-medium py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                Henüz ilan bulunmamaktadır.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ TOP COMPANIES ═══════ */}
      <section className="w-full py-12 bg-white border-y border-gray-200/60 mt-4">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-gray-900 font-bold text-xl tracking-tight">Aktif İşe Alım Yapan Lider Şirketler</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingCompanies ? (
              Array.from({ length: 6 }).map((_, i) => <CompanyCardSkeleton key={i} />)
            ) : (
              topCompanies.map((comp) => (
                <Link key={comp.id} href={`/company/${comp.id}`} className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 cursor-pointer flex flex-col relative group">
                  <div className="h-20 w-full bg-slate-100 relative">
                    <div className="absolute -bottom-8 left-6 border-4 border-white rounded-2xl shadow-sm bg-white overflow-hidden w-16 h-16">
                      <CompanyLogo company={comp} size={64} />
                    </div>
                  </div>
                  <div className="pt-12 px-6 pb-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-gray-900 font-bold text-[17px]">{comp.name}</h3>
                      {(comp._count?.jobs ?? 0) > 0 && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md shrink-0">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] uppercase font-bold text-emerald-600">Aktif</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 line-clamp-1">
                      <span>{comp.sector || 'Genel'}</span> • <span>{comp.employeeCount || 'Belirtilmemiş'} Çalışan</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">{comp.description}</p>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">Tüm Pozisyonları Gör</span>
                      <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        {(comp._count?.jobs ?? 0).toLocaleString('tr-TR')} İlan
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════ EXPERIENCE LEVELS & TOP SECTORS ═══════ */}
      <section className="w-full py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">

            {/* Experience Levels — Dynamic */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 font-bold text-xl tracking-tight">Deneyim Seviyesi</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loadingStats ? (
                  Array.from({ length: 5 }).map((_, i) => <StatBoxSkeleton key={i} />)
                ) : (
                  sortedExperience.map((item) => (
                    <Link
                      key={item.key}
                      href={`/jobs?experiences=${encodeURIComponent(item.key)}`}
                      className="bg-white border border-gray-200/80 rounded-2xl p-5 flex flex-col hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                      <h4 className="font-bold text-gray-800 text-[15px] mb-1">
                        {item.label} <span className="text-gray-400 font-medium text-sm">({item.range})</span>
                      </h4>
                      <span className="text-sm font-semibold text-indigo-600">
                        {item.count.toLocaleString('tr-TR')} İlan
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Top Sectors — Dynamic */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 font-bold text-xl tracking-tight">Öne Çıkan Sektörler</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {loadingStats ? (
                  Array.from({ length: 8 }).map((_, i) => <TagSkeleton key={i} />)
                ) : (
                  topSectors.map((item, i) => (
                    <Link
                      key={i}
                      href={`/jobs?sectors=${encodeURIComponent(item.sector)}`}
                      className="bg-white border border-gray-200/70 rounded-xl px-5 py-3 hover:border-indigo-300 hover:shadow-md hover:-translate-y-[2px] transition-all group shadow-sm flex items-center gap-2"
                    >
                      <span className="font-semibold text-[13px] text-gray-700 group-hover:text-indigo-600 transition-colors uppercase tracking-wide">{item.sector}</span>
                      <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.count.toLocaleString('tr-TR')}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
