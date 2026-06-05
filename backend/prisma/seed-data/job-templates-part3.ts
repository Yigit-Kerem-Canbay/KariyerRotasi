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
  MILITARY_DEFAULT,
  MILITARY_MALE_ONLY
} from './job-templates-part1';

export const SECTORS_AND_TEMPLATES_PART3: SectorTemplates = {};

// 6. Eğitim
SECTORS_AND_TEMPLATES_PART3["Eğitim"] = [
  ...["Matematik", "İngilizce", "Fen Bilimleri", "Türkçe", "Sınıf", "Okul Öncesi", "Rehberlik"].map(t => ({
    title: `${t} Öğretmeni`,
    description: `Özel okulumuzda görevlendirilmek üzere tecrübeli ve vizyoner ${t} Öğretmeni arıyoruz.\n\nİş Tanımı:\n• Müfredata uygun ders planlarının hazırlanması ve işlenmesi\n• Öğrenci gelişimlerinin takibi ve veli bilgilendirmesi\n• Kurumiçi eğitim ve projelere katılım\n\nAranan Nitelikler:\n• Eğitim Fakültesi mezunu veya formasyon sahibi\n• Alanında en az 2 yıl deneyimli\n• Çağdaş eğitim teknolojilerini (akıllı tahta, LMS vb.) etkin kullanabilen`,
    skills: ["Eğitim", "Öğretmenlik", t, "Pedagoji", "Öğrenci Gelişimi", "Sınıf Yönetimi"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 25000, max: 45000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: [["08:00-17:00"]],
    languageOptions: t === "İngilizce" ? ["İngilizce (Çok İyi)"] : LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  })),
  {
    title: "Eğitim Koordinatörü",
    description: `Okulumuzun akademik süreçlerini planlayıp yönetecek Eğitim Koordinatörü arıyoruz.\n\nAranan Nitelikler:\n• Eğitim yönetimi ve planlaması konusunda en az 5 yıl tecrübeli\n• Müfredat geliştirme ve öğretmen performans değerlendirmesi yapabilen\n• Liderlik vasıflarına sahip`,
    skills: ["Eğitim Koordinasyonu", "Müfredat Yönetimi", "Eğitim Planlama", "Liderlik", "Performans Değerlendirme"],
    educationLevels: ["Üniversite", "Yüksek Lisans"],
    experienceLevels: EXP_SENIOR,
    salaryRange: { min: 40000, max: 65000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  },
  {
    title: "Özel Eğitim Uzmanı",
    description: `Özel eğitim ve rehabilitasyon merkezimizde görev alacak Özel Eğitim Uzmanı arıyoruz.\n\nAranan Nitelikler:\n• Özel Eğitim Öğretmenliği lisans mezunu\n• Gelişimsel farklılıkları olan çocuklarla çalışma tecrübesi olan\n• Sabırlı, güler yüzlü ve ekip çalışmasına yatkın`,
    skills: ["Özel Eğitim", "Rehabilitasyon", "Çocuk Gelişimi", "Eğitim"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_ANY_INC_ENTRY,
    salaryRange: { min: 25000, max: 40000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  }
];

// 7. Finans & Bankacılık
SECTORS_AND_TEMPLATES_PART3["Finans & Bankacılık"] = [
  ...["Bireysel Portföy Yöneticisi", "Kurumsal Müşteri Temsilcisi", "Gişe Asistanı"].map(t => ({
    title: t,
    description: `Bankamız şubelerinde görevlendirilmek üzere ${t} arıyoruz.\n\nİş Tanımı:\n• Müşteri taleplerinin karşılanması ve bankacılık işlemlerinin yürütülmesi\n• Banka ürünlerinin (kredi, mevduat, sigorta) tanıtımı ve satışı\n• Müşteri portföyünün büyütülmesi\n\nAranan Nitelikler:\n• Üniversitelerin ilgili bölümlerinden (İktisat, İşletme vb.) mezun\n• İletişim becerisi yüksek, ikna kabiliyeti kuvvetli\n• SPK Düzey 1 belgesine sahip (tercihen)`,
    skills: ["Bankacılık", t, "Müşteri Yönetimi", "Satış", "Finansal Ürünler", "İletişim"],
    educationLevels: ["Üniversite"],
    experienceLevels: t === "Gişe Asistanı" ? EXP_ENTRY : EXP_MID,
    salaryRange: { min: 25000, max: 55000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: [["09:00-18:00"]],
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  })),
  {
    title: "Finansal Analist",
    description: `Şirketimizin finans departmanında görev alacak, veri odaklı kararlar alınmasına destek olacak Finansal Analist arıyoruz.\n\nAranan Nitelikler:\n• Finansal modelleme ve değerleme konularında tecrübeli\n• İleri düzey Excel bilgisi olan\n• Bilanço, gelir tablosu ve nakit akım tablosu analizine hakim`,
    skills: ["Finansal Analiz", "Modelleme", "Excel", "Bilanço", "Raporlama"],
    educationLevels: ["Üniversite", "Yüksek Lisans"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 40000, max: 70000 },
    workModelWeights: { onsite: 6, hybrid: 4, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: ["İngilizce (İyi)"],
    militaryOptions: MILITARY_DEFAULT
  },
  {
    title: "Mali Müşavir",
    description: `Mali işler süreçlerimizi yasal mevzuatlara uygun olarak yönetecek SMMM belgeli Mali Müşavir arıyoruz.\n\nAranan Nitelikler:\n• SMMM belgesine sahip\n• Vergi mevzuatı, e-fatura, e-defter süreçlerine hakim\n• ERP (Logo, SAP, Mikro vb.) sistemlerini aktif kullanabilen`,
    skills: ["Mali Müşavirlik", "Muhasebe", "Vergi Mevzuatı", "SMMM", "ERP", "E-Fatura"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_SENIOR,
    salaryRange: { min: 45000, max: 80000 },
    workModelWeights: { onsite: 8, hybrid: 2, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  }
];

// 8. Otomotiv
SECTORS_AND_TEMPLATES_PART3["Otomotiv"] = [
  ...["Otomotiv Mühendisi (Ar-Ge)", "Kalite Kontrol Mühendisi", "Üretim Planlama Uzmanı"].map(t => ({
    title: t,
    description: `Otomotiv ana sanayi ve yan sanayi tedarik süreçlerimizde görev alacak ${t} arıyoruz.\n\nİş Tanımı:\n• Üretim/Ar-Ge projelerinde aktif rol alma\n• Süreç iyileştirme (Lean, 6 Sigma) çalışmalarını yürütme\n• IATF 16949 standartlarına uygunluk takibi\n\nAranan Nitelikler:\n• Makine, Otomotiv veya Endüstri Mühendisliği mezunu\n• IATF 16949 ve Core Tools (APQP, FMEA vb.) bilgisi`,
    skills: ["Otomotiv", t, "IATF 16949", "Üretim", "Kalite Kontrol", "Mühendislik"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 40000, max: 75000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: ["İngilizce (İyi)"],
    militaryOptions: MILITARY_DEFAULT
  })),
  ...["CNC Operatörü (Torna)", "Oto Boya Ustası", "Oto Mekatronik Teknisyeni", "Kaporta Ustası"].map(t => ({
    title: t,
    description: `Fabrikamızda / yetkili servisimizde görevlendirilmek üzere ${t} arıyoruz.\n\nAranan Nitelikler:\n• Meslek Lisesi veya Meslek Yüksekokullarının ilgili bölümlerinden mezun\n• Alanında en az 3 yıl saha/üretim tecrübesi olan\n• Vardiyalı çalışabilecek (bazı roller için)`,
    skills: ["Otomotiv", t, "Teknisyen", "Bakım Onarım", "Üretim"],
    educationLevels: ["Lise", "Ön Lisans"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 25000, max: 40000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_SHIFT,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_MALE_ONLY
  })),
  {
    title: "Servis Danışmanı",
    description: `Otomotiv yetkili servisimizde müşterilerimizi karşılayıp süreçleri yönetecek Servis Danışmanı arıyoruz.\n\nAranan Nitelikler:\n• Otomotiv bakım onarım süreçleri ve yedek parça hakkında bilgili\n• Müşteri ilişkileri ve ikna kabiliyeti yüksek\n• B Sınıfı ehliyet sahibi`,
    skills: ["Otomotiv", "Servis Danışmanı", "Yedek Parça", "Müşteri Memnuniyeti", "Satış Sonrası"],
    educationLevels: ["Ön Lisans", "Üniversite"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 25000, max: 35000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  }
];
