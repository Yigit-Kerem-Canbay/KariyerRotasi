import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '@/api/client';
import { theme } from '@/lib/theme';
import { CompanyLogo } from '@/components/CompanyLogo';
import { resolveLogoFileKey } from '@/lib/companyLogo';

type Company = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  location?: string | null;
  sector?: string | null;
  employeeCount?: string | null;
  _count?: { jobs?: number };
};

function jobCount(c: Company) {
  return c._count?.jobs ?? 0;
}

export default function CompaniesTabScreen() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorPick, setSectorPick] = useState('Tümü');
  const [locationPick, setLocationPick] = useState('Tümü');
  const [sectorOpen, setSectorOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<Company[]>('/companies');
      setCompanies(res.data);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sectors = useMemo(() => {
    const s = new Set(companies.map((c) => c.sector || 'Genel').filter(Boolean));
    return ['Tümü', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'tr'))];
  }, [companies]);

  const locations = useMemo(() => {
    const l = new Set(
      companies.flatMap((c) => {
        const loc = (c.location ?? '').trim();
        return loc ? [loc] : [];
      }),
    );
    return ['Tümü', ...Array.from(l).sort((a, b) => a.localeCompare(b, 'tr'))];
  }, [companies]);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const q = searchTerm.toLocaleLowerCase('tr-TR');
      const okSearch =
        !q ||
        c.name.toLocaleLowerCase('tr-TR').includes(q) ||
        !!(c.description && c.description.toLocaleLowerCase('tr-TR').includes(q));
      const okSector =
        sectorPick === 'Tümü' || (c.sector || 'Genel') === sectorPick;
      const okLoc =
        locationPick === 'Tümü' ? true : (c.location || '') === locationPick;
      return okSearch && okSector && okLoc;
    });
  }, [companies, searchTerm, sectorPick, locationPick]);

  // Mobil performansı için client-side sayfalama (310 şirkette yeterli)
  const [page, setPage] = useState(1);
  const perPage = 30;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, sectorPick, locationPick]);

  const sortedDisplay = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const ka = resolveLogoFileKey({ name: a.name, website: a.website });
      const kb = resolveLogoFileKey({ name: b.name, website: b.website });
      const ha = ka ? 1 : 0;
      const hb = kb ? 1 : 0;
      if (ha !== hb) return hb - ha;
      return (a.name || '').localeCompare(b.name || '', 'tr');
    });
    return list;
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(sortedDisplay.length / perPage));
  const pageCompanies = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedDisplay.slice(start, start + perPage);
  }, [page, sortedDisplay]);

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => router.push(`/company/${item.id}`)}
    >
      <View style={styles.row}>
        <CompanyLogo company={item} size={54} rounded={14} />
        <View style={styles.rowText}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[item.sector || 'Genel', item.location].filter(Boolean).join(' · ')}
          </Text>
          <View style={styles.jobsBadge}>
            <FontAwesome name="briefcase" size={12} color={theme.primary} />
            <Text style={styles.jobsBadgeText}>{jobCount(item)} aktif ilan</Text>
          </View>
        </View>
        <FontAwesome name="chevron-right" size={14} color={theme.muted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Platform</Text>
        <Text style={styles.heroTitle}>Şirketler</Text>
        <Text style={styles.heroSubtitle}>{companies.length} şirket keşfediliyor</Text>

        <View style={styles.searchRow}>
          <FontAwesome name="search" size={16} color={theme.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Şirket veya sektör ara…"
            placeholderTextColor={theme.muted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.pickRow}>
          <TouchableOpacity style={styles.pickerChip} activeOpacity={0.85} onPress={() => setSectorOpen(true)}>
            <FontAwesome name="industry" size={14} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.pickerChipText} numberOfLines={1}>
              Sektör: {sectorPick}
            </Text>
            <FontAwesome name="caret-down" size={14} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerChipSecondary} activeOpacity={0.85} onPress={() => setLocOpen(true)}>
            <FontAwesome name="map-marker" size={14} color={theme.heroIndigo} style={{ marginRight: 8 }} />
            <Text style={styles.pickerChipSecondaryText} numberOfLines={1}>
              {locationPick}
            </Text>
            <FontAwesome name="caret-down" size={14} color={theme.heroIndigo} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={pageCompanies}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Sonuç bulunamadı.</Text>}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pager}>
                <TouchableOpacity
                  style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                  disabled={page <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Text style={styles.pageBtnText}>Önceki</Text>
                </TouchableOpacity>
                <Text style={styles.pageLabel}>
                  {page} / {totalPages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                  disabled={page >= totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <Text style={styles.pageBtnText}>Sonraki</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ height: 20 }} />
            )
          }
        />
      )}

      <PickModal visible={sectorOpen} title="Sektör" items={sectors} selected={sectorPick} onPick={setSectorPick} onClose={() => setSectorOpen(false)} />
      <PickModal visible={locOpen} title="Şehir" items={locations} selected={locationPick} onPick={setLocationPick} onClose={() => setLocOpen(false)} />
    </SafeAreaView>
  );
}

function PickModal({
  visible,
  title,
  items,
  selected,
  onPick,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: string[];
  selected: string;
  onPick: (x: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.headerTitle}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={modalStyles.done}>Tamam</Text>
          </Pressable>
        </View>
        <FlatList
          data={items}
          keyExtractor={(x) => x}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={modalStyles.opt}
              onPress={() => {
                onPick(item);
                onClose();
              }}
            >
              <Text style={[modalStyles.optText, selected === item && modalStyles.optTextActive]}>{item}</Text>
              {selected === item ? <FontAwesome name="check" size={18} color={theme.primary} /> : null}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: theme.heroIndigo,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  heroEyebrow: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', marginTop: 4 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 8, marginBottom: 14 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    minHeight: 48,
    borderRadius: 14,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 10, color: theme.slate900 },
  pickRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pickerChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    maxWidth: '52%',
  },
  pickerChipText: { color: '#fff', fontWeight: '700', flex: 1, fontSize: 13 },
  pickerChipSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    maxWidth: '48%',
  },
  pickerChipSecondaryText: { color: theme.slate900, fontWeight: '600', flex: 1, fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    backgroundColor: theme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowText: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: '700', color: theme.slate900 },
  meta: { fontSize: 13, color: theme.muted, marginTop: 4 },
  jobsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  jobsBadgeText: { fontSize: 12, fontWeight: '600', color: theme.primary },
  empty: { textAlign: 'center', marginTop: 48, fontSize: 15, color: theme.muted },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 14,
    paddingBottom: 26,
  },
  pageBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  pageBtnDisabled: { opacity: 0.35 },
  pageBtnText: { color: '#fff', fontWeight: '800' },
  pageLabel: { minWidth: 72, textAlign: 'center', color: theme.slate900, fontWeight: '800' },
});

const modalStyles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.card,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.slate900 },
  done: { fontSize: 16, fontWeight: '600', color: theme.primary },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  optText: { fontSize: 16, color: theme.slate800 },
  optTextActive: { fontWeight: '700', color: theme.primary },
});
