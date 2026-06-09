import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';
import { MapPin, Users, Clock, ChevronRight, Eye, Heart, PlusCircle, Building2 } from 'lucide-react-native';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/employer/my-jobs');
      setJobs(res.data.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
  };

  const formatWorkModel = (model: string) => {
    const models: Record<string, string> = {
      remote: 'Uzaktan',
      hybrid: 'Hibrit',
      office: 'Ofis',
    };
    return models[model] || model;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İlanlarım</Text>
        <Text style={styles.headerSubtitle}>Tüm ilanlarınızı ve aday başvurularını buradan yönetin.</Text>
      </View>

      {jobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Building2 size={40} color="#818CF8" />
          </View>
          <Text style={styles.emptyTitle}>Henüz ilan yayınlamadınız</Text>
          <Text style={styles.emptyDesc}>Yeni takım arkadaşlarınızı bulmak için hemen ilk ilanınızı oluşturun.</Text>
          <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(employer-tabs)/post-job' as any)}>
            <PlusCircle size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.exploreButtonText}>İlan Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/employer-job-applicants/${item.id}` as any)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoBadge}>
                  <MapPin size={14} color="#64748B" />
                  <Text style={styles.infoText}>{item.location}</Text>
                </View>
                <View style={styles.infoBadge}>
                  <Clock size={14} color="#64748B" />
                  <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>

              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{formatWorkModel(item.workModel)}</Text>
                </View>
                {item.salaryMin && (
                  <View style={[styles.tag, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                    <Text style={[styles.tagText, { color: '#059669' }]}>{item.salaryMin.toLocaleString('tr-TR')} {item.currency}</Text>
                  </View>
                )}
              </View>

              {/* Stats Row */}
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Eye size={16} color="#818CF8" />
                  <Text style={styles.statValue}>{item.viewCount || 0}</Text>
                  <Text style={styles.statLabel}>Görüntüleme</Text>
                </View>
                <View style={styles.statBox}>
                  <Heart size={16} color="#F472B6" />
                  <Text style={styles.statValue}>{item._count?.savedBy || 0}</Text>
                  <Text style={styles.statLabel}>Favori</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' }]}>
                  <Users size={16} color="#4F46E5" />
                  <Text style={[styles.statValue, { color: '#312E81' }]}>{item._count?.applications || 0}</Text>
                  <Text style={[styles.statLabel, { color: '#6366F1' }]}>Başvuru</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>Başvuruları İncele</Text>
                <ChevronRight size={20} color="#4F46E5" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#312E81',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  headerSubtitle: { fontSize: 15, color: '#C7D2FE', fontWeight: '500' },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  exploreButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  exploreButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  listContainer: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    shadowColor: '#312E81', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  cardHeader: { marginBottom: 12 },
  jobTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  infoBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E0E7FF' },
  tagText: { fontSize: 12, fontWeight: '700', color: '#4F46E5' },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginVertical: 4 },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerText: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
});
