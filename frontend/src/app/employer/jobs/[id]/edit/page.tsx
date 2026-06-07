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
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { WorkScheduleBuilder } from "@/components/ui/WorkScheduleBuilder";

const TURKEY_CITIES = [
  { id: 'Adana', label: 'Adana' }, { id: 'Adıyaman', label: 'Adıyaman' }, { id: 'Afyonkarahisar', label: 'Afyonkarahisar' },
  { id: 'Ağrı', label: 'Ağrı' }, { id: 'Amasya', label: 'Amasya' }, { id: 'Ankara', label: 'Ankara' },
  { id: 'Antalya', label: 'Antalya' }, { id: 'Artvin', label: 'Artvin' }, { id: 'Aydın', label: 'Aydın' },
  { id: 'Balıkesir', label: 'Balıkesir' }, { id: 'Bilecik', label: 'Bilecik' }, { id: 'Bingöl', label: 'Bingöl' },
  { id: 'Bitlis', label: 'Bitlis' }, { id: 'Bolu', label: 'Bolu' }, { id: 'Burdur', label: 'Burdur' },
  { id: 'Bursa', label: 'Bursa' }, { id: 'Çanakkale', label: 'Çanakkale' }, { id: 'Çankırı', label: 'Çankırı' },
  { id: 'Çorum', label: 'Çorum' }, { id: 'Denizli', label: 'Denizli' }, { id: 'Diyarbakır', label: 'Diyarbakır' },
  { id: 'Edirne', label: 'Edirne' }, { id: 'Elazığ', label: 'Elazığ' }, { id: 'Erzincan', label: 'Erzincan' },
  { id: 'Erzurum', label: 'Erzurum' }, { id: 'Eskişehir', label: 'Eskişehir' }, { id: 'Gaziantep', label: 'Gaziantep' },
  { id: 'Giresun', label: 'Giresun' }, { id: 'Gümüşhane', label: 'Gümüşhane' }, { id: 'Hakkari', label: 'Hakkari' },
  { id: 'Hatay', label: 'Hatay' }, { id: 'Isparta', label: 'Isparta' }, { id: 'Mersin', label: 'Mersin' },
  { id: 'İstanbul', label: 'İstanbul' }, { id: 'İzmir', label: 'İzmir' }, { id: 'Kars', label: 'Kars' },
  { id: 'Kastamonu', label: 'Kastamonu' }, { id: 'Kayseri', label: 'Kayseri' }, { id: 'Kırklareli', label: 'Kırklareli' },
  { id: 'Kırşehir', label: 'Kırşehir' }, { id: 'Kocaeli', label: 'Kocaeli' }, { id: 'Konya', label: 'Konya' },
  { id: 'Kütahya', label: 'Kütahya' }, { id: 'Malatya', label: 'Malatya' }, { id: 'Manisa', label: 'Manisa' },
  { id: 'Kahramanmaraş', label: 'Kahramanmaraş' }, { id: 'Mardin', label: 'Mardin' }, { id: 'Muğla', label: 'Muğla' },
  { id: 'Muş', label: 'Muş' }, { id: 'Nevşehir', label: 'Nevşehir' }, { id: 'Niğde', label: 'Niğde' },
  { id: 'Ordu', label: 'Ordu' }, { id: 'Rize', label: 'Rize' }, { id: 'Sakarya', label: 'Sakarya' },
  { id: 'Samsun', label: 'Samsun' }, { id: 'Siirt', label: 'Siirt' }, { id: 'Sinop', label: 'Sinop' },
  { id: 'Sivas', label: 'Sivas' }, { id: 'Şanlıurfa', label: 'Şanlıurfa' }, { id: 'Tekirdağ', label: 'Tekirdağ' },
  { id: 'Tokat', label: 'Tokat' }, { id: 'Trabzon', label: 'Trabzon' }, { id: 'Tunceli', label: 'Tunceli' },
  { id: 'Uşak', label: 'Uşak' }, { id: 'Van', label: 'Van' }, { id: 'Yozgat', label: 'Yozgat' },
  { id: 'Zonguldak', label: 'Zonguldak' }, { id: 'Aksaray', label: 'Aksaray' }, { id: 'Bayburt', label: 'Bayburt' },
  { id: 'Karaman', label: 'Karaman' }, { id: 'Kırıkkale', label: 'Kırıkkale' }, { id: 'Batman', label: 'Batman' },
  { id: 'Şırnak', label: 'Şırnak' }, { id: 'Bartın', label: 'Bartın' }, { id: 'Ardahan', label: 'Ardahan' },
  { id: 'Iğdır', label: 'Iğdır' }, { id: 'Yalova', label: 'Yalova' }, { id: 'Karabük', label: 'Karabük' },
  { id: 'Kilis', label: 'Kilis' }, { id: 'Osmaniye', label: 'Osmaniye' }, { id: 'Düzce', label: 'Düzce' }
];

