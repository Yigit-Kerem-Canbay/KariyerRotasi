/**
 * Deneyim Seviyeleri Veri Migration Scripti
 * 
 * Mevcut DB değerlerini yeni sektör-standart seviyelerine günceller:
 *   "Yeni Mezun"  → "Yeni Mezun"  (değişmez)
 *   "1-3 Yıl"     → "Junior"
 *   "3-5 Yıl"     → "Orta Düzey"
 *   "5+ Yıl"      → "Uzman"
 *   "Yönetici"    → "Yönetici"   (değişmez)
 * 
 * Çalıştırma: npx ts-node prisma/migrate-experience.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MIGRATIONS: [string, string][] = [
  ['1-3 Yıl', 'Junior'],
  ['3-5 Yıl', 'Orta Düzey'],
  ['5+ Yıl', 'Uzman'],
  // "Yeni Mezun" ve "Yönetici" aynı kalır
];

async function main() {
  console.log('🔄 Deneyim seviyeleri migration başlıyor...\n');

  for (const [oldVal, newVal] of MIGRATIONS) {
    const { count } = await prisma.job.updateMany({
      where: { experienceYears: oldVal },
      data: { experienceYears: newVal },
    });
    console.log(`  ✅ "${oldVal}" → "${newVal}" : ${count} ilan güncellendi`);
  }

  // Verify
  const groups = await prisma.job.groupBy({
    by: ['experienceYears'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  console.log('\n📊 Güncel deneyim dağılımı:');
  for (const g of groups) {
    console.log(`   ${g.experienceYears ?? '(null)'}: ${g._count.id} ilan`);
  }

  console.log('\n✅ Migration tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Migration hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
