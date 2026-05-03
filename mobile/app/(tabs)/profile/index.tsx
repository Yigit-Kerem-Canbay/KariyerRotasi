import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/store/auth';
import { theme } from '@/lib/theme';
import { absolutizeUploadPath } from '@/lib/config';

export default function ProfileIndexScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeGuest} edges={['top']}>
        <ScrollView contentContainerStyle={styles.guestContent}>
          <View style={styles.guestHero}>
            <FontAwesome name="user-circle-o" size={72} color="rgba(255,255,255,0.9)" />
            <Text style={styles.guestTitle}>Profilin</Text>
            <Text style={styles.guestSubtitle}>
              İlanlara başvurmak ve CV yüklemek için giriş yap veya kayıt ol.
            </Text>
          </View>
          <View style={styles.guestCards}>
            <TouchableOpacity style={styles.primaryLarge} activeOpacity={0.9} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.primaryLargeText}>Giriş yap</Text>
              <FontAwesome name="sign-in" size={18} color="#fff" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryLarge} activeOpacity={0.9} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.secondaryLargeText}>Kayıt ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.whiteCard}>
          <View style={styles.row2}>
            <View style={styles.col}>
              <Text style={styles.label}>ROL</Text>
              <Text style={styles.val}>{user.role === 'job_seeker' ? 'İş Arayan' : user.role === 'employer' ? 'İşveren' : 'Yönetici'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>KAYIT TARİHİ</Text>
              <Text style={styles.val}>
                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>

          <Text style={[styles.label, styles.cvLabel]}>CV / ÖZGEÇMIŞ</Text>
          {user.cvUrl ? (
            <TouchableOpacity
              style={styles.cvRow}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(absolutizeUploadPath(user.cvUrl!))}
            >
              <View style={styles.cvIconWrap}>
                <FontAwesome name="file-text-o" size={22} color={theme.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.cvTitle}>Yüklü özgeçmiş</Text>
                <Text style={styles.cvSub}>PDF / Word</Text>
              </View>
              <Text style={styles.cvLink}>Aç</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noCv}>Henüz bir CV yüklenmemiş.</Text>
          )}

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.9}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editBtnText}>Profili düzenle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={() => void clearAuth()}>
            <FontAwesome name="sign-out" size={18} color={theme.destructive} />
            <Text style={styles.logoutText}>Çıkış yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  scroll: { padding: 16, paddingBottom: 40 },
  headerCard: {
    backgroundColor: theme.slate900,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.slate800,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.slate800,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#334155',
  },
  avatarTxt: { fontSize: 34, fontWeight: '700', color: '#fff' },
  name: { marginTop: 14, fontSize: 26, fontWeight: '700', color: '#fff', textAlign: 'center' },
  email: { marginTop: 6, fontSize: 15, color: '#94a3b8', textAlign: 'center' },

  whiteCard: {
    backgroundColor: theme.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  row2: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  col: { flex: 1, minWidth: 0 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.muted,
    letterSpacing: 0.6,
  },
  val: { marginTop: 6, fontSize: 17, fontWeight: '600', color: theme.slate900 },
  cvLabel: { marginTop: 22 },
  cvRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cvIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(37,99,235,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvTitle: { fontSize: 15, fontWeight: '600', color: theme.slate900 },
  cvSub: { fontSize: 12, color: theme.muted, marginTop: 2 },
  cvLink: { fontSize: 15, fontWeight: '700', color: theme.slate900 },
  noCv: { marginTop: 8, fontSize: 15, color: theme.muted, fontStyle: 'italic' },
  editBtn: {
    marginTop: 24,
    backgroundColor: theme.slate900,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: theme.destructive },

  safeGuest: { flex: 1, backgroundColor: theme.background },
  guestContent: { flexGrow: 1 },
  guestHero: {
    backgroundColor: theme.heroIndigo,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 56,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  guestTitle: { marginTop: 16, fontSize: 28, fontWeight: '800', color: '#fff' },
  guestSubtitle: {
    marginTop: 10,
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  guestCards: { padding: 20, marginTop: -28 },
  primaryLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryLargeText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secondaryLarge: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  secondaryLargeText: { fontSize: 17, fontWeight: '700', color: theme.slate900 },
});
