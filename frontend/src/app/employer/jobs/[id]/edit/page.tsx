"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Building, Globe, DollarSign, BookOpen, GraduationCap, Languages, CheckCircle2, ShieldAlert } from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const schema = z.object({
  title: z.string().min(3, "İlan başlığı en az 3 karakter olmalı."),
  description: z.string().min(20, "İş tanımı en az 20 karakter olmalı."),
  cities: z.array(z.string()).optional(),
  location: z.string().optional(),
  workModel: z.string().min(1, "Lütfen çalışma modelini seçin."),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  hideSalary: z.boolean().optional(),
  currency: z.string().optional(),
  experienceYears: z.string().optional(),
  educationLevel: z.string().optional(),
  militaryStatus: z.string().optional(),
  language: z.string().optional(),
  skills: z.string().optional(), // Will split by comma
});

type FormValues = z.infer<typeof schema>;

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      workModel: "onsite",
      currency: "TRY",
      cities: [],
      hideSalary: false
    }
  });

  React.useEffect(() => {
    async function loadJob() {
      try {
        const res = await api.get(`/jobs/${id}`);
        const job = res.data;
        
        const skillsString = job.jobSkills?.map((js: any) => js.skill.name).join(", ");

        reset({
          title: job.title || "",
          description: job.description || "",
          cities: job.cities || [],
          location: job.location || "",
          workModel: job.workModel || "onsite",
          salaryMin: job.salaryMin ? String(job.salaryMin) : "",
          salaryMax: job.salaryMax ? String(job.salaryMax) : "",
          hideSalary: job.hideSalary || false,
          currency: job.currency || "TRY",
          experienceYears: job.experienceYears || "",
          educationLevel: job.educationLevel || "",
          militaryStatus: job.militaryStatus || "",
          language: job.language || "",
          skills: skillsString || "",
        });
      } catch (err: any) {
        setGlobalError("İlan detayları yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id, reset]);

  async function onSubmit(values: FormValues) {
    setGlobalError(null);
    try {
      const skillsArray = values.skills
        ? values.skills.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        ...values,
        skills: skillsArray
      };

      await api.patch(`/jobs/${id}`, payload);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/job/${id}`);
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "İlan güncellenirken bir hata oluştu.";
      setGlobalError(Array.isArray(msg) ? msg[0] : msg);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-6">
        <div className="bg-green-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">İlan Başarıyla Güncellendi!</h1>
        <p className="text-slate-500">Değişiklikler kaydedildi. İlan detayına yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">İlanı Düzenle</h1>
          <p className="mt-2 text-base text-slate-500">İlan bilgilerini güncelleyebilirsiniz.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              Temel Bilgiler
            </h2>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold">İlan Başlığı *</Label>
              <Input
                id="title"
                placeholder="Örn: Kıdemli Frontend Geliştirici (React)"
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold">İş Tanımı *</Label>
              <textarea
                id="description"
                placeholder="İşin detayları, sorumluluklar ve beklentiler..."
                className="w-full min-h-[150px] p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-sm font-bold">Aranan Yetenekler (Virgülle ayırın)</Label>
              <Input
                id="skills"
                placeholder="Örn: React, Node.js, TypeScript, PostgreSQL"
                {...register("skills")}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              Çalışma Şekli & Konum
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workModel" className="text-sm font-bold">Çalışma Modeli *</Label>
                <select
                  id="workModel"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-white"
                  {...register("workModel")}
                >
                  <option value="onsite">Tam Zamanlı (Ofis)</option>
                  <option value="remote">Uzaktan (Remote)</option>
                  <option value="hybrid">Hibrit</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">Şehirler (Opsiyonel)</Label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-white mb-2"
                  onChange={(e) => {
                    const city = e.target.value;
                    if (!city) return;
                    const currentCities = watch("cities") || [];
                    if (!currentCities.includes(city)) {
                      setValue("cities", [...currentCities, city]);
                    }
                    e.target.value = "";
                  }}
                >
                  <option value="">Şehir Seçin / Ekleyin...</option>
                  <option value="Adana">Adana</option><option value="Adıyaman">Adıyaman</option><option value="Afyonkarahisar">Afyonkarahisar</option>
                  <option value="Ağrı">Ağrı</option><option value="Amasya">Amasya</option><option value="Ankara">Ankara</option>
                  <option value="Antalya">Antalya</option><option value="Artvin">Artvin</option><option value="Aydın">Aydın</option>
                  <option value="Balıkesir">Balıkesir</option><option value="Bilecik">Bilecik</option><option value="Bingöl">Bingöl</option>
                  <option value="Bitlis">Bitlis</option><option value="Bolu">Bolu</option><option value="Burdur">Burdur</option>
                  <option value="Bursa">Bursa</option><option value="Çanakkale">Çanakkale</option><option value="Çankırı">Çankırı</option>
                  <option value="Çorum">Çorum</option><option value="Denizli">Denizli</option><option value="Diyarbakır">Diyarbakır</option>
                  <option value="Edirne">Edirne</option><option value="Elazığ">Elazığ</option><option value="Erzincan">Erzincan</option>
                  <option value="Erzurum">Erzurum</option><option value="Eskişehir">Eskişehir</option><option value="Gaziantep">Gaziantep</option>
                  <option value="Giresun">Giresun</option><option value="Gümüşhane">Gümüşhane</option><option value="Hakkari">Hakkari</option>
                  <option value="Hatay">Hatay</option><option value="Isparta">Isparta</option><option value="Mersin">Mersin</option>
                  <option value="İstanbul">İstanbul</option><option value="İzmir">İzmir</option><option value="Kars">Kars</option>
                  <option value="Kastamonu">Kastamonu</option><option value="Kayseri">Kayseri</option><option value="Kırklareli">Kırklareli</option>
                  <option value="Kırşehir">Kırşehir</option><option value="Kocaeli">Kocaeli</option><option value="Konya">Konya</option>
                  <option value="Kütahya">Kütahya</option><option value="Malatya">Malatya</option><option value="Manisa">Manisa</option>
                  <option value="Kahramanmaraş">Kahramanmaraş</option><option value="Mardin">Mardin</option><option value="Muğla">Muğla</option>
                  <option value="Muş">Muş</option><option value="Nevşehir">Nevşehir</option><option value="Niğde">Niğde</option>
                  <option value="Ordu">Ordu</option><option value="Rize">Rize</option><option value="Sakarya">Sakarya</option>
                  <option value="Samsun">Samsun</option><option value="Siirt">Siirt</option><option value="Sinop">Sinop</option>
                  <option value="Sivas">Sivas</option><option value="Tekirdağ">Tekirdağ</option><option value="Tokat">Tokat</option>
                  <option value="Trabzon">Trabzon</option><option value="Tunceli">Tunceli</option><option value="Şanlıurfa">Şanlıurfa</option>
                  <option value="Uşak">Uşak</option><option value="Van">Van</option><option value="Yozgat">Yozgat</option>
                  <option value="Zonguldak">Zonguldak</option><option value="Aksaray">Aksaray</option><option value="Bayburt">Bayburt</option>
                  <option value="Karaman">Karaman</option><option value="Kırıkkale">Kırıkkale</option><option value="Batman">Batman</option>
                  <option value="Şırnak">Şırnak</option><option value="Bartın">Bartın</option><option value="Ardahan">Ardahan</option>
                  <option value="Iğdır">Iğdır</option><option value="Yalova">Yalova</option><option value="Karabük">Karabük</option>
                  <option value="Kilis">Kilis</option><option value="Osmaniye">Osmaniye</option><option value="Düzce">Düzce</option>
                </select>
                <div className="flex flex-wrap gap-2">
                  {(watch("cities") || []).map((city: string) => (
                    <div key={city} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                      {city}
                      <button type="button" className="text-indigo-400 hover:text-indigo-600" onClick={() => {
                        const currentCities = watch("cities") || [];
                        setValue("cities", currentCities.filter(c => c !== city));
                      }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location" className="text-sm font-bold">Açık Adres (Opsiyonel)</Label>
                <Input
                  id="location"
                  placeholder="Ofisin açık adresi"
                  {...register("location")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              Aday Kriterleri
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceYears" className="text-sm font-bold">Tecrübe Yılı</Label>
                <select
                  id="experienceYears"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-white"
                  {...register("experienceYears")}
                >
                  <option value="">Farketmez</option>
                  <option value="Yeni Mezun">Yeni Mezun</option>
                  <option value="1-3 Yıl">1-3 Yıl</option>
                  <option value="3-5 Yıl">3-5 Yıl</option>
                  <option value="5-10 Yıl">5-10 Yıl</option>
                  <option value="10+ Yıl">10+ Yıl</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="educationLevel" className="text-sm font-bold">Eğitim Seviyesi</Label>
                <select
                  id="educationLevel"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-white"
                  {...register("educationLevel")}
                >
                  <option value="">Farketmez</option>
                  <option value="Önlisans">Önlisans</option>
                  <option value="Lisans">Lisans</option>
                  <option value="Yüksek Lisans">Yüksek Lisans</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="militaryStatus" className="text-sm font-bold">Askerlik Durumu</Label>
                <select
                  id="militaryStatus"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-white"
                  {...register("militaryStatus")}
                >
                  <option value="">Farketmez</option>
                  <option value="Yapıldı">Yapıldı</option>
                  <option value="Muaf">Muaf</option>
                  <option value="Tecilli">Tecilli</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-bold">Yabancı Dil</Label>
                <Input
                  id="language"
                  placeholder="Örn: İngilizce (Çok İyi)"
                  {...register("language")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Maaş Bilgisi (Opsiyonel)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin" className="text-sm font-bold">Minimum</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  placeholder="Örn: 30000"
                  {...register("salaryMin")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax" className="text-sm font-bold">Maksimum</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  placeholder="Örn: 50000"
                  {...register("salaryMax")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-bold">Para Birimi</Label>
                <select
                  id="currency"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-white"
                  {...register("currency")}
                >
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-3 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" {...register("hideSalary")} />
                  <span className="text-sm font-bold text-slate-700">Maaş bilgisini adaylardan gizle</span>
                </label>
              </div>
            </div>
          </div>

          {globalError && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 font-bold border border-red-100 flex items-center gap-3">
              <ShieldAlert className="h-5 w-5" />
              {globalError}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold"
              isLoading={isSubmitting}
            >
              İlanı Güncelle
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
