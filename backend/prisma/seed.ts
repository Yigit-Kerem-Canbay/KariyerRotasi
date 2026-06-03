import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const SECTORS = [
  "Teknoloji & Yazılım", "Savunma Sanayi", "Perakende", "Gıda & Restoran", 
  "Lojistik & Taşıma", "E-Ticaret", "Telekomünikasyon", "Finans & Bankacılık",
  "İnşaat & Gayrimenkul", "Sağlık", "Eğitim", "Otomotiv", "Tekstil", "Turizm", "Temizlik & Hizmet"
];

const EMPLOYEE_RANGES = [
  "1-10", "10-20", "20-50", "50-100", "100-250", "250-500", "500-1000", "1000-3000", "3000-5000", "5000+"
];

const REAL_COMPANIES = [
  { name: "Aselsan", sector: "Savunma Sanayi", emp: "5000+", loc: "Ankara", logo: "bg-blue-900", init: "A" },
  { name: "Ford Otosan", sector: "Otomotiv", emp: "5000+", loc: "Kocaeli", logo: "bg-blue-700", init: "F" },
  { name: "Trendyol", sector: "E-Ticaret", emp: "5000+", loc: "İstanbul", logo: "bg-orange-500", init: "T" },
  { name: "Yemeksepeti", sector: "E-Ticaret", emp: "3000-5000", loc: "İstanbul", logo: "bg-red-500", init: "Y" },
  { name: "Getir", sector: "Lojistik & Taşıma", emp: "5000+", loc: "İstanbul", logo: "bg-purple-600", init: "G" },
  { name: "A101", sector: "Perakende", emp: "5000+", loc: "İstanbul", logo: "bg-cyan-500", init: "A" },
  { name: "Şok Marketler", sector: "Perakende", emp: "5000+", loc: "İstanbul", logo: "bg-yellow-400", init: "Ş" },
  { name: "BİM", sector: "Perakende", emp: "5000+", loc: "İstanbul", logo: "bg-red-600", init: "B" },
  { name: "Migros", sector: "Perakende", emp: "5000+", loc: "İstanbul", logo: "bg-orange-400", init: "M" },
  { name: "Koç Holding", sector: "Finans & Bankacılık", emp: "5000+", loc: "İstanbul", logo: "bg-red-700", init: "K" },
  { name: "Sabancı Holding", sector: "Finans & Bankacılık", emp: "5000+", loc: "İstanbul", logo: "bg-blue-800", init: "S" },
  { name: "Turkcell", sector: "Telekomünikasyon", emp: "5000+", loc: "İstanbul", logo: "bg-yellow-500", init: "T" },
  { name: "Türk Telekom", sector: "Telekomünikasyon", emp: "5000+", loc: "Ankara", logo: "bg-blue-500", init: "T" },
  { name: "Vodafone", sector: "Telekomünikasyon", emp: "3000-5000", loc: "İstanbul", logo: "bg-red-600", init: "V" },
  { name: "Akbank", sector: "Finans & Bankacılık", emp: "5000+", loc: "İstanbul", logo: "bg-red-500", init: "A" },
  { name: "Garanti BBVA", sector: "Finans & Bankacılık", emp: "5000+", loc: "İstanbul", logo: "bg-green-600", init: "G" },
  { name: "Yapı Kredi", sector: "Finans & Bankacılık", emp: "5000+", loc: "İstanbul", logo: "bg-blue-600", init: "Y" },
  { name: "QNB Finansbank", sector: "Finans & Bankacılık", emp: "5000+", loc: "İstanbul", logo: "bg-blue-800", init: "Q" },
  { name: "THY", sector: "Lojistik & Taşıma", emp: "5000+", loc: "İstanbul", logo: "bg-red-600", init: "T" },
  { name: "Pegasus", sector: "Lojistik & Taşıma", emp: "3000-5000", loc: "İstanbul", logo: "bg-yellow-400", init: "P" },
  { name: "Misaş Market", sector: "Perakende", emp: "250-500", loc: "Elazığ", logo: "bg-green-500", init: "M" },
  { name: "TUSAŞ", sector: "Savunma Sanayi", emp: "5000+", loc: "Ankara", logo: "bg-sky-600", init: "T" },
  { name: "Roketsan", sector: "Savunma Sanayi", emp: "1000-3000", loc: "Ankara", logo: "bg-slate-700", init: "R" },
  { name: "Havelsan", sector: "Savunma Sanayi", emp: "1000-3000", loc: "Ankara", logo: "bg-blue-600", init: "H" },
  { name: "Beko", sector: "Otomotiv", emp: "5000+", loc: "İstanbul", logo: "bg-zinc-800", init: "B" }, // Assuming white goods/electronics as general
  { name: "Arçelik", sector: "Teknoloji & Yazılım", emp: "5000+", loc: "İstanbul", logo: "bg-red-600", init: "A" },
  { name: "Vestel", sector: "Teknoloji & Yazılım", emp: "5000+", loc: "Manisa", logo: "bg-red-500", init: "V" },
  { name: "LC Waikiki", sector: "Tekstil", emp: "5000+", loc: "İstanbul", logo: "bg-blue-500", init: "L" },
  { name: "DeFacto", sector: "Tekstil", emp: "5000+", loc: "İstanbul", logo: "bg-slate-800", init: "D" },
  { name: "Koton", sector: "Tekstil", emp: "3000-5000", loc: "İstanbul", logo: "bg-black", init: "K" },
];

