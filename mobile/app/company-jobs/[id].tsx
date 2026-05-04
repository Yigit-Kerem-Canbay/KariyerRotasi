import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import api from '@/api/client';
import { theme } from '@/lib/theme';

type JobItem = {
  id: string;
  title: string;
  city?: string | null;
  location?: string | null;
  workModel?: string | null;
  remote?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
};

function salaryLine(min?: number | null, max?: number | null) {
  if (min == null && max == null) return '';
  const a = min != null ? `${min.toLocaleString('tr-TR')} ₺` : '';
  const b = max != null ? `${max.toLocaleString('tr-TR')} ₺` : '';
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

export default function CompanyJobsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [meta, setMeta] = useState<{ total?: number; totalPages?: number } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: JobItem[]; meta: any }>('/jobs', {
        params: { companyId: id, page, limit: 20, sort: 'newest' },
      });
      setJobs(res.data.data ?? []);
      setMeta(res.data.meta ?? null);
    } catch {
      setJobs([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    load();
  }, [load]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Şirket ilanları',
      headerBackTitle: 'Geri',
      headerTintColor: theme.primary,
      headerStyle: { backgroundColor: theme.card },
      headerShadowVisible: false,
    });
  }, [navigation]);

  const totalPages = meta?.totalPages ?? 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(j) => j.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.hTitle}>Tüm açık pozisyonlar</Text>
              <Text style={styles.hSub}>
                {meta?.total ? `${meta.total.toLocaleString('tr-TR')} ilan` : ''}
              </Text>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>İlan bulunamadı.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={() => router.push(`/job/${item.id}`)}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                {[item.city || item.location, item.workModel, item.remote ? 'Remote' : ''].filter(Boolean).join(' · ')}
              </Text>
              {!!salaryLine(item.salaryMin, item.salaryMax) ? (
                <Text style={styles.salary}>{salaryLine(item.salaryMin, item.salaryMax)}</Text>
              ) : null}
              <View style={styles.go}>
                <FontAwesome name="chevron-right" size={14} color={theme.muted} />
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pager}>
                <TouchableOpacity
                  style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                  disabled={page <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Text style={styles.pageBtnTxt}>Önceki</Text>
                </TouchableOpacity>
                <Text style={styles.pageLabel}>
                  {page} / {totalPages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                  disabled={page >= totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <Text style={styles.pageBtnTxt}>Sonraki</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ height: 24 }} />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 30 },
  header: { marginBottom: 10 },
  hTitle: { fontSize: 20, fontWeight: '800', color: theme.slate900 },
  hSub: { marginTop: 6, color: theme.muted, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: theme.muted, fontSize: 15 },
  card: {
    backgroundColor: theme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    marginBottom: 10,
    position: 'relative',
  },
  title: { fontSize: 16, fontWeight: '800', color: theme.slate900, paddingRight: 26 },
  sub: { marginTop: 6, fontSize: 12, color: theme.muted, paddingRight: 26 },
  salary: { marginTop: 10, color: theme.primary, fontWeight: '800' },
  go: { position: 'absolute', right: 12, top: 14 },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 10 },
  pageBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: theme.primary, alignItems: 'center' },
  pageBtnDisabled: { opacity: 0.35 },
  pageBtnTxt: { color: '#fff', fontWeight: '800' },
  pageLabel: { minWidth: 72, textAlign: 'center', color: theme.slate900, fontWeight: '800' },
});

