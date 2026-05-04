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
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { isAxiosError } from 'axios';

import api from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { getWebOrigin } from '@/lib/config';
import { theme } from '@/lib/theme';
import { CompanyLogo } from '@/components/CompanyLogo';

type JobDetail = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  city?: string | null;
  employmentType?: string | null;
  workModel?: string | null;
  remote?: boolean;
  experienceYears?: string | null;
  educationLevel?: string | null;
  language?: string | null;
  militaryStatus?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  createdAt?: string;
  company: {
    id: string;
    name: string;
    website?: string | null;
    logoUrl?: string | null;
    sector?: string | null;
    location?: string | null;
    description?: string | null;
  };
  jobSkills?: { skill: { name: string } }[];
};

type JobSimilar = JobDetail;

function salaryLine(min?: number | null, max?: number | null) {
  if (min == null && max == null) return 'Maaş görüşülür üzerinden';
  const a = min != null ? `${min.toLocaleString('tr-TR')} ₺` : '';
  const b = max != null ? `${max.toLocaleString('tr-TR')} ₺` : '';
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const token = useAuthStore((s) => s.token);
  const userRole = useAuthStore((s) => s.user?.role);

  const [job, setJob] = useState<JobDetail | null>(null);
  const [similar, setSimilar] = useState<JobSimilar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

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
  }, [job?.id, token, refreshEngagement]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Geri',
      headerTintColor: theme.primary,
      headerStyle: { backgroundColor: theme.card },
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
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
      router.push('/(auth)/login');
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
      router.push('/(auth)/login');
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
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 409) setApplied(true);
      else Alert.alert('Hata', 'Başvuru gönderilemedi.');
    } finally {
      setActionBusy(false);
    }
  };

  const bullet = [job.city, job.location, job.workModel, job.remote ? 'Remote' : '']
    .filter(Boolean)
    .join(' · ');

  const skills =
    job.jobSkills?.length ? (
      <View style={styles.tagRow}>
        {job.jobSkills.map((x, i) => (
          <View key={`${x.skill.name}-${i}`} style={styles.tagWrap}>
            <Text style={styles.tag} numberOfLines={1} ellipsizeMode="tail">
              {x.skill.name}
            </Text>
          </View>
        ))}
      </View>
    ) : null;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <CompanyLogo company={job.company} size={72} rounded={18} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.title}>{job.title}</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/company/${job.company.id}`)}
            >
              <Text style={styles.company}>{job.company.name}</Text>
            </TouchableOpacity>
            <Text style={styles.small}>{bullet}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.iconBtn, saved && styles.iconBtnActive]}
            activeOpacity={0.85}
            disabled={actionBusy}
            onPress={() => void toggleSaved()}
          >
            <FontAwesome
              name={saved ? 'heart' : 'heart-o'}
              size={18}
              color={saved ? theme.destructive : theme.slate900}
            />
            <Text style={styles.iconBtnTxt}>{saved ? 'Kayıtlı' : 'Kaydet'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.85}
            onPress={() =>
              void Share.share({
                message: `${job.title} — ${shareUrl}`,
                url: shareUrl,
                title: job.title,
              }).catch(() => {})
            }
          >
            <FontAwesome name="share-alt" size={18} color={theme.slate900} />
            <Text style={styles.iconBtnTxt}>Paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyBtn, (applied || actionBusy) && styles.applyBtnDisabled]}
            activeOpacity={0.9}
            disabled={applied || actionBusy}
            onPress={() => void submitApply()}
          >
            <Text style={styles.applyBtnTxt}>{applied ? 'Başvuruldu' : 'Başvur'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.salary}>{salaryLine(job.salaryMin, job.salaryMax)}</Text>

        <View style={styles.grid}>
          {job.experienceYears ? (
            <View style={styles.gridItem}>
              <Text style={styles.gridLbl}>Deneyim</Text>
              <Text style={styles.gridVal}>{job.experienceYears}</Text>
            </View>
          ) : null}
          {job.educationLevel ? (
            <View style={styles.gridItem}>
              <Text style={styles.gridLbl}>Eğitim</Text>
              <Text style={styles.gridVal}>{job.educationLevel}</Text>
            </View>
          ) : null}
          {job.language ? (
            <View style={styles.gridItem}>
              <Text style={styles.gridLbl}>Dil</Text>
              <Text style={styles.gridVal}>{job.language}</Text>
            </View>
          ) : null}
          {job.militaryStatus ? (
            <View style={styles.gridItem}>
              <Text style={styles.gridLbl}>Askerlik</Text>
              <Text style={styles.gridVal}>{job.militaryStatus}</Text>
            </View>
          ) : null}
          {job.employmentType ? (
            <View style={styles.gridItem}>
              <Text style={styles.gridLbl}>Çalışma şekli</Text>
              <Text style={styles.gridVal}>{job.employmentType}</Text>
            </View>
          ) : null}
        </View>

        {skills}
      </View>

      {job.description ? (
        <View style={[styles.card, styles.descCard]}>
          <Text style={styles.sectionTit}>İş tanımı ve aranan nitelikler</Text>
          <Text style={styles.desc}>{job.description.trim()}</Text>
        </View>
      ) : null}

      <View style={[styles.card, styles.descCard]}>
        <Text style={styles.sectionTit}>Yetenek uyumluluk analizi</Text>
        <Text style={styles.descMuted}>
          Yakında: CV’ne göre bu ilana uyum skorunu ve eksik yeteneklerini burada göstereceğiz.
        </Text>
      </View>

      <View style={[styles.card, styles.descCard]}>
        <Text style={styles.sectionTit}>AI maaş analizi</Text>
        <Text style={styles.descMuted}>
          Yakında: Piyasa maaş aralığına göre bu ilanın maaş bandını analiz edeceğiz.
        </Text>
      </View>

      {similar.length > 0 ? (
        <View style={styles.simSection}>
          <Text style={styles.sectionTit}>Benzer ilanlar</Text>
          <FlatList
            horizontal
            data={similar}
            keyExtractor={(s) => s.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
            renderItem={({ item: s }) => (
              <TouchableOpacity
                style={styles.simCard}
                activeOpacity={0.86}
                onPress={() => router.push(`/job/${s.id}`)}
              >
                <Text style={styles.simTitle} numberOfLines={2}>
                  {s.title}
                </Text>
                <Text style={styles.simCo} numberOfLines={1}>
                  {s.company.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  miss: { color: theme.muted, fontSize: 16 },
  scroll: { padding: 16, paddingBottom: 40, backgroundColor: theme.background },
  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 18,
    marginBottom: 14,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  title: { fontSize: 22, fontWeight: '800', color: theme.slate900 },
  company: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
    textDecorationLine: 'underline',
  },
  small: { marginTop: 8, fontSize: 13, color: theme.muted, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  iconBtnActive: {
    borderColor: 'rgba(244,63,94,0.35)',
    backgroundColor: 'rgba(244,63,94,0.06)',
  },
  iconBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    backgroundColor: theme.background,
    paddingVertical: 10,
  },
  iconBtnTxt: { fontSize: 13, fontWeight: '800', color: theme.slate900 },
  applyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: theme.primary,
    paddingVertical: 10,
  },
  applyBtnDisabled: { opacity: 0.55 },
  applyBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  salary: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '800',
    color: theme.primary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  gridItem: { width: '47%', backgroundColor: theme.background, borderRadius: 12, padding: 10 },
  gridLbl: { fontSize: 10, fontWeight: '700', color: theme.muted, textTransform: 'uppercase' },
  gridVal: { marginTop: 4, fontSize: 14, fontWeight: '600', color: theme.slate900 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  tagWrap: { maxWidth: '100%', alignSelf: 'flex-start' },
  tag: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    color: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 220,
  },

  descCard: { paddingTop: 16 },
  sectionTit: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.slate900,
    marginBottom: 12,
  },
  desc: { fontSize: 15, color: theme.slate800, lineHeight: 24 },
  descMuted: { fontSize: 14, color: theme.muted, lineHeight: 22 },

  simSection: { marginTop: 8 },
  simCard: {
    width: 220,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    marginRight: 6,
  },
  simTitle: { fontSize: 15, fontWeight: '700', color: theme.slate900 },
  simCo: { marginTop: 8, fontSize: 13, color: theme.muted },
});
