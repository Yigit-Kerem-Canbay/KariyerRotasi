'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, Building2, MapPin, Zap, Clock, ExternalLink, XCircle, CheckCircle, Clock3 } from 'lucide-react';
import { resolveLogoFileKey, warmupCompanyLogo, companyLogoSrc } from '@/lib/companyLogo';
import { formatWorkModel, formatLocation } from '@/lib/utils';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/me');
      setApplications(res.data.items);
      res.data.items.forEach((item: any) => {
        warmupCompanyLogo(resolveLogoFileKey(item.job.company));
      });
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (jobId: string) => {
    if (!confirm('Bu başvuruyu geri çekmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    try {
      await api.delete(`/applications/${jobId}`);
      setApplications((prev) => prev.filter((item) => item.jobId !== jobId));
    } catch (err) {
      alert('İşlem başarısız oldu.');
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'accepted') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200">
          <CheckCircle className="w-4 h-4" /> Kabul Edildi
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-bold border border-rose-200">
          <XCircle className="w-4 h-4" /> Reddedildi
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold border border-amber-200">
        <Clock3 className="w-4 h-4" /> Değerlendiriliyor
      </span>
    );
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
              Başvurularım
            </h1>
            <p className="text-slate-300 text-lg font-medium max-w-2xl mx-auto px-4">
              Şimdiye kadar başvurduğun tüm iş ilanları ve güncel durumları.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
        {loading ? (
           <div className="bg-white rounded-[32px] p-12 shadow-2xl flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
           </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 shadow-2xl text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-slate-300" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Henüz başvurun bulunmuyor</h2>
             <p className="text-slate-500 font-medium mb-8">Yapay zeka uyumlu yüzlerce ilan arasından sana uygun olanı bul ve başvur.</p>
             <Link href="/jobs" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                İlanları Keşfet
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((item) => (
              <div key={item.id} className="bg-white rounded-[24px] p-6 md:p-8 shadow-xl shadow-indigo-900/5 border border-slate-100 flex flex-col md:flex-row md:items-center gap-6 group hover:border-indigo-200 transition-all">
                
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-20 h-20 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 bg-white">
                     <img 
                        src={companyLogoSrc(resolveLogoFileKey(item.job.company) || '')} 
                        className="w-full h-full object-contain p-2" 
                        alt="logo"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-black text-slate-300">${item.job.company.name.charAt(0)}</span>`;
                        }}
                     />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1">
                      {item.job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-base font-bold text-slate-500 mb-3">
                      <Building2 className="w-4 h-4" /> {item.job.company.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-bold border border-slate-100">
                        {formatLocation(item.job.location)}
                      </span>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold border border-indigo-100">
                        {formatWorkModel(item.job.workModel)}
                      </span>
                      {item.job.salaryMin && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">
                          {item.job.salaryMin.toLocaleString('tr-TR')} {item.job.salaryMax ? `- ${item.job.salaryMax.toLocaleString('tr-TR')}` : ''} {item.job.currency}
                        </span>
                      )}
                    </div>
                    {item.job.jobSkills && item.job.jobSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.job.jobSkills.map((js: any) => (
                          <span key={js.skill.id} className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-[10px] font-bold border border-slate-100">
                            {js.skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-px h-px md:h-20 bg-slate-100 md:mx-4" />

                <div className="flex flex-row md:flex-col items-center justify-between gap-4 md:min-w-[200px]">
                  <StatusBadge status={item.status} />
                  
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <div className="w-full md:w-px h-px md:h-20 bg-slate-100 md:mx-4" />

                <div className="flex flex-row md:flex-col items-center justify-center gap-3">
                  <Link 
                    href={`/job/${item.jobId}`}
                    className="w-full h-12 px-6 flex items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 transition-all gap-2"
                  >
                    İlanı Gör <ExternalLink className="w-4 h-4" />
                  </Link>
                  {item.status === 'pending' && (
                    <button 
                      onClick={() => withdrawApplication(item.jobId)}
                      className="w-full h-10 flex items-center justify-center rounded-xl border border-rose-200 text-rose-600 text-sm font-bold hover:bg-rose-50 transition-all"
                    >
                      Geri Çek
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
