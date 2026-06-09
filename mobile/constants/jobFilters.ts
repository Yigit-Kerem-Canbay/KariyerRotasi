export const SECTOR_OPTIONS = [
  'E-Ticaret',
  'Eğitim',
  'Finans & Bankacılık',
  'Gıda & Restoran',
  'İnşaat & Gayrimenkul',
  'Lojistik & Taşıma',
  'Otomotiv',
  'Perakende',
  'Sağlık',
  'Savunma Sanayi',
  'Teknoloji & Yazılım',
  'Tekstil',
  'Telekomünikasyon',
  'Temizlik & Hizmet',
  'Turizm',
].sort((a, b) => a.localeCompare(b, 'tr'));

export const EDUCATION_OPTIONS = ['Lise', 'Ön Lisans', 'Üniversite', 'Yüksek Lisans', 'Fark Etmez'].sort((a, b) =>
  a.localeCompare(b, 'tr'),
);

export const LANGUAGE_OPTIONS = [
  'Fark Etmez',
  'İngilizce (İyi)',
  'İngilizce (Çok İyi)',
  'İngilizce, Almanca',
  'İngilizce, Fransızca',
  'Almanca (İyi)',
  'İspanyolca',
  'Arapça',
  'Rusça',
  'Çince',
];

export const MILITARY_OPTIONS = ['Yapıldı', 'Tecilli', 'Muaf', 'Fark Etmez'];

export const EXPERIENCE_OPTIONS = ['Yeni Mezun', '1-3 Yıl', '3-5 Yıl', '5+ Yıl', 'Yönetici'];

export const WORK_MODEL_CONFIG = [
  { value: 'onsite', label: 'İş yerinde' },
  { value: 'hybrid', label: 'Hibrit' },
  { value: 'remote', label: 'Uzaktan' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'En yeni' },
  { value: 'oldest', label: 'En eski' },
  { value: 'recommended', label: 'Kişiye Özel (AI)' },
  { value: 'salaryDesc', label: 'Maaş (yüksek)' },
  { value: 'salaryAsc', label: 'Maaş (düşük)' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export type JobFilterState = {
  cities: string[];
  sectors: string[];
  educationLevels: string[];
  languages: string[];
  workModels: string[];
  experiences: string[];
  militaryStatuses: string[];
  remoteOnly: boolean;
  salaryMinGte: string;
};

export function emptyJobFilters(): JobFilterState {
  return {
    cities: [],
    sectors: [],
    educationLevels: [],
    languages: [],
    workModels: [],
    experiences: [],
    militaryStatuses: [],
    remoteOnly: false,
    salaryMinGte: '',
  };
}
