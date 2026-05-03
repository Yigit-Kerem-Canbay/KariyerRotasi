import { Stack } from 'expo-router';
import { theme } from '@/lib/theme';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: true,
          title: 'Profili düzenle',
          headerTintColor: theme.primary,
          headerStyle: { backgroundColor: theme.card },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
