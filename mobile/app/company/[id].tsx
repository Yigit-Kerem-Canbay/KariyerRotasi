import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Dimensions,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';

import api from '@/api/client';
import { theme } from '@/lib/theme';
import { CompanyLogo } from '@/components/CompanyLogo';
import { getWebOrigin } from '@/lib/config';
import { generateCompanyInsightData, parseEmployeeCount } from '@/lib/companyCharts';

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
  logoUrl?: string | null;
  _count?: { jobs?: number };
};

type CompanyBrief = {
  id: string;
  name: string;
  sector?: string | null;
  website?: string | null;
  logoUrl?: string | null;
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
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [jobsMeta, setJobsMeta] = useState<{ total?: number; totalPages?: number; page?: number } | null>(null);
  const [jobPage, setJobPage] = useState(1);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [peerCompanies, setPeerCompanies] = useState<CompanyBrief[]>([]);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const screenWidth = Dimensions.get('window').width - 32; // padding 16*2

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

  const loadJobs = useCallback(async () => {
    if (!id) return;
    setJobsLoading(true);
    try {
      const res = await api.get<{ data: CompanyJob[]; meta: any }>('/jobs', {
        params: { companyId: id, page: jobPage, limit: 15, sort: 'newest' },
      });
      setJobs(res.data.data ?? []);
      setJobsMeta(res.data.meta ?? null);
    } catch {
      setJobs([]);
      setJobsMeta(null);
    } finally {
      setJobsLoading(false);
    }
  }, [id, jobPage]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await api.get<CompanyBrief[]>('/companies');
        if (!cancel) setPeerCompanies(r.data ?? []);
      } catch {
        if (!cancel) setPeerCompanies([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Geri',
      headerTintColor: theme.primary,
      headerStyle: { backgroundColor: theme.card },
    });
  }, [navigation]);

  const totalJobs = co?._count?.jobs ?? jobsMeta?.total ?? 0;
  const canPrev = jobPage > 1;
  const canNext = jobsMeta?.totalPages ? jobPage < jobsMeta.totalPages : jobs.length === 15;

  const similarCompanies = useMemo(() => {
    if (!co?.sector) return [];
    return peerCompanies.filter((c) => c.id !== co.id && c.sector === co.sector).slice(0, 8);
  }, [peerCompanies, co?.id, co?.sector]);

  const insight = useMemo(
    () => generateCompanyInsightData(co?.name || '', parseEmployeeCount(co?.employeeCount)),
    [co?.name, co?.employeeCount],
  );

  const maxHiring = useMemo(
    () => Math.max(...insight.yearlyHiring.map((y) => y.iseAlinan), 1),
    [insight.yearlyHiring],
  );

  const websiteHost = useMemo(() => {
    const w = (co?.website ?? '').trim();
    if (!w) return '';
    try {
      const u = new URL(w.startsWith('http') ? w : `https://${w}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return w.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  }, [co?.website]);

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

  const shareCompany = () => {
    if (!co) return;
    const base = getWebOrigin().replace(/\/$/, '');
    const url = `${base}/company/${co.id}`;
    void Share.share({
      message: `${co.name} — ${url}`,
      url,
      title: co.name,
    }).catch(() => {});
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.heroCard}>
        <CompanyLogo company={co} size={88} rounded={22} />
        <Text style={styles.title}>{co.name}</Text>
        <Text style={styles.meta}>
          {[co.sector || 'Genel', co.location].filter(Boolean).join(' · ')}
        </Text>
        {co.employeeCount ? <Text style={styles.emp}>{co.employeeCount} çalışan</Text> : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, isFollowing && { backgroundColor: theme.primary, borderColor: theme.primary }]} 
            activeOpacity={0.85}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <FontAwesome name={isFollowing ? "check" : "heart-o"} size={18} color={isFollowing ? "#fff" : theme.slate900} />
            <Text style={[styles.actionTxt, isFollowing && { color: '#fff' }]}>
              {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={shareCompany}>
            <FontAwesome name="share-alt" size={18} color={theme.slate900} />
            <Text style={styles.actionTxt}>Paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={() => setDropdownOpen(true)}>
            <FontAwesome name="ellipsis-h" size={18} color={theme.slate900} />
            <Text style={styles.actionTxt}>Diğer</Text>
          </TouchableOpacity>
        </View>

        {co.website ? (
          <TouchableOpacity
            style={styles.websitePill}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(co.website!.startsWith('http') ? co.website! : `https://${co.website}`)}
          >
            <FontAwesome name="globe" size={14} color={theme.primary} />
            <Text style={styles.websiteTxt} numberOfLines={1}>
              {websiteHost || co.website}
            </Text>
            <FontAwesome name="external-link" size={12} color={theme.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTit}>Hakkında</Text>
        <Text style={styles.desc}>
          {co.description ? co.description.trim() : `${co.name}, ${co.sector || 'Genel'} sektöründe faaliyet gösteren lider kuruluşlardan biridir. Çalışanlarına değer veren, yenilikçi ve dinamik yapısıyla her geçen gün büyümeye devam etmektedir.`}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTit}>Sektör Özeti & Grafikler</Text>
        <Text style={styles.disclaimer}>
          Web platformumuz ile uyumlu grafiksel verilerdir.
        </Text>
        
        <Text style={[styles.miniHeading, { marginTop: 16 }]}>Departman Dağılımı</Text>
        <PieChart
          data={insight.departments.map(d => ({
            name: d.name,
            population: d.value,
            color: d.color,
            legendFontColor: '#475569',
            legendFontSize: 12
          }))}
          width={screenWidth}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />

        <Text style={[styles.miniHeading, { marginTop: 24 }]}>Yıllara Göre İşe Alım (Model)</Text>
        <LineChart
          data={{
            labels: insight.yearlyHiring.map(y => y.year),
            datasets: [{ data: insight.yearlyHiring.map(y => y.iseAlinan) }]
          }}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#2563eb' }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />

        <Text style={[styles.miniHeading, { marginTop: 24 }]}>Mezun Olunan Bölümler</Text>
        <BarChart
          data={{
            labels: insight.majors.map(m => m.name),
            datasets: [{ data: insight.majors.map(m => m.value) }]
          }}
          width={screenWidth}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />

        <Text style={[styles.miniHeading, { marginTop: 24 }]}>Eğitim Seviyesi Dağılımı</Text>
        <PieChart
          data={insight.edLevels.map(e => ({
            name: e.name,
            population: e.value,
            color: e.color,
            legendFontColor: '#475569',
            legendFontSize: 12
          }))}
          width={screenWidth}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>

      {similarCompanies.length ? (
        <View style={styles.card}>
          <Text style={styles.sectionTit}>Benzer sektördeki kuruluşlar</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.peerScroll}
          >
            {similarCompanies.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.peerCard}
                activeOpacity={0.88}
                onPress={() => router.push(`/company/${s.id}`)}
              >
                <CompanyLogo company={s} size={48} rounded={14} />
                <Text style={styles.peerTit} numberOfLines={2}>
                  {s.name}
                </Text>
                <Text style={styles.peerSub} numberOfLines={1}>
                  {s.sector || 'Genel'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionTit}>Açık pozisyonlar ({totalJobs})</Text>
          <TouchableOpacity
            style={styles.allJobsBtn}
            activeOpacity={0.88}
            onPress={() =>
              router.push({
                pathname: '/company-jobs/[id]',
                params: { id: co.id },
              })
            }
          >
            <Text style={styles.allJobsBtnTxt}>Tümünü gör</Text>
          </TouchableOpacity>
        </View>

        {jobsLoading ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : jobs.length === 0 ? (
          <Text style={styles.emptyJobs}>Bu şirket için listelenen ilan yok.</Text>
        ) : (
          jobs.map((j) => (
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

        {jobsMeta?.totalPages && jobsMeta.totalPages > 1 ? (
          <View style={styles.pager}>
            <TouchableOpacity
              style={[styles.pageBtn, !canPrev && styles.pageBtnDisabled]}
              disabled={!canPrev}
              onPress={() => setJobPage((p) => Math.max(1, p - 1))}
            >
              <Text style={styles.pageBtnTxt}>Önceki</Text>
            </TouchableOpacity>
            <Text style={styles.pageLabel}>
              {jobPage} / {jobsMeta.totalPages}
            </Text>
            <TouchableOpacity
              style={[styles.pageBtn, !canNext && styles.pageBtnDisabled]}
              disabled={!canNext}
              onPress={() => setJobPage((p) => p + 1)}
            >
              <Text style={styles.pageBtnTxt}>Sonraki</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <Modal visible={dropdownOpen} transparent animationType="fade" onRequestClose={() => setDropdownOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDropdownOpen(false)}>
          <Pressable style={styles.dropdownSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.dropdownTitle}>İşlemler</Text>
            
            <TouchableOpacity
              style={styles.dropdownRow}
              onPress={() => {
                setDropdownOpen(false);
                Alert.alert('Bilgi', 'Mesajlaşma özelliği yakında eklenecektir.');
              }}
            >
              <FontAwesome name="envelope-o" size={16} color={theme.slate800} />
              <Text style={styles.dropdownRowText}>Mesaj Gönder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownRow}
              onPress={() => {
                setDropdownOpen(false);
                Alert.alert('Şirketi Bildir', 'Şirket bildiriminiz alınmıştır. Gerekli incelemeler yapılacaktır.');
              }}
            >
              <FontAwesome name="warning" size={16} color={theme.destructive} />
              <Text style={[styles.dropdownRowText, { color: theme.destructive }]}>Şirketi Bildir</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.background,
    borderRadius: 14,
    paddingVertical: 10,
  },
  actionTxt: { fontSize: 13, fontWeight: '700', color: theme.slate900 },
  websitePill: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  websiteTxt: { color: theme.primary, fontWeight: '700', fontSize: 13, maxWidth: 220 },

  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 18,
    marginBottom: 14,
  },
  sectionTit: { fontSize: 18, fontWeight: '800', color: theme.slate900, marginBottom: 14 },
  disclaimer: { fontSize: 12, color: theme.muted, lineHeight: 18, marginBottom: 14 },
  miniHeading: { fontSize: 13, fontWeight: '800', color: theme.slate800, marginBottom: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barYear: { width: 52, fontSize: 11, fontWeight: '700', color: theme.muted },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.border,
    overflow: 'hidden',
  },
  barFill: { height: 8, backgroundColor: theme.primary, borderRadius: 999 },
  barVal: { width: 36, fontSize: 11, fontWeight: '700', color: theme.slate900, textAlign: 'right' },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  dot: { width: 8, height: 8, borderRadius: 999 },
  statName: { fontSize: 14, fontWeight: '600', color: theme.slate900, flex: 1 },
  statNum: { fontSize: 14, fontWeight: '700', color: theme.muted },
  peerScroll: { paddingVertical: 4, gap: 0 },
  peerCard: {
    width: 140,
    marginRight: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.background,
  },
  peerTit: { marginTop: 12, fontSize: 14, fontWeight: '800', color: theme.slate900 },
  peerSub: { marginTop: 6, fontSize: 11, fontWeight: '700', color: theme.muted, textTransform: 'uppercase' },
  sectionHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  allJobsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  allJobsBtnTxt: { color: theme.primary, fontWeight: '800', fontSize: 12 },
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
  pager: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  pageBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: theme.primary,
  },
  pageBtnDisabled: { opacity: 0.35 },
  pageBtnTxt: { color: '#fff', fontWeight: '800' },
  pageLabel: { fontSize: 13, color: theme.slate900, fontWeight: '800', minWidth: 70, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  dropdownSheet: {
    backgroundColor: theme.card,
    borderRadius: 20,
    paddingVertical: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.slate900,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  dropdownRowText: { fontSize: 16, color: theme.slate800, fontWeight: '600' },
});
