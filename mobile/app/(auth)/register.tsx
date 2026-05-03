import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/lib/theme';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/api/client';
import { useAuthStore } from '@/store/auth';

const schema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı."),
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
  role: z.enum(["job_seeker", "employer"], {
    message: "Rol seçmelisin.",
  }),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { control, handleSubmit, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'job_seeker' }
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await api.post("/auth/register", values);
      const { user, accessToken } = res.data;
      await setAuth({ user, token: accessToken });
      router.replace("/(tabs)");
    } catch (error: any) {
      setError("root", {
        message: error.response?.data?.message || "Kayıt yaparken bir hata oluştu.",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Kayıt Ol</Text>
        <Text style={styles.subtitle}>Hesabınızı oluşturup aramaya başlayın.</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                />
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rolünüz</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'job_seeker' && styles.roleButtonActive]}
                onPress={() => setValue('role', 'job_seeker')}
              >
                <Text style={[styles.roleText, selectedRole === 'job_seeker' && styles.roleTextActive]}>İş Arayan</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'employer' && styles.roleButtonActive]}
                onPress={() => setValue('role', 'employer')}
              >
                <Text style={[styles.roleText, selectedRole === 'employer' && styles.roleTextActive]}>İşveren</Text>
              </TouchableOpacity>
            </View>
            {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}
          </View>

          {errors.root && (
            <View style={styles.rootErrorBox}>
              <Text style={styles.rootErrorText}>{errors.root.message}</Text>
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
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Giriş yap</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#475569', marginTop: 4 },
  form: { marginTop: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#0f172a' },
  inputError: { borderColor: '#dc2626' },
  roleContainer: { flexDirection: 'row', gap: 12 },
  roleButton: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center' },
  roleButtonActive: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderColor: theme.primary },
  roleText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  roleTextActive: { color: theme.primary, fontWeight: '600' },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 4 },
  rootErrorBox: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, marginBottom: 16 },
  rootErrorText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },
  button: { backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', marginTop: 24, justifyContent: 'center' },
  footerText: { color: '#475569', fontSize: 14 },
  link: { color: theme.primary, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' }
});
