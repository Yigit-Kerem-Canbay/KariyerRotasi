import {
  JobTemplate,
  SectorTemplates,
  EDU_UNI,
  EDU_HS,
  EDU_ANY,
  EXP_SENIOR,
  EXP_MID,
  EXP_ENTRY,
  EXP_ANY_INC_ENTRY,
  WORKING_HOURS_OFFICE,
  WORKING_HOURS_SHIFT,
  WORKING_HOURS_FLEX,
  WORKING_HOURS_HEALTH,
  WORKING_HOURS_RETAIL,
  LANG_DEFAULT,
  LANG_IT,
  LANG_TOURISM,
  MILITARY_DEFAULT,
  MILITARY_MALE_ONLY
} from './job-templates-part1';

export const SECTORS_AND_TEMPLATES_PART4: SectorTemplates = {};

// 9. Lojistik & Taşıma
SECTORS_AND_TEMPLATES_PART4["Lojistik & Taşıma"] = [
  ...["Ağır Vasıta Şoförü (CE Sınıfı)", "Kurye (Motorlu)", "Dağıtım Personeli", "Forklift Operatörü"].map(t => ({
    title: t,
    description: `Lojistik ağımızda görev almak üzere ${t} arıyoruz.\n\nİş Tanımı:\n• Ürünlerin güvenli ve zamanında taşınması/dağıtılması\n• Araç/Ekipman temizliğinin ve günlük bakımlarının sağlanması\n\nAranan Nitelikler:\n• Gerekli ehliyet, SRC ve Psikoteknik belgelerine (varsa Forklift ehliyeti) sahip\n• Dikkatli ve trafik kurallarına harfiyen uyan`,
    skills: ["Lojistik", "Taşıma", t, "Dağıtım", "Şoför", "Araç Kullanımı"],
    educationLevels: EDU_ANY,
    experienceLevels: EXP_ANY_INC_ENTRY,
    salaryRange: { min: 20000, max: 35000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_SHIFT,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_MALE_ONLY
  })),
  {
    title: "Lojistik Operasyon Uzmanı",
    description: `Yurtiçi ve yurtdışı taşımacılık organizasyonlarını planlayıp yönetecek Operasyon Uzmanı arıyoruz.\n\nAranan Nitelikler:\n• Lojistik, Dış Ticaret veya ilgili bölümlerden mezun\n• İthalat, ihracat, gümrük süreçleri hakkında bilgi sahibi\n• Müşteri ve tedarikçi iletişimi güçlü`,
    skills: ["Lojistik", "Operasyon Yönetimi", "Gümrük", "İthalat İhracat", "Planlama"],
    educationLevels: ["Üniversite", "Ön Lisans"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 25000, max: 45000 },
    workModelWeights: { onsite: 8, hybrid: 2, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: ["İngilizce (İyi)"],
    militaryOptions: MILITARY_DEFAULT
  }
];

// 10. E-Ticaret
SECTORS_AND_TEMPLATES_PART4["E-Ticaret"] = [
  ...["E-Ticaret Operasyon Uzmanı", "Dijital Pazarlama Uzmanı (Performans Pazarlama)", "SEO Uzmanı", "Sosyal Medya Yöneticisi"].map(t => ({
    title: t,
    description: `Büyüyen e-ticaret ekibimizde görevlendirilmek üzere ${t} arıyoruz.\n\nİş Tanımı:\n• E-ticaret KPI'larının takibi ve iyileştirilmesi\n• Dijital satış kanallarının yönetimi ve kampanyaların kurgulanması\n\nAranan Nitelikler:\n• E-ticaret platformları ve araçları (Google Analytics, Meta Ads, SEO toolları) konusunda tecrübeli\n• Analitik düşünce yeteneğine sahip, verilerle çalışmayı seven`,
    skills: ["E-Ticaret", "Dijital Pazarlama", t, "Analitik", "Kampanya Yönetimi"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 30000, max: 60000 },
    workModelWeights: { onsite: 2, hybrid: 4, remote: 4 },
    workingHoursOptions: WORKING_HOURS_FLEX,
    languageOptions: LANG_IT,
    militaryOptions: MILITARY_DEFAULT
  })),
  {
    title: "Ürün Fotoğrafçısı",
    description: `E-ticaret sitemizde ve pazaryerlerinde sergilenecek ürünlerimizin görsel çekimlerini yapacak Fotoğrafçı arıyoruz.\n\nAranan Nitelikler:\n• Stüdyo ürün fotoğrafçılığında deneyimli\n• Photoshop, Lightroom programlarını ileri düzeyde kullanabilen\n• Portfolyo sunabilecek`,
    skills: ["Fotoğrafçılık", "E-Ticaret", "Photoshop", "Lightroom", "Görsel Tasarım"],
    educationLevels: EDU_ANY,
    experienceLevels: EXP_MID,
    salaryRange: { min: 22000, max: 35000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  }
];

// 11. Savunma Sanayi
SECTORS_AND_TEMPLATES_PART4["Savunma Sanayi"] = [
  ...["Gömülü Yazılım Mühendisi (C/C++)", "Mekatronik Mühendisi", "Radar Sistemleri Mühendisi", "Test Mühendisi"].map(t => ({
    title: t,
    description: `Savunma sanayi alanındaki milli projelerimizde görev alacak tecrübeli ${t} arıyoruz.\n\nİş Tanımı:\n• Askeri standartlara uygun donanım/yazılım tasarımı ve geliştirilmesi\n• Alt sistem seviyesi entegrasyon ve testlerin yapılması\n\nAranan Nitelikler:\n• İlgili mühendislik bölümlerinden mezun\n• Gizlilik dereceli projelerde çalışmaya engel durumu olmayan\n• İleri seviye teknik İngilizce bilen`,
    skills: ["Savunma Sanayi", t, "Ar-Ge", "Mühendislik", "Sistem Tasarımı"],
    educationLevels: EDU_UNI,
    experienceLevels: EXP_SENIOR,
    salaryRange: { min: 60000, max: 120000 },
    workModelWeights: { onsite: 9, hybrid: 1, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: ["İngilizce (Çok İyi)"],
    militaryOptions: ["Yapıldı", "Muaf"]
  }))
];

// 12. Turizm
SECTORS_AND_TEMPLATES_PART4["Turizm"] = [
  ...["Resepsiyonist", "Kat Hizmetleri Görevlisi (Housekeeping)", "Otel Müdürü", "Misafir İlişkileri Sorumlusu", "Cankurtaran"].map(t => ({
    title: t,
    description: `Otelimizde misafirlerimize en iyi konaklama deneyimini sunacak takım arkadaşları arıyoruz.\n\nAranan Nitelikler:\n• Turizm ve Otelcilik sektöründe deneyimli\n• Güleryüzlü, misafir memnuniyeti odaklı çalışan\n• Yoğun tempoya ayak uydurabilen`,
    skills: ["Turizm", "Otelcilik", t, "Misafir İlişkileri", "Hizmet"],
    educationLevels: t === "Otel Müdürü" ? EDU_UNI : EDU_ANY,
    experienceLevels: t === "Otel Müdürü" ? EXP_SENIOR : EXP_ENTRY,
    salaryRange: { min: 18000, max: t === "Otel Müdürü" ? 70000 : 30000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_SHIFT,
    languageOptions: t === "Kat Hizmetleri Görevlisi (Housekeeping)" ? LANG_DEFAULT : LANG_TOURISM,
    militaryOptions: MILITARY_DEFAULT
  }))
];

// 13. Tekstil
SECTORS_AND_TEMPLATES_PART4["Tekstil"] = [
  ...["Tekstil Mühendisi", "Modelist", "Makine Operatörü", "Ütü Paket Elemanı", "İhracat Uzmanı"].map(t => ({
    title: t,
    description: `Tekstil üretim/ihracat süreçlerimizde görev alacak ${t} arıyoruz.\n\nAranan Nitelikler:\n• Tekstil sektöründe ilgili pozisyonda deneyimli\n• Kalite standartlarına ve süreçlere hakim`,
    skills: ["Tekstil", "Üretim", t, "Kalite", "Hazır Giyim"],
    educationLevels: t.includes("Mühendis") || t.includes("Uzman") ? ["Üniversite"] : EDU_ANY,
    experienceLevels: EXP_ANY_INC_ENTRY,
    salaryRange: { min: 18000, max: 45000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: t.includes("Operatör") || t.includes("Eleman") ? WORKING_HOURS_SHIFT : WORKING_HOURS_OFFICE,
    languageOptions: t.includes("İhracat") ? ["İngilizce (İyi)"] : LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  }))
];

// Combine all default templates for unlisted sectors (like Telekomünikasyon, Temizlik vs)
const GENERIC_ROLES = [
  "Saha Operasyon Elemanı", "Çağrı Merkezi Müşteri Temsilcisi", "Temizlik Görevlisi", 
  "Özel Güvenlik Görevlisi (Silahsız)", "İdari İşler Uzmanı", "Teknik Servis Elemanı"
];

export const GENERIC_TEMPLATES: JobTemplate[] = GENERIC_ROLES.map(t => ({
  title: t,
  description: `Sektörün öncü firmasında görevlendirilmek üzere ${t} arıyoruz.\n\nAranan Nitelikler:\n• İlgili alanda çalışmaya istekli\n• Sorumluluk sahibi ve ekip çalışmasına yatkın`,
  skills: [t, "Operasyon", "Hizmet", "Müşteri İletişimi", "Destek"],
  educationLevels: EDU_ANY,
  experienceLevels: EXP_ANY_INC_ENTRY,
  salaryRange: { min: 17500, max: 30000 },
  workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
  workingHoursOptions: WORKING_HOURS_SHIFT,
  languageOptions: LANG_DEFAULT,
  militaryOptions: MILITARY_DEFAULT
}));
