import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';

import { theme } from '@/lib/theme';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/api/client';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const PASSWORD_MSG = "En az 8 karakter, 1 büyük harf ve 1 rakam içermelidir.";

const jobSeekerSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı."),
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MSG),
});

const individualEmployerSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı."),
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MSG),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin."),
});

const corporateEmployerSchema = z.object({
  name: z.string().min(2, "Yetkili kişi adı en az 2 karakter olmalı."),
  email: z.string().email("Geçerli bir kurumsal e-posta girin."),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MSG),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin."),
  companyName: z.string().min(2, "Şirket adı en az 2 karakter olmalı."),
  taxNumber: z.string().min(10, "Vergi numarası 10 veya 11 haneli olmalı."),
  companyWebsite: z.string().optional(),
});

type Tab = "job_seeker" | "individual_employer" | "corporate_employer";

const TABS: { id: Tab; label: string; icon: keyof typeof Feather.glyphMap; desc: string }[] = [
  { id: "job_seeker", label: "İş Arayan", icon: "user", desc: "İş arıyorum" },
  { id: "individual_employer", label: "Bireysel İşveren", icon: "briefcase", desc: "Eleman arıyorum" },
  { id: "corporate_employer", label: "Kurumsal Şirket", icon: "home", desc: "Şirketim adına" },
];

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  return score;
}

const STRENGTH_LABELS = ["Çok Zayıf", "Zayıf", "Orta", "Güçlü", "Çok Güçlü", "Mükemmel"];
const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#22c55e", "#10b981"];

export default function RegisterScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("job_seeker");
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const schema = activeTab === "job_seeker" ? jobSeekerSchema : activeTab === "individual_employer" ? individualEmployerSchema : corporateEmployerSchema;

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
  });

  const watchedPassword = watch("password", "");

  useEffect(() => {
    reset();
    setGlobalError(null);
  }, [activeTab, reset]);

  const onSubmit = async (values: any) => {
    setGlobalError(null);
    const endpoints: Record<Tab, string> = {
      job_seeker: "/auth/register/job-seeker",
      individual_employer: "/auth/register/individual-employer",
      corporate_employer: "/auth/register/corporate-employer",
    };

    try {
      await api.post(endpoints[activeTab], values);
      router.push(`/(auth)/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setGlobalError(Array.isArray(msg) ? msg[0] : msg || "Kayıt olurken bir hata oluştu.");
    }
  };

  const pwScore = getPasswordStrength(watchedPassword || "");

  const renderInput = (name: string, label: string, icon: keyof typeof Feather.glyphMap, placeholder: string, keyboardType: any = "default") => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Feather name={icon} size={20} color="#94a3b8" style={styles.inputIcon} />
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors[name] && styles.inputError]}
              placeholder={placeholder}
              placeholderTextColor="#94a3b8"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType={keyboardType}
              autoCapitalize="none"
            />
          )}
        />
      </View>
      {errors[name] && <Text style={styles.errorText}>{(errors[name] as any)?.message}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={styles.title}>Hesap Oluşturun</Text>
            <Text style={styles.subtitle}>Kariyer yolculuğunuza bugün başlayın.</Text>
          </View>

          <View style={styles.tabContainer}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                    <Feather name={tab.icon} size={20} color={isActive ? "#fff" : "#94a3b8"} />
                  </View>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                  <Text style={styles.tabDesc}>{tab.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.form}>
            {activeTab === "corporate_employer" && (
              <>
                {renderInput("companyName", "Şirket Adı", "home", "Trendyol A.Ş.")}
                {renderInput("taxNumber", "Vergi Numarası", "file-text", "1234567890", "numeric")}
                {renderInput("companyWebsite", "Şirket Websitesi (Opsiyonel)", "globe", "https://trendyol.com", "url")}
              </>
            )}

            {renderInput("name", activeTab === "corporate_employer" ? "Yetkili Ad Soyad" : "Ad Soyad", "user", "Ahmet Yılmaz")}
            {renderInput("email", "E-posta Adresi", "mail", "isim@ornek.com", "email-address")}

            {(activeTab === "individual_employer" || activeTab === "corporate_employer") && (
              renderInput("phone", "Telefon Numarası", "phone", "+90 555 555 5555", "phone-pad")
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.password && styles.inputError, { paddingRight: 40 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
                    />
                  )}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              {watchedPassword ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <View key={i} style={[styles.strengthBar, { backgroundColor: i < pwScore ? STRENGTH_COLORS[pwScore] : '#f1f5f9' }]} />
                    ))}
                  </View>
                  <View style={styles.strengthTextRow}>
                    <Feather name={pwScore >= 3 ? "check-circle" : "x-circle"} size={14} color={pwScore >= 3 ? "#22c55e" : "#cbd5e1"} />
                    <Text style={[styles.strengthText, { color: pwScore >= 3 ? "#16a34a" : "#94a3b8" }]}>
                      {STRENGTH_LABELS[pwScore]}
                    </Text>
                  </View>
                </View>
              ) : null}
              {errors.password && <Text style={styles.errorText}>{(errors.password as any)?.message}</Text>}
            </View>

            {globalError && (
              <View style={styles.rootErrorBox}>
                <Feather name="x-circle" size={18} color="#dc2626" style={{ marginRight: 8 }} />
                <Text style={styles.rootErrorText}>{globalError}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.button, isSubmitting && styles.buttonDisabled]} 
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Giriş Yapın</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748b', textAlign: 'center' },
  tabContainer: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  tabBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#f1f5f9', borderRadius: 16, padding: 12, alignItems: 'center' },
  tabBtnActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  tabIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tabIconWrapActive: { backgroundColor: '#2563eb' },
  tabLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', textAlign: 'center' },
  tabLabelActive: { color: '#1e3a8a' },
  tabDesc: { fontSize: 10, color: '#94a3b8', marginTop: 2, textAlign: 'center' },
  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  eyeIcon: { position: 'absolute', right: 16, zIndex: 1 },
  input: { flex: 1, height: 56, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingLeft: 48, fontSize: 15, color: '#0f172a' },
  inputError: { borderColor: '#dc2626' },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 6, fontWeight: '500' },
  strengthContainer: { marginTop: 8 },
  strengthBars: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  strengthBar: { flex: 1, height: 6, borderRadius: 3 },
  strengthTextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  strengthText: { fontSize: 12, fontWeight: '600' },
  rootErrorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#fee2e2' },
  rootErrorText: { color: '#dc2626', fontSize: 14, fontWeight: '600', flexShrink: 1 },
  button: { backgroundColor: '#2563eb', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  footerText: { color: '#64748b', fontSize: 15 },
  link: { color: '#2563eb', fontSize: 15, fontWeight: '800', textDecorationLine: 'underline' }
});
