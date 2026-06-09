import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';
import { LogOut, Settings, Building2, ChevronRight, Mail } from 'lucide-react-native';

export default function EmployerProfileScreen() {
  const { user, clear } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => {
        clear();
        router.replace('/(auth)/login');
      }}
    ]);
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Building2 size={40} color="#4F46E5" />
            </View>
          </View>
          
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.title}>İşveren Hesabı</Text>
        </View>
      </View>

      <View style={styles.content}>
        
        {/* Contact Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Firma Bilgileri</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconBg}><Mail size={16} color="#4F46E5" /></View>
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconBg}><Building2 size={16} color="#4F46E5" /></View>
            <Text style={styles.infoText}>Platformda {user.role === 'corporate_employer' ? 'Kurumsal' : 'Bireysel'} İşveren</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Bilgi', 'Web sitesi üzerinden tüm firma profilinizi detaylı düzenleyebilirsiniz.')}>
            <View style={[styles.iconBg, { backgroundColor: '#F8FAFC' }]}><Settings size={20} color="#64748B" /></View>
            <Text style={styles.menuItemText}>Ayarlar & Gizlilik</Text>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 120,
    backgroundColor: '#312E81',
  },
  profileSection: { alignItems: 'center', marginTop: 10 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 4, borderColor: '#fff',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  name: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '600', color: '#64748B', marginBottom: 16 },
  
  content: { padding: 20, gap: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    shadowColor: '#312E81', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  infoText: { fontSize: 15, fontWeight: '500', color: '#475569', flex: 1 },
  
  menuCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 8,
    shadowColor: '#312E81', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  menuItemText: { fontSize: 16, fontWeight: '600', color: '#0F172A', flex: 1 },
  
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
});
