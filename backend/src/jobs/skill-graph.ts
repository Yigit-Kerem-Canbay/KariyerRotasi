export interface SkillRelation {
  related: string[];
  weight: number; // 0.0 to 1.0 (1.0 = exact match, 0.5 = somewhat related)
}

export const SKILL_RELATIONS: Record<string, SkillRelation[]> = {
  // Frontend
  "React": [
    { related: ["React.js", "ReactJS"], weight: 1.0 },
    { related: ["Next.js", "React Native", "Redux", "Hooks"], weight: 0.7 },
    { related: ["Vue.js", "Angular", "Frontend"], weight: 0.35 }
  ],
  "Vue.js": [
    { related: ["Vue", "Vue3", "Vue2"], weight: 1.0 },
    { related: ["Nuxt.js", "Vuex", "Pinia"], weight: 0.7 },
    { related: ["React", "Angular", "Frontend"], weight: 0.35 }
  ],
  "Angular": [
    { related: ["AngularJS"], weight: 0.8 },
    { related: ["RxJS", "TypeScript"], weight: 0.6 },
    { related: ["React", "Vue.js", "Frontend"], weight: 0.35 }
  ],
  "TypeScript": [
    { related: ["TS"], weight: 1.0 },
    { related: ["JavaScript", "JS"], weight: 0.8 },
    { related: ["Node.js", "React", "Angular"], weight: 0.4 }
  ],
  "JavaScript": [
    { related: ["JS", "ES6"], weight: 1.0 },
    { related: ["TypeScript", "TS"], weight: 0.7 },
    { related: ["Node.js", "React", "Vue", "Angular"], weight: 0.4 }
  ],
  "HTML": [
    { related: ["HTML5"], weight: 1.0 },
    { related: ["CSS", "Frontend", "Web"], weight: 0.6 }
  ],
  "CSS": [
    { related: ["CSS3"], weight: 1.0 },
    { related: ["SASS", "SCSS", "LESS", "Tailwind", "Bootstrap", "Frontend"], weight: 0.6 }
  ],
  "Tailwind": [
    { related: ["TailwindCSS"], weight: 1.0 },
    { related: ["CSS", "Bootstrap", "Frontend"], weight: 0.5 }
  ],

  // Backend
  "Node.js": [
    { related: ["Node", "NodeJS"], weight: 1.0 },
    { related: ["NestJS", "Express", "Express.js", "TypeScript", "JavaScript"], weight: 0.75 },
    { related: ["Backend", "API"], weight: 0.4 }
  ],
  "NestJS": [
    { related: ["Nest"], weight: 1.0 },
    { related: ["Node.js", "TypeScript", "Express"], weight: 0.8 },
    { related: ["Backend", "API"], weight: 0.4 }
  ],
  "Python": [
    { related: ["Py"], weight: 1.0 },
    { related: ["Django", "FastAPI", "Flask", "Pandas", "Machine Learning", "Data Science"], weight: 0.6 },
    { related: ["Backend", "AI"], weight: 0.3 }
  ],
  "Django": [
    { related: ["Python", "Backend", "FastAPI", "Flask"], weight: 0.6 }
  ],
  "Java": [
    { related: ["Spring Boot", "Spring", "Kotlin", "J2EE"], weight: 0.6 },
    { related: ["Backend"], weight: 0.3 }
  ],
  "Spring Boot": [
    { related: ["Spring", "Java", "Backend"], weight: 0.7 }
  ],
  "C#": [
    { related: ["CSharp", "C Sharp"], weight: 1.0 },
    { related: [".NET Core", ".NET", "ASP.NET", "Unity"], weight: 0.7 },
    { related: ["Backend"], weight: 0.3 }
  ],
  ".NET": [
    { related: [".NET Core", "ASP.NET", "C#", "Backend"], weight: 0.8 }
  ],
  "PHP": [
    { related: ["Laravel", "Symfony", "CodeIgniter"], weight: 0.6 },
    { related: ["Backend", "MySQL"], weight: 0.4 }
  ],
  "Laravel": [
    { related: ["PHP", "Backend"], weight: 0.7 }
  ],
  "Go": [
    { related: ["Golang"], weight: 1.0 },
    { related: ["Backend", "Microservices", "Docker"], weight: 0.5 }
  ],
  "Ruby": [
    { related: ["Ruby on Rails", "Rails"], weight: 0.7 }
  ],

  // Databases
  "PostgreSQL": [
    { related: ["Postgres"], weight: 1.0 },
    { related: ["SQL", "MySQL", "MSSQL", "Oracle", "Relational Database"], weight: 0.6 },
    { related: ["Database", "Veritabanı"], weight: 0.3 }
  ],
  "MySQL": [
    { related: ["SQL", "PostgreSQL", "MSSQL", "Relational Database", "MariaDB"], weight: 0.6 },
    { related: ["Database", "Veritabanı"], weight: 0.3 }
  ],
  "MongoDB": [
    { related: ["Mongo", "NoSQL"], weight: 0.8 },
    { related: ["Database", "Veritabanı"], weight: 0.4 }
  ],
  "Redis": [
    { related: ["Memcached", "Caching", "NoSQL"], weight: 0.6 },
    { related: ["Database"], weight: 0.3 }
  ],
  "SQL": [
    { related: ["PostgreSQL", "MySQL", "MSSQL", "Oracle"], weight: 0.7 },
    { related: ["Database", "Veritabanı"], weight: 0.5 }
  ],

  // DevOps & Cloud
  "Docker": [
    { related: ["Containerization", "Containers"], weight: 0.8 },
    { related: ["Kubernetes", "K8s", "DevOps", "CI/CD"], weight: 0.6 }
  ],
  "Kubernetes": [
    { related: ["K8s"], weight: 1.0 },
    { related: ["Docker", "Container Orchestration", "DevOps", "Helm"], weight: 0.7 }
  ],
  "AWS": [
    { related: ["Amazon Web Services"], weight: 1.0 },
    { related: ["Cloud", "Azure", "GCP", "Google Cloud", "DevOps", "EC2", "S3"], weight: 0.55 }
  ],
  "Azure": [
    { related: ["Microsoft Azure", "Cloud", "AWS", "GCP", "DevOps"], weight: 0.55 }
  ],
  "GCP": [
    { related: ["Google Cloud", "Google Cloud Platform", "Cloud", "AWS", "Azure", "DevOps"], weight: 0.55 }
  ],
  "CI/CD": [
    { related: ["Continuous Integration", "Continuous Deployment", "DevOps"], weight: 0.8 },
    { related: ["Jenkins", "GitLab CI", "GitHub Actions", "Docker"], weight: 0.6 }
  ],
  "Linux": [
    { related: ["Unix", "Ubuntu", "CentOS", "Bash", "Shell"], weight: 0.6 },
    { related: ["DevOps", "Sistem Yönetimi", "System Administration"], weight: 0.4 }
  ],
  "Git": [
    { related: ["GitHub", "GitLab", "Bitbucket", "Version Control"], weight: 0.8 }
  ],

  // Mobile
  "React Native": [
    { related: ["React", "Mobile", "iOS", "Android", "Cross-platform"], weight: 0.6 }
  ],
  "Flutter": [
    { related: ["Dart", "Mobile", "iOS", "Android", "Cross-platform"], weight: 0.7 }
  ],
  "iOS": [
    { related: ["Swift", "Objective-C", "Mobile", "Apple"], weight: 0.7 },
    { related: ["React Native", "Flutter", "Android"], weight: 0.3 }
  ],
  "Android": [
    { related: ["Kotlin", "Java", "Mobile", "Android SDK"], weight: 0.7 },
    { related: ["React Native", "Flutter", "iOS"], weight: 0.3 }
  ],

  // Concepts / Roles
  "Frontend": [
    { related: ["Front-end", "Front End", "UI", "Web"], weight: 1.0 },
    { related: ["React", "Vue", "Angular", "HTML", "CSS", "JavaScript"], weight: 0.5 },
    { related: ["Full Stack", "Full-stack"], weight: 0.4 }
  ],
  "Backend": [
    { related: ["Back-end", "Back End", "API", "Server"], weight: 1.0 },
    { related: ["Node.js", "Python", "Java", "C#", "PHP", "Go", "SQL"], weight: 0.5 },
    { related: ["Full Stack", "Full-stack"], weight: 0.4 }
  ],
  "Full Stack": [
    { related: ["Full-stack", "Fullstack", "Frontend", "Backend", "Web Developer"], weight: 0.8 }
  ],
  "DevOps": [
    { related: ["SRE", "Site Reliability Engineering", "CI/CD", "AWS", "Docker", "Kubernetes", "Linux"], weight: 0.6 }
  ],
  "Machine Learning": [
    { related: ["ML", "AI", "Artificial Intelligence", "Deep Learning", "Data Science", "Python"], weight: 0.7 }
  ],
  "Data Science": [
    { related: ["Data Scientist", "Veri Bilimi", "Veri Bilimci", "Python", "R", "SQL", "Machine Learning", "Pandas", "Data Analysis"], weight: 0.7 }
  ],
  "Siber Güvenlik": [
    { related: ["Cyber Security", "Security", "Penetrasyon Testi", "Network", "Ağ Güvenliği", "Bilgi Güvenliği"], weight: 0.8 }
  ]
};

