import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const cities = [
  { name: 'İstanbul', weight: 30 }, { name: 'Ankara', weight: 15 }, { name: 'İzmir', weight: 10 },
  { name: 'Bursa', weight: 5 }, { name: 'Antalya', weight: 5 }, { name: 'Adana', weight: 2 },
  { name: 'Konya', weight: 2 }, { name: 'Gaziantep', weight: 2 }
];

const allTurkishCities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const workModels = ['onsite', 'onsite', 'onsite', 'hybrid', 'hybrid', 'remote', 'remote'];
const educationLevels = ['Üniversite', 'Üniversite', 'Üniversite', 'Yüksek Lisans', 'Ön Lisans', 'Fark Etmez'];
const experienceLevels = ['Yeni Mezun', 'Junior', 'Junior', 'Orta Düzey', 'Uzman', 'Yönetici'];
const militaryStatuses = ['Yapıldı', 'Yapıldı', 'Muaf', 'Tecilli', 'Fark Etmez', 'Fark Etmez'];
const languages = ['Fark Etmez', 'Fark Etmez', 'İngilizce (İyi)', 'İngilizce (Çok İyi)', 'İngilizce, Almanca'];

const DETAILED_ROLES = {
  "Teknoloji & Yazılım": [
    {
      title: "Frontend Developer (React)",
      description: "Modern web teknolojileri ile kullanıcı odaklı, performanslı arayüzler geliştirecek Frontend Developer arıyoruz. \n\nGörevler:\n- React ve Next.js kullanarak web uygulamaları geliştirmek.\n- Responsive ve mobil uyumlu tasarımlar hazırlamak.\n- REST API ve GraphQL entegrasyonlarını sağlamak.\n- Uygulama performansını ölçmek ve optimize etmek (Core Web Vitals vb.).",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux", "GraphQL", "Figma", "Git"]
    },
    {
      title: "Frontend Developer (Vue.js)",
      description: "Vue.js ekosistemine hakim, karmaşık arayüzleri kolayca hayata geçirebilecek takım arkadaşı arıyoruz.\n\nGörevler:\n- Vue 3 ve Nuxt.js ile ölçeklenebilir uygulamalar geliştirmek.\n- Pinia ile state yönetimi süreçlerini tasarlamak.\n- CI/CD süreçlerine katkıda bulunmak.",
      skills: ["Vue.js", "Nuxt.js", "JavaScript", "SCSS", "Pinia", "Webpack", "Docker"]
    },
    {
      title: "Backend Developer (Node.js/NestJS)",
      description: "Mikroservis mimarisinde çalışacak, yüksek trafiğe dayanıklı servisler geliştirecek Backend mühendisi arıyoruz.\n\nGörevler:\n- Node.js ve NestJS framework'ü ile RESTful API'ler tasarlamak.\n- PostgreSQL veritabanı mimarisini kurgulamak ve performans iyileştirmeleri yapmak.\n- Redis kullanarak caching stratejileri geliştirmek.\n- AWS üzerinde servisleri canlıya almak.",
      skills: ["Node.js", "NestJS", "TypeScript", "PostgreSQL", "Redis", "Docker", "AWS", "Microservices"]
    },
    {
      title: "Backend Developer (Java/Spring Boot)",
      description: "Kurumsal çapta projelerde yer alacak, Java Spring Boot teknolojilerinde uzman backend geliştirici arıyoruz.\n\nGörevler:\n- Spring Boot ile ölçeklenebilir backend servisleri kodlamak.\n- Kafka ile asenkron iletişim mimarisini kurmak.\n- Hibernate/JPA ile karmaşık veri modelleri tasarlamak.",
      skills: ["Java", "Spring Boot", "Hibernate", "PostgreSQL", "Kafka", "Kubernetes", "Jenkins"]
    },
    {
      title: "Full Stack Developer (MERN)",
      description: "Hem arayüz hem de sunucu tarafında tam donanımlı Full Stack Developer (MERN stack) arıyoruz.\n\nGörevler:\n- React ile dinamik SPA uygulamalar geliştirmek.\n- Node.js ve Express ile hızlı backend servisleri yazmak.\n- MongoDB üzerinde esnek veri yapıları oluşturmak.",
      skills: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript", "Redux", "Git"]
    },
    {
      title: "Mobil Yazılım Geliştirici (Flutter)",
      description: "Tek bir kod tabanından hem iOS hem Android için mükemmel çalışan mobil uygulamalar geliştirecek Flutter uzmanı arıyoruz.\n\nGörevler:\n- Flutter ve Dart kullanarak cross-platform uygulamalar yazmak.\n- BLoC veya Provider mimarilerini kullanmak.\n- Firebase servislerini (Auth, Firestore, Push Notifications) entegre etmek.",
      skills: ["Flutter", "Dart", "Firebase", "REST API", "BLoC", "Git", "Figma"]
    },
    {
      title: "Mobil Yazılım Geliştirici (iOS/Swift)",
      description: "Apple ekosistemine hakim, Native iOS uygulama geliştirme tecrübesi olan iOS Geliştirici arıyoruz.\n\nGörevler:\n- Swift ve SwiftUI kullanarak yüksek performanslı iOS uygulamaları oluşturmak.\n- CoreData kullanarak yerel veri saklama çözümleri uygulamak.\n- App Store yayın süreçlerini yönetmek.",
      skills: ["Swift", "SwiftUI", "iOS", "CoreData", "XCode", "CocoaPods", "REST API"]
    },
    {
      title: "Data Scientist",
      description: "Büyük veri setlerini analiz edip, şirkete değer katacak yapay zeka modelleri eğitecek Veri Bilimcisi arıyoruz.\n\nGörevler:\n- Python ve PyTorch/TensorFlow kullanarak makine öğrenmesi modelleri geliştirmek.\n- Pandas ve NumPy ile veri temizleme ve ön işleme yapmak.\n- NLP veya Computer Vision problemlerine yenilikçi çözümler bulmak.",
      skills: ["Python", "PyTorch", "TensorFlow", "Pandas", "SQL", "Scikit-Learn", "Machine Learning"]
    },
    {
      title: "DevOps Engineer",
      description: "Yazılım teslimat süreçlerini otomatize edecek, bulut altyapısını yönetecek DevOps mühendisi aranıyor.\n\nGörevler:\n- Kubernetes cluster'larını kurmak ve yönetmek.\n- GitLab CI/CD veya GitHub Actions ile pipeline oluşturmak.\n- Terraform kullanarak Infrastructure as Code (IaC) pratiklerini uygulamak.\n- Prometheus ve Grafana ile monitoring altyapısını sağlamak.",
      skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Linux", "Grafana"]
    },
    {
      title: "Veritabanı Yöneticisi (DBA)",
      description: "Şirketimizin kritik veritabanı altyapısını ayakta tutacak uzman DBA aranmaktadır.\n\nGörevler:\n- PostgreSQL ve Oracle veritabanlarının kurulumu ve optimizasyonunu sağlamak.\n- High Availability (Yüksek Erişilebilirlik) mimarisini kurmak.\n- Düzenli yedekleme ve Disaster Recovery testlerini yapmak.",
      skills: ["PostgreSQL", "Oracle DB", "SQL", "Linux", "Database Tuning", "Bash Scripting"]
    }
  ],
  "Tasarım": [
    {
      title: "UI/UX Tasarımcısı",
      description: "Kullanıcı deneyimini merkeze alarak, estetik ve işlevsel arayüzler tasarlayacak takım arkadaşı arıyoruz.\n\nGörevler:\n- Figma kullanarak web ve mobil uygulama tasarımları oluşturmak.\n- Wireframe, prototip ve kullanıcı testleri yapmak.\n- Yazılım ekibiyle dirsek teması halinde tasarımın koda aktarım sürecini yönetmek.",
      skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Adobe Illustrator", "Wireframing"]
    },
    {
      title: "Grafik Tasarımcı",
      description: "Sosyal medya ve kurumsal kimlik çalışmalarımızı yürütecek yetenekli grafik tasarımcı aranıyor.\n\nGörevler:\n- Adobe Photoshop ve Illustrator kullanarak sosyal medya postları hazırlamak.\n- Marka kimliğine uygun kampanya görselleri ve afişler tasarlamak.",
      skills: ["Adobe Photoshop", "Adobe Illustrator", "Graphic Design", "Branding", "Typography"]
    }
  ],
  "Pazarlama": [
    {
      title: "Dijital Pazarlama Uzmanı",
      description: "Markamızın dijital dünyadaki görünürlüğünü artıracak, performans odaklı pazarlama uzmanı arıyoruz.\n\nGörevler:\n- Google Ads ve Meta Ads kampanyalarını kurmak ve optimize etmek.\n- Google Analytics 4 üzerinden dönüşüm hunilerini (funnel) analiz etmek.\n- A/B testleri yaparak reklam bütçesini en verimli şekilde kullanmak.",
      skills: ["Google Ads", "Meta Ads", "Google Analytics 4", "SEO", "A/B Testing", "Performance Marketing"]
    },
    {
      title: "SEO Uzmanı",
      description: "Organik arama sonuçlarında bizi zirveye taşıyacak tecrübeli SEO uzmanı aranıyor.\n\nGörevler:\n- Semrush ve Ahrefs kullanarak kapsamlı anahtar kelime analizleri yapmak.\n- Teknik SEO denetimlerini gerçekleştirmek ve yazılım ekibine raporlamak.\n- Backlink stratejileri geliştirmek.",
      skills: ["SEO", "Semrush", "Ahrefs", "Google Search Console", "Content Strategy", "HTML"]
    }
  ],
  "Finans & Bankacılık": [
    {
      title: "Finansal Analist",
      description: "Şirketimizin finansal sağlığını analiz edip raporlayacak uzman arıyoruz.\n\nGörevler:\n- Aylık ve yıllık bütçe planlamalarını yapmak.\n- Excel (İleri Düzey) ve SAP kullanarak finansal raporlar hazırlamak.\n- Kar-zarar (P&L) tablolarını oluşturmak ve analiz etmek.",
      skills: ["Excel (İleri Düzey)", "SAP FI", "Financial Modeling", "Data Analysis", "Risk Management"]
    },
    {
      title: "Risk Yönetim Uzmanı",
      description: "Operasyonel ve finansal riskleri önceden tespit edip önlem alacak takım arkadaşı arıyoruz.\n\nGörevler:\n- Kredi risk skorlama modelleri üzerinde çalışmak.\n- Basel III kriterlerine uygun raporlamalar yapmak.\n- SQL kullanarak büyük veri setleri üzerinden risk analizi gerçekleştirmek.",
      skills: ["Risk Analysis", "SQL", "Basel III", "Banking", "Statistical Modeling"]
    }
  ],
  "Mühendislik": [
    {
      title: "Makine Mühendisi (Ar-Ge)",
      description: "Yeni ürün tasarımlarında aktif rol alacak, Ar-Ge departmanımızda çalışacak makine mühendisi arıyoruz.\n\nGörevler:\n- SolidWorks ve AutoCAD kullanarak 3D katı modelleme yapmak.\n- ANSYS ile termal ve yapısal analizleri gerçekleştirmek.\n- Prototip üretim süreçlerini takip etmek.",
      skills: ["SolidWorks", "AutoCAD", "ANSYS", "3D Modeling", "Ar-Ge", "Mekanik Tasarım"]
    },
    {
      title: "İnşaat Mühendisi (Şantiye Şefi)",
      description: "Büyük ölçekli konut projelerimizde sahayı yönetecek deneyimli şantiye şefi aranmaktadır.\n\nGörevler:\n- Şantiyedeki günlük operasyonları yönetmek ve iş güvenliğini sağlamak.\n- AutoCAD ile projeleri okumak ve metraj/hakediş hesaplamalarını yapmak.\n- Taşeron firmaları koordine etmek.",
      skills: ["AutoCAD", "Şantiye Yönetimi", "Hakediş ve Metraj", "İş Sağlığı ve Güvenliği", "Primavera P6"]
    }
  ],
  // Add a generic fallback for other sectors
  "Genel": [
    {
      title: "Operasyon Yöneticisi",
      description: "Şirketin günlük operasyonlarının sorunsuz yürümesini sağlayacak deneyimli yönetici aranıyor.\n\nGörevler:\n- Ekipler arası koordinasyonu sağlamak.\n- Süreç optimizasyonları yapmak ve verimliliği artırmak.\n- KPI'ları takip etmek ve raporlamak.",
      skills: ["Operasyon Yönetimi", "Liderlik", "MS Office", "Süreç İyileştirme", "Kriz Yönetimi"]
    },
    {
      title: "İnsan Kaynakları Uzmanı",
      description: "İşe alım, bordrolama ve çalışan bağlılığı süreçlerini yürütecek İK uzmanı arıyoruz.\n\nGörevler:\n- Mülakat süreçlerini organize etmek.\n- Performans değerlendirme sistemini yürütmek.\n- SGK ve İş Kanunu mevzuatlarını takip etmek.",
      skills: ["İşe Alım", "Bordrolama", "İş Kanunu (4857)", "Mülakat Teknikleri", "Performans Yönetimi"]
    }
  ]
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomCity = () => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const city of cities) {
    cumulative += city.weight;
    if (rand <= cumulative) return city.name;
  }
  return getRandomItem(allTurkishCities);
};

