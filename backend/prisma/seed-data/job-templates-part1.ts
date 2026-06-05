export interface JobTemplate {
  title: string;
  description: string;
  skills: string[];
  educationLevels: string[];
  experienceLevels: string[];
  salaryRange: { min: number; max: number };
  workModelWeights: { onsite: number; hybrid: number; remote: number };
  workingHoursOptions: string[][];
  languageOptions: string[];
  militaryOptions: string[];
}

export type SectorTemplates = Record<string, JobTemplate[]>;

export const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export const WORKING_HOURS_OFFICE = [["08:00-17:00"], ["09:00-18:00"], ["08:30-17:30"]];
export const WORKING_HOURS_SHIFT = [["Vardiyalı"], ["08:00-16:00", "16:00-00:00", "00:00-08:00"], ["10:00-19:00"]];
export const WORKING_HOURS_FLEX = [["Esnek / Belirlenmemiş"], ["10:00-19:00"]];
export const WORKING_HOURS_HEALTH = [["Nöbet Usulü"], ["08:00-17:00"], ["Vardiyalı"]];
export const WORKING_HOURS_RETAIL = [["Vardiyalı"], ["10:00-22:00"], ["09:00-21:00"]];

export const MILITARY_DEFAULT = ["Yapıldı", "Tecilli", "Muaf", "Fark Etmez"];
export const MILITARY_MALE_ONLY = ["Yapıldı", "Muaf"];

export const LANG_IT = ["İngilizce (İyi)", "İngilizce (Çok İyi)"];
export const LANG_TOURISM = ["İngilizce (İyi)", "İngilizce, Almanca", "İngilizce, Rusça", "Arapça", "Rusça", "İngilizce, Arapça"];
export const LANG_DEFAULT = ["Fark Etmez", "İngilizce (Temel)"];

export const EXP_ALL = ["Yeni Mezun", "Junior", "Orta Düzey", "Uzman", "Yönetici"];
export const EXP_SENIOR = ["Uzman", "Yönetici"];
export const EXP_ENTRY = ["Yeni Mezun", "Junior", "Orta Düzey"];
export const EXP_MID = ["Orta Düzey", "Uzman"];
export const EXP_ANY_INC_ENTRY = ["Yeni Mezun", "Junior", "Orta Düzey", "Uzman", "Yönetici"];

export const EDU_UNI = ["Üniversite", "Yüksek Lisans"];
export const EDU_HS = ["Lise", "Ön Lisans", "Üniversite"];
export const EDU_ANY = ["Fark Etmez", "Lise"];

export const SECTORS_AND_TEMPLATES: SectorTemplates = {};

