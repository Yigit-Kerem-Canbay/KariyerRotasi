'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, Building2, MapPin, Trash2, Zap, Clock, ExternalLink } from 'lucide-react';
import { formatWorkModel, formatLocation } from '@/lib/utils';
import { resolveLogoFileKey, warmupCompanyLogo, companyLogoSrc } from '@/lib/companyLogo';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/saved-jobs/me');
      setSavedJobs(res.data.items);
      res.data.items.forEach((item: any) => {
        warmupCompanyLogo(resolveLogoFileKey(item.job.company));
      });
    } catch (err) {
      console.error('Failed to fetch saved jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (jobId: string) => {
    if (!confirm('Bu ilanı favorilerden çıkarmak istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/saved-jobs/${jobId}`);
      setSavedJobs((prev) => prev.filter((item) => item.jobId !== jobId));
    } catch (err) {
      alert('İşlem başarısız oldu.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Banner */}
      <div className="h-[240px] bg-slate-900 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        
        <Link
          href="/profile"
          className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-md px-4 h-10 rounded-xl flex items-center gap-2 font-semibold text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> Profile Dön
        </Link>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Favori İlanlarım
            </h1>
            <p className="text-slate-300 text-lg font-medium max-w-2xl mx-auto px-4">
              Daha sonra başvurmak için kaydettiğin veya yakından takip ettiğin tüm kariyer fırsatları.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
        {loading ? (
           <div className="bg-white rounded-[32px] p-12 shadow-2xl flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
           </div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 shadow-2xl text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-slate-300" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Henüz ilan kaydetmedin</h2>
             <p className="text-slate-500 font-medium mb-8">İlgini çeken ilanları kaydederek daha sonra kolayca bulabilirsin.</p>
             <Link href="/jobs" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                İlanları Keşfet
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs.map((item) => (
              <div key={item.jobId} className="bg-white rounded-[24px] p-6 shadow-xl shadow-indigo-900/5 border border-slate-100 flex flex-col group hover:border-indigo-200 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 bg-white">
                     <img 
                        src={companyLogoSrc(resolveLogoFileKey(item.job.company) || '')} 
                        className="w-full h-full object-contain p-2" 
                        alt="logo"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-black text-slate-300">${item.job.company.name.charAt(0)}</span>`;
                        }}
                     />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {item.job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500 mt-1">
                      <Building2 className="w-4 h-4" /> {item.job.company.name}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-100">
                    <MapPin className="w-3.5 h-3.5" /> {formatLocation(item.job.location)}
                  </span>
                  <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                    {formatWorkModel(item.job.workModel)}
                  </span>
                  {item.job.salaryMin && (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {item.job.salaryMin.toLocaleString('tr-TR')} {item.job.salaryMax ? `- ${item.job.salaryMax.toLocaleString('tr-TR')}` : ''} {item.job.currency}
                    </span>
                  )}
                </div>

                {item.job.jobSkills && item.job.jobSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.job.jobSkills.map((js: any) => (
                      <span key={js.skill.id} className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-[10px] font-bold border border-slate-100">
                        {js.skill.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 
                    Kaydedildi: {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => removeSavedJob(item.jobId)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      title="Favorilerden Çıkar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link 
                      href={`/job/${item.jobId}`}
                      className="h-10 px-4 flex items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 transition-all gap-2"
                    >
                      İncele <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
