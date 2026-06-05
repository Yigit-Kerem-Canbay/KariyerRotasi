import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await axios.post('http://localhost:8000/embed', { text });
    if (res.data && res.data.success) {
      return res.data.embedding;
    }
  } catch (error) {
    console.error('Embedding generation failed:', error);
  }
  return null;
}

async function main() {
  console.log('--- EŞLEŞTİRME MOTORU V3: EMBEDDING BACKFILL BAŞLIYOR ---');
  
  // 1. Skill Embeddings
  const skills = await prisma.$queryRaw<any[]>`SELECT id, name FROM "skills" WHERE embedding IS NULL`;
  console.log(`Eksik embedding'i olan ${skills.length} yetenek bulundu. Güncelleniyor...`);
  
  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    const embedding = await generateEmbedding(skill.name);
    if (embedding) {
      // Use raw query for pgvector
      await prisma.$executeRawUnsafe(
        `UPDATE "skills" SET "embedding" = '[${embedding.join(',')}]' WHERE "id" = $1`,
        skill.id
      );
    }
    if (i % 50 === 0) console.log(`[Yetenekler] %${Math.round((i/skills.length)*100)} tamamlandı...`);
  }

  // 2. Job Embeddings
  // We process in batches to not overwhelm memory
  const batchSize = 100;
  let totalJobsProcessed = 0;
  
  const countResult = await prisma.$queryRaw<any[]>`SELECT count(id)::int as count FROM "jobs" WHERE embedding IS NULL`;
  const totalJobs = countResult[0].count;
  
  console.log(`\nEksik embedding'i olan ${totalJobs} ilan bulundu. Güncelleniyor...`);

  while (true) {
    const jobs = await prisma.$queryRaw<any[]>`SELECT id, title, description FROM "jobs" WHERE embedding IS NULL LIMIT ${batchSize}`;

    if (jobs.length === 0) break;

    for (const job of jobs) {
      // Clean up description HTML tags for better embedding
      const cleanDesc = (job.description || '').replace(/<[^>]*>?/gm, ' ');
      const textToEmbed = `${job.title}. ${cleanDesc}`.substring(0, 1000); // Limit length to avoid token limits

      const embedding = await generateEmbedding(textToEmbed);
      if (embedding) {
        await prisma.$executeRawUnsafe(
          `UPDATE "jobs" SET "embedding" = '[${embedding.join(',')}]' WHERE "id" = $1`,
          job.id
        );
      }
    }
    
    totalJobsProcessed += jobs.length;
    console.log(`[İlanlar] İşlenen ilan: ${totalJobsProcessed} / ${totalJobs}`);
  }

  console.log('--- BACKFILL BAŞARIYLA TAMAMLANDI ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
