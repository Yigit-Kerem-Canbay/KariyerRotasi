import { calculateOverallSkillScore, UserEvidenceContext } from './evidence-scorer';
import { VectorUtils } from './vector-utils';
export type ParameterStatus = 'known' | 'missing_user' | 'missing_job' | 'not_applicable';

export interface ParameterResult {
  name: string;
  score: number | null; // null means parameter is missing/unknown and excluded from formula
  weight: number;
  status: ParameterStatus;
  note?: string;
  details?: any; // Extra debug info
}

export interface MatchResult {
  overallScore: number;
  parameters: ParameterResult[];
  missingFields: string[];
  recommendations: string[];
  matchedSkills: any[];
  missingSkills: string[];
}

export interface WeightProfile {
  skills: number;
  experience: number;
  education: number;
  textAnalysis: number;
  location: number;
  workModel: number;
  salary: number;
  hours: number;
  language: number;
  military: number;
  bonus: number;
}

// 1. DYNAMIC WEIGHT PROFILES
const TECH_WEIGHTS: WeightProfile = {
  skills: 0.40, textAnalysis: 0.20, experience: 0.08, location: 0.05, workModel: 0.05, salary: 0.05, language: 0.05, education: 0.05, hours: 0.03, military: 0.02, bonus: 0.02
};
const ACADEMIC_WEIGHTS: WeightProfile = {
  skills: 0.15, textAnalysis: 0.25, education: 0.20, experience: 0.10, language: 0.10, location: 0.05, salary: 0.05, workModel: 0.04, hours: 0.03, military: 0.01, bonus: 0.02
};
const SALES_WEIGHTS: WeightProfile = {
  skills: 0.15, textAnalysis: 0.20, location: 0.18, experience: 0.15, language: 0.08, hours: 0.10, salary: 0.05, workModel: 0.04, education: 0.03, military: 0.01, bonus: 0.01
};
const ENGINEERING_WEIGHTS: WeightProfile = {
  skills: 0.35, textAnalysis: 0.15, experience: 0.12, education: 0.10, location: 0.08, language: 0.05, military: 0.05, salary: 0.04, workModel: 0.04, hours: 0.03, bonus: 0.04
};
const DEFAULT_WEIGHTS: WeightProfile = {
  skills: 0.30, textAnalysis: 0.20, experience: 0.10, location: 0.08, salary: 0.07, education: 0.06, workModel: 0.05, language: 0.05, hours: 0.04, military: 0.03, bonus: 0.02
};

function selectWeightProfile(job: any): WeightProfile {
  const sector = job.company?.sector?.toLowerCase() || '';
  const title = job.title?.toLowerCase() || '';

  if (sector.includes('yazılım') || sector.includes('teknoloji') || sector.includes('e-ticaret') || title.match(/developer|geliştirici|mühendis.*yazılım|devops|frontend|backend|full.?stack/)) {
    return TECH_WEIGHTS;
  }
  if (sector.includes('eğitim') || title.match(/öğretmen|akademis|profesör|araştırma/)) {
    return ACADEMIC_WEIGHTS;
  }
  if (sector.includes('perakende') || sector.includes('gıda') || sector.includes('turizm') || title.match(/satış|mağaza|müşteri|kasiyer|garson/)) {
    return SALES_WEIGHTS;
  }
  if (sector.includes('savunma') || sector.includes('inşaat') || sector.includes('enerji') || sector.includes('otomotiv') || title.match(/mühendis|tekniker/)) {
    return ENGINEERING_WEIGHTS;
  }

  return DEFAULT_WEIGHTS;
}

// LEVEL MAPS
const EXP_LEVELS: Record<string, number> = { "Yeni Mezun": 0, "Junior": 1, "Orta Düzey": 2, "Uzman": 3, "Yönetici": 4 };
const EDU_LEVELS: Record<string, number> = { "Lise": 1, "Ön Lisans": 2, "Lisans": 3, "Üniversite": 3, "Yüksek Lisans": 4, "Doktora": 5 };
const LANG_LEVELS: Record<string, number> = { "A1": 1, "A2": 2, "Temel": 2, "B1": 3, "B2": 4, "İyi": 4, "C1": 5, "Çok İyi": 5, "İleri": 5, "C2": 6, "Ana Dil": 7 };

