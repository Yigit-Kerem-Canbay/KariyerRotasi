import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function parseMulti(value: unknown): string[] {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  const s = String(value).trim();
  if (!s) return [];
  return s
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Postgres ILIKE + Türkçe İ/i köşe durumu:
 * - 'BİM' lower() -> 'bi̇m' (i + combining dot)
 * - kullanıcı 'bim' yazınca 'bim' kalır ve ILIKE eşleşmeyebilir.
 * Bu yüzden aramayı 2-3 varyantla genişletiyoruz.
 */
function expandTurkishSearchVariants(input: string): string[] {
  const raw = input.trim();
  if (!raw) return [];

  const variants = new Set<string>();
  const add = (s: string) => {
    const v = s.trim();
    if (!v) return;
    variants.add(v);
    try {
      variants.add(v.normalize('NFC'));
    } catch {
      // ignore
    }
  };

  add(raw);

  // En güvenilir: Türkçe locale ile normalize edilmiş küçük harf
  try {
    add(raw.toLocaleLowerCase('tr-TR'));
  } catch {
    // ignore
  }
  // Bazı Postgres collation'larda Unicode case-fold sapıtabiliyor.
  // Bu yüzden Türkçe upper varyantını da ekleyip eşleşmeyi garanti ediyoruz.
  try {
    add(raw.toLocaleUpperCase('tr-TR'));
  } catch {
    // ignore
  }

  // İngilizce lower + dotted-i varyantı (i -> i + combining dot)
  const lower = raw.toLowerCase();
  add(lower);
  if (lower.includes('i')) {
    add(lower.replace(/i/g, 'i\u0307'));
  }
  if (lower.includes('ı')) {
    // Bazı girdilerde ters dönüşüm gerekebiliyor
    add(lower.replace(/ı/g, 'i'));
  }

  // Türkçe I/İ köşe durumları için ekstra varyantlar
  // Not: ILIKE, 'İ' ve 'i' arasında her zaman eşleştirme yapamıyor.
  // Bu yüzden pattern'i de 'İ' içerecek şekilde genişletiyoruz.
  add(raw.replace(/i/g, 'İ'));
  add(raw.replace(/I/g, 'ı'));
  add(raw.replace(/ı/g, 'I'));
  add(raw.replace(/İ/g, 'i'));

  return Array.from(variants).filter(Boolean);
}

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: Record<string, unknown>) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const searchRaw = typeof query.search === 'string' ? query.search.trim() : '';
    const searchVariants = searchRaw ? expandTurkishSearchVariants(searchRaw) : [];

    const cities = parseMulti(query.cities ?? query.city).filter(Boolean);
    const sectors = parseMulti(query.sectors ?? query.sector).filter(Boolean);
    const educationLevels = parseMulti(query.educationLevels ?? query.educationLevel).filter(Boolean);
    const languages = parseMulti(query.languages ?? query.language).filter(Boolean);
    const workModels = parseMulti(query.workModels ?? query.workModel).filter(Boolean);
    const experiences = parseMulti(query.experiences ?? query.experience).filter(Boolean);
    const militaryStatuses = parseMulti(query.militaryStatuses ?? query.militaryStatus).filter(Boolean);
    const sort = typeof query.sort === 'string' ? query.sort.trim() : 'newest';

    const minSalaryRaw = query.salaryMinGte ?? query.minSalary;
    const maxSalaryRaw = query.salaryMaxLte ?? query.maxSalary;

    const andParts: Prisma.JobWhereInput[] = [];

    // Şirket bazlı filtre (şirket detay "tüm ilanları gör" / mobil pagination için)
    const companyIdRaw = typeof query.companyId === 'string' ? query.companyId.trim() : '';
    if (companyIdRaw) {
      andParts.push({ companyId: companyIdRaw });
    }

    if (searchVariants.length > 0) {
      const containsAny = (field: string): Prisma.StringFilter[] =>
        searchVariants.map((v) => ({ contains: v, mode: Prisma.QueryMode.insensitive } as any));

      andParts.push({
        OR: [
          { OR: containsAny('title').map((f) => ({ title: f })) },
          { OR: containsAny('description').map((f) => ({ description: f })) },
          { OR: containsAny('location').map((f) => ({ location: f })) },
          { OR: containsAny('city').map((f) => ({ city: f })) },
          {
            company: {
              OR: [
                { OR: containsAny('name').map((f) => ({ name: f })) },
                { OR: containsAny('sector').map((f) => ({ sector: f })) },
              ],
            },
          },
          {
            jobSkills: {
              some: {
                skill: {
                  OR: searchVariants.map((v) => ({
                    name: { contains: v, mode: Prisma.QueryMode.insensitive },
                  })),
                },
              },
            },
          },
        ],
      });
    }

    if (cities.length > 0) {
      andParts.push({
        city: { in: cities },
      });
    }

    if (workModels.length > 0) {
      andParts.push({
        workModel: { in: workModels },
      });
    }

    const remoteOnly =
      query.remoteOnly === 'true' ||
      query.remoteOnly === true ||
      query.remote === 'true';
    if (remoteOnly) {
      andParts.push({
        OR: [
          { remote: true },
          { workModel: { equals: 'remote', mode: 'insensitive' } }
        ],
      });
    }

    if (experiences.length > 0) {
      andParts.push({
        experienceYears: { in: experiences },
      });
    }

    if (sectors.length > 0) {
      andParts.push({
        company: {
          sector: { in: sectors },
        },
      });
    }

    if (educationLevels.length > 0) {
      andParts.push({
        educationLevel: { in: educationLevels },
      });
    }

    if (languages.length > 0) {
      andParts.push({
        OR: languages.map((lang) => ({
          language: { equals: lang, mode: Prisma.QueryMode.insensitive },
        })),
      });
    }

    if (militaryStatuses.length > 0) {
      andParts.push({
        militaryStatus: { in: militaryStatuses },
      });
    }

    let minSalary: number | undefined;
    let maxSalary: number | undefined;
    if (minSalaryRaw !== undefined && minSalaryRaw !== '' && Number.isFinite(Number(minSalaryRaw))) {
      minSalary = Number(minSalaryRaw);
    }
    if (maxSalaryRaw !== undefined && maxSalaryRaw !== '' && Number.isFinite(Number(maxSalaryRaw))) {
      maxSalary = Number(maxSalaryRaw);
    }
    if (minSalary !== undefined) {
      andParts.push({
        OR: [{ salaryMin: { gte: minSalary } }, { salaryMax: { gte: minSalary } }],
      });
    }
    if (maxSalary !== undefined) {
      andParts.push({
        OR: [{ salaryMin: { lte: maxSalary } }, { salaryMax: { lte: maxSalary } }],
      });
    }

    /** Maaş sıralamasında bilgi vermeyen ilanları karışıma sokma */
    const salaryRanking =
      sort === 'salaryAsc' || sort === 'salaryDesc';
    if (salaryRanking) {
      andParts.push({
        OR: [{ salaryMin: { not: null } }, { salaryMax: { not: null } }],
      });
    }

    const where: Prisma.JobWhereInput =
      andParts.length > 0
        ? { AND: andParts }
        : {};

    const start = performance.now();

    let orderBy: Prisma.JobOrderByWithRelationInput[] = [{ createdAt: 'desc' }];

    switch (sort) {
      case 'salaryAsc':
        orderBy = [{ salaryMin: 'asc' }, { createdAt: 'desc' }];
        break;
      case 'salaryDesc':
        orderBy = [{ salaryMax: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'recommended':
        /** İleride AI skoru buraya bağlanacak; şimdilik görüntülenme + tazelik */
        orderBy = [{ viewCount: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ createdAt: 'asc' }];
        break;
      case 'newest':
      default:
        orderBy = [{ createdAt: 'desc' }];
        break;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true,
              sector: true,
              website: true,
            },
          },
          jobSkills: {
            include: { skill: true },
            take: 8,
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    const end = performance.now();

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        queryTimeMs: Math.round(end - start),
        salaryRankingOnlyListed: salaryRanking,
      },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        jobSkills: { include: { skill: true } },
      },
    });

    if (!job) throw new NotFoundException('İlan bulunamadı');

    this.prisma.job
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } } as any,
      })
      .catch(console.error);

    return job;
  }

  async findSimilar(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job) throw new NotFoundException('İlan bulunamadı');

    return this.prisma.job.findMany({
      where: {
        id: { not: id },
        OR: [
          { company: { sector: job.company.sector } },
          { title: { contains: job.title.split(' ')[0], mode: Prisma.QueryMode.insensitive } },
        ],
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { company: { select: { name: true, logoUrl: true, website: true } } },
    });
  }

  async discover(query: Record<string, unknown>) {
    const skillsParam = typeof query.skills === 'string' ? query.skills : '';
    const skills = parseMulti(skillsParam);

    if (skills.length === 0) {
      return this.findAll(query);
    }

    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const jobs = await this.prisma.job.findMany({
      where: {
        jobSkills: {
          some: {
            skill: {
              name: { in: skills, mode: Prisma.QueryMode.insensitive },
            },
          },
        },
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            sector: true,
            website: true,
          },
        },
        jobSkills: {
          include: { skill: true },
          take: 8,
        },
      },
      take: 200,
    });

    const scoredJobs = jobs.map((job) => {
      const jobSkillNames = job.jobSkills.map((js) => js.skill.name.toLowerCase());
      let matchCount = 0;
      skills.forEach((userSkill) => {
        if (jobSkillNames.includes(userSkill.toLowerCase())) matchCount++;
      });

      const scorePercentage = Math.round(
        (matchCount / Math.max(1, jobSkillNames.length)) * 100,
      );
      return { ...job, matchScore: Math.min(100, scorePercentage), matchCount };
    });

    scoredJobs.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const paginated = scoredJobs.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: {
        total: scoredJobs.length,
        page,
        limit,
        totalPages: Math.ceil(scoredJobs.length / limit),
      },
    };
  }
}
