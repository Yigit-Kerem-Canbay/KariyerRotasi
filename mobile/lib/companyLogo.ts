import { getWebOrigin, getApiBaseUrl } from './config';

/** public/logos altında gerçekten bulunan dosyalar — web ile aynı liste */
export const LOGO_FILE_KEYS = new Set<string>([
  'tusas.com.tr',
  'migros.com.tr',
  'koc.com.tr',
  'thy.com.tr',
  'flypgs.com.tr',
  'misas.com.tr',
  'aselsan.com.tr',
  'sokmarket.com.tr',
  'getir.com.tr',
  'defacto.com.tr',
  'bim.com.tr',
  'havelsan.com.tr',
  'trendyol.com.tr',
  'garantibbva.com.tr',
  'vodafone.com.tr',
  'arcelik.com.tr',
  'beko.com.tr',
]);

const HOST_TO_LOGO_KEY: Record<string, string> = {
  'turkishairlines.com': 'thy.com.tr',
  'thy.com': 'thy.com.tr',
  'flypgs.com': 'flypgs.com.tr',
  'getir.com': 'getir.com.tr',
  'trendyol.com': 'trendyol.com.tr',
  'bim.com': 'bim.com.tr',
  'vodafone.com': 'vodafone.com.tr',
  'garantibbva.com': 'garantibbva.com.tr',
  'garanti.com.tr': 'garantibbva.com.tr',
  'arcelik.com': 'arcelik.com.tr',
  'beko.com': 'beko.com.tr',
  'havelsan.com': 'havelsan.com.tr',
  'aselsan.com': 'aselsan.com.tr',
  'tusas.com': 'tusas.com.tr',
  'roketsan.com.tr': 'tusas.com.tr',
  'migros.com': 'migros.com.tr',
};

function normHost(website: string | null | undefined): string {
  if (!website) return '';
  try {
    const u = new URL(website.startsWith('http') ? website : `https://${website}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function keyFromHostname(h: string): string | null {
  if (!h) return null;
  if (LOGO_FILE_KEYS.has(h)) return h;
  const mapped = HOST_TO_LOGO_KEY[h];
  if (mapped && LOGO_FILE_KEYS.has(mapped)) return mapped;
  if (h.endsWith('.com') && !h.endsWith('.com.tr')) {
    const guess = `${h}.tr`;
    if (LOGO_FILE_KEYS.has(guess)) return guess;
  }
  return null;
}

function keyFromCompanyName(name: string): string | null {
  const n = name.toLowerCase();
  const tryKey = (k: string) => (LOGO_FILE_KEYS.has(k) ? k : null);

  if (n.includes('misaş') || n.includes('misas')) return tryKey('misas.com.tr');
  if (n.includes('türk hava') || n.includes('thy') || n.includes('turkish airlines'))
    return tryKey('thy.com.tr');
  if (n.includes('pegasus')) return tryKey('flypgs.com.tr');
  if (n.includes('şok') || n.includes('sok market')) return tryKey('sokmarket.com.tr');
  if (n.includes('koç') || n.includes('koc holding')) return tryKey('koc.com.tr');
  if (n.includes('sabancı') || n.includes('sabanci')) return null;

  const hints: { needle: string; key: string }[] = [
    { needle: 'aselsan', key: 'aselsan.com.tr' },
    { needle: 'trendyol', key: 'trendyol.com.tr' },
    { needle: 'getir', key: 'getir.com.tr' },
    { needle: 'bim', key: 'bim.com.tr' },
    { needle: 'migros', key: 'migros.com.tr' },
    { needle: 'vodafone', key: 'vodafone.com.tr' },
    { needle: 'garanti bbva', key: 'garantibbva.com.tr' },
    { needle: 'tusaş', key: 'tusas.com.tr' },
    { needle: 'tusas', key: 'tusas.com.tr' },
    { needle: 'havelsan', key: 'havelsan.com.tr' },
    { needle: 'roketsan', key: 'tusas.com.tr' },
    { needle: 'beko', key: 'beko.com.tr' },
    { needle: 'arçelik', key: 'arcelik.com.tr' },
    { needle: 'arcelik', key: 'arcelik.com.tr' },
    { needle: 'defacto', key: 'defacto.com.tr' },
  ];
  for (const { needle, key } of hints) {
    if (n.includes(needle) && LOGO_FILE_KEYS.has(key)) return key;
  }
  return null;
}

export function resolveLogoFileKey(company: {
  name: string;
  website?: string | null;
}): string | null {
  const fromSite = keyFromHostname(normHost(company.website));
  if (fromSite) return fromSite;
  return keyFromCompanyName(company.name || '');
}

export function companyLogoAbsoluteUrl(key: string): string {
  // Mobile app uses API origin for logos to avoid Android localhost:3000 unreachable issues
  const baseUrl = getApiBaseUrl().replace(/\/api$/, '');
  return `${baseUrl}/uploads/logos/${key}.png`;
}
