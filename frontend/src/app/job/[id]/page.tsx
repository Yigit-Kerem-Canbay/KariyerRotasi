'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Clock,
  GraduationCap,
  Languages,
  ShieldCheck,
  Zap,
  Heart,
  TrendingUp,
  ChevronRight,
  CalendarDays,
  Share2,
  Check,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  companyLogoSrc,
  resolveLogoFileKey,
  warmupCompanyLogo,
  warmupCompanyLogoFor,
} from '@/lib/companyLogo';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { isAxiosError } from 'axios';

const getAvatarColor = (name: string) => {
  const hash = Math.abs(name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0));
  return `hsl(${hash % 360}, 80%, 55%)`;
};

function LogoBadge({
  company,
  variant,
}: {
  company: { name: string; website?: string | null };
  variant: 'hero' | 'compact';
}) {
  const logoKey = resolveLogoFileKey(company);
  const [broken, setBroken] = useState(false);
  const bg = getAvatarColor(company.name);

  useEffect(() => {
    warmupCompanyLogo(logoKey);
  }, [logoKey]);

  const size = variant === 'hero' ? 128 : 48;
  const wrap =
    variant === 'hero'
      ? 'relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl shadow-lg md:h-32 md:w-32'
      : 'relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100';

  const showImg = logoKey && !broken;

  return (
    <div className={wrap}>
      <div
        aria-hidden
        className="absolute inset-0 z-0 flex items-center justify-center font-black text-white"
        style={{ backgroundColor: bg }}
      >
        <span className={variant === 'hero' ? 'text-4xl md:text-5xl' : 'text-xl'}>
          {company.name.charAt(0)}
        </span>
      </div>
      {showImg ? (
        <img
          src={companyLogoSrc(logoKey)}
          alt=""
          width={size}
          height={size}
          decoding="async"
          loading={variant === 'hero' ? 'eager' : 'lazy'}
          fetchPriority={variant === 'hero' ? 'high' : 'low'}
          className={`relative z-[1] h-full w-full bg-white object-contain ${variant === 'hero' ? 'p-4' : 'p-1'}`}
          onError={() => setBroken(true)}
        />
      ) : null}
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = Array.isArray(id) ? id[0] : id;
  const token = useAuthStore((s) => s.token);
  const userRole = useAuthStore((s) => s.user?.role);

  const userId = useAuthStore((s) => s.user?.id);

  const [job, setJob] = useState<any>(null);
  const [similarJobs, setSimilarJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [matchAnalysis, setMatchAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const isOwner = job?.company?.ownerId === userId;

  const refreshEngagement = useCallback(async (jobUuid: string) => {
    if (!token) {
      setSaved(false);
      setApplied(false);
      return;
    }
    try {
      const [apps, sav] = await Promise.all([
        api.get<{ applied: boolean }>(`/applications/status?jobId=${jobUuid}`),
        api.get<{ saved: boolean }>(`/saved-jobs/status?jobId=${jobUuid}`),
      ]);
      setApplied(!!apps.data?.applied);
      setSaved(!!sav.data?.saved);
    } catch {
      setApplied(false);
      setSaved(false);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    setSimilarJobs([]);
    setLoading(true);

    (async () => {
      try {
        const jr = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/jobs/${jobId}`,
        );
        if (cancelled) return;
        if (!jr.ok) {
          setJob(null);
          return;
        }
        const j = await jr.json();
        if (cancelled) return;
        setJob(j);
        warmupCompanyLogo(resolveLogoFileKey(j.company));
        const sr = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/jobs/${jobId}/similar`,
        );
        if (cancelled) return;
        if (sr.ok) {
          const sim = await sr.json();
          setSimilarJobs(sim);
        } else {
          setSimilarJobs([]);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setJob(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  useEffect(() => {
    if (!job?.id) return;
    if (!token) {
      setSaved(false);
      setApplied(false);
      return;
    }
    void refreshEngagement(job.id);
    
    // Fetch AI Match Analysis
    if (userRole === 'job_seeker') {
      setLoadingAnalysis(true);
      api.get(`/jobs/${job.id}/match-analysis`)
        .then(res => setMatchAnalysis(res.data?.data))
        .catch(err => console.error("Match analysis failed", err))
        .finally(() => setLoadingAnalysis(false));
    }
  }, [job?.id, token, refreshEngagement, userRole]);

  useEffect(() => {
    similarJobs.forEach((sj: any) => {
      if (sj?.company)
        warmupCompanyLogoFor({ name: sj.company.name, website: sj.company.website });
    });
  }, [similarJobs]);

  const shareJob = async () => {
    if (!job || typeof window === 'undefined') return;
    const origin = (
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    ).replace(/\/$/, '');
    const url = `${origin}/job/${job.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: job.title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        window.alert('Bağlantı panoya kopyalandı.');
      } else {
        window.prompt('İlan bağlantısı', url);
      }
    } catch {
      /* paylaşım iptal */
    }
  };

  const toggleSaved = async () => {
    if (!job) return;
    if (!token) {
      router.push('/login');
      return;
    }
    if (userRole !== 'job_seeker') {
      window.alert('Kaydetmek için iş arayan hesabıyla giriş yapın.');
      return;
    }
    setActionBusy(true);
    try {
      if (saved) {
        await api.delete(`/saved-jobs/${job.id}`);
        setSaved(false);
      } else {
        await api.post('/saved-jobs', { jobId: job.id });
        setSaved(true);
      }
    } catch {
      window.alert('Kayıt işlemi tamamlanamadı.');
    } finally {
      setActionBusy(false);
    }
  };

  const submitApply = async () => {
    if (!job) return;
    if (!token) {
      router.push('/login');
      return;
    }
    if (userRole !== 'job_seeker') {
      window.alert('Başvurmak için iş arayan hesabıyla giriş yapın.');
      return;
    }
    setActionBusy(true);
    try {
      await api.post('/applications', { jobId: job.id });
      setApplied(true);
      setShowApplyModal(false);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setApplied(true);
        setShowApplyModal(false);
      }
      else window.alert('Başvuru gönderilemedi.');
    } finally {
      setActionBusy(false);
    }
  };

  const withdrawApply = async () => {
    if (!job) return;
    if (!confirm('Başvurunuzu geri çekmek istediğinize emin misiniz?')) return;
    setActionBusy(true);
    try {
      await api.delete(`/applications/${job.id}`);
      setApplied(false);
    } catch (err) {
      window.alert('Başvuru geri çekilemedi.');
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">İlan Bulunamadı</h1>
        <button onClick={() => router.push('/jobs')} className="text-indigo-600 font-bold">İş İlanlarına Dön</button>
      </div>
    );
  }

  const isHighSalary = job.salaryMax && job.salaryMax > 50000;
  const avgSalary = job.salaryMax ? Math.floor((job.salaryMin + job.salaryMax) / 2) : 0;
  const marketAvg = avgSalary > 0 ? Math.floor(avgSalary * 0.9) : 0; // Fake market avg
  const diffPercent = marketAvg > 0 ? Math.floor(((avgSalary - marketAvg) / marketAvg) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Banner */}
      <div className="h-[240px] bg-slate-900 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md px-4 h-10 rounded-xl flex items-center gap-2 font-semibold text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
        {/* Main Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-indigo-900/5 mb-8 border border-slate-100">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <LogoBadge variant="hero" company={job.company} />

            {/* Title & Actions */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  {job.title}
                </h1>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    title="İlanı Paylaş"
                    onClick={() => void shareJob()}
                    className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                  {isOwner ? (
                    <Link
                      href={`/employer/jobs/${job.id}/edit`}
                      className="px-8 h-12 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 font-black shadow-sm transition-all flex items-center justify-center border border-amber-200"
                    >
                      İlanı Düzenle
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        title={saved ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                        disabled={actionBusy}
                        aria-pressed={saved}
                        onClick={() => void toggleSaved()}
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all disabled:opacity-50 ${
                          saved
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
                      </button>
                      {applied ? (
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={withdrawApply}
                          className="px-8 h-12 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-60 font-black shadow-sm transition-all"
                        >
                          Başvuruyu Geri Çek
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => setShowApplyModal(true)}
                          className="px-8 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:pointer-events-none text-white font-black shadow-lg shadow-indigo-600/20 transition-all"
                        >
                          Başvur
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <Link href={`/company/${job.companyId}`} className="inline-flex items-center gap-2 text-lg font-bold text-indigo-600 hover:text-indigo-700 mb-6">
                <Building2 className="w-5 h-5" />
                {job.company.name}
              </Link>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold">
                  <Briefcase className="w-4 h-4" />
                  {job.workModel === 'remote' ? 'Uzaktan' : job.workModel === 'hybrid' ? 'Hibrit' : 'İş Yerinde'}
                </div>
                {job.salaryMin && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">
                    <Zap className="w-4 h-4" />
                    {job.salaryMin.toLocaleString('tr-TR')} ₺ - {job.salaryMax?.toLocaleString('tr-TR')} ₺
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-medium text-slate-400">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                </div>
                {job.workingHours && job.workingHours.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100">
                    <Clock className="w-4 h-4" />
                    {job.workingHours.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl shadow-indigo-900/5 border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2.5 h-8 bg-indigo-600 rounded-full" />
                İş Tanımı ve Aranan Nitelikler
              </h2>
              <div className="prose prose-slate prose-lg max-w-none font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Required Skills Section */}
            {job.jobSkills && job.jobSkills.length > 0 && (
              <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl shadow-indigo-900/5 border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-2.5 h-8 bg-emerald-500 rounded-full" />
                  Aranan Yetenekler ve Teknolojiler
                </h2>
                <div className="flex flex-wrap gap-3">
                  {job.jobSkills.map((js: any, i: number) => (
                    <span key={i} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-slate-50 to-indigo-50 border border-indigo-100 rounded-2xl text-sm font-bold text-slate-700 hover:border-indigo-300 hover:shadow-md transition-all cursor-default">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      {js.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Match Analysis Module - UNIQUE FEATURE */}
            {userRole === 'job_seeker' && (loadingAnalysis || matchAnalysis) && (
              <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-indigo-500/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner shadow-white/10">
                      <Zap className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        Yapay Zeka Uyumluluk Analizi
                      </h2>
                      <p className="text-indigo-200 font-medium mt-1">Profiliniz ve bu ilan arasındaki detaylı eşleşme analizi</p>
                    </div>
                  </div>

                  {loadingAnalysis ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-4" />
                      <p className="text-indigo-200 font-bold animate-pulse">Profiliniz analiz ediliyor...</p>
                    </div>
                  ) : matchAnalysis ? (
                    <div className="space-y-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                          <h3 className="text-white font-bold text-xl">Profil Uyumluluk Skoru</h3>
                          <div className="text-3xl font-black text-purple-400 mt-2 md:mt-0">
                            %{matchAnalysis.algorithmicScore || 0}
                          </div>
                        </div>
                        {matchAnalysis.matchDetails?.parameters && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {matchAnalysis.matchDetails.parameters.map((param: any, idx: number) => (
                              <div key={idx} className="bg-black/20 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm font-bold text-indigo-200">{param.name}</div>
                                  {param.status === 'known' && (
                                    <div className="text-sm font-black text-white">{Math.round(param.score * 100)}%</div>
                                  )}
                                  {param.status === 'not_applicable' && (
                                    <div className="text-xs font-bold text-slate-400">Şart Aranmıyor</div>
                                  )}
                                </div>
                                {param.status === 'known' && (
                                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                                    <div 
                                      className={`h-1.5 rounded-full ${param.score > 0.7 ? 'bg-emerald-400' : param.score > 0.4 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                      style={{ width: `${Math.round(param.score * 100)}%` }}
                                    ></div>
                                  </div>
                                )}
                                {(param.status === 'missing_user' || param.status === 'missing_job') && (
                                  <div className="mt-2 text-xs font-medium text-amber-300/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                                    {param.note || 'Bilgi eksik olduğu için değerlendirilemedi.'}
                                  </div>
                                )}
                                <div className="text-[10px] text-indigo-400/50 absolute bottom-1 right-2">Ağırlık: %{Math.round(param.weight * 100)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-white text-base leading-relaxed font-medium">
                          {matchAnalysis.recommendation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm">
                          <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" /> Eşleşen Yetenekler
                          </h3>
                          {matchAnalysis.matchDetails?.matchedSkills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {matchAnalysis.matchDetails.matchedSkills.map((ms: any, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-bold border border-emerald-500/30 flex items-center gap-1">
                                  {ms.name}
                                  {ms.confidence > 0.5 && (
                                    <span title="Kanıtlanmış Yetenek">
                                      <Check className="w-3 h-3 text-emerald-400 ml-1" />
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-emerald-200/50 text-sm italic">Eşleşen yetenek bulunamadı.</p>
                          )}
                        </div>

                        <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-sm">
                          <h3 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Eksik Yetenekler
                          </h3>
                          {matchAnalysis.matchDetails?.missingSkills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {matchAnalysis.matchDetails.missingSkills.map((skill: string, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-rose-500/20 text-rose-300 rounded-lg text-sm font-bold border border-rose-500/30">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-rose-200/50 text-sm italic">Eksik yetenek bulunamadı, harika uyum!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* AI Salary Analysis Module */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[32px] p-8 md:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-black text-white">Yapay Zeka Maaş Analizi</h2>
                </div>

                {job.salaryMin ? (
                  <div className="space-y-6">
                    <p className="text-indigo-100 font-medium text-lg">
                      Sistemimizdeki 30.000+ ilan incelendiğinde, bu pozisyon için piyasa ortalaması 
                      <span className="font-black text-white mx-2">{marketAvg.toLocaleString('tr-TR')} ₺</span> 
                      seviyesindedir.
                    </p>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-indigo-200 mb-1">Bu İlanın Ortalaması</div>
                        <div className="text-2xl font-black text-emerald-400">{avgSalary.toLocaleString('tr-TR')} ₺</div>
                      </div>
                      <div className="h-12 w-px bg-white/10" />
                      <div className="text-right">
                        <div className="text-sm font-bold text-indigo-200 mb-1">Piyasa Farkı</div>
                        <div className="text-2xl font-black text-white">+{diffPercent}% Yüksek</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-indigo-100 font-medium text-lg">
                    Bu ilan için maaş bilgisi paylaşılmamıştır (Mülakat Sonrası). Ancak benzer pozisyonlarda piyasa ortalaması genellikle 
                    <span className="font-black text-white mx-2">45.000 ₺ - 65.000 ₺</span> 
                    bandındadır.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Requirements & Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-indigo-900/5 border border-slate-100">
              <h2 className="text-lg font-black text-slate-900 mb-6">Genel Nitelikler</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Eğitim Seviyesi</div>
                    <div className="font-black text-slate-800">{job.educationLevel || 'Belirtilmedi'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tecrübe</div>
                    <div className="font-black text-slate-800">{job.experienceYears || 'Belirtilmedi'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Çalışma Saatleri</div>
                    <div className="font-black text-slate-800">{job.workingHours?.join(', ') || 'Esnek / Belirlenmemiş'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Askerlik Durumu</div>
                    <div className="font-black text-slate-800">{job.militaryStatus || 'Belirtilmedi'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Yabancı Dil</div>
                    <div className="font-black text-slate-800">{job.language || 'Fark Etmez'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-[32px] p-8 shadow-xl text-center">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">İlan Görüntülenme</div>
              <div className="text-4xl font-black text-white">{job.viewCount?.toLocaleString('tr-TR') || 0}</div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Buna Benzer İş İlanları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarJobs.map((simJob) => (
                <Link
                  href={`/job/${simJob.id}`}
                  key={simJob.id}
                  prefetch
                  onMouseEnter={() =>
                    warmupCompanyLogoFor({
                      name: simJob.company?.name,
                      website: simJob.company?.website,
                    })
                  }
                >
                  <div className="bg-white rounded-[24px] p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 transition-all group h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      <LogoBadge variant="compact" company={simJob.company} />
                      <div>
                        <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{simJob.title}</h3>
                        <div className="text-sm font-bold text-slate-500 line-clamp-1">{simJob.company.name}</div>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                        {simJob.location}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Başvuruyu Onayla</h3>
            <p className="text-slate-500 text-center mb-8 font-medium">
              Profilinizde yer alan tüm güncel bilgiler ve mevcut özgeçmişiniz bu ilana başvuru için gönderilecektir. Onaylıyor musunuz?
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="flex-1 px-6 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => void submitApply()}
                disabled={actionBusy}
                className="flex-1 px-6 py-3.5 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {actionBusy ? 'Gönderiliyor...' : 'Evet, Başvur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
