"use client";

import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  User, Mail, MapPin, Briefcase, GraduationCap,
  Settings, FileText, Sparkles, Plus, Edit2,
  Phone, Globe, Calendar, Building, Trash2,
  Award, Book, FolderKanban, Languages, X,
  ChevronDown, Check, AlertTriangle, Eye, Upload,
  ExternalLink, Shield, Clock
} from "lucide-react";

// =================================================================
// TYPES
// =================================================================
type MergePreview = {
  about: any;
  education: { new: any[]; updated: any[]; ignored: any[] };
  experience: { new: any[]; updated: any[]; ignored: any[] };
  projects: { new: any[]; updated: any[]; ignored: any[] };
  certifications: { new: any[]; updated: any[]; ignored: any[] };
  skills: { new: any[]; ignored: any[] };
  languages: { new: any[]; updated: any[]; ignored: any[] };
};

// =================================================================
// SOURCE BADGE COMPONENT
// =================================================================
function SourceBadge({ source }: { source: string }) {
  if (source === "CV") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs md:text-sm font-bold rounded-full bg-violet-50 text-violet-600 border border-violet-100">
        <FileText className="w-2.5 h-2.5" /> CV
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs md:text-sm font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
      <Edit2 className="w-2.5 h-2.5" /> Manuel
    </span>
  );
}

