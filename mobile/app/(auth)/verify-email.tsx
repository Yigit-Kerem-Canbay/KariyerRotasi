import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import api from '@/api/client';
import { useAuthStore } from '@/store/auth';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendSuccess(false);
    }
  }, [countdown]);

  const onVerify = async () => {
    if (otp.length !== 6) {
      setError("Lütfen 6 haneli kodu girin.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/verify-email", { email, otp });
      const { user, accessToken } = res.data;
      await setAuth({ user, token: accessToken });
      if (user.role === "individual_employer" || user.role === "corporate_employer") {
        router.replace("/(tabs)");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Doğrulama kodu hatalı.");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    setError(null);
    try {
      await api.post("/auth/resend-verification", { email });
      setResendSuccess(true);
      setCountdown(60);
    } catch (err: any) {
      setError("Kod gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#0f172a" />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Feather name="mail" size={48} color="#2563eb" />
          </View>
          
          <Text style={styles.title}>E-posta Doğrulama</Text>
          <Text style={styles.subtitle}>
            <Text style={{ fontWeight: '700', color: '#0f172a' }}>{email}</Text> adresine 6 haneli bir doğrulama kodu gönderdik.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor="#94a3b8"
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Feather name="x-circle" size={18} color="#dc2626" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {resendSuccess && (
              <View style={[styles.errorBox, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                <Feather name="check-circle" size={18} color="#16a34a" style={{ marginRight: 8 }} />
                <Text style={[styles.errorText, { color: '#16a34a' }]}>Yeni kod gönderildi!</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.button, (loading || otp.length !== 6) && styles.buttonDisabled]} 
              onPress={onVerify}
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Doğrula</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Kodu almadınız mı? </Text>
              <TouchableOpacity onPress={onResend} disabled={resending || countdown > 0}>
                <Text style={[styles.resendLink, (resending || countdown > 0) && { color: '#94a3b8' }]}>
                  {countdown > 0 ? `${countdown}s bekle` : resending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 24, left: 24, zIndex: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  iconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
  form: { width: '100%', marginTop: 32 },
  inputContainer: { marginBottom: 24 },
  input: { height: 64, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, fontSize: 32, letterSpacing: 8, textAlign: 'center', color: '#0f172a', fontWeight: '700' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#fee2e2' },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '600', flexShrink: 1 },
  button: { backgroundColor: '#2563eb', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  resendText: { color: '#64748b', fontSize: 15 },
  resendLink: { color: '#2563eb', fontSize: 15, fontWeight: '800' }
});
