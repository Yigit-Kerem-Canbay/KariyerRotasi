import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';

import api from '@/api/client';
import { useAuthStore, User } from '@/store/auth';
import { theme } from '@/lib/theme';

export default function ProfileEditScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user) as User | null;
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [militaryStatus, setMilitaryStatus] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [cvBusy, setCvBusy] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login' as any);
    }
  }, [token, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.profile?.phone || user.phone || '');
      setTitle(user.profile?.title || '');
      setAbout(user.profile?.about || '');
      setCity(user.profile?.city || '');
      setDistrict(user.profile?.district || '');
      setBirthDate(user.profile?.birthDate ? user.profile.birthDate.substring(0, 10) : '');
      setGender(user.profile?.gender || '');
      setMilitaryStatus(user.profile?.militaryStatus || '');
      setDriverLicense(user.profile?.driverLicense || '');
      setLinkedinUrl(user.profile?.linkedinUrl || '');
      setGithubUrl(user.profile?.githubUrl || '');
      setPortfolioUrl(user.profile?.portfolioUrl || '');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  async function saveProfile() {
    if (name.trim().length < 2) return;
    setSaving(true);
    try {
      if (name.trim() !== user?.name) {
        await api.patch('/users/me', { name: name.trim() });
      }

      const profilePayload: any = {
        title: title.trim(),
        about: about.trim(),
        city: city.trim(),
        district: district.trim(),
        phone: phone.trim(),
        gender: gender.trim(),
        militaryStatus: militaryStatus.trim(),
        driverLicense: driverLicense.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
      };

      if (birthDate.trim()) {
        try {
          profilePayload.birthDate = new Date(birthDate.trim()).toISOString();
        } catch {
          // invalid date
        }
      }

      const res = await api.patch('/users/me/profile', profilePayload);
      setUser(res.data);
      router.back();
    } catch {
      /** */
    } finally {
      setSaving(false);
    }
  }

  async function uploadCv() {
    setCvError(null);
    setCvBusy(true);
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });
      if (picked.canceled) {
        setCvBusy(false);
        return;
      }
      const asset = picked.assets?.[0];
      if (!asset?.uri) {
        setCvError('Dosya seçilemedi.');
        setCvBusy(false);
        return;
      }

      const form = new FormData();
      // @ts-ignore
      form.append('file', {
        uri: asset.uri,
        name: asset.name || 'cv.pdf',
        type: asset.mimeType || 'application/pdf',
      } as unknown as Blob);

      const uploadRes = await api.post<{ url: string }>('/uploads/cv', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const userRes = await api.patch('/users/me', { cvUrl: uploadRes.data.url });
      setUser(userRes.data);
      router.back();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' &&
        e !== null &&
        'response' in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message ===
          'string'
          ? String((e as { response?: { data?: { message?: string } } }).response?.data?.message)
          : 'Yükleme sırasında bir hata oluştu.';
      setCvError(msg);
    } finally {
      setCvBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>Kişisel bilgilerini, iletişim detaylarını ve özgeçmiş dosyanı güncelleyebilirsin.</Text>

        <View style={styles.block}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Adın ve soyadın"
            placeholderTextColor={theme.muted}
          />

          <Text style={styles.label}>Telefon Numarası</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="555 123 4567"
            keyboardType="phone-pad"
            placeholderTextColor={theme.muted}
          />

          <Text style={styles.label}>Mesleki Unvan</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Örn: Frontend Developer"
            placeholderTextColor={theme.muted}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Şehir</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Örn: İstanbul"
                placeholderTextColor={theme.muted}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>İlçe</Text>
              <TextInput
                style={styles.input}
                value={district}
                onChangeText={setDistrict}
                placeholder="Örn: Kadıköy"
                placeholderTextColor={theme.muted}
              />
            </View>
          </View>

          <Text style={styles.label}>Doğum Tarihi (YYYY-AA-GG)</Text>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="Örn: 1998-05-15"
            placeholderTextColor={theme.muted}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Cinsiyet</Text>
              <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="Erkek / Kadın"
                placeholderTextColor={theme.muted}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Sürücü Belgesi</Text>
              <TextInput
                style={styles.input}
                value={driverLicense}
                onChangeText={setDriverLicense}
                placeholder="Örn: B Sınıfı"
                placeholderTextColor={theme.muted}
              />
            </View>
          </View>

          <Text style={styles.label}>Askerlik Durumu</Text>
          <TextInput
            style={styles.input}
            value={militaryStatus}
            onChangeText={setMilitaryStatus}
            placeholder="Yapıldı / Muaf / Tecilli"
            placeholderTextColor={theme.muted}
          />

          <Text style={styles.label}>LinkedIn URL</Text>
          <TextInput
            style={styles.input}
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
            placeholder="https://linkedin.com/in/..."
            placeholderTextColor={theme.muted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>GitHub URL</Text>
          <TextInput
            style={styles.input}
            value={githubUrl}
            onChangeText={setGithubUrl}
            placeholder="https://github.com/..."
            placeholderTextColor={theme.muted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Portfolyo URL</Text>
          <TextInput
            style={styles.input}
            value={portfolioUrl}
            onChangeText={setPortfolioUrl}
            placeholder="https://..."
            placeholderTextColor={theme.muted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Hakkında</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            value={about}
            onChangeText={setAbout}
            placeholder="Kendinden bahset..."
            multiline
            numberOfLines={4}
            placeholderTextColor={theme.muted}
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.btnDisabled]}
            disabled={saving || name.trim().length < 2}
            onPress={() => void saveProfile()}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnTxt}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>CV / Özgeçmiş Dosyası</Text>
          {user.cvUrl ? (
            <Text style={styles.cvOk}>Yüklü bir dosyan var — yenisini seçerek değiştirebilirsin.</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.cvBtn, cvBusy && styles.btnDisabled]}
            disabled={cvBusy}
            onPress={() => void uploadCv()}
          >
            {cvBusy ? (
              <ActivityIndicator color="#4F46E5" />
            ) : (
              <>
                <Feather name="upload-cloud" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
                <Text style={styles.cvBtnTxt}>Dosya seç (PDF veya Word)</Text>
              </>
            )}
          </TouchableOpacity>

          {cvError ? <Text style={styles.err}>{cvError}</Text> : null}
          <Text style={styles.hint}>Maksimum boyut sunucuda 5 MB. Desteklenen: PDF, DOC, DOCX.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60, backgroundColor: theme.background },
  lead: {
    fontSize: 15,
    color: theme.slate800,
    marginBottom: 16,
    lineHeight: 22,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
    fontWeight: '500',
  },
  block: {
    marginBottom: 24,
    backgroundColor: theme.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.slate900, marginBottom: 16 },
  row: { flexDirection: 'row' },
  label: { fontSize: 13, fontWeight: '700', color: theme.slate800, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.slate900,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  cvOk: {
    fontSize: 13,
    color: '#047857',
    backgroundColor: '#ecfdf5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cvBtn: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
  },
  cvBtnTxt: { color: '#4F46E5', fontSize: 15, fontWeight: '700' },
  err: { marginTop: 12, fontSize: 14, fontWeight: '600', color: theme.destructive },
  hint: { marginTop: 12, fontSize: 12, color: theme.muted, lineHeight: 18 },
});