const GENERATED_PREFIXES = ["Öz", "Ak", "Doğan", "Güven", "Yıldız", "Şahin", "Demir", "Çelik", "Kaya", "Arı", "Kuzey", "Güneş", "Ay", "Yeni", "İlk"];
const GENERATED_SUFFIXES = ["Tedarik", "Lojistik", "Bilişim", "Yazılım", "Marketleri", "Gıda", "Tekstil", "İnşaat", "Mimarlık", "Danışmanlık", "Eğitim Kurumları", "Temizlik", "Nakliyat"];
const COMPANY_TYPES = ["A.Ş.", "Ltd. Şti.", "Grubu", "A.O."];

const JOB_TITLES_BY_SECTOR: Record<string, string[]> = {
  "Teknoloji & Yazılım": ["Frontend Yazılım Geliştirici", "Backend Developer", "Sistem Yöneticisi", "Veritabanı Uzmanı", "Ürün Yöneticisi"],
  "Savunma Sanayi": ["Gömülü Sistemler Mühendisi", "Makine Mühendisi", "Savunma Stratejisti", "C++ Geliştirici", "Test Mühendisi"],
  "Perakende": ["Mağaza Müdürü", "Kasiyer", "Reyon Görevlisi", "Depo Elemanı", "Bölge Sorumlusu"],
  "Gıda & Restoran": ["Aşçı", "Garson", "Mutfak Görevlisi", "Restoran Müdürü", "Kurye"],
  "Lojistik & Taşıma": ["Kamyon Şoförü", "Lojistik Yetkilisi", "Depo Sorumlusu", "Operasyon Uzmanı", "Kurye"],
  "E-Ticaret": ["E-Ticaret Uzmanı", "Dijital Pazarlama Uzmanı", "Grafik Tasarımcı", "Depo Görevlisi", "Web Geliştirici"],
  "Telekomünikasyon": ["Ağ Mühendisi", "Müşteri Temsilcisi", "Saha Operasyon Uzmanı", "Cihaz Kurulum Teknikeri", "Veri Analisti"],
  "Finans & Bankacılık": ["Müşteri Yönetmeni", "Finansal Analist", "Gişe Görevlisi", "Yatırım Danışmanı", "Banka Memuru"],
  "İnşaat & Gayrimenkul": ["İnşaat Mühendisi", "Mimar", "Şantiye Şefi", "Düz İşçi", "Harita Mühendisi"],
  "Sağlık": ["Hemşire", "Pratisyen Hekim", "Sağlık Yönetimi Uzmanı", "Tıbbi Sekreter", "Hasta Bakıcı"],
  "Eğitim": ["Öğretmen", "Eğitim Koordinatörü", "Rehberlik Danışmanı", "Okul Müdürü", "Temizlik Görevlisi"],
  "Otomotiv": ["Otomotiv Mühendisi", "CNC Operatörü", "Montaj Elemanı", "Oto Bakım Ustası", "Kalite Kontrol Uzmanı"],
  "Tekstil": ["Tekstil Mühendisi", "Makine Operatörü", "Modelist", "Kalite Kontrol", "Ütü Paket Elemanı"],
  "Turizm": ["Resepsiyonist", "Kat Görevlisi", "Tur Rehberi", "Otel Müdürü", "Aşçı"],
  "Temizlik & Hizmet": ["Temizlik Görevlisi", "Bina Görevlisi", "Güvenlik Görevlisi", "Peyzaj Uzmanı", "Teknik Servis"]
};

const DUMMY_LOREM = "Şirketimiz, yılların verdiği tecrübe ile sektördeki lider firmalardan biri olmayı hedeflemektedir. Müşteri memnuniyetini ön planda tutan anlayışımız, yenilikçi ve sürdürülebilir politikalarımızla hizmet vermeye devam ediyoruz.";

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate an additional ~270 companies
function generateCompanies(count: number) {
  const generated: any[] = [];
  for (let i = 0; i < count; i++) {
    const pre = randomItem(GENERATED_PREFIXES);
    const suf = randomItem(GENERATED_SUFFIXES);
    const type = randomItem(COMPANY_TYPES);
    const name = `${pre} ${suf} ${type}`;
    
    // Attempt to guess sector from suffix
    let sector = randomItem(SECTORS);
    if (suf === "Bilişim" || suf === "Yazılım") sector = "Teknoloji & Yazılım";
    if (suf === "Lojistik" || suf === "Nakliyat") sector = "Lojistik & Taşıma";
    if (suf === "Marketleri" || suf === "Gıda") sector = "Perakende";
    if (suf === "Tekstil") sector = "Tekstil";
    if (suf === "İnşaat" || suf === "Mimarlık") sector = "İnşaat & Gayrimenkul";
    if (suf === "Temizlik") sector = "Temizlik & Hizmet";
    if (suf === "Eğitim Kurumları") sector = "Eğitim";

    generated.push({
      name,
      sector,
      emp: randomItem(EMPLOYEE_RANGES),
      loc: randomItem(CITIES),
      logo: `bg-slate-${randomInt(5, 9)}00`,
      init: name.charAt(0).toUpperCase()
    });
  }
  return generated;
}

