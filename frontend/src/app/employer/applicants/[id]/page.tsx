'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, User, Mail, MapPin, Zap, CheckCircle, XCircle, ShieldCheck, TrendingUp, AlertTriangle, Briefcase, GraduationCap, Code, FileText, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function EmployerApplicantProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userRole = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (userRole !== 'corporate_employer' && userRole !== 'individual_employer') {
      router.push('/dashboard');
      return;
    }
    fetchProfile();
  }, [userRole, router, id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/applications/employer/${id}/profile`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/applications/employer/${id}/status`, { status });
      setData((prev: any) => ({
        ...prev,
        application: { ...prev.application, status }
      }));
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

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Başvuru bulunamadı.</h2>
        <button onClick={() => router.back()} className="text-indigo-600 font-bold">Geri Dön</button>
      </div>
    );
  }

  const { candidate, application, matchReport } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Banner */}
      <div className="h-[240px] bg-slate-900 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-md px-4 h-10 rounded-xl flex items-center gap-2 font-semibold text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
        
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-indigo-900/5 mb-8 border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-indigo-100 text-indigo-700 font-black text-4xl md:text-5xl flex items-center justify-center shrink-0 shadow-inner border-4 border-white overflow-hidden">
            {candidate.avatarUrl ? (
              <img src={`http://localhost:4000${candidate.avatarUrl}`} alt="" className="w-full h-full object-cover" />
            ) : (
              candidate.name.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">{candidate.name}</h1>
              
              <div className="flex flex-wrap items-center gap-3">
                {application.cvUrl && (
                  <a href={`http://localhost:4000${application.cvUrl}`} target="_blank" rel="noreferrer" className="px-4 h-12 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all">
                    <FileText className="w-5 h-5 text-indigo-600" /> CV Görüntüle
                  </a>
                )}
                <a href={`mailto:${candidate.email}`} className="px-4 h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all border border-indigo-200">
                  <MessageSquare className="w-5 h-5" /> Mesaj Gönder
                </a>
                {application.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateStatus('accepted')}
                      className="px-6 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <CheckCircle className="w-5 h-5" /> Kabul Et
                    </button>
                    <button 
                      onClick={() => updateStatus('rejected')}
                      className="px-6 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
                    >
                      <XCircle className="w-5 h-5" /> Reddet
                    </button>
                  </>
                )}
                {application.status === 'accepted' && (
                  <div className="px-6 h-12 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-2 border border-emerald-200 cursor-default">
                    <CheckCircle className="w-5 h-5" /> Kabul Edildi
                  </div>
                )}
                {application.status === 'rejected' && (
                  <div className="px-6 h-12 bg-rose-50 text-rose-700 rounded-xl font-bold flex items-center gap-2 border border-rose-200 cursor-default">
                    <XCircle className="w-5 h-5" /> Reddedildi
                  </div>
                )}
              </div>
            </div>

            <div className="text-lg font-bold text-slate-500 mb-6">
              {candidate.profile?.title || 'Unvan Belirtilmemiş'}
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 rounded-lg"><Mail className="w-4 h-4 text-slate-400" /> {candidate.email}</span>
              {candidate.phone && <span className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 rounded-lg"><User className="w-4 h-4 text-slate-400" /> {candidate.phone}</span>}
              {candidate.profile?.city && <span className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 rounded-lg"><MapPin className="w-4 h-4 text-slate-400" /> {candidate.profile.city}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* AI Report Card */}
            {matchReport && (
              <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 rounded-[32px] p-8 shadow-2xl relative overflow-hidden border border-indigo-500/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner shadow-white/10">
                      <Zap className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        Yapay Zeka Aday Raporu
                      </h2>
                      <p className="text-indigo-200 font-medium mt-1">Adayın bu pozisyona uygunluk analizi</p>
                    </div>
                    <div className="ml-auto text-5xl font-black text-purple-400">
                      %{matchReport.overallScore}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {matchReport.parameters?.map((param: any, idx: number) => (
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
                            {param.note || 'Bilgi eksik.'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm">
                      <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> Eşleşen Yetenekler
                      </h3>
                      {matchReport.matchedSkills?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {matchReport.matchedSkills.map((ms: any, idx: number) => (
                            <span key={idx} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-bold border border-emerald-500/30">
                              {ms.name}
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
                      {matchReport.missingSkills?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {matchReport.missingSkills.map((skill: string, idx: number) => (
                            <span key={idx} className="px-3 py-1.5 bg-rose-500/20 text-rose-300 rounded-lg text-sm font-bold border border-rose-500/30">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-rose-200/50 text-sm italic">Tüm kritik yeteneklere sahip!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Experience */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-indigo-900/5 border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
                Deneyimler
              </h2>
              {candidate.experience?.length > 0 ? (
                <div className="space-y-6">
                  {candidate.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-slate-100 pl-4 relative">
                      <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                      <h3 className="font-bold text-lg text-slate-900">{exp.title}</h3>
                      <div className="text-sm font-bold text-blue-600 mb-2">{exp.companyName}</div>
                      <div className="text-sm font-medium text-slate-400 mb-3">
                        {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Devam Ediyor'}
                      </div>
                      {exp.description && <p className="text-slate-600 text-sm whitespace-pre-wrap">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Deneyim bilgisi eklenmemiş.</p>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-indigo-900/5 border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><GraduationCap className="w-5 h-5" /></div>
                Eğitim
              </h2>
              {candidate.education?.length > 0 ? (
                <div className="space-y-6">
                  {candidate.education.map((edu: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-slate-100 pl-4 relative">
                      <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                      <h3 className="font-bold text-lg text-slate-900">{edu.schoolName}</h3>
                      <div className="text-sm font-bold text-emerald-600 mb-2">{edu.fieldOfStudy} • {edu.degree}</div>
                      <div className="text-sm font-medium text-slate-400">
                        {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Devam Ediyor'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Eğitim bilgisi eklenmemiş.</p>
              )}
            </div>

          </div>

          <div className="space-y-8">
            {/* Candidate Summary */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-indigo-900/5 border border-slate-100">
              <h2 className="text-lg font-black text-slate-900 mb-4">Hakkında</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {candidate.profile?.about || 'Hakkında bilgisi bulunmuyor.'}
              </p>
            </div>

            {/* Candidate Skills */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-indigo-900/5 border border-slate-100">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <Code className="w-5 h-5 text-indigo-500" /> Yetenekleri
              </h2>
              <div className="flex flex-wrap gap-2">
                {candidate.userSkills?.length > 0 ? (
                  candidate.userSkills.map((us: any, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                      {us.skill.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">Yetenek eklenmemiş.</span>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