// 1. Teknoloji & Yazılım
function generateTechTemplates() {
  const templates: JobTemplate[] = [];
  
  const frameworks = [
    { name: "React", lang: "JavaScript/TypeScript", backend: "Node.js", db: "PostgreSQL" },
    { name: "Vue.js", lang: "JavaScript/TypeScript", backend: "Laravel", db: "MySQL" },
    { name: "Angular", lang: "TypeScript", backend: ".NET Core", db: "MSSQL" },
  ];

  for (const fw of frameworks) {
    templates.push({
      title: `Frontend Geliştirici (${fw.name})`,
      description: `Şirketimiz bünyesinde web projelerimizin arayüzlerini geliştirmek üzere Frontend Geliştirici arıyoruz.\n\nİş Tanımı:\n• ${fw.name} kullanarak modern ve performanslı web arayüzleri geliştirmek\n• Backend API'leri ile entegrasyon sağlamak\n• Responsive ve cross-browser uyumlu tasarımlar ortaya çıkarmak\n\nAranan Nitelikler:\n• En az 2 yıl frontend deneyimi\n• İleri seviye ${fw.lang}, HTML ve CSS bilgisi\n• Git versiyon kontrol sistemi kullanımı`,
      skills: ["Frontend", fw.name, fw.lang, "HTML", "CSS", "Git", "REST API", "Responsive Tasarım"],
      educationLevels: EDU_UNI,
      experienceLevels: EXP_ENTRY,
      salaryRange: { min: 35000, max: 70000 },
      workModelWeights: { onsite: 2, hybrid: 5, remote: 8 },
      workingHoursOptions: WORKING_HOURS_FLEX,
      languageOptions: LANG_IT,
      militaryOptions: MILITARY_DEFAULT
    });

    templates.push({
      title: `Full Stack Web Geliştirici (${fw.name} + ${fw.backend})`,
      description: `Hem frontend hem backend süreçlerimizde görev alacak, uçtan uca özellikler geliştirecek Full Stack Geliştirici arıyoruz.\n\nİş Tanımı:\n• Frontend tarafında ${fw.name}, backend tarafında ${fw.backend} kullanarak geliştirmeler yapmak\n• ${fw.db} veritabanı tasarımlarını ve sorgularını optimize etmek\n• Yeni web projelerinin mimarisini kurmak\n\nAranan Nitelikler:\n• ${fw.name} ve ${fw.backend} ile en az 3 yıl profesyonel deneyim\n• RESTful servis mimarisine hakimiyet\n• ${fw.db} tecrübesi`,
      skills: ["Full Stack", fw.name, fw.backend, fw.db, fw.lang, "Git", "API", "Web Geliştirme", "SQL"],
      educationLevels: EDU_UNI,
      experienceLevels: EXP_MID,
      salaryRange: { min: 50000, max: 95000 },
      workModelWeights: { onsite: 2, hybrid: 4, remote: 7 },
      workingHoursOptions: WORKING_HOURS_FLEX,
      languageOptions: LANG_IT,
      militaryOptions: MILITARY_DEFAULT
    });
  }

  const backends = [
    { name: "Node.js (NestJS)", lang: "TypeScript", db: "PostgreSQL" },
    { name: "Java (Spring Boot)", lang: "Java", db: "Oracle" },
    { name: "Python (Django)", lang: "Python", db: "PostgreSQL" },
    { name: ".NET Core (C#)", lang: "C#", db: "MSSQL" },
    { name: "PHP (Laravel)", lang: "PHP", db: "MySQL" },
    { name: "Go (Golang)", lang: "Go", db: "PostgreSQL" },
  ];

  for (const be of backends) {
    templates.push({
      title: `Backend Geliştirici (${be.name})`,
      description: `Milyonlarca kullanıcının eriştiği servislerimizin backend mimarisini geliştirecek ve optimize edecek Backend Geliştirici arıyoruz.\n\nİş Tanımı:\n• ${be.name} ile yüksek performanslı, ölçeklenebilir ve güvenli API'ler geliştirmek\n• ${be.db} veritabanı sorgularını ve mimarisini optimize etmek\n• Mikroservis mimarisine uygun geliştirmeler yapmak\n\nAranan Nitelikler:\n• ${be.lang} diline ve ekosistemine derinlemesine hakimiyet\n• İlişkisel ve NoSQL veritabanı tecrübesi\n• Docker, Redis, Message Queue (RabbitMQ vb.) teknolojilerine aşinalık`,
      skills: ["Backend", be.name, be.lang, be.db, "API", "Mikroservis", "Docker", "Redis", "Git", "SQL"],
      educationLevels: EDU_UNI,
      experienceLevels: EXP_MID,
      salaryRange: { min: 45000, max: 100000 },
      workModelWeights: { onsite: 2, hybrid: 5, remote: 7 },
      workingHoursOptions: WORKING_HOURS_FLEX,
      languageOptions: LANG_IT,
      militaryOptions: MILITARY_DEFAULT
    });
  }

  const mobiles = [
    { name: "iOS", tech: "Swift", extra: "UIKit, SwiftUI" },
    { name: "Android", tech: "Kotlin", extra: "Android SDK, Jetpack" },
    { name: "React Native", tech: "JavaScript/TypeScript", extra: "Redux, Mobile UI" },
    { name: "Flutter", tech: "Dart", extra: "BLoC, Provider" },
  ];

  for (const m of mobiles) {
    templates.push({
      title: `${m.name} Uygulama Geliştirici`,
      description: `Mobil uygulamalarımızı geliştirecek ve milyonlarca cihaza ulaştıracak Mobil Uygulama Geliştiricisi arıyoruz.\n\nİş Tanımı:\n• ${m.tech} kullanarak performanslı mobil uygulamalar geliştirmek\n• Backend API servisleri ile entegrasyon\n• UI/UX ekibiyle koordineli çalışarak en iyi kullanıcı deneyimini sağlamak\n\nAranan Nitelikler:\n• ${m.name} platformunda en az 2 yıl deneyim\n• ${m.extra} konularında bilgi sahibi\n• App Store / Google Play yayına alma süreçlerine hakimiyet`,
      skills: ["Mobil Geliştirme", m.name, m.tech, "API", "Git", "Mobile UI", "App Store/Play Store"],
      educationLevels: EDU_UNI,
      experienceLevels: EXP_ENTRY,
      salaryRange: { min: 40000, max: 80000 },
      workModelWeights: { onsite: 2, hybrid: 4, remote: 6 },
      workingHoursOptions: WORKING_HOURS_FLEX,
      languageOptions: LANG_IT,
      militaryOptions: MILITARY_DEFAULT
    });
  }

  const devops = ["AWS", "Azure", "GCP", "Kubernetes", "Linux"];
  for (const d of devops) {
    templates.push({
      title: `DevOps Mühendisi (${d})`,
      description: `Altyapı süreçlerimizi otomatize edecek, CI/CD pipeline'larını kuracak ve yönetecek DevOps Mühendisi arıyoruz.\n\nİş Tanımı:\n• CI/CD süreçlerinin (GitLab CI, Jenkins vb.) kurulumu ve yönetimi\n• ${d} ortamlarının yönetimi ve ölçeklendirilmesi\n• Monitoring (Prometheus, Grafana) sistemlerinin kurulması\n• Infrastructure as Code (Terraform, Ansible) pratiklerinin uygulanması`,
      skills: ["DevOps", d, "CI/CD", "Docker", "Monitoring", "IaC", "Linux", "Sistem Yönetimi"],
      educationLevels: EDU_UNI,
      experienceLevels: EXP_SENIOR,
      salaryRange: { min: 60000, max: 120000 },
      workModelWeights: { onsite: 1, hybrid: 3, remote: 8 },
      workingHoursOptions: WORKING_HOURS_FLEX,
      languageOptions: ["İngilizce (Çok İyi)"],
      militaryOptions: MILITARY_DEFAULT
    });
  }

  const dataRoles = [
    { title: "Veri Bilimci (Data Scientist)", skills: ["Python", "Machine Learning", "Pandas", "SQL", "Deep Learning"] },
    { title: "Veri Mühendisi (Data Engineer)", skills: ["Python", "Spark", "SQL", "ETL", "Hadoop", "Airflow"] },
    { title: "Veri Analisti", skills: ["SQL", "Excel", "Power BI", "Tableau", "Veri Analizi"] },
    { title: "Yapay Zeka Mühendisi", skills: ["Python", "TensorFlow", "PyTorch", "NLP", "LLM", "Deep Learning"] }
  ];

  for (const dr of dataRoles) {
    templates.push({
      title: dr.title,
      description: `Şirketimizin veri odaklı vizyonuna katkı sağlayacak ${dr.title} arıyoruz.\n\nİş Tanımı:\n• Büyük veri setlerini analiz ederek iş süreçlerine değer katmak\n• Gelişmiş makine öğrenmesi/analiz modelleri geliştirmek\n• Veri akışlarını (pipeline) tasarlamak ve optimize etmek\n\nAranan Nitelikler:\n• ${dr.skills.slice(0, 3).join(", ")} konularında ileri düzey bilgi\n• Analitik düşünme ve problem çözme becerisi`,
      skills: dr.skills,
      educationLevels: EDU_UNI,
      experienceLevels: EXP_MID,
      salaryRange: { min: 50000, max: 110000 },
      workModelWeights: { onsite: 3, hybrid: 5, remote: 7 },
      workingHoursOptions: WORKING_HOURS_FLEX,
      languageOptions: LANG_IT,
      militaryOptions: MILITARY_DEFAULT
    });
  }

  const security = ["Penetrasyon Test Uzmanı", "Siber Güvenlik Analisti", "SOC Uzmanı", "Bilgi Güvenliği Mühendisi"];
  for (const s of security) {
    templates.push({
      title: s,
      description: `Kurumumuzun dijital altyapısını siber tehditlere karşı koruyacak ${s} arıyoruz.\n\nİş Tanımı:\n• Güvenlik zafiyetlerinin tespiti ve raporlanması\n• Güvenlik ihlallerine karşı izleme ve müdahale yapılması\n• Güvenlik politikalarının geliştirilmesi\n\nAranan Nitelikler:\n• Ağ güvenliği, web güvenliği ve kriptografi konularına hakimiyet\n• Sızma testleri ve zafiyet tarama araçlarında tecrübe`,
      skills: ["Siber Güvenlik", "Network", "Linux", "Sızma Testi", "Security", "CEH", "Ağ Güvenliği"],
      educationLevels: EDU_UNI,
      experienceLevels: EXP_MID,
      salaryRange: { min: 55000, max: 100000 },
      workModelWeights: { onsite: 5, hybrid: 4, remote: 4 },
      workingHoursOptions: WORKING_HOURS_FLEX,
      languageOptions: LANG_IT,
      militaryOptions: MILITARY_DEFAULT
    });
  }
  
  const others = [
    { title: "UI/UX Tasarımcısı", skills: ["Figma", "UI", "UX", "Adobe XD", "Prototyping", "Kullanıcı Deneyimi"] },
    { title: "QA Otomasyon Mühendisi", skills: ["Selenium", "Cypress", "Appium", "Test Otomasyon", "Python", "Java", "QA"] },
    { title: "Teknik Proje Yöneticisi", skills: ["Agile", "Scrum", "Jira", "Proje Yönetimi", "Yazılım Geliştirme Döngüsü"] },
    { title: "Scrum Master", skills: ["Scrum", "Agile", "Kanban", "Fasilitasyon", "Jira"] },
    { title: "Oyun Geliştirici (Unity)", skills: ["Unity", "C#", "Oyun Geliştirme", "3D", "Oyun Motorları"] },
    { title: "Gömülü Sistemler Mühendisi", skills: ["C", "C++", "RTOS", "Mikrodenetleyici", "Gömülü Sistemler", "Donanım"] },
    { title: "Sistem Yöneticisi (Linux)", skills: ["Linux", "Bash", "Sistem Yönetimi", "Ağ Yönetimi", "Güvenlik"] },
  ];

  for (const o of others) {
    templates.push({
      title: o.title,
      description: `Bilişim ekibimizin büyüyen kadrosunda görevlendirilmek üzere ${o.title} pozisyonunda takım arkadaşı arıyoruz.\n\nGörev ve Sorumluluklar:\n• Rolün gerektirdiği alanlarda teknik ve operasyonel süreçleri yürütmek\n• İlgili departmanlarla uyum içinde çalışmak\n\nBeklentiler:\n• İlgili alanda en az 3 yıl tecrübe\n• ${o.skills.slice(0, 3).join(", ")} araçlarına/teknolojilerine derinlemesine hakimiyet`,
      skills: o.skills,
      educationLevels: EDU_UNI,
      experienceLevels: EXP_MID,
      salaryRange: { min: 40000, max: 90000 },
      workModelWeights: { onsite: 3, hybrid: 5, remote: 5 },
      workingHoursOptions: WORKING_HOURS_FLEX,
      languageOptions: LANG_IT,
      militaryOptions: MILITARY_DEFAULT
    });
  }

  SECTORS_AND_TEMPLATES["Teknoloji & Yazılım"] = templates;
}

generateTechTemplates();
