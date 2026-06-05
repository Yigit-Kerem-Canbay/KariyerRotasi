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

export const SECTORS_AND_TEMPLATES_PART2: SectorTemplates = {};

// 2. Gıda & Restoran
SECTORS_AND_TEMPLATES_PART2["Gıda & Restoran"] = [
  ...["Türk Mutfağı", "Uzak Doğu Mutfağı", "İtalyan Mutfağı", "Akdeniz Mutfağı", "Soğuk Mutfak"].map(m => ({
    title: `${m} Aşçısı`,
    description: `Restoranımızın mutfak bölümünde görevlendirilmek üzere ${m} konusunda uzman aşçı arıyoruz.\n\nİş Tanımı:\n• ${m} menülerinin hazırlanması ve sunumu\n• Mutfak hijyen standartlarına uyulması\n• Stok takibi ve sipariş yönetimi\n\nAranan Nitelikler:\n• En az 5 yıl ${m} deneyimi\n• Tercihen aşçılık okulu/gastronomi mezunu\n• Yoğun iş temposuna uyum sağlayabilecek`,
    skills: ["Aşçılık", m, "Mutfak", "Hijyen", "Menü Planlama", "Stok Yönetimi", "Gastronomi"],
    educationLevels: EDU_HS,
    experienceLevels: EXP_SENIOR,
    salaryRange: { min: 30000, max: 55000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_SHIFT,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  })),
  ...["Garson", "Komi", "Barmen", "Barista", "Hostes"].map(role => ({
    title: `${role} (Cafe / Restoran)`,
    description: `Şubelerimizde görevlendirilmek üzere dinamik, güler yüzlü ve misafir memnuniyetine önem veren ${role} arıyoruz.\n\nİş Tanımı:\n• Misafirlerin karşılanması ve siparişlerin alınması\n• İçecek ve yiyecek servisinin yapılması\n• Salon düzeni ve temizliğinin sağlanması\n\nAranan Nitelikler:\n• Tercihen yeme-içme sektöründe tecrübeli\n• İletişim becerisi yüksek, diksiyonu düzgün\n• Vardiyalı çalışabilecek`,
    skills: [role, "Servis", "Müşteri İlişkileri", "İletişim", "Yeme-İçme Sektörü"],
    educationLevels: EDU_ANY,
    experienceLevels: EXP_ENTRY,
    salaryRange: { min: 20000, max: 35000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_SHIFT,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  })),
  {
    title: "Vale (B Sınıfı Ehliyet)",
    description: `Restoranımızda misafirlerimizin araçlarının güvenli bir şekilde park edilmesini sağlayacak Vale arıyoruz.\n\nİş Tanımı:\n• Gelen misafir araçlarının teslim alınması ve park edilmesi\n• Araçların çıkışta güvenle teslim edilmesi\n\nAranan Nitelikler:\n• B Sınıfı ehliyet sahibi ve aktif araç kullanan\n• İletişimi kuvvetli, prezentabl`,
    skills: ["Vale", "Sürücü", "Otopark", "Müşteri Karşılama", "Araç Kullanımı"],
    educationLevels: EDU_ANY,
    experienceLevels: ["Fark Etmez", "Junior"],
    salaryRange: { min: 20000, max: 28000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_SHIFT,
    languageOptions: ["Fark Etmez"],
    militaryOptions: MILITARY_MALE_ONLY
  },
  {
    title: "Gıda Mühendisi (Kalite Kontrol)",
    description: `Üretim tesisimizde kalite standartlarının sağlanması ve kontrolünden sorumlu Gıda Mühendisi arıyoruz.\n\nİş Tanımı:\n• Hammadde ve son ürün kalite kontrollerinin yapılması\n• ISO 22000 ve HACCP standartlarının uygulanması ve denetimi\n• Üretim hijyen standartlarının takibi\n\nAranan Nitelikler:\n• Üniversitelerin Gıda Mühendisliği bölümünden mezun\n• Gıda güvenliği ve kalite yönetim sistemlerine hakim`,
    skills: ["Gıda Mühendisliği", "Kalite Kontrol", "ISO 22000", "HACCP", "Gıda Güvenliği", "Hijyen"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 35000, max: 55000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_IT,
    militaryOptions: MILITARY_DEFAULT
  }
];

// 3. Sağlık
SECTORS_AND_TEMPLATES_PART2["Sağlık"] = [
  ...["Sporcu Beslenmesi Uzmanı", "Klinik Beslenme Uzmanı", "Anne-Çocuk Beslenmesi", "Bariatrik Cerrahi Diyetisyeni"].map(d => ({
    title: `Diyetisyen (${d})`,
    description: `Sağlık merkezimizde danışanlarımıza profesyonel hizmet verecek Diyetisyen arıyoruz.\n\nİş Tanımı:\n• Danışanların beslenme alışkanlıklarının değerlendirilmesi\n• ${d} alanında kişiye özel beslenme programları hazırlanması\n• Danışan takibi ve motivasyonunun sağlanması\n\nAranan Nitelikler:\n• Beslenme ve Diyetetik lisans mezunu\n• ${d} konusunda deneyimli veya yüksek lisans yapmış`,
    skills: ["Diyetisyen", "Beslenme", "Sağlık", d, "Danışmanlık", "Kişisel Gelişim"],
    educationLevels: ["Üniversite", "Yüksek Lisans"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 25000, max: 45000 },
    workModelWeights: { onsite: 8, hybrid: 2, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  })),
  ...["Yoğun Bakım", "Poliklinik", "Ameliyathane", "Acil Servis", "Yenidoğan"].map(h => ({
    title: `Hemşire (${h})`,
    description: `Hastanemizin ${h} ünitesinde görevlendirilmek üzere tecrübeli Hemşire arıyoruz.\n\nİş Tanımı:\n• Hastaların tedavi ve bakım süreçlerinin yürütülmesi\n• Hekim direktiflerinin eksiksiz uygulanması\n• ${h} standartlarına ve hasta güvenliğine uyulması\n\nAranan Nitelikler:\n• Hemşirelik bölümü mezunu\n• ${h} alanında en az 2 yıl deneyimli`,
    skills: ["Hemşirelik", h, "Hasta Bakımı", "Sağlık", "İlk Yardım", "Tedavi Yönetimi"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 30000, max: 50000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_HEALTH,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  })),
  {
    title: "Klinik Psikolog",
    description: `Kliniğimizde yetişkin/ergen danışanlarımıza hizmet verecek Klinik Psikolog arıyoruz.\n\nAranan Nitelikler:\n• Psikoloji lisans ve Klinik Psikoloji yüksek lisans mezunu\n• İlgili terapi ekollerinde (BDT, EMDR, Psikanaliz vb.) eğitimlerini tamamlamış\n• Danışan gizliliğine ve etik kurallara azami önem veren`,
    skills: ["Psikoloji", "Klinik Psikoloji", "Terapi", "Psikolojik Danışmanlık", "BDT", "Sağlık"],
    educationLevels: ["Yüksek Lisans"],
    experienceLevels: EXP_SENIOR,
    salaryRange: { min: 35000, max: 70000 },
    workModelWeights: { onsite: 6, hybrid: 3, remote: 1 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  },
  {
    title: "Fizyoterapist",
    description: `Fizik tedavi ve rehabilitasyon merkezimizde görevlendirilmek üzere Fizyoterapist arıyoruz.\n\nAranan Nitelikler:\n• Fizyoterapi ve Rehabilitasyon lisans mezunu\n• Manuel terapi, egzersiz reçetelemesi konularına hakim\n• İnsan ilişkileri kuvvetli, güler yüzlü`,
    skills: ["Fizyoterapi", "Rehabilitasyon", "Manuel Terapi", "Egzersiz", "Sağlık"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 25000, max: 40000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  },
  {
    title: "Tıbbi Sekreter",
    description: `Hastane polikliniklerinde hasta kabul, randevu ve evrak işlemlerini yürütecek Tıbbi Sekreter arıyoruz.\n\nAranan Nitelikler:\n• Tıbbi Dokümantasyon ve Sekreterlik mezunu\n• Diksiyonu düzgün, sabırlı ve iletişim yönü güçlü\n• Hastane otomasyon sistemlerini (HBYS) kullanabilen`,
    skills: ["Tıbbi Sekreter", "Hasta Kabul", "Randevu Yönetimi", "Sağlık", "İletişim", "HBYS"],
    educationLevels: ["Ön Lisans"],
    experienceLevels: EXP_ENTRY,
    salaryRange: { min: 18000, max: 25000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_HEALTH,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  }
];

// 4. Perakende
SECTORS_AND_TEMPLATES_PART2["Perakende"] = [
  ...["Mağaza Müdürü", "Mağaza Müdür Yardımcısı"].map(t => ({
    title: t,
    description: `Perakende zincirimizin mağazalarından birini yönetecek ${t} arıyoruz.\n\nİş Tanımı:\n• Mağazanın satış, stok ve personel operasyonlarının yürütülmesi\n• Müşteri memnuniyetinin maksimize edilmesi\n• Merkez stratejilerinin mağazada uygulanması ve hedeflerin gerçekleştirilmesi\n\nAranan Nitelikler:\n• Perakende mağazacılık sektöründe en az 3 yıl yönetici tecrübesi\n• Liderlik ve ekip yönetimi becerilerine sahip`,
    skills: ["Mağaza Yönetimi", "Perakende", "Satış", "Stok Yönetimi", "Ekip Yönetimi", "Müşteri Memnuniyeti"],
    educationLevels: EDU_HS,
    experienceLevels: EXP_SENIOR,
    salaryRange: { min: 35000, max: 50000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_RETAIL,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  })),
  ...["Giyim", "Teknoloji / Elektronik", "Kozmetik", "Gıda"].map(c => ({
    title: `Satış Danışmanı (${c})`,
    description: `Mağazalarımızda görev alacak, ${c} kategorisinde uzman Satış Danışmanı arıyoruz.\n\nİş Tanımı:\n• Müşterilere ürünler hakkında doğru bilgi vermek\n• Satış hedefleri doğrultusunda müşteri ihtiyaçlarına yönelik ürün sunmak\n• Reyon düzenini ve temizliğini sağlamak\n\nAranan Nitelikler:\n• Tercihen ${c} ürünleri satışında deneyimli\n• Güleryüzlü, ikna kabiliyeti yüksek`,
    skills: ["Satış", c, "Müşteri İletişimi", "Perakende", "Mağazacılık", "İkna Kabiliyeti"],
    educationLevels: EDU_ANY,
    experienceLevels: EXP_ENTRY,
    salaryRange: { min: 18000, max: 26000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_RETAIL,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  })),
  {
    title: "Kasiyer",
    description: `Mağazalarımızda kasa işlemlerini hızlı ve güler yüzle gerçekleştirecek Kasiyer arıyoruz.\n\nİş Tanımı:\n• Müşteri ürün ödemelerini almak\n• Kasa açılış ve kapanış işlemlerini eksiksiz yapmak\n• Kasa bölgesi düzenini sağlamak\n\nAranan Nitelikler:\n• Kasa sistemleri kullanımına yatkın\n• Dikkatli ve sorumluluk sahibi`,
    skills: ["Kasa İşlemleri", "Kasiyer", "Perakende", "Müşteri İletişimi", "Hesap Takibi"],
    educationLevels: EDU_ANY,
    experienceLevels: EXP_ENTRY,
    salaryRange: { min: 17500, max: 22000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_RETAIL,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  },
  {
    title: "Görsel Mağazacılık Uzmanı (Visual Merchandiser)",
    description: `Markamızın vitrin ve mağaza içi görsel düzenlemelerinden sorumlu olacak Görsel Mağazacılık Uzmanı arıyoruz.\n\nAranan Nitelikler:\n• Görsel düzenleme, vitrin tasarımı konularında deneyimli\n• Moda trendlerini yakından takip eden\n• Yenilikçi, estetik vizyona sahip`,
    skills: ["Görsel Mağazacılık", "Vitrin Tasarımı", "Moda", "Tasarım", "Perakende"],
    educationLevels: ["Üniversite", "Ön Lisans"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 25000, max: 40000 },
    workModelWeights: { onsite: 8, hybrid: 2, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  }
];

// 5. İnşaat & Gayrimenkul
SECTORS_AND_TEMPLATES_PART2["İnşaat & Gayrimenkul"] = [
  ...["Şantiye Şefi", "Saha Mühendisi", "Hakediş ve Metraj Mühendisi", "Teknik Ofis Mühendisi"].map(t => ({
    title: `İnşaat Mühendisi (${t})`,
    description: `Devam eden büyük ölçekli üstyapı / altyapı projelerimizde görevlendirilmek üzere ${t} arıyoruz.\n\nİş Tanımı:\n• Proje bütçe, iş programı ve kalite hedeflerine uygunluğun takibi\n• Taşeron yönetimi ve saha imalatlarının kontrolü\n• Merkez ofis ve saha arasındaki koordinasyon\n\nAranan Nitelikler:\n• İnşaat Mühendisliği bölümü mezunu\n• AutoCAD, MS Project gibi mesleki yazılımları aktif kullanabilen\n• Alanında tecrübeli`,
    skills: ["İnşaat Mühendisliği", t, "AutoCAD", "Proje Yönetimi", "Saha Uygulamaları", "Şantiye"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_SENIOR,
    salaryRange: { min: 45000, max: 90000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: ["Fark Etmez", "İngilizce (İyi)"],
    militaryOptions: MILITARY_MALE_ONLY
  })),
  ...["İç Mimar", "Peyzaj Mimarı", "Mimar (Konsept Tasarım)"].map(m => ({
    title: m,
    description: `Mimari tasarım stüdyomuzda konsept projeler geliştirecek ${m} arıyoruz.\n\nAranan Nitelikler:\n• İlgili lisans programlarından mezun\n• 3Ds Max, SketchUp, Revit, AutoCAD, Photoshop programlarına ileri derecede hakim\n• Tasarım yönü kuvvetli, detay çözebilen, vizyoner`,
    skills: ["Mimarlık", m, "Tasarım", "3Ds Max", "Revit", "AutoCAD", "SketchUp"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_MID,
    salaryRange: { min: 35000, max: 60000 },
    workModelWeights: { onsite: 8, hybrid: 2, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: ["İngilizce (İyi)"],
    militaryOptions: MILITARY_DEFAULT
  })),
  {
    title: "Gayrimenkul Danışmanı",
    description: `Sektörün öncü markalarından olan ofisimizde çalışmak üzere girişimci ruhlu Gayrimenkul Danışmanları arıyoruz.\n\nİş Tanımı:\n• Bölge uzmanlık alanı oluşturarak portföy (satılık/kiralık) geliştirmek\n• Alıcı/satıcı müşterilerin gayrimenkul taleplerine profesyonel çözümler sunmak\n\nAranan Nitelikler:\n• İletişim becerisi yüksek, ikna kabiliyeti kuvvetli\n• Yüksek gelir hedefleyen, prime dayalı sistemde çalışabilecek`,
    skills: ["Gayrimenkul", "Satış", "Müşteri İlişkileri", "Pazarlama", "İletişim", "Emlak Danışmanlığı"],
    educationLevels: EDU_HS,
    experienceLevels: EXP_ANY_INC_ENTRY,
    salaryRange: { min: 17002, max: 150000 },
    workModelWeights: { onsite: 2, hybrid: 8, remote: 0 },
    workingHoursOptions: WORKING_HOURS_FLEX,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  },
  {
    title: "İş Güvenliği Uzmanı (A/B Sınıfı)",
    description: `Büyük ölçekli şantiye projelerimizde iş sağlığı ve güvenliği süreçlerini yönetecek Uzman arıyoruz.\n\nAranan Nitelikler:\n• ÇSGB onaylı A veya B Sınıfı İSG Uzmanı belgesine sahip\n• Şantiye tecrübesi olan\n• İSG mevzuatlarına ve saha uygulamalarına tam hakim`,
    skills: ["İş Güvenliği", "İSG", "Şantiye Güvenliği", "Mevzuat", "Denetim"],
    educationLevels: ["Üniversite"],
    experienceLevels: EXP_SENIOR,
    salaryRange: { min: 45000, max: 75000 },
    workModelWeights: { onsite: 10, hybrid: 0, remote: 0 },
    workingHoursOptions: WORKING_HOURS_OFFICE,
    languageOptions: LANG_DEFAULT,
    militaryOptions: MILITARY_DEFAULT
  }
];
