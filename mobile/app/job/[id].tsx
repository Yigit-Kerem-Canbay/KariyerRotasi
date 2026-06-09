import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Share,
  Alert,
  Modal,
  Pressable
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import { isAxiosError } from 'axios';

import api from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { getWebOrigin } from '@/lib/config';
import { theme } from '@/lib/theme';

type JobDetail = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  city?: string | null;
  employmentType?: string | null;
  employmentTypes?: string[];
  workModel?: string | null;
  workSchedule?: any[];
  remote?: boolean;
  experienceYears?: string | null;
  educationLevel?: string | null;
  language?: string | null;
  militaryStatus?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  hideSalary?: boolean;
  createdAt?: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    website?: string | null;
    logoUrl?: string | null;
    sector?: string | null;
    location?: string | null;
    description?: string | null;
    ownerId?: string | null;
  };
  jobSkills?: { skill: { name: string } }[];
};

type JobSimilar = JobDetail;

function salaryLine(min?: number | null, max?: number | null, hide?: boolean) {
  if (hide) return 'Maaş İlk Aşamada Paylaşılmayacaktır';
  if (min == null && max == null) return 'Maaş gizli';
  const a = min != null ? `${min.toLocaleString('tr-TR')} ₺` : '';
  const b = max != null ? `${max.toLocaleString('tr-TR')} ₺` : '';
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

function formatLocation(loc?: string | null) {
  if (!loc) return '';
  const parts = loc.split(',').map(s => s.trim());
  if (parts.length > 3) {
    return `${parts.slice(0, 2).join(', ')} ve ${parts.length - 2} şehir daha`;
  }
  return loc;
}

function getAvatarColor(name: string) {
  const hash = Math.abs((name || '').split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0));
  return `hsl(${hash % 360}, 80%, 55%)`;
}

