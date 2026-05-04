import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import api from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { theme } from '@/lib/theme';

type SavedRow = {
  jobId: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    company: { id: string; name: string };
  };
};

export default function ProfileSavedJobsScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const userRole = useAuthStore((s) => s.user?.role);
  const [items, setItems] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    if (!token || userRole !== 'job_seeker') return;
    setLoading(true);
    try {
      const { data } = await api.get<{ items: SavedRow[] }>('/saved-jobs/me?limit=100');
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, userRole]);

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }
    if (userRole !== 'job_seeker') {
      router.back();
      return;
    }
    void fetchList();
  }, [token, userRole, router, fetchList]);

  if (!token || userRole !== 'job_seeker') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={items}
          keyExtractor={(item) => item.jobId}
          ListEmptyComponent={
            <Text style={styles.empty}>Kayıtlı ilan yok.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.86}
              onPress={() => router.push(`/job/${item.job.id}`)}
            >
              <Text style={styles.title} numberOfLines={2}>
                {item.job.title}
              </Text>
              <Text style={styles.co} numberOfLines={1}>
                {item.job.company.name}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {item.job.location}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  list: { padding: 16, paddingBottom: 32, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: theme.muted, marginTop: 24 },
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 4,
  },
  title: { fontSize: 17, fontWeight: '700', color: theme.slate900 },
  co: { marginTop: 6, fontSize: 14, fontWeight: '700', color: theme.primary },
  meta: { marginTop: 6, fontSize: 13, color: theme.muted },
});
