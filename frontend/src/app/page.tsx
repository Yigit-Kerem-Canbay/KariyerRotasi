"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, MapPin, Briefcase, ArrowRight, Zap, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

const getDomain = (website: string) => {
  if (!website) return '';
  try {
    const url = new URL(website);
    return url.hostname.replace('www.', '');
  } catch(e) {
    return '';
  }
};

const getAvatarColor = (name: string) => {
  const hash = Math.abs(name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0));
  return `hsl(${hash % 360}, 80%, 55%)`;
};

const JobCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col h-full animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4" />
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

export default function Home() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroCity, setHeroCity] = useState('');

  useEffect(() => {
    // Fetch companies for the companies section
    fetch("http://localhost:4000/api/companies")
      .then(res => res.json())
      .then(data => {
        setCompanies(data.slice(0, 6));
      })
      .catch(err => console.error("Failed to fetch companies:", err));

    // Fetch discover (for you) jobs with mock skills for demo
    fetch("http://localhost:4000/api/jobs/discover?skills=React,Node.js,TypeScript&limit=10")
      .then(res => res.json())
      .then(data => {
        setFeaturedJobs(data.data || []);
        setTotalJobs(data.meta?.total || 63550);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch jobs:", err);
        setLoading(false);
      });
  }, []);

  const handleHeroSearch = () => {
    const params = new URLSearchParams();
    if (heroSearch) params.append('q', heroSearch);
    if (heroCity) params.append('city', heroCity);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* 
        ==============================
        HERO SECTION (Light, Modern, Clean)
        ============================== 
      */}
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
            <p className="text-gray-500 text-lg mb-8 max-w-xl leading-relaxed">
              Türkiye'nin lider şirketlerinde <span className="font-semibold text-gray-700">{totalJobs.toLocaleString('tr-TR')}</span> güncel iş ilanı arasından size en uygun olanı anında keşfedin.
            </p>
            
            {/* Modern Elite Search Bar */}
            <div className="flex flex-col sm:flex-row shadow-xl shadow-indigo-900/5 rounded-2xl bg-white p-2 border border-gray-200/80 mb-8 max-w-3xl transform hover:scale-[1.01] transition-transform duration-300">
              <div className="flex-1 flex items-center px-4 h-12 border-b sm:border-b-0 sm:border-r border-gray-100">
                <Search className="h-5 w-5 text-indigo-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Pozisyon, yetenek veya şirket..." 
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
                  className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                />
              </div>
              <div className="flex-1 flex items-center px-4 h-12">
                <MapPin className="h-5 w-5 text-indigo-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Şehir, ilçe..." 
                  value={heroCity}
                  onChange={(e) => setHeroCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
                  className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                />
              </div>
              <Button onClick={handleHeroSearch} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold tracking-wide shadow-md shadow-indigo-600/20 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 transition-all active:scale-95">
                İş Bul
              </Button>
            </div>
            
            {/* Popular Searches */}
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3">
                Popüler aramalar:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "React", "Node.js", "Flutter", "Python", "Data Scientist",
                  "DevOps", "Figma", "SAP", "İstanbul", "Ankara"
                ].map((tag, i) => (
                  <Link key={i} href={`/jobs?q=${tag}`} className="inline-flex px-3 py-[6px] bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-500 text-xs font-semibold rounded-lg shadow-sm transition-all hover:shadow-md">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
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
                        {title: "Frontend Developer", company: "Getir", loc: "İstanbul", icon: "G", color: "bg-purple-600"}, 
                        {title: "Sistem Mühendisi", company: "Aselsan", loc: "Ankara", icon: "A", color: "bg-blue-800"}, 
                        {title: "Veri Bilimcisi", company: "Trendyol", loc: "Uzaktan", icon: "T", color: "bg-orange-500"} 
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
                     <p className="text-[11px] text-gray-500 font-medium">+15k Yeni</p>
                     <p className="text-sm text-gray-900 font-extrabold tracking-tight">Açık Pozisyon</p>
                   </div>
                 </div>
             </div>
          </div>
        </div>
      </section>

      {/* 
        ==============================
        MODERN BANNER 
        ============================== 
      */}
      <section className="w-full py-8 text-white">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="w-full bg-gradient-to-r from-indigo-800 to-[#1e3a8a] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl shadow-indigo-900/10">
             {/* Abstract background elements */}
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
                  <div className="font-bold text-sm tracking-wide">6-8 Mayıs</div>
                  <div className="text-indigo-200 text-xs font-medium">Çevrimiçi & Yüzyüze</div>
                </div>
                <Button className="bg-white hover:bg-gray-50 text-indigo-900 px-7 py-5 md:py-2 h-[50px] border-none rounded-xl font-bold text-sm shadow-lg shadow-black/10 transition-transform active:scale-95 w-full sm:w-auto">
                  Ücretsiz Kayıt Ol
                </Button>
             </div>
          </div>
        </div>
      </section>

      {/* 
        ==============================
        FEATURED JOBS
        ============================== 
      */}
      <section className="w-full py-8">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 font-bold text-xl tracking-tight">Sizin İçin Seçilen İlanlar</h2>
            <Link href="/jobs" className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 flex items-center gap-1 group">
              Tümünü gör <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {loading ? (
               <>
                 <JobCardSkeleton />
                 <JobCardSkeleton />
                 <JobCardSkeleton />
                 <JobCardSkeleton />
                 <JobCardSkeleton />
               </>
            ) : featuredJobs.length > 0 ? (
               featuredJobs.map((job) => {
                 const domain = getDomain(job.company?.website);
                 const skills = job.jobSkills?.slice(0, 3).map((js: any) => js.skill.name) || [];

                 return (
                 <Link key={job.id} href={`/job/${job.id}`} className="bg-white border border-gray-200/80 rounded-2xl p-5 flex flex-col hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full min-h-[190px]">
                   <div className="flex items-center justify-between mb-4">
                     <div className="w-12 h-12 rounded-xl shadow-sm shrink-0 overflow-hidden relative border border-gray-100 bg-white flex items-center justify-center">
                       {domain && (
                         <img 
                           src={`/logos/${domain}.png`}
                           alt={job.company?.name}
                           className="w-full h-full object-contain p-1 relative z-10"
                           onError={(e) => {
                             (e.target as HTMLImageElement).style.display = 'none';
                           }}
                         />
                       )}
                       <div 
                         className="absolute inset-0 w-full h-full text-white font-extrabold flex items-center justify-center text-xl"
                         style={{ backgroundColor: getAvatarColor(job.company?.name || '') }}
                       >
                         {job.company?.name?.charAt(0)}
                       </div>
                     </div>
                     
                     {job.matchScore > 0 && (
                       <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">
                         <Zap className="w-3 h-3 fill-emerald-600" />
                         <span className="text-[10px] font-black">%{job.matchScore} Uyum</span>
                       </div>
                     )}
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
               )})
            ) : (
               <div className="col-span-full text-center text-gray-500 font-medium py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                 Henüz ilan bulunmamaktadır.
               </div>
            )}
          </div>
        </div>
      </section>

      {/* 
        ==============================
        TOP COMPANIES
        ============================== 
      */}
      <section className="w-full py-12 bg-white border-y border-gray-200/60 mt-4">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-gray-900 font-bold text-xl tracking-tight">Aktif İşe Alım Yapan Lider Şirketler</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
               <div className="col-span-full flex justify-center py-12">
                 <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
               </div>
            ) : (
               companies.map((comp) => {
                 const domain = getDomain(comp.website);

                 return (
                 <Link key={comp.id} href={`/company/${comp.id}`} className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 cursor-pointer flex flex-col relative group">
                    <div className="h-20 w-full bg-slate-100 relative">
                      <div className="absolute -bottom-8 left-6 border-4 border-white rounded-2xl shadow-sm bg-white overflow-hidden w-16 h-16">
                        {domain && (
                          <Image 
                            src={`/logos/${domain}.png`}
                            alt={comp.name}
                            fill
                            sizes="64px"
                            className="object-contain p-1 z-10 bg-white"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div 
                          className="absolute inset-0 w-full h-full text-white font-extrabold flex items-center justify-center text-2xl"
                          style={{ backgroundColor: getAvatarColor(comp.name) }}
                        >
                          {comp.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                    <div className="pt-12 px-6 pb-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-gray-900 font-bold text-[17px]">{comp.name}</h3>
                        {(comp._count?.jobs ?? comp.jobs?.length ?? 0) > 0 && (
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
                          {comp._count?.jobs ?? comp.jobs?.length ?? 0} İlan
                        </span>
                      </div>
                    </div>
                 </Link>
                 );
               })
            )}
          </div>
        </div>
      </section>

      {/* 
        ==============================
        EXPERIENCE & SECTORS 
        ============================== 
      */}
      <section className="w-full py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Experience Level */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 font-bold text-xl tracking-tight">Deneyim Seviyesi</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Yeni Mezun (0 Yıl)", count: "1,240" },
                  { title: "Uzman (1-3 Yıl)", count: "8,530" },
                  { title: "Kıdemli (3-7 Yıl)", count: "11,200" },
                  { title: "Yönetici (7+ Yıl)", count: "3,450" }
                ].map((item, i) => (
                  <Link key={i} href={`/jobs?exp=${i}`} className="bg-white border border-gray-200/80 rounded-2xl p-5 flex flex-col hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-gray-800 text-[15px] mb-1">{item.title}</h4>
                    <span className="text-sm font-semibold text-indigo-600">
                      {item.count} İlan
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Sectors Display */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 font-bold text-xl tracking-tight">Öne Çıkan Sektörler</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  "Bilişim / Teknoloji", "Otomotiv Endüstrisi", 
                  "Finans / Bankacılık", "E-Ticaret / Perakende",
                  "Üretim", "Sağlık", "Telekomünikasyon", "Dijital Pazarlama"
                ].map((sector, i) => (
                  <Link key={i} href={`/jobs?sector=${i}`} className="bg-white border border-gray-200/70 rounded-xl px-5 py-3 hover:border-indigo-300 hover:shadow-md hover:-translate-y-[2px] transition-all group shadow-sm">
                    <span className="font-semibold text-[13px] text-gray-700 group-hover:text-indigo-600 transition-colors uppercase tracking-wide">{sector}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