// =================================================================
// LIGHTBOX COMPONENT
// =================================================================
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// =================================================================
// DELETE CONFIRM DIALOG
// =================================================================
function DeleteConfirm({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Silme Onayı</h3>
            <p className="text-sm text-slate-500">{title}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            İptal
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// SECTION MODAL COMPONENT
// =================================================================
function SectionModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-10 h-12 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// =================================================================
// MAIN PROFILE PAGE
// =================================================================
export default function ProfilePage() {
  const { user, token, setUser } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Lightbox state
  const [showLightbox, setShowLightbox] = useState(false);

  // Edit states
  const [editModal, setEditModal] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; title: string } | null>(null);

  // CV Merge state
  const [mergePreview, setMergePreview] = useState<MergePreview | null>(null);
  const [mergeCvId, setMergeCvId] = useState<string | null>(null);
  const [mergeRejected, setMergeRejected] = useState<Set<string>>(new Set());

  // Form states
  const [aboutText, setAboutText] = useState("");
  const [eduForm, setEduForm] = useState({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", isContinuing: false, grade: "" });
  const [expForm, setExpForm] = useState({ company: "", title: "", location: "", startDate: "", endDate: "", isContinuing: false, description: "" });
  const [projForm, setProjForm] = useState({ name: "", description: "", url: "", technologies: "", startDate: "", endDate: "", isContinuing: false });
  const [certForm, setCertForm] = useState({ name: "", issuer: "", issueDate: "", expirationDate: "", credentialUrl: "" });
  const [langForm, setLangForm] = useState({ language: "", level: "" });
  const [skillForm, setSkillForm] = useState({ skillName: "" });
  const [prefForm, setPrefForm] = useState({ salaryMin: "", salaryMax: "", currency: "TRY", workModels: "", preferredCities: "" });
  const [mainProfileForm, setMainProfileForm] = useState({
    name: "", title: "", phone: "", birthDate: "", gender: "", city: "", district: "",
    militaryStatus: "", driverLicense: "", linkedinUrl: "", githubUrl: "", portfolioUrl: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace('/api', '');

  // =================================================================
  // DATA FETCHING
  // =================================================================
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (error: any) {
      console.error("Failed to fetch profile", error);
      if (error.response?.status === 404 || error.response?.status === 401) {
        useAuthStore.getState().clear();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [setUser, router]);

  useEffect(() => { setHasHydrated(true); }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) { router.push("/login"); }
    else { fetchProfile(); }
  }, [token, router, hasHydrated, fetchProfile]);

  // =================================================================
  // HANDLERS
  // =================================================================

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Lütfen sadece resim dosyası yükleyin.");
    if (file.size > 5 * 1024 * 1024) return alert("Profil fotoğrafı 5MB'dan büyük olamaz.");
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/users/me/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUser(res.data);
    } catch { alert("Profil fotoğrafı yüklenirken bir hata oluştu."); }
    finally { setUploadingAvatar(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return alert("Lütfen sadece PDF formatında bir dosya yükleyin.");
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/users/me/upload-cv", formData, { headers: { "Content-Type": "multipart/form-data" } });
      // New flow: show merge preview
      if (res.data.mergePreview) {
        setMergePreview(res.data.mergePreview);
        setMergeCvId(res.data.cvId);
        setMergeRejected(new Set());
      } else if (res.data.aiFailed) {
        alert("CV dosyanız yüklendi ancak formatından dolayı içeriği okunamadı. Lütfen bilgilerinizi manuel giriniz.");
      }
      if (res.data.user) setUser(res.data.user);
    } catch { alert("CV yüklenirken bir hata oluştu."); }
    finally { setUploading(false); }
  };

  const handleApplyMerge = async () => {
    if (!mergeCvId) return;
    try {
      const res = await api.post(`/users/me/cv/${mergeCvId}/auto-merge`, {
        rejectedItems: Array.from(mergeRejected),
      });
      setUser(res.data);
      setMergePreview(null);
      setMergeCvId(null);
      alert("CV verileri başarıyla profille birleştirildi!");
    } catch { alert("Birleştirme sırasında bir hata oluştu."); }
  };

  const handleDeleteCV = async () => {
    if (!confirm("CV dosyasını silmek istediğinize emin misiniz? Profil verileriniz korunacaktır.")) return;
    try {
      const res = await api.delete("/users/me/cv");
      setUser(res.data);
    } catch { alert("CV silinirken bir hata oluştu."); }
  };

  // Generic delete handler
  const handleDelete = async (type: string, id: string) => {
    try {
      let endpoint = "";
      switch (type) {
        case "education": endpoint = `/users/me/education/${id}`; break;
        case "experience": endpoint = `/users/me/experience/${id}`; break;
        case "project": endpoint = `/users/me/project/${id}`; break;
        case "certification": endpoint = `/users/me/certification/${id}`; break;
        case "language": endpoint = `/users/me/language/${id}`; break;
        case "skill": endpoint = `/users/me/skill/${id}`; break;
        default: return;
      }
      const res = await api.delete(endpoint);
      setUser(res.data);
      setDeleteConfirm(null);
    } catch { alert("Silme işlemi sırasında bir hata oluştu."); }
  };

  // Save handlers
  const handleSaveAbout = async () => {
    try {
      const res = await api.patch("/users/me/profile", { about: aboutText });
      setUser(res.data);
      setEditModal(null);
    } catch { alert("Hakkımda kaydedilirken bir hata oluştu."); }
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...eduForm, endDate: eduForm.isContinuing ? undefined : eduForm.endDate };
      if (editId) {
        const res = await api.patch(`/users/me/education/${editId}`, payload);
        setUser(res.data);
      } else {
        const res = await api.post("/users/me/education", payload);
        setUser(res.data);
      }
      setEditModal(null); setEditId(null);
      setEduForm({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", isContinuing: false, grade: "" });
    } catch { alert("Eğitim kaydedilirken bir hata oluştu."); }
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...expForm, endDate: expForm.isContinuing ? undefined : expForm.endDate };
      if (editId) {
        const res = await api.patch(`/users/me/experience/${editId}`, payload);
        setUser(res.data);
      } else {
        const res = await api.post("/users/me/experience", payload);
        setUser(res.data);
      }
      setEditModal(null); setEditId(null);
      setExpForm({ company: "", title: "", location: "", startDate: "", endDate: "", isContinuing: false, description: "" });
    } catch { alert("Deneyim kaydedilirken bir hata oluştu."); }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...projForm,
        technologies: projForm.technologies ? projForm.technologies.split(",").map(s => s.trim()).filter(Boolean) : [],
        endDate: projForm.isContinuing ? undefined : projForm.endDate,
        startDate: projForm.startDate || undefined,
      };
      if (editId) {
        const res = await api.patch(`/users/me/project/${editId}`, payload);
        setUser(res.data);
      } else {
        const res = await api.post("/users/me/project", payload);
        setUser(res.data);
      }
      setEditModal(null); setEditId(null);
      setProjForm({ name: "", description: "", url: "", technologies: "", startDate: "", endDate: "", isContinuing: false });
    } catch { alert("Proje kaydedilirken bir hata oluştu."); }
  };

  const handleSaveCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...certForm, issueDate: certForm.issueDate || undefined, expirationDate: certForm.expirationDate || undefined };
      if (editId) {
        const res = await api.patch(`/users/me/certification/${editId}`, payload);
        setUser(res.data);
      } else {
        const res = await api.post("/users/me/certification", payload);
        setUser(res.data);
      }
      setEditModal(null); setEditId(null);
      setCertForm({ name: "", issuer: "", issueDate: "", expirationDate: "", credentialUrl: "" });
    } catch { alert("Sertifika kaydedilirken bir hata oluştu."); }
  };

  const handleSaveLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await api.patch(`/users/me/language/${editId}`, langForm);
        setUser(res.data);
      } else {
        const res = await api.post("/users/me/language", langForm);
        setUser(res.data);
      }
      setEditModal(null); setEditId(null);
      setLangForm({ language: "", level: "" });
    } catch { alert("Dil kaydedilirken bir hata oluştu."); }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.skillName.trim()) return;
    try {
      const res = await api.post("/users/me/skill", { skillName: skillForm.skillName.trim() });
      setUser(res.data);
      setEditModal(null);
      setSkillForm({ skillName: "" });
    } catch { alert("Yetenek eklenirken bir hata oluştu."); }
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
      setEditModal(null);
    } catch { alert("Tercihler güncellenirken bir hata oluştu."); }
  };

  const handleSaveMainProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mainProfileForm.name !== user?.name) {
        await api.patch("/users/me", { name: mainProfileForm.name });
      }
      const profilePayload: any = {};
      for (const [k, v] of Object.entries(mainProfileForm)) {
        if (k === "name") continue;
        if (k === "birthDate" && v) { profilePayload[k] = new Date(v).toISOString(); continue; }
        if (v) profilePayload[k] = v;
      }
      const res = await api.patch("/users/me/profile", profilePayload);
      setUser(res.data);
      setEditModal(null);
    } catch { alert("Profil güncellenirken bir hata oluştu."); }
  };

  // =================================================================
  // LOADING STATE
  // =================================================================
  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const completionScore = user.profileCompletionScore;

  const tabs = [
    { id: "overview", label: "Genel Bakış", icon: User },
    { id: "education", label: "Eğitim", icon: GraduationCap },
    { id: "experience", label: "Deneyim", icon: Briefcase },
    { id: "projects", label: "Projeler", icon: FolderKanban },
    { id: "certifications", label: "Sertifikalar", icon: Award },
    { id: "skills", label: "Yetenekler", icon: Sparkles },
    { id: "languages", label: "Diller", icon: Languages },
    { id: "preferences", label: "Tercihler", icon: Settings },
  ];

  // =================================================================
  // RENDER
  // =================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="relative h-56 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ======================== LEFT SIDEBAR ======================== */}
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex flex-col items-center text-center -mt-16 mb-5">
                {/* Profile Photo - Click opens lightbox */}
                <div
                  className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 rounded-2xl shadow-lg mb-3 cursor-pointer transform hover:scale-105 transition-all duration-300"
                  onClick={() => user?.avatarUrl && setShowLightbox(true)}
                >
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={`${API_BASE}${user.avatarUrl}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (user?.name || "K").charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                <h1 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                <p className="text-slate-500 text-sm font-medium mt-0.5">{user.profile?.title || "Belirtilmemiş"}</p>

                {/* Completion Score */}
                {completionScore && (
                  <div className="w-full mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-500">Profil Tamamlanma</span>
                      <span className="font-black text-indigo-600">%{completionScore.score}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${completionScore.score}%` }}></div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setMainProfileForm({
                      name: user.name || "", title: user.profile?.title || "",
                      phone: user.profile?.phone || "", birthDate: user.profile?.birthDate ? user.profile.birthDate.substring(0, 10) : "",
                      gender: user.profile?.gender || "", city: user.profile?.city || "", district: user.profile?.district || "",
                      militaryStatus: user.profile?.militaryStatus || "", driverLicense: user.profile?.driverLicense || "",
                      linkedinUrl: user.profile?.linkedinUrl || "", githubUrl: user.profile?.githubUrl || "", portfolioUrl: user.profile?.portfolioUrl || "",
                    });
                    setEditModal("mainProfile");
                  }}
                  className="mt-3 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Profili Düzenle
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Mail className="w-3.5 h-3.5" /></div>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                {user.profile?.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Phone className="w-3.5 h-3.5" /></div>
                    <span className="text-xs">{user.profile.phone}</span>
                  </div>
                )}
                {user.profile?.city && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><MapPin className="w-3.5 h-3.5" /></div>
                    <span className="text-xs">{user.profile.city}{user.profile.district ? `, ${user.profile.district}` : ""}</span>
                  </div>
                )}
              </div>

              {/* CV Section */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" /> Özgeçmiş (CV)
                </h3>
                {user.cvUrl ? (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">CV Yüklendi</p>
                        <p className="text-xs md:text-sm text-slate-500">v{user.cvVersions?.[0]?.version || 1}</p>
                      </div>
                      <button onClick={handleDeleteCV} className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="CV'yi Sil">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <a
                      href={`${API_BASE}${user.cvUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full block text-center py-1.5 bg-white border border-indigo-100 rounded-lg text-xs md:text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Görüntüle
                    </a>
                  </div>
                ) : (
                  <div
                    className={`group rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 transition-all text-center p-4 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <div className="w-10 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-transform">
                      {uploading ? <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div> : <Upload className="w-5 h-5" />}
                    </div>
                    <p className="text-xs font-bold text-slate-700">{uploading ? "AI Analiz Ediyor..." : "CV Yükle"}</p>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5">{uploading ? "10-15 saniye sürebilir." : "PDF yükle, profili dolduralım!"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ======================== RIGHT CONTENT ======================== */}
          <div className="flex-1 space-y-5 mt-6 md:mt-0">
            {/* Tabs */}
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "opacity-100" : "opacity-70"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 min-h-[450px]">

              {/* ===== OVERVIEW TAB ===== */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-black text-slate-900">Hakkımda</h2>
                      <button
                        onClick={() => { setAboutText(user.profile?.about || ""); setEditModal("about"); }}
                        className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Düzenle
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {user.profile?.about || "Henüz kendinizden bahsetmediniz. Şirketlerin sizi daha iyi tanıması için bir özet ekleyin."}
                    </p>
                  </div>

                  {/* Suggestions */}
                  {completionScore && completionScore.suggestions.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <h3 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Profilinizi Güçlendirin
                      </h3>
                      <ul className="space-y-1">
                        {completionScore.suggestions.slice(0, 3).map((s, i) => (
                          <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                            <ChevronDown className="w-3 h-3 -rotate-90" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* ===== EDUCATION TAB ===== */}
              {activeTab === "education" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900">Eğitim Geçmişi</h2>
                    <button onClick={() => { setEditId(null); setEduForm({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", isContinuing: false, grade: "" }); setEditModal("education"); }}
                      className="text-xs font-bold bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-md">
                      <Plus className="w-3.5 h-3.5" /> Ekle
                    </button>
                  </div>
                  {user.education && user.education.length > 0 ? (
                    <div className="space-y-3">
                      {user.education.map((edu: any) => (
                        <div key={edu.id} className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all">
                          <div className="flex gap-3">
                            <div className="w-10 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0"><Book className="w-5 h-5" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 truncate">{edu.school}</h3>
                                <SourceBadge source={edu.sourceType} />
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">{edu.degree} - {edu.fieldOfStudy}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 font-medium">
                                <Calendar className="w-3 h-3" />
                                {new Date(edu.startDate).getFullYear()} - {edu.isContinuing ? "Devam Ediyor" : edu.endDate ? new Date(edu.endDate).getFullYear() : ""}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditId(edu.id); setEduForm({ school: edu.school, degree: edu.degree, fieldOfStudy: edu.fieldOfStudy, startDate: edu.startDate?.substring(0, 10), endDate: edu.endDate?.substring(0, 10) || "", isContinuing: edu.isContinuing, grade: edu.grade || "" }); setEditModal("education"); }}
                                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteConfirm({ type: "education", id: edu.id, title: `"${edu.school}" eğitimini silmek istediğinize emin misiniz?` })}
                                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <GraduationCap className="w-10 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">Eğitim Bilgisi Yok</p>
                      <p className="text-xs text-slate-500 mt-1">Eğitim geçmişinizi ekleyerek profilinizi güçlendirin.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== EXPERIENCE TAB ===== */}
              {activeTab === "experience" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900">İş Deneyimleri</h2>
                    <button onClick={() => { setEditId(null); setExpForm({ company: "", title: "", location: "", startDate: "", endDate: "", isContinuing: false, description: "" }); setEditModal("experience"); }}
                      className="text-xs font-bold bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-md">
                      <Plus className="w-3.5 h-3.5" /> Ekle
                    </button>
                  </div>
                  {user.experience && user.experience.length > 0 ? (
                    <div className="space-y-3">
                      {user.experience.map((exp: any) => (
                        <div key={exp.id} className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all">
                          <div className="flex gap-3">
                            <div className="w-10 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0"><Building className="w-5 h-5" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 truncate">{exp.title}</h3>
                                <SourceBadge source={exp.sourceType} />
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">{exp.company} {exp.location && `• ${exp.location}`}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 font-medium">
                                <Calendar className="w-3 h-3" />
                                {new Date(exp.startDate).getFullYear()} - {exp.isContinuing ? "Devam Ediyor" : exp.endDate ? new Date(exp.endDate).getFullYear() : ""}
                              </div>
                              {exp.description && <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">{exp.description}</p>}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditId(exp.id); setExpForm({ company: exp.company, title: exp.title, location: exp.location || "", startDate: exp.startDate?.substring(0, 10), endDate: exp.endDate?.substring(0, 10) || "", isContinuing: exp.isContinuing, description: exp.description || "" }); setEditModal("experience"); }}
                                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteConfirm({ type: "experience", id: exp.id, title: `"${exp.title}" deneyimini silmek istediğinize emin misiniz?` })}
                                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <Briefcase className="w-10 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">Deneyim Bilgisi Yok</p>
                      <p className="text-xs text-slate-500 mt-1">İş deneyimlerinizi ekleyerek profilinizi güçlendirin.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== PROJECTS TAB ===== */}
              {activeTab === "projects" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900">Projeler</h2>
                    <button onClick={() => { setEditId(null); setProjForm({ name: "", description: "", url: "", technologies: "", startDate: "", endDate: "", isContinuing: false }); setEditModal("project"); }}
                      className="text-xs font-bold bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-md">
                      <Plus className="w-3.5 h-3.5" /> Ekle
                    </button>
                  </div>
                  {user.projects && user.projects.length > 0 ? (
                    <div className="space-y-3">
                      {user.projects.map((proj: any) => (
                        <div key={proj.id} className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all">
                          <div className="flex gap-3">
                            <div className="w-10 h-12 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center shrink-0"><FolderKanban className="w-5 h-5" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 truncate">{proj.name}</h3>
                                <SourceBadge source={proj.sourceType} />
                              </div>
                              {proj.description && <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{proj.description}</p>}
                              {proj.technologies?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {proj.technologies.map((t: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs md:text-sm font-bold">{t}</span>
                                  ))}
                                </div>
                              )}
                              {proj.url && (
                                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-indigo-600 font-medium hover:underline">
                                  <ExternalLink className="w-3 h-3" /> Projeyi Görüntüle
                                </a>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditId(proj.id); setProjForm({ name: proj.name, description: proj.description || "", url: proj.url || "", technologies: proj.technologies?.join(", ") || "", startDate: proj.startDate?.substring(0, 10) || "", endDate: proj.endDate?.substring(0, 10) || "", isContinuing: proj.isContinuing }); setEditModal("project"); }}
                                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteConfirm({ type: "project", id: proj.id, title: `"${proj.name}" projesini silmek istediğinize emin misiniz?` })}
                                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <FolderKanban className="w-10 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">Proje Bilgisi Yok</p>
                      <p className="text-xs text-slate-500 mt-1">Kişisel ve profesyonel projelerinizi ekleyin.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== CERTIFICATIONS TAB ===== */}
              {activeTab === "certifications" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900">Sertifikalar</h2>
                    <button onClick={() => { setEditId(null); setCertForm({ name: "", issuer: "", issueDate: "", expirationDate: "", credentialUrl: "" }); setEditModal("certification"); }}
                      className="text-xs font-bold bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-md">
                      <Plus className="w-3.5 h-3.5" /> Ekle
                    </button>
                  </div>
                  {user.certifications && user.certifications.length > 0 ? (
                    <div className="space-y-3">
                      {user.certifications.map((cert: any) => (
                        <div key={cert.id} className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all">
                          <div className="flex gap-3">
                            <div className="w-10 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0"><Award className="w-5 h-5" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 truncate">{cert.name}</h3>
                                <SourceBadge source={cert.sourceType} />
                              </div>
                              {cert.issuer && <p className="text-xs text-slate-600 mt-0.5">{cert.issuer}</p>}
                              {cert.issueDate && (
                                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 font-medium">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(cert.issueDate).toLocaleDateString("tr-TR", { year: "numeric", month: "long" })}
                                </div>
                              )}
                              {cert.credentialUrl && (
                                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-indigo-600 font-medium hover:underline">
                                  <ExternalLink className="w-3 h-3" /> Doğrula
                                </a>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditId(cert.id); setCertForm({ name: cert.name, issuer: cert.issuer || "", issueDate: cert.issueDate?.substring(0, 10) || "", expirationDate: cert.expirationDate?.substring(0, 10) || "", credentialUrl: cert.credentialUrl || "" }); setEditModal("certification"); }}
                                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteConfirm({ type: "certification", id: cert.id, title: `"${cert.name}" sertifikasını silmek istediğinize emin misiniz?` })}
                                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <Award className="w-10 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">Sertifika Bilgisi Yok</p>
                      <p className="text-xs text-slate-500 mt-1">Sertifikalarınızı ekleyerek yetkinliğinizi kanıtlayın.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== SKILLS TAB ===== */}
              {activeTab === "skills" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900">Yetenekler</h2>
                    <button onClick={() => { setSkillForm({ skillName: "" }); setEditModal("skill"); }}
                      className="text-xs font-bold bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-md">
                      <Plus className="w-3.5 h-3.5" /> Ekle
                    </button>
                  </div>
                  {user.userSkills && user.userSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.userSkills.map((us: any, idx: number) => (
                        <div key={us.skillId || idx} className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:border-indigo-200 transition-colors">
                          {us.skill.name}
                          <SourceBadge source={us.sourceType} />
                          <button onClick={() => setDeleteConfirm({ type: "skill", id: us.skillId, title: `"${us.skill.name}" yeteneğini silmek istediğinize emin misiniz?` })}
                            className="w-4 h-4 rounded-full hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <Sparkles className="w-10 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">Yetenek Bilgisi Yok</p>
                      <p className="text-xs text-slate-500 mt-1">CV yükleyerek veya manuel olarak yeteneklerinizi ekleyin.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== LANGUAGES TAB ===== */}
              {activeTab === "languages" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900">Yabancı Diller</h2>
                    <button onClick={() => { setEditId(null); setLangForm({ language: "", level: "" }); setEditModal("language"); }}
                      className="text-xs font-bold bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-md">
                      <Plus className="w-3.5 h-3.5" /> Ekle
                    </button>
                  </div>
                  {user.languages && user.languages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {user.languages.map((lang: any) => (
                        <div key={lang.id} className="group flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{lang.language}</span>
                            <SourceBadge source={lang.sourceType} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs md:text-sm font-bold rounded border border-indigo-100">{lang.level}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditId(lang.id); setLangForm({ language: lang.language, level: lang.level }); setEditModal("language"); }}
                                className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => setDeleteConfirm({ type: "language", id: lang.id, title: `"${lang.language}" dilini silmek istediğinize emin misiniz?` })}
                                className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <Languages className="w-10 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">Dil Bilgisi Yok</p>
                      <p className="text-xs text-slate-500 mt-1">Yabancı dil bilgilerinizi ekleyin.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== PREFERENCES TAB ===== */}
              {activeTab === "preferences" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900">İş Tercihleri</h2>
                    <button
                      onClick={() => {
                        setPrefForm({
                          salaryMin: user.preferences?.salaryMin?.toString() || "",
                          salaryMax: user.preferences?.salaryMax?.toString() || "",
                          currency: user.preferences?.currency || "TRY",
                          workModels: user.preferences?.workModels?.join(", ") || "",
                          preferredCities: user.preferences?.preferredCities?.join(", ") || ""
                        });
                        setEditModal("preferences");
                      }}
                      className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Düzenle
                    </button>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase mb-1">Maaş Beklentisi</h3>
                        <div className="text-sm font-semibold text-slate-900">
                          {user.preferences?.salaryMin || user.preferences?.salaryMax
                            ? `${user.preferences.salaryMin || 0} - ${user.preferences.salaryMax || "Belirtilmemiş"} ${user.preferences.currency}`
                            : "Belirtilmemiş"}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase mb-1">Çalışma Şekli</h3>
                        <div className="text-sm font-semibold text-slate-900">
                          {user.preferences?.workModels && user.preferences.workModels.length > 0 ? user.preferences.workModels.join(", ") : "Belirtilmemiş"}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase mb-1">Tercih Edilen Şehirler</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {user.preferences?.preferredCities && user.preferences.preferredCities.length > 0 ? (
                            user.preferences.preferredCities.map((city: string) => (
                              <span key={city} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-xs font-bold">{city}</span>
                            ))
                          ) : (
                            <span className="text-sm font-semibold text-slate-900">Belirtilmemiş</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ======================== MODALS ======================== */}

      {/* Lightbox */}
      {showLightbox && user.avatarUrl && (
        <ImageLightbox src={`${API_BASE}${user.avatarUrl}`} alt={user.name} onClose={() => setShowLightbox(false)} />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <DeleteConfirm
          title={deleteConfirm.title}
          onConfirm={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* About Modal */}
      {editModal === "about" && (
        <SectionModal title="Hakkımda" onClose={() => setEditModal(null)}>
          <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={8}
            className="w-full p-4 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-base" placeholder="Kendinizden bahsedin..." />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setEditModal(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
            <button onClick={handleSaveAbout} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Kaydet</button>
          </div>
        </SectionModal>
      )}

      {/* Education Modal */}
      {editModal === "education" && (
        <SectionModal title={editId ? "Eğitim Düzenle" : "Yeni Eğitim Ekle"} onClose={() => { setEditModal(null); setEditId(null); }}>
          <form onSubmit={handleSaveEducation} className="space-y-3">
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Okul / Üniversite</label>
              <input required type="text" value={eduForm.school} onChange={e => setEduForm({...eduForm, school: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Derece</label>
                <input required type="text" value={eduForm.degree} onChange={e => setEduForm({...eduForm, degree: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" placeholder="Lisans" /></div>
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Bölüm</label>
                <input required type="text" value={eduForm.fieldOfStudy} onChange={e => setEduForm({...eduForm, fieldOfStudy: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Başlangıç</label>
                <input required type="date" value={eduForm.startDate} onChange={e => setEduForm({...eduForm, startDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Bitiş</label>
                <input required={!eduForm.isContinuing} disabled={eduForm.isContinuing} type="date" value={eduForm.endDate} onChange={e => setEduForm({...eduForm, endDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none disabled:opacity-50" /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={eduForm.isContinuing} onChange={e => setEduForm({...eduForm, isContinuing: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-xs font-bold text-slate-600">Hala devam ediyorum</span>
            </label>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => { setEditModal(null); setEditId(null); }} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Kaydet</button>
            </div>
          </form>
        </SectionModal>
      )}

      {/* Experience Modal */}
      {editModal === "experience" && (
        <SectionModal title={editId ? "Deneyim Düzenle" : "Yeni Deneyim Ekle"} onClose={() => { setEditModal(null); setEditId(null); }}>
          <form onSubmit={handleSaveExperience} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Şirket</label>
                <input required type="text" value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Unvan</label>
                <input required type="text" value={expForm.title} onChange={e => setExpForm({...expForm, title: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
            </div>
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Konum</label>
              <input type="text" value={expForm.location} onChange={e => setExpForm({...expForm, location: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" placeholder="İstanbul, Türkiye" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Başlangıç</label>
                <input required type="date" value={expForm.startDate} onChange={e => setExpForm({...expForm, startDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Bitiş</label>
                <input required={!expForm.isContinuing} disabled={expForm.isContinuing} type="date" value={expForm.endDate} onChange={e => setExpForm({...expForm, endDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none disabled:opacity-50" /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={expForm.isContinuing} onChange={e => setExpForm({...expForm, isContinuing: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-xs font-bold text-slate-600">Hala devam ediyorum</span>
            </label>
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Açıklama</label>
              <textarea rows={8} value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-base focus:border-indigo-500 outline-none" /></div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => { setEditModal(null); setEditId(null); }} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Kaydet</button>
            </div>
          </form>
        </SectionModal>
      )}

      {/* Project Modal */}
      {editModal === "project" && (
        <SectionModal title={editId ? "Proje Düzenle" : "Yeni Proje Ekle"} onClose={() => { setEditModal(null); setEditId(null); }}>
          <form onSubmit={handleSaveProject} className="space-y-3">
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Proje Adı</label>
              <input required type="text" value={projForm.name} onChange={e => setProjForm({...projForm, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Açıklama</label>
              <textarea rows={8} value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-base focus:border-indigo-500 outline-none" /></div>
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Teknolojiler (virgülle ayırın)</label>
              <input type="text" value={projForm.technologies} onChange={e => setProjForm({...projForm, technologies: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" placeholder="React, Node.js, MongoDB" /></div>
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Proje Linki</label>
              <input type="url" value={projForm.url} onChange={e => setProjForm({...projForm, url: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Başlangıç</label>
                <input type="date" value={projForm.startDate} onChange={e => setProjForm({...projForm, startDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Bitiş</label>
                <input disabled={projForm.isContinuing} type="date" value={projForm.endDate} onChange={e => setProjForm({...projForm, endDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none disabled:opacity-50" /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={projForm.isContinuing} onChange={e => setProjForm({...projForm, isContinuing: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-xs font-bold text-slate-600">Devam ediyor</span>
            </label>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => { setEditModal(null); setEditId(null); }} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Kaydet</button>
            </div>
          </form>
        </SectionModal>
      )}

      {/* Certification Modal */}
      {editModal === "certification" && (
        <SectionModal title={editId ? "Sertifika Düzenle" : "Yeni Sertifika Ekle"} onClose={() => { setEditModal(null); setEditId(null); }}>
          <form onSubmit={handleSaveCertification} className="space-y-3">
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Sertifika Adı</label>
              <input required type="text" value={certForm.name} onChange={e => setCertForm({...certForm, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Veren Kurum</label>
              <input type="text" value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" placeholder="Google, AWS, Udemy..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Veriliş Tarihi</label>
                <input type="date" value={certForm.issueDate} onChange={e => setCertForm({...certForm, issueDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Geçerlilik Tarihi</label>
                <input type="date" value={certForm.expirationDate} onChange={e => setCertForm({...certForm, expirationDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
            </div>
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Doğrulama Linki</label>
              <input type="url" value={certForm.credentialUrl} onChange={e => setCertForm({...certForm, credentialUrl: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => { setEditModal(null); setEditId(null); }} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Kaydet</button>
            </div>
          </form>
        </SectionModal>
      )}

      {/* Skill Modal */}
      {editModal === "skill" && (
        <SectionModal title="Yeni Yetenek Ekle" onClose={() => setEditModal(null)}>
          <form onSubmit={handleSaveSkill} className="space-y-3">
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Yetenek Adı</label>
              <input required type="text" value={skillForm.skillName} onChange={e => setSkillForm({ skillName: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" placeholder="React, Python, Proje Yönetimi..." /></div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Ekle</button>
            </div>
          </form>
        </SectionModal>
      )}

      {/* Language Modal */}
      {editModal === "language" && (
        <SectionModal title={editId ? "Dil Düzenle" : "Yeni Dil Ekle"} onClose={() => { setEditModal(null); setEditId(null); }}>
          <form onSubmit={handleSaveLanguage} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Dil</label>
                <input required type="text" value={langForm.language} onChange={e => setLangForm({...langForm, language: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" placeholder="İngilizce" /></div>
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Seviye</label>
                <select required value={langForm.level} onChange={e => setLangForm({...langForm, level: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none">
                  <option value="">Seçiniz</option>
                  <option value="A1">A1 - Başlangıç</option><option value="A2">A2 - Temel</option>
                  <option value="B1">B1 - Orta</option><option value="B2">B2 - İyi</option>
                  <option value="C1">C1 - İleri</option><option value="C2">C2 - Anadil Seviyesi</option>
                  <option value="Native">Anadil</option>
                </select></div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => { setEditModal(null); setEditId(null); }} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Kaydet</button>
            </div>
          </form>
        </SectionModal>
      )}

      {/* Preferences Modal */}
      {editModal === "preferences" && (
        <SectionModal title="İş Tercihlerini Düzenle" onClose={() => setEditModal(null)}>
          <form onSubmit={handleSavePref} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Min Maaş</label>
                <input type="number" value={prefForm.salaryMin} onChange={e => setPrefForm({...prefForm, salaryMin: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Max Maaş</label>
                <input type="number" value={prefForm.salaryMax} onChange={e => setPrefForm({...prefForm, salaryMax: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" /></div>
              <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Birim</label>
                <select value={prefForm.currency} onChange={e => setPrefForm({...prefForm, currency: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none">
                  <option value="TRY">₺ TRY</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option>
                </select></div>
            </div>
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Çalışma Şekli (virgülle ayırın)</label>
              <input type="text" value={prefForm.workModels} onChange={e => setPrefForm({...prefForm, workModels: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" placeholder="remote, hybrid, onsite" /></div>
            <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Tercih Edilen Şehirler (virgülle ayırın)</label>
              <input type="text" value={prefForm.preferredCities} onChange={e => setPrefForm({...prefForm, preferredCities: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none" placeholder="İstanbul, Ankara" /></div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">İptal</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Kaydet</button>
            </div>
          </form>
        </SectionModal>
      )}

      {/* Main Profile Edit Modal */}
      {editModal === "mainProfile" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-900">Profili Düzenle</h2>
              <button onClick={() => setEditModal(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <form onSubmit={handleSaveMainProfile} className="space-y-4">
                {/* Avatar change button */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 rounded-xl">
                    <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-lg font-bold text-white overflow-hidden">
                      {user?.avatarUrl ? <img src={`${API_BASE}${user.avatarUrl}`} alt="" className="w-full h-full object-cover" /> : (user?.name || "K").charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                      {uploadingAvatar ? "Yükleniyor..." : "Fotoğrafı Değiştir"}
                    </button>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-bold">{user.email}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Ad Soyad *</label>
                    <input required type="text" value={mainProfileForm.name} onChange={e => setMainProfileForm({...mainProfileForm, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" /></div>
                  <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Unvan</label>
                    <input type="text" value={mainProfileForm.title} onChange={e => setMainProfileForm({...mainProfileForm, title: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" placeholder="Yazılım Geliştirici" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Telefon</label>
                    <input type="text" value={mainProfileForm.phone} onChange={e => setMainProfileForm({...mainProfileForm, phone: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" /></div>
                  <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Doğum Tarihi</label>
                    <input type="date" value={mainProfileForm.birthDate} onChange={e => setMainProfileForm({...mainProfileForm, birthDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Cinsiyet</label>
                    <select value={mainProfileForm.gender} onChange={e => setMainProfileForm({...mainProfileForm, gender: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium">
                      <option value="">Seçiniz</option><option value="Erkek">Erkek</option><option value="Kadın">Kadın</option><option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
                    </select></div>
                  <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Askerlik</label>
                    <select value={mainProfileForm.militaryStatus} onChange={e => setMainProfileForm({...mainProfileForm, militaryStatus: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium">
                      <option value="">Seçiniz</option><option value="Yapıldı">Yapıldı</option><option value="Muaf">Muaf</option><option value="Tecilli">Tecilli</option><option value="Yapılmadı">Yapılmadı</option>
                    </select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Şehir</label>
                    <input type="text" value={mainProfileForm.city} onChange={e => setMainProfileForm({...mainProfileForm, city: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" /></div>
                  <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">İlçe</label>
                    <input type="text" value={mainProfileForm.district} onChange={e => setMainProfileForm({...mainProfileForm, district: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" /></div>
                </div>
                <div><label className="block text-xs md:text-sm font-bold text-slate-500 uppercase mb-1">Sürücü Belgesi</label>
                  <input type="text" value={mainProfileForm.driverLicense} onChange={e => setMainProfileForm({...mainProfileForm, driverLicense: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" placeholder="B, A2" /></div>
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs md:text-sm font-bold text-slate-500 uppercase mb-3">Sosyal Medya</h3>
                  <div className="space-y-3">
                    <input type="url" value={mainProfileForm.linkedinUrl} onChange={e => setMainProfileForm({...mainProfileForm, linkedinUrl: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" placeholder="LinkedIn URL" />
                    <input type="url" value={mainProfileForm.githubUrl} onChange={e => setMainProfileForm({...mainProfileForm, githubUrl: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" placeholder="GitHub URL" />
                    <input type="url" value={mainProfileForm.portfolioUrl} onChange={e => setMainProfileForm({...mainProfileForm, portfolioUrl: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none font-medium" placeholder="Portfolio URL" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setEditModal(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">İptal</button>
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors">Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CV Merge Preview Modal */}
      {mergePreview && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> CV Analiz Sonucu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Aşağıdaki değişiklikleri onaylayın veya reddedin</p>
              </div>
              <button onClick={() => { setMergePreview(null); setMergeCvId(null); }} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">

              {/* About Preview */}
              {mergePreview.about && (
                <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/50">
                  <h3 className="text-xs font-bold text-slate-900 mb-1">Hakkımda</h3>
                  <p className="text-xs text-slate-600 line-clamp-3">{mergePreview.about.newValue}</p>
                  {mergePreview.about.action === "conflict" && (
                    <p className="text-xs md:text-sm text-amber-600 font-bold mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {mergePreview.about.reason}</p>
                  )}
                </div>
              )}

              {/* New Items */}
              {[
                { key: "education", label: "Yeni Eğitim", items: mergePreview.education.new, getTitle: (i: any) => i.data?.school },
                { key: "experience", label: "Yeni Deneyim", items: mergePreview.experience.new, getTitle: (i: any) => `${i.data?.title} - ${i.data?.company}` },
                { key: "projects", label: "Yeni Proje", items: mergePreview.projects.new, getTitle: (i: any) => i.data?.name },
                { key: "certifications", label: "Yeni Sertifika", items: mergePreview.certifications.new, getTitle: (i: any) => i.data?.name },
                { key: "skills", label: "Yeni Yetenek", items: mergePreview.skills.new, getTitle: (i: any) => i.name },
                { key: "languages", label: "Yeni Dil", items: mergePreview.languages.new, getTitle: (i: any) => i.data?.language },
              ].map(({ key, label, items, getTitle }) => items.length > 0 && (
                <div key={key}>
                  <h3 className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1"><Plus className="w-3 h-3" /> {label} ({items.length})</h3>
                  <div className="space-y-1.5">
                    {items.map((item: any) => (
                      <label key={item.key} className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${mergeRejected.has(item.key) ? 'border-red-200 bg-red-50 line-through opacity-60' : 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50'}`}>
                        <input type="checkbox" checked={!mergeRejected.has(item.key)}
                          onChange={() => {
                            const next = new Set(mergeRejected);
                            if (next.has(item.key)) next.delete(item.key); else next.add(item.key);
                            setMergeRejected(next);
                          }}
                          className="w-3.5 h-3.5 text-emerald-600 rounded" />
                        <span className="font-bold text-slate-900">{getTitle(item)}</span>
                        {item.confidence && item.confidence < 85 && (
                          <span className="ml-auto px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">%{item.confidence} güven</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Ignored Items Summary */}
              {(() => {
                const totalIgnored = mergePreview.education.ignored.length + mergePreview.experience.ignored.length + mergePreview.projects.ignored.length + mergePreview.certifications.ignored.length + mergePreview.skills.ignored.length + mergePreview.languages.ignored.length;
                if (totalIgnored === 0) return null;
                return (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <h3 className="text-xs font-bold text-slate-500 flex items-center gap-1"><Shield className="w-3 h-3" /> Korunan Veriler ({totalIgnored})</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5">Bu veriler zaten mevcut veya manuel olarak girilmiş, değiştirilmeyecek.</p>
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-2 justify-end px-6 py-4 border-t border-slate-100 shrink-0">
              <button onClick={() => { setMergePreview(null); setMergeCvId(null); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">Reddet</button>
              <button onClick={handleApplyMerge} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Seçilenleri Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
