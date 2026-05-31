"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from "@/store/auth";
import { 
  ArrowLeft, MapPin, Building2, Users, Globe, ExternalLink, 
  Share2, MoreHorizontal, Briefcase, Plus, Check, Map, 
  Zap, Heart, Target, TrendingUp, ShieldCheck, AlertTriangle, UserPlus, FileSearch
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList,
  PieChart, Pie, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { companyLogoSrc, resolveLogoFileKey } from '@/lib/companyLogo';

const parseEmployeeCount = (empStr: string) => {
  if (!empStr) return 500;
  if (empStr.includes('+')) return parseInt(empStr.replace('+', '')) + 1500;
  const parts = empStr.split('-');
  if (parts.length === 2) return Math.floor((parseInt(parts[0]) + parseInt(parts[1])) / 2);
  return parseInt(empStr) || 500;
};

const generateData = (name: string, totalEmployees: number) => {
  const hashStr = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hash = Math.abs(hashStr); // MUST BE ABSOLUTE TO PREVENT NEGATIVE NUMBERS
  
  const random = (seed: number) => {
    const x = Math.sin(seed + hash) * 10000;
    return x - Math.floor(x);
  };

  const edLevels = [
    { name: 'Üniversite', value: Math.floor(totalEmployees * (0.3 + random(1) * 0.3)), color: '#4F46E5' },
    { name: 'Lise', value: Math.floor(totalEmployees * (0.1 + random(2) * 0.3)), color: '#06B6D4' },
    { name: 'Ön Lisans', value: Math.floor(totalEmployees * (0.1 + random(3) * 0.2)), color: '#10B981' },
    { name: 'Yük. Lisans', value: Math.floor(totalEmployees * (0.05 + random(4) * 0.1)), color: '#F59E0B' },
    { name: 'İlköğretim', value: Math.floor(totalEmployees * (0.01 + random(5) * 0.05)), color: '#EF4444' }
  ].sort((a, b) => b.value - a.value);

  const departments = [
    { name: 'Hizmet', value: Math.floor(totalEmployees * (0.2 + random(6) * 0.2)), color: '#6366F1' },
    { name: 'Satış', value: Math.floor(totalEmployees * (0.15 + random(7) * 0.2)), color: '#8B5CF6' },
    { name: 'Muhasebe', value: Math.floor(totalEmployees * (0.1 + random(8) * 0.1)), color: '#EC4899' },
    { name: 'Personel', value: Math.floor(totalEmployees * (0.05 + random(9) * 0.1)), color: '#14B8A6' },
    { name: 'Yönetim', value: Math.floor(totalEmployees * (0.02 + random(10) * 0.05)), color: '#F59E0B' }
  ].sort((a, b) => b.value - a.value);

  const majors = [
    { name: 'İşletme', value: Math.floor(edLevels[0].value * (0.15 + random(11) * 0.1)), color: '#3B82F6' },
    { name: 'İktisat', value: Math.floor(edLevels[0].value * (0.1 + random(12) * 0.1)), color: '#10B981' },
    { name: 'Mühendislik', value: Math.floor(edLevels[0].value * (0.1 + random(13) * 0.2)), color: '#F59E0B' },
    { name: 'İletişim', value: Math.floor(edLevels[0].value * (0.05 + random(14) * 0.1)), color: '#EC4899' },
    { name: 'Pazarlama', value: Math.floor(edLevels[0].value * (0.05 + random(15) * 0.1)), color: '#8B5CF6' }
  ].sort((a, b) => b.value - a.value);

  // Simplified and clear Hiring data
  const yearlyHiring = [
    { year: '2023', iseAlinan: Math.floor(100 + random(16) * 200) },
    { year: '2024', iseAlinan: Math.floor(150 + random(17) * 250) },
    { year: '2025', iseAlinan: Math.floor(200 + random(18) * 300) },
    { year: '2026 (Hedef)', iseAlinan: Math.floor(300 + random(19) * 400) },
  ];

  return { edLevels, departments, majors, yearlyHiring, hash };
};

export default function CompanyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const { token } = useAuthStore();

  // States
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeSection, setActiveSection] = useState('hakkinda');
  const [jobPage, setJobPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [jobsMeta, setJobsMeta] = useState<{ total?: number; totalPages?: number } | null>(null);

  // Refs
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/companies/${id}`)
      .then(res => res.json())
      .then(data => {
        setCompany(data);
        setLoading(false);
        const savedFollows = JSON.parse(localStorage.getItem('followedCompanies') || '[]');
        if (savedFollows.includes(data.id)) {
          setIsFollowing(true);
        }
      })
      .catch(err => {
        console.error("Error fetching company details:", err);
        setLoading(false);
      });

    fetch(`http://localhost:4000/api/companies`)
      .then(res => res.json())
      .then(data => setAllCompanies(data));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:4000/api/jobs?companyId=${id}&page=${jobPage}&limit=6&sort=newest`)
      .then(res => res.json())
      .then((data) => {
        setCompanyJobs(data?.data ?? []);
        setJobsMeta(data?.meta ?? null);
      })
      .catch(() => {
        setCompanyJobs([]);
        setJobsMeta(null);
      });
  }, [id, jobPage]);

  useEffect(() => {
    const handleScroll = () => {
      let current = 'hakkinda';
      const scrollPos = window.scrollY + 200;

      const sectionOrder = ['hakkinda', 'ilanlar', 'ai-analiz', 'profil'];
      
      for (const section of sectionOrder) {
        const el = sectionsRef.current[section];
        if (el && el.offsetTop <= scrollPos) {
          current = section;
        }
      }
      
      if (current !== activeSection) {
        setActiveSection(current);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFollowToggle = () => {
    if (!token) {
      alert("Takip etmek için oturum açmanız gereklidir.");
      return;
    }

    const newState = !isFollowing;
    setIsFollowing(newState);
    
    let savedFollows = JSON.parse(localStorage.getItem('followedCompanies') || '[]');
    if (newState) {
      if (!savedFollows.includes(company.id)) savedFollows.push(company.id);
    } else {
      savedFollows = savedFollows.filter((i: string) => i !== company.id);
    }
    localStorage.setItem('followedCompanies', JSON.stringify(savedFollows));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${company.name} Kariyer Profili`,
          text: `${company.name} şirketindeki açık pozisyonları incele!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Paylaşım iptal edildi', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Bağlantı panoya kopyalandı!');
    }
  };

  const scrollToSection = (id: string) => {
    const el = sectionsRef.current[id];
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 120,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="h-[250px] md:h-[350px] bg-slate-200 animate-pulse w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 animate-pulse">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-200 border-4 border-white shadow-lg" />
              <div className="flex-1 space-y-4 py-2">
                <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
                <div className="h-4 bg-slate-100 rounded-lg w-1/4" />
                <div className="flex gap-4">
                  <div className="h-4 bg-slate-50 rounded w-20" />
                  <div className="h-4 bg-slate-50 rounded w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Şirket Bulunamadı</h1>
        <button onClick={() => router.push('/')} className="text-indigo-600 font-semibold hover:underline">
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const logoKey = resolveLogoFileKey({ name: company.name, website: company.website });

  const totalJobPages = jobsMeta?.totalPages ?? 1;

  const similarCompanies = allCompanies
    .filter(c => c.id !== company.id && c.sector === company.sector)
    .slice(0, 3);

  const numericCount = parseEmployeeCount(company.employeeCount);
  const data = generateData(company.name, numericCount);
  const followerCount = Math.floor(numericCount * 3.5) + (isFollowing ? 1 : 0);

  const avatarColor = `hsl(${data.hash % 360}, 70%, 95%)`;
  const avatarText = `hsl(${data.hash % 360}, 70%, 40%)`;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.18;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#4b5563" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={700}>
        {name} ({(value / numericCount * 100).toFixed(0)}%)
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Banner */}
      <div className="h-[240px] bg-indigo-900 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/40" />
        <button 
          onClick={() => router.push('/companies')}
          className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md px-4 h-10 rounded-xl flex items-center gap-2 font-semibold text-white hover:bg-white/20 transition-all border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" /> Tüm Şirketler
        </button>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 -mt-20 relative z-10">
        {/* Main Header Card */}
        <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-2xl shadow-indigo-900/10 mb-8 border border-gray-100 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[24px] shadow-xl shrink-0 bg-white border border-gray-100 overflow-hidden relative flex items-center justify-center">
            {logoKey ? (
              <Image
                src={companyLogoSrc(logoKey)}
                alt={company.name}
                fill
                className="object-contain p-6"
                priority
              />
            ) : null}
            <div
              className={`absolute inset-0 w-full h-full flex items-center justify-center font-black text-[80px] text-white ${logoKey ? 'hidden' : ''}`}
              style={{ backgroundColor: `hsl(${data.hash % 360}, 80%, 55%)` }}
            >
              {company.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-[14px] font-bold text-gray-500">
                  <span className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg"><Building2 className="w-4 h-4" /> {company.sector || 'Genel Sektör'}</span>
                  <span className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1 rounded-lg"><Users className="w-4 h-4" /> {company.employeeCount || 'Belirtilmemiş'} Çalışan</span>
                  <span className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1 rounded-lg"><MapPin className="w-4 h-4" /> {company.location}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0 relative">
                <button 
                  onClick={handleFollowToggle}
                  className={`flex items-center gap-3 px-6 h-12 rounded-2xl font-black transition-all shadow-lg active:scale-95 ${isFollowing ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'}`}
                >
                  {isFollowing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                  <div className={`ml-2 pl-3 border-l-2 text-[14px] ${isFollowing ? 'border-emerald-200' : 'border-indigo-400'}`}>
                    {followerCount.toLocaleString()}
                  </div>
                </button>
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 transition-all active:scale-90"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                <div ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 transition-all active:scale-90"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-14 w-48 bg-white border border-gray-100 shadow-2xl shadow-gray-900/10 rounded-2xl p-2 z-50">
                      <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Mesaj Gönder</button>
                      <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Şirketi Bildir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 font-extrabold text-[15px] hover:text-indigo-800 transition-colors group">
                <Globe className="w-5 h-5" /> Web sitesini ziyaret et 
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </a>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (Sticky) */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-indigo-900/5 p-3 flex flex-col gap-2">
              <button 
                onClick={() => scrollToSection('hakkinda')}
                className={`w-full text-left px-5 py-4 rounded-2xl font-black text-[15px] transition-all flex items-center gap-3 ${activeSection === 'hakkinda' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Heart className="w-5 h-5" /> Şirket Hakkında
              </button>
              <button 
                onClick={() => scrollToSection('ilanlar')}
                className={`w-full text-left px-5 py-4 rounded-2xl font-black text-[15px] transition-all flex justify-between items-center ${activeSection === 'ilanlar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3"><Briefcase className="w-5 h-5" /> İş İlanları</div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs ${activeSection === 'ilanlar' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{company._count?.jobs ?? jobsMeta?.total ?? 0}</span>
              </button>
              <button 
                onClick={() => scrollToSection('ai-analiz')}
                className={`w-full text-left px-5 py-4 rounded-2xl font-black text-[15px] transition-all flex items-center gap-3 ${activeSection === 'ai-analiz' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Zap className="w-5 h-5 text-amber-400" /> Büyüme Analizi
              </button>
              <button 
                onClick={() => scrollToSection('profil')}
                className={`w-full text-left px-5 py-4 rounded-2xl font-black text-[15px] transition-all flex items-center gap-3 ${activeSection === 'profil' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <TrendingUp className="w-5 h-5" /> Çalışan Profili
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col gap-10 min-w-0">
            
            {/* Hakkında */}
            <section id="hakkinda" ref={el => { sectionsRef.current['hakkinda'] = el; }} className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-xl shadow-indigo-900/5 scroll-mt-24">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Heart className="text-red-500 w-7 h-7" /> Şirket Hakkında
              </h2>
              <div className="text-gray-600 text-lg leading-relaxed mb-10 whitespace-pre-wrap font-medium">
                {company.description || `${company.name}, ${company.sector} sektöründe faaliyet gösteren lider kuruluşlardan biridir. Çalışanlarına değer veren, yenilikçi ve dinamik yapısıyla her geçen gün büyümeye devam etmektedir.`}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-5 p-6 bg-slate-50 rounded-[24px] border border-slate-200/50">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
                    <Map className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-[17px] mb-1 uppercase tracking-tight">Genel Merkez</h4>
                    <p className="text-gray-500 font-bold text-sm">{company.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 p-6 bg-slate-50 rounded-[24px] border border-slate-200/50">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-[17px] mb-1 uppercase tracking-tight">Güvenilirlik</h4>
                    <p className="text-gray-500 font-bold text-sm">Onaylı Şirket Profili</p>
                  </div>
                </div>
              </div>
            </section>

            {/* İlanlar Grid */}
            <section id="ilanlar" ref={el => { sectionsRef.current['ilanlar'] = el; }} className="scroll-mt-24">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-black text-gray-900">Açık Pozisyonlar</h2>
                <Link
                  href={`/jobs?companyId=${company.id}&company=${encodeURIComponent(company.name)}`}
                  className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl font-black text-sm hover:bg-indigo-100 transition-all"
                >
                  Tümünü Gör ({(jobsMeta?.total ?? 0).toLocaleString('tr-TR')})
                </Link>
              </div>
              
              {companyJobs && companyJobs.length > 0 ? (
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-indigo-900/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {companyJobs.map((job: any) => {
                      const hashJob = Math.abs(job.id.split('').reduce((acc: number, char: string) => char.charCodeAt(0) + ((acc << 5) - acc), 0));
                      const isRemote = hashJob % 3 === 0;
                      const isHybrid = hashJob % 3 === 1;
                      
                      return (
                        <Link key={job.id} href={`/job/${job.id}`} className="flex flex-col p-6 bg-white border-2 border-slate-100 rounded-[24px] hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-900/10 transition-all group relative overflow-hidden">
                          <h3 className="font-black text-gray-900 text-[17px] mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">{job.title}</h3>
                          <div className="mt-auto flex flex-col gap-3">
                            <p className="font-bold text-gray-400 text-xs uppercase tracking-widest flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5" /> {company.name}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {isRemote && <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-black uppercase tracking-wider">Uzaktan</span>}
                              {isHybrid && <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-black uppercase tracking-wider">Hibrit</span>}
                              {!isRemote && !isHybrid && <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-black uppercase tracking-wider">Yüz Yüze</span>}
                              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-black uppercase tracking-wider">{job.location}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  
                  {totalJobPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-100">
                      <button 
                        onClick={() => setJobPage(p => Math.max(1, p - 1))}
                        disabled={jobPage === 1}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
                      >
                        <ArrowLeft className="w-6 h-6" />
                      </button>
                      <div className="bg-slate-100 px-6 h-12 flex items-center rounded-2xl font-black text-gray-600 text-sm">
                        {jobPage} / {totalJobPages}
                      </div>
                      <button 
                        onClick={() => setJobPage(p => Math.min(totalJobPages, p + 1))}
                        disabled={jobPage === totalJobPages}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
                      >
                        <ArrowLeft className="w-6 h-6 rotate-180" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-[32px] p-16 border border-gray-100 text-center shadow-xl shadow-indigo-900/5">
                  <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                  <h3 className="text-gray-900 text-xl font-black mb-2">Aktif İlan Bulunmuyor</h3>
                  <p className="text-gray-500 font-bold">Bu şirketin şu anda aktif bir açık pozisyonu bulunmamaktadır.</p>
                </div>
              )}
            </section>

            {/* AI Büyüme Analizi (Basit ve Anlaşılır) */}
            <section id="ai-analiz" ref={el => { sectionsRef.current['ai-analiz'] = el; }} className="scroll-mt-24">
              <div className="bg-[#0f172a] rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider mb-4">
                        <Zap className="w-4 h-4 fill-slate-950" /> Yıllık İstihdam Grafiği
                      </div>
                      <h2 className="text-3xl font-black text-white">İşe Alım ve Büyüme Hızı</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[350px] bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.yearlyHiring} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                          <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="year" tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                          <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontWeight: 'bold'}} />
                          <Bar dataKey="iseAlinan" name="İşe Alınan Kişi Sayısı" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40}>
                            <LabelList dataKey="iseAlinan" position="top" style={{ fill: '#fff', fontWeight: 'bold', fontSize: '13px' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                        <UserPlus className="w-8 h-8 text-emerald-400 mb-3" />
                        <h4 className="text-slate-400 font-bold text-sm mb-1 uppercase">Yıllık İstihdam Artışı</h4>
                        <p className="text-3xl font-black text-white">+%{(15 + (data.hash % 30)).toFixed(1)}</p>
                      </div>
                      <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                        <FileSearch className="w-8 h-8 text-indigo-400 mb-3" />
                        <h4 className="text-slate-400 font-bold text-sm mb-1 uppercase">İlan Başına Başvuru</h4>
                        <p className="text-3xl font-black text-white">{40 + (data.hash % 150)} Kişi</p>
                      </div>
                      <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                        <MapPin className="w-8 h-8 text-amber-400 mb-3" />
                        <h4 className="text-slate-400 font-bold text-sm mb-1 uppercase">Şube Genişlemesi</h4>
                        <p className="text-3xl font-black text-white">+{2 + (data.hash % 5)} Yeni Lokasyon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sektörel Çalışan Profili (Bar Charts) */}
            <section id="profil" ref={el => { sectionsRef.current['profil'] = el; }} className="scroll-mt-24">
              <h2 className="text-2xl font-black text-gray-900 mb-8 px-2 tracking-tight">Departman ve Mezuniyet Analizi</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Departments Bar Chart */}
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-indigo-900/5 flex flex-col">
                  <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-2.5 h-8 bg-indigo-600 rounded-full" />
                    Çalışılan Departmanlar
                  </h3>
                  <div className="w-full h-[250px] mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.departments} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} interval={0} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                        <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="value" name="Çalışan" radius={[6, 6, 0, 0]} barSize={30}>
                           {data.departments.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3">
                    {data.departments.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                           <span className="font-black text-slate-700">{d.name}</span>
                        </div>
                        <span className="font-black text-indigo-600 text-lg">{d.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Majors Bar Chart */}
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-indigo-900/5 flex flex-col">
                  <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-2.5 h-8 bg-emerald-500 rounded-full" />
                    Mezun Olunan Bölümler
                  </h3>
                  <div className="w-full h-[250px] mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.majors} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} interval={0} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                        <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="value" name="Çalışan" radius={[6, 6, 0, 0]} barSize={30}>
                           {data.majors.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3">
                    {data.majors.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                           <span className="font-black text-slate-700">{m.name}</span>
                        </div>
                        <span className="font-black text-emerald-600 text-lg">{m.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Level Pie Chart with Lists */}
                <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100 shadow-xl shadow-indigo-900/5 md:col-span-2 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 w-full flex flex-col justify-center">
                    <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 w-full">
                      <div className="w-2.5 h-8 bg-amber-500 rounded-full" />
                      Eğitim Seviyesi Dağılımı
                    </h3>
                    
                    <div className="flex flex-col gap-3">
                      {data.edLevels.map((ed, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400 font-black text-lg w-4">{i+1}.</span>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ed.color }} />
                            <span className="font-black text-gray-800 text-[15px]">{ed.name}</span>
                          </div>
                          <span className="font-black text-indigo-600 text-lg">{(ed.value).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-[500px] h-[350px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.edLevels}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={4}
                          dataKey="value"
                          labelLine={true}
                          label={renderCustomizedLabel}
                        >
                          {data.edLevels.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </section>

            {/* Similar Companies */}
            {similarCompanies.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-black text-gray-900 mb-6 px-2">Benzer Sektördeki Diğer Kuruluşlar</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarCompanies.map(sim => {
                    const simLogoKey = resolveLogoFileKey({ name: sim.name, website: sim.website });
                    const simHash = Math.abs(sim.name.split('').reduce((acc: number, char: string) => char.charCodeAt(0) + ((acc << 5) - acc), 0));
                    
                    return (
                      <Link key={sim.id} href={`/company/${sim.id}`} className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all flex items-center gap-5 group">
                        <div className="w-16 h-16 bg-white border border-gray-50 rounded-2xl shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden">
                           {simLogoKey ? (
                              <Image 
                                src={companyLogoSrc(simLogoKey)}
                                alt={sim.name}
                                fill
                                sizes="64px"
                                className="object-contain p-2.5"
                              />
                            ) : null}
                            <div className={`absolute inset-0 w-full h-full flex items-center justify-center font-black text-3xl text-white ${simLogoKey ? 'hidden' : ''}`} style={{ backgroundColor: `hsl(${simHash % 360}, 80%, 55%)` }}>
                               {sim.name.charAt(0)}
                            </div>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-gray-900 text-[16px] truncate group-hover:text-indigo-600 transition-colors tracking-tight">{sim.name}</h4>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest truncate">{sim.sector || 'Genel'}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
