'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { ArrowLeft, Users, Mail, MapPin, Zap, ExternalLink, ShieldCheck, CheckCircle, XCircle, Clock3 } from 'lucide-react';

export default function EmployerApplicantsPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userRole = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (userRole !== 'corporate_employer' && userRole !== 'individual_employer') {
      router.push('/dashboard');
      return;
    }
    fetchApplicants();
  }, [userRole, router, jobId]);

  const fetchApplicants = async () => {
    try {
      const res = await api.get(`/applications/employer/jobs/${jobId}/applicants`);
      setApplicants(res.data.items);
    } catch (err) {
      console.error('Failed to fetch applicants', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, status: string) => {
    try {
      await api.patch(`/applications/employer/${applicationId}/status`, { status });
      setApplicants(prev => prev.map(app => app.id === applicationId ? { ...app, status } : app));
    } catch (err) {
      alert('Durum güncellenemedi.');
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
          href="/employer/jobs"
          className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-md px-4 h-10 rounded-xl flex items-center gap-2 font-semibold text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> İlanlara Dön
        </Link>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center mt-6">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Başvurular
            </h1>
            <p className="text-indigo-200 text-lg font-medium max-w-2xl mx-auto px-4">
              Yapay zeka analizine göre en yüksek uyum puanından sıralanmıştır.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
        <div className="bg-white rounded-t-[32px] p-6 border-b border-slate-100 flex items-center justify-between shadow-xl shadow-indigo-900/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{applicants.length} Başvuru</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-[32px] p-6 shadow-xl shadow-indigo-900/5 min-h-[400px]">
          {applicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Henüz başvuru yok</h3>
              <p className="text-slate-500 mt-2">İlanınıza henüz kimse başvurmamış.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applicants.map((app) => (
                <div key={app.id} className="border border-slate-100 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col lg:flex-row lg:items-center gap-6">
                  
                  {/* AI Score */}
                  <div className="flex flex-col items-center justify-center w-24 shrink-0 border-r border-slate-100 pr-6">
                    <div className="text-3xl font-black text-purple-600">%{app.matchScore}</div>
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                      <Zap className="w-3 h-3" /> AI Uyum
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center shrink-0">
                      {app.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{app.user.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500 mb-2">
                        <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {app.user.email}</span>
                        {app.user.profile?.title && (
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md">
                            {app.user.profile.title}
                          </span>
                        )}
                        {app.user.profile?.city && (
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {app.user.profile.city}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <button 
                          onClick={() => updateStatus(app.id, 'accepted')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 font-bold text-sm transition-all"
                        >
                          <CheckCircle className="w-4 h-4" /> Kabul
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, 'rejected')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white text-rose-600 rounded-lg hover:bg-rose-50 font-bold text-sm transition-all"
                        >
                          <XCircle className="w-4 h-4" /> Ret
                        </button>
                      </div>
                    )}
                    {app.status === 'accepted' && (
                      <div className="flex items-center gap-1.5 px-4 h-10 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-200">
                        <CheckCircle className="w-4 h-4" /> Kabul Edildi
                      </div>
                    )}
                    {app.status === 'rejected' && (
                      <div className="flex items-center gap-1.5 px-4 h-10 bg-rose-50 text-rose-700 rounded-xl font-bold text-sm border border-rose-200">
                        <XCircle className="w-4 h-4" /> Reddedildi
                      </div>
                    )}

                    <Link 
                      href={`/employer/applicants/${app.id}`}
                      className="h-10 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-md ml-2"
                    >
                      Adayı İncele <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
