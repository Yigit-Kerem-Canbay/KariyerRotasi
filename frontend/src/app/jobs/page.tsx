'use client';

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  Clock,
  Building2,
  ChevronLeft,
  Filter,
  Zap,
  ChevronDown,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { TURKISH_PROVINCES_ALPHABETICAL } from '@/constants/turkishProvinces';
import {
  companyLogoSrc,
  resolveLogoFileKey,
  warmupCompanyLogo,
  warmupCompanyLogoFor,
} from '@/lib/companyLogo';

const API = 'http://localhost:4000/api';

function getAvatarColor(name: string) {
  const hash = Math.abs(
    name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0),
  );
  return `hsl(${hash % 360}, 80%, 55%)`;
}

const SECTOR_OPTIONS = [
  'E-Ticaret',
  'Eğitim',
  'Finans & Bankacılık',
  'Gıda & Restoran',
  'İnşaat & Gayrimenkul',
  'Lojistik & Taşıma',
  'Otomotiv',
  'Perakende',
  'Sağlık',
  'Savunma Sanayi',
  'Teknoloji & Yazılım',
  'Tekstil',
  'Telekomünikasyon',
  'Temizlik & Hizmet',
  'Turizm',
].sort((a, b) => a.localeCompare(b, 'tr'));

const EDUCATION_OPTIONS = ['Lise', 'Ön Lisans', 'Üniversite', 'Yüksek Lisans', 'Fark Etmez'].sort((a, b) =>
  a.localeCompare(b, 'tr'),
);

const LANGUAGE_OPTIONS = [
  'Fark Etmez',
  'İngilizce (İyi)',
  'İngilizce (Çok İyi)',
  'İngilizce, Almanca',
  'İngilizce, Fransızca',
  'Almanca (İyi)',
  'İspanyolca',
  'Arapça',
  'Rusça',
  'Çince',
];

const MILITARY_OPTIONS = ['Yapıldı', 'Tecilli', 'Muaf', 'Fark Etmez'];

const EXPERIENCE_OPTIONS = ['Yeni Mezun', 'Junior', 'Orta Düzey', 'Uzman', 'Yönetici'];

const WORK_MODEL_CONFIG = [
  { value: 'onsite', label: 'İş yerinde' },
  { value: 'hybrid', label: 'Hibrit' },
  { value: 'remote', label: 'Uzaktan' },
];

type FilterState = {
  cities: string[];
  sectors: string[];
  educationLevels: string[];
  languages: string[];
  workModels: string[];
  experiences: string[];
  militaryStatuses: string[];
  remoteOnly: boolean;
  salaryMinGte: string;
  salaryMaxLte: string;
};

const emptyFilters = (): FilterState => ({
  cities: [],
  sectors: [],
  educationLevels: [],
  languages: [],
  workModels: [],
  experiences: [],
  militaryStatuses: [],
  remoteOnly: false,
  salaryMinGte: '',
  salaryMaxLte: '',
});

