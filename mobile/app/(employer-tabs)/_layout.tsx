import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

import { theme } from '@/lib/theme';

export default function EmployerTabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 20);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 64 + bottomPad : 60 + bottomPad,
          paddingBottom: Platform.OS === 'ios' ? bottomPad : bottomPad,
          paddingTop: 8,
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'İlanlarım',
          tabBarIcon: ({ color }) => <Feather name="briefcase" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post-job"
        options={{
          title: 'Yeni İlan',
          tabBarIcon: ({ color }) => <Feather name="plus-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="employer-profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