const getRandomDateInPast6Months = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 180));
  return date;
};

async function main() {
  console.log('Fetching companies...');
  const companies = await prisma.company.findMany({ select: { id: true, name: true, sector: true } });
  
  if (companies.length === 0) {
    console.error('No companies found. Please run the regular seed first.');
    return;
  }

  // Delete existing data to start fresh with new detailed schema
  console.log('Deleting existing applications, job skills, and jobs...');
  await prisma.application.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  // Do not delete users/companies!

  // First, gather all unique skills from our detailed roles
  const allUniqueSkills = new Set<string>();
  Object.values(DETAILED_ROLES).forEach(roles => {
    roles.forEach(role => {
      role.skills.forEach(skill => allUniqueSkills.add(skill));
    });
  });

  console.log(`Ensuring ${allUniqueSkills.size} unique skills exist in database...`);
  const skillIdMap = new Map<string, string>(); // name -> id

  for (const skillName of Array.from(allUniqueSkills)) {
    const skill = await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName }
    });
    skillIdMap.set(skill.name, skill.id);
  }

  console.log(`Starting to generate hyper-detailed jobs for ${companies.length} companies...`);

  const jobsToCreate: any[] = [];
  const jobSkillsToCreate: any[] = [];
  
  // Target: ~60,000 jobs
  // We have ~310 companies. 60000 / 310 ≈ 193 jobs per company on average.
  
  const shuffledCompanies = [...companies].sort(() => 0.5 - Math.random());
  let totalJobsGenerated = 0;

  for (let i = 0; i < shuffledCompanies.length; i++) {
    const company = shuffledCompanies[i];
    
    // Tiered job counts
    let jobCount = 50; 
    if (i < shuffledCompanies.length * 0.1) {
      jobCount = 800; // Tier 1 (e.g. Aselsan, Ford - huge companies)
    } else if (i < shuffledCompanies.length * 0.3) {
      jobCount = 300; // Tier 2
    } else if (i < shuffledCompanies.length * 0.6) {
      jobCount = 150; // Tier 3
    }

    // Find applicable roles for this company's sector
    let sectorKey = "Genel";
    if (company.sector && DETAILED_ROLES[company.sector as keyof typeof DETAILED_ROLES]) {
      sectorKey = company.sector;
    } else if (company.sector === "Otomotiv" || company.sector === "Savunma Sanayi") {
      sectorKey = "Mühendislik";
    }

    const rolesAvailable = [...DETAILED_ROLES[sectorKey as keyof typeof DETAILED_ROLES], ...DETAILED_ROLES["Genel"]];
    // Also inject some tech roles into every company (every company needs IT)
    const itRoles = DETAILED_ROLES["Teknoloji & Yazılım"];

    for (let j = 0; j < jobCount; j++) {
      // 30% chance for an IT role in a non-IT company
      const useItRole = sectorKey !== "Teknoloji & Yazılım" && Math.random() < 0.3;
      const rolePool = useItRole ? itRoles : rolesAvailable;
      
      const roleTemplate = getRandomItem(rolePool);

      const jobId = uuidv4();
      const city = getRandomCity();
      const workModel = getRandomItem(workModels);
      const isRemote = workModel === 'remote';
      
      const salaryMin = Math.random() > 0.2 ? Math.floor(35 + Math.random() * 50) * 1000 : null; // 35k to 85k
      const salaryMax = salaryMin ? salaryMin + Math.floor(15 + Math.random() * 30) * 1000 : null;
      
      jobsToCreate.push({
        id: jobId,
        title: roleTemplate.title,
        description: roleTemplate.description,
        companyId: company.id,
        location: isRemote ? 'Uzaktan' : city,
        city: city,
        district: 'Merkez',
        salaryMin,
        salaryMax,
        currency: 'TRY',
        workModel,
        educationLevel: getRandomItem(educationLevels),
        experienceYears: getRandomItem(experienceLevels),
        militaryStatus: getRandomItem(militaryStatuses),
        language: getRandomItem(languages),
        remote: isRemote,
        viewCount: Math.floor(Math.random() * 8000),
        createdAt: getRandomDateInPast6Months()
      });

      // Create JobSkills
      // A job requires some core skills from the template, and maybe randomly drops 1 to create variety
      const skillsToRequire = getRandomItems(roleTemplate.skills, Math.max(3, roleTemplate.skills.length - 1));
      for (const skillName of skillsToRequire) {
        jobSkillsToCreate.push({
          jobId: jobId,
          skillId: skillIdMap.get(skillName)!,
          required: true
        });
      }
      
      totalJobsGenerated++;
    }
  }

  console.log(`Generated ${totalJobsGenerated} jobs with ${jobSkillsToCreate.length} skills mapping in memory. Starting DB inserts...`);

  const JOB_BATCH_SIZE = 5000;
  for (let i = 0; i < jobsToCreate.length; i += JOB_BATCH_SIZE) {
    const batch = jobsToCreate.slice(i, i + JOB_BATCH_SIZE);
    await prisma.job.createMany({ data: batch });
    console.log(`Inserted Jobs batch ${Math.floor(i / JOB_BATCH_SIZE) + 1} / ${Math.ceil(jobsToCreate.length / JOB_BATCH_SIZE)}`);
  }

  const SKILL_BATCH_SIZE = 10000;
  for (let i = 0; i < jobSkillsToCreate.length; i += SKILL_BATCH_SIZE) {
    const batch = jobSkillsToCreate.slice(i, i + SKILL_BATCH_SIZE);
    await prisma.jobSkill.createMany({ data: batch });
    console.log(`Inserted JobSkills batch ${Math.floor(i / SKILL_BATCH_SIZE) + 1} / ${Math.ceil(jobSkillsToCreate.length / SKILL_BATCH_SIZE)}`);
  }

  console.log(`Successfully seeded database with ${totalJobsGenerated} hyper-detailed jobs!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
