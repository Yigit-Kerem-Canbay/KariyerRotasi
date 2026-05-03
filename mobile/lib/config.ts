import { Platform } from 'react-native';
import Constants from 'expo-constants';

function stripTrailingSlash(s: string) {
  return s.replace(/\/+$/, '');
}

const AnyConstants = Constants as any;

/**
 * NEXT / web statikleri (logo PNG) için; ilanların şirket logolarını buradan yükle.
 */
export function getWebOrigin(): string {
  const explicit = process.env.EXPO_PUBLIC_WEB_URL;
  if (explicit && explicit.length > 0) {
    return stripTrailingSlash(explicit);
  }
  /**
   * Expo Go gerçek cihazda: Metro host'u (10.x.x.x) üzerinden backend/web'e erişmek gerekir.
   * Android emülatörde: 10.0.2.2 host bilgisayarı gösterir.
   */
  const hostUri =
    Constants.expoConfig?.hostUri ||
    AnyConstants.hostUri ||
    AnyConstants.manifest2?.extra?.expoGo?.developer?.hostUri ||
    AnyConstants.manifest?.hostUri;

  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : null;

  if (host && /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return `http://${host}:3000`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

/** REST kökü, örn. http://10.0.2.2:4000 → baseURL'e /api eklenir */
export function getApiOrigin(): string {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env && env.length > 0) {
    const cleaned = stripTrailingSlash(env.replace(/\/?api\/?$/, ''));
    return cleaned;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    AnyConstants.hostUri ||
    AnyConstants.manifest2?.extra?.expoGo?.developer?.hostUri ||
    AnyConstants.manifest?.hostUri;

  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : null;
  if (host && /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return `http://${host}:4000`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
  return 'http://localhost:4000';
}

export function getApiBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!env) {
    return `${getApiOrigin()}/api`;
  }
  const base = stripTrailingSlash(env.replace(/\/?api\/?$/, ''));
  return `${base}/api`;
}

export function absolutizeUploadPath(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${getApiOrigin()}${path.startsWith('/') ? '' : '/'}${path}`;
}
