import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/api/client';
import { ArrowLeft, Mail, Phone, MapPin, Zap, CheckCircle, XCircle, FileText, ExternalLink, Briefcase, GraduationCap, Code } from 'lucide-react-native';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:4000/api').replace('/api', '');

export default function EmployerApplicantDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/applications/employer/${id}/profile`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/applications/employer/${id}/status`, { status });
      setData((prev: any) => ({
        ...prev,
        application: { ...prev.application, status }
      }));
      Alert.alert('Başarılı', status === 'accepted' ? 'Aday kabul edildi.' : 'Aday reddedildi.');
    } catch (err) {
      Alert.alert('Hata', 'Durum güncellenemedi.');
    }
  };

  const handleOpenCV = async (cvUrl: string) => {
    const fullUrl = cvUrl.startsWith('http') ? cvUrl : `${API_BASE}${cvUrl}`;
    try {
      await Linking.openURL(fullUrl);
    } catch (error) {
      Alert.alert('Hata', 'CV açılamadı.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Başvuru bulunamadı</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#4F46E5', fontWeight: 'bold' }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { candidate, application, matchReport } = data;
  const avatarUrl = candidate.avatarUrl 
    ? (candidate.avatarUrl.startsWith('http') ? candidate.avatarUrl : `${API_BASE}${candidate.avatarUrl}`)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header Banner */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aday Profili</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Card */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardTop}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{candidate.name.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.candidateName}>{candidate.name}</Text>
            {candidate.profile?.title && <Text style={styles.candidateTitle}>{candidate.profile.title}</Text>}
            
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Mail size={14} color="#64748B" />
                <Text style={styles.contactText}>{candidate.email}</Text>
              </View>
              {candidate.phone && (
                <View style={styles.contactItem}>
                  <Phone size={14} color="#64748B" />
                  <Text style={styles.contactText}>{candidate.phone}</Text>
                </View>
              )}
              {candidate.profile?.city && (
                <View style={styles.contactItem}>
                  <MapPin size={14} color="#64748B" />
                  <Text style={styles.contactText}>{candidate.profile.city}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {application.status === 'pending' && (
            <View style={styles.statusButtons}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1 }]} onPress={() => updateStatus('accepted')}>
                <CheckCircle size={18} color="#059669" />
                <Text style={[styles.actionBtnText, { color: '#059669' }]}>Kabul Et</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3', borderWidth: 1 }]} onPress={() => updateStatus('rejected')}>
                <XCircle size={18} color="#E11D48" />
                <Text style={[styles.actionBtnText, { color: '#E11D48' }]}>Reddet</Text>
              </TouchableOpacity>
            </View>
          )}

          {application.status === 'accepted' && (
            <View style={[styles.statusFinal, { backgroundColor: '#ECFDF5', borderColor: '#059669' }]}>
              <CheckCircle size={20} color="#059669" />
              <Text style={[styles.statusFinalText, { color: '#059669' }]}>Bu adayı kabul ettiniz</Text>
            </View>
          )}

          {application.status === 'rejected' && (
            <View style={[styles.statusFinal, { backgroundColor: '#FFF1F2', borderColor: '#E11D48' }]}>
              <XCircle size={20} color="#E11D48" />
              <Text style={[styles.statusFinalText, { color: '#E11D48' }]}>Bu adayı reddettiniz</Text>
            </View>
          )}

          {application.cvUrl && (
            <TouchableOpacity style={styles.cvButton} onPress={() => handleOpenCV(application.cvUrl)}>
              <FileText size={18} color="#FFF" />
              <Text style={styles.cvButtonText}>Özgeçmişi İncele (PDF)</Text>
              <ExternalLink size={16} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* AI Report Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBg}><Zap size={20} color="#A855F7" /></View>
          <Text style={styles.cardTitle}>AI Uyum Raporu</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>%{application.matchScore}</Text>
          </View>
        </View>
        <Text style={styles.reportText}>{matchReport}</Text>
      </View>

      {/* Experience */}
      {candidate.profile?.experiences && candidate.profile.experiences.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBg, { backgroundColor: '#EFF6FF' }]}><Briefcase size={20} color="#3B82F6" /></View>
            <Text style={styles.cardTitle}>Deneyimler</Text>
          </View>
          {candidate.profile.experiences.map((exp: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineTitle}>{exp.title}</Text>
              <Text style={styles.timelineCompany}>{exp.company}</Text>
              <Text style={styles.timelineDate}>{exp.startDate} - {exp.endDate || 'Devam ediyor'}</Text>
              {exp.description && <Text style={styles.timelineDesc}>{exp.description}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {candidate.profile?.education && candidate.profile.education.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBg, { backgroundColor: '#FDF4FF' }]}><GraduationCap size={20} color="#D946EF" /></View>
            <Text style={styles.cardTitle}>Eğitim</Text>
          </View>
          {candidate.profile.education.map((edu: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineTitle}>{edu.school}</Text>
              <Text style={styles.timelineCompany}>{edu.degree} - {edu.field}</Text>
              <Text style={styles.timelineDate}>{edu.startDate} - {edu.endDate || 'Devam ediyor'}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {candidate.profile?.skills && candidate.profile.skills.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBg, { backgroundColor: '#F0FDF4' }]}><Code size={20} color="#10B981" /></View>
            <Text style={styles.cardTitle}>Yetenekler</Text>
          </View>
          <View style={styles.skillsContainer}>
            {candidate.profile.skills.map((skill: any, index: number) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

    </ScrollView>
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
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  
  mainCard: {
    backgroundColor: '#FFF', margin: 16, marginTop: -20, borderRadius: 24, padding: 20,
    shadowColor: '#312E81', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  mainCardTop: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#4F46E5' },
  candidateName: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  candidateTitle: { fontSize: 15, fontWeight: '600', color: '#64748B', marginTop: 4, marginBottom: 12 },
  contactInfo: { gap: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  
  actionsContainer: { gap: 12 },
  statusButtons: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 16 },
  actionBtnText: { fontSize: 15, fontWeight: '800' },
  statusFinal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 16, borderWidth: 1 },
  statusFinalText: { fontSize: 15, fontWeight: '800' },
  cvButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 16, backgroundColor: '#4F46E5' },
  cvButtonText: { fontSize: 15, fontWeight: '800', color: '#FFF' },

  card: { backgroundColor: '#FFF', marginHorizontal: 16, marginBottom: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FAF5FF', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', flex: 1 },
  scoreBadge: { backgroundColor: '#9333EA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  scoreText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  reportText: { fontSize: 15, color: '#475569', lineHeight: 24 },
  
  timelineItem: { paddingLeft: 20, borderLeftWidth: 2, borderLeftColor: '#F1F5F9', position: 'relative', marginBottom: 20 },
  timelineDot: { position: 'absolute', left: -7, top: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#CBD5E1', borderWidth: 3, borderColor: '#FFF' },
  timelineTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  timelineCompany: { fontSize: 14, fontWeight: '600', color: '#4F46E5', marginBottom: 4 },
  timelineDate: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 8 },
  timelineDesc: { fontSize: 14, color: '#475569', lineHeight: 22 },
  
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  skillText: { fontSize: 14, fontWeight: '600', color: '#475569' },
});
