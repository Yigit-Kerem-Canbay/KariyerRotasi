import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import api from '@/api/client';
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

  const [job, setJob] = useState<JobDetail | null>(null);
  const [similar, setSimilar] = useState<JobSimilar[]>([]);
  const [loading, setLoading] = useState(true);

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

  const bullet = [job.city, job.location, job.workModel, job.remote ? 'Remote' : '']
    .filter(Boolean)
    .join(' · ');

  const skills =
    job.jobSkills?.length ? (
      <View style={styles.tagRow}>
        {job.jobSkills.map((x, i) => (
          <Text key={`${x.skill.name}-${i}`} style={styles.tag}>
            {x.skill.name}
          </Text>
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
          <Text style={styles.sectionTit}>İlan açıklaması</Text>
          <Text style={styles.desc}>{job.description.trim()}</Text>
        </View>
      ) : null}

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
  tag: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    color: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
  },

  descCard: { paddingTop: 16 },
  sectionTit: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.slate900,
    marginBottom: 12,
  },
  desc: { fontSize: 15, color: theme.slate800, lineHeight: 24 },

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
