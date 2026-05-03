import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import api from '@/api/client';
import { theme } from '@/lib/theme';
import {
  SORT_OPTIONS,
  type SortValue,
  type JobFilterState,
  emptyJobFilters,
} from '@/constants/jobFilters';
import { JobFiltersModal } from '@/components/jobs/JobFiltersModal';
import { CompanyLogo } from '@/components/CompanyLogo';

type JobItem = {
  id: string;
  title: string;
  location?: string | null;
  city?: string | null;
  workModel?: string | null;
  remote?: boolean;
  createdAt?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  experienceYears?: string | null;
  company: { name: string; logoUrl?: string | null; website?: string | null; sector?: string | null };
  jobSkills?: { skill: { name: string } }[];
};

type JobsResponse = {
  data: JobItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    salaryRankingOnlyListed?: boolean;
  };
};

function fmtSalary(min?: number | null, max?: number | null) {
  if (min == null && max == null) return 'Maaş gizli';
  const a = min != null ? `${min.toLocaleString('tr-TR')} ₺` : '';
  const b = max != null ? `${max.toLocaleString('tr-TR')} ₺` : '';
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

function toParams(page: number, search: string, sort: SortValue, f: JobFilterState): Record<string, string | number> {
  const p: Record<string, string | number> = { page, limit: 20, sort };
  const q = search.trim();
  if (q) p.search = q;
  if (f.cities.length) p.cities = f.cities.join(',');
  if (f.sectors.length) p.sectors = f.sectors.join(',');
  if (f.educationLevels.length) p.educationLevels = f.educationLevels.join(',');
  if (f.languages.length) p.languages = f.languages.join(',');
  if (f.workModels.length) p.workModels = f.workModels.join(',');
  if (f.experiences.length) p.experiences = f.experiences.join(',');
  if (f.militaryStatuses.length) p.militaryStatuses = f.militaryStatuses.join(',');
  if (f.remoteOnly) p.remoteOnly = 'true';
  const smin = f.salaryMinGte.trim();
  const smax = f.salaryMaxLte.trim();
  if (smin) p.salaryMinGte = smin;
  if (smax) p.salaryMaxLte = smax;
  return p;
}

function activeFilterCount(f: JobFilterState): number {
  let n = 0;
  if (f.cities.length) n++;
  if (f.sectors.length) n++;
  if (f.educationLevels.length) n++;
  if (f.languages.length) n++;
  if (f.workModels.length) n++;
  if (f.experiences.length) n++;
  if (f.militaryStatuses.length) n++;
  if (f.remoteOnly) n++;
  if (f.salaryMinGte.trim()) n++;
  if (f.salaryMaxLte.trim()) n++;
  return n;
}

export default function JobsTabScreen() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<SortValue>('newest');
  const [filters, setFilters] = useState<JobFilterState>(() => emptyJobFilters());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [data, setData] = useState<JobItem[]>([]);
  const [meta, setMeta] = useState<JobsResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  const fetchPage = useCallback(
    async (p: number, mode: 'replace' | 'append' = 'replace') => {
      setError(null);
      try {
        const params = toParams(p, debouncedSearch, sort, filters);
        const res = await api.get<JobsResponse>('/jobs', { params });
        setMeta(res.data.meta);
        if (mode === 'append') {
          setData((prev) => [...prev, ...res.data.data]);
        } else {
          setData(res.data.data);
        }
      } catch (e: unknown) {
        setError('İlanlar yüklenemedi. Bağlantıyı kontrol et.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, sort, filters],
  );

  useEffect(() => {
    setLoading(true);
    fetchPage(page, 'replace');
  }, [page, fetchPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPage(page, 'replace');
  }, [fetchPage, page]);

  const sortLabel = useMemo(() => SORT_OPTIONS.find((s) => s.value === sort)?.label ?? '', [sort]);
  const nFilters = activeFilterCount(filters);

  const renderJob = ({ item }: { item: JobItem }) => {
    const skills = item.jobSkills?.slice(0, 4).map((x) => x.skill.name).join(' · ');
    const loc = item.city || item.location || '';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/job/${item.id}`)}
      >
        <View style={styles.cardTop}>
          <CompanyLogo company={item.company} size={52} rounded={14} />
          <View style={styles.cardTopText}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardCompany} numberOfLines={1}>
              {item.company.name}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {[loc, item.workModel, item.remote ? 'Remote' : ''].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color={theme.muted} />
        </View>
        <Text style={styles.cardSalary}>{fmtSalary(item.salaryMin, item.salaryMax)}</Text>
        {!!skills && (
          <Text style={styles.cardSkills} numberOfLines={2}>
            {skills}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Kariyer Rotası</Text>
        <Text style={styles.heroTitle}>İş ilanları</Text>
        <Text style={styles.heroSubtitle}>Binlerce fırsat; filtreleyerek yak.</Text>

        <View style={styles.searchRow}>
          <FontAwesome name="search" size={16} color={theme.muted} style={styles.searchIcon} />
          <TextInput
            placeholder="Şirket, pozisyon veya anahtar kelime ara…"
            placeholderTextColor={theme.muted}
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
          />
          {!!searchInput && (
            <TouchableOpacity onPress={() => setSearchInput('')} hitSlop={10}>
              <FontAwesome name="times-circle" size={18} color={theme.muted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85} onPress={() => setFiltersOpen(true)}>
            <FontAwesome name="filter" size={16} color={theme.primary} />
            <Text style={styles.filterBtnText}> Filtreler</Text>
            {nFilters > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{nFilters}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity style={styles.sortBtn} activeOpacity={0.85} onPress={() => setSortOpen(true)}>
            <FontAwesome name="sort" size={16} color={theme.slate900} />
            <Text style={styles.sortBtnText} numberOfLines={1}>
              {' '}
              {sortLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {meta?.salaryRankingOnlyListed ? (
          <View style={styles.hintBanner}>
            <Text style={styles.hintText}>
              Maaşa göre sıralamada yalnızca maaş bilgisi paylaşılan ilanlar listeleniyor.
            </Text>
          </View>
        ) : null}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error ? (
        <View style={styles.loaderWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); fetchPage(page, 'replace'); }}>
            <Text style={styles.retryBtnText}>Yeniden dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={data}
            keyExtractor={(j) => j.id}
            renderItem={renderJob}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <Text style={styles.empty}>Bu kriterlere uygun ilan bulunamadı.</Text>
            }
            ListFooterComponent={
              meta ? (
                <Text style={styles.footerCount}>
                  {meta.total.toLocaleString('tr-TR')} ilandan {data.length.toLocaleString('tr-TR')}{' '}
                  tanesini görüntülüyorsun (sayfa {meta.page}/{meta.totalPages})
                </Text>
              ) : null
            }
          />
          {meta && meta.totalPages > 1 ? (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                disabled={page <= 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Text style={styles.pageBtnText}>Önceki</Text>
              </TouchableOpacity>
              <Text style={styles.pageLabel}>
                {page} / {meta.totalPages}
              </Text>
              <TouchableOpacity
                style={[styles.pageBtn, page >= meta.totalPages && styles.pageBtnDisabled]}
                disabled={page >= meta.totalPages}
                onPress={() => setPage((p) => p + 1)}
              >
                <Text style={styles.pageBtnText}>Sonraki</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}

      <JobFiltersModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSortOpen(false)}>
          <Pressable style={styles.sortSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sortSheetTitle}>Sıralama</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.sortRow}
                onPress={() => {
                  setSort(opt.value);
                  setSortOpen(false);
                }}
              >
                <Text style={[styles.sortRowText, sort === opt.value && styles.sortRowTextActive]}>{opt.label}</Text>
                {sort === opt.value ? <FontAwesome name="check" size={16} color={theme.primary} /> : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: theme.heroIndigo,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroEyebrow: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', marginTop: 4 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 6, marginBottom: 14 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 48,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon: { marginRight: 2 },
  searchInput: { flex: 1, fontSize: 16, color: theme.slate900, paddingVertical: 8 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    flex: 1,
  },
  filterBtnText: { color: theme.primary, fontWeight: '700', fontSize: 14 },
  badge: {
    marginLeft: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    maxWidth: 160,
    flexShrink: 1,
  },
  sortBtnText: { color: theme.slate900, fontWeight: '600', fontSize: 14, flexShrink: 1 },
  hintBanner: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 10,
  },
  hintText: { color: 'rgba(255,255,255,0.95)', fontSize: 12, lineHeight: 17 },
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },
  card: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTopText: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.slate900 },
  cardCompany: { fontSize: 14, color: theme.muted, marginTop: 2 },
  cardMeta: { fontSize: 12, color: theme.muted, marginTop: 4 },
  cardSalary: { fontSize: 15, fontWeight: '700', color: theme.primary, marginTop: 10 },
  cardSkills: { fontSize: 12, color: theme.muted, marginTop: 6 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: theme.destructive, textAlign: 'center', fontSize: 15 },
  retryBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 14, backgroundColor: theme.primary },
  retryBtnText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: theme.muted, marginTop: 32, fontSize: 15 },
  footerCount: { textAlign: 'center', color: theme.muted, fontSize: 12, paddingVertical: 16 },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.card,
  },
  pageBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.primary,
  },
  pageBtnDisabled: { opacity: 0.35 },
  pageBtnText: { color: '#fff', fontWeight: '700' },
  pageLabel: { fontSize: 14, fontWeight: '600', color: theme.slate900 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  sortSheet: {
    backgroundColor: theme.card,
    borderRadius: 20,
    paddingVertical: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sortSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.slate900,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sortRowText: { fontSize: 16, color: theme.slate800 },
  sortRowTextActive: { fontWeight: '700', color: theme.primary },
});
