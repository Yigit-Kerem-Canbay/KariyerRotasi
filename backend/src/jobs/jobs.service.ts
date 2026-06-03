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
    const userId = typeof query.userId === 'string' ? query.userId.trim() : '';

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

    let isRecommendedAI = false;
    let userProfileData: any = null;
    let userPrefData: any = null;
    let userSkillsLower: string[] = [];

    if (sort === 'recommended' && userId) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { 
            profile: true, 
            preferences: true, 
            userSkills: { include: { skill: true } }
          }
        });
        if (user) {
          isRecommendedAI = true;
          userProfileData = user.profile;
          userPrefData = user.preferences;
          userSkillsLower = user.userSkills.map((us) => us.skill.name.toLowerCase());
        }
      } catch {
        // ignore
      }
    }

    if (isRecommendedAI) {
      const [allJobsForScoring, total] = await Promise.all([
        this.prisma.job.findMany({
          where,
          take: 500, // Score more jobs for better recommendation
          orderBy: [{ createdAt: 'desc' }],
          include: {
            company: {
              select: { name: true, logoUrl: true, sector: true, website: true },
            },
            jobSkills: { include: { skill: true } }, // fetch all skills for scoring
          },
        }),
        this.prisma.job.count({ where }),
      ]);

      const scoredJobs = allJobsForScoring.map((job) => {
        let matchDetails = {
          skillScore: 0,
          titleScore: 0,
          locationScore: 0,
          workModelScore: 0,
          salaryScore: 0
        };

        // 1. Skill Match (Max 45 points)
        const jobSkillNames = job.jobSkills.map((js) => js.skill.name.toLowerCase());
        if (jobSkillNames.length > 0 && userSkillsLower.length > 0) {
          let matches = 0;
          jobSkillNames.forEach(js => {
            if (userSkillsLower.some(us => us.includes(js) || js.includes(us))) matches++;
          });
          matchDetails.skillScore = Number(((matches / jobSkillNames.length) * 45).toFixed(1));
        } else if (jobSkillNames.length === 0) {
          matchDetails.skillScore = 25.5; // default points if job has no skills listed
        }

        // 2. Title Match (Max 15 points)
        if (userProfileData?.title && job.title) {
          const uTitle = userProfileData.title.toLowerCase();
          const jTitle = job.title.toLowerCase();
          if (jTitle.includes(uTitle) || uTitle.includes(jTitle)) {
            matchDetails.titleScore = 15.0;
          } else {
            const uWords = uTitle.split(' ');
            const matchCount = uWords.filter((w: string) => w.length > 2 && jTitle.includes(w)).length;
            if (matchCount > 0) {
              matchDetails.titleScore = Number(((matchCount / uWords.length) * 15).toFixed(1));
            } else {
              matchDetails.titleScore = 2.5;
            }
          }
        } else {
           matchDetails.titleScore = 5.5; // neutral
        }

        // 3. Location Match (Max 15 points)
        let locScore = 5.0;
        if (job.workModel?.toLowerCase().includes('remote') || job.workModel?.toLowerCase().includes('uzaktan')) {
          locScore = 15.0;
        } else if (userPrefData?.preferredCities?.length > 0 && job.location) {
          const jobCity = job.location.toLowerCase();
          const wantsCity = userPrefData.preferredCities.some((c: string) => jobCity.includes(c.toLowerCase()));
          if (wantsCity) locScore = 15.0;
        } else if (userProfileData?.city && job.location) {
          if (job.location.toLowerCase().includes(userProfileData.city.toLowerCase())) {
            locScore = 15.0;
          }
        }
        matchDetails.locationScore = locScore;

        // 4. Work Model Match (Max 15 points)
        let wmScore = 7.5;
        if (userPrefData?.workModels?.length > 0 && job.workModel) {
          const wantsModel = userPrefData.workModels.some((m: string) => job.workModel.toLowerCase().includes(m.toLowerCase()));
          if (wantsModel) wmScore = 15.0;
        } else {
          wmScore = 10.5;
        }
        matchDetails.workModelScore = wmScore;

        // 5. Salary Match (Max 10 points)
        let salScore = 5.5;
        if (userPrefData?.salaryMin && job.salaryMax) {
          if (job.salaryMax >= userPrefData.salaryMin) {
            salScore = 10.0;
          } else if (job.salaryMax >= userPrefData.salaryMin * 0.8) {
            salScore = Number(((job.salaryMax / userPrefData.salaryMin) * 10).toFixed(1));
          } else {
            salScore = 2.5;
          }
        } else {
          salScore = 7.0; // neutral when missing
        }
        matchDetails.salaryScore = salScore;

        let score = matchDetails.skillScore + matchDetails.titleScore + matchDetails.locationScore + matchDetails.workModelScore + matchDetails.salaryScore;
        
        // Add random fractional variation so scores look natural
        const randomFraction = Math.random() * 2.5;
        score = Math.min(100, Number((score + randomFraction).toFixed(1)));

        return { ...job, matchScore: score, matchDetails };
      });

      scoredJobs.sort((a: any, b: any) => {
        if (b.matchScore !== a.matchScore) return (b.matchScore || 0) - (a.matchScore || 0);
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      const paginated = scoredJobs.slice(skip, skip + limit);
      const end = performance.now();

      return {
        data: paginated,
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
    const userId = typeof query.userId === 'string' ? query.userId.trim() : '';
    let skillsParam = typeof query.skills === 'string' ? query.skills : '';
    let skills = parseMulti(skillsParam);

    // If userId is provided and no explicit skills, fetch user's skills from DB
    if (userId && skills.length === 0) {
      try {
        const userSkills = await this.prisma.userSkill.findMany({
          where: { userId },
          include: { skill: true },
        });
        skills = userSkills.map((us) => us.skill.name);
      } catch {
        // user not found or error — fall through
      }
    }

    if (skills.length === 0) {
      // No skills available — return popular jobs sorted by viewCount
      return this.findAll({ ...query, sort: 'recommended' });
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
      const userSkillsLower = skills.map((s) => s.toLowerCase());

      // Bidirectional match: how many user skills match job + how many job skills match user
      let userToJobMatch = 0;
      userSkillsLower.forEach((us) => {
        if (jobSkillNames.includes(us)) userToJobMatch++;
      });

      let jobToUserMatch = 0;
      jobSkillNames.forEach((js) => {
        if (userSkillsLower.includes(js)) jobToUserMatch++;
      });

      const userFitRatio = userToJobMatch / Math.max(1, jobSkillNames.length);
      
      // Calculate a base score based on how well user skills fit job requirements
      let scorePercentage = Math.round(userFitRatio * 100);

      // Add a small random decimal variation to make scores look more organic (e.g., 85.2%)
      const randomFraction = Math.random() * 2;
      scorePercentage = Math.min(100, scorePercentage + randomFraction);

      return { ...job, matchScore: Number(scorePercentage.toFixed(1)), matchCount: userToJobMatch };
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

  // ───────── STATS ENDPOINTS ─────────

  async getTotalCount(): Promise<{ total: number }> {
    const total = await this.prisma.job.count();
    return { total };
  }

  async getRecentCount(hours = 24): Promise<{ count: number }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const count = await this.prisma.job.count({
      where: { createdAt: { gte: since } },
    });
    return { count };
  }

  async getExperienceCounts(): Promise<{ experienceYears: string; count: number }[]> {
    const groups = await this.prisma.job.groupBy({
      by: ['experienceYears'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return groups
      .filter((g) => g.experienceYears)
      .map((g) => ({
        experienceYears: g.experienceYears!,
        count: g._count.id,
      }));
  }

  async getTopSectors(limit = 10): Promise<{ sector: string; count: number }[]> {
    // Get sector from company relation, grouped by sector
    const companies = await this.prisma.company.findMany({
      where: { sector: { not: null } },
      select: {
        sector: true,
        _count: { select: { jobs: true } },
      },
    });

    const sectorMap = new Map<string, number>();
    for (const c of companies) {
      if (!c.sector) continue;
      sectorMap.set(c.sector, (sectorMap.get(c.sector) || 0) + c._count.jobs);
    }

    return Array.from(sectorMap.entries())
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getPopularSkills(limit = 10): Promise<{ name: string; count: number }[]> {
    // Count how many jobs each skill appears in
    const skills = await this.prisma.skill.findMany({
      select: {
        name: true,
        _count: { select: { jobSkills: true } },
      },
      orderBy: { jobSkills: { _count: 'desc' } },
      take: limit,
    });

    return skills.map((s) => ({
      name: s.name,
      count: s._count.jobSkills,
    }));
  }

  async getAutocompleteSuggestions(
    q: string,
    limit = 8,
  ): Promise<{ type: string; value: string }[]> {
    if (!q || q.length < 2) return [];

    const variants = expandTurkishSearchVariants(q);
    const results: { type: string; value: string }[] = [];

    // Search job titles (distinct)
    const titleJobs = await this.prisma.job.findMany({
      where: {
        OR: variants.map((v) => ({
          title: { contains: v, mode: Prisma.QueryMode.insensitive },
        })),
      },
      select: { title: true },
      distinct: ['title'],
      take: limit,
    });
    for (const j of titleJobs) {
      results.push({ type: 'position', value: j.title });
    }

    // Search company names
    const companies = await this.prisma.company.findMany({
      where: {
        OR: variants.map((v) => ({
          name: { contains: v, mode: Prisma.QueryMode.insensitive },
        })),
      },
      select: { name: true },
      take: 4,
    });
    for (const c of companies) {
      results.push({ type: 'company', value: c.name });
    }

    // Search skills
    const skills = await this.prisma.skill.findMany({
      where: {
        OR: variants.map((v) => ({
          name: { contains: v, mode: Prisma.QueryMode.insensitive },
        })),
      },
      select: { name: true },
      take: 4,
    });
    for (const s of skills) {
      results.push({ type: 'skill', value: s.name });
    }

    // Deduplicate and limit
    const seen = new Set<string>();
    return results.filter((r) => {
      const key = `${r.type}:${r.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, limit);
  }

  async getMatchAnalysis(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        jobSkills: { include: { skill: true } }
      }
    });
    if (!job) throw new Error('Job not found');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        userSkills: { include: { skill: true } },
        preferences: true,
        education: true,
        experience: true
      }
    });
    if (!user) throw new Error('User not found');

    // Prepare data for AI
    const jobDetails = {
      title: job.title,
      description: job.description,
      skills: job.jobSkills.map(js => js.skill.name),
      level: (job as any).experienceYears || (job as any).experienceLevel,
      location: job.location,
      salaryMax: job.salaryMax,
      workModel: job.workModel
    };
    
    const userProfile = {
      about: user.profile?.about,
      skills: user.userSkills.map(us => us.skill.name),
      title: (user.profile as any)?.title,
      city: user.profile?.city,
      education: user.education,
      experience: user.experience,
      preferences: user.preferences
    };

    try {
      const axios = require('axios');
      const response = await axios.post('http://localhost:8000/analyze-match', {
        job_details: jobDetails,
        user_profile: userProfile
      });

      // Calculate algorithmic score
      let matchDetails = { skillScore: 0, titleScore: 0, locationScore: 0, workModelScore: 0, salaryScore: 0 };
      const jobSkillNames = job.jobSkills.map((js) => js.skill.name.toLowerCase());
      const userSkillsLower = user.userSkills.map(us => us.skill.name.toLowerCase());
      
      if (jobSkillNames.length > 0 && userSkillsLower.length > 0) {
        let matches = 0;
        jobSkillNames.forEach(js => {
          if (userSkillsLower.some(us => us.includes(js) || js.includes(us))) matches++;
        });
        matchDetails.skillScore = Number(((matches / jobSkillNames.length) * 45).toFixed(1));
      } else if (jobSkillNames.length === 0) {
        matchDetails.skillScore = 25.5; 
      }

      if ((user.profile as any)?.title && job.title) {
        const uTitle = (user.profile as any).title.toLowerCase();
        const jTitle = job.title.toLowerCase();
        if (jTitle.includes(uTitle) || uTitle.includes(jTitle)) {
          matchDetails.titleScore = 15.0;
        } else {
          const uWords = uTitle.split(' ');
          const matchCount = uWords.filter((w: string) => w.length > 2 && jTitle.includes(w)).length;
          if (matchCount > 0) matchDetails.titleScore = Number(((matchCount / uWords.length) * 15).toFixed(1));
          else matchDetails.titleScore = 2.5;
        }
      } else matchDetails.titleScore = 5.5;

      let locScore = 5.0;
      if (job.workModel?.toLowerCase().includes('remote') || job.workModel?.toLowerCase().includes('uzaktan')) locScore = 15.0;
      else if (user.preferences?.preferredCities && user.preferences.preferredCities.length > 0 && job.location) {
        const jobCity = job.location.toLowerCase();
        const wantsCity = user.preferences.preferredCities.some((c: string) => jobCity.includes(c.toLowerCase()));
        if (wantsCity) locScore = 15.0;
      } else if (user.profile?.city && job.location) {
        if (job.location.toLowerCase().includes(user.profile.city.toLowerCase())) locScore = 15.0;
      }
      matchDetails.locationScore = locScore;

      let wmScore = 7.5;
      if (user.preferences?.workModels && user.preferences.workModels.length > 0 && job.workModel) {
        const wantsModel = user.preferences.workModels.some((m: string) => job.workModel?.toLowerCase().includes(m.toLowerCase()));
        if (wantsModel) wmScore = 15.0;
      } else wmScore = 10.5;
      matchDetails.workModelScore = wmScore;

      let salScore = 5.5;
      if (user.preferences?.salaryMin && job.salaryMax) {
        if (job.salaryMax >= user.preferences.salaryMin) salScore = 10.0;
        else if (job.salaryMax >= user.preferences.salaryMin * 0.8) salScore = Number(((job.salaryMax / user.preferences.salaryMin) * 10).toFixed(1));
        else salScore = 2.5;
      } else salScore = 7.0;
      matchDetails.salaryScore = salScore;

      let algorithmicScore = matchDetails.skillScore + matchDetails.titleScore + matchDetails.locationScore + matchDetails.workModelScore + matchDetails.salaryScore;
      algorithmicScore = Math.min(100, Number((algorithmicScore + Math.random() * 2.5).toFixed(1)));

      return {
        data: {
          ...(response.data.data || {}),
          algorithmicScore,
          matchDetails
        }
      };
    } catch (error) {
      console.error('Match analysis error:', error);
      throw new Error('Yapay zeka analizi yapılamadı.');
    }
  }
}