export class MatchEngine {
  
  static calculateFullMatch(user: any, job: any): MatchResult {
    const weights = selectWeightProfile(job);
    const params: ParameterResult[] = [];
    const missingFields: string[] = [];
    const recommendations: string[] = [];

    // Extract basic properties with vectors
    const jobSkills = job.jobSkills?.map((js: any) => ({ 
      name: js.skill?.name, 
      embedding: js.skill?._embedding ? VectorUtils.parseVectorString(js.skill._embedding) : null 
    })) || [];
    const userSkills = user.userSkills?.map((us: any) => ({ 
      name: us.skill?.name, 
      embedding: us.skill?._embedding ? VectorUtils.parseVectorString(us.skill._embedding) : null 
    })) || [];
    
    const userContext: UserEvidenceContext = {
      experience: user.experience || [],
      projects: user.projects || [],
      certifications: user.certifications || [],
      education: user.education || []
    };

    // 1. Skills
    let matchedSkillsOut: any[] = [];
    let missingSkillsOut: string[] = [];
    
    if (jobSkills.length > 0) {
      if (userSkills.length > 0) {
        const skillRes = calculateOverallSkillScore(jobSkills, userSkills, userContext);
        matchedSkillsOut = skillRes.matchedSkills;
        missingSkillsOut = skillRes.missingSkills;
        params.push({ name: 'Yetenek Uyumu', score: skillRes.score, weight: weights.skills, status: 'known' });
      } else {
        missingFields.push('Yetenekler');
        recommendations.push('Profilinize yeteneklerinizi eklerseniz ilanlarla eşleşme oranınız artacaktır.');
        params.push({ name: 'Yetenek Uyumu', score: null, weight: weights.skills, status: 'missing_user', note: 'Profilinizde yetenek ekli değil.' });
      }
    } else {
      params.push({ name: 'Yetenek Uyumu', score: null, weight: weights.skills, status: 'not_applicable' });
    }

    // 2. Experience Level
    if (job.experienceYears) {
      let jobLevel = EXP_LEVELS[job.experienceYears] ?? 2;
      
      // Calculate user experience in years roughly
      let totalMonths = 0;
      for (const exp of userContext.experience) {
        if (exp.startDate) {
          const start = new Date(exp.startDate);
          const end = exp.endDate ? new Date(exp.endDate) : new Date();
          totalMonths += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
        }
      }
      const years = totalMonths / 12;
      let userLevel = 0;
      if (years >= 15) userLevel = 4;
      else if (years >= 7) userLevel = 3;
      else if (years >= 3) userLevel = 2;
      else if (years >= 1) userLevel = 1;

      const diff = Math.abs(userLevel - jobLevel);
      let expScore = 1.0;
      if (userLevel >= jobLevel) {
        expScore = Math.max(0.15, 1.0 - (diff * 0.20)); // overqualified penalty
      } else {
        expScore = Math.max(0, 1.0 - (diff * 0.30)); // underqualified penalty
      }
      params.push({ name: 'Deneyim Uyumu', score: expScore, weight: weights.experience, status: 'known' });
    } else {
      params.push({ name: 'Deneyim Uyumu', score: null, weight: weights.experience, status: 'missing_job' });
    }

    // 3. Text Analysis (Hybrid: Semantic Vector + Exact Keyword Fallback)
    const userEmbedStr = user.profile?._embedding;
    const jobEmbedStr = job._embedding;
    const userEmbed = VectorUtils.parseVectorString(userEmbedStr);
    const jobEmbed = VectorUtils.parseVectorString(jobEmbedStr);

    if (userEmbed && jobEmbed) {
      // AI Cosine Similarity Eşleşmesi
      let vectorScore = VectorUtils.cosineSimilarity(userEmbed, jobEmbed);
      vectorScore = Math.max(0, vectorScore); // Ensure 0-1 range

      // Bonus if exact title word match exists (hybrid approach)
      if (job.title && user.profile?.title) {
         if (job.title.toLowerCase().includes(user.profile.title.toLowerCase()) || user.profile.title.toLowerCase().includes(job.title.toLowerCase())) {
           vectorScore = Math.min(1.0, vectorScore + 0.15);
         }
      }
      params.push({ name: 'İçerik Eşleşmesi (AI)', score: vectorScore, weight: weights.textAnalysis, status: 'known', note: 'AI tabanlı anlamsal (semantik) analiz kullanıldı.' });
    } else {
      // Geriye Dönük Uyumluluk (Fallback): Jaccard
      const userWords = new Set<string>();
      const addUserWords = (text?: string) => text?.toLowerCase().split(/\s+/).filter(w => w.length > 3).forEach(w => userWords.add(w));
      addUserWords(user.profile?.title);
      addUserWords(user.profile?.about);
      userContext.experience.forEach(e => addUserWords(e.title));
      userContext.projects.forEach(p => { addUserWords(p.name); p.technologies?.forEach(t => addUserWords(t)); });
      
      const jobWords = new Set<string>();
      const addJobWords = (text?: string) => text?.toLowerCase().split(/\s+/).filter(w => w.length > 3).forEach(w => jobWords.add(w));
      addJobWords(job.title);
      addJobWords(job.description);

      if (jobWords.size > 0 && userWords.size > 0) {
        let overlap = 0;
        userWords.forEach(w => { if (jobWords.has(w)) overlap++; });
        const maxDivisor = Math.max(1, Math.min(jobWords.size, 15));
        let textScore = Math.min(1.0, overlap / maxDivisor);
        
        if (job.title && user.profile?.title) {
           if (job.title.toLowerCase().includes(user.profile.title.toLowerCase()) || user.profile.title.toLowerCase().includes(job.title.toLowerCase())) {
             textScore = Math.min(1.0, textScore + 0.3);
           }
        }
        params.push({ name: 'İçerik Eşleşmesi', score: textScore, weight: weights.textAnalysis, status: 'known', note: 'Kelime bazlı eşleşme (AI verisi eksik)' });
      } else {
        params.push({ name: 'İçerik Eşleşmesi', score: null, weight: weights.textAnalysis, status: 'not_applicable' });
      }
    }

    // 4. Education
    if (job.educationLevel && job.educationLevel !== "Fark Etmez") {
      if (userContext.education.length > 0) {
        let maxUserEduLevel = 1;
        userContext.education.forEach(e => {
           const level = EDU_LEVELS[e.degree as any] || 1;
           if (level > maxUserEduLevel) maxUserEduLevel = level;
        });
        const jobEduLevel = EDU_LEVELS[job.educationLevel] || 1;
        
        let eduScore = 0;
        if (maxUserEduLevel >= jobEduLevel) eduScore = 1.0;
        else if (maxUserEduLevel === jobEduLevel - 1) eduScore = 0.55;
        else eduScore = 0.15;
        
        params.push({ name: 'Eğitim', score: eduScore, weight: weights.education, status: 'known' });
      } else {
        missingFields.push('Eğitim');
        params.push({ name: 'Eğitim', score: null, weight: weights.education, status: 'missing_user', note: 'Eğitim bilgilerinizi eklerseniz ilanlarla eşleşme oranınız daha isabetli hesaplanır.' });
      }
    } else {
      params.push({ name: 'Eğitim', score: 1.0, weight: weights.education, status: 'not_applicable', note: 'Bu ilan için spesifik bir eğitim şartı aranmıyor.' });
    }

    // 5. Location
    if (job.workModel?.toLowerCase().includes('remote') || job.workModel?.toLowerCase().includes('uzaktan')) {
      params.push({ name: 'Lokasyon', score: 1.0, weight: weights.location, status: 'known' });
    } else if (job.location) {
      if (user.profile?.city) {
        const uCity = user.profile.city.toLowerCase();
        const jLoc = job.location.toLowerCase();
        let locScore = 0;
        if (jLoc.includes(uCity) || uCity.includes(jLoc)) {
          locScore = 1.0;
        } else if (user.preferences?.preferredCities?.some((c: string) => jLoc.includes(c.toLowerCase()))) {
          locScore = 1.0;
        } else if (job.workModel?.toLowerCase().includes('hybrid') || job.workModel?.toLowerCase().includes('hibrit')) {
          locScore = 0.35; // Different city but hybrid
        } else {
          locScore = 0.05; // Completely different city, onsite
        }
        params.push({ name: 'Lokasyon', score: locScore, weight: weights.location, status: 'known' });
      } else {
        missingFields.push('Lokasyon');
        params.push({ name: 'Lokasyon', score: null, weight: weights.location, status: 'missing_user' });
      }
    } else {
      params.push({ name: 'Lokasyon', score: null, weight: weights.location, status: 'missing_job' });
    }

    // 6. Salary - Negotiability Zone
    if (job.salaryMin && job.salaryMax) {
      if (user.preferences?.salaryMin && user.preferences?.salaryMax) {
        const uMin = user.preferences.salaryMin;
        const uMax = user.preferences.salaryMax;
        const jMin = job.salaryMin;
        const jMax = job.salaryMax;

        const negMin = Math.max(uMin, jMin);
        const negMax = Math.min(uMax, jMax);

        let salScore = 0;
        if (negMax >= negMin) {
          // Negotiable zone exists
          const negRange = negMax - negMin;
          const uRange = Math.max(1, uMax - uMin);
          const jRange = Math.max(1, jMax - jMin);
          const uCov = negRange / uRange;
          const jCov = negRange / jRange;
          salScore = Math.max(0.40, Math.sqrt(uCov * jCov));
        } else {
          // Gap
          const gap = negMin - negMax;
          const avgRange = ((uMax - uMin) + (jMax - jMin)) / 2;
          salScore = Math.max(0, 0.30 - (gap / Math.max(1, avgRange)) * 0.5);
        }
        params.push({ name: 'Maaş', score: salScore, weight: weights.salary, status: 'known' });
      } else {
         missingFields.push('Maaş Beklentisi');
         params.push({ name: 'Maaş', score: null, weight: weights.salary, status: 'missing_user' });
      }
    } else {
       params.push({ name: 'Maaş', score: null, weight: weights.salary, status: 'missing_job' });
    }

    // Calculate Overall
    const knownParams = params.filter(p => p.score !== null);
    let overallScore = 0;
    if (knownParams.length > 0) {
      const totalWeight = knownParams.reduce((s, p) => s + p.weight, 0);
      const weightedSum = knownParams.reduce((s, p) => s + (p.score! * p.weight), 0);
      overallScore = Math.round((weightedSum / totalWeight) * 100);

      // Candidate Success Score (Confidence Modifier)
      const successScore = user.profile?.successScore || 0;
      if (successScore !== 0) {
        const modifier = Math.max(-5, Math.min(5, successScore));
        overallScore += modifier;
      }

      // Core Relevance Veto: If Skills and Text match is extremely low, penalize heavily
      const coreParams = knownParams.filter(p => p.name === 'Yetenek Uyumu' || p.name.includes('İçerik Eşleşmesi'));
      if (coreParams.length > 0) {
        const coreWeight = coreParams.reduce((s, p) => s + p.weight, 0);
        const coreScore = coreParams.reduce((s, p) => s + ((p.score as number) * p.weight), 0) / coreWeight;

        if (coreScore < 0.35) {
          const penaltyMultiplier = Math.max(0.1, Math.pow(coreScore / 0.35, 2));
          overallScore = Math.round(overallScore * penaltyMultiplier);
          
          params.push({
             name: 'Temel Uyum Eksikliği',
             score: penaltyMultiplier,
             weight: 0,
             status: 'not_applicable',
             note: `Temel yetenek ve içerik uyumu çok düşük (${Math.round(coreScore * 100)}%) olduğu için genel skor düşürüldü.`
          });
          recommendations.push('Temel mesleki beceri ve içerik uyumu çok düşük olduğu için eşleşme skoru düşürülmüştür.');
        }
      }
    }

    return {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      parameters: params,
      missingFields,
      recommendations,
      matchedSkills: matchedSkillsOut,
      missingSkills: missingSkillsOut
    };
  }
}