const WORK_MODELS = [
  { id: "remote", label: "Uzaktan (Remote)" },
  { id: "onsite", label: "Yüz Yüze (Ofis)" },
  { id: "hybrid", label: "Hibrit" }
];

const EMPLOYMENT_TYPES = [
  { id: 'Tam Zamanlı', label: 'Tam Zamanlı' },
  { id: 'Yarı Zamanlı', label: 'Yarı Zamanlı' },
  { id: 'Serbest Zamanlı (Freelance)', label: 'Serbest Zamanlı (Freelance)' },
  { id: 'Staj', label: 'Staj' },
  { id: 'Dönemsel/Proje Bazlı', label: 'Dönemsel/Proje Bazlı' }
];

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
  skills: z.string().optional(),
  employmentTypes: z.array(z.string()).optional(),
  workSchedule: z.array(z.any()).optional(),
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
          employmentTypes: job.employmentTypes || [],
          workSchedule: job.workSchedule || [],
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
                <Label className="text-sm font-bold">Çalışma Modeli * (Çoklu Seçim)</Label>
                <MultiSelectDropdown
                  options={WORK_MODELS}
                  selectedValues={(watch("workModel") || "").split(",").map(s => s.trim()).filter(Boolean)}
                  onChange={(selected) => {
                    setValue("workModel", selected.join(", "));
                  }}
                  placeholder="Çalışma modeli seçin..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">Şehir Seçimi * (Çoklu Seçim)</Label>
                <MultiSelectDropdown
                  options={TURKEY_CITIES}
                  selectedValues={watch("cities") || []}
                  onChange={(selected) => {
                    setValue("cities", selected);
                  }}
                  placeholder="Şehir seçin..."
                  selectAllOptionText="Tüm Şehirler"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm font-bold">Çalışma Şekli * (Çoklu Seçim)</Label>
                <MultiSelectDropdown
                  options={EMPLOYMENT_TYPES}
                  selectedValues={watch("employmentTypes") || []}
                  onChange={(selected) => {
                    setValue("employmentTypes", selected);
                  }}
                  placeholder="Çalışma şekli seçin..."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm font-bold">Çalışma Günleri ve Saatleri</Label>
                <WorkScheduleBuilder
                  value={watch("workSchedule") || []}
                  onChange={(schedule) => {
                    setValue("workSchedule", schedule);
                  }}
                />
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

            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-xl hover:bg-slate-50 transition-colors bg-white flex-1">
                  <input
                    type="radio"
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    checked={!watch("hideSalary")}
                    onChange={() => setValue("hideSalary", false)}
                  />
                  <span className="text-sm font-bold text-slate-700">Maaş Aralığı Belirt</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-xl hover:bg-slate-50 transition-colors bg-white flex-1">
                  <input
                    type="radio"
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    checked={watch("hideSalary")}
                    onChange={() => {
                      setValue("hideSalary", true);
                      setValue("salaryMin", "");
                      setValue("salaryMax", "");
                    }}
                  />
                  <span className="text-sm font-bold text-slate-700">İlk Aşamada Paylaşılmayacaktır</span>
                </label>
              </div>

              {!watch("hideSalary") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
                </div>
              )}
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