function parseFilters(sp: URLSearchParams): FilterState {
  const splitList = (k: string) =>
    (sp.get(k) ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const splitLanguages = () => {
    const raw = sp.get('languages') ?? sp.get('language') ?? '';
    if (!raw) return [];
    if (raw.includes('|')) return raw.split('|').map((s) => s.trim()).filter(Boolean);
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  return {
    cities: splitList('cities').length ? splitList('cities') : splitList('city'),
    sectors: splitList('sectors').length ? splitList('sectors') : splitList('sector'),
    educationLevels: splitList('educationLevels').length
      ? splitList('educationLevels')
      : splitList('educationLevel'),
    languages: splitLanguages(),
    workModels: splitList('workModels').length ? splitList('workModels') : splitList('workModel'),
    experiences: splitList('experiences').length ? splitList('experiences') : splitList('experience'),
    militaryStatuses: splitList('militaryStatuses').length
      ? splitList('militaryStatuses')
      : splitList('militaryStatus'),
    remoteOnly: sp.get('remoteOnly') === '1' || sp.get('remote') === 'only',
    salaryMinGte: sp.get('salaryMinGte') ?? '',
    salaryMaxLte: sp.get('salaryMaxLte') ?? '',
  };
}

function writeFiltersIntoParams(f: FilterState, p: URLSearchParams) {
  if (f.cities.length) p.set('cities', f.cities.join(','));
  else {
    p.delete('cities');
    p.delete('city');
  }
  if (f.sectors.length) p.set('sectors', f.sectors.join(','));
  else {
    p.delete('sectors');
    p.delete('sector');
  }
  if (f.educationLevels.length) p.set('educationLevels', f.educationLevels.join(','));
  else {
    p.delete('educationLevels');
    p.delete('educationLevel');
  }
  if (f.languages.length) p.set('languages', f.languages.join('|'));
  else {
    p.delete('languages');
    p.delete('language');
  }
  if (f.workModels.length) p.set('workModels', f.workModels.join(','));
  else {
    p.delete('workModels');
    p.delete('workModel');
  }
  if (f.experiences.length) p.set('experiences', f.experiences.join(','));
  else {
    p.delete('experiences');
    p.delete('experience');
  }
  if (f.militaryStatuses.length) p.set('militaryStatuses', f.militaryStatuses.join(','));
  else {
    p.delete('militaryStatuses');
    p.delete('militaryStatus');
  }
  if (f.remoteOnly) p.set('remoteOnly', '1');
  else p.delete('remoteOnly');
  if (f.salaryMinGte.trim()) p.set('salaryMinGte', f.salaryMinGte.trim());
  else p.delete('salaryMinGte');
  if (f.salaryMaxLte.trim()) p.set('salaryMaxLte', f.salaryMaxLte.trim());
  else p.delete('salaryMaxLte');
}

function JobLogo({
  company,
  variant,
}: {
  company: { name: string; website?: string | null };
  variant: 'list' | 'thumb';
}) {
  const logoKey = resolveLogoFileKey(company);
  const [broken, setBroken] = useState(false);
  const size = variant === 'list' ? 80 : 64;

  useEffect(() => {
    warmupCompanyLogo(logoKey);
  }, [logoKey]);

  const wrap =
    variant === 'list'
      ? 'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 md:h-20 md:w-20'
      : 'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100';

  const bg = getAvatarColor(company.name);
  const showImg = logoKey && !broken;

  return (
    <div className={wrap}>
      <div
        aria-hidden
        className="absolute inset-0 z-0 flex items-center justify-center font-black text-white md:text-3xl opacity-95"
        style={{ backgroundColor: bg }}
      >
        <span className="relative z-0">{company.name.charAt(0)}</span>
      </div>
      {showImg ? (
        <img
          src={companyLogoSrc(logoKey)}
          alt=""
          width={size}
          height={size}
          decoding="async"
          loading={variant === 'list' ? 'eager' : 'lazy'}
          fetchPriority={variant === 'list' ? 'high' : undefined}
          className="relative z-[1] max-h-[80px] max-w-[80px] bg-white object-contain p-2"
          onError={() => setBroken(true)}
        />
      ) : null}
    </div>
  );
}

function MultiPick({
  label,
  hint,
  options,
  selected,
  onChange,
}: {
  label: string;
  hint?: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const ql = q.toLocaleLowerCase('tr-TR');
    return options.filter((o) => o.toLocaleLowerCase('tr-TR').includes(ql));
  }, [options, q]);

  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
    else onChange([...selected, v]);
  };

  return (
    <div className="relative">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-900">{label}</h3>
      {hint ? <p className="mb-2 text-[11px] font-medium leading-snug text-slate-500">{hint}</p> : null}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-white"
      >
        <span className="truncate">
          {selected.length === 0
            ? 'Seçim yapın…'
            : `${selected.length} seçili — ${selected.slice(0, 2).join(', ')}${selected.length > 2 ? '…' : ''}`}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.slice(0, 4).map((s) => (
            <button
              type="button"
              key={s}
              className="inline-flex max-w-[130px] items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-900"
              onClick={() => toggle(s)}
              title={`${s} seçimden çıkar`}
            >
              <span className="truncate">{s}</span>
              <X className="h-3 w-3 shrink-0 opacity-70" />
            </button>
          ))}
          {selected.length > 4 ? (
            <span className="text-[11px] font-bold text-slate-400">+{selected.length - 4}</span>
          ) : null}
        </div>
      )}
      {open ? (
        <>
          <button
            type="button"
            aria-label="Kapat"
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
            <input
              type="search"
              placeholder="Liste içinde ara…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-xs font-medium outline-none focus:border-indigo-400"
            />
            <ul className="scrollbar-minimal max-h-36 overflow-y-auto px-1">
              {filtered.map((opt) => {
                const chk = selected.includes(opt);
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold transition ${
                        chk ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => toggle(opt)}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          chk ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                        }`}
                      >
                        {chk ? <span className="h-1.5 w-1.5 rounded-sm bg-white" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{opt}</span>
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 ? (
                <li className="px-2 py-3 text-center text-xs font-medium text-slate-400">Sonuç yok</li>
              ) : null}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}

const JobCardSkeleton = () => (
  <div className="animate-pulse flex flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-6 md:flex-row md:items-center md:p-8">
    <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-200 md:h-20 md:w-20" />
    <div className="flex-1 space-y-4">
      <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
      <div className="h-4 w-1/4 rounded-lg bg-slate-100" />
      <div className="flex gap-2">
        <div className="h-8 w-24 rounded-xl bg-slate-50" />
        <div className="h-8 w-24 rounded-xl bg-slate-50" />
        <div className="h-8 w-24 rounded-xl bg-slate-50" />
      </div>
    </div>
    <div className="hidden h-10 w-10 rounded-xl bg-slate-100 md:block" />
  </div>
);

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSp = searchParams ?? new URLSearchParams();

  const [search, setSearch] = useState(() => initialSp.get('q') ?? '');
  const [debouncedSearch] = useDebounce(search, 380);
  const [applied, setApplied] = useState<FilterState>(() => parseFilters(initialSp));
  const [draft, setDraft] = useState<FilterState>(() => parseFilters(initialSp));

  const [companyId, setCompanyId] = useState(() => initialSp.get('companyId') ?? '');
  const [companyName, setCompanyName] = useState(() => initialSp.get('company') ?? '');

  const [sort, setSort] = useState(() => initialSp.get('sort') ?? 'newest');
  const [page, setPage] = useState(() => Number(initialSp.get('page')) || 1);

  const [jobs, setJobs] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const prevDebouncedSearch = useRef<string | undefined>(undefined);

  const hydrateFromBrowserUrl = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const f = parseFilters(sp);
    setApplied(f);
    setDraft(f);
    setSort(sp.get('sort') ?? 'newest');
    setPage(Number(sp.get('page')) || 1);
    setSearch(sp.get('q') ?? '');
    setCompanyId(sp.get('companyId') ?? '');
    setCompanyName(sp.get('company') ?? '');
  }, []);

  useEffect(() => {
    const onPop = () => hydrateFromBrowserUrl();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [hydrateFromBrowserUrl]);

  const syncRouterUrl = useCallback(() => {
    const p = new URLSearchParams();
    const qTrim = debouncedSearch.trim();
    if (qTrim) p.set('q', qTrim);
    writeFiltersIntoParams(applied, p);
    if (companyId) p.set('companyId', companyId);
    if (companyName) p.set('company', companyName);

    if (sort && sort !== 'newest') p.set('sort', sort);
    if (page > 1) p.set('page', String(page));

    const qs = p.toString();
    const path = qs ? `/jobs?${qs}` : '/jobs';

    const curQs =
      typeof window !== 'undefined' && window.location.search.startsWith('?')
        ? window.location.search.slice(1)
        : '';
    if (qs === curQs && typeof window !== 'undefined') return;

    router.replace(path, { scroll: false });
  }, [applied, companyId, companyName, debouncedSearch, page, router, sort]);

  useEffect(() => {
    syncRouterUrl();
  }, [syncRouterUrl]);

  useEffect(() => {
    if (
      prevDebouncedSearch.current !== undefined &&
      prevDebouncedSearch.current !== debouncedSearch
    ) {
      setPage(1);
    }
    prevDebouncedSearch.current = debouncedSearch;
  }, [debouncedSearch]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (companyId) params.append('companyId', companyId);
      const qTrim = debouncedSearch.trim();
      if (qTrim) params.append('search', qTrim);

      if (applied.cities.length) params.append('cities', applied.cities.join(','));
      if (applied.sectors.length) params.append('sectors', applied.sectors.join(','));
      if (applied.educationLevels.length)
        params.append('educationLevels', applied.educationLevels.join(','));
      applied.languages.forEach((lng) => params.append('languages', lng));
      if (applied.workModels.length) params.append('workModels', applied.workModels.join(','));
      if (applied.experiences.length) params.append('experiences', applied.experiences.join(','));
      if (applied.militaryStatuses.length)
        params.append('militaryStatuses', applied.militaryStatuses.join(','));
      if (applied.remoteOnly) params.append('remoteOnly', 'true');
      if (applied.salaryMinGte.trim()) params.append('salaryMinGte', applied.salaryMinGte.trim());
      if (applied.salaryMaxLte.trim()) params.append('salaryMaxLte', applied.salaryMaxLte.trim());
      params.append('sort', sort);

      const res = await fetch(`${API}/jobs?${params.toString()}`);
      if (!res.ok) throw new Error('jobs');
      const data = await res.json();
      setJobs(data.data ?? []);
      setMeta(data.meta ?? {});
    } catch (e) {
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [applied, companyId, debouncedSearch, page, sort]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApplyFilters = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleClearDraftFilters = () => {
    const cleared = emptyFilters();
    setDraft(cleared);
  };

  const clearCompanyScope = () => {
    setCompanyId('');
    setCompanyName('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (meta.totalPages || 1)) {
      setPage(newPage);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const sortLabel =
    sort === 'recommended'
      ? 'Sistem önerilen (sıcak)'
      : sort === 'salaryAsc'
        ? 'Maaş (↑ düşük → yüksek)'
        : sort === 'salaryDesc'
          ? 'Maaş (↓ yüksek → düşük)'
          : sort === 'oldest'
            ? 'En eski önce'
            : 'En yeni önce';

  const showOverlayLoading = loading && jobs.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="relative w-full overflow-hidden bg-indigo-900 py-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 sm:px-6">
          <h1 className="mb-5 text-center text-3xl font-black text-white md:text-5xl">
            Hayalindeki işi bul
          </h1>
          <div className="flex w-full max-w-3xl items-center rounded-2xl bg-white p-2 shadow-2xl">
            <Search className="ml-4 h-6 w-6 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Pozisyon, şirket, sektör, konum veya yetenek ara…"
              className="flex-1 border-none bg-transparent px-4 py-3 text-lg font-medium text-slate-800 placeholder:text-slate-400 focus:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="hidden text-xs font-semibold text-slate-400 sm:inline pr-4">
              Yazdıkça aranır
            </span>
          </div>
          {meta.total > 0 && (
            <p className="mt-5 flex flex-wrap items-center justify-center gap-2 font-medium text-indigo-200">
              <Zap className="h-5 w-5 text-amber-400" />
              Sistemdeki{' '}
              <span className="font-black text-white">{Number(meta.total).toLocaleString('tr-TR')}</span>{' '}
              ilan içinde aranıyor.
              {meta.queryTimeMs != null ? (
                <span className="ml-2 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs">
                  ~{meta.queryTimeMs} ms
                </span>
              ) : null}
            </p>
          )}
          {companyId ? (
            <div className="mt-4 inline-flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                  Şirket filtresi
                </p>
                <p className="truncate text-sm font-black">
                  {companyName ? companyName : companyId}
                </p>
              </div>
              <button
                type="button"
                onClick={clearCompanyScope}
                className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"
              >
                Temizle
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/*
        İki kaydırma: (1) tarayıcı / sayfa — liste ve geri kalan her şey,
        (2) yalnızca sol filtre paneli (lg: max-yükseklik + overflow-y).
        İlan listesinin ayrı scroll’u yok.
      */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row lg:items-start lg:gap-8">
        {/* max-h ~ viewport minus sticky gap (top-24): iç scroll hep görünür yüksekliğe sıkışır; Uygula hep bu alanda */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:z-10 lg:flex lg:min-h-0 lg:max-h-[calc(100dvh-8rem)] lg:w-[19rem] lg:flex-col lg:overflow-hidden lg:self-start">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-indigo-600" />
                <div>
                  <h2 className="text-lg font-black text-slate-800">Filtreler</h2>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Seçimi bitir → Uygula
                  </p>
                </div>
              </div>
            </div>

            <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pb-6 pt-4">
              <MultiPick
                label="Şehir"
                hint="81 il • birden fazla seçebilirsiniz"
                options={TURKISH_PROVINCES_ALPHABETICAL}
                selected={draft.cities}
                onChange={(next) => setDraft((d) => ({ ...d, cities: next }))}
              />

              <MultiPick
                label="Sektör"
                options={SECTOR_OPTIONS}
                selected={draft.sectors}
                onChange={(next) => setDraft((d) => ({ ...d, sectors: next }))}
              />

              <MultiPick
                label="Eğitim"
                options={EDUCATION_OPTIONS}
                selected={draft.educationLevels}
                onChange={(next) => setDraft((d) => ({ ...d, educationLevels: next }))}
              />

              <MultiPick
                label="Yabancı dil"
                options={LANGUAGE_OPTIONS}
                selected={draft.languages}
                onChange={(next) => setDraft((d) => ({ ...d, languages: next }))}
              />

              <div>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  Çalışma şekli
                </h3>
                <div className="flex flex-col gap-2">
                  {WORK_MODEL_CONFIG.map((m) => {
                    const on = draft.workModels.includes(m.value);
                    return (
                      <label key={m.value} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={on}
                          onChange={() =>
                            setDraft((d) => ({
                              ...d,
                              workModels: on
                                ? d.workModels.filter((x) => x !== m.value)
                                : [...d.workModels, m.value],
                            }))
                          }
                        />
                        <span className="text-sm font-semibold text-slate-700">{m.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  Deneyim
                </h3>
                <div className="flex flex-col gap-2">
                  {EXPERIENCE_OPTIONS.map((exp) => {
                    const on = draft.experiences.includes(exp);
                    return (
                      <label key={exp} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={on}
                          onChange={() =>
                            setDraft((d) => ({
                              ...d,
                              experiences: on
                                ? d.experiences.filter((x) => x !== exp)
                                : [...d.experiences, exp],
                            }))
                          }
                        />
                        <span className="text-sm font-semibold text-slate-700">{exp}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <MultiPick
                label="Askerlik durumu"
                options={MILITARY_OPTIONS}
                selected={draft.militaryStatuses}
                onChange={(next) => setDraft((d) => ({ ...d, militaryStatuses: next }))}
              />

              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={draft.remoteOnly}
                  onChange={() => setDraft((d) => ({ ...d, remoteOnly: !d.remoteOnly }))}
                />
                <span className="text-sm font-bold text-slate-800">
                  Tam uzaktan / remote ilanları (öncelik)
                </span>
              </label>

              <div>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  Maaş aralığı (₺ net, isteğe bağlı)
                </h3>
                <div className="flex gap-2">
                  <input
                    inputMode="numeric"
                    placeholder="Min"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    value={draft.salaryMinGte}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        salaryMinGte: e.target.value.replace(/[^\d]/g, ''),
                      }))
                    }
                  />
                  <input
                    inputMode="numeric"
                    placeholder="Max"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    value={draft.salaryMaxLte}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        salaryMaxLte: e.target.value.replace(/[^\d]/g, ''),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 bg-white pt-4">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="flex-1 min-w-[8rem] rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Filtreleri uygula
                </button>
                <button
                  type="button"
                  onClick={handleClearDraftFilters}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Taslak temizle
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col lg:pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {loading && jobs.length === 0
                  ? 'Yükleniyor…'
                  : `${Number(meta.total || 0).toLocaleString('tr-TR')} ilan`}
              </h2>
              {(sort === 'salaryAsc' || sort === 'salaryDesc') && (
                <p className="mt-1 text-[13px] font-semibold leading-snug text-slate-500">
                  Bu sıralamada <span className="text-slate-700">maaş bilgisi paylaşılmamış</span>{' '}
                  ilanlar gösterilmiyor; sıra yalnızca rakam bildirilen pozisyonlar arasında.
                </p>
              )}
            </div>

            <div className="relative inline-flex items-center gap-2">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                aria-label="Sıralama"
                title={sortLabel}
                className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-xs font-black text-slate-800 shadow-sm outline-none hover:border-indigo-300 md:text-[13px]"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">En yeni önce</option>
                <option value="recommended">Önerilen (sıcak / önizleme)</option>
                <option value="salaryAsc">Maaş (↑ düşük → yüksek)</option>
                <option value="salaryDesc">Maaş (↓ yüksek → düşük)</option>
                <option value="oldest">En eski önce</option>
              </select>
            </div>
          </div>

          <div className="relative flex flex-col gap-4">
            {showOverlayLoading && (
              <div className="pointer-events-none absolute right-4 top-0 z-[2] rounded-full border border-indigo-100 bg-white/90 px-4 py-2 text-xs font-bold text-indigo-900 shadow-xl backdrop-blur">
                Güncelleniyor…
              </div>
            )}

            {loading && jobs.length === 0 ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : null}

            {jobs.map((job, index) => (
              <Link
                href={`/job/${job.id}`}
                key={job.id}
                prefetch={index < 8}
                onMouseEnter={() => {
                  router.prefetch(`/job/${job.id}`);
                  warmupCompanyLogoFor({
                    name: job.company?.name ?? '',
                    website: job.company?.website,
                  });
                }}
              >
                <div
                  className={`flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 md:flex-row md:items-center md:p-8 ${
                    loading ? 'opacity-70' : ''
                  } group`}
                >
                  <JobLogo
                    company={{
                      name: job.company?.name ?? 'Ş',
                      website: job.company?.website,
                    }}
                    variant="list"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2 text-xl font-black text-slate-900 transition-colors group-hover:text-indigo-600">
                      {job.title}
                    </h3>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{job.company?.name}</span>
                      {job.company?.sector ? (
                        <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                          {job.company.sector}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {[job.city, job.district].filter(Boolean).join(' · ') || job.location}
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                        <Briefcase className="h-3.5 w-3.5 shrink-0" />
                        {job.workModel === 'remote'
                          ? 'Uzaktan'
                          : job.workModel === 'hybrid'
                            ? 'Hibrit'
                            : 'İş yerinde'}
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {job.experienceYears ?? '—'}
                      </div>
                      {job.salaryMin ? (
                        <div className="flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50/70 px-2.5 py-1.5 text-[11px] font-black text-emerald-800">
                          {job.salaryMin.toLocaleString('tr-TR')} –{' '}
                          {job.salaryMax?.toLocaleString('tr-TR') ?? '—'} ₺
                        </div>
                      ) : null}
                    </div>

                    {job.jobSkills?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.jobSkills.slice(0, 4).map((js: any, i: number) => (
                          <span
                            key={`${job.id}-${i}`}
                            className="rounded-lg border border-violet-100 bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-600"
                          >
                            {js.skill?.name ?? js.skill}
                          </span>
                        ))}
                        {job.jobSkills.length > 4 ? (
                          <span className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-400">
                            +{job.jobSkills.length - 4}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex w-full flex-row items-center justify-between gap-4 md:mt-0 md:h-full md:w-auto md:flex-col md:items-end">
                    <span className="text-xs font-bold text-slate-400">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString('tr-TR') : ''}
                    </span>
                    <span className="rounded-xl bg-slate-900 p-3 text-white transition-colors group-hover:bg-indigo-600">
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {!loading && jobs.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h3 className="mb-2 text-xl font-bold text-slate-700">İlan bulunamadı</h3>
                <p className="mx-auto max-w-md text-sm font-medium text-slate-500">
                  Kelimeyi doğru yazdığından emin ol; yazım büyük/küçük harf sorun çıkarmaz. Filtreleri hafifleterek yeniden deneyebilirsin.
                </p>
              </div>
            ) : null}

            {!loading && meta.totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2 pt-12">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Önceki sayfa"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2">
                  <span className="font-black text-indigo-600">{page}</span>
                  <span className="font-medium text-slate-400">/</span>
                  <span className="font-bold text-slate-600">{meta.totalPages}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= (meta.totalPages || 1)}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Sonraki sayfa"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function JobsShellFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <div className="h-40 w-full animate-pulse bg-indigo-950/90" />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-10">
        <div className="hidden h-[min(28rem,70vh)] w-72 shrink-0 animate-pulse rounded-3xl bg-white lg:block" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsShellFallback />}>
      <JobsPageContent />
    </Suspense>
  );
}