const CompanyLogo = ({ company, size = 48, rounded = 12 }: { company: any, size?: number, rounded?: number }) => {
  return (
    <View style={[{ width: size, height: size, borderRadius: rounded, backgroundColor: getAvatarColor(company?.name || 'A'), justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: '#fff', fontSize: size * 0.45, fontWeight: '800' }}>
        {company?.name?.charAt(0) || 'A'}
      </Text>
    </View>
  );
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role;
  const userId = user?.id;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [similar, setSimilar] = useState<JobSimilar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [matchAnalysis, setMatchAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const isOwner = job?.company?.ownerId === userId;

  const refreshEngagement = useCallback(
    async (jobUuid: string) => {
      if (!token) {
        setSaved(false);
        setApplied(false);
        return;
      }
      try {
        const [apps, sav] = await Promise.all([
          api.get<{ applied: boolean }>(`/applications/status?jobId=${jobUuid}`),
          api.get<{ saved: boolean }>(`/saved-jobs/status?jobId=${jobUuid}`),
        ]);
        setApplied(!!apps.data?.applied);
        setSaved(!!sav.data?.saved);
      } catch {
        setApplied(false);
        setSaved(false);
      }
    },
    [token],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const jr = await api.get<JobDetail>(`/jobs/${id}`);
      setJob(jr.data);
      navigation.setOptions({
        headerTitle:
          jr.data.title.length > 28 ? `${jr.data.title.slice(0, 27)}…` : jr.data.title,
      });
      try {
        const sr = await api.get<JobSimilar[]>(`/jobs/${id}/similar`);
        setSimilar(sr.data ?? []);
      } catch {
        setSimilar([]);
      }
    } catch {
      setJob(null);
      setSimilar([]);
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!job?.id) return;
    if (!token) {
      setSaved(false);
      setApplied(false);
      return;
    }
    void refreshEngagement(job.id);

    if (userRole === 'job_seeker') {
      setLoadingAnalysis(true);
      api.get(`/jobs/${job.id}/match-analysis`)
        .then(res => setMatchAnalysis(res.data?.data))
        .catch(err => console.error("Match analysis failed", err))
        .finally(() => setLoadingAnalysis(false));
    }
  }, [job?.id, token, refreshEngagement, userRole]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Geri',
      headerTintColor: theme.slate900,
      headerStyle: { backgroundColor: '#fff' },
      headerShadowVisible: false,
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text style={styles.miss}>İlan bulunamadı.</Text>
      </View>
    );
  }

  const shareUrl = `${getWebOrigin().replace(/\/$/, '')}/job/${job.id}`;

  const toggleSaved = async () => {
    if (!token) {
      router.push('/(auth)/login' as any);
      return;
    }
    if (userRole !== 'job_seeker') {
      Alert.alert('Uyarı', 'Kaydetmek için iş arayan hesabıyla giriş yapın.');
      return;
    }
    setActionBusy(true);
    try {
      if (saved) {
        await api.delete(`/saved-jobs/${job.id}`);
        setSaved(false);
      } else {
        await api.post('/saved-jobs', { jobId: job.id });
        setSaved(true);
      }
    } catch {
      Alert.alert('Hata', 'Kayıt işlemi tamamlanamadı.');
    } finally {
      setActionBusy(false);
    }
  };

  const submitApply = async () => {
    if (!token) {
      router.push('/(auth)/login' as any);
      return;
    }
    if (userRole !== 'job_seeker') {
      Alert.alert('Uyarı', 'Başvurmak için iş arayan hesabıyla giriş yapın.');
      return;
    }
    setActionBusy(true);
    try {
      await api.post('/applications', { jobId: job.id });
      setApplied(true);
      setShowApplyModal(false);
      Alert.alert('Başarılı', 'Başvurunuz başarıyla alındı!');
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setApplied(true);
        setShowApplyModal(false);
      } else {
        Alert.alert('Hata', 'Başvuru gönderilemedi.');
      }
    } finally {
      setActionBusy(false);
    }
  };

  const withdrawApply = async () => {
    Alert.alert('Geri Çek', 'Başvurunuzu geri çekmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Evet, Geri Çek', 
        style: 'destructive',
        onPress: async () => {
          setActionBusy(true);
          try {
            await api.delete(`/applications/${job.id}`);
            setApplied(false);
          } catch (err) {
            Alert.alert('Hata', 'Başvuru geri çekilemedi.');
          } finally {
            setActionBusy(false);
          }
        }
      }
    ]);
  };

  const aiScoreVal = matchAnalysis ? (matchAnalysis.matchScore || matchAnalysis.match_score || matchAnalysis.algorithmicScore || 0) : 0;
  const finalScore = aiScoreVal > 1 ? aiScoreVal : aiScoreVal * 100;

  const renderWorkSchedule = (ws: any) => {
    if (!ws) return '';
    if (typeof ws === 'string') return ws;
    
    const items = Array.isArray(ws) ? ws : [ws];
    return items.map((item: any) => {
      if (!item) return '';
      if (item.isCustom && item.day) return item.day;
      if (item.day && item.start && item.end) return `${item.day} (${item.start} - ${item.end})`;
      return '';
    }).filter(Boolean).join('\n');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <CompanyLogo company={job.company} size={64} rounded={16} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{job.title}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/company/${job.company.id}` as any)}>
                <Text style={styles.companyName}><Feather name="briefcase" size={14} /> {job.company.name}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Feather name="map-pin" size={12} color="#64748b" />
              <Text style={styles.tagText}>{formatLocation(job.city || job.location)}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#eff6ff' }]}>
              <Feather name="clock" size={12} color="#2563eb" />
              <Text style={[styles.tagText, { color: '#2563eb' }]}>{job.workModel}</Text>
            </View>
            <View style={styles.tag}>
              <Feather name="calendar" size={12} color="#64748b" />
              <Text style={styles.tagText}>{new Date(job.createdAt || '').toLocaleDateString('tr-TR')}</Text>
            </View>
            {job.salaryMin && !job.hideSalary ? (
              <View style={[styles.tag, { backgroundColor: '#ecfdf5' }]}>
                <Feather name="dollar-sign" size={12} color="#059669" />
                <Text style={[styles.tagText, { color: '#059669' }]}>
                  {job.salaryMin.toLocaleString('tr-TR')} ₺ - {job.salaryMax?.toLocaleString('tr-TR')} ₺
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* AI Analysis Card */}
        {matchAnalysis && (
          <View style={[styles.card, { borderColor: '#e0e7ff', backgroundColor: '#f5f8ff' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Feather name="zap" size={20} color="#2563eb" style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { marginBottom: 0, color: '#1e3a8a' }]}>Yapay Zeka Uyumluluk Analizi</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ width: `${finalScore}%`, height: '100%', backgroundColor: '#2563eb' }} />
              </View>
              <Text style={{ marginLeft: 12, fontWeight: '800', color: '#2563eb', width: 45 }}>%{finalScore.toFixed(0)}</Text>
            </View>

            {matchAnalysis.matchDetails && (
              <View style={{ marginBottom: 16, gap: 12 }}>
                {[
                  { label: 'Yetenek Uyumu', value: matchAnalysis.matchDetails.skillsMatch || 0, color: '#3b82f6' },
                  { label: 'Deneyim Uyumu', value: matchAnalysis.matchDetails.experienceMatch || 0, color: '#10b981' },
                  { label: 'Eğitim Uyumu', value: matchAnalysis.matchDetails.educationMatch || 0, color: '#8b5cf6' }
                ].map((stat, idx) => (
                  <View key={idx}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>{stat.label}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: stat.color }}>%{Math.round(stat.value)}</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ width: `${stat.value}%`, height: '100%', backgroundColor: stat.color }} />
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {(matchAnalysis.matchDetails?.matchedSkills || matchAnalysis.matchedSkills || matchAnalysis.matched_skills)?.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669', marginBottom: 6 }}>Eşleşen Yetenekler</Text>
                <View style={styles.tagsContainer}>
                  {(matchAnalysis.matchDetails?.matchedSkills || matchAnalysis.matchedSkills || matchAnalysis.matched_skills).map((s: any, i: number) => (
                    <View key={i} style={[styles.tag, { backgroundColor: '#d1fae5', paddingVertical: 4 }]}><Text style={[styles.tagText, { color: '#047857' }]}>{s?.name || s}</Text></View>
                  ))}
                </View>
              </View>
            )}

            {(matchAnalysis.matchDetails?.missingSkills || matchAnalysis.missingSkills || matchAnalysis.missing_skills)?.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#dc2626', marginBottom: 6 }}>Eksik Yetenekler (Geliştirilmeli)</Text>
                <View style={styles.tagsContainer}>
                  {(matchAnalysis.matchDetails?.missingSkills || matchAnalysis.missingSkills || matchAnalysis.missing_skills).map((s: string, i: number) => (
                    <View key={i} style={[styles.tag, { backgroundColor: '#fee2e2', paddingVertical: 4 }]}><Text style={[styles.tagText, { color: '#b91c1c' }]}>{s}</Text></View>
                  ))}
                </View>
              </View>
            )}

            {/* AI Salary Analysis */}
            {(matchAnalysis.salaryInsights || matchAnalysis.salary_insights || matchAnalysis.recommendation) && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e7ff' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Feather name="trending-up" size={16} color="#059669" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}>Yapay Zeka Değerlendirmesi</Text>
                </View>
                <Text style={{ fontSize: 13, color: '#475569', lineHeight: 20 }}>
                  {matchAnalysis.recommendation || matchAnalysis.salaryInsights || matchAnalysis.salary_insights}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Required Skills */}
        {job.jobSkills && job.jobSkills.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Aranan Teknolojiler ve Yetenekler</Text>
            <View style={styles.tagsContainer}>
              {job.jobSkills.map((js, idx) => (
                <View key={idx} style={[styles.tag, { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }]}>
                  <Text style={styles.tagText}>{js.skill.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>İş Tanımı ve Genel Nitelikler</Text>
          <Text style={styles.descText}>{job.description?.trim()}</Text>
        </View>

        {/* Requirements Table */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Çalışma Şartları & Beklentiler</Text>
          
          <View style={styles.table}>
            {job.experienceYears && (
              <View style={styles.tableRow}>
                <View style={styles.tableColLeft}><Text style={styles.tableLbl}>Deneyim</Text></View>
                <View style={styles.tableColRight}><Text style={styles.tableVal}>{job.experienceYears}</Text></View>
              </View>
            )}
            {job.educationLevel && (
              <View style={styles.tableRow}>
                <View style={styles.tableColLeft}><Text style={styles.tableLbl}>Eğitim Seviyesi</Text></View>
                <View style={styles.tableColRight}><Text style={styles.tableVal}>{job.educationLevel}</Text></View>
              </View>
            )}
            {job.language && (
              <View style={styles.tableRow}>
                <View style={styles.tableColLeft}><Text style={styles.tableLbl}>Yabancı Dil</Text></View>
                <View style={styles.tableColRight}><Text style={styles.tableVal}>{job.language}</Text></View>
              </View>
            )}
            {job.militaryStatus && (
              <View style={styles.tableRow}>
                <View style={styles.tableColLeft}><Text style={styles.tableLbl}>Askerlik Durumu</Text></View>
                <View style={styles.tableColRight}><Text style={styles.tableVal}>{job.militaryStatus}</Text></View>
              </View>
            )}
            {job.employmentTypes && job.employmentTypes.length > 0 && (
              <View style={styles.tableRow}>
                <View style={styles.tableColLeft}><Text style={styles.tableLbl}>Çalışma Şekli</Text></View>
                <View style={styles.tableColRight}><Text style={styles.tableVal}>{job.employmentTypes.join(', ')}</Text></View>
              </View>
            )}
            {job.workSchedule && (
              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <View style={styles.tableColLeft}><Text style={styles.tableLbl}>Çalışma Saatleri</Text></View>
                <View style={styles.tableColRight}><Text style={styles.tableVal}>{renderWorkSchedule(job.workSchedule)}</Text></View>
              </View>
            )}
          </View>
        </View>

        {/* Similar Jobs */}
        {similar.length > 0 && (
          <View style={{ marginBottom: 40, marginTop: 10 }}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>Benzer İlanlar</Text>
            <FlatList
              horizontal
              data={similar}
              keyExtractor={(s) => s.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
              renderItem={({ item: s }) => (
                <TouchableOpacity
                  style={styles.simCard}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/job/${s.id}` as any)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <CompanyLogo company={s.company} size={48} rounded={10} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.simTitle} numberOfLines={2}>{s.title}</Text>
                      <Text style={styles.simCo} numberOfLines={1}>{s.company.name}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#64748b' }}><Feather name="map-pin" size={10} /> {formatLocation(s.city || s.location)}</Text>
                    {s.workModel && <View style={[styles.tag, { paddingHorizontal: 6, paddingVertical: 2 }]}><Text style={{ fontSize: 10, color: '#2563eb', fontWeight: '700' }}>{s.workModel}</Text></View>}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleSaved} disabled={actionBusy}>
          <FontAwesome name={saved ? 'heart' : 'heart-o'} size={22} color={saved ? '#e11d48' : '#64748b'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => void Share.share({ url: shareUrl, title: job.title })}>
          <Feather name="share-2" size={22} color="#64748b" />
        </TouchableOpacity>
        
        {isOwner ? (
          <View style={[styles.applyBtn, { backgroundColor: '#f59e0b' }]}>
            <Text style={styles.applyBtnText}>İlanı Düzenle (Web)</Text>
          </View>
        ) : applied ? (
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: '#fee2e2' }]} onPress={withdrawApply} disabled={actionBusy}>
            <Text style={[styles.applyBtnText, { color: '#dc2626' }]}>Başvuruyu Geri Çek</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.applyBtn} onPress={() => setShowApplyModal(true)} disabled={actionBusy}>
            <Text style={styles.applyBtnText}>Hemen Başvur</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Apply Modal */}
      <Modal visible={showApplyModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowApplyModal(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Feather name="check-circle" size={24} color="#2563eb" />
              </View>
              <Text style={styles.modalTitle}>Başvuru Yap</Text>
            </View>
            <Text style={styles.modalDesc}>
              <Text style={{ fontWeight: '700', color: '#0f172a' }}>{job.company.name}</Text> şirketindeki <Text style={{ fontWeight: '700', color: '#0f172a' }}>{job.title}</Text> pozisyonu için başvurunuzu onaylıyor musunuz?
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]} onPress={() => setShowApplyModal(false)}>
                <Text style={[styles.modalBtnText, { color: '#475569' }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={submitApply} disabled={actionBusy}>
                {actionBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Başvuruyu Gönder</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  miss: { color: '#64748b', fontSize: 16 },
  scroll: { padding: 20, paddingBottom: 100 },
  mainCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  companyName: { fontSize: 15, fontWeight: '600', color: '#2563eb' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  tagText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  descText: { fontSize: 15, color: '#475569', lineHeight: 26 },
  
  table: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tableColLeft: { width: '40%', backgroundColor: '#f8fafc', padding: 14, borderRightWidth: 1, borderRightColor: '#e2e8f0', justifyContent: 'center' },
  tableColRight: { width: '60%', backgroundColor: '#fff', padding: 14, justifyContent: 'center' },
  tableLbl: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  tableVal: { fontSize: 14, fontWeight: '600', color: '#0f172a' },

  simCard: { width: 280, backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  simTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 4, lineHeight: 20 },
  simCo: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 10 },
  iconBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  applyBtn: { flex: 1, height: 56, backgroundColor: '#2563eb', borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  modalIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  modalDesc: { fontSize: 15, color: '#475569', lineHeight: 24 },
  modalBtn: { flex: 1, height: 52, backgroundColor: '#2563eb', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' }
});
