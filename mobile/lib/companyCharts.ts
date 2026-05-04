/** Web `company/[id]/page.tsx` ile aynı model — gösterim amaçlı dağılım verisi */

export function parseEmployeeCount(empStr?: string | null) {
  if (!empStr) return 500;
  const s = String(empStr);
  if (s.includes('+')) return parseInt(s.replace('+', ''), 10) + 1500;
  const parts = s.split('-');
  if (parts.length === 2) {
    return Math.floor((parseInt(parts[0], 10) + parseInt(parts[1], 10)) / 2);
  }
  return parseInt(s, 10) || 500;
}

export type CompanyInsightData = {
  edLevels: { name: string; value: number; color: string }[];
  departments: { name: string; value: number; color: string }[];
  majors: { name: string; value: number; color: string }[];
  yearlyHiring: { year: string; iseAlinan: number }[];
  hash: number;
};

export function generateCompanyInsightData(
  name: string,
  totalEmployees: number,
): CompanyInsightData {
  const hashStr = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hash = Math.abs(hashStr);

  const random = (seed: number) => {
    const x = Math.sin(seed + hash) * 10000;
    return x - Math.floor(x);
  };

  const edLevels = [
    { name: 'Üniversite', value: Math.floor(totalEmployees * (0.3 + random(1) * 0.3)), color: '#4F46E5' },
    { name: 'Lise', value: Math.floor(totalEmployees * (0.1 + random(2) * 0.3)), color: '#06B6D4' },
    {
      name: 'Ön Lisans',
      value: Math.floor(totalEmployees * (0.1 + random(3) * 0.2)),
      color: '#10B981',
    },
    {
      name: 'Yük. Lisans',
      value: Math.floor(totalEmployees * (0.05 + random(4) * 0.1)),
      color: '#F59E0B',
    },
    {
      name: 'İlköğretim',
      value: Math.floor(totalEmployees * (0.01 + random(5) * 0.05)),
      color: '#EF4444',
    },
  ].sort((a, b) => b.value - a.value);

  const departments = [
    {
      name: 'Hizmet',
      value: Math.floor(totalEmployees * (0.2 + random(6) * 0.2)),
      color: '#6366F1',
    },
    {
      name: 'Satış',
      value: Math.floor(totalEmployees * (0.15 + random(7) * 0.2)),
      color: '#8B5CF6',
    },
    {
      name: 'Muhasebe',
      value: Math.floor(totalEmployees * (0.1 + random(8) * 0.1)),
      color: '#EC4899',
    },
    {
      name: 'Personel',
      value: Math.floor(totalEmployees * (0.05 + random(9) * 0.1)),
      color: '#14B8A6',
    },
    {
      name: 'Yönetim',
      value: Math.floor(totalEmployees * (0.02 + random(10) * 0.05)),
      color: '#F59E0B',
    },
  ].sort((a, b) => b.value - a.value);

  const majors = [
    {
      name: 'İşletme',
      value: Math.floor(edLevels[0].value * (0.15 + random(11) * 0.1)),
      color: '#3B82F6',
    },
    {
      name: 'İktisat',
      value: Math.floor(edLevels[0].value * (0.1 + random(12) * 0.1)),
      color: '#10B981',
    },
    {
      name: 'Mühendislik',
      value: Math.floor(edLevels[0].value * (0.1 + random(13) * 0.2)),
      color: '#F59E0B',
    },
    {
      name: 'İletişim',
      value: Math.floor(edLevels[0].value * (0.05 + random(14) * 0.1)),
      color: '#EC4899',
    },
    {
      name: 'Pazarlama',
      value: Math.floor(edLevels[0].value * (0.05 + random(15) * 0.1)),
      color: '#8B5CF6',
    },
  ].sort((a, b) => b.value - a.value);

  const yearlyHiring = [
    { year: '2023', iseAlinan: Math.floor(100 + random(16) * 200) },
    { year: '2024', iseAlinan: Math.floor(150 + random(17) * 250) },
    { year: '2025', iseAlinan: Math.floor(200 + random(18) * 300) },
    { year: '2026', iseAlinan: Math.floor(300 + random(19) * 400) },
  ];

  return { edLevels, departments, majors, yearlyHiring, hash };
}
