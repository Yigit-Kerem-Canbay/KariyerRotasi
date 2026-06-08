'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Building2, MapPin, Users, Zap, Clock, ExternalLink, PlusCircle, LayoutDashboard, Eye, Heart } from 'lucide-react';
import { formatWorkModel, formatLocation } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userRole = useAuthStore((s) => s.user?.role);
  const token = useAuthStore((s) => s.token);

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Wait until user is fully populated from store
    if (!userRole) return;

    if (userRole !== 'corporate_employer' && userRole !== 'individual_employer') {
      router.push('/jobs');
      return;
    }
    
    fetchJobs();
  }, [userRole, token, router, hasHydrated]);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/employer/my-jobs');
      setJobs(res.data.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Banner */}
      <div className="h-[240px] bg-indigo-950 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 to-transparent" />
        
        <Link
          href="/profile"
          className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md px-4 h-10 rounded-xl flex items-center gap-2 font-semibold text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <LayoutDashboard className="w-4 h-4" /> Profile Dön
        </Link>

        {jobs.length > 0 && (
          <div className="absolute top-6 right-6 z-10">
            <Link
              href="/employer/post-job"
              className="bg-indigo-600 px-4 h-10 rounded-xl flex items-center gap-2 font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30"
            >
              <PlusCircle className="w-4 h-4" /> Yeni İlan Yayınla
            </Link>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center mt-6">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Yayınladığım İlanlar
            </h1>
            <p className="text-indigo-200 text-lg font-medium max-w-2xl mx-auto px-4">
              Aday havuzunuzu yönetin, başvuruları yapay zeka ile analiz edin.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 shadow-2xl text-center border border-slate-100">
             <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-indigo-300" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Henüz ilan yayınlamadınız</h2>
             <p className="text-slate-500 font-medium mb-8">Yeni takım arkadaşlarınızı bulmak için hemen ilk ilanınızı oluşturun.</p>
             <Link href="/employer/post-job" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all inline-flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> İlan Oluştur
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-[24px] p-6 shadow-xl shadow-indigo-900/5 border border-slate-100 flex flex-col md:flex-row md:items-center gap-6 group hover:border-indigo-200 transition-all">
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-black text-xl text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5" title={job.location}>
                      <MapPin className="w-3.5 h-3.5" /> 
                      {formatLocation(job.location)}
                    </span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(job.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold border border-indigo-100">
                      {formatWorkModel(job.workModel)}
                    </span>
                    {job.salaryMin && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">
                        {job.salaryMin.toLocaleString('tr-TR')} {job.currency}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-px h-px md:h-20 bg-slate-100 md:mx-4" />

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center gap-1 md:min-w-[80px] bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <Eye className="w-5 h-5 text-indigo-400 mb-1" />
                    <div className="text-xl font-black text-slate-900">{job.viewCount || 0}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Görüntüleme</div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1 md:min-w-[80px] bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <Heart className="w-5 h-5 text-pink-400 mb-1" />
                    <div className="text-xl font-black text-slate-900">{job._count?.savedBy || 0}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Favori</div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1 md:min-w-[80px] bg-indigo-50 rounded-2xl p-3 border border-indigo-100">
                    <Users className="w-5 h-5 text-indigo-600 mb-1" />
                    <div className="text-xl font-black text-indigo-900">{job._count?.applications || 0}</div>
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Başvuru</div>
                  </div>
                </div>

                <div className="w-full md:w-px h-px md:h-20 bg-slate-100 md:mx-4" />

                <div className="flex flex-row md:flex-col items-center justify-center gap-3">
                  <Link 
                    href={`/employer/jobs/${job.id}/applicants`}
                    className="w-full md:w-40 h-12 px-6 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all gap-2"
                  >
                    Başvurular <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link 
                    href={`/job/${job.id}`}
                    className="w-full md:w-40 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
                    target="_blank"
                  >
                    İlanı Görüntüle
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
