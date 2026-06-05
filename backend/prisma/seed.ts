import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import {
  SECTORS_AND_TEMPLATES,
  CITIES,
  JobTemplate
} from './seed-data/job-templates-part1';
import { SECTORS_AND_TEMPLATES_PART2 } from './seed-data/job-templates-part2';
import { SECTORS_AND_TEMPLATES_PART3 } from './seed-data/job-templates-part3';
import { SECTORS_AND_TEMPLATES_PART4, GENERIC_TEMPLATES as GT4 } from './seed-data/job-templates-part4';

dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ALL_SECTORS: Record<string, JobTemplate[]> = {
  ...SECTORS_AND_TEMPLATES,
  ...SECTORS_AND_TEMPLATES_PART2,
  ...SECTORS_AND_TEMPLATES_PART3,
  ...SECTORS_AND_TEMPLATES_PART4,
};

const ALL_SECTOR_NAMES = [
  "Teknoloji & Yazılım", "Gıda & Restoran", "Sağlık", "Perakende", 
  "İnşaat & Gayrimenkul", "Eğitim", "Finans & Bankacılık", "Otomotiv", 
  "Lojistik & Taşıma", "E-Ticaret", "Savunma Sanayi", "Turizm", "Tekstil",
  "Telekomünikasyon", "Temizlik", "Güvenlik", "Enerji", "Medya & İletişim",
  "Tarım & Hayvancılık", "Kozmetik"
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomCityBasedOnPopulation() {
  const rand = Math.random();
  if (rand < 0.25) return "İstanbul";
  if (rand < 0.35) return "Ankara";
  if (rand < 0.42) return "İzmir";
  if (rand < 0.48) return "Bursa";
  if (rand < 0.53) return "Antalya";
  return getRandomItem(CITIES);
}

function selectWorkModel(weights: { onsite: number; hybrid: number; remote: number }) {
  const total = weights.onsite + weights.hybrid + weights.remote;
  const rand = Math.random() * total;
  if (rand < weights.onsite) return "onsite";
  if (rand < weights.onsite + weights.hybrid) return "hybrid";
  return "remote";
}

async function main() {
  console.log("Database temizleniyor...");
  await prisma.jobSkill.deleteMany({});
  await prisma.savedJob.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.skill.deleteMany({});
  
  // Create system user for companies
  let systemUser = await prisma.user.findUnique({ where: { email: 'system@kariyerrotasi.com' } });
  if (!systemUser) {
    const hashedPassword = await bcrypt.hash('system123', 10);
    systemUser = await prisma.user.create({
      data: {
        email: 'system@kariyerrotasi.com',
        passwordHash: hashedPassword,
        name: 'Sistem Yöneticisi',
        role: 'admin',
      }
    });
  }

  console.log("Şirketler oluşturuluyor...");
  const sectorCompanies: Record<string, string[]> = {};
  
  // We generate 5-20 companies per sector
  for (const sector of ALL_SECTOR_NAMES) {
    const companyIds: string[] = [];
    const count = getRandomInt(10, 30);
    for (let i = 0; i < count; i++) {
      const companyId = uuidv4();
      const suffixes = ["A.Ş.", "Ltd. Şti.", "Ticaret A.Ş.", "Grup", "Holding"];
      await prisma.company.create({
        data: {
          id: companyId,
          name: `Firma-${sector.replace(/\s+/g, '')}-${i} ${getRandomItem(suffixes)}`,
          sector: sector,
          ownerId: systemUser.id,
          isVerified: true,
          verificationStatus: 'APPROVED'
        }
      });
      companyIds.push(companyId);
    }
    sectorCompanies[sector] = companyIds;
  }

  console.log("Beceriler (Skills) ekleniyor...");
  const uniqueSkills = new Set<string>();
  
  for (const sectorName of ALL_SECTOR_NAMES) {
    const templates = ALL_SECTORS[sectorName] || GT4;
    for (const t of templates) {
      t.skills.forEach(s => uniqueSkills.add(s));
    }
  }

  const skillData = Array.from(uniqueSkills).map(name => ({ name }));
  await prisma.skill.createMany({ data: skillData, skipDuplicates: true });
  
  const dbSkills = await prisma.skill.findMany();
  const skillMap = new Map(dbSkills.map(s => [s.name, s.id]));

  console.log("İş ilanları üretiliyor... Hedef: ~100,000 ilan");
  
  const jobsToCreate: any[] = [];
  const jobSkillsToCreate: any[] = [];
  
  for (const sector of ALL_SECTOR_NAMES) {
    const templates = ALL_SECTORS[sector] || GT4;
    
    let sectorJobCount = 4000;
    if (sector === "Teknoloji & Yazılım") sectorJobCount = 15000;
    else if (sector === "Perakende" || sector === "Gıda & Restoran") sectorJobCount = 10000;
    else if (sector === "İnşaat & Gayrimenkul" || sector === "Sağlık") sectorJobCount = 8000;
    else if (sector === "Savunma Sanayi") sectorJobCount = 2000;
    
    console.log(`${sector} sektörü için ${sectorJobCount} ilan hazırlanıyor...`);

    for (let i = 0; i < sectorJobCount; i++) {
      const template = getRandomItem(templates);
      const city = getRandomCityBasedOnPopulation();
      const companyId = getRandomItem(sectorCompanies[sector]);
      
      const salaryBase = getRandomInt(template.salaryRange.min, template.salaryRange.max);
      
      const jobId = uuidv4();
      const isRemote = template.workModelWeights.remote > template.workModelWeights.onsite;
      
      jobsToCreate.push({
        id: jobId,
        title: template.title,
        companyId: companyId,
        location: city,
        city: city,
        district: "Merkez",
        workModel: selectWorkModel(template.workModelWeights),
        salaryMin: salaryBase,
        salaryMax: salaryBase + getRandomInt(5000, 15000),
        currency: "TRY",
        description: template.description,
        educationLevel: getRandomItem(template.educationLevels),
        experienceYears: getRandomItem(template.experienceLevels),
        workingHours: template.workingHoursOptions[Math.floor(Math.random() * template.workingHoursOptions.length)],
        militaryStatus: getRandomItem(template.militaryOptions),
        language: getRandomItem(template.languageOptions),
        remote: isRemote,
        createdAt: new Date(Date.now() - getRandomInt(0, 30 * 24 * 60 * 60 * 1000)),
      });
      
      const uniqueTemplateSkills = [...new Set(template.skills)];
      for (const skillName of uniqueTemplateSkills) {
        const skillId = skillMap.get(skillName);
        if (skillId) {
          jobSkillsToCreate.push({
            jobId: jobId,
            skillId: skillId,
          });
        }
      }
    }
  }

  console.log(`Toplam ${jobsToCreate.length} ilan oluşturuldu. Veritabanına aktarılıyor (Bu işlem biraz sürebilir)...`);
  
  const chunkSize = 5000;
  for (let i = 0; i < jobsToCreate.length; i += chunkSize) {
    const chunk = jobsToCreate.slice(i, i + chunkSize);
    await prisma.job.createMany({ data: chunk });
    process.stdout.write(`\rJobs: ${Math.min(i + chunkSize, jobsToCreate.length)} / ${jobsToCreate.length}`);
  }
  console.log("\nJobs tablosu dolduruldu.");

  for (let i = 0; i < jobSkillsToCreate.length; i += chunkSize) {
    const chunk = jobSkillsToCreate.slice(i, i + chunkSize);
    await prisma.jobSkill.createMany({ data: chunk, skipDuplicates: true });
    process.stdout.write(`\rJobSkills: ${Math.min(i + chunkSize, jobSkillsToCreate.length)} / ${jobSkillsToCreate.length}`);
  }
  console.log("\nJobSkill bağlantıları kuruldu.");

  console.log("İşlem başarıyla tamamlandı!");
}

main()
  .catch((e) => {
    console.error("Hata oluştu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
