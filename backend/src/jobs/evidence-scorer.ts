export interface UserEvidenceContext {
  experience: { title: string; description?: string | null; startDate?: Date | string | null; endDate?: Date | string | null }[];
  projects: { name: string; description?: string | null; technologies: string[] }[];
  certifications: { name: string }[];
  education: { fieldOfStudy?: string | null; degree?: string | null }[];
}

/**
 * Calculates a confidence score (0.3 to 1.0) for a given skill based on user's profile evidence.
 * If the user just listed the skill, they get 0.3.
 * If they have used it in projects, experience, or certifications, the score increases.
 */
export function calculateSkillConfidence(skillName: string, user: UserEvidenceContext): number {
  if (!skillName) return 0.0;

  let evidenceScore = 0;
  const maxPossibleEvidence = 4.0; // Max points
  const normalizedSkill = skillName.toLowerCase();

  // 1. Evidence in Experience (Weight: 1.5)
  if (user.experience && user.experience.length > 0) {
    const inExperience = user.experience.some(exp => 
      exp.title.toLowerCase().includes(normalizedSkill) ||
      (exp.description && exp.description.toLowerCase().includes(normalizedSkill))
    );
    if (inExperience) evidenceScore += 1.5;
  }

  // 2. Evidence in Projects (Weight: 1.2)
  if (user.projects && user.projects.length > 0) {
    const inProjects = user.projects.some(proj => 
      proj.name.toLowerCase().includes(normalizedSkill) ||
      (proj.technologies && proj.technologies.some(t => t.toLowerCase().includes(normalizedSkill))) ||
      (proj.description && proj.description.toLowerCase().includes(normalizedSkill))
    );
    if (inProjects) evidenceScore += 1.2;
  }

  // 3. Evidence in Certifications (Weight: 1.0)
  if (user.certifications && user.certifications.length > 0) {
    const inCerts = user.certifications.some(cert =>
      cert.name.toLowerCase().includes(normalizedSkill)
    );
    if (inCerts) evidenceScore += 1.0;
  }

  // 4. Evidence in Education (Weight: 0.8)
  if (user.education && user.education.length > 0) {
    const inEducation = user.education.some(edu =>
      edu.fieldOfStudy && edu.fieldOfStudy.toLowerCase().includes(normalizedSkill)
    );
    if (inEducation) evidenceScore += 0.8;
  }

  // The user has listed this skill in their profile.
  // To avoid penalizing semantic matches, the confidence defaults to 1.0.
  // Evidence can be used in the future for bonus points, but should not reduce the score.
  return 1.0;
}

/**
 * Calculates the overall skill match score for a job, factoring in the confidence of the user's skills.
 */
import { findBestMatch } from './skill-graph';

export function calculateOverallSkillScore(
  jobSkills: { name: string; embedding?: number[] | null }[], 
  userSkills: { name: string; embedding?: number[] | null }[], 
  userContext: UserEvidenceContext
): {
  score: number;
  matchedSkills: { name: string; score: number; confidence: number; evidenceMatched: boolean }[];
  missingSkills: string[];
} {
  if (!jobSkills || jobSkills.length === 0) {
    return { score: 1.0, matchedSkills: [], missingSkills: [] }; // If job has no skills, it's not a barrier.
  }
  if (!userSkills || userSkills.length === 0) {
    return { score: null as any, matchedSkills: [], missingSkills: jobSkills.map(js => js.name) }; // Missing user data -> handle in engine
  }

  const matchedSkills: { name: string; score: number; confidence: number; evidenceMatched: boolean }[] = [];
  const missingSkills: string[] = [];
  let totalEffectiveScore = 0;

  for (const js of jobSkills) {
    const { score, matchedSkill } = findBestMatch(js.name, userSkills, js.embedding);

    if (score > 0 && matchedSkill) {
      // Calculate confidence for the matched user skill
      const confidence = calculateSkillConfidence(matchedSkill, userContext);
      
      // Effective score is the semantic match score * confidence score
      const effectiveScore = score * confidence;
      totalEffectiveScore += effectiveScore;

      matchedSkills.push({
        name: js.name,
        score: parseFloat(effectiveScore.toFixed(2)),
        confidence: parseFloat(confidence.toFixed(2)),
        evidenceMatched: confidence > 0.35 // Consider >0.35 as having some evidence beyond just listing it
      });
    } else {
      missingSkills.push(js.name);
    }
  }

  // Final score is the average effective score across all required job skills
  const finalScore = totalEffectiveScore / jobSkills.length;

  return {
    score: parseFloat(finalScore.toFixed(3)),
    matchedSkills,
    missingSkills
  };
}
