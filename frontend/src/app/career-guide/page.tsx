'use client';

import Link from 'next/link';
import { BookOpen, FileText, Briefcase, TrendingUp, Sparkles, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CareerGuidePage() {
  const guides = [
    {
      title: "Mülakatlara Hazırlık Rehberi",
      description: "İK profesyonellerinin en çok sorduğu sorular, tuzak sorulara nasıl cevap verilir ve beden dili sırları.",
      icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
      color: "bg-indigo-50",
      readTime: "12 Dk",
      slug: "mulakatlara-hazirlik"
    },
    {
      title: "Etkili CV Hazırlama Sanatı",
      description: "Yapay zeka tarama sistemlerini (ATS) nasıl geçersin? Öne çıkan bir özgeçmiş hazırlamanın altın kuralları.",
      icon: <FileText className="w-6 h-6 text-rose-600" />,
      color: "bg-rose-50",
      readTime: "8 Dk",
      slug: "etkili-cv-hazirlama"
    },
    {
      title: "Maaş Müzakeresi Nasıl Yapılır?",
      description: "Hakkettiğin maaşı alabilmek için yapman gereken araştırmalar ve mülakat anında taktiksel konuşma adımları.",
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-50",
      readTime: "10 Dk",
      slug: "maas-muzakeresi"
    },
    {
      title: "Teknoloji Sektöründe Yükselmek",
      description: "Yazılım, Veri Bilimi ve Tasarım alanlarında kariyer basamaklarını hızla tırmanmak için öğrenmen gereken yetenekler.",
      icon: <Sparkles className="w-6 h-6 text-amber-600" />,
      color: "bg-amber-50",
      readTime: "15 Dk",
      slug: "teknoloji-sektorunde-yukselmek"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-rose-600/20" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm mb-8 backdrop-blur-md">
            <BookOpen className="w-4 h-4" /> KariyerRotası Akademi
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
            Hayalindeki Kariyere<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">
              Adım Adım Ulaş
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
            Mülakat taktiklerinden CV hazırlamaya, maaş pazarlığından sektör analizlerine kadar ihtiyacın olan tüm rehberler burada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#guides">
              <Button size="lg" className="h-14 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg">
                Rehberleri Keşfet
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-700 text-white hover:bg-white hover:text-slate-900 font-bold text-lg bg-transparent">
                İlanlara Göz At
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats/Highlights */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">50+</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Kapsamlı Rehber</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-slate-100" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">120+</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Video Eğitim</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-slate-100" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">%94</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">İşe Alım Başarısı</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Cards */}
      <div id="guides" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Öne Çıkan Rehberler</h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Kariyerine yön verirken ihtiyacın olacak en güncel makaleler ve ipuçları.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {guides.map((guide, idx) => (
            <Link href={`/career-guide/${guide.slug}`} key={idx} className="block group">
              <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-indigo-200 hover:-translate-y-1 transition-all flex flex-col h-full cursor-pointer">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${guide.color}`}>
                    {guide.icon}
                  </div>
                  <div className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
                    {guide.readTime} Okuma
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-slate-500 font-medium mb-8 flex-1 leading-relaxed">
                  {guide.description}
                </p>
                <div className="flex items-center gap-2 text-indigo-600 font-bold mt-auto group-hover:gap-4 transition-all">
                  Hemen Oku <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[40px] p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500 opacity-20 rounded-full blur-3xl" />
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">Kariyer Testi Çok Yakında!</h2>
          <p className="text-xl text-indigo-100 font-medium max-w-2xl mx-auto mb-10 relative z-10">
            Hangi sektör sana daha uygun? Hangi yeteneklerini geliştirmelisin? Yapay zeka destekli kariyer testimiz yakında yayında.
          </p>
          <div className="relative z-10">
            <Button size="lg" className="h-14 px-10 rounded-full bg-white text-indigo-600 hover:bg-slate-50 font-black text-lg shadow-xl shadow-indigo-900/20">
              Haberdar Olmak İçin Kaydol
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
