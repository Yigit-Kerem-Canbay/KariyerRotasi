import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, MapPin, Globe, Users, Briefcase, Edit, Mail, Calendar, Upload, Building2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { api } from '@/lib/api';
import type { User } from '@/store/auth';

interface EmployerProfileViewProps {
  user: User;
  onUpdate: (user: User) => void;
}

export function EmployerProfileView({ user, onUpdate }: EmployerProfileViewProps) {
  const isCorporate = user.role === 'corporate_employer';
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(isCorporate);
  
  const [editModal, setEditModal] = useState<string | null>(null);
  
  // State for forms
  const [corpForm, setCorpForm] = useState({
    name: user.name, description: '', website: '', location: '', sector: '', employeeCount: ''
  });
  
  const [indForm, setIndForm] = useState({
    name: user.name, about: user.profile?.about || '', phone: user.profile?.phone || '', city: user.profile?.city || ''
  });

  useEffect(() => {
    if (isCorporate) {
      api.get('/companies/my').then(res => {
        const myCompany = res.data;
        if (myCompany) {
          setCompany(myCompany);
          setCorpForm({
            name: myCompany.name || '',
            description: myCompany.description || '',
            website: myCompany.website || '',
            location: myCompany.location || '',
            sector: myCompany.sector || '',
            employeeCount: myCompany.employeeCount || ''
          });
        }
      }).catch(err => {
        console.error("Failed to fetch my company:", err);
      }).finally(() => setLoading(false));
    }
  }, [isCorporate]);

  const handleSaveCorporate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let formattedWebsite = corpForm.website;
      if (formattedWebsite && !formattedWebsite.startsWith('http://') && !formattedWebsite.startsWith('https://')) {
        formattedWebsite = 'https://' + formattedWebsite;
      }

      const res = await api.patch('/companies/my', {
        ...corpForm,
        website: formattedWebsite,
        employeeCount: corpForm.employeeCount || null
      });
      setCompany(res.data);
      setEditModal(null);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join('\n') : (msg || "Şirket bilgileri güncellenirken bir hata oluştu."));
    }
  };

  const handleSaveIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (indForm.name !== user.name) {
        await api.patch("/users/me", { name: indForm.name });
      }
      const res = await api.patch("/users/me/profile", {
        about: indForm.about,
        phone: indForm.phone,
        city: indForm.city
      });
      onUpdate(res.data);
      setEditModal(null);
    } catch (err) {
      alert("Profil güncellenirken bir hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayName = isCorporate && company?.name ? company.name : user.name;
  const avatarUrl = isCorporate && company?.logoUrl ? company.logoUrl : user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4F46E5&color=fff`;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative"></div>
          <div className="px-6 pb-6 relative sm:px-8 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="-mt-16 relative group">
              <img 
                src={avatarUrl} 
                alt={displayName} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white"
              />
            </div>
            
            <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
              <h1 className="text-3xl font-black text-slate-900">{displayName}</h1>
              <p className="text-lg text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-2 mt-1">
                {isCorporate ? <Building2 className="w-5 h-5 text-indigo-500" /> : <UserCircle className="w-5 h-5 text-indigo-500" />}
                {isCorporate ? 'Kurumsal İşveren' : 'Bireysel İşveren'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => setEditModal(isCorporate ? 'corporate' : 'individual')}
                variant="outline" 
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold"
              >
                <Edit className="w-4 h-4 mr-2" />
                Profili Düzenle
              </Button>
              <Button 
                onClick={() => window.location.href = '/employer/jobs'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Yayımladığım İlanlar
              </Button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Contact & Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-100 pb-2">İletişim & Bilgiler</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-Posta</p>
                    <p className="font-medium text-slate-800 break-all">{user.email}</p>
                  </div>
                </div>
                
                {isCorporate && company?.website && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Web Sitesi</p>
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline">{company.website}</a>
                    </div>
                  </div>
                )}

                {isCorporate && company?.location && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Konum</p>
                      <p className="font-medium text-slate-800">{company.location}</p>
                    </div>
                  </div>
                )}
                
                {!isCorporate && user.profile?.city && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Şehir</p>
                      <p className="font-medium text-slate-800">{user.profile.city}</p>
                    </div>
                  </div>
                )}
                
                {isCorporate && company?.sector && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sektör</p>
                      <p className="font-medium text-slate-800">{company.sector}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Katılım</p>
                    <p className="font-medium text-slate-800">{new Date(user.createdAt).toLocaleDateString("tr-TR", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: About/Description */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                {isCorporate ? 'Şirket Özeti' : 'Hakkımda / Müessese Tanıtımı'}
              </h3>
              <div className="prose prose-slate max-w-none text-slate-600">
                {isCorporate ? (
                  company?.description ? (
                    <p className="whitespace-pre-wrap">{company.description}</p>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-500 font-medium">Şirketiniz hakkında henüz bir açıklama girmediniz.</p>
                      <Button variant="link" className="text-indigo-600 mt-2" onClick={() => setEditModal('corporate')}>Açıklama Ekle</Button>
                    </div>
                  )
                ) : (
                  user.profile?.about ? (
                    <p className="whitespace-pre-wrap">{user.profile.about}</p>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-500 font-medium">Kendiniz veya müesseseniz hakkında henüz bir bilgi girmediniz.</p>
                      <Button variant="link" className="text-indigo-600 mt-2" onClick={() => setEditModal('individual')}>Bilgi Ekle</Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Modals */}
      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-black text-slate-900">
                  {editModal === 'corporate' ? 'Şirket Bilgilerini Düzenle' : 'Profil Bilgilerini Düzenle'}
                </h3>
                <button onClick={() => setEditModal(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  &times;
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {editModal === 'corporate' ? (
                  <form onSubmit={handleSaveCorporate} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Şirket Adı</Label>
                      <Input value={corpForm.name} onChange={e => setCorpForm({...corpForm, name: e.target.value})} placeholder="Şirket Adı" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Sektör</Label>
                        <Input value={corpForm.sector} onChange={e => setCorpForm({...corpForm, sector: e.target.value})} placeholder="Örn: Bilişim" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Çalışan Sayısı</Label>
                        <Input type="text" value={corpForm.employeeCount} onChange={e => setCorpForm({...corpForm, employeeCount: e.target.value})} placeholder="Örn: 10-50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Web Sitesi</Label>
                      <Input value={corpForm.website} onChange={e => setCorpForm({...corpForm, website: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Lokasyon (Genel Merkez)</Label>
                      <Input value={corpForm.location} onChange={e => setCorpForm({...corpForm, location: e.target.value})} placeholder="Şehir, Ülke" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Şirket Açıklaması</Label>
                      <textarea 
                        className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm"
                        value={corpForm.description} 
                        onChange={e => setCorpForm({...corpForm, description: e.target.value})}
                        placeholder="Şirketinizden bahsedin..."
                      />
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                      <Button type="button" variant="outline" onClick={() => setEditModal(null)}>İptal</Button>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Değişiklikleri Kaydet</Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSaveIndividual} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">İsim / Müessese Adı</Label>
                      <Input value={indForm.name} onChange={e => setIndForm({...indForm, name: e.target.value})} placeholder="İsim" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Şehir</Label>
                        <Input value={indForm.city} onChange={e => setIndForm({...indForm, city: e.target.value})} placeholder="Örn: İstanbul" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Telefon</Label>
                        <Input value={indForm.phone} onChange={e => setIndForm({...indForm, phone: e.target.value})} placeholder="05XX..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Hakkında / Tanıtım</Label>
                      <textarea 
                        className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm"
                        value={indForm.about} 
                        onChange={e => setIndForm({...indForm, about: e.target.value})}
                        placeholder="Kendinizden veya işletmenizden bahsedin..."
                      />
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                      <Button type="button" variant="outline" onClick={() => setEditModal(null)}>İptal</Button>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Değişiklikleri Kaydet</Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
