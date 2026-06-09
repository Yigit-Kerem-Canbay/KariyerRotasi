import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import api from '@/api/client';
import { CompanyLogo } from '@/components/CompanyLogo';
import { theme } from '@/lib/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function SavedJobsScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/saved-jobs/me').then((res) => {
      setJobs(res.data?.items || []);
    }).catch(() => {
      setJobs([]);
    }).finally(() => {
      setLoading(false);
    });
  }, [token]);

  const renderJob = ({ item }: any) => {
    const job = item.job;
    if (!job) return null;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/job/${job.id}` as any)}
      >
        <View style={styles.cardTop}>
          <CompanyLogo company={job.company} size={52} rounded={14} />
          <View style={styles.cardTopText}>
            <Text style={styles.cardTitle} numberOfLines={2}>{job.title}</Text>
            <Text style={styles.cardCompany} numberOfLines={1}>{job.company?.name}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {[job.city || job.location, job.workModel].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color={theme.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Favorilerim (Kaydedilenler)', headerTintColor: theme.primary }} />
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : jobs.length === 0 ? (
        <Text style={styles.empty}>Kaydedilmiş ilan bulunmuyor.</Text>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.jobId || item.job?.id}
          renderItem={renderJob}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  empty: { textAlign: 'center', marginTop: 40, color: theme.muted },
  card: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTopText: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.slate900 },
  cardCompany: { fontSize: 14, color: theme.muted, marginTop: 2 },
  cardMeta: { fontSize: 12, color: theme.muted, marginTop: 4 },
});
