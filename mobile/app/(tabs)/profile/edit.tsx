import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

import api from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { theme } from '@/lib/theme';

export default function ProfileEditScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [cvBusy, setCvBusy] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (!user) {
    return null;
  }

  async function saveName() {
    if (name.trim().length < 2) return;
    setSavingName(true);
    try {
      const res = await api.patch('/users/me', { name: name.trim() });
      setUser(res.data);
      router.back();
    } catch {
      /** */
    } finally {
      setSavingName(false);
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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.lead}>Kişisel bilgilerini ve özgeçmişini buradan güncelleyebilirsin.</Text>

      <View style={styles.block}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Adın ve soyadın"
          placeholderTextColor={theme.muted}
        />
        <TouchableOpacity
          style={[styles.saveBtn, savingName && styles.btnDisabled]}
          disabled={savingName || name.trim().length < 2}
          onPress={() => void saveName()}
        >
          {savingName ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnTxt}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>CV / Özgeçmiş yükle</Text>
        {user.cvUrl ? (
          <Text style={styles.cvOk}>Yüklü bir dosyan var — yenisini seçerek değiştirebilirsin.</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.cvBtn, cvBusy && styles.btnDisabled]}
          disabled={cvBusy}
          onPress={() => void uploadCv()}
        >
          {cvBusy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.cvBtnTxt}>Dosya seç (PDF veya Word)</Text>
          )}
        </TouchableOpacity>

        {cvError ? <Text style={styles.err}>{cvError}</Text> : null}

        <Text style={styles.hint}>Maksimum boyut sunucuda 5 MB. Desteklenen: PDF, DOC, DOCX.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 44, backgroundColor: theme.background },
  lead: {
    fontSize: 14,
    color: theme.muted,
    marginBottom: 24,
    lineHeight: 20,
  },
  block: {
    marginBottom: 28,
    backgroundColor: theme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 18,
  },
  label: { fontSize: 13, fontWeight: '700', color: theme.slate900, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.slate900,
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: theme.slate900,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.55 },

  cvOk: {
    fontSize: 13,
    color: '#047857',
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cvBtn: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cvBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  err: { marginTop: 10, fontSize: 14, fontWeight: '600', color: theme.destructive },
  hint: { marginTop: 12, fontSize: 12, color: theme.muted, lineHeight: 17 },
});
