import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const jobs = await prisma.job.findMany({
    where: {
      createdAt: {
        gte: oneHourAgo
      }
    }
  });

  console.log(`Found ${jobs.length} jobs to fix.`);

  for (const job of jobs) {
    const randomDays = Math.floor(Math.random() * 60);
    const newDate = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000);
    await prisma.job.update({
      where: { id: job.id },
      data: { createdAt: newDate }
    });
  }

  console.log('Fixed dates!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
