import { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { resolveLogoFileKey, companyLogoAbsoluteUrl, LOGO_FILE_KEYS } from '@/lib/companyLogo';
import { getAvatarColor } from '@/lib/avatar';
import { absolutizeUploadPath } from '@/lib/config';

type Company = { name: string; website?: string | null; logoUrl?: string | null };

export function CompanyLogo({
  company,
  size,
  rounded = 12,
}: {
  company: Company;
  size: number;
  rounded?: number;
}) {
  const key = resolveLogoFileKey(company);
  const keyUri = key && LOGO_FILE_KEYS.has(key) ? companyLogoAbsoluteUrl(key) : null;
  const remote = company.logoUrl ? absolutizeUploadPath(company.logoUrl) : null;
  const uri = keyUri || remote;
  const [failed, setFailed] = useState(false);
  const letter = (company.name || '?').trim().charAt(0).toUpperCase();
  const bg = getAvatarColor(company.name || 'x');

  if (!uri || failed) {
    return (
      <View
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius: rounded,
            backgroundColor: bg,
          },
        ]}
      >
        <Text style={[styles.fallbackText, { fontSize: size * 0.38 }]}>{letter}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: rounded }}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '700',
  },
});
