import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/store/auth';
import { Bell, Lock, Shield, Globe, Moon, ChevronRight, Trash2, LogOut, Info } from 'lucide-react-native';

type SettingItemProps = {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
};

function SettingItem({ icon, label, description, onPress, rightElement, danger }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, danger && { backgroundColor: '#FEF2F2' }]}>
        {icon}
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, danger && { color: '#EF4444' }]}>{label}</Text>
        {description ? <Text style={styles.settingDesc}>{description}</Text> : null}
      </View>
      {rightElement ?? (onPress ? <ChevronRight size={18} color="#CBD5E1" /> : null)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { clear } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => {
          clear();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => Alert.alert('Bilgi', 'Hesap silme işlemi için destek@kariyerrotasi.com adresine mail atınız.') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'Ayarlar & Gizlilik', headerTintColor: theme.primary }} />

      {/* Bildirimler */}
      <Text style={styles.sectionTitle}>Bildirimler</Text>
      <View style={styles.card}>
        <SettingItem
          icon={<Bell size={18} color="#8B5CF6" />}
          label="Uygulama Bildirimleri"
          description="Yeni ilanlar ve başvuru güncellemeleri"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
              thumbColor={notificationsEnabled ? theme.primary : '#94A3B8'}
            />
          }
        />
      </View>

      {/* Görünüm */}
      <Text style={styles.sectionTitle}>Görünüm</Text>
      <View style={styles.card}>
        <SettingItem
          icon={<Moon size={18} color="#6366F1" />}
          label="Karanlık Mod"
          description="Yakında aktif olacak"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled
              trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
              thumbColor={darkMode ? theme.primary : '#94A3B8'}
            />
          }
        />
        <View style={styles.divider} />
        <SettingItem
          icon={<Globe size={18} color="#0EA5E9" />}
          label="Uygulama Dili"
          description="Türkçe"
          onPress={() => Alert.alert('Bilgi', 'Şu an yalnızca Türkçe desteklenmektedir.')}
        />
      </View>

      {/* Güvenlik & Gizlilik */}
      <Text style={styles.sectionTitle}>Güvenlik & Gizlilik</Text>
      <View style={styles.card}>
        <SettingItem
          icon={<Lock size={18} color="#059669" />}
          label="Şifre Değiştir"
          description="Hesap güvenliğinizi güncelleyin"
          onPress={() => Alert.alert('Bilgi', 'Şifre değiştirmek için web üzerinden giriş yapınız.')}
        />
        <View style={styles.divider} />
        <SettingItem
          icon={<Shield size={18} color="#D97706" />}
          label="Gizlilik Politikası"
          onPress={() => Alert.alert('Bilgi', 'Gizlilik politikamız kariyerrotasi.com/gizlilik adresinde yayınlanmaktadır.')}
        />
        <View style={styles.divider} />
        <SettingItem
          icon={<Info size={18} color="#64748B" />}
          label="Kullanım Koşulları"
          onPress={() => Alert.alert('Bilgi', 'Kullanım koşullarımız kariyerrotasi.com/kosullar adresinde yayınlanmaktadır.')}
        />
      </View>

      {/* Uygulama */}
      <Text style={styles.sectionTitle}>Uygulama</Text>
      <View style={styles.card}>
        <SettingItem
          icon={<Info size={18} color="#64748B" />}
          label="Uygulama Versiyonu"
          description="1.0.0 (Beta)"
        />
      </View>

      {/* Tehlikeli Alanlar */}
      <Text style={styles.sectionTitle}>Hesap</Text>
      <View style={styles.card}>
        <SettingItem
          icon={<LogOut size={18} color="#EF4444" />}
          label="Çıkış Yap"
          onPress={handleLogout}
          danger
        />
        <View style={styles.divider} />
        <SettingItem
          icon={<Trash2 size={18} color="#EF4444" />}
          label="Hesabı Sil"
          description="Tüm verileriniz kalıcı olarak silinir"
          onPress={handleDeleteAccount}
          danger
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: theme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: theme.slate900 },
  settingDesc: { fontSize: 12, color: theme.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.border, marginHorizontal: 16 },
});
