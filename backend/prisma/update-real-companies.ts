import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const REAL_COMPANIES = [
  { name: 'Aselsan', website: 'aselsan.com.tr', sector: 'Savunma Sanayi', desc: 'Türk Silahlı Kuvvetleri\'nin haberleşme cihazı ihtiyaçlarının karşılanması amacıyla kurulan Türkiye\'nin lider savunma sanayi şirketidir.' },
  { name: 'TUSAŞ', website: 'tusas.com.tr', sector: 'Savunma Sanayi', desc: 'Türk Havacılık ve Uzay Sanayii A.Ş., havacılık ve uzay sanayisinde Türkiye\'nin teknoloji merkezidir.' },
  { name: 'Havelsan', website: 'havelsan.com.tr', sector: 'Savunma Sanayi', desc: 'Yazılım, sistem entegrasyonu ve simülasyon teknolojilerinde öncü savunma sanayi kuruluşudur.' },
  { name: 'Trendyol', website: 'trendyol.com.tr', sector: 'E-Ticaret', desc: 'Türkiye\'nin en büyük e-ticaret platformlarından biri olan Trendyol, teknoloji ve lojistik alanında dev yatırımlar yapmaktadır.' },
  { name: 'Getir', website: 'getir.com.tr', sector: 'E-Ticaret', desc: 'Dakikalar içinde market ürünleri teslimatı yapan teknoloji ve lojistik girişimidir.' },
  { name: 'Migros', website: 'migros.com.tr', sector: 'Perakende', desc: 'Geniş ürün yelpazesi ve yaygın mağaza ağıyla Türkiye\'nin en büyük perakende zincirlerinden biridir.' },
  { name: 'BİM', website: 'bim.com.tr', sector: 'Perakende', desc: 'Türkiye pazarında yüksek kaliteli ürünleri uygun fiyata sunan lider perakende markası.' },
  { name: 'Şok Market', website: 'sokmarket.com.tr', sector: 'Perakende', desc: 'Türkiye\'nin dört bir yanında binlerce mağazasıyla hizmet veren gıda ve perakende zinciri.' },
  { name: 'Misaş Market', website: 'misas.com.tr', sector: 'Perakende', desc: 'Müşteri memnuniyetini ön planda tutarak kaliteli hizmet sunan bölgesel perakende markası.' },
  { name: 'Türk Hava Yolları', website: 'thy.com.tr', sector: 'Lojistik & Taşıma', desc: 'Türkiye\'nin bayrak taşıyıcı hava yolu şirketi olup, dünyanın en çok ülkesine uçan havayoludur.' },
  { name: 'Pegasus Hava Yolları', website: 'flypgs.com.tr', sector: 'Lojistik & Taşıma', desc: 'Yenilikçi ve düşük maliyetli iş modeliyle havacılık sektöründe öncü markalardan biri.' },
  { name: 'Koç Holding', website: 'koc.com.tr', sector: 'Finans & Bankacılık', desc: 'Türkiye\'nin en büyük holding şirketlerinden biri olarak enerji, otomotiv, finans ve tüketici ürünleri alanlarında liderdir.' },
  { name: 'Garanti BBVA', website: 'garantibbva.com.tr', sector: 'Finans & Bankacılık', desc: 'Teknolojik altyapısı ve yenilikçi hizmet anlayışıyla Türkiye\'nin önde gelen finans kurumlarındandır.' },
  { name: 'Vodafone Türkiye', website: 'vodafone.com.tr', sector: 'Telekomünikasyon', desc: 'Geniş kapsama alanı ve teknolojik yenilikleriyle ön plana çıkan küresel telekomünikasyon şirketi.' },
  { name: 'Arçelik', website: 'arcelik.com.tr', sector: 'Teknoloji & Yazılım', desc: 'Tüketici elektroniği ve beyaz eşya sektöründe Türkiye\'nin ve dünyanın lider teknoloji şirketlerinden biri.' },
  { name: 'Beko', website: 'beko.com.tr', sector: 'Teknoloji & Yazılım', desc: 'Avrupa pazarında lider konumda olan, küresel beyaz eşya ve tüketici elektroniği markası.' },
  { name: 'DeFacto', website: 'defacto.com.tr', sector: 'Tekstil', desc: 'Global hazır giyim pazarında hızla büyüyen, Türkiye\'nin önde gelen moda ve perakende markalarından biri.' },
];

async function main() {
  console.log("Gerçek şirketler güncelleniyor...");
  
  for (const rc of REAL_COMPANIES) {
    // Bulunan sektördeki en çok iş ilanı olan, henüz güncellenmemiş şirketi bul
    const topCompanyInSector = await prisma.company.findFirst({
      where: {
        sector: rc.sector,
        // İsmi henüz bizim gerçek isimlerimizden biri olmasın
        NOT: {
          name: { in: REAL_COMPANIES.map(c => c.name) }
        }
      },
      orderBy: {
        jobs: {
          _count: 'desc'
        }
      }
    });

    if (topCompanyInSector) {
      await prisma.company.update({
        where: { id: topCompanyInSector.id },
        data: {
          name: rc.name,
          website: rc.website,
          description: rc.desc,
          employeeCount: "1000+", // Büyük şirket olduklarını vurgulayalım
        }
      });
      console.log(`${rc.name} (${rc.sector}) başarıyla eklendi! -> Önceki adı: ${topCompanyInSector.name}`);
    } else {
      console.log(`Uyarı: ${rc.sector} sektöründe uygun şirket bulunamadı (${rc.name})`);
    }
  }

  console.log("İşlem tamamlandı!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
