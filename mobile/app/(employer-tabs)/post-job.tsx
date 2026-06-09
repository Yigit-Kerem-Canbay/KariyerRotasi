import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '@/api/client';
import { useRouter } from 'expo-router';
import { Briefcase, MapPin, DollarSign, PlusCircle } from 'lucide-react-native';

export default function PostJobScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time',
    workModel: 'office',
    salaryMin: '',
    salaryMax: '',
  });

  const [skillsText, setSkillsText] = useState('');

  const submitJob = async () => {
    if (!form.title || !form.description || !form.location) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      // Parse skills from comma separated string
      const skillsArray = skillsText.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(name => ({ name, weight: 50 })); // Default weight for mobile simplicity

      const payload = {
        ...form,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin, 10) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax, 10) : undefined,
        currency: 'TRY',
        experienceLevel: 'mid',
        skills: skillsArray
      };

      await api.post('/jobs/employer/jobs', payload);
      Alert.alert('Başarılı', 'İlanınız başarıyla yayınlandı!', [
        { text: 'Tamam', onPress: () => router.push('/(employer-tabs)' as any) }
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Hata', 'İlan yayınlanırken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const renderChips = (options: {label: string, value: string}[], selectedValue: string, onSelect: (val: string) => void) => (
    <View style={styles.chipsContainer}>
      {options.map(opt => (
        <TouchableOpacity 
          key={opt.value} 
          style={[styles.chip, selectedValue === opt.value && styles.chipActive]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.chipText, selectedValue === opt.value && styles.chipTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yeni İlan Ver</Text>
        <Text style={styles.headerSubtitle}>Açık pozisyonunuz için en iyi adayları bulun.</Text>
      </View>

      <View style={styles.formContainer}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>İlan Başlığı *</Text>
          <View style={styles.inputWrapper}>
            <Briefcase size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Örn: Kıdemli Yazılım Mühendisi"
              value={form.title}
              onChangeText={(txt) => setForm({...form, title: txt})}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Konum (Şehir) *</Text>
          <View style={styles.inputWrapper}>
            <MapPin size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Örn: İstanbul"
              value={form.location}
              onChangeText={(txt) => setForm({...form, location: txt})}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Çalışma Modeli *</Text>
          {renderChips([
            { label: 'Ofis', value: 'office' },
            { label: 'Hibrit', value: 'hybrid' },
            { label: 'Uzaktan', value: 'remote' },
          ], form.workModel, (val) => setForm({...form, workModel: val}))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>İstihdam Türü *</Text>
          {renderChips([
            { label: 'Tam Zamanlı', value: 'full-time' },
            { label: 'Yarı Zamanlı', value: 'part-time' },
            { label: 'Stajyer', value: 'internship' },
          ], form.type, (val) => setForm({...form, type: val}))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Aranan Yetenekler (Virgülle ayırın)</Text>
          <TextInput 
            style={[styles.inputWrapper, { paddingHorizontal: 16 }]} 
            placeholder="React, Node.js, TypeScript"
            value={skillsText}
            onChangeText={setSkillsText}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Min Maaş (₺)</Text>
            <View style={styles.inputWrapper}>
              <DollarSign size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Örn: 30000"
                keyboardType="numeric"
                value={form.salaryMin}
                onChangeText={(txt) => setForm({...form, salaryMin: txt})}
              />
            </View>
          </View>
          <View style={{ width: 16 }} />
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Max Maaş (₺)</Text>
            <View style={styles.inputWrapper}>
              <DollarSign size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Örn: 50000"
                keyboardType="numeric"
                value={form.salaryMax}
                onChangeText={(txt) => setForm({...form, salaryMax: txt})}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>İş Açıklaması *</Text>
          <TextInput 
            style={styles.textArea} 
            placeholder="İş tanımı, sorumluluklar ve beklentilerinizi detaylıca yazın..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={form.description}
            onChangeText={(txt) => setForm({...form, description: txt})}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={submitJob} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <PlusCircle size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>İlanı Yayınla</Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#312E81',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  headerSubtitle: { fontSize: 15, color: '#C7D2FE', fontWeight: '500' },
  
  formContainer: { padding: 20, gap: 16 },
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 16, height: 56, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#0F172A' },
  
  textArea: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 16, minHeight: 120, padding: 16, fontSize: 15, color: '#0F172A',
  },
  
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#EEF2FF', borderColor: '#818CF8' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: '#4F46E5', fontWeight: '800' },

  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4F46E5', height: 56, borderRadius: 16, marginTop: 12,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitButtonText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});
