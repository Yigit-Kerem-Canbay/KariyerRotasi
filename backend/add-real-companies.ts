import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const REAL_COMPANIES = [
  { name: 'Trendyol', website: 'trendyol.com', sector: 'E-Ticaret' },
  { name: 'Getir', website: 'getir.com.tr', sector: 'E-Ticaret' },
  { name: 'Koç Holding', website: 'koc.com.tr', sector: 'Holding' },
  { name: 'Aselsan', website: 'aselsan.com.tr', sector: 'Savunma Sanayi' },
  { name: 'Türk Hava Yolları', website: 'thy.com.tr', sector: 'Havacılık' },
  { name: 'Garanti BBVA', website: 'garantibbva.com.tr', sector: 'Finans & Bankacılık' },
  { name: 'Beko', website: 'beko.com.tr', sector: 'Teknoloji & Yazılım' },
  { name: 'Arçelik', website: 'arcelik.com.tr', sector: 'Teknoloji & Yazılım' },
  { name: 'TUSAŞ', website: 'tusas.com.tr', sector: 'Savunma Sanayi' },
  { name: 'Vodafone', website: 'vodafone.com.tr', sector: 'Telekomünikasyon' },
  { name: 'BİM', website: 'bim.com.tr', sector: 'Perakende' },
  { name: 'ŞOK Market', website: 'sokmarket.com.tr', sector: 'Perakende' },
  { name: 'DeFacto', website: 'defacto.com.tr', sector: 'Perakende' },
  { name: 'Pegasus Hava Yolları', website: 'flypgs.com.tr', sector: 'Havacılık' }
];

async function main() {
  const systemUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (!systemUser) {
    console.error("No admin user found. Make sure to run seed first.");
    return;
  }

  for (const comp of REAL_COMPANIES) {
    const existing = await prisma.company.findFirst({ where: { name: comp.name } });
    let companyId;
    
    if (existing) {
      console.log(`Updating ${comp.name}...`);
      await prisma.company.update({
        where: { id: existing.id },
        data: { website: comp.website, sector: comp.sector }
      });
      companyId = existing.id;
    } else {
      console.log(`Creating ${comp.name}...`);
      const created = await prisma.company.create({
        data: {
          id: uuidv4(),
          name: comp.name,
          website: comp.website,
          sector: comp.sector,
          ownerId: systemUser.id,
          isVerified: true,
          verificationStatus: 'APPROVED'
        }
      });
      companyId = created.id;
    }
    
    // Add some jobs so they show up in Top Companies!
    const jobCount = await prisma.job.count({ where: { companyId } });
    if (jobCount < 50) {
      const jobsToCreate: any[] = [];
      for (let i = 0; i < 50; i++) {
        jobsToCreate.push({
          id: uuidv4(),
          title: `${comp.name} - Pozisyon ${i + 1}`,
          companyId: companyId,
          location: 'İstanbul',
          city: 'İstanbul',
          district: 'Merkez',
          workModel: 'onsite',
          salaryMin: 30000,
          currency: 'TRY',
          description: `${comp.name} şirketinde çalışmak üzere takım arkadaşları arıyoruz.`,
          educationLevel: 'Üniversite',
          experienceYears: 'Yeni Mezun',
          workingHours: ['09:00 - 18:00'],
          militaryStatus: 'Fark Etmez',
          language: 'İngilizce (İyi)',
          remote: false,
          createdAt: new Date()
        });
      }
      await prisma.job.createMany({ data: jobsToCreate });
      console.log(`Added 50 jobs to ${comp.name}`);
    }
  }

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