/**
 * Normalizes a skill string for comparison
 */
function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

import { VectorUtils } from './vector-utils';

/**
 * Calculates the semantic similarity between two skills (0.0 to 1.0)
 * Uses a Hybrid Approach: 30% Manual Ontology (SKILL_RELATIONS) + 70% Embedding Vector Similarity
 */
export function getSkillSimilarity(
  skill1: string, 
  skill2: string,
  vec1?: number[] | null,
  vec2?: number[] | null
): number {
  const norm1 = normalizeSkill(skill1);
  const norm2 = normalizeSkill(skill2);

  // Exact string match is always 1.0
  if (norm1 === norm2) return 1.0;

  let manualScore = 0.0;
  
  // Substring match (e.g. "React" and "ReactJS")
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    manualScore = 0.8;
  } else {
    // Check graph relations
    const checkGraph = (source: string, targetNorm: string) => {
      const graphKey = Object.keys(SKILL_RELATIONS).find(k => normalizeSkill(k) === source);
      if (!graphKey) return 0;
      const relations = SKILL_RELATIONS[graphKey];
      let maxRelScore = 0;
      for (const rel of relations) {
        for (const relatedSkill of rel.related) {
          const normRelated = normalizeSkill(relatedSkill);
          if (normRelated === targetNorm) {
            maxRelScore = Math.max(maxRelScore, rel.weight);
          } else if (normRelated.includes(targetNorm) || targetNorm.includes(normRelated)) {
            maxRelScore = Math.max(maxRelScore, rel.weight * 0.9);
          }
        }
      }
      return maxRelScore;
    };
    manualScore = Math.max(checkGraph(norm1, norm2), checkGraph(norm2, norm1));
  }

  // Vector similarity
  let vectorScore = 0.0;
  if (vec1 && vec2) {
    vectorScore = VectorUtils.cosineSimilarity(vec1, vec2);
    // Vektör benzerliği bazen negatif dönebilir (zıt anlam), bunu 0'a çekiyoruz
    vectorScore = Math.max(0, vectorScore);
  }

  // Eğer vektörler yoksa eski kural bazlı sistemi kullan (geriye dönük uyumluluk)
  if (!vec1 || !vec2) {
    return manualScore;
  }

  // Hibrit Puanlama: %30 Manuel Ontoloji + %70 AI Vektör Benzerliği
  // Not: Eğer iki teknoloji aynıysa zaten yukarıda 1.0 dönüyor.
  const hybridScore = (manualScore * 0.30) + (vectorScore * 0.70);
  
  // Eğitilmiş embedding'ler genellikle çok yakın (0.8+) puanlar verebilir. 
  // Max kullanarak eğer manuel ontology daha yüksekse onu almasını da sağlayabiliriz, ama hibrit dedik.
  // Güvenlik için en fazla 1.0 döndüğünden emin olalım.
  return Math.min(1.0, hybridScore);
}

/**
 * Finds the best match score for a job skill against a list of user skills
 */
export function findBestMatch(
  jobSkill: string, 
  userSkills: { name: string, embedding?: number[] | null }[],
  jobSkillVec?: number[] | null
): { score: number, matchedSkill?: string } {
  if (!userSkills || userSkills.length === 0) return { score: 0 };

  let bestScore = 0;
  let bestMatchedSkill: string | undefined;

  for (const userSkill of userSkills) {
    const similarity = getSkillSimilarity(jobSkill, userSkill.name, jobSkillVec, userSkill.embedding);
    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatchedSkill = userSkill.name;
    }
  }

  return { score: bestScore, matchedSkill: bestMatchedSkill };
}
