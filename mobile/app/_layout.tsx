import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/store/auth';
import { theme } from '@/lib/theme';

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const restoreToken = useAuthStore((s) => s.restoreToken);
  const isRestored = useAuthStore((s) => s.isRestored);

  useEffect(() => {
    restoreToken();
  }, [restoreToken]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isRestored) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isRestored]);

  if (!loaded || !isRestored) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (user && inAuthGroup) {
      if (user.role === "individual_employer" || user.role === "corporate_employer") {
        router.replace('/(employer-tabs)' as any);
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, router]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(employer-tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="job/[id]"
              options={{
                headerShown: true,
                headerBackTitle: 'Geri',
                headerTintColor: theme.primary,
                headerTitle: '',
                headerStyle: { backgroundColor: '#fff' },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="company/[id]"
              options={{
                headerShown: true,
                headerBackTitle: 'Geri',
                headerTintColor: theme.primary,
                headerTitle: '',
                headerStyle: { backgroundColor: '#fff' },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="company-jobs/[id]"
              options={{
                headerShown: true,
                headerBackTitle: 'Geri',
                headerTintColor: theme.primary,
                headerTitle: 'Şirket ilanları',
                headerStyle: { backgroundColor: '#fff' },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