const WORKING_HOURS_OPTIONS = [
  ["08:00-17:00"],
  ["09:00-18:00"],
  ["12:00-18:00"],
  ["17:00-00:00"],
  ["00:00-08:00"],
  ["Vardiyalı"],
  ["08:00-17:00", "17:00-00:00"], // Birden fazla seçenek sunanlar
  ["Esnek / Belirlenmemiş"]
];

async function main() {
  console.log("Preparing to seed 300+ companies and ~63,500 jobs...");
  const ALL_COMPANIES = [...REAL_COMPANIES, ...generateCompanies(280)];

  // Create credentials report
  let mdContent = `# Kariyer Rotası - Otomatik Oluşturulan Şirket ve Giriş Bilgileri\n\n`;
  mdContent += `Bu belgede veritabanına eklenen **${ALL_COMPANIES.length} adet** şirketin giriş bilgileri yer almaktadır.\n\n`;
  mdContent += `**Ortak Parola:** \`Test1234!\`\n\n`;
  mdContent += `| Şirket Adı | Sektör | Çalışan | Şehir | E-Posta Arşivi |\n`;
  mdContent += `|---|---|---|---|---|\n`;

  const defaultPassword = await bcrypt.hash("Test1234!", 10);

  let i = 1;
  for (const comp of ALL_COMPANIES) {
    const defaultEmail = `info${i}@${comp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.tr`;
    
    // Create Employer
    const user = await prisma.user.create({
      data: {
        name: comp.name + " Yetkilisi",
        email: defaultEmail,
        passwordHash: defaultPassword,
        role: "corporate_employer",
        emailVerified: true
      }
    });

    // Create Company
    const company = await prisma.company.create({
      data: {
        name: comp.name,
        description: DUMMY_LOREM,
        website: `https://www.${comp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.tr`,
        location: comp.loc,
        sector: comp.sector,
        employeeCount: comp.emp,
        logoUrl: comp.logo, // We store full class name or url here. Since we used "bg-..." tailwind classes for fake logos
        verificationStatus: "APPROVED",
        isVerified: true,
        ownerId: user.id
      }
    });

    // Collect company info to generate jobs later
    comp.companyId = company.id;

    mdContent += `| ${comp.name} | ${comp.sector} | ${comp.emp} | ${comp.loc} | \`${defaultEmail}\` |\n`;
    i++;
  }

  // Generate ~63,500 Jobs
  console.log(`\nGenerating 63,500 jobs across 310 companies...`);
  const jobsData: any[] = [];
  
  for (const comp of ALL_COMPANIES) {
    const numJobs = randomInt(190, 220); // ~205 jobs per company * 310 = ~63,550 jobs
    const availableTitles = JOB_TITLES_BY_SECTOR[comp.sector] || ["Açık Pozisyon", "Takım Arkadaşı", "Genel Başvuru"];
    
    for (let j = 0; j < numJobs; j++) {
      const jobTitle = randomItem(availableTitles);
      const isRemote = Math.random() > 0.8;
      
      // 80% fixed hours, 20% flexible/undefined
      const isFlexible = Math.random() > 0.8;
      let hours = ["Esnek / Belirlenmemiş"];
      if (!isFlexible) {
        hours = randomItem(WORKING_HOURS_OPTIONS.slice(0, 7)); // Exclude the last flexible option
      }

      jobsData.push({
        title: jobTitle,
        description: `${comp.name} bünyesinde ${jobTitle} pozisyonunda görevlendirilmek üzere takım arkadaşları arıyoruz.`,
        companyId: comp.companyId,
        location: isRemote ? "Uzaktan" : randomItem(CITIES),
        salaryMin: randomInt(20000, 40000),
        salaryMax: randomInt(45000, 80000),
        remote: isRemote,
        workingHours: hours
      });
    }
  }

  // Bulk insert jobs in chunks
  const chunkSize = 5000;
  let inserted = 0;
  for (let c = 0; c < jobsData.length; c += chunkSize) {
    const chunk = jobsData.slice(c, c + chunkSize);
    await prisma.job.createMany({
      data: chunk
    });
    inserted += chunk.length;
    console.log(`Inserted ${inserted}/${jobsData.length} jobs...`);
  }

  const credentialsPath = path.join(process.cwd(), "..", "sirket_bilgileri.md");
  fs.writeFileSync(credentialsPath, mdContent);
  console.log(`\n\nSuccess! Created ${ALL_COMPANIES.length} Companies and their Jobs.`);
  console.log(`Credentials saved to: ${credentialsPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
