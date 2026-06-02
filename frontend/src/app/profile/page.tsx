"use client";

import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  User, Mail, MapPin, Briefcase, GraduationCap, 
  Settings, FileText, Sparkles, Plus, Edit2,
  Phone, Globe, Calendar, Building, ChevronRight, CheckCircle2,
  Trash2, Award, Book
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, token, setUser } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState("");

  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [eduForm, setEduForm] = useState({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", isContinuing: false });

  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [expForm, setExpForm] = useState({ company: "", title: "", location: "", startDate: "", endDate: "", isContinuing: false, description: "" });

  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [langForm, setLangForm] = useState({ language: "", level: "" });

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({ skillName: "" });

  const [isEditingPref, setIsEditingPref] = useState(false);
  const [prefForm, setPrefForm] = useState({ salaryMin: "", salaryMax: "", currency: "TRY", workModels: "", preferredCities: "" });

  const [isEditingMainProfile, setIsEditingMainProfile] = useState(false);
  const [mainProfileForm, setMainProfileForm] = useState({
    name: "", title: "", phone: "", birthDate: "", gender: "", city: "", district: "",
    militaryStatus: "", driverLicense: "", linkedinUrl: "", githubUrl: "", portfolioUrl: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Lütfen sadece resim dosyası yükleyin.");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Profil fotoğrafı 5MB boyutundan büyük olamaz.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data);
      alert("Profil fotoğrafı başarıyla güncellendi!");
    } catch (error) {
      console.error("Avatar upload error", error);
      alert("Profil fotoğrafı yüklenirken bir hata oluştu.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Lütfen sadece PDF formatında bir dosya yükleyin.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/users/me/upload-cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update the user in store with the AI-parsed fresh data
      setUser(res.data);
      alert("CV başarıyla yüklendi ve Yapay Zeka tarafından analiz edildi!");
    } catch (error) {
      console.error("Upload error", error);
      alert("CV yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCV = async () => {
    if (!confirm("CV'nizi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await api.delete("/users/me/cv");
      setUser(res.data);
      alert("CV başarıyla silindi!");
    } catch (error) {
      console.error("Delete CV error", error);
      alert("CV silinirken bir hata oluştu.");
    }
  };

  const handleSaveAbout = async () => {
    try {
      const res = await api.patch("/users/me/profile", { about: aboutText });
      setUser(res.data);
      setIsEditingAbout(false);
    } catch (err) {
      console.error("About update failed", err);
      alert("Hakkımda kaydedilirken bir hata oluştu.");
    }
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...eduForm,
        endDate: eduForm.isContinuing ? undefined : eduForm.endDate
      };
      const res = await api.patch("/users/me/education", payload);
      setUser(res.data);
      setIsAddingEducation(false);
      setEduForm({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", isContinuing: false });
    } catch (err) {
      console.error("Education add failed", err);
      alert("Eğitim eklenirken bir hata oluştu.");
    }
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...expForm,
        endDate: expForm.isContinuing ? undefined : expForm.endDate
      };
      const res = await api.patch("/users/me/experience", payload);
      setUser(res.data);
      setIsAddingExperience(false);
      setExpForm({ company: "", title: "", location: "", startDate: "", endDate: "", isContinuing: false, description: "" });
    } catch (err) {
      console.error("Experience add failed", err);
      alert("Deneyim eklenirken bir hata oluştu.");
    }
  };

  const handleSaveLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.patch("/users/me/language", langForm);
      setUser(res.data);
      setIsAddingLanguage(false);
      setLangForm({ language: "", level: "" });
    } catch (err) {
      console.error("Language add failed", err);
      alert("Dil eklenirken bir hata oluştu.");
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.skillName.trim()) return;
    try {
      const res = await api.post("/users/me/skill", { skillName: skillForm.skillName.trim() });
      setUser(res.data);
      setIsAddingSkill(false);
      setSkillForm({ skillName: "" });
    } catch (err) {
      console.error("Skill add failed", err);
      alert("Yetenek eklenirken bir hata oluştu.");
    }
  };

  const handleSavePref = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        salaryMin: prefForm.salaryMin ? Number(prefForm.salaryMin) : undefined,
        salaryMax: prefForm.salaryMax ? Number(prefForm.salaryMax) : undefined,
        currency: prefForm.currency || "TRY",
        workModels: prefForm.workModels ? prefForm.workModels.split(",").map(s => s.trim()) : [],
        preferredCities: prefForm.preferredCities ? prefForm.preferredCities.split(",").map(s => s.trim()) : [],
      };
      const res = await api.patch("/users/me/preferences", payload);
      setUser(res.data);
      setIsEditingPref(false);
    } catch (err) {
      console.error("Pref update failed", err);
      alert("Tercihler güncellenirken bir hata oluştu.");
    }
  };

  const handleSaveMainProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mainProfileForm.name !== user?.name) {
        await api.patch("/users/me", { name: mainProfileForm.name });
      }
      
      const profilePayload = {
        title: mainProfileForm.title || undefined,
        phone: mainProfileForm.phone || undefined,
        birthDate: mainProfileForm.birthDate ? new Date(mainProfileForm.birthDate).toISOString() : undefined,
        gender: mainProfileForm.gender || undefined,
        city: mainProfileForm.city || undefined,
        district: mainProfileForm.district || undefined,
        militaryStatus: mainProfileForm.militaryStatus || undefined,
        driverLicense: mainProfileForm.driverLicense || undefined,
        linkedinUrl: mainProfileForm.linkedinUrl || undefined,
        githubUrl: mainProfileForm.githubUrl || undefined,
        portfolioUrl: mainProfileForm.portfolioUrl || undefined,
      };

      const res = await api.patch("/users/me/profile", profilePayload);
      setUser(res.data);
      setIsEditingMainProfile(false);
    } catch (err) {
      console.error("Main profile update failed", err);
      alert("Profil güncellenirken bir hata oluştu.");
    }
  };

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.push("/login");
    } else {
      fetchProfile();
    }
  }, [token, router, hasHydrated]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Genel Bakış", icon: User },
    { id: "education", label: "Eğitim", icon: GraduationCap },
    { id: "experience", label: "Deneyim", icon: Briefcase },
    { id: "skills", label: "Yetenekler & Diller", icon: Award },
    { id: "preferences", label: "Tercihler", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Dynamic Header */}
      <div className="relative h-64 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar: Profile Card */}
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 backdrop-blur-xl">
              <div className="flex flex-col items-center text-center -mt-16 mb-6">
                <div 
                  className="w-28 h-28 bg-gradient-to-tr from-indigo-500 to-violet-500 p-1 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-all duration-300 relative group cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-4xl font-bold text-white shadow-inner overflow-hidden relative">
                    {user?.avatarUrl ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.avatarUrl}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user?.name || "K").charAt(0).toUpperCase()
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Edit2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={avatarInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                  />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">{user.profile?.title || "Yazılım Geliştirici"}</p>
                <div className="flex items-center gap-2 mt-3 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>V2 Pro Profil</span>
                </div>
                
                <button
                  onClick={() => {
                    setMainProfileForm({
                      name: user.name || "",
                      title: user.profile?.title || "",
                      phone: user.profile?.phone || "",
                      birthDate: user.profile?.birthDate ? user.profile.birthDate.substring(0, 10) : "",
                      gender: user.profile?.gender || "",
                      city: user.profile?.city || "",
                      district: user.profile?.district || "",
                      militaryStatus: user.profile?.militaryStatus || "",
                      driverLicense: user.profile?.driverLicense || "",
                      linkedinUrl: user.profile?.linkedinUrl || "",
                      githubUrl: user.profile?.githubUrl || "",
                      portfolioUrl: user.profile?.portfolioUrl || "",
                    });
                    setIsEditingMainProfile(true);
                  }}
                  className="mt-4 px-5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Profili Düzenle
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="truncate">{user.email}</span>
                </div>
                {user.profile?.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span>{user.profile.phone}</span>
                  </div>
                )}
                {user.profile?.city && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>{user.profile.city}, Türkiye</span>
                  </div>
                )}
              </div>

              {/* CV Upload Section */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> Özgeçmiş (CV)
                </h3>
                {user.cvUrl ? (
                  <div className="group relative p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate" title={decodeURIComponent(user.cvUrl)}>
                          {decodeURIComponent(user.cvUrl).split('/').pop()?.replace(/^[a-f0-9\-]+-\d+-/i, '') || "CV"}
                        </p>
                        <p className="text-xs text-slate-500">Yüklendi</p>
                      </div>
                      <button 
                        onClick={handleDeleteCV}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="CV'yi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${encodeURI(user.cvUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full block text-center py-2 bg-white border border-indigo-100 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Görüntüle
                    </a>
                  </div>
                ) : (
                  <div 
                    className={`relative overflow-hidden group rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 transition-all text-center p-6 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                    />
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-transform">
                      {uploading ? (
                        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      ) : (
                        <Sparkles className="w-6 h-6" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {uploading ? "Yapay Zeka CV'ni Analiz Ediyor..." : "Yapay Zeka Destekli CV Yükle"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {uploading ? "Bu işlem 10-15 saniye sürebilir." : "PDF'ini yükle, saniyeler içinde profilini dolduralım!"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 space-y-6 mt-6 md:mt-0">
            {/* Custom Tabs */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      isActive 
                        ? "bg-slate-900 text-white shadow-md" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "opacity-100" : "opacity-70"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Display */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 min-h-[500px]">
              
              {activeTab === "overview" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-black text-slate-900">Hakkımda</h2>
                      {!isEditingAbout && (
                        <button 
                          onClick={() => { setAboutText(user.profile?.about || ""); setIsEditingAbout(true); }}
                          className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Düzenle
                        </button>
                      )}
                    </div>
                    {isEditingAbout ? (
                      <div className="space-y-4">
                        <textarea 
                          value={aboutText}
                          onChange={(e) => setAboutText(e.target.value)}
                          className="w-full h-32 p-4 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm resize-none"
                          placeholder="Kendinizden bahsedin..."
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setIsEditingAbout(false)} 
                            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            İptal
                          </button>
                          <button 
                            onClick={handleSaveAbout} 
                            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                          >
                            Kaydet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {user.profile?.about || "Henüz kendinizden bahsetmediniz. Şirketlerin sizi daha iyi tanıması için kısa bir özet ekleyin."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "education" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900">Eğitim Geçmişi</h2>
                    {!isAddingEducation && (
                      <button 
                        onClick={() => setIsAddingEducation(true)}
                        className="text-sm font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md"
                      >
                        <Plus className="w-4 h-4" /> Eğitim Ekle
                      </button>
                    )}
                  </div>

                  {isAddingEducation && (
                    <form onSubmit={handleSaveEducation} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Yeni Eğitim Ekle</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Okul / Üniversite</label>
                          <input required type="text" value={eduForm.school} onChange={e => setEduForm({...eduForm, school: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Örn: Orta Doğu Teknik Üniversitesi" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Derece</label>
                          <input required type="text" value={eduForm.degree} onChange={e => setEduForm({...eduForm, degree: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Örn: Lisans" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Bölüm</label>
                          <input required type="text" value={eduForm.fieldOfStudy} onChange={e => setEduForm({...eduForm, fieldOfStudy: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Örn: Bilgisayar Mühendisliği" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Başlangıç Tarihi</label>
                          <input required type="date" value={eduForm.startDate} onChange={e => setEduForm({...eduForm, startDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Bitiş Tarihi</label>
                          <input required={!eduForm.isContinuing} disabled={eduForm.isContinuing} type="date" value={eduForm.endDate} onChange={e => setEduForm({...eduForm, endDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none disabled:opacity-50 disabled:bg-slate-100" />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                          <input type="checkbox" id="edu-continuing" checked={eduForm.isContinuing} onChange={e => setEduForm({...eduForm, isContinuing: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                          <label htmlFor="edu-continuing" className="text-sm font-semibold text-slate-700 cursor-pointer">Hala devam ediyorum</label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsAddingEducation(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">Kaydet</button>
                      </div>
                    </form>
                  )}
                  
                  {user.education && user.education.length > 0 ? (
                    <div className="space-y-4">
                      {user.education.map((edu: any) => (
                        <div key={edu.id} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                              <Book className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{edu.school}</h3>
                              <p className="text-slate-600 font-medium mt-0.5">{edu.degree} - {edu.fieldOfStudy}</p>
                              <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 font-medium">
                                <Calendar className="w-4 h-4" />
                                {new Date(edu.startDate).getFullYear()} - {edu.isContinuing ? "Devam Ediyor" : new Date(edu.endDate).getFullYear()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-slate-900">Eğitim Bilgisi Yok</h3>
                      <p className="text-sm text-slate-500 mt-1">Eğitim geçmişinizi ekleyerek profilinizi güçlendirin.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "experience" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900">İş Deneyimleri</h2>
                    {!isAddingExperience && (
                      <button 
                        onClick={() => setIsAddingExperience(true)}
                        className="text-sm font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md"
                      >
                        <Plus className="w-4 h-4" /> Deneyim Ekle
                      </button>
                    )}
                  </div>

                  {isAddingExperience && (
                    <form onSubmit={handleSaveExperience} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Yeni Deneyim Ekle</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Şirket Adı</label>
                          <input required type="text" value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Unvan</label>
                          <input required type="text" value={expForm.title} onChange={e => setExpForm({...expForm, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Konum</label>
                          <input type="text" value={expForm.location} onChange={e => setExpForm({...expForm, location: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Örn: İstanbul, Türkiye" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Başlangıç Tarihi</label>
                          <input required type="date" value={expForm.startDate} onChange={e => setExpForm({...expForm, startDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Bitiş Tarihi</label>
                          <input required={!expForm.isContinuing} disabled={expForm.isContinuing} type="date" value={expForm.endDate} onChange={e => setExpForm({...expForm, endDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none disabled:opacity-50 disabled:bg-slate-100" />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                          <input type="checkbox" id="exp-continuing" checked={expForm.isContinuing} onChange={e => setExpForm({...expForm, isContinuing: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                          <label htmlFor="exp-continuing" className="text-sm font-semibold text-slate-700 cursor-pointer">Hala devam ediyorum</label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Açıklama</label>
                          <textarea value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none h-24 resize-none" placeholder="Bu roldeki görevleriniz ve başarılarınız..." />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsAddingExperience(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">Kaydet</button>
                      </div>
                    </form>
                  )}

                  {user.experience && user.experience.length > 0 ? (
                    <div className="space-y-4">
                      {user.experience.map((exp: any) => (
                        <div key={exp.id} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                              <Building className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>
                              <p className="text-slate-600 font-medium mt-0.5">{exp.company} {exp.location && `• ${exp.location}`}</p>
                              <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 font-medium">
                                <Calendar className="w-4 h-4" />
                                {new Date(exp.startDate).getFullYear()} - {exp.isContinuing ? "Devam Ediyor" : new Date(exp.endDate).getFullYear()}
                              </div>
                              {exp.description && (
                                <p className="mt-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-slate-900">Deneyim Bilgisi Yok</h3>
                      <p className="text-sm text-slate-500 mt-1">Geçmiş iş deneyimlerinizi ekleyerek profilinizi güçlendirin.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "skills" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Skills Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-black text-slate-900">Yetenekler</h2>
                      {!isAddingSkill && (
                        <button 
                          onClick={() => setIsAddingSkill(true)}
                          className="text-sm font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md"
                        >
                          <Plus className="w-4 h-4" /> Yetenek Ekle
                        </button>
                      )}
                    </div>

                    {isAddingSkill && (
                      <form onSubmit={handleSaveSkill} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Yetenek Adı</label>
                          <input required type="text" value={skillForm.skillName} onChange={e => setSkillForm({ skillName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Örn: Node.js" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setIsAddingSkill(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
                          <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">Kaydet</button>
                        </div>
                      </form>
                    )}
                    {user.userSkills && user.userSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.userSkills.map((us: any, idx: number) => (
                          <div key={us.id || us.skillId || idx} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold">
                            {us.skill.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Henüz yetenek eklenmemiş. CV yükleyerek yapay zekanın yeteneklerinizi analiz etmesini sağlayabilirsiniz.</p>
                    )}
                  </div>

                  {/* Languages Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-black text-slate-900">Yabancı Diller</h2>
                      {!isAddingLanguage && (
                        <button 
                          onClick={() => setIsAddingLanguage(true)}
                          className="text-sm font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md"
                        >
                          <Plus className="w-4 h-4" /> Dil Ekle
                        </button>
                      )}
                    </div>
                    
                    {isAddingLanguage && (
                      <form onSubmit={handleSaveLanguage} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dil</label>
                            <input required type="text" value={langForm.language} onChange={e => setLangForm({...langForm, language: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Örn: İngilizce" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Seviye</label>
                            <select required value={langForm.level} onChange={e => setLangForm({...langForm, level: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none">
                              <option value="">Seçiniz...</option>
                              <option value="A1">A1 - Başlangıç</option>
                              <option value="A2">A2 - Temel</option>
                              <option value="B1">B1 - Orta</option>
                              <option value="B2">B2 - İyi</option>
                              <option value="C1">C1 - İleri</option>
                              <option value="C2">C2 - Anadil Seviyesi</option>
                              <option value="Native">Anadil</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setIsAddingLanguage(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
                          <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">Kaydet</button>
                        </div>
                      </form>
                    )}

                    {user.languages && user.languages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {user.languages.map((lang: any) => (
                          <div key={lang.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                            <div className="font-bold text-slate-900">{lang.language}</div>
                            <div className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">{lang.level}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mt-2">Eklenmiş dil bilgisi bulunamadı.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900">İş Tercihleri</h2>
                    {!isEditingPref && (
                      <button 
                        onClick={() => {
                          setPrefForm({
                            salaryMin: user.preferences?.salaryMin?.toString() || "",
                            salaryMax: user.preferences?.salaryMax?.toString() || "",
                            currency: user.preferences?.currency || "TRY",
                            workModels: user.preferences?.workModels?.join(", ") || "",
                            preferredCities: user.preferences?.preferredCities?.join(", ") || ""
                          });
                          setIsEditingPref(true);
                        }}
                        className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Düzenle
                      </button>
                    )}
                  </div>

                  {isEditingPref ? (
                    <form onSubmit={handleSavePref} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Min Maaş Beklentisi</label>
                          <input type="number" value={prefForm.salaryMin} onChange={e => setPrefForm({...prefForm, salaryMin: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Max Maaş Beklentisi</label>
                          <input type="number" value={prefForm.salaryMax} onChange={e => setPrefForm({...prefForm, salaryMax: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Para Birimi</label>
                          <select value={prefForm.currency} onChange={e => setPrefForm({...prefForm, currency: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none">
                            <option value="TRY">TRY (₺)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Çalışma Şekli (Virgülle Ayırın)</label>
                          <input type="text" value={prefForm.workModels} onChange={e => setPrefForm({...prefForm, workModels: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Örn: remote, hybrid" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tercih Edilen Şehirler (Virgülle Ayırın)</label>
                          <input type="text" value={prefForm.preferredCities} onChange={e => setPrefForm({...prefForm, preferredCities: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Örn: İstanbul, Ankara" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsEditingPref(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">Kaydet</button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Maaş Beklentisi</h3>
                          <div className="text-sm font-semibold text-slate-900">
                            {user.preferences?.salaryMin || user.preferences?.salaryMax 
                              ? `${user.preferences.salaryMin || 0} - ${user.preferences.salaryMax || "Belirtilmemiş"} ${user.preferences.currency}`
                              : "Belirtilmemiş"}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Çalışma Şekli</h3>
                          <div className="text-sm font-semibold text-slate-900">
                            {user.preferences?.workModels?.length > 0 ? user.preferences.workModels.join(", ") : "Fark Etmez"}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Tercih Edilen Şehirler</h3>
                          <div className="flex flex-wrap gap-2">
                            {user.preferences?.preferredCities?.length > 0 ? (
                              user.preferences.preferredCities.map((city: string) => (
                                <span key={city} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold">{city}</span>
                              ))
                            ) : (
                              <span className="text-sm font-semibold text-slate-900">Fark Etmez</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Edit Modal */}
      {isEditingMainProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative my-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Profil Bilgilerini Düzenle</h2>
            
            <form onSubmit={handleSaveMainProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">E-posta Adresi <span className="text-slate-400 font-normal ml-1">(Sadece Okunabilir)</span></label>
                  <div className="relative group">
                    <input readOnly type="email" value={user.email} className="w-full px-4 py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed outline-none font-semibold" />
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
                      E-posta adresi değiştirilemez.
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ad Soyad <span className="text-red-500 ml-1">* (Zorunlu)</span></label>
                  <input required type="text" value={mainProfileForm.name} onChange={e => setMainProfileForm({...mainProfileForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Unvan (Rol) <span className="text-slate-400 font-normal ml-1">(İsteğe Bağlı)</span></label>
                  <input type="text" value={mainProfileForm.title} onChange={e => setMainProfileForm({...mainProfileForm, title: e.target.value})} placeholder="Örn: Yazılım Geliştirici" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Telefon <span className="text-slate-400 font-normal ml-1">(İsteğe Bağlı)</span></label>
                  <input type="text" value={mainProfileForm.phone} onChange={e => setMainProfileForm({...mainProfileForm, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Doğum Tarihi <span className="text-slate-400 font-normal ml-1">(İsteğe Bağlı)</span></label>
                  <input type="date" value={mainProfileForm.birthDate} onChange={e => setMainProfileForm({...mainProfileForm, birthDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cinsiyet <span className="text-slate-400 font-normal ml-1">(İsteğe Bağlı)</span></label>
                  <select value={mainProfileForm.gender} onChange={e => setMainProfileForm({...mainProfileForm, gender: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold">
                    <option value="">Seçiniz</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Askerlik Durumu <span className="text-slate-400 font-normal ml-1">(İsteğe Bağlı)</span></label>
                  <select value={mainProfileForm.militaryStatus} onChange={e => setMainProfileForm({...mainProfileForm, militaryStatus: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold">
                    <option value="">Seçiniz</option>
                    <option value="Yapıldı">Yapıldı</option>
                    <option value="Muaf">Muaf</option>
                    <option value="Tecilli">Tecilli</option>
                    <option value="Yapılmadı">Yapılmadı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Şehir <span className="text-slate-400 font-normal ml-1">(İsteğe Bağlı)</span></label>
                  <input type="text" value={mainProfileForm.city} onChange={e => setMainProfileForm({...mainProfileForm, city: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">İlçe <span className="text-slate-400 font-normal ml-1">(İsteğe Bağlı)</span></label>
                  <input type="text" value={mainProfileForm.district} onChange={e => setMainProfileForm({...mainProfileForm, district: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sürücü Belgesi <span className="text-slate-400 font-normal ml-1">(İsteğe Bağlı)</span></label>
                  <input type="text" value={mainProfileForm.driverLicense} onChange={e => setMainProfileForm({...mainProfileForm, driverLicense: e.target.value})} placeholder="Örn: B, A2" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Sosyal Medya ve Linkler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">LinkedIn</label>
                    <input type="url" value={mainProfileForm.linkedinUrl} onChange={e => setMainProfileForm({...mainProfileForm, linkedinUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">GitHub</label>
                    <input type="url" value={mainProfileForm.githubUrl} onChange={e => setMainProfileForm({...mainProfileForm, githubUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kişisel Web Sitesi / Portfolio</label>
                    <input type="url" value={mainProfileForm.portfolioUrl} onChange={e => setMainProfileForm({...mainProfileForm, portfolioUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-6">
                <button type="button" onClick={() => setIsEditingMainProfile(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">İptal</button>
                <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
