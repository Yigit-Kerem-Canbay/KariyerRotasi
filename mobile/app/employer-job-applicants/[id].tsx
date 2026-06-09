import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/api/client';
import { ArrowLeft, Users, Mail, MapPin, Zap, ExternalLink, CheckCircle, XCircle } from 'lucide-react-native';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:4000/api').replace('/api', '');

export default function EmployerJobApplicants() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchApplicants();
  }, [id]);

  const fetchApplicants = async () => {
    try {
      const res = await api.get(`/applications/employer/jobs/${id}/applicants`);
      setApplicants(res.data.items);
    } catch (err) {
      console.error('Failed to fetch applicants', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, status: string) => {
    try {
      await api.patch(`/applications/employer/${applicationId}/status`, { status });
      setApplicants(prev => prev.map(app => app.id === applicationId ? { ...app, status } : app));
    } catch (err) {
      console.error('Status error', err);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Başvurular</Text>
          <Text style={styles.headerSubtitle}>Yapay Zeka uyumuna göre sıralı</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statsBadge}>
          <Users size={16} color="#4F46E5" />
          <Text style={styles.statsText}>{applicants.length} Başvuru</Text>
        </View>
      </View>

      {applicants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Henüz başvuru yok</Text>
          <Text style={styles.emptyDesc}>İlanınıza henüz kimse başvurmamış.</Text>
        </View>
      ) : (
        <FlatList
          data={applicants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item: app }) => {
            const avatarUrl = app.user.avatarUrl 
              ? (app.user.avatarUrl.startsWith('http') ? app.user.avatarUrl : `${API_BASE}${app.user.avatarUrl}`)
              : null;

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  {/* Score */}
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreValue}>%{app.matchScore}</Text>
                    <View style={styles.scoreLabel}>
                      <Zap size={10} color="#A855F7" />
                      <Text style={styles.scoreLabelText}>AI UYUM</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Candidate Info */}
                  <View style={styles.candidateInfo}>
                    <View style={styles.candidateHeader}>
                      <View style={styles.avatar}>
                        {avatarUrl ? (
                          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                        ) : (
                          <Text style={styles.avatarText}>{app.user.name.charAt(0).toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.candidateName}>{app.user.name}</Text>
                        {app.user.profile?.title && (
                          <Text style={styles.candidateTitle}>{app.user.profile.title}</Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.contactInfo}>
                      <View style={styles.contactItem}>
                        <Mail size={12} color="#64748B" />
                        <Text style={styles.contactText}>{app.user.email}</Text>
                      </View>
                      {app.user.profile?.city && (
                        <View style={styles.contactItem}>
                          <MapPin size={12} color="#64748B" />
                          <Text style={styles.contactText}>{app.user.profile.city}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <View style={styles.statusSection}>
                    {app.status === 'pending' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ECFDF5' }]} onPress={() => updateStatus(app.id, 'accepted')}>
                          <CheckCircle size={16} color="#059669" />
                          <Text style={[styles.actionBtnText, { color: '#059669' }]}>Kabul</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF1F2' }]} onPress={() => updateStatus(app.id, 'rejected')}>
                          <XCircle size={16} color="#E11D48" />
                          <Text style={[styles.actionBtnText, { color: '#E11D48' }]}>Ret</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {app.status === 'accepted' && (
                      <View style={[styles.statusBadgeFinal, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                        <CheckCircle size={14} color="#059669" />
                        <Text style={[styles.statusBadgeText, { color: '#059669' }]}>Kabul Edildi</Text>
                      </View>
                    )}
                    {app.status === 'rejected' && (
                      <View style={[styles.statusBadgeFinal, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}>
                        <XCircle size={14} color="#E11D48" />
                        <Text style={[styles.statusBadgeText, { color: '#E11D48' }]}>Reddedildi</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity 
                    style={styles.reviewBtn}
                    onPress={() => router.push(`/employer-applicant-detail/${app.id}` as any)}
                  >
                    <Text style={styles.reviewBtnText}>Adayı İncele</Text>
                    <ExternalLink size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>

              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#312E81',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerSubtitle: { fontSize: 13, color: '#C7D2FE', fontWeight: '500', marginTop: 2 },
  
  statsBar: {
    backgroundColor: '#FFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  statsBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  statsText: { fontSize: 16, fontWeight: '800', color: '#312E81' },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  emptyDesc: { fontSize: 14, color: '#64748B' },
  
  listContainer: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#312E81', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  scoreContainer: { alignItems: 'center', justifyContent: 'center', width: 60 },
  scoreValue: { fontSize: 24, fontWeight: '900', color: '#9333EA' },
  scoreLabel: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  scoreLabelText: { fontSize: 9, fontWeight: '800', color: '#C084FC', letterSpacing: 0.5 },
  divider: { width: 1, height: '100%', backgroundColor: '#F1F5F9', marginHorizontal: 16 },
  
  candidateInfo: { flex: 1 },
  candidateHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#4F46E5' },
  candidateName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  candidateTitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 2 },
  contactInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  statusSection: { flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  statusBadgeFinal: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', borderWidth: 1 },
  statusBadgeText: { fontSize: 13, fontWeight: '700' },
  
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0F172A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  reviewBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
