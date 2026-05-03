import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import api from '@/api/client';
import { theme } from '@/lib/theme';
import { CompanyLogo } from '@/components/CompanyLogo';

type CompanyJob = {
  id: string;
  title: string;
  city?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  workModel?: string | null;
};

type CompanyDetail = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  location?: string | null;
  sector?: string | null;
  employeeCount?: string | null;
  jobs?: CompanyJob[];
};

function salaryLine(min?: number | null, max?: number | null) {
  if (min == null && max == null) return '';
  const a = min != null ? `${min.toLocaleString('tr-TR')} ₺` : '';
  const b = max != null ? `${max.toLocaleString('tr-TR')} ₺` : '';
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

export default function CompanyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const [co, setCo] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<CompanyDetail>(`/companies/${id}`);
      setCo(res.data);
      navigation.setOptions({ headerTitle: res.data.name.length > 26 ? `${res.data.name.slice(0, 25)}…` : res.data.name });
    } catch {
      setCo(null);
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

  if (!co) {
    return (
      <View style={styles.center}>
        <Text style={styles.miss}>Şirket bulunamadı.</Text>
      </View>
    );
  }

  const jobs = [...(co.jobs ?? [])];
  const preview = jobs.slice(0, 50);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.heroCard}>
        <CompanyLogo company={co} size={88} rounded={22} />
        <Text style={styles.title}>{co.name}</Text>
        <Text style={styles.meta}>
          {[co.sector || 'Genel', co.location].filter(Boolean).join(' · ')}
        </Text>
        {co.employeeCount ? <Text style={styles.emp}>{co.employeeCount} çalışan</Text> : null}
      </View>

      {co.description ? (
        <View style={styles.card}>
          <Text style={styles.sectionTit}>Hakkında</Text>
          <Text style={styles.desc}>{co.description.trim()}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTit}>Açık pozisyonlar ({jobs.length})</Text>
        {preview.length === 0 ? (
          <Text style={styles.emptyJobs}>Bu şirket için listelenen ilan yok.</Text>
        ) : (
          preview.map((j) => (
            <TouchableOpacity
              key={j.id}
              style={styles.jobRow}
              activeOpacity={0.88}
              onPress={() => router.push(`/job/${j.id}`)}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.jobTit} numberOfLines={2}>{j.title}</Text>
                <Text style={styles.jobSub}>{[j.city, j.workModel].filter(Boolean).join(' · ')}</Text>
              </View>
              {!!salaryLine(j.salaryMin, j.salaryMax) && (
                <Text style={styles.jobSalary}>{salaryLine(j.salaryMin, j.salaryMax)}</Text>
              )}
              <FontAwesome name="chevron-right" size={12} color={theme.muted} style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          ))
        )}
        {jobs.length > preview.length ? (
          <Text style={styles.moreNote}>Liste ilk {preview.length} ilan ile sınırlandı.</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  miss: { fontSize: 16, color: theme.muted },
  scroll: { padding: 16, paddingBottom: 40, backgroundColor: theme.background },
  heroCard: {
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 26,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    color: theme.slate900,
    textAlign: 'center',
  },
  meta: {
    marginTop: 8,
    fontSize: 15,
    color: theme.muted,
    textAlign: 'center',
  },
  emp: { marginTop: 6, fontSize: 13, color: theme.primary, fontWeight: '600' },

  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 18,
    marginBottom: 14,
  },
  sectionTit: { fontSize: 18, fontWeight: '800', color: theme.slate900, marginBottom: 14 },
  desc: { fontSize: 15, color: theme.slate800, lineHeight: 24 },
  emptyJobs: { fontSize: 14, color: theme.muted, fontStyle: 'italic' },

  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 6,
  },
  jobTit: { fontSize: 15, fontWeight: '700', color: theme.slate900 },
  jobSub: { marginTop: 4, fontSize: 12, color: theme.muted },
  jobSalary: { fontSize: 13, fontWeight: '700', color: theme.primary, marginLeft: 4, maxWidth: 100 },
  moreNote: { marginTop: 12, fontSize: 11, color: theme.muted, textAlign: 'center' },
});
