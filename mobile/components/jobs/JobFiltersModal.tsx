import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { theme } from '@/lib/theme';
import { TURKISH_PROVINCES_ALPHABETICAL } from '@/constants/turkishProvinces';
import {
  SECTOR_OPTIONS,
  EDUCATION_OPTIONS,
  LANGUAGE_OPTIONS,
  MILITARY_OPTIONS,
  EXPERIENCE_OPTIONS,
  WORK_MODEL_CONFIG,
  type JobFilterState,
  emptyJobFilters,
} from '@/constants/jobFilters';

function toggleInList(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function JobFiltersModal({
  visible,
  onClose,
  value,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  value: JobFilterState;
  onApply: (next: JobFilterState) => void;
}) {
  const [draft, setDraft] = useState<JobFilterState>(value);

  useEffect(() => {
    if (visible) {
      setDraft({
        ...value,
        cities: [...value.cities],
        sectors: [...value.sectors],
        educationLevels: [...value.educationLevels],
        languages: [...value.languages],
        workModels: [...value.workModels],
        experiences: [...value.experiences],
        militaryStatuses: [...value.militaryStatuses],
      });
    }
  }, [visible, value]);

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const reset = () => {
    setDraft(emptyJobFilters());
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filtreler</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.closeLink}>Kapat</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Section title="Şehirler">
            <View style={styles.chipWrap}>
              {TURKISH_PROVINCES_ALPHABETICAL.map((city) => (
                <Chip
                  key={city}
                  label={city}
                  selected={draft.cities.includes(city)}
                  onPress={() => setDraft((d) => ({ ...d, cities: toggleInList(d.cities, city) }))}
                />
              ))}
            </View>
          </Section>

          <Section title="Sektör">
            <View style={styles.chipWrap}>
              {SECTOR_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={draft.sectors.includes(s)}
                  onPress={() => setDraft((d) => ({ ...d, sectors: toggleInList(d.sectors, s) }))}
                />
              ))}
            </View>
          </Section>

          <Section title="Eğitim">
            <View style={styles.chipWrap}>
              {EDUCATION_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={draft.educationLevels.includes(s)}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      educationLevels: toggleInList(d.educationLevels, s),
                    }))
                  }
                />
              ))}
            </View>
          </Section>

          <Section title="Dil">
            <View style={styles.chipWrap}>
              {LANGUAGE_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={draft.languages.includes(s)}
                  onPress={() => setDraft((d) => ({ ...d, languages: toggleInList(d.languages, s) }))}
                />
              ))}
            </View>
          </Section>

          <Section title="Çalışma modeli">
            <View style={styles.chipWrap}>
              {WORK_MODEL_CONFIG.map((w) => (
                <Chip
                  key={w.value}
                  label={w.label}
                  selected={draft.workModels.includes(w.value)}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      workModels: toggleInList(d.workModels, w.value),
                    }))
                  }
                />
              ))}
            </View>
          </Section>

          <Section title="Deneyim">
            <View style={styles.chipWrap}>
              {EXPERIENCE_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={draft.experiences.includes(s)}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      experiences: toggleInList(d.experiences, s),
                    }))
                  }
                />
              ))}
            </View>
          </Section>

          <Section title="Askerlik">
            <View style={styles.chipWrap}>
              {MILITARY_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={draft.militaryStatuses.includes(s)}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      militaryStatuses: toggleInList(d.militaryStatuses, s),
                    }))
                  }
                />
              ))}
            </View>
          </Section>

          <TouchableOpacity
            style={styles.remoteRow}
            onPress={() => setDraft((d) => ({ ...d, remoteOnly: !d.remoteOnly }))}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, draft.remoteOnly && styles.checkboxOn]} />
            <Text style={styles.remoteLabel}>Yalnızca uzaktan / remote</Text>
          </TouchableOpacity>

          <Section title="Maaş (₺)">
            <View style={styles.salaryRow}>
              <View style={styles.salaryField}>
                <Text style={styles.salaryHint}>Min. (≥)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="örn. 30000"
                  placeholderTextColor={theme.muted}
                  value={draft.salaryMinGte}
                  onChangeText={(t) => setDraft((d) => ({ ...d, salaryMinGte: t }))}
                />
              </View>
              <View style={styles.salaryField}>
                <Text style={styles.salaryHint}>Max. (≤)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="örn. 80000"
                  placeholderTextColor={theme.muted}
                  value={draft.salaryMaxLte}
                  onChangeText={(t) => setDraft((d) => ({ ...d, salaryMaxLte: t }))}
                />
              </View>
            </View>
          </Section>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={reset}>
            <Text style={styles.secondaryBtnText}>Temizle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={apply}>
            <Text style={styles.primaryBtnText}>Filtreleri uygula</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.card,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: theme.slate900 },
  closeLink: { fontSize: 16, color: theme.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    maxWidth: '100%',
  },
  chipSelected: {
    borderColor: theme.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  chipText: { fontSize: 13, color: theme.slate800, fontWeight: '500' },
  chipTextSelected: { color: theme.primary, fontWeight: '600' },
  remoteRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  checkboxOn: {
    borderColor: theme.primary,
    backgroundColor: theme.primary,
  },
  remoteLabel: { fontSize: 15, color: theme.slate900, fontWeight: '500' },
  salaryRow: { flexDirection: 'row', gap: 12 },
  salaryField: { flex: 1 },
  salaryHint: { fontSize: 12, color: theme.muted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.slate900,
    backgroundColor: theme.card,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.card,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: theme.slate800 },
  primaryBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
