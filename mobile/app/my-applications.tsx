import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import api from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { CompanyLogo } from '@/components/CompanyLogo';
import { theme } from '@/lib/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Calendar, Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react-native';

const STATUS_FILTERS = [
  { key: 'all', label: 'Hepsi' },
  { key: 'pending', label: 'Değerlendirmede' },
  { key: 'accepted', label: 'Kabul Edildi' },
  { key: 'rejected', label: 'Reddedildi' },
];

export default function MyApplicationsScreen() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/me');
      setApplications(res.data?.items || res.data || []);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'accepted': return { text: 'Kabul Edildi', color: '#059669', bg: '#ECFDF5', icon: CheckCircle };
      case 'rejected': return { text: 'Reddedildi', color: '#E11D48', bg: '#FFF1F2', icon: XCircle };
      default: return { text: 'Değerlendirmede', color: '#D97706', bg: '#FFFBEB', icon: Clock };
    }
  };

  const filtered = activeFilter === 'all'
    ? applications
    : applications.filter((a) => {
        if (activeFilter === 'pending') return a.status !== 'accepted' && a.status !== 'rejected';
        return a.status === activeFilter;
      });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Başvurularım', headerTintColor: theme.primary }} />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[styles.filterTabText, activeFilter === f.key && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Briefcase size={32} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>
            {activeFilter === 'all' ? 'Henüz Başvurunuz Yok' : 'Bu Kategoride Başvuru Yok'}
          </Text>
          <Text style={styles.emptyDesc}>
            {activeFilter === 'all'
              ? 'İlgilendiğiniz iş ilanlarına başvurarak kariyerinize yön verin.'
              : 'Farklı bir filtre seçmeyi deneyin.'}
          </Text>
          {activeFilter === 'all' && (
            <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)/jobs' as any)}>
              <Text style={styles.exploreButtonText}>İlanları Keşfet</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const status = getStatusDisplay(item.status);
            const StatusIcon = status.icon;
            const job = item.job;

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => router.push(`/job/${job?.id}` as any)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.companyInfo}>
                    <CompanyLogo company={job?.company} size={48} rounded={12} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle} numberOfLines={1}>{job?.title}</Text>
                      <Text style={styles.companyName} numberOfLines={1}>{job?.company?.name}</Text>
                      {(job?.city || job?.workModel) ? (
                        <Text style={styles.jobMeta} numberOfLines={1}>
                          {[job.city, job.workModel].filter(Boolean).join(' · ')}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <StatusIcon size={12} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.dateInfo}>
                    <Calendar size={14} color="#64748B" />
                    <Text style={styles.dateText}>{item.createdAt ? formatDate(item.createdAt) : ''}</Text>
                  </View>
                  <FontAwesome name="chevron-right" size={14} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: theme.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#fff',
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  exploreButton: { backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  exploreButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  listContainer: { padding: 16, gap: 12, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  companyInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1, marginRight: 10 },
  jobTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  companyName: { fontSize: 13, fontWeight: '500', color: '#64748B', marginBottom: 2 },
  jobMeta: { fontSize: 12, color: '#94A3B8' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
});
