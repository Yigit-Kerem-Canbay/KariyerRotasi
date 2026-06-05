export class VectorUtils {
  /**
   * İki vektör arasındaki Kosinüs Benzerliğini (Cosine Similarity) hesaplar.
   * Sonuç 1.0 (Tamamen aynı) ile -1.0 (Tamamen zıt) arasında döner.
   * Genellikle anlamsal eşleşmelerde 0.0 ile 1.0 aralığını kullanırız.
   */
  static cosineSimilarity(A: number[], B: number[]): number {
    if (!A || !B || A.length !== B.length || A.length === 0) {
      return 0; // Hatalı veya boş vektörler için 0
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < A.length; i++) {
      dotProduct += A[i] * B[i];
      normA += A[i] * A[i];
      normB += B[i] * B[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Prisma'dan `[0.123, -0.456, 0.789]` formatında (string) gelen vektörü
   * number[] dizisine çevirir.
   */
  static parseVectorString(vectorStr: string | null): number[] | null {
    if (!vectorStr) return null;
    try {
      // "[0.1, 0.2]" şeklindeki stringi parse et
      const parsed = JSON.parse(vectorStr);
      if (Array.isArray(parsed)) {
        return parsed as number[];
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Davranışsal vektörü günceller (Exponential Moving Average).
   */
  static applyEMA(oldVector: number[] | null, newVector: number[], weight: number, interactionCount: number): number[] {
    if (!oldVector) return [...newVector];

    // Calculate learning rate (alpha)
    // Higher weight -> more impact. Higher interactionCount -> less impact per action (more stable profile)
    // Capped at 0.5 so no single action overwrites history.
    const alpha = Math.min(0.5, weight / (interactionCount + 5));

    const result = new Array(oldVector.length);
    for (let i = 0; i < oldVector.length; i++) {
      result[i] = oldVector[i] * (1 - alpha) + newVector[i] * alpha;
    }
    return result;
  }

  /**
   * İki vektörü verilen ağırlıklarla birleştirir.
   */
  static combineVectors(vectorA: number[], weightA: number, vectorB: number[] | null, weightB: number): number[] {
    if (!vectorB) return [...vectorA];
    
    const result = new Array(vectorA.length);
    for (let i = 0; i < vectorA.length; i++) {
      result[i] = (vectorA[i] * weightA) + (vectorB[i] * weightB);
    }
    return result;
  }

  /**
   * Kullanıcı bir ilanla etkileşime girdiğinde (tıklama, kaydetme, başvuru) davranışsal vektörü günceller.
   */
  static async trackInteraction(prisma: any, userId: string, jobId: string, weight: number): Promise<void> {
    try {
      // 1. Fetch user profile
      const userProfileRaw: any[] = await prisma.$queryRaw`
        SELECT "behavioral_embedding"::text, "interaction_count" 
        FROM "user_profiles" 
        WHERE "user_id" = ${userId}
      `;
      if (!userProfileRaw || userProfileRaw.length === 0) return;
      const userProf = userProfileRaw[0];

      // 2. Fetch job embedding
      const jobRaw: any[] = await prisma.$queryRaw`
        SELECT "embedding"::text 
        FROM "jobs" 
        WHERE "id" = ${jobId}
      `;
      if (!jobRaw || jobRaw.length === 0 || !jobRaw[0].embedding) return;

      const jobEmbedding = this.parseVectorString(jobRaw[0].embedding);
      if (!jobEmbedding) return;

      const oldBehavioral = this.parseVectorString(userProf.behavioral_embedding);
      const interactionCount = userProf.interaction_count || 0;

      // 3. Compute new behavioral embedding
      const newBehavioral = this.applyEMA(oldBehavioral, jobEmbedding, weight, interactionCount);
      const newInteractionCount = interactionCount + weight;

      const vecStr = `[${newBehavioral.join(',')}]`;

      // 4. Update
      await prisma.$executeRaw`
        UPDATE "user_profiles"
        SET "behavioral_embedding" = ${vecStr}::vector,
            "interaction_count" = ${newInteractionCount}
        WHERE "user_id" = ${userId}
      `;
    } catch (e) {
      console.error('Failed to track interaction:', e);
    }
  }
}
