'use client';

import Link from 'next/link';
import { Building2, Users, Target, Zap, ArrowRight, ShieldCheck, PieChart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function EmployerPage() {
  const features = [
    {
      title: "Yapay Zeka Destekli Eşleştirme",
      description: "Yüzbinlerce aday arasından aradığınız profile en uygun olanları saniyeler içinde bulan akıllı algoritma.",
      icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
      color: "bg-indigo-50",
    },
    {
      title: "Hedef Odaklı Aday Havuzu",
      description: "İlgisiz başvurularla vakit kaybetmeyin. %90'ın üzerinde eşleşme skoru alan kaliteli adaylarla hemen görüşün.",
      icon: <Target className="w-6 h-6 text-rose-600" />,
      color: "bg-rose-50",
    },
    {
      title: "Gelişmiş Analitik ve Raporlama",
      description: "İlanlarınızın performansını ölçün, aday demografilerini inceleyin ve işe alım sürecinizi verilerle yönetin.",
      icon: <PieChart className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-50",
    },
    {
      title: "Güvenilir Şirket Profili",
      description: "Şirketinizin kültürünü, çalışma ortamını ve yan haklarını anlatarak en iyi yetenekleri markanıza çekin.",
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
      color: "bg-amber-50",
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        {/* Glowing orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600 rounded-full blur-[120px] opacity-20" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-300 font-bold text-sm mb-8 backdrop-blur-md">
              <Zap className="w-4 h-4 text-rose-400" /> B2B İşveren Çözümleri
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              En İyi Yetenekleri <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">
                Ekibinize Katın
              </span>
            </h1>
            <p className="text-xl text-slate-300 font-medium mb-10 leading-relaxed max-w-lg">
              Yapay zeka altyapımızla işe alım sürecinizi hızlandırın, maliyetlerinizi düşürün ve şirketiniz için en doğru adaylara saniyeler içinde ulaşın.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/register?type=employer">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-600/20">
                  Ücretsiz İlan Yayınla
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full border-slate-700 text-white hover:bg-white hover:text-slate-900 font-bold text-lg bg-slate-800/50 backdrop-blur-md">
                  Giriş Yap
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative">
            {/* Abstract Dashboard UI Illustration */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative z-10">
              <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-bold">Teknoloji A.Ş.</div>
                    <div className="text-slate-400 text-xs font-medium">İşveren Paneli</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-slate-700/30 rounded-xl w-full flex items-center px-4 gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-slate-600 rounded w-1/3" />
                    <div className="h-2 bg-slate-600 rounded w-1/4 opacity-50" />
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">%98 Uyum</div>
                </div>
                <div className="h-12 bg-slate-700/30 rounded-xl w-full flex items-center px-4 gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-slate-600 rounded w-2/5" />
                    <div className="h-2 bg-slate-600 rounded w-1/5 opacity-50" />
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">%94 Uyum</div>
                </div>
                <div className="h-12 bg-slate-700/30 rounded-xl w-full flex items-center px-4 gap-4 opacity-60">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-amber-400" /></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-slate-600 rounded w-1/2" />
                    <div className="h-2 bg-slate-600 rounded w-1/3 opacity-50" />
                  </div>
                  <div className="text-amber-400 font-bold text-sm">%85 Uyum</div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements behind the card */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* Trust Metrics */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-24 border border-slate-100">
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 mb-1">10.000+</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Kayıtlı Aday</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-slate-100" />
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 mb-1">500+</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Aktif Şirket</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-slate-100" />
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 mb-1">%40</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Daha Hızlı İşe Alım</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Neden KariyerRotası?</h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Geleneksel işe alım süreçlerini unutun. Modern teknolojilerle şirketinizin büyümesine odaklanın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-indigo-200 transition-colors group">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="bg-indigo-50 rounded-[40px] p-12 md:p-16 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Şimdi İlan Verin</h2>
            <p className="text-lg text-slate-600 font-medium max-w-xl">
              İlk ilanınızı ücretsiz yayınlayın ve KariyerRotası'nın yapay zeka gücüyle hemen tanışın.
            </p>
          </div>
          <Link href="/register?type=employer" className="shrink-0">
            <Button size="lg" className="h-16 px-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-xl shadow-indigo-600/20 flex items-center gap-3">
              Hemen Başla <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
}


