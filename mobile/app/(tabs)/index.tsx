import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';

import { theme } from '@/lib/theme';
import api from '@/api/client';
import { useAuthStore } from '@/store/auth';

const { width } = Dimensions.get('window');

import { CompanyLogo } from '@/components/CompanyLogo';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ totalJobs: 0, totalCompanies: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, jobsRes, sectorsRes, companiesRes] = await Promise.all([
          api.get('/jobs/stats/total').catch(() => ({ data: 0 })),
          api.get('/jobs/discover', { params: { limit: 5 } }).catch(() => ({ data: { data: [] } })),
          api.get('/jobs/stats/top-sectors').catch(() => ({ data: [] })),
          api.get('/companies/top').catch(() => ({ data: [] }))
        ]);
        
        const totalJobsCount = typeof statsRes.data === 'number' ? statsRes.data : (statsRes.data?.count || statsRes.data?.total || 0);
        const companiesCount = 400; // API doesn't return count yet, hardcoded as requested
        setStats({ totalJobs: totalJobsCount, totalCompanies: companiesCount });
        setRecentJobs(jobsRes.data?.data || []);
        
        const sectorsList = Array.isArray(sectorsRes.data) ? sectorsRes.data : (sectorsRes.data?.data || sectorsRes.data?.value || []);
        setSectors(sectorsList);
        
        setCompanies(companiesRes.data || []);

        if (user) {
          const recRes = await api.get('/jobs/discover', { params: { userId: user.id, limit: 10 } }).catch(() => ({ data: { data: [] } }));
          let recJobs = recRes.data?.data || [];
          recJobs.sort((a: any, b: any) => {
            const scoreA = a.matchAnalysis?.algorithmicScore || a.matchAnalysis?.matchScore || a.matchScore || a.match_score || 0;
            const scoreB = b.matchAnalysis?.algorithmicScore || b.matchAnalysis?.matchScore || b.matchScore || b.match_score || 0;
            return scoreB - scoreA;
          });
          setRecommendedJobs(recJobs);
        }
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const renderJobCard = (job: any, isRecommended = false) => {
    return (
      <TouchableOpacity 
        key={job.id} 
        style={styles.jobCard} 
        activeOpacity={0.8}
        onPress={() => router.push(`/job/${job.id}` as any)}
      >
        <View style={styles.jobHeader}>
          <CompanyLogo company={job.company} size={44} />
          <View style={styles.jobHeaderText}>
            <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
            <Text style={styles.jobCompany} numberOfLines={1}>{job.company?.name}</Text>
          </View>
        </View>
        
        <View style={styles.jobTags}>
          {job.city && <View style={styles.tag}><Text style={styles.tagText}>{job.city}</Text></View>}
          {job.workModel && <View style={styles.tag}><Text style={styles.tagText}>{job.workModel}</Text></View>}
        </View>

        {isRecommended && (job.matchAnalysis?.algorithmicScore !== undefined || job.matchScore !== undefined || job.match_score !== undefined) && (
          <View style={styles.matchScore}>
            <Feather name="zap" size={14} color="#059669" />
            <Text style={styles.matchScoreText}>
              %{((job.matchAnalysis?.algorithmicScore || job.matchScore || job.match_score) > 1 ? (job.matchAnalysis?.algorithmicScore || job.matchScore || job.match_score) : (job.matchAnalysis?.algorithmicScore || job.matchScore || job.match_score) * 100).toFixed(0)} Uyumlu
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const EXPERIENCE_LEVELS = [
    { label: 'Yeni Mezun', icon: 'award', color: '#10b981' },
    { label: 'Junior', icon: 'star', color: '#3b82f6' },
    { label: 'Orta Düzey', icon: 'briefcase', color: '#8b5cf6' },
    { label: 'Uzman', icon: 'shield', color: '#f59e0b' },
    { label: 'Yönetici', icon: 'user', color: '#ef4444' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={{ width: 108, height: 108, resizeMode: 'contain' }} 
          />
          <Text style={styles.headerLogo}>KariyerRotası</Text>
        </View>
        {user ? (
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)}>
            <CompanyLogo company={{ name: user.name, logoUrl: user.avatarUrl }} size={36} rounded={18} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
            <Feather name="log-in" size={24} color={theme.slate900} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Feather name="zap" size={14} color="#2563eb" />
            <Text style={styles.heroBadgeText}>AI Destekli Kariyer Platformu</Text>
          </View>
          <Text style={styles.heroTitle}>Hayalindeki İşi Bul,{"\n"}Kariyerine Yön Ver.</Text>
          <Text style={styles.heroSubtitle}>Yapay zeka ile yeteneklerine en uygun iş fırsatlarını anında keşfet.</Text>

          <TouchableOpacity style={styles.searchBox} activeOpacity={0.9} onPress={() => router.push('/(tabs)/jobs' as any)}>
            <Feather name="search" size={20} color="#64748b" />
            <Text style={styles.searchBoxText}>Pozisyon, teknoloji veya şirket ara...</Text>
          </TouchableOpacity>

          <View style={styles.popularSearches}>
            <Text style={styles.popularTitle}>Popüler Aramalar:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 24 }}>
              {['Frontend', 'Backend', 'React Native', 'UI/UX'].map(term => (
                <TouchableOpacity 
                  key={term} 
                  style={styles.popularBadge}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/(tabs)/jobs', params: { q: term } } as any)}
                >
                  <Text style={styles.popularBadgeText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalJobs}+</Text>
            <Text style={styles.statLabel}>Aktif İlan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalCompanies}+</Text>
            <Text style={styles.statLabel}>Şirket</Text>
          </View>
        </View>

        {/* EVENT BANNER */}
        <TouchableOpacity style={styles.eventBanner} activeOpacity={0.9}>
          <View style={styles.eventLeft}>
            <Feather name="calendar" size={20} color="#fff" />
            <View>
              <Text style={styles.eventTitle}>Kariyer Zirvesi 2026</Text>
              <Text style={styles.eventSub}>Teknoloji devleriyle tanışma fırsatı!</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#fff" style={{ opacity: 0.8 }} />
        </TouchableOpacity>

        {/* CAREER GUIDE BANNER */}
        <TouchableOpacity 
          style={styles.guideBanner} 
          activeOpacity={0.9} 
          onPress={() => router.push('/career-guide' as any)}
        >
          <View style={styles.guideBannerContent}>
            <View style={styles.guideBadge}>
              <Feather name="book-open" size={14} color="#fff" />
              <Text style={styles.guideBadgeText}>KariyerRotası Akademi</Text>
            </View>
            <Text style={styles.guideTitle}>Kariyer Rehberini Keşfet</Text>
            <Text style={styles.guideSubtitle}>Mülakat taktikleri, CV hazırlama rehberi ve daha fazlası.</Text>
          </View>
          <Feather name="chevron-right" size={24} color="#fff" style={{ opacity: 0.8 }} />
        </TouchableOpacity>

        {/* RECOMMENDED JOBS (AI) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sizin İçin Seçilen İlanlar</Text>
            {user && <Feather name="star" size={20} color="#f59e0b" />}
          </View>
          
          {!user ? (
            <View style={styles.authBanner}>
              <View style={styles.authBannerIcon}>
                <Feather name="lock" size={24} color="#2563eb" />
              </View>
              <Text style={styles.authBannerTitle}>Kişiselleştirilmiş Öneriler</Text>
              <Text style={styles.authBannerText}>Yapay zeka motorumuzun size özel iş ilanları sunması için giriş yapın veya kayıt olun.</Text>
              <TouchableOpacity style={styles.authButton} onPress={() => router.push('/(auth)/login' as any)}>
                <Text style={styles.authButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          ) : recommendedJobs.length > 0 ? (
            <View style={{ gap: 12 }}>
              {recommendedJobs.slice(0, 10).map(job => renderJobCard(job, true))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Henüz size özel ilan bulunamadı.</Text>
          )}
        </View>

        {/* FEATURED COMPANIES */}
        {companies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Aktif İşe Alım Yapan Lider Şirketler</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/companies' as any)}>
                <Text style={styles.linkText}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {companies.map(company => (
                <TouchableOpacity 
                  key={company.id} 
                  style={styles.companyCard}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/company/${company.id}` as any)}
                >
                  <CompanyLogo company={company} size={56} />
                  <Text style={styles.companyName} numberOfLines={1}>{company.name}</Text>
                  <Text style={styles.companyJobs}>{company._count?.jobs || 0} İlan</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* EXPERIENCE LEVELS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deneyim Seviyesine Göre İş Ara</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.horizontalList, { marginTop: 16 }]}>
            {EXPERIENCE_LEVELS.map(exp => (
              <TouchableOpacity 
                key={exp.label} 
                style={styles.expCard}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/(tabs)/jobs', params: { experienceLabel: exp.label } } as any)}
              >
                <View style={[styles.expIconWrap, { backgroundColor: exp.color + '15' }]}>
                  <Feather name={exp.icon as any} size={24} color={exp.color} />
                </View>
                <Text style={styles.expText}>{exp.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* TOP SECTORS */}
        {sectors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Öne Çıkan Sektörler</Text>
            <View style={styles.sectorsGrid}>
              {sectors.map((s, idx) => (
                <TouchableOpacity 
                  key={s.sector || idx} 
                  style={styles.sectorCard}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/(tabs)/jobs', params: { sector: s.sector } } as any)}
                >
                  <Text style={styles.sectorName} numberOfLines={1}>{s.sector}</Text>
                  <Text style={styles.sectorCount}>{s.count || 0} İlan</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* RECENT JOBS */}
        <View style={[styles.section, { marginBottom: 20 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>En Yeni İlanlar</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/jobs' as any)}>
              <Text style={styles.linkText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 12 }}>
            {recentJobs.slice(0, 5).map(job => renderJobCard(job, false))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerLogo: { fontSize: 22, fontWeight: '800', color: theme.primary, letterSpacing: -0.5 },
  scrollContent: { paddingBottom: 40 },
  
  hero: { backgroundColor: '#fff', padding: 24, paddingTop: 32, paddingBottom: 24 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, marginBottom: 16 },
  heroBadgeText: { color: '#2563eb', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#0f172a', lineHeight: 40, marginBottom: 12 },
  heroSubtitle: { fontSize: 15, color: '#64748b', lineHeight: 22, marginBottom: 24 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, height: 56, gap: 12 },
  searchBoxText: { fontSize: 15, color: '#94a3b8', flex: 1 },
  
  popularSearches: { marginTop: 20 },
  popularTitle: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 10 },
  popularBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  popularBadgeText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#e2e8f0' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 4 },

  eventBanner: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#0f172a', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  eventSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },

  guideBanner: { marginHorizontal: 20, marginTop: 16, backgroundColor: '#8B5CF6', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  guideBannerContent: { flex: 1, paddingRight: 16 },
  guideBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  guideBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  guideTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  guideSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  
  section: { paddingHorizontal: 24, paddingTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  linkText: { color: '#2563eb', fontSize: 14, fontWeight: '600' },
  
  authBanner: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, padding: 24, alignItems: 'center' },
  authBannerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  authBannerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  authBannerText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  authButton: { backgroundColor: '#0f172a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  authButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  
  horizontalList: { gap: 12, paddingRight: 24 },
  
  jobCard: { width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16 },
  jobHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  jobHeaderText: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  jobCompany: { fontSize: 13, color: '#64748b' },
  jobTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  matchScore: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ecfdf5', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  matchScoreText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  
  companyCard: { width: 140, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, alignItems: 'center' },
  companyName: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginTop: 12, textAlign: 'center' },
  companyJobs: { fontSize: 12, color: '#64748b', marginTop: 4 },
  
  expCard: { width: 110, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, alignItems: 'center' },
  expIconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  expText: { fontSize: 13, fontWeight: '600', color: '#0f172a', textAlign: 'center' },
  
  sectorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  sectorCard: { width: (width - 60) / 2, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16 },
  sectorName: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  sectorCount: { fontSize: 12, color: '#64748b' },

  emptyText: { color: '#64748b', fontSize: 14 },
});
