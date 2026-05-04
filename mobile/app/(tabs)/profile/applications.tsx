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

type AppRow = {
  id: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    company: { id: string; name: string };
  };
};

function statusLabel(s: string) {
  if (s === 'accepted') return 'Kabul';
  if (s === 'rejected') return 'Red';
  return 'Beklemede';
}

export default function ProfileApplicationsScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const userRole = useAuthStore((s) => s.user?.role);
  const [items, setItems] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    if (!token || userRole !== 'job_seeker') return;
    setLoading(true);
    try {
      const { data } = await api.get<{ items: AppRow[] }>('/applications/me?limit=100');
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
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>Henüz başvuru yok.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.86}
              onPress={() => router.push(`/job/${item.job.id}`)}
            >
              <View style={styles.row}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.job.title}
                  </Text>
                  <Text style={styles.co} numberOfLines={1}>
                    {item.job.company.name}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>{statusLabel(item.status)}</Text>
                </View>
              </View>
              <Text style={styles.meta} numberOfLines={1}>
                {item.job.location} · {new Date(item.createdAt).toLocaleDateString('tr-TR')}
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
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { fontSize: 17, fontWeight: '700', color: theme.slate900 },
  co: { marginTop: 6, fontSize: 14, fontWeight: '700', color: theme.primary },
  meta: { marginTop: 10, fontSize: 13, color: theme.muted },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    alignSelf: 'flex-start',
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.slate800,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
